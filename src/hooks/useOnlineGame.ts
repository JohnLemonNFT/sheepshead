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
}

// Server message types
type ServerMessage =
  | { type: 'room_created'; roomCode: string; position: PlayerPosition }
  | { type: 'room_joined'; roomCode: string; position: PlayerPosition; players: PlayerInfo[] }
  | { type: 'room_rejoined'; roomCode: string; position: PlayerPosition; players: PlayerInfo[]; gameStarted: boolean }
  | { type: 'player_joined'; player: PlayerInfo }
  | { type: 'player_left'; position: PlayerPosition }
  | { type: 'player_reconnected'; position: PlayerPosition; name: string }
  | { type: 'player_timeout'; position: PlayerPosition; playerName: string }
  | { type: 'room_update'; players: PlayerInfo[] }
  | { type: 'game_started' }
  | { type: 'game_state'; state: ClientGameState; yourPosition: PlayerPosition }
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
  players: PlayerInfo[];
  gameStarted: boolean;
  gameState: ClientGameState | null;
  error: string | null;
}

export interface OnlineGameActions {
  connect: (serverUrl: string) => void;
  disconnect: () => void;
  createRoom: (playerName: string) => void;
  joinRoom: (roomCode: string, playerName: string) => void;
  startGame: () => void;
  sendAction: (action: GameAction) => void;
  leaveRoom: () => void;
  clearError: () => void;
}

export function useOnlineGame(): [OnlineGameState, OnlineGameActions] {
  const [state, setState] = useState<OnlineGameState>({
    connected: false,
    connecting: false,
    roomCode: null,
    myPosition: null,
    isHost: false,
    players: [],
    gameStarted: false,
    gameState: null,
    error: null,
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
          setState(prev => ({
            ...prev,
            players: prev.players.map(p =>
              p.position === message.position ? { ...p, connected: true, name: message.name } : p
            ),
          }));
          break;

        case 'player_timeout':
          // Player timed out - AI is taking over for them
          console.log(`${message.playerName} timed out - AI taking over`);
          setState(prev => ({
            ...prev,
            error: `${message.playerName} took too long and is now controlled by AI`,
          }));
          // Auto-clear the error after 5 seconds
          setTimeout(() => {
            setState(prev => prev.error?.includes('took too long') ? { ...prev, error: null } : prev);
          }, 5000);
          break;

        case 'room_update':
          setState(prev => ({
            ...prev,
            players: message.players,
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
          }));
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
        players: [],
        gameStarted: false,
        gameState: null,
        error: reconnectAttempts.current >= maxReconnectAttempts ? 'Connection lost. Please reconnect.' : null,
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

  // Create a new room
  const createRoom = useCallback((playerName: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setState(prev => ({ ...prev, error: 'Not connected to server' }));
      return;
    }
    pendingName.current = playerName;
    wsRef.current.send(JSON.stringify({ type: 'create_room', playerName }));
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
    }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
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
  };

  return [state, actions];
}
