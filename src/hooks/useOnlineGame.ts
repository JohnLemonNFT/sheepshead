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
  | { type: 'player_joined'; player: PlayerInfo }
  | { type: 'player_left'; position: PlayerPosition }
  | { type: 'room_update'; players: PlayerInfo[] }
  | { type: 'game_started' }
  | { type: 'game_state'; state: ClientGameState; yourPosition: PlayerPosition }
  | { type: 'error'; message: string };

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

  // Handle incoming messages
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message = JSON.parse(event.data) as ServerMessage;

      switch (message.type) {
        case 'room_created':
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
          setState(prev => ({
            ...prev,
            roomCode: message.roomCode,
            myPosition: message.position,
            isHost: false,
            players: message.players,
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
            players: prev.players.filter(p => p.position !== message.position),
          }));
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

  // Connect to server
  const connect = useCallback((serverUrl: string) => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    setState(prev => ({ ...prev, connecting: true, error: null }));

    const ws = new WebSocket(serverUrl);

    ws.onopen = () => {
      setState(prev => ({ ...prev, connected: true, connecting: false }));
    };

    ws.onclose = () => {
      setState({
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
      wsRef.current = null;
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
  }, [handleMessage]);

  // Disconnect from server
  const disconnect = useCallback(() => {
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

  // Leave the current room
  const leaveRoom = useCallback(() => {
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
