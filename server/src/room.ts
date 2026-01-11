// ============================================
// ROOM MANAGEMENT
// ============================================

import type { WebSocket } from 'ws';
import type { PlayerPosition, PlayerInfo, GameState, RoomSettings, PublicRoomInfo } from './types.js';

// AI personality names by position (matches client-side personalities)
const AI_NAMES: Record<PlayerPosition, string> = {
  0: 'You', // Not used for AI
  1: 'Greta',
  2: 'Wild Bill',
  3: 'Eddie',
  4: 'Marie',
};

function getAIName(position: PlayerPosition): string {
  return AI_NAMES[position] || `AI ${position + 1}`;
}

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
  gameEnded: boolean; // True when maxHands reached
  // Room visibility and settings
  isPublic: boolean;
  settings: RoomSettings;
  createdAt: number;
  // Score tracking
  playerScores: number[];
  handsPlayed: number;
  // Turn timeout tracking
  turnStartTime: number | null;
  turnTimer: NodeJS.Timeout | null;
  turnWarningTimer: NodeJS.Timeout | null; // Warning before timeout
  inactivePlayers: Set<PlayerPosition>; // Players currently inactive (AI playing, can be kicked)
  kickedPlayers: Set<PlayerPosition>; // Players who were kicked (cannot rejoin)
  // Play again voting
  playAgainVotes: Set<PlayerPosition>;
  gameEndTimer: NodeJS.Timeout | null; // 2 min timer to close room after game ends
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

// Default room settings
const DEFAULT_ROOM_SETTINGS: RoomSettings = {
  partnerVariant: 'calledAce',
  noPickRule: 'leaster',
  maxHands: 15, // Standard game
  callTen: true, // Allow calling a 10 when picker has all 3 aces
};

// Create a new room
export function createRoom(
  ws: WebSocket,
  playerName: string,
  isPublic: boolean = false,
  settings: RoomSettings = DEFAULT_ROOM_SETTINGS
): Room {
  const code = generateRoomCode();
  const position: PlayerPosition = 0;

  const room: Room = {
    code,
    players: new Map(),
    aiPositions: new Set([1, 2, 3, 4] as PlayerPosition[]), // Start with AI in other seats
    hostPosition: position,
    gameState: null,
    gameStarted: false,
    gameEnded: false,
    isPublic,
    settings,
    createdAt: Date.now(),
    playerScores: [0, 0, 0, 0, 0],
    handsPlayed: 0,
    turnStartTime: null,
    turnTimer: null,
    turnWarningTimer: null,
    inactivePlayers: new Set(),
    kickedPlayers: new Set(),
    playAgainVotes: new Set(),
    gameEndTimer: null,
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

// Lobby expiration timers (unfilled rooms auto-delete after 30 minutes)
const lobbyExpirationTimers = new Map<string, NodeJS.Timeout>();
const lobbyWarningTimers = new Map<string, NodeJS.Timeout>();
const LOBBY_EXPIRATION_MS = 30 * 60 * 1000; // 30 minutes
const LOBBY_WARNING_MS = 25 * 60 * 1000; // Warning at 25 minutes (5 min before expiry)

// Start lobby expiration timer for a room
export function startLobbyExpiration(room: Room, onWarning: (room: Room, minutesRemaining: number) => void): void {
  const code = room.code;

  // Clear any existing timers
  clearLobbyExpiration(code);

  // Set warning timer (5 minutes before expiry)
  const warningTimer = setTimeout(() => {
    const r = rooms.get(code);
    if (r && !r.gameStarted) {
      onWarning(r, 5);
    }
  }, LOBBY_WARNING_MS);
  lobbyWarningTimers.set(code, warningTimer);

  // Set expiration timer
  const expirationTimer = setTimeout(() => {
    const r = rooms.get(code);
    if (r && !r.gameStarted) {
      console.log(`Room ${code} expired - lobby timeout (30 minutes)`);
      deleteRoom(code);
    }
  }, LOBBY_EXPIRATION_MS);
  lobbyExpirationTimers.set(code, expirationTimer);
}

// Clear lobby expiration timers
export function clearLobbyExpiration(code: string): void {
  const warningTimer = lobbyWarningTimers.get(code);
  if (warningTimer) {
    clearTimeout(warningTimer);
    lobbyWarningTimers.delete(code);
  }

  const expirationTimer = lobbyExpirationTimers.get(code);
  if (expirationTimer) {
    clearTimeout(expirationTimer);
    lobbyExpirationTimers.delete(code);
  }
}

// Transfer host to another connected player
export function transferHost(room: Room): { newHost: RoomPlayer; position: PlayerPosition } | null {
  // Find first connected player that isn't the current host
  for (const [position, player] of room.players) {
    if (position !== room.hostPosition && player.connected) {
      room.hostPosition = position;
      console.log(`Host transferred to ${player.name} at position ${position} in room ${room.code}`);
      return { newHost: player, position };
    }
  }
  return null;
}

// Leave a room (mark as disconnected, don't fully remove for reconnection)
export function leaveRoom(ws: WebSocket): { room: Room; hostTransferred: { newHost: RoomPlayer; position: PlayerPosition } | null; allHumansLeft: boolean } | null {
  const info = wsToRoom.get(ws);
  if (!info) return null;

  const room = rooms.get(info.roomCode);
  if (!room) return null;

  const player = room.players.get(info.position);
  if (!player) return null;

  // Mark as disconnected (keep player info for reconnection)
  player.connected = false;

  wsToRoom.delete(ws);

  // Check if host left before game started - need to transfer host
  let hostTransferred: { newHost: RoomPlayer; position: PlayerPosition } | null = null;
  if (!room.gameStarted && info.position === room.hostPosition) {
    hostTransferred = transferHost(room);
  }

  // Check if all players are disconnected
  const allDisconnected = Array.from(room.players.values()).every(p => !p.connected);

  if (allDisconnected) {
    // Clear turn timer - game is paused until someone reconnects
    clearTurnTimer(room);

    // Start cleanup timer - delete room after 5 minutes if no one reconnects
    const existingTimer = roomCleanupTimers.get(info.roomCode);
    if (existingTimer) clearTimeout(existingTimer);

    const timer = setTimeout(() => {
      rooms.delete(info.roomCode);
      roomCleanupTimers.delete(info.roomCode);
      clearLobbyExpiration(info.roomCode);
      console.log(`Room ${info.roomCode} deleted due to inactivity`);
    }, 5 * 60 * 1000); // 5 minutes

    roomCleanupTimers.set(info.roomCode, timer);
  }

  return { room, hostTransferred, allHumansLeft: allDisconnected };
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

  // Check if player was kicked - they can't rejoin
  if (room.kickedPlayers.has(position)) {
    return { error: 'You were removed from this game' };
  }

  const existingPlayer = room.players.get(position);

  // Check if position exists and name matches (allow reconnection)
  if (existingPlayer && existingPlayer.name === playerName) {
    // Reconnecting to same position
    existingPlayer.ws = ws;
    existingPlayer.connected = true;
    wsToRoom.set(ws, { roomCode: code, position });

    // Clear inactive status if they were inactive
    room.inactivePlayers.delete(position);
    // Also remove from AI positions if they were put there due to inactivity
    // (but only if they weren't originally AI - check if they're in players map)
    if (room.players.has(position)) {
      room.aiPositions.delete(position);
    }

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
        name: getAIName(pos),
        connected: true,
      });
    }
  }

  return players;
}

