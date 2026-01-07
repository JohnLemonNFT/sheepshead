// ============================================
// SHEEPSHEAD WEBSOCKET SERVER
// ============================================

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
} from './room.js';
import {
  createGameState,
  applyAction,
  calculateScores,
  getClientGameState,
  getAIAction,
} from './game.js';
import type { ClientMessage, ServerMessage, PlayerPosition } from './types.js';

const PORT = parseInt(process.env.PORT || '3001');
const TURN_TIMEOUT_MS = 60000; // 60 seconds to make a move

// Create HTTP server for health checks
const server = createServer((req, res) => {
  // CORS headers
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
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

// Attach WebSocket server to HTTP server
const wss = new WebSocketServer({ server });

server.listen(PORT, () => {
  console.log(`Sheepshead server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`WebSocket: ws://localhost:${PORT}`);
});

// Handle connections
wss.on('connection', (ws: WebSocket) => {
  console.log('Client connected');

  ws.on('message', (data: Buffer) => {
    try {
      const message = JSON.parse(data.toString()) as ClientMessage;
      handleMessage(ws, message);
    } catch (err) {
      console.error('Invalid message:', err);
      sendTo(ws, { type: 'error', message: 'Invalid message format' });
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    const room = leaveRoom(ws);
    if (room) {
      broadcast(room, {
        type: 'room_update',
        players: getPlayerInfoList(room),
      });
    }
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
  });
});

function handleMessage(ws: WebSocket, message: ClientMessage): void {
  switch (message.type) {
    case 'create_room': {
      const room = createRoom(
        ws,
        message.playerName,
        message.isPublic ?? false,
        message.settings
      );
      const response: ServerMessage = {
        type: 'room_created',
        roomCode: room.code,
        position: 0,
      };
      sendTo(ws, response);
      console.log(`Room ${room.code} created by ${message.playerName} (${room.isPublic ? 'public' : 'private'})`);
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
      const result = joinRoom(message.roomCode, ws, message.playerName);
      if ('error' in result) {
        sendTo(ws, { type: 'error', message: result.error });
        return;
      }

      const { room, position } = result;

      // Send join confirmation
      const joinResponse: ServerMessage = {
        type: 'room_joined',
        roomCode: room.code,
        position,
        players: getPlayerInfoList(room),
        settings: room.settings,
      };
      sendTo(ws, joinResponse);

      // Notify others
      broadcast(room, {
        type: 'player_joined',
        player: {
          position,
          name: message.playerName,
          connected: true,
        },
      }, ws);

      console.log(`${message.playerName} joined room ${room.code} at position ${position}`);
      break;
    }

    case 'rejoin_room': {
      const result = rejoinRoom(message.roomCode, ws, message.playerName, message.position);
      if ('error' in result) {
        sendTo(ws, { type: 'error', message: result.error });
        return;
      }

      const { room, position } = result;

      // Send rejoin confirmation
      const rejoinResponse: ServerMessage = {
        type: 'room_rejoined',
        roomCode: room.code,
        position,
        players: getPlayerInfoList(room),
        gameStarted: room.gameStarted,
        settings: room.settings,
      };
      sendTo(ws, rejoinResponse);

      // Notify others that player reconnected
      broadcast(room, {
        type: 'player_reconnected',
        position,
        name: message.playerName,
      }, ws);

      // If game is in progress, send current game state
      if (room.gameStarted && room.gameState) {
        broadcastGameState(room);
      }

      console.log(`${message.playerName} rejoined room ${room.code} at position ${position}`);
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

      // Start the game
      room.gameStarted = true;
      room.gameState = createGameState(room);

      // Notify all players
      broadcast(room, { type: 'game_started' });

      // Send initial game state to each player
      broadcastGameState(room);

      // Start AI loop if needed
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

      // Clear turn timer since player made a move
      clearTurnTimer(room);

      const success = applyAction(room.gameState, info.position, message.action);
      if (!success) {
        sendTo(ws, { type: 'error', message: 'Invalid action' });
        return;
      }

      // Check if hand is over
      if (room.gameState.phase === 'scoring') {
        calculateScores(room.gameState, room);
        // Start new hand after a delay
        setTimeout(() => {
          if (room.gameState) {
            room.gameState = createGameState(room);
            broadcastGameState(room);
            runAILoop(room);
          }
        }, 3000);
      }

      // Broadcast updated state
      broadcastGameState(room);

      // Run AI if needed (this also starts turn timer for humans)
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
}

function broadcastGameState(room: import('./room.js').Room): void {
  if (!room.gameState) return;

  for (const [position, player] of room.players) {
    if (player.connected && player.ws.readyState === 1) {
      try {
        const clientState = getClientGameState(room.gameState, position, room);
        const message: ServerMessage = {
          type: 'game_state',
          state: clientState,
          yourPosition: position,
        };
        sendTo(player.ws, message);
        console.log(`Sent game state to player ${position}`);
      } catch (err) {
        console.error(`Error sending game state to player ${position}:`, err);
      }
    }
  }
}

function runAILoop(room: import('./room.js').Room): void {
  if (!room.gameState) return;
  if (room.gameState.phase === 'scoring' || room.gameState.phase === 'gameOver') return;

  const currentPlayer = room.gameState.currentPlayer;
  const isAI = isPositionAI(room, currentPlayer);

  if (isAI) {
    // AI's turn - make a move after a short delay
    clearTurnTimer(room);
    setTimeout(() => {
      if (!room.gameState) return;
      if (room.gameState.currentPlayer !== currentPlayer) return; // Turn changed

      const position = room.gameState.currentPlayer;
      const action = getAIAction(room.gameState, position);
      const success = applyAction(room.gameState, position, action);

      if (success) {
        // Check if hand is over
        if (room.gameState.phase === 'scoring') {
          calculateScores(room.gameState, room);
          broadcastGameState(room);
          // Start new hand after a delay
          setTimeout(() => {
            if (room.gameState) {
              room.gameState = createGameState(room);
              broadcastGameState(room);
              runAILoop(room);
            }
          }, 3000);
        } else {
          broadcastGameState(room);
          // Continue AI loop
          runAILoop(room);
        }
      }
    }, 1000); // 1 second delay for AI actions
  } else {
    // Human's turn - start timeout timer
    startTurnTimer(room);
  }
}

function startTurnTimer(room: import('./room.js').Room): void {
  if (!room.gameState) return;

  // Clear any existing timer
  clearTurnTimer(room);

  const currentPlayer = room.gameState.currentPlayer;
  room.turnStartTime = Date.now();

  room.turnTimer = setTimeout(() => {
    if (!room.gameState) return;
    if (room.gameState.currentPlayer !== currentPlayer) return; // Turn already changed

    // Player timed out - convert to AI
    const player = room.players.get(currentPlayer);
    const playerName = player?.name || `Player ${currentPlayer + 1}`;

    convertToAI(room, currentPlayer);

    // Notify all players about the timeout
    broadcast(room, {
      type: 'player_timeout',
      position: currentPlayer,
      playerName,
    });

    console.log(`Player ${playerName} at position ${currentPlayer} timed out after ${TURN_TIMEOUT_MS / 1000} seconds`);

    // Now have AI take over
    runAILoop(room);
  }, TURN_TIMEOUT_MS);
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  wss.close();
  process.exit(0);
});
