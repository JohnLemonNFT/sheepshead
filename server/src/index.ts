// ============================================
// SHEEPSHEAD WEBSOCKET SERVER
// ============================================
// Production-ready with rate limiting, connection limits,
// heartbeat, and error handling

import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import {
  createRoom,
  joinRoom,
  rejoinRoom,
  leaveRoom,
  getRoom,
  getRoomInfo,
  getPlayerInfoList,
  getPublicRooms,
  broadcast,
  sendTo,
  markInactive,
  markActive,
  isInactive,
  kickPlayer,
  isPositionAI,
  clearTurnTimer,
  getRoomCount,
  cleanupConnection,
  getStats,
  startLobbyExpiration,
  clearLobbyExpiration,
  setOnRoomDeleteCallback,
  getFinalStandings,
  resetRoomForNewGame,
  clearGameEndTimer,
  getConnectedHumanCount,
  deleteRoom,
  hasConnectedHumans,
} from './room.js';
import {
  createGameState,
  applyAction,
  calculateScores,
  getClientGameState,
  getAIAction,
} from './game.js';
import {
  saveRoomState,
  deleteRoomBackup,
  startAutoSave,
  stopAutoSave,
  cleanupOldBackups,
} from './persistence.js';
import type { ClientMessage, ServerMessage, PlayerPosition } from './types.js';

// ============================================
// CONFIGURATION
// ============================================

const PORT = parseInt(process.env.PORT || '3001');
const INACTIVITY_THRESHOLD_MS = 45000; // 45 seconds before marked inactive
const INACTIVITY_WARNING_MS = 30000; // Warning at 30 seconds (15 seconds before inactive)

// Server limits - adjust based on your Render plan
const MAX_CONNECTIONS = parseInt(process.env.MAX_CONNECTIONS || '500');
const MAX_ROOMS = parseInt(process.env.MAX_ROOMS || '100');
const MAX_MESSAGE_SIZE = 16 * 1024; // 16KB max message
const RATE_LIMIT_MESSAGES = 20; // Max messages per window
const RATE_LIMIT_WINDOW_MS = 1000; // 1 second window
const HEARTBEAT_INTERVAL_MS = 30000; // 30 second ping interval
const CONNECTION_TIMEOUT_MS = 60000; // 60 seconds without pong = dead

// ============================================
// CONNECTION TRACKING
// ============================================

interface ConnectionInfo {
  ws: WebSocket;
  ip: string;
  connectedAt: number;
  lastPong: number;
  messageCount: number;
  messageWindowStart: number;
  isAlive: boolean;
}

const connections = new Map<WebSocket, ConnectionInfo>();

// ============================================
// RATE LIMITING
// ============================================

function checkRateLimit(connInfo: ConnectionInfo): boolean {
  const now = Date.now();

  // Reset window if expired
  if (now - connInfo.messageWindowStart > RATE_LIMIT_WINDOW_MS) {
    connInfo.messageCount = 0;
    connInfo.messageWindowStart = now;
  }

  connInfo.messageCount++;

  if (connInfo.messageCount > RATE_LIMIT_MESSAGES) {
    console.warn(`Rate limit exceeded for ${connInfo.ip}`);
    return false;
  }

  return true;
}

// ============================================
// HTTP SERVER
// ============================================

const server = createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', server: 'sheepshead' }));
  } else if (req.url === '/stats') {
    // Metrics endpoint for monitoring
    const stats = getStats();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      connections: connections.size,
      maxConnections: MAX_CONNECTIONS,
      rooms: stats.totalRooms,
      maxRooms: MAX_ROOMS,
      activeGames: stats.activeGames,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    }));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

// ============================================
// WEBSOCKET SERVER
// ============================================

const wss = new WebSocketServer({
  server,
  maxPayload: MAX_MESSAGE_SIZE,
});

