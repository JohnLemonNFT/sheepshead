'use client';

// ============================================
// ONLINE GAME - Wrapper for GameUI with WebSocket data
// ============================================
// This component maps WebSocket state to GameUI's common interface
// All game UI logic is in GameUI - this just provides the data

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { GameUI } from './GameUI';
import type { GameUIState, GameUIActions, GameUIConfig, PlayerData } from './GameUI';
import type { OnlineGameState, OnlineGameActions } from '../hooks/useOnlineGame';
import type { Card as CardType, PlayerPosition, Suit, HandScore } from '../game/types';
import { isTrump } from '../game/types';
import { getPlayerDisplayInfo } from '../game/ai/personalities';
import { Announcement } from './Announcement';
import { useGameStore } from '../store/gameStore';
import type { LogEntry } from './GameLog';

interface OnlineGameProps {
  onlineState: OnlineGameState;
  onlineActions: OnlineGameActions;
}

interface TrickResult {
  cards: { card: CardType; playedBy: PlayerPosition }[];
  winner: PlayerPosition;
  points: number;
}

export function OnlineGame({ onlineState, onlineActions }: OnlineGameProps) {
  const { myPosition, gameState, error, roomCode } = onlineState;

  // Get modal openers and goToHome from game store
  const { openSettings, openRules, openStrategy, goToHome } = useGameStore();

  // Track previous state for detecting changes
  const prevStateRef = useRef<{
    pickerPosition: PlayerPosition | null;
    calledAce: { suit: Suit; revealed: boolean } | null;
    trickNumber: number;
    currentTrickLength: number;
    phase: string;
  } | null>(null);

  // Announcement state
  const [announcement, setAnnouncement] = useState<{
    type: 'pick' | 'call' | 'goAlone' | 'partnerReveal' | 'trickWin';
    playerPosition: number;
    details?: string;
  } | null>(null);

  // Trick result state (for showing who won)
  const [trickResult, setTrickResult] = useState<TrickResult | null>(null);

  // Game log (built from state changes)
  const [gameLog, setGameLog] = useState<LogEntry[]>([]);

  // Hand history for scoring summary
  const [handHistory, setHandHistory] = useState<HandScore[]>([]);

  // Loading state - show before GameUI
  if (!gameState || myPosition === null) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-felt-table">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">Loading game...</div>
          <div className="text-gray-300">Room: {roomCode}</div>
        </div>
      </div>
    );
  }

  const {
    phase,
    players: serverPlayers,
    blind,
    currentTrick,
    completedTricks = [],
    currentPlayer,
    dealerPosition,
    pickerPosition,
    calledAce,
    trickNumber,
    playerScores,
    handsPlayed,
  } = gameState;

  // Find my player data
  const myPlayer = serverPlayers.find(p => p.position === myPosition);
  const myHand = myPlayer?.hand || [];

  // Map server players to GameUI PlayerData format
  const players: PlayerData[] = serverPlayers.map(p => {
    const displayInfo = getPlayerDisplayInfo(p.position);
    return {
      position: p.position,
      name: p.name || displayInfo.name,
      hand: p.position === myPosition ? (p.hand || []) : [],
      cardCount: p.cardCount,
      isPicker: p.isPicker,
      // SECURITY FIX: Only expose isPartner for yourself or after revealed
      isPartner: p.position === myPosition ? p.isPartner : (calledAce?.revealed ? p.isPartner : false),
      isDealer: p.position === dealerPosition,
      type: p.isAI ? 'ai' : 'human',
      connected: p.connected,
    };
  });

  // Get player name helper
  const getPlayerName = useCallback((position: PlayerPosition): string => {
    const player = serverPlayers.find(p => p.position === position);
    return player?.name || getPlayerDisplayInfo(position).name;
  }, [serverPlayers]);

  // Log ID counter
  const logIdRef = useRef(0);

  // Add log entry helper
  const addLogEntry = useCallback((player: string, action: string, reason: string = '', isHuman: boolean = true, logPhase: string = '') => {
    logIdRef.current += 1;
    setGameLog(prev => [...prev, {
      id: logIdRef.current,
      player,
      action,
      reason,
      timestamp: Date.now(),
      isHuman,
      phase: logPhase,
    }]);
  }, []);

  // Detect state changes and trigger announcements/log entries
  useEffect(() => {
    const prev = prevStateRef.current;

    if (prev) {
      // Detect picker (someone picked)
      if (prev.pickerPosition === null && pickerPosition !== null && pickerPosition !== myPosition) {
        const pickerName = getPlayerName(pickerPosition);
        addLogEntry(pickerName, 'picked up the blind', '', false, 'picking');
        setAnnouncement({ type: 'pick', playerPosition: pickerPosition });
      }

      // Detect called ace
      if (!prev.calledAce && calledAce && pickerPosition !== null && pickerPosition !== myPosition) {
        const pickerName = getPlayerName(pickerPosition);
        addLogEntry(pickerName, `called ${calledAce.suit} ace`, '', false, 'calling');
        setAnnouncement({ type: 'call', playerPosition: pickerPosition, details: calledAce.suit });
      }

      // Detect partner reveal
      if (prev.calledAce && !prev.calledAce.revealed && calledAce?.revealed) {
        const partnerPos = serverPlayers.find(p => p.isPartner && p.position !== pickerPosition)?.position;
        if (partnerPos !== undefined) {
          addLogEntry(getPlayerName(partnerPos), 'is the partner!', '', false, 'playing');
          setAnnouncement({ type: 'partnerReveal', playerPosition: partnerPos });
        }
      }

      // Detect trick completion (went from <5 to 5 cards, or trick number increased)
      if (prev.trickNumber < trickNumber && prev.currentTrickLength === 5) {
        // Previous trick just completed - find winner from completed tricks
        const lastCompletedTrick = completedTricks[completedTricks.length - 1];
        if (lastCompletedTrick && lastCompletedTrick.winningPlayer !== undefined) {
          const points = lastCompletedTrick.cards.reduce((sum, c) => {
            const card = c.card;
            if (card.rank === 'A') return sum + 11;
            if (card.rank === '10') return sum + 10;
            if (card.rank === 'K') return sum + 4;
            if (card.rank === 'Q') return sum + 3;
            if (card.rank === 'J') return sum + 2;
            return sum;
          }, 0);

          setTrickResult({
            cards: lastCompletedTrick.cards,
            winner: lastCompletedTrick.winningPlayer,
            points,
          });
        }
      }
    }

    // Update previous state
    prevStateRef.current = {
      pickerPosition,
      calledAce,
      trickNumber,
      currentTrickLength: currentTrick.cards.length,
      phase,
    };
  }, [pickerPosition, calledAce, trickNumber, currentTrick.cards.length, phase, completedTricks, myPosition, getPlayerName, addLogEntry, serverPlayers]);

  // Auto-dismiss announcements
  useEffect(() => {
    if (announcement) {
      const delay = announcement.type === 'call' ? 2500 :
                    announcement.type === 'partnerReveal' ? 3000 : 2000;
      const timer = setTimeout(() => setAnnouncement(null), delay);
      return () => clearTimeout(timer);
    }
  }, [announcement]);

  // Auto-clear trick result
  useEffect(() => {
    if (trickResult) {
      const timer = setTimeout(() => setTrickResult(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [trickResult]);

  // Clear log when new hand starts
  useEffect(() => {
    if (phase === 'picking' && trickNumber === 1) {
      setGameLog([]);
    }
  }, [phase, trickNumber]);

  // Calculate legal plays
  const getLegalPlays = useCallback((): CardType[] => {
    if (phase !== 'playing' || currentPlayer !== myPosition || myHand.length === 0) {
      return [];
    }
    if (currentTrick.cards.length === 0) {
      return myHand;
    }
    const leadCard = currentTrick.cards[0].card;
    const leadIsTrump = isTrump(leadCard);
    if (leadIsTrump) {
      const trumpCards = myHand.filter(c => isTrump(c));
      return trumpCards.length > 0 ? trumpCards : myHand;
    } else {
      const followCards = myHand.filter(c => c.suit === leadCard.suit && !isTrump(c));
      return followCards.length > 0 ? followCards : myHand;
    }
  }, [phase, currentPlayer, myPosition, myHand, currentTrick]);

  // Get callable suits (suits where I don't have the Ace)
  const getCallableSuits = useCallback((): Suit[] => {
    return (['clubs', 'spades', 'hearts'] as Suit[]).filter(
      suit => !myHand.some(c => c.suit === suit && c.rank === 'A')
    );
  }, [myHand]);

  // Bury validation
  const canBury = useCallback((cards: CardType[]): { valid: boolean; reason?: string } => {
    if (cards.length !== 2) {
      return { valid: false, reason: 'Select exactly 2 cards' };
    }
    // In online mode, server validates - we just check count
    return { valid: true };
  }, []);

  // Wrapped handlers with logging and announcements for human player
  const handlePick = useCallback(() => {
    const myName = getPlayerName(myPosition);
    addLogEntry(myName, 'picked up the blind', '', true, 'picking');
    setAnnouncement({ type: 'pick', playerPosition: myPosition });
    setTimeout(() => {
      setAnnouncement(null);
      onlineActions.sendAction({ type: 'pick' });
    }, 1500);
  }, [myPosition, getPlayerName, addLogEntry, onlineActions]);

  const handlePass = useCallback(() => {
    const myName = getPlayerName(myPosition);
    addLogEntry(myName, 'passed', '', true, 'picking');
    onlineActions.sendAction({ type: 'pass' });
  }, [myPosition, getPlayerName, addLogEntry, onlineActions]);

  const handleCallAce = useCallback((suit: Suit) => {
    const myName = getPlayerName(myPosition);
    addLogEntry(myName, `called ${suit} ace`, '', true, 'calling');
    setAnnouncement({ type: 'call', playerPosition: myPosition, details: suit });
    setTimeout(() => {
      setAnnouncement(null);
      onlineActions.sendAction({ type: 'callAce', suit });
    }, 2500);
  }, [myPosition, getPlayerName, addLogEntry, onlineActions]);

  const handleGoAlone = useCallback(() => {
    const myName = getPlayerName(myPosition);
    addLogEntry(myName, 'going alone', '', true, 'calling');
    setAnnouncement({ type: 'goAlone', playerPosition: myPosition });
    setTimeout(() => {
      setAnnouncement(null);
      onlineActions.sendAction({ type: 'goAlone' });
    }, 2000);
  }, [myPosition, getPlayerName, addLogEntry, onlineActions]);

  const handleBury = useCallback((cards: [CardType, CardType]) => {
    const myName = getPlayerName(myPosition);
    const pts = cards.reduce((sum, c) => sum + (c.rank === 'A' ? 11 : c.rank === '10' ? 10 : c.rank === 'K' ? 4 : c.rank === 'Q' ? 3 : c.rank === 'J' ? 2 : 0), 0);
    addLogEntry(myName, `buried 2 cards (${pts} pts)`, '', true, 'burying');
    onlineActions.sendAction({ type: 'bury', cards });
  }, [myPosition, getPlayerName, addLogEntry, onlineActions]);

  const handlePlayCard = useCallback((card: CardType) => {
    const myName = getPlayerName(myPosition);
    addLogEntry(myName, `played ${card.rank} of ${card.suit}`, '', true, 'playing');
    onlineActions.sendAction({ type: 'playCard', card });
  }, [myPosition, getPlayerName, addLogEntry, onlineActions]);

  // Build GameUIState
  const gameUIState: GameUIState = {
    phase,
    players,
    blind, // Server sends count, not cards
    currentTrick,
    completedTricks,
    currentPlayer,
    dealerPosition,
    pickerPosition,
    calledAce,
    trickNumber,
  };

  // Build GameUIActions - map to WebSocket actions with logging
  const gameUIActions: GameUIActions = {
    onPick: handlePick,
    onPass: handlePass,
    onBury: handleBury,
    onCallAce: handleCallAce,
    onGoAlone: handleGoAlone,
    onPlayCard: handlePlayCard,
    onLeaveGame: () => onlineActions.leaveRoom(),
    // Online mode doesn't have these local features
    onNewGame: undefined,
    onNewHand: undefined,
    onCrack: undefined,
    onRecrack: undefined,
    onNoCrack: undefined,
    onBlitz: undefined,
  };

  // Get current hand score (if in scoring phase)
  const currentHandScore = handHistory.length > 0 ? handHistory[handHistory.length - 1] : null;

  // Build GameUIConfig
  const gameUIConfig: GameUIConfig = {
    mode: 'online',
    roomCode: roomCode || undefined,
    activePlayerPosition: myPosition,

    // Online mode doesn't have coaching (yet)
    coachingEnabled: false,
    showStrategyTips: false,
    showAIExplanations: false,

    // Scores and history
    playerScores,
    handsPlayed,
    gameLog,

    // Helpers
    getLegalPlays,
    getCallableSuits,
    canBury,

    // Trick result
    trickResult,
    onClearTrickResult: () => setTrickResult(null),

    // Hand score
    currentHandScore,

    // Callbacks
    onClearLog: () => setGameLog([]),
    onOpenSettings: openSettings,
    onOpenRules: openRules,
    onOpenStrategy: openStrategy,
    onGoHome: () => {
      onlineActions.leaveRoom();
      goToHome();
    },
  };

  return (
    <>
      {/* Error banner */}
      {error && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-900/90 p-3 text-center text-red-200 text-sm">
          {error}
        </div>
      )}
      <GameUI state={gameUIState} actions={gameUIActions} config={gameUIConfig} />

      {/* Announcement overlay */}
      {announcement && (
        <Announcement
          type={announcement.type}
          playerPosition={announcement.playerPosition}
          details={announcement.details}
        />
      )}
    </>
  );
}
