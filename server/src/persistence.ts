// ============================================
// GAME STATE PERSISTENCE
// ============================================
// Simple file-based persistence for game state backup
// Can be upgraded to Redis for production

import { writeFile, readFile, mkdir, unlink, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import type { Room } from './room.js';
import type { GameState } from './types.js';

// Directory for game state backups
const BACKUP_DIR = process.env.BACKUP_DIR || './game-backups';

// How often to save game state (in ms)
const SAVE_INTERVAL_MS = 30000; // 30 seconds

// Room data to persist (excluding WebSocket connections)
interface PersistedRoom {
  code: string;
  hostPosition: number;
  gameStarted: boolean;
  isPublic: boolean;
  settings: {
    partnerVariant: string;
    noPickRule: string;
  };
  createdAt: number;
  playerScores: number[];
  handsPlayed: number;
  // Player info (without WebSocket)
  players: Array<{
    position: number;
    name: string;
  }>;
  aiPositions: number[];
  inactivePlayers: number[];
  kickedPlayers: number[];
  // Game state
  gameState: GameState | null;
}

// Ensure backup directory exists
async function ensureBackupDir(): Promise<void> {
  if (!existsSync(BACKUP_DIR)) {
    await mkdir(BACKUP_DIR, { recursive: true });
  }
}

// Get backup file path for a room
function getBackupPath(roomCode: string): string {
  return join(BACKUP_DIR, `room-${roomCode}.json`);
}

// Convert Room to persistable format
function roomToPersistedRoom(room: Room): PersistedRoom {
  const players: Array<{ position: number; name: string }> = [];
  for (const [position, player] of room.players) {
    players.push({
      position,
      name: player.name,
    });
  }

  return {
    code: room.code,
    hostPosition: room.hostPosition,
    gameStarted: room.gameStarted,
    isPublic: room.isPublic,
    settings: room.settings,
    createdAt: room.createdAt,
    playerScores: room.playerScores,
    handsPlayed: room.handsPlayed,
    players,
    aiPositions: Array.from(room.aiPositions),
    inactivePlayers: Array.from(room.inactivePlayers),
    kickedPlayers: Array.from(room.kickedPlayers),
    gameState: room.gameState,
  };
}

// Save room state to disk
export async function saveRoomState(room: Room): Promise<void> {
  try {
    await ensureBackupDir();
    const data = roomToPersistedRoom(room);
    const path = getBackupPath(room.code);
    await writeFile(path, JSON.stringify(data, null, 2));
    console.log(`Saved game state for room ${room.code}`);
  } catch (err) {
    console.error(`Failed to save room ${room.code}:`, err);
  }
}

// Load room state from disk
export async function loadRoomState(roomCode: string): Promise<PersistedRoom | null> {
  try {
    const path = getBackupPath(roomCode);
    if (!existsSync(path)) {
      return null;
    }
    const data = await readFile(path, 'utf-8');
    return JSON.parse(data) as PersistedRoom;
  } catch (err) {
    console.error(`Failed to load room ${roomCode}:`, err);
    return null;
  }
}

// Delete room backup
export async function deleteRoomBackup(roomCode: string): Promise<void> {
  try {
    const path = getBackupPath(roomCode);
    if (existsSync(path)) {
      await unlink(path);
      console.log(`Deleted backup for room ${roomCode}`);
    }
  } catch (err) {
    console.error(`Failed to delete backup for room ${roomCode}:`, err);
  }
}

// List all backed up rooms
export async function listBackedUpRooms(): Promise<string[]> {
  try {
    await ensureBackupDir();
    const files = await readdir(BACKUP_DIR);
    return files
      .filter(f => f.startsWith('room-') && f.endsWith('.json'))
      .map(f => f.replace('room-', '').replace('.json', ''));
  } catch (err) {
    console.error('Failed to list backed up rooms:', err);
    return [];
  }
}

// Auto-save interval tracking
const autoSaveIntervals = new Map<string, NodeJS.Timeout>();

// Start auto-saving for a room
export function startAutoSave(room: Room): void {
  // Clear any existing interval
  stopAutoSave(room.code);

  // Only auto-save if game is in progress
  if (!room.gameStarted || !room.gameState) {
    return;
  }

  const interval = setInterval(() => {
    if (room.gameStarted && room.gameState) {
      saveRoomState(room);
    } else {
      stopAutoSave(room.code);
    }
  }, SAVE_INTERVAL_MS);

  autoSaveIntervals.set(room.code, interval);
}

// Stop auto-saving for a room
export function stopAutoSave(roomCode: string): void {
  const interval = autoSaveIntervals.get(roomCode);
  if (interval) {
    clearInterval(interval);
    autoSaveIntervals.delete(roomCode);
  }
}

// Clean up old backups (older than 24 hours)
export async function cleanupOldBackups(): Promise<void> {
  try {
    await ensureBackupDir();
    const files = await readdir(BACKUP_DIR);
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const file of files) {
      if (!file.startsWith('room-') || !file.endsWith('.json')) continue;

      const path = join(BACKUP_DIR, file);
      try {
        const data = await readFile(path, 'utf-8');
        const room = JSON.parse(data) as PersistedRoom;

        // Delete if older than 24 hours
        if (now - room.createdAt > maxAge) {
          await unlink(path);
          console.log(`Cleaned up old backup: ${file}`);
        }
      } catch {
        // Delete corrupted files
        await unlink(path);
        console.log(`Cleaned up corrupted backup: ${file}`);
      }
    }
  } catch (err) {
    console.error('Failed to cleanup old backups:', err);
  }
}