server.listen(PORT, async () => {
  console.log(`Sheepshead server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Stats: http://localhost:${PORT}/stats`);
  console.log(`WebSocket: ws://localhost:${PORT}`);
  console.log(`Limits: ${MAX_CONNECTIONS} connections, ${MAX_ROOMS} rooms`);

  // Set up room deletion callback for persistence cleanup
  setOnRoomDeleteCallback((code) => {
    stopAutoSave(code);
    deleteRoomBackup(code);
  });

  // Clean up old game backups on startup
  await cleanupOldBackups();
});

// ============================================
// HEARTBEAT (Ping/Pong)
// ============================================

const heartbeatInterval = setInterval(() => {
  const now = Date.now();

  for (const [ws, connInfo] of connections) {
    // Check if connection is dead (no pong received)
    if (!connInfo.isAlive || now - connInfo.lastPong > CONNECTION_TIMEOUT_MS) {
      console.log(`Terminating dead connection from ${connInfo.ip}`);
      cleanupConnection(ws);
      connections.delete(ws);
      ws.terminate();
      continue;
    }

    // Mark as not alive until we get pong
    connInfo.isAlive = false;

    // Send ping
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    }
  }
}, HEARTBEAT_INTERVAL_MS);

// ============================================
// CONNECTION HANDLING
// ============================================

wss.on('connection', (ws: WebSocket, req) => {
  // Check connection limit
  if (connections.size >= MAX_CONNECTIONS) {
    console.warn(`Connection rejected: limit reached (${MAX_CONNECTIONS})`);
    ws.close(1013, 'Server at capacity');
    return;
  }

  // Get client IP
  const ip = req.headers['x-forwarded-for']?.toString().split(',')[0].trim()
           || req.socket.remoteAddress
           || 'unknown';

  // Track connection
  const connInfo: ConnectionInfo = {
    ws,
    ip,
    connectedAt: Date.now(),
    lastPong: Date.now(),
    messageCount: 0,
    messageWindowStart: Date.now(),
    isAlive: true,
  };
  connections.set(ws, connInfo);

  console.log(`Client connected from ${ip} (${connections.size}/${MAX_CONNECTIONS})`);

  // Handle pong responses
  ws.on('pong', () => {
    const conn = connections.get(ws);
    if (conn) {
      conn.isAlive = true;
      conn.lastPong = Date.now();
    }
  });

  ws.on('message', (data: Buffer) => {
    const connInfo = connections.get(ws);
    if (!connInfo) return;

    // Rate limiting
    if (!checkRateLimit(connInfo)) {
      sendTo(ws, { type: 'error', message: 'Rate limit exceeded. Slow down.' });
      return;
    }

    // Message size check (backup, WebSocket server also enforces)
    if (data.length > MAX_MESSAGE_SIZE) {
      sendTo(ws, { type: 'error', message: 'Message too large' });
      return;
    }

    try {
      const message = JSON.parse(data.toString()) as ClientMessage;
      handleMessage(ws, message);
    } catch (err) {
      console.error('Invalid message:', err);
      sendTo(ws, { type: 'error', message: 'Invalid message format' });
    }
  });

  ws.on('close', () => {
    const connInfo = connections.get(ws);
    console.log(`Client disconnected from ${connInfo?.ip || 'unknown'}`);

    // Clean up room association
    const result = leaveRoom(ws);
    if (result) {
      const { room, hostTransferred, allHumansLeft } = result;

      // If all humans left during a game, pause AI and log
      if (allHumansLeft && room.gameState) {
        console.log(`Room ${room.code}: All humans disconnected, game paused (AI waiting)`);
        // Game state is preserved - if anyone rejoins, game can continue
      }

      // Notify about host transfer if it happened
      if (hostTransferred) {
        broadcast(room, {
          type: 'host_transferred',
          newHostPosition: hostTransferred.position,
          newHostName: hostTransferred.newHost.name,
        });
      }

      broadcast(room, {
        type: 'room_update',
        players: getPlayerInfoList(room),
      });
    }

    connections.delete(ws);
  });

  ws.on('error', (err) => {
    const connInfo = connections.get(ws);
    console.error(`WebSocket error from ${connInfo?.ip || 'unknown'}:`, err.message);
  });
});

