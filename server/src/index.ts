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
  convertToAI,
  isPositionAI,
  clearTurnTimer,
  getRoomCount,
  cleanupConnection,
  getStats,
} from './room.js';
import {
  createGameState,
  applyAction,
  calculateScores,
  getClientGameState,
  getAIAction,
} from './game.js';
import type { ClientMessage, ServerMessage, PlayerPosition } from './types.js';

// ============================================
// CONFIGURATION
// ============================================

const PORT = parseInt(process.env.PORT || '3001');
const TURN_TIMEOUT_MS = 60000; // 60 seconds to make a move

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

server.listen(PORT, () => {
  console.log(`Sheepshead server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Stats: http://localhost:${PORT}/stats`);
  console.log(`WebSocket: ws://localhost:${PORT}`);
  console.log(`Limits: ${MAX_CONNECTIONS} connections, ${MAX_ROOMS} rooms`);
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
    const room = leaveRoom(ws);
    if (room) {
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

        room.gameStarted = true;
        room.gameState = createGameState(room);

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

        const success = applyAction(room.gameState, info.position, message.action);
        if (!success) {
          sendTo(ws, { type: 'error', message: 'Invalid action' });
          return;
        }

        if (room.gameState.phase === 'scoring') {
          calculateScores(room.gameState, room);
          scheduleNewHand(room);
        }

        broadcastGameState(room);
        runAILoop(room);
        break;
      }

      case 'leave_room': {
        const room = leaveRoom(ws);
        if (room) {
          broadcast(room, {
            type: 'room_update',
            players: getPlayerInfoList(room),
          });
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

function scheduleNewHand(room: import('./room.js').Room): void {
  const timer = setTimeout(() => {
    if (room.gameState) {
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

function runAILoop(room: import('./room.js').Room): void {
  if (!room.gameState) return;
  if (room.gameState.phase === 'scoring' || room.gameState.phase === 'gameOver') return;

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
    }, 1000);

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

  clearTurnTimer(room);

  const currentPlayer = room.gameState.currentPlayer;
  room.turnStartTime = Date.now();

  room.turnTimer = setTimeout(() => {
    if (!room.gameState) return;
    if (room.gameState.currentPlayer !== currentPlayer) return;

    const player = room.players.get(currentPlayer);
    const playerName = player?.name || `Player ${currentPlayer + 1}`;

    convertToAI(room, currentPlayer);

    broadcast(room, {
      type: 'player_timeout',
      position: currentPlayer,
      playerName,
    });

    console.log(`Player ${playerName} at position ${currentPlayer} timed out`);
    runAILoop(room);
  }, TURN_TIMEOUT_MS);
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