// Get list of public rooms that are waiting for players
export function getPublicRooms(): PublicRoomInfo[] {
  const publicRooms: PublicRoomInfo[] = [];

  for (const room of rooms.values()) {
    // Only show public rooms that haven't started and have space
    if (room.isPublic && !room.gameStarted) {
      const humanCount = room.players.size;
      const hostPlayer = room.players.get(room.hostPosition);

      publicRooms.push({
        code: room.code,
        hostName: hostPlayer?.name || 'Unknown',
        playerCount: humanCount,
        maxPlayers: 5,
        settings: room.settings,
        createdAt: room.createdAt,
      });
    }
  }

  // Sort by creation time (newest first)
  return publicRooms.sort((a, b) => b.createdAt - a.createdAt);
}

// Mark a player as inactive (AI takes over temporarily, can be kicked by others)
export function markInactive(room: Room, position: PlayerPosition): void {
  room.inactivePlayers.add(position);
  console.log(`Player at position ${position} marked inactive - AI taking over`);
}

// Mark a player as active again (they made a move)
export function markActive(room: Room, position: PlayerPosition): void {
  room.inactivePlayers.delete(position);
}

// Check if a player is inactive (can be kicked)
export function isInactive(room: Room, position: PlayerPosition): boolean {
  return room.inactivePlayers.has(position);
}

// Check if any human players are connected to the room
export function hasConnectedHumans(room: Room): boolean {
  for (const [position, player] of room.players) {
    if (!room.aiPositions.has(position) && player.connected) {
      return true;
    }
  }
  return false;
}

// Kick a player completely (removed from game, cannot rejoin)
export function kickPlayer(room: Room, position: PlayerPosition): WebSocket | null {
  const player = room.players.get(position);
  if (!player) return null;

  const ws = player.ws;

  // Mark as kicked (cannot rejoin) and remove from inactive
  room.kickedPlayers.add(position);
  room.inactivePlayers.delete(position);
  room.aiPositions.add(position);

  // Remove from players map
  room.players.delete(position);

  // Remove ws-to-room mapping
  wsToRoom.delete(ws);

  console.log(`Player ${player.name} at position ${position} kicked from room ${room.code}`);

  return ws; // Return so caller can send message and close
}

