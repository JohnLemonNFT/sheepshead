'use client';

// ============================================
// LOCAL GAME - Wrapper for GameUI with Zustand store data
// ============================================
// This component maps local store state to GameUI's common interface
// All game UI logic is in GameUI - this just provides the data

import { useCallback, useEffect, useState, useRef } from 'react';
import { GameUI } from './GameUI';
import type { GameUIState, GameUIActions, GameUIConfig, PlayerData } from './GameUI';
import { useGameStore, SPEED_DELAYS } from '../store/gameStore';
import { useCoaching } from '../hooks/useCoaching';
import type { Card as CardType, PlayerPosition, Suit } from '../game/types';
import { getPlayerDisplayInfo } from '../game/ai/personalities';
import { Announcement } from './Announcement';

export function LocalGame() {
  const {
    gameState,
    gameSettings,
    playerTypes,
    activeHumanPosition,
    selectedCards,
    lastAIExplanation,
    showExplanation,
    playerScores,
    handsPlayed,
    handHistory,
    gameLog,
    trickResult,
    goToHome,
    newGame,
    newHand,
    pick,
    pass,
    crack,
    recrack,
    noCrack,
    blitz,
    bury,
    callAce,
    goAlone,
    playCard,
    clearTrickResult,
    toggleCardSelection,
    showWhyExplanation,
    hideExplanation,
    addLogEntry,
    clearLog,
    executeAITurn,
    getLegalPlaysForHuman,
    getCallableSuitsForPicker,
    canBurySelection,
    canBlitz,
    getMultiplier,
    openSettings,
    openRules,
    openStrategy,
    updateSettings,
    statistics,
    currentShuffleSeed,
    resetStatistics,
  } = useGameStore();

  // Coaching system
  const [coachingState, coachingActions] = useCoaching();
  const [pendingBury, setPendingBury] = useState<[CardType, CardType] | null>(null);

  // Sync coaching enabled state with settings
  useEffect(() => {
    coachingActions.setEnabled(gameSettings.coachingEnabled);
  }, [gameSettings.coachingEnabled, coachingActions]);

  // Announcement state
  const [announcement, setAnnouncement] = useState<{
    type: 'pick' | 'call' | 'goAlone' | 'partnerReveal' | 'leaster';
    playerPosition: number;
    details?: string;
  } | null>(null);

  const {
    phase,
    players,
    blind,
    currentTrick,
    completedTricks,
    currentPlayer,
    pickerPosition,
    calledAce,
    trickNumber,
    dealerPosition,
  } = gameState;

  // Track previous phase for leaster detection (after destructuring)
  const prevPhaseRef = useRef(phase);

  // Determine if current player is human and active
  const isCurrentPlayerHuman = playerTypes[currentPlayer] === 'human';
  const isHumanTurn = isCurrentPlayerHuman && activeHumanPosition === currentPlayer;

  // The active human player
  const activePlayer = activeHumanPosition !== null ? players[activeHumanPosition] : null;

  // Execute AI turns automatically
  useEffect(() => {
    if (announcement || trickResult) return;

    const currentPlayerData = players[currentPlayer];
    const shouldAIPlay = currentPlayerData?.type === 'ai' &&
                         phase !== 'dealing' &&
                         phase !== 'scoring' &&
                         phase !== 'gameOver';

    if (shouldAIPlay) {
      const delay = SPEED_DELAYS[gameSettings.gameSpeed];
      const timer = setTimeout(executeAITurn, delay);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, phase, players, trickNumber, currentTrick.cards.length, executeAITurn, announcement, trickResult, gameSettings.gameSpeed]);

  // Watch for AI actions that should trigger announcements
  useEffect(() => {
    if (lastAIExplanation && lastAIExplanation.playerPosition !== 0) {
      const { action, playerPosition } = lastAIExplanation;

      if (action === 'pick') {
        setAnnouncement({ type: 'pick', playerPosition });
      } else if (action === 'callAce') {
        const suitMatch = lastAIExplanation.detailedExplanation?.match(/calling (\w+)/i);
        const suit = suitMatch ? suitMatch[1].toLowerCase() : calledAce?.suit;
        setAnnouncement({ type: 'call', playerPosition, details: suit });
      } else if (action === 'goAlone') {
        setAnnouncement({ type: 'goAlone', playerPosition });
      }
    }
  }, [lastAIExplanation, calledAce?.suit]);

  // Track previous revealed state for partner detection
  const prevRevealedRef = useRef(calledAce?.revealed);

  // Detect partner reveal (when called ace is played)
  useEffect(() => {
    if (calledAce?.revealed && !prevRevealedRef.current) {
      // Find the partner position
      const partnerPlayer = players.find(p => p.isPartner);
      if (partnerPlayer) {
        setAnnouncement({ type: 'partnerReveal', playerPosition: partnerPlayer.position });
        addLogEntry(
          getPlayerDisplayInfo(partnerPlayer.position).name,
          'revealed as partner',
          `played the ${calledAce.suit} Ace`,
          partnerPlayer.type === 'human',
          'playing'
        );
      }
    }
    prevRevealedRef.current = calledAce?.revealed;
  }, [calledAce?.revealed, calledAce?.suit, players, addLogEntry]);

  // Detect leaster (phase went to playing with no picker)
  useEffect(() => {
    if (phase === 'playing' && prevPhaseRef.current === 'picking' && pickerPosition === null) {
      setAnnouncement({ type: 'leaster', playerPosition: 0 });
      addLogEntry('Game', 'Leaster - everyone passed!', 'Lowest points wins', false, 'playing');
    }
    prevPhaseRef.current = phase;
  }, [phase, pickerPosition, addLogEntry]);

  // Auto-dismiss announcements
  useEffect(() => {
    if (announcement) {
      const delay = announcement.type === 'call' || announcement.type === 'partnerReveal' || announcement.type === 'leaster' ? 2500 : 2000;
      const timer = setTimeout(() => setAnnouncement(null), delay);
      return () => clearTimeout(timer);
    }
  }, [announcement]);

  // Map store players to GameUI PlayerData format
  const mappedPlayers: PlayerData[] = players.map(p => ({
    position: p.position,
    name: getPlayerDisplayInfo(p.position).name,
    hand: p.hand,
    cardCount: p.hand.length,
    isPicker: p.isPicker,
    isPartner: p.isPartner,
    isDealer: p.position === dealerPosition,
    type: p.type,
  }));

  // Get display name for active human player
  const getActivePlayerName = useCallback(() => {
    const pos = activeHumanPosition ?? 0;
    return getPlayerDisplayInfo(pos as PlayerPosition).name;
  }, [activeHumanPosition]);

  // Wrapped handlers with logging and announcements
  const handlePick = useCallback(() => {
    const pos = activeHumanPosition ?? 0;
    addLogEntry(getActivePlayerName(), 'picked up the blind', '', true, 'picking');
    setAnnouncement({ type: 'pick', playerPosition: pos });
    setTimeout(() => {
      setAnnouncement(null);
      pick();
    }, 1500);
  }, [pick, addLogEntry, getActivePlayerName, activeHumanPosition]);

  const handlePass = useCallback(() => {
    addLogEntry(getActivePlayerName(), 'passed', '', true, 'picking');
    pass();
  }, [pass, addLogEntry, getActivePlayerName]);

  const handleBury = useCallback((cards: [CardType, CardType]) => {
    const pts = cards.reduce((sum, c) => sum + (c.rank === 'A' ? 11 : c.rank === '10' ? 10 : c.rank === 'K' ? 4 : c.rank === 'Q' ? 3 : c.rank === 'J' ? 2 : 0), 0);
    addLogEntry(getActivePlayerName(), `buried 2 cards (${pts} pts)`, '', true, 'burying');

    if (activePlayer) {
      coachingActions.recordBury(activePlayer.hand, cards, calledAce?.suit || null);
    }

    bury(cards);
  }, [bury, addLogEntry, getActivePlayerName, activePlayer, coachingActions, calledAce]);

  const handleCallAce = useCallback((suit: Suit) => {
    const pos = activeHumanPosition ?? 0;
    addLogEntry(getActivePlayerName(), `called ${suit} ace`, '', true, 'calling');
    setAnnouncement({ type: 'call', playerPosition: pos, details: suit });
    setTimeout(() => {
      setAnnouncement(null);
      callAce(suit);
    }, 2500);
  }, [callAce, addLogEntry, getActivePlayerName, activeHumanPosition]);

  const handleGoAlone = useCallback(() => {
    const pos = activeHumanPosition ?? 0;
    addLogEntry(getActivePlayerName(), 'going alone', '', true, 'calling');
    setAnnouncement({ type: 'goAlone', playerPosition: pos });
    setTimeout(() => {
      setAnnouncement(null);
      goAlone();
    }, 2000);
  }, [goAlone, addLogEntry, getActivePlayerName, activeHumanPosition]);

  const handlePlayCard = useCallback((card: CardType) => {
    const playerName = getPlayerDisplayInfo((activeHumanPosition ?? 0) as PlayerPosition).name;

    // Record play for coaching feedback
    if (gameSettings.coachingEnabled && activePlayer) {
      const currentPartnerPos = calledAce?.revealed
        ? players.findIndex(p => p.isPartner)
        : null;

      coachingActions.recordPlay(
        activePlayer.hand,
        card,
        currentTrick,
        calledAce,
        activePlayer.isPicker,
        activePlayer.isPartner,
        pickerPosition,
        activeHumanPosition as PlayerPosition,
        trickNumber,
        currentPartnerPos !== -1 ? currentPartnerPos as PlayerPosition : null
      );
    }

    addLogEntry(playerName, `played ${card.rank} of ${card.suit}`, '', true, 'playing');
    playCard(card);
  }, [activeHumanPosition, gameSettings.coachingEnabled, activePlayer, calledAce, players, coachingActions, currentTrick, pickerPosition, trickNumber, addLogEntry, playCard]);

  // Build GameUIState
  const gameUIState: GameUIState = {
    phase,
    players: mappedPlayers,
    blind,
    currentTrick,
    completedTricks,
    currentPlayer,
    dealerPosition,
    pickerPosition,
    calledAce,
    trickNumber,
    crackState: gameState.crackState,
  };

  // Build GameUIActions
  const gameUIActions: GameUIActions = {
    onPick: handlePick,
    onPass: handlePass,
    onBury: handleBury,
    onCallAce: handleCallAce,
    onGoAlone: handleGoAlone,
    onPlayCard: handlePlayCard,
    onCrack: crack,
    onRecrack: recrack,
    onNoCrack: noCrack,
    onBlitz: blitz,
    onNewGame: newGame,
    onNewHand: newHand,
  };

  // Get current hand score
  const currentHandScore = handHistory.length > 0 ? handHistory[handHistory.length - 1] : null;

  // Find partner position (if revealed)
  const partnerPosition = calledAce?.revealed
    ? players.findIndex(p => p.isPartner)
    : null;

  // Build GameUIConfig
  const gameUIConfig: GameUIConfig = {
    mode: 'local',
    activePlayerPosition: activeHumanPosition ?? 0,

    // Feature toggles
    coachingEnabled: gameSettings.coachingEnabled,
    showStrategyTips: gameSettings.showStrategyTips && isHumanTurn,
    showAIExplanations: gameSettings.showAIExplanations,

    // Scores and history
    playerScores,
    handsPlayed,
    gameLog,
    statistics,
    shuffleSeed: currentShuffleSeed,

    // Helpers
    getLegalPlays: getLegalPlaysForHuman,
    getCallableSuits: getCallableSuitsForPicker,
    canBury: (cards) => {
      if (cards.length !== 2) return { valid: false, reason: 'Select exactly 2 cards' };
      return canBurySelection();
    },
    canBlitz,
    getMultiplier,

    // Trick result
    trickResult,
    onClearTrickResult: clearTrickResult,

    // AI explanations
    lastAIExplanation,
    showExplanation,
    onShowExplanation: lastAIExplanation ? () => showWhyExplanation(lastAIExplanation.playerPosition) : undefined,
    onHideExplanation: hideExplanation,

    // Coaching
    coachingState,
    coachingActions,

    // Hand score
    currentHandScore,

    // Callbacks
    onClearLog: clearLog,
    onResetStatistics: resetStatistics,
    onToggleCoaching: () => updateSettings({ coachingEnabled: !gameSettings.coachingEnabled }),
    onOpenSettings: openSettings,
    onOpenRules: openRules,
    onOpenStrategy: openStrategy,
    onGoHome: goToHome,
  };

  return (
    <>
      <GameUI state={gameUIState} actions={gameUIActions} config={gameUIConfig} />

      {/* Announcement overlay (handled separately for timing control) */}
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
