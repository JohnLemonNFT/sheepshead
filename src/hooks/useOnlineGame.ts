// ============================================
// ONLINE GAME HOOK - WebSocket Connection
// ============================================

import { useState, useRef, useCallback, useEffect } from 'react';
import type { GameAction, PlayerPosition, GamePhase, Card, Suit } from '../game/types';

// Types matching server
export interface PlayerInfo {
  position: PlayerPosition;
  name: string;
  connected: boolean;
}

export interface ClientPlayer {
  position: PlayerPosition;
  name: string;
  cardCount: number;
  hand: Card[] | null;
  tricksWon: Card[][];
  isDealer: boolean;
  isPicker: boolean;
  isPartner: boolean;
  isAI: boolean;
  connected: boolean;
}

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

// Room settings for display
export interface RoomSettings {
  partnerVariant: 'calledAce' | 'jackOfDiamonds' | 'none';
  noPickRule: 'leaster' | 'forcedPick';
  maxHands?: 10 | 15 | 25;
  callTen?: boolean; // Allow calling a 10 when picker has all 3 fail aces
}

// Final standings for game over
export interface FinalStanding {
  position: PlayerPosition;
  name: string;
  score: number;
  rank: number;
}

// Hand score for end-of-hand display
export interface HandScore {
  pickerTeamPoints: number;
  defenderTeamPoints: number;
  pickerWins: boolean;
  isSchneider: boolean;
  isSchwarz: boolean;
  multiplier: number;
  playerScores: { position: PlayerPosition; points: number }[];
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

export interface ClientGameState {
  phase: GamePhase;
  players: ClientPlayer[];
  blind: number;
  currentTrick: Trick;
  completedTricks: Trick[];
  currentPlayer: PlayerPosition;
  dealerPosition: PlayerPosition;
  pickerPosition: PlayerPosition | null;
  calledAce: CalledAce | null;
  passCount: number;
  trickNumber: number;
  playerScores: number[];
  handsPlayed: number;
  handScore?: HandScore; // Only when phase is 'scoring'
}

// Server message types
type ServerMessage =
  | { type: 'room_created'; roomCode: string; position: PlayerPosition }
  | { type: 'room_joined'; roomCode: string; position: PlayerPosition; players: PlayerInfo[]; settings: RoomSettings }
  | { type: 'room_rejoined'; roomCode: string; position: PlayerPosition; players: PlayerInfo[]; gameStarted: boolean; settings: RoomSettings }
  | { type: 'player_joined'; player: PlayerInfo }
  | { type: 'player_left'; position: PlayerPosition }
  | { type: 'player_reconnected'; position: PlayerPosition; name: string }
  | { type: 'player_inactive'; position: PlayerPosition; playerName: string }
  | { type: 'player_active'; position: PlayerPosition }
  | { type: 'player_kicked'; position: PlayerPosition; playerName: string }
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

// Session storage for reconnection
const SESSION_KEY = 'sheepshead_session';

interface SavedSession {
  serverUrl: string;
  roomCode: string;
  playerName: string;
  position: PlayerPosition;
}

function saveSession(session: SavedSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function loadSession(): SavedSession | null {
  const data = localStorage.getItem(SESSION_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export interface OnlineGameState {
  connected: boolean;
  connecting: boolean;
  roomCode: string | null;
  myPosition: PlayerPosition | null;
  isHost: boolean;
  hostPosition: PlayerPosition;
  players: PlayerInfo[];
  gameStarted: boolean;
  gameState: ClientGameState | null;
  error: string | null;
  publicRooms: PublicRoomInfo[];
  roomSettings: RoomSettings | null;
  turnWarning: { position: PlayerPosition; secondsRemaining: number } | null;
  // Inactive players (can be kicked)
  inactivePlayers: Set<PlayerPosition>;
  // Game end state
  gameEnded: boolean;
  finalStandings: FinalStanding[] | null;
  playAgainVotes: { current: number; needed: number } | null;
}

export interface OnlineGameActions {
  connect: (serverUrl: string) => void;
  disconnect: () => void;
  createRoom: (playerName: string, isPublic?: boolean, settings?: RoomSettings) => void;
  joinRoom: (roomCode: string, playerName: string) => void;
  startGame: () => void;
  sendAction: (action: GameAction) => void;
  leaveRoom: () => void;
  clearError: () => void;
  listPublicRooms: () => void;
  playAgain: () => void;
  kickInactive: (position: PlayerPosition) => void;
}

export function useOnlineGame(): [OnlineGameState, OnlineGameActions] {
  const [state, setState] = useState<OnlineGameState>({
    connected: false,
    connecting: false,
    roomCode: null,
    myPosition: null,
    isHost: false,
    hostPosition: 0 as PlayerPosition,
    players: [],
    gameStarted: false,
    gameState: null,
    error: null,
    publicRooms: [],
    roomSettings: null,
    turnWarning: null,
    inactivePlayers: new Set(),
    gameEnded: false,
    finalStandings: null,
    playAgainVotes: null,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const pendingName = useRef<string>('');
  const serverUrlRef = useRef<string>('');
  const reconnectAttempts = useRef<number>(0);
  const maxReconnectAttempts = 3;
  const intentionalDisconnect = useRef<boolean>(false);

  // Handle incoming messages
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message = JSON.parse(event.data) as ServerMessage;

      switch (message.type) {
        case 'room_created':
          // Save session for reconnection
          saveSession({
            serverUrl: serverUrlRef.current,
            roomCode: message.roomCode,
            playerName: pendingName.current,
            position: message.position,
          });
          setState(prev => ({
            ...prev,
            roomCode: message.roomCode,
            myPosition: message.position,
            isHost: true,
            hostPosition: message.position,
            players: [{
              position: message.position,
              name: pendingName.current,
              connected: true,
            }],
          }));
          break;

        case 'room_joined':
          // Save session for reconnection
          saveSession({
            serverUrl: serverUrlRef.current,
            roomCode: message.roomCode,
            playerName: pendingName.current,
            position: message.position,
          });
          setState(prev => ({
            ...prev,
            roomCode: message.roomCode,
            myPosition: message.position,
            isHost: false,
            players: message.players,
            roomSettings: message.settings,
          }));
          break;

        case 'room_rejoined':
          // Successfully rejoined
          reconnectAttempts.current = 0;
          setState(prev => ({
            ...prev,
            roomCode: message.roomCode,
            myPosition: message.position,
            isHost: message.position === 0,
            players: message.players,
            gameStarted: message.gameStarted,
            roomSettings: message.settings,
          }));
          break;

        case 'player_joined':
          setState(prev => ({
            ...prev,
            players: [...prev.players.filter(p => p.position !== message.player.position), message.player]
              .sort((a, b) => a.position - b.position),
          }));
          break;

        case 'player_left':
          setState(prev => ({
            ...prev,
            players: prev.players.map(p =>
              p.position === message.position ? { ...p, connected: false } : p
            ),
          }));
          break;

        case 'player_reconnected':
          setState(prev => {
            const newInactive = new Set(prev.inactivePlayers);
            newInactive.delete(message.position);
            return {
              ...prev,
              players: prev.players.map(p =>
                p.position === message.position ? { ...p, connected: true, name: message.name } : p
              ),
              inactivePlayers: newInactive,
            };
          });
          break;

        case 'player_inactive':
          // Player went inactive - AI taking over, can be kicked
          console.log(`${message.playerName} is inactive - AI taking over`);
          setState(prev => {
            const newInactive = new Set(prev.inactivePlayers);
            newInactive.add(message.position);
            return {
              ...prev,
              inactivePlayers: newInactive,
              turnWarning: null,
            };
          });
          break;

        case 'player_active':
          // Player is back (made a move after being inactive)
          setState(prev => {
            const newInactive = new Set(prev.inactivePlayers);
            newInactive.delete(message.position);
            return {
              ...prev,
              inactivePlayers: newInactive,
            };
          });
          break;

        case 'player_kicked':
          // Player was kicked by another player
          console.log(`${message.playerName} was kicked`);
          setState(prev => {
            const newInactive = new Set(prev.inactivePlayers);
            newInactive.delete(message.position);
            return {
              ...prev,
              inactivePlayers: newInactive,
              error: `${message.playerName} was kicked for inactivity`,
            };
          });
          // Auto-clear the notification after 5 seconds
          setTimeout(() => {
            setState(prev => prev.error?.includes('was kicked') ? { ...prev, error: null } : prev);
          }, 5000);
          break;

        case 'turn_warning':
          // Warning before timeout
          setState(prev => ({
            ...prev,
            turnWarning: {
              position: message.position,
              secondsRemaining: message.secondsRemaining,
            },
          }));
          break;

        case 'host_transferred':
          // Host has been transferred to another player
          console.log(`Host transferred to ${message.newHostName}`);
          setState(prev => ({
            ...prev,
            hostPosition: message.newHostPosition,
            isHost: prev.myPosition === message.newHostPosition,
            error: `${message.newHostName} is now the host`,
          }));
          // Auto-clear the notification after 5 seconds
          setTimeout(() => {
            setState(prev => prev.error?.includes('is now the host') ? { ...prev, error: null } : prev);
          }, 5000);
          break;

        case 'room_expiring':
          // Room will expire soon
          setState(prev => ({
            ...prev,
            error: `Room will close in ${message.minutesRemaining} minutes if game doesn't start`,
          }));
          break;

        case 'room_update':
          setState(prev => ({
            ...prev,
            players: message.players,
          }));
          break;

        case 'public_rooms_list':
          setState(prev => ({
            ...prev,
            publicRooms: message.rooms,
          }));
          break;

        case 'game_started':
          setState(prev => ({
            ...prev,
            gameStarted: true,
          }));
          break;

        case 'game_state':
          setState(prev => ({
            ...prev,
            gameState: message.state,
            myPosition: message.yourPosition,
            // Clear turn warning when game state changes (new turn)
            turnWarning: prev.turnWarning?.position !== message.state.currentPlayer ? null : prev.turnWarning,
          }));
          break;

        case 'game_over':
          // Game has ended - show final standings
          setState(prev => ({
            ...prev,
            gameEnded: true,
            finalStandings: message.standings,
            playAgainVotes: null,
            turnWarning: null,
          }));
          console.log(`Game over! ${message.handsPlayed} hands played`);
          break;

        case 'play_again_vote':
          // Someone voted to play again
          setState(prev => ({
            ...prev,
            playAgainVotes: {
              current: message.currentVotes,
              needed: message.votesNeeded,
            },
          }));
          console.log(`${message.playerName} voted to play again (${message.currentVotes}/${message.votesNeeded})`);
          break;

        case 'game_restarting':
          // Back to lobby - someone clicked play again
          setState(prev => ({
            ...prev,
            gameEnded: false,
            gameStarted: false,
            finalStandings: null,
            playAgainVotes: null,
            gameState: null,
          }));
          console.log('Returning to lobby');
          break;

        case 'error':
          // If error is about room not existing, clear session
          if (message.message.includes('Room no longer exists') || message.message.includes('Room not found')) {
            clearSession();
          }
          setState(prev => ({
            ...prev,
            error: message.message,
          }));
          break;
      }
    } catch (err) {
      console.error('Failed to parse server message:', err);
    }
  }, []);

  // Try to rejoin a saved session
  const tryRejoin = useCallback((ws: WebSocket, session: SavedSession) => {
    pendingName.current = session.playerName;
    ws.send(JSON.stringify({
      type: 'rejoin_room',
      roomCode: session.roomCode,
      playerName: session.playerName,
      position: session.position,
    }));
  }, []);

  // Connect to server
  const connect = useCallback((serverUrl: string, autoRejoin: boolean = false) => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    intentionalDisconnect.current = false;
    serverUrlRef.current = serverUrl;
    setState(prev => ({ ...prev, connecting: true, error: null }));

    const ws = new WebSocket(serverUrl);
    const savedSession = loadSession();

    ws.onopen = () => {
      setState(prev => ({ ...prev, connected: true, connecting: false }));
      reconnectAttempts.current = 0;

      // Auto-rejoin if we have a saved session for this server
      if (autoRejoin && savedSession && savedSession.serverUrl === serverUrl) {
        tryRejoin(ws, savedSession);
      }
    };

    ws.onclose = () => {
      wsRef.current = null;

      // Try to reconnect if not intentional
      if (!intentionalDisconnect.current && reconnectAttempts.current < maxReconnectAttempts) {
        const session = loadSession();
        if (session) {
          reconnectAttempts.current++;
          console.log(`Connection lost, attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})...`);
          setState(prev => ({ ...prev, connected: false, connecting: true }));
          // Wait a bit before reconnecting
          setTimeout(() => {
            connect(session.serverUrl, true);
          }, 1000 * reconnectAttempts.current); // Exponential backoff
          return;
        }
      }

      // Full disconnect
      setState({
        connected: false,
        connecting: false,
        roomCode: null,
        myPosition: null,
        isHost: false,
        hostPosition: 0 as PlayerPosition,
        players: [],
        gameStarted: false,
        gameState: null,
        error: reconnectAttempts.current >= maxReconnectAttempts ? 'Connection lost. Please reconnect.' : null,
        publicRooms: [],
        roomSettings: null,
        turnWarning: null,
        inactivePlayers: new Set(),
        gameEnded: false,
        finalStandings: null,
        playAgainVotes: null,
      });
    };

    ws.onerror = () => {
      setState(prev => ({
        ...prev,
        connecting: false,
        error: 'Failed to connect to server',
      }));
    };

    ws.onmessage = handleMessage;

    wsRef.current = ws;
  }, [handleMessage, tryRejoin]);

  // Disconnect from server (intentional)
  const disconnect = useCallback(() => {
    intentionalDisconnect.current = true;
    clearSession();
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  // Default room settings
  const DEFAULT_SETTINGS: RoomSettings = {
    partnerVariant: 'calledAce',
    noPickRule: 'leaster',
  };

  // Create a new room
  const createRoom = useCallback((playerName: string, isPublic: boolean = false, settings: RoomSettings = DEFAULT_SETTINGS) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setState(prev => ({ ...prev, error: 'Not connected to server' }));
      return;
    }
    pendingName.current = playerName;
    wsRef.current.send(JSON.stringify({
      type: 'create_room',
      playerName,
      isPublic,
      settings,
    }));
    setState(prev => ({ ...prev, roomSettings: settings }));
  }, []);

  // Join an existing room
  const joinRoom = useCallback((roomCode: string, playerName: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setState(prev => ({ ...prev, error: 'Not connected to server' }));
      return;
    }
    pendingName.current = playerName;
    wsRef.current.send(JSON.stringify({ type: 'join_room', roomCode, playerName }));
  }, []);

  // Start the game (host only)
  const startGame = useCallback(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setState(prev => ({ ...prev, error: 'Not connected to server' }));
      return;
    }
    wsRef.current.send(JSON.stringify({ type: 'start_game' }));
  }, []);

  // Send a game action
  const sendAction = useCallback((action: GameAction) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setState(prev => ({ ...prev, error: 'Not connected to server' }));
      return;
    }
    wsRef.current.send(JSON.stringify({ type: 'action', action }));
  }, []);

  // Leave the current room (intentional)
  const leaveRoom = useCallback(() => {
    clearSession(); // Clear saved session so we don't auto-rejoin
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }
    wsRef.current.send(JSON.stringify({ type: 'leave_room' }));
    setState(prev => ({
      ...prev,
      roomCode: null,
      myPosition: null,
      isHost: false,
      players: [],
      gameStarted: false,
      gameState: null,
      inactivePlayers: new Set(),
      gameEnded: false,
      finalStandings: null,
      playAgainVotes: null,
    }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // List public rooms
  const listPublicRooms = useCallback(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }
    wsRef.current.send(JSON.stringify({ type: 'list_public_rooms' }));
  }, []);

  // Vote to play again after game ends
  const playAgain = useCallback(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setState(prev => ({ ...prev, error: 'Not connected to server' }));
      return;
    }
    wsRef.current.send(JSON.stringify({ type: 'play_again' }));
  }, []);

  // Kick an inactive player
  const kickInactive = useCallback((position: PlayerPosition) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setState(prev => ({ ...prev, error: 'Not connected to server' }));
      return;
    }
    wsRef.current.send(JSON.stringify({ type: 'kick_inactive', position }));
  }, []);

  // Auto-reconnect on mount if we have a saved session
  useEffect(() => {
    const session = loadSession();
    if (session) {
      console.log('Found saved session, attempting to reconnect...');
      connect(session.serverUrl, true);
    }
  }, [connect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const actions: OnlineGameActions = {
    connect,
    disconnect,
    createRoom,
    joinRoom,
    startGame,
    sendAction,
    leaveRoom,
    clearError,
    listPublicRooms,
    playAgain,
    kickInactive,
  };

  return [state, actions];
}