// Check if a position is controlled by AI (started as AI, inactive, or kicked)
export function isPositionAI(room: Room, position: PlayerPosition): boolean {
  return room.aiPositions.has(position) || room.inactivePlayers.has(position) || room.kickedPlayers.has(position);
}

// Clear turn timer and warning timer
export function clearTurnTimer(room: Room): void {
  if (room.turnTimer) {
    clearTimeout(room.turnTimer);
    room.turnTimer = null;
  }
  if (room.turnWarningTimer) {
    clearTimeout(room.turnWarningTimer);
    room.turnWarningTimer = null;
  }
  room.turnStartTime = null;
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

// Get total room count
export function getRoomCount(): number {
  return rooms.size;
}

// Clean up all room data for a connection
export function cleanupConnection(ws: WebSocket): void {
  const info = wsToRoom.get(ws);
  if (info) {
    leaveRoom(ws);
  }
}

// Get room statistics for monitoring
export function getStats(): {
  totalRooms: number;
  activeGames: number;
  waitingRooms: number;
  totalPlayers: number;
  publicRooms: number;
} {
  let activeGames = 0;
  let waitingRooms = 0;
  let totalPlayers = 0;
  let publicRooms = 0;

  for (const room of rooms.values()) {
    if (room.gameStarted) {
      activeGames++;
    } else {
      waitingRooms++;
    }
    if (room.isPublic) {
      publicRooms++;
    }
    // Count connected human players
    for (const player of room.players.values()) {
      if (player.connected) {
        totalPlayers++;
      }
    }
  }

  return {
    totalRooms: rooms.size,
    activeGames,
    waitingRooms,
    totalPlayers,
    publicRooms,
  };
}

// Get final standings for game over
export function getFinalStandings(room: Room): Array<{ position: PlayerPosition; name: string; score: number; rank: number }> {
  const standings: Array<{ position: PlayerPosition; name: string; score: number; rank: number }> = [];

  for (let i = 0; i < 5; i++) {
    const pos = i as PlayerPosition;
    const player = room.players.get(pos);
    const name = player?.name || getAIName(pos);
    standings.push({
      position: pos,
      name,
      score: room.playerScores[pos],
      rank: 0, // Will be set below
    });
  }

  // Sort by score descending
  standings.sort((a, b) => b.score - a.score);

  // Assign ranks (handle ties)
  let currentRank = 1;
  for (let i = 0; i < standings.length; i++) {
    if (i > 0 && standings[i].score < standings[i - 1].score) {
      currentRank = i + 1;
    }
    standings[i].rank = currentRank;
  }

  return standings;
}

// Reset room for a new game (play again)
export function resetRoomForNewGame(room: Room): void {
  room.playerScores = [0, 0, 0, 0, 0];
  room.handsPlayed = 0;
  room.gameState = null;
  room.gameStarted = false;
  room.gameEnded = false;
  room.inactivePlayers.clear();
  room.kickedPlayers.clear();
  room.playAgainVotes.clear();
  clearTurnTimer(room);
  clearGameEndTimer(room);
}

// Clear game end timer
export function clearGameEndTimer(room: Room): void {
  if (room.gameEndTimer) {
    clearTimeout(room.gameEndTimer);
    room.gameEndTimer = null;
  }
}

// Get count of connected human players
export function getConnectedHumanCount(room: Room): number {
  let count = 0;
  for (const player of room.players.values()) {
    if (player.connected) count++;
  }
  return count;
}

// Callback for room deletion (set by index.ts for persistence cleanup)
let onRoomDeleteCallback: ((code: string) => void) | null = null;

export function setOnRoomDeleteCallback(callback: (code: string) => void): void {
  onRoomDeleteCallback = callback;
}

// Delete a room and clean up its timer
export function deleteRoom(code: string): boolean {
  const room = rooms.get(code);
  if (!room) return false;

  // Clear turn timer if exists
  clearTurnTimer(room);

  // Clear game end timer if exists
  clearGameEndTimer(room);

  // Clear lobby expiration timers
  clearLobbyExpiration(code);

  // Clear cleanup timer if exists
  const cleanupTimer = roomCleanupTimers.get(code);
  if (cleanupTimer) {
    clearTimeout(cleanupTimer);
    roomCleanupTimers.delete(code);
  }

  // Remove all websocket mappings for this room
  for (const player of room.players.values()) {
    wsToRoom.delete(player.ws);
  }

  rooms.delete(code);

  // Call cleanup callback (for persistence)
  if (onRoomDeleteCallback) {
    onRoomDeleteCallback(code);
  }

  console.log(`Room ${code} deleted`);
  return true;
}
