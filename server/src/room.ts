// ============================================
// ROOM MANAGEMENT
// ============================================

import type { WebSocket } from 'ws';
import type { PlayerPosition, PlayerInfo, GameState } from './types.js';

export interface RoomPlayer {
  ws: WebSocket;
  name: string;
  position: PlayerPosition;
  connected: boolean;
}

export interface Room {
  code: string;
  players: Map<PlayerPosition, RoomPlayer>;
  aiPositions: Set<PlayerPosition>; // Positions filled by AI
  hostPosition: PlayerPosition;
  gameState: GameState | null;
  gameStarted: boolean;
  // Score tracking
  playerScores: number[];
  handsPlayed: number;
}

// Active rooms
const rooms = new Map<string, Room>();

// WebSocket to room mapping (for disconnect handling)
const wsToRoom = new Map<WebSocket, { roomCode: string; position: PlayerPosition }>();

// Generate a random 4-letter room code
function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // No I, O to avoid confusion
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  // Ensure uniqueness
  if (rooms.has(code)) {
    return generateRoomCode();
  }
  return code;
}

// Create a new room
export function createRoom(ws: WebSocket, playerName: string): Room {
  const code = generateRoomCode();
  const position: PlayerPosition = 0;

  const room: Room = {
    code,
    players: new Map(),
    aiPositions: new Set([1, 2, 3, 4] as PlayerPosition[]), // Start with AI in other seats
    hostPosition: position,
    gameState: null,
    gameStarted: false,
    playerScores: [0, 0, 0, 0, 0],
    handsPlayed: 0,
  };

  room.players.set(position, {
    ws,
    name: playerName,
    position,
    connected: true,
  });

  rooms.set(code, room);
  wsToRoom.set(ws, { roomCode: code, position });

  return room;
}

// Join an existing room
export function joinRoom(
  roomCode: string,
  ws: WebSocket,
  playerName: string
): { room: Room; position: PlayerPosition } | { error: string } {
  const code = roomCode.toUpperCase();
  const room = rooms.get(code);

  if (!room) {
    return { error: 'Room not found' };
  }

  if (room.gameStarted) {
    return { error: 'Game already started' };
  }

  // Find first available position (prefer AI positions)
  let position: PlayerPosition | null = null;
  for (let i = 0; i < 5; i++) {
    const pos = i as PlayerPosition;
    if (room.aiPositions.has(pos)) {
      position = pos;
      break;
    }
  }

  if (position === null) {
    return { error: 'Room is full' };
  }

  // Remove from AI and add as human
  room.aiPositions.delete(position);
  room.players.set(position, {
    ws,
    name: playerName,
    position,
    connected: true,
  });

  wsToRoom.set(ws, { roomCode: code, position });

  return { room, position };
}

// Room cleanup timers
const roomCleanupTimers = new Map<string, NodeJS.Timeout>();

// Leave a room (mark as disconnected, don't fully remove for reconnection)
export function leaveRoom(ws: WebSocket): Room | null {
  const info = wsToRoom.get(ws);
  if (!info) return null;

  const room = rooms.get(info.roomCode);
  if (!room) return null;

  const player = room.players.get(info.position);
  if (!player) return null;

  // Mark as disconnected (keep player info for reconnection)
  player.connected = false;

  wsToRoom.delete(ws);

  // Check if all players are disconnected
  const allDisconnected = Array.from(room.players.values()).every(p => !p.connected);

  if (allDisconnected) {
    // Start cleanup timer - delete room after 5 minutes if no one reconnects
    const existingTimer = roomCleanupTimers.get(info.roomCode);
    if (existingTimer) clearTimeout(existingTimer);

    const timer = setTimeout(() => {
      rooms.delete(info.roomCode);
      roomCleanupTimers.delete(info.roomCode);
      console.log(`Room ${info.roomCode} deleted due to inactivity`);
    }, 5 * 60 * 1000); // 5 minutes

    roomCleanupTimers.set(info.roomCode, timer);
  }

  return room;
}

// Rejoin an existing room
export function rejoinRoom(
  roomCode: string,
  ws: WebSocket,
  playerName: string,
  position: PlayerPosition
): { room: Room; position: PlayerPosition } | { error: string } {
  const code = roomCode.toUpperCase();
  const room = rooms.get(code);

  if (!room) {
    return { error: 'Room no longer exists' };
  }

  const existingPlayer = room.players.get(position);

  // Check if position exists and name matches (allow reconnection)
  if (existingPlayer && existingPlayer.name === playerName) {
    // Reconnecting to same position
    existingPlayer.ws = ws;
    existingPlayer.connected = true;
    wsToRoom.set(ws, { roomCode: code, position });

    // Cancel any cleanup timer
    const timer = roomCleanupTimers.get(code);
    if (timer) {
      clearTimeout(timer);
      roomCleanupTimers.delete(code);
    }

    return { room, position };
  }

  // Position doesn't exist or name doesn't match
  return { error: 'Cannot rejoin - position taken or name mismatch' };
}

// Toggle AI for a position
export function setAI(roomCode: string, position: PlayerPosition, enabled: boolean): Room | null {
  const room = rooms.get(roomCode);
  if (!room || room.gameStarted) return null;

  if (enabled) {
    // Can't make a human player into AI
    if (room.players.has(position)) return null;
    room.aiPositions.add(position);
  } else {
    room.aiPositions.delete(position);
  }

  return room;
}

// Get room by code
export function getRoom(code: string): Room | undefined {
  return rooms.get(code.toUpperCase());
}

// Get room info for a WebSocket
export function getRoomInfo(ws: WebSocket): { roomCode: string; position: PlayerPosition } | undefined {
  return wsToRoom.get(ws);
}

// Get player info list for a room
export function getPlayerInfoList(room: Room): PlayerInfo[] {
  const players: PlayerInfo[] = [];

  for (let i = 0; i < 5; i++) {
    const pos = i as PlayerPosition;
    const player = room.players.get(pos);

    if (player) {
      players.push({
        position: pos,
        name: player.name,
        connected: player.connected,
      });
    } else if (room.aiPositions.has(pos)) {
      players.push({
        position: pos,
        name: `AI ${pos + 1}`,
        connected: true,
      });
    }
  }

  return players;
}

// Broadcast message to all players in a room
export function broadcast(room: Room, message: object, exclude?: WebSocket): void {
  const msg = JSON.stringify(message);
  for (const player of room.players.values()) {
    if (player.ws !== exclude && player.connected && player.ws.readyState === 1) {
      player.ws.send(msg);
    }
  }
}

// Send message to a specific player
export function sendTo(ws: WebSocket, message: object): void {
  if (ws.readyState === 1) {
    ws.send(JSON.stringify(message));
  }
}
