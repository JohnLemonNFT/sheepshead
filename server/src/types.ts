// ============================================
// SERVER TYPES FOR ONLINE MULTIPLAYER
// ============================================

// Import and re-export core types from shared game engine
// Import for local use
import type {
  Suit as SuitType,
  Rank as RankType,
  Card as CardType,
  PlayerPosition as PlayerPositionType,
  PlayerType as PlayerTypeType,
  Player as PlayerType,
  GamePhase as GamePhaseType,
  Trick as TrickType,
  CalledAce as CalledAceType,
  CrackState as CrackStateType,
  GameConfig as GameConfigType,
  GameState as GameStateType,
  GameAction as GameActionType,
  HandScore as HandScoreType,
} from '@sheepshead/game-engine';

// Re-export for external use
export type {
  Suit,
  Rank,
  Card,
  PlayerPosition,
  PlayerType,
  Player,
  GamePhase,
  Trick,
  CalledAce,
  CrackState,
  GameConfig,
  GameState,
  GameAction,
  HandScore,
} from '@sheepshead/game-engine';

// Type aliases for local use
type Suit = SuitType;
type Rank = RankType;
type Card = CardType;
type PlayerPosition = PlayerPositionType;
type GamePhase = GamePhaseType;
type Trick = TrickType;
type CalledAce = CalledAceType;
type CrackState = CrackStateType;
type HandScore = HandScoreType;
type GameAction = GameActionType;

// Re-export constants and functions
export {
  POINT_VALUES,
  TRUMP_ORDER,
  FAIL_ORDER,
  FAIL_SUITS,
  DEFAULT_CONFIG,
  isTrump,
  getTrumpPower,
  getFailPower,
  getCardPoints,
  getCardId,
  getTotalPoints,
  createDeck,
  shuffleDeck,
  dealCards,
  sortHand,
  generateSeed,
  getLegalPlays,
  getEffectiveSuit,
  determineTrickWinner,
  getCallableSuits,
  getCallableTens,
  mustGoAlone,
} from '@sheepshead/game-engine';

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
  maxHands: number; // 0 = unlimited, 5/10/15 = fixed game length
  callTen: boolean; // Allow calling a 10 when picker has all 3 fail aces
  cracking: boolean; // Allow defenders to double stakes
  blitzes: boolean; // Allow picker to double before seeing blind
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
  // Hand result (only when phase is 'scoring')
  handScore?: HandScore;
  // Shuffle verification seed (for fair play)
  shuffleSeed?: string;
  // Cracking state (when cracking is enabled)
  crackState?: CrackState;
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
