// ============================================
// SERVER TYPES FOR ONLINE MULTIPLAYER
// ============================================

// Core types (shared with client)
export type Suit = 'clubs' | 'spades' | 'hearts' | 'diamonds';
export type Rank = '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
  id: string;
}

export type PlayerPosition = 0 | 1 | 2 | 3 | 4;
export type PlayerType = 'human' | 'ai';

export interface Player {
  position: PlayerPosition;
  type: PlayerType;
  hand: Card[];
  tricksWon: Card[][];
  isDealer: boolean;
  isPicker: boolean;
  isPartner: boolean;
}

export type GamePhase =
  | 'dealing'
  | 'picking'
  | 'burying'
  | 'calling'
  | 'playing'
  | 'scoring'
  | 'gameOver';

export interface Trick {
  cards: { card: Card; playedBy: PlayerPosition }[];
  leadPlayer: PlayerPosition;
  winningPlayer?: PlayerPosition;
  leadSuit?: Suit | 'trump';
}

export interface CalledAce {
  suit: Suit;
  revealed: boolean;
}

export interface GameConfig {
  playerCount: number;
  partnerVariant: 'calledAce' | 'jackOfDiamonds' | 'none';
  noPickVariant: 'leaster' | 'doubler' | 'forcedPick';
  doubleOnBump: boolean;
  cracking: boolean;
  blitzes: boolean;
}

export interface GameState {
  config: GameConfig;
  phase: GamePhase;
  players: Player[];
  deck: Card[];
  blind: Card[];
  buried: Card[];
  currentTrick: Trick;
  completedTricks: Trick[];
  currentPlayer: PlayerPosition;
  dealerPosition: PlayerPosition;
  pickerPosition: PlayerPosition | null;
  calledAce: CalledAce | null;
  passCount: number;
  trickNumber: number;
  seed?: string;
}

export type GameAction =
  | { type: 'pick' }
  | { type: 'pass' }
  | { type: 'bury'; cards: [Card, Card] }
  | { type: 'callAce'; suit: Suit }
  | { type: 'goAlone' }
  | { type: 'playCard'; card: Card };

// ============================================
// MULTIPLAYER TYPES
// ============================================

export interface PlayerInfo {
  position: PlayerPosition;
  name: string;
  connected: boolean;
}

// Room settings for display
export interface RoomSettings {
  partnerVariant: 'calledAce' | 'jackOfDiamonds' | 'none';
  noPickRule: 'leaster' | 'forcedPick';
  maxHands: 10 | 15 | 25; // Quick (10), Standard (15), Full (25)
}

// Public room info for lobby browser
export interface PublicRoomInfo {
  code: string;
  hostName: string;
  playerCount: number;
  maxPlayers: number;
  settings: RoomSettings;
  createdAt: number;
}

// Client → Server messages
export type ClientMessage =
  | { type: 'create_room'; playerName: string; isPublic: boolean; settings: RoomSettings }
  | { type: 'join_room'; roomCode: string; playerName: string }
  | { type: 'rejoin_room'; roomCode: string; playerName: string; position: PlayerPosition }
  | { type: 'list_public_rooms' }
  | { type: 'start_game' }
  | { type: 'action'; action: GameAction }
  | { type: 'leave_room' }
  | { type: 'set_ai'; position: PlayerPosition; enabled: boolean }
  | { type: 'play_again' } // Return to lobby after game ends
  | { type: 'kick_inactive'; position: PlayerPosition }; // Kick an inactive player

// Final standings for game over
export interface FinalStanding {
  position: PlayerPosition;
  name: string;
  score: number;
  rank: number;
}

// Server → Client messages
export type ServerMessage =
  | { type: 'room_created'; roomCode: string; position: PlayerPosition }
  | { type: 'room_joined'; roomCode: string; position: PlayerPosition; players: PlayerInfo[]; settings: RoomSettings }
  | { type: 'room_rejoined'; roomCode: string; position: PlayerPosition; players: PlayerInfo[]; gameStarted: boolean; settings: RoomSettings }
  | { type: 'player_joined'; player: PlayerInfo }
  | { type: 'player_left'; position: PlayerPosition }
  | { type: 'player_reconnected'; position: PlayerPosition; name: string }
  | { type: 'player_inactive'; position: PlayerPosition; playerName: string } // Player went inactive, AI taking over, kick option available
  | { type: 'player_active'; position: PlayerPosition } // Player is back (made a move)
  | { type: 'player_kicked'; position: PlayerPosition; playerName: string } // Player was kicked by another player
  | { type: 'turn_warning'; position: PlayerPosition; secondsRemaining: number }
  | { type: 'host_transferred'; newHostPosition: PlayerPosition; newHostName: string }
  | { type: 'room_expiring'; minutesRemaining: number }
  | { type: 'room_update'; players: PlayerInfo[] }
  | { type: 'public_rooms_list'; rooms: PublicRoomInfo[] }
  | { type: 'game_started' }
  | { type: 'game_state'; state: ClientGameState; yourPosition: PlayerPosition }
  | { type: 'game_over'; standings: FinalStanding[]; handsPlayed: number }
  | { type: 'play_again_vote'; position: PlayerPosition; playerName: string; votesNeeded: number; currentVotes: number }
  | { type: 'game_restarting' }
  | { type: 'error'; message: string };

// Game state sent to clients (with hidden cards)
export interface ClientGameState {
  phase: GamePhase;
  players: ClientPlayer[];
  blind: number; // Just count, not actual cards
  currentTrick: Trick;
  completedTricks: Trick[];
  currentPlayer: PlayerPosition;
  dealerPosition: PlayerPosition;
  pickerPosition: PlayerPosition | null;
  calledAce: CalledAce | null;
  passCount: number;
  trickNumber: number;
  // Score tracking
  playerScores: number[];
  handsPlayed: number;
}

// Player info sent to clients
export interface ClientPlayer {
  position: PlayerPosition;
  name: string;
  cardCount: number;
  hand: Card[] | null; // Only populated for the receiving player
  tricksWon: Card[][];
  isDealer: boolean;
  isPicker: boolean;
  isPartner: boolean;
  isAI: boolean;
  connected: boolean;
}
