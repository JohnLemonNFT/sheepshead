'use client';

// ============================================
// ONLINE GAME - Wrapper for GameUI with WebSocket data
// ============================================
// This component maps WebSocket state to GameUI's common interface
// All game UI logic is in GameUI - this just provides the data

import { useMemo, useCallback } from 'react';
import { GameUI } from './GameUI';
import type { GameUIState, GameUIActions, GameUIConfig, PlayerData } from './GameUI';
import type { OnlineGameState, OnlineGameActions } from '../hooks/useOnlineGame';
import type { Card as CardType, PlayerPosition, Suit } from '../game/types';
import { isTrump } from '../game/types';
import { getPlayerDisplayInfo } from '../game/ai/personalities';

interface OnlineGameProps {
  onlineState: OnlineGameState;
  onlineActions: OnlineGameActions;
}

export function OnlineGame({ onlineState, onlineActions }: OnlineGameProps) {
  const { myPosition, gameState, error, roomCode } = onlineState;

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

  // Build GameUIActions - map to WebSocket actions
  const gameUIActions: GameUIActions = {
    onPick: () => onlineActions.sendAction({ type: 'pick' }),
    onPass: () => onlineActions.sendAction({ type: 'pass' }),
    onBury: (cards: [CardType, CardType]) => {
      onlineActions.sendAction({ type: 'bury', cards });
    },
    onCallAce: (suit: Suit) => onlineActions.sendAction({ type: 'callAce', suit }),
    onGoAlone: () => onlineActions.sendAction({ type: 'goAlone' }),
    onPlayCard: (card: CardType) => onlineActions.sendAction({ type: 'playCard', card }),
    onLeaveGame: () => onlineActions.leaveRoom(),
    // Online mode doesn't have these
    onNewGame: undefined,
    onNewHand: undefined,
    onCrack: undefined,
    onRecrack: undefined,
    onNoCrack: undefined,
    onBlitz: undefined,
  };

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
    gameLog: [], // TODO: Add game log for online mode

    // Helpers
    getLegalPlays,
    getCallableSuits,
    canBury,

    // No trick result animation in online (server handles timing)
    trickResult: null,

    // Callbacks
    onClearLog: () => {},
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
    </>
  );
}