// ============================================
// MESSAGE HANDLING
// ============================================

function handleMessage(ws: WebSocket, message: ClientMessage): void {
  try {
    switch (message.type) {
      case 'create_room': {
        // Check room limit
        if (getRoomCount() >= MAX_ROOMS) {
          sendTo(ws, { type: 'error', message: 'Server at capacity. Try again later.' });
          return;
        }

        // Validate player name
        const playerName = sanitizeName(message.playerName);
        if (!playerName) {
          sendTo(ws, { type: 'error', message: 'Invalid player name' });
          return;
        }

        const room = createRoom(
          ws,
          playerName,
          message.isPublic ?? false,
          message.settings
        );

        if (!room) {
          sendTo(ws, { type: 'error', message: 'Failed to create room' });
          return;
        }

        // Start lobby expiration timer (30 minutes)
        startLobbyExpiration(room, (r, minutesRemaining) => {
          broadcast(r, {
            type: 'room_expiring',
            minutesRemaining,
          });
        });

        const response: ServerMessage = {
          type: 'room_created',
          roomCode: room.code,
          position: 0,
        };
        sendTo(ws, response);
        console.log(`Room ${room.code} created by ${playerName} (${room.isPublic ? 'public' : 'private'})`);
        break;
      }

      case 'list_public_rooms': {
        const publicRooms = getPublicRooms();
        sendTo(ws, {
          type: 'public_rooms_list',
          rooms: publicRooms,
        });
        break;
      }

      case 'join_room': {
        const playerName = sanitizeName(message.playerName);
        if (!playerName) {
          sendTo(ws, { type: 'error', message: 'Invalid player name' });
          return;
        }

        const result = joinRoom(message.roomCode, ws, playerName);
        if ('error' in result) {
          sendTo(ws, { type: 'error', message: result.error });
          return;
        }

        const { room, position } = result;

        const joinResponse: ServerMessage = {
          type: 'room_joined',
          roomCode: room.code,
          position,
          players: getPlayerInfoList(room),
          settings: room.settings,
        };
        sendTo(ws, joinResponse);

        broadcast(room, {
          type: 'player_joined',
          player: {
            position,
            name: playerName,
            connected: true,
          },
        }, ws);

        console.log(`${playerName} joined room ${room.code} at position ${position}`);
        break;
      }

      case 'rejoin_room': {
        const playerName = sanitizeName(message.playerName);
        if (!playerName) {
          sendTo(ws, { type: 'error', message: 'Invalid player name' });
          return;
        }

        const result = rejoinRoom(message.roomCode, ws, playerName, message.position);
        if ('error' in result) {
          sendTo(ws, { type: 'error', message: result.error });
          return;
        }

        const { room, position } = result;

        const rejoinResponse: ServerMessage = {
          type: 'room_rejoined',
          roomCode: room.code,
          position,
          players: getPlayerInfoList(room),
          gameStarted: room.gameStarted,
          settings: room.settings,
        };
        sendTo(ws, rejoinResponse);

        broadcast(room, {
          type: 'player_reconnected',
          position,
          name: playerName,
        }, ws);

        if (room.gameStarted && room.gameState) {
          broadcastGameState(room);
          // If it's this player's turn, restart their turn timer (clears old one)
          if (room.gameState.currentPlayer === position) {
            clearTurnTimer(room);
            startTurnTimer(room);
          }
          // Resume AI loop if game was paused (no humans were connected)
          runAILoop(room);
        }

        console.log(`${playerName} rejoined room ${room.code} at position ${position}`);
        break;
      }

      case 'start_game': {
        const info = getRoomInfo(ws);
        if (!info) {
          sendTo(ws, { type: 'error', message: 'Not in a room' });
          return;
        }

        const room = getRoom(info.roomCode);
        if (!room) {
          sendTo(ws, { type: 'error', message: 'Room not found' });
          return;
        }

        if (info.position !== room.hostPosition) {
          sendTo(ws, { type: 'error', message: 'Only host can start the game' });
          return;
        }

        if (room.players.size < 1) {
          sendTo(ws, { type: 'error', message: 'Need at least 1 player' });
          return;
        }

        // Clear lobby expiration timer - game is starting
        clearLobbyExpiration(room.code);

        room.gameStarted = true;
        room.gameState = createGameState(room);

        // Save initial game state and start auto-save
        saveRoomState(room);
        startAutoSave(room);

        broadcast(room, { type: 'game_started' });
        broadcastGameState(room);
        runAILoop(room);

        console.log(`Game started in room ${room.code}`);
        break;
      }

      case 'action': {
        const info = getRoomInfo(ws);
        if (!info) {
          sendTo(ws, { type: 'error', message: 'Not in a room' });
          return;
        }

        const room = getRoom(info.roomCode);
        if (!room || !room.gameState) {
          sendTo(ws, { type: 'error', message: 'Game not started' });
          return;
        }

        clearTurnTimer(room);

        // Player made a move - mark them as active (no longer inactive)
        const wasInactive = isInactive(room, info.position);
        markActive(room, info.position);

        // Notify others if player was inactive and is now back
        if (wasInactive) {
          broadcast(room, {
            type: 'player_active',
            position: info.position,
          });
        }

        const success = applyAction(room.gameState, info.position, message.action);
        if (!success) {
          sendTo(ws, { type: 'error', message: 'Invalid action' });
          return;
        }

        if (room.gameState.phase === 'scoring') {
          calculateScores(room.gameState, room);
          // Save game state after scoring
          saveRoomState(room);
          scheduleNewHand(room);
        }

        broadcastGameState(room);
        runAILoop(room);
        break;
      }

      case 'leave_room': {
        const result = leaveRoom(ws);
        if (result) {
          const { room, hostTransferred } = result;

          // Notify about host transfer if it happened
          if (hostTransferred) {
            broadcast(room, {
              type: 'host_transferred',
              newHostPosition: hostTransferred.position,
              newHostName: hostTransferred.newHost.name,
            });
          }

          broadcast(room, {
            type: 'room_update',
            players: getPlayerInfoList(room),
          });
        }
        break;
      }

      case 'play_again': {
        const info = getRoomInfo(ws);
        if (!info) {
          sendTo(ws, { type: 'error', message: 'Not in a room' });
          return;
        }

        const room = getRoom(info.roomCode);
        if (!room) {
          sendTo(ws, { type: 'error', message: 'Room not found' });
          return;
        }

        if (!room.gameEnded) {
          sendTo(ws, { type: 'error', message: 'Game is not over' });
          return;
        }

        // Clear the game end timer
        clearGameEndTimer(room);

        // Reset room to lobby state
        resetRoomForNewGame(room);

        // Notify all players - back to lobby
        broadcast(room, { type: 'game_restarting' });
        broadcast(room, {
          type: 'room_update',
          players: getPlayerInfoList(room),
        });

        console.log(`Room ${room.code} returned to lobby`);
        break;
      }

      case 'kick_inactive': {
        const info = getRoomInfo(ws);
        if (!info) {
          sendTo(ws, { type: 'error', message: 'Not in a room' });
          return;
        }

        const room = getRoom(info.roomCode);
        if (!room || !room.gameStarted) {
          sendTo(ws, { type: 'error', message: 'Game not in progress' });
          return;
        }

        const targetPosition = message.position;

        // Can't kick yourself
        if (targetPosition === info.position) {
          sendTo(ws, { type: 'error', message: 'Cannot kick yourself' });
          return;
        }

        // Can only kick inactive players
        if (!isInactive(room, targetPosition)) {
          sendTo(ws, { type: 'error', message: 'Player is not inactive' });
          return;
        }

        const targetPlayer = room.players.get(targetPosition);
        const targetName = targetPlayer?.name || `Player ${targetPosition + 1}`;

        // Kick the player (returns null if already kicked - handles race condition)
        const kickedWs = kickPlayer(room, targetPosition);
        if (kickedWs === null) {
          // Player was already kicked by another request
          return;
        }

        // Notify everyone
        broadcast(room, {
          type: 'player_kicked',
          position: targetPosition,
          playerName: targetName,
        });

        // Send message to kicked player and close connection
        if (kickedWs && kickedWs.readyState === WebSocket.OPEN) {
          sendTo(kickedWs, {
            type: 'error',
            message: 'You were kicked for inactivity',
          });
          kickedWs.close(1000, 'Kicked for inactivity');
        }

        console.log(`${targetName} was kicked by ${room.players.get(info.position)?.name}`);

        // If kicked player was current player, AI needs to play for them immediately
        if (room.gameState && room.gameState.currentPlayer === targetPosition) {
          runAILoop(room);
        }
        break;
      }

      default:
        sendTo(ws, { type: 'error', message: 'Unknown message type' });
    }
  } catch (err) {
    console.error('Error handling message:', err);
    sendTo(ws, { type: 'error', message: 'Server error' });
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function sanitizeName(name: unknown): string | null {
  if (typeof name !== 'string') return null;
  const cleaned = name.trim().slice(0, 20).replace(/[<>]/g, '');
  return cleaned.length >= 1 ? cleaned : null;
}

function broadcastGameState(room: import('./room.js').Room): void {
  if (!room.gameState) return;

  for (const [position, player] of room.players) {
    if (player.connected && player.ws.readyState === WebSocket.OPEN) {
      try {
        const clientState = getClientGameState(room.gameState, position, room);
        const message: ServerMessage = {
          type: 'game_state',
          state: clientState,
          yourPosition: position,
        };
        sendTo(player.ws, message);
      } catch (err) {
        console.error(`Error sending game state to player ${position}:`, err);
      }
    }
  }
}

// Track scheduled timers per room for cleanup
const roomTimers = new Map<string, Set<NodeJS.Timeout>>();

// Game end room closure timeout (2 minutes)
const GAME_END_TIMEOUT_MS = 2 * 60 * 1000;

function scheduleNewHand(room: import('./room.js').Room): void {
  // Check if game is over (maxHands reached, 0 = unlimited)
  if (room.settings.maxHands > 0 && room.handsPlayed >= room.settings.maxHands) {
    endGame(room);
    return;
  }

  const timer = setTimeout(() => {
    // Don't start new hand if game has ended (handles race condition)
    if (room.gameState && !room.gameEnded) {
      room.gameState = createGameState(room);
      broadcastGameState(room);
      runAILoop(room);
    }
    // Remove timer from tracking
    roomTimers.get(room.code)?.delete(timer);
  }, 3000);

  // Track timer for cleanup
  if (!roomTimers.has(room.code)) {
    roomTimers.set(room.code, new Set());
  }
  roomTimers.get(room.code)!.add(timer);
}

function endGame(room: import('./room.js').Room): void {
  room.gameEnded = true;
  room.playAgainVotes.clear();
  clearTurnTimer(room);
  stopAutoSave(room.code);

  // Get final standings
  const standings = getFinalStandings(room);

  // Broadcast game over
  broadcast(room, {
    type: 'game_over',
    standings,
    handsPlayed: room.handsPlayed,
  });

  console.log(`Game over in room ${room.code} after ${room.handsPlayed} hands`);

  // Start 2-minute timer to close room if no play again
  room.gameEndTimer = setTimeout(() => {
    console.log(`Room ${room.code} closing - no play again votes after game end`);
    deleteRoom(room.code);
  }, GAME_END_TIMEOUT_MS);
}

function runAILoop(room: import('./room.js').Room): void {
  if (!room.gameState) return;
  if (room.gameState.phase === 'scoring' || room.gameState.phase === 'gameOver') return;

  // Don't run AI if no humans are connected - game is paused
  if (!hasConnectedHumans(room)) {
    console.log(`Room ${room.code}: AI loop paused - no humans connected`);
    return;
  }

  const currentPlayer = room.gameState.currentPlayer;
  const isAI = isPositionAI(room, currentPlayer);

  if (isAI) {
    clearTurnTimer(room);

    const timer = setTimeout(() => {
      if (!room.gameState) return;
      if (room.gameState.currentPlayer !== currentPlayer) return;

      const position = room.gameState.currentPlayer;
      const action = getAIAction(room.gameState, position);
      const success = applyAction(room.gameState, position, action);

      if (success) {
        if (room.gameState.phase === 'scoring') {
          calculateScores(room.gameState, room);
          broadcastGameState(room);
          scheduleNewHand(room);
        } else {
          broadcastGameState(room);
          runAILoop(room);
        }
      }

      roomTimers.get(room.code)?.delete(timer);
    }, 1500); // 1.5 second delay for readable pace

    if (!roomTimers.has(room.code)) {
      roomTimers.set(room.code, new Set());
    }
    roomTimers.get(room.code)!.add(timer);
  } else {
    startTurnTimer(room);
  }
}

function startTurnTimer(room: import('./room.js').Room): void {
  if (!room.gameState) return;

  // Don't timeout during burying/calling - picker needs time for these decisions
  // They can still be kicked if they were previously marked inactive
  if (room.gameState.phase === 'burying' || room.gameState.phase === 'calling') {
    return;
  }

  clearTurnTimer(room);

  const currentPlayer = room.gameState.currentPlayer;
  room.turnStartTime = Date.now();

  // Set warning timer (15 seconds before inactive)
  room.turnWarningTimer = setTimeout(() => {
    if (!room.gameState) return;
    if (room.gameState.currentPlayer !== currentPlayer) return;

    broadcast(room, {
      type: 'turn_warning',
      position: currentPlayer,
      secondsRemaining: 15,
    });
  }, INACTIVITY_WARNING_MS);

  // Set inactivity timer - AI takes over, others can kick
  room.turnTimer = setTimeout(() => {
    if (!room.gameState) return;
    if (room.gameState.currentPlayer !== currentPlayer) return;

    const player = room.players.get(currentPlayer);
    const playerName = player?.name || `Player ${currentPlayer + 1}`;

    // Mark player as inactive (AI takes over, can be kicked by others)
    markInactive(room, currentPlayer);

    // Notify all players - they can now kick this player
    broadcast(room, {
      type: 'player_inactive',
      position: currentPlayer,
      playerName,
    });

    console.log(`Player ${playerName} at position ${currentPlayer} is now inactive`);

    // AI takes over for this turn
    runAILoop(room);
  }, INACTIVITY_THRESHOLD_MS);
}

// Export for room.ts to clean up timers
export function clearRoomTimers(roomCode: string): void {
  const timers = roomTimers.get(roomCode);
  if (timers) {
    for (const timer of timers) {
      clearTimeout(timer);
    }
    roomTimers.delete(roomCode);
  }
}

// ============================================
// ERROR HANDLING & GRACEFUL SHUTDOWN
// ============================================

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  // Don't exit - try to keep running
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  // Don't exit - try to keep running
});

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

function gracefulShutdown(): void {
  console.log('\nShutting down server...');

  // Stop accepting new connections
  clearInterval(heartbeatInterval);

  // Close all connections gracefully
  for (const [ws] of connections) {
    ws.close(1001, 'Server shutting down');
  }

  wss.close(() => {
    console.log('WebSocket server closed');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });

  // Force exit after 5 seconds
  setTimeout(() => {
    console.log('Forcing exit...');
    process.exit(1);
  }, 5000);
}
