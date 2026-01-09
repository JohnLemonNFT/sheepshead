'use client';

// ============================================
// SHARED GAME UI COMPONENT
// ============================================
// Used by both local (vs AI) and online (vs humans) modes
// All game rendering logic in one place - update once, works everywhere

import { useState, useEffect, useCallback } from 'react';
import { Card } from './Card';
import { GameControls } from './GameControls';
import { HandSummary } from './HandSummary';
import { InfoDrawer } from './InfoDrawer';
import { Announcement } from './Announcement';
import { ExplanationModal } from './ExplanationModal';
import { SuitHint } from './SuitHint';
import { CalledAceBadge } from './CalledAceIndicator';
import { CoachingToast, HandSummaryModal } from './CoachingToast';
import type { Card as CardType, PlayerPosition, Suit, GamePhase, Trick } from '../game/types';
import { getCardPoints, isTrump } from '../game/types';
import { getPlayerDisplayInfo } from '../game/ai/personalities';
import type { CoachingFeedback, HandSummary as CoachingHandSummary } from '../game/ai/coaching';
import type { LogEntry } from './GameLog';
import type { GameStatistics } from '../store/gameStore';

// ============================================
// TYPES
// ============================================

export interface PlayerData {
  position: PlayerPosition;
  name: string;
  hand: CardType[];
  cardCount: number;
  isPicker: boolean;
  isPartner: boolean;
  isDealer: boolean;
  type: 'human' | 'ai';
  connected?: boolean; // For online mode
}

export interface GameUIState {
  phase: GamePhase;
  players: PlayerData[];
  blind: CardType[] | number; // Cards for local, count for online
  currentTrick: Trick;
  completedTricks: Trick[];
  currentPlayer: PlayerPosition;
  dealerPosition: PlayerPosition;
  pickerPosition: PlayerPosition | null;
  calledAce: { suit: Suit; revealed: boolean } | null;
  trickNumber: number;
  crackState?: { cracked: boolean; recracked: boolean };
}

export interface GameUIActions {
  onPick: () => void;
  onPass: () => void;
  onBury: (cards: [CardType, CardType]) => void;
  onCallAce: (suit: Suit) => void;
  onGoAlone: () => void;
  onPlayCard: (card: CardType) => void;
  onCrack?: () => void;
  onRecrack?: () => void;
  onNoCrack?: () => void;
  onBlitz?: () => void;
  onNewGame?: () => void;
  onNewHand?: () => void;
  onLeaveGame?: () => void;
  onOpenMenu?: () => void;
}

export interface GameUIConfig {
  // Mode identification
  mode: 'local' | 'online';
  roomCode?: string;

  // Active player (whose perspective we're showing)
  activePlayerPosition: PlayerPosition;

  // Feature toggles
  coachingEnabled?: boolean;
  showStrategyTips?: boolean;
  showAIExplanations?: boolean;

  // Scores and history
  playerScores: number[];
  handsPlayed: number;
  gameLog: LogEntry[];
  statistics?: GameStatistics;
  shuffleSeed?: string | null;

  // Helpers
  getLegalPlays: () => CardType[];
  getCallableSuits: () => Suit[];
  canBury: (cards: CardType[]) => { valid: boolean; reason?: string };
  canBlitz?: () => boolean;
  getMultiplier?: () => number;

  // Trick result (when a trick is won)
  trickResult?: { winner: PlayerPosition; points: number } | null;
  onClearTrickResult?: () => void;

  // AI explanations (local mode)
  lastAIExplanation?: {
    playerPosition: PlayerPosition;
    action: string;
    reason: string;
    detailedExplanation?: string;
  } | null;
  onShowExplanation?: () => void;
  onHideExplanation?: () => void;
  showExplanation?: boolean;

  // Coaching (local mode with AI)
  coachingState?: {
    currentWarning: CoachingFeedback | null;
    recentFeedback: CoachingFeedback[];
  };
  coachingActions?: {
    checkBury: (hand: CardType[], cards: [CardType, CardType], intendedSuit: Suit | null) => CoachingFeedback | null;
    recordPlay: (...args: any[]) => void;
    recordBury: (...args: any[]) => void;
    dismissWarning: () => void;
    clearRecentFeedback: () => void;
    getHandSummary: () => CoachingHandSummary;
    clearHandFeedback: () => void;
  };

  // Hand score (end of hand)
  currentHandScore?: any;

  // Callbacks
  onClearLog?: () => void;
  onResetStatistics?: () => void;
  onToggleCoaching?: () => void;
  onOpenSettings?: () => void;
  onOpenRules?: () => void;
  onOpenStrategy?: () => void;
  onGoHome?: () => void;
}

export interface GameUIProps {
  state: GameUIState;
  actions: GameUIActions;
  config: GameUIConfig;
}

// ============================================
// COMPONENT
// ============================================

export function GameUI({ state, actions, config }: GameUIProps) {
  const {
    phase,
    players,
    blind,
    currentTrick,
    completedTricks,
    currentPlayer,
    dealerPosition,
    pickerPosition,
    calledAce,
    trickNumber,
    crackState,
  } = state;

  const {
    mode,
    roomCode,
    activePlayerPosition,
    coachingEnabled,
    showStrategyTips,
    playerScores,
    handsPlayed,
    gameLog,
    statistics,
    shuffleSeed,
    getLegalPlays,
    getCallableSuits,
    canBury,
    canBlitz,
    getMultiplier,
    trickResult,
    onClearTrickResult,
    lastAIExplanation,
    showExplanation,
    coachingState,
    coachingActions,
    currentHandScore,
    onClearLog,
    onResetStatistics,
    onToggleCoaching,
    onOpenSettings,
    onOpenRules,
    onOpenStrategy,
    onGoHome,
  } = config;

  // Local state
  const [selectedCards, setSelectedCards] = useState<CardType[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [isPlayingCard, setIsPlayingCard] = useState(false);
  const [announcement, setAnnouncement] = useState<{
    type: 'pick' | 'call' | 'goAlone' | 'partnerReveal';
    playerPosition: number;
    details?: string;
  } | null>(null);
  const [showCoachingSummary, setShowCoachingSummary] = useState(false);
  const [summaryShownForHand, setSummaryShownForHand] = useState(-1);
  const [pendingBury, setPendingBury] = useState<[CardType, CardType] | null>(null);

  // Active player data
  const activePlayer = players.find(p => p.position === activePlayerPosition) || null;
  const isMyTurn = currentPlayer === activePlayerPosition;
  const isHumanTurn = isMyTurn && activePlayer?.type === 'human';

  // Computed values
  const legalPlays = phase === 'playing' && isHumanTurn ? getLegalPlays() : [];
  const callableSuits = phase === 'calling' && isHumanTurn ? getCallableSuits() : [];
  const buryValidation = canBury(selectedCards);
  const multiplier = getMultiplier?.() ?? 1;

  // Find partner position (if revealed)
  const partnerPosition = calledAce?.revealed
    ? players.findIndex(p => p.isPartner)
    : null;

  // Determine active player's role
  const getActivePlayerRole = (): 'picker' | 'partner' | 'defender' | null => {
    if (pickerPosition === null) return null;
    if (activePlayer?.isPicker) return 'picker';
    if (activePlayer?.isPartner) return 'partner';
    return 'defender';
  };
  const activePlayerRole = getActivePlayerRole();

  // Helper to get player name from state (uses actual names in online mode)
  const getPlayerName = useCallback((position: PlayerPosition): string => {
    const player = players.find(p => p.position === position);
    return player?.name || getPlayerDisplayInfo(position).name;
  }, [players]);

  // Array of player names for passing to child components
  const playerNames = players.map(p => p.name);

  // Reset play lock when turn changes
  useEffect(() => {
    if (isHumanTurn) {
      setIsPlayingCard(false);
    }
  }, [currentPlayer, isHumanTurn, trickNumber]);

  // Auto-clear trick result
  useEffect(() => {
    if (trickResult && onClearTrickResult) {
      const timer = setTimeout(onClearTrickResult, 2000);
      return () => clearTimeout(timer);
    }
  }, [trickResult, onClearTrickResult]);

  // Show coaching summary at end of hand
  useEffect(() => {
    if (phase === 'scoring' && coachingEnabled && coachingActions && summaryShownForHand !== handsPlayed) {
      const summary = coachingActions.getHandSummary();
      if (summary.goodPlays.length > 0 || summary.mistakes.length > 0) {
        setSummaryShownForHand(handsPlayed);
        const timer = setTimeout(() => setShowCoachingSummary(true), 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [phase, coachingEnabled, handsPlayed, summaryShownForHand, coachingActions]);

  // Clear coaching on new hand
  useEffect(() => {
    if (phase === 'dealing' && coachingActions) {
      coachingActions.clearHandFeedback();
      setShowCoachingSummary(false);
    }
  }, [phase, coachingActions]);

  // Handle card click
  const handleCardClick = useCallback((card: CardType) => {
    if (!isHumanTurn) return;

    if (phase === 'burying') {
      setSelectedCards(prev => {
        const isSelected = prev.some(c => c.id === card.id);
        if (isSelected) return prev.filter(c => c.id !== card.id);
        if (prev.length < 2) return [...prev, card];
        return prev;
      });
    } else if (phase === 'playing') {
      if (isPlayingCard) return;
      if (legalPlays.some(c => c.id === card.id)) {
        setIsPlayingCard(true);
        actions.onPlayCard(card);
      }
    }
  }, [phase, isHumanTurn, legalPlays, isPlayingCard, actions]);

  // Handle bury
  const handleBury = useCallback(() => {
    if (selectedCards.length !== 2) return;
    const cardsToBury = selectedCards as [CardType, CardType];

    // Check for coaching warning
    if (coachingEnabled && coachingActions && activePlayer) {
      const failSuits: Suit[] = ['clubs', 'spades', 'hearts'];
      const intendedCallSuit = failSuits.find(suit => {
        const suitCards = activePlayer.hand.filter(c => c.suit === suit && c.rank !== 'Q' && c.rank !== 'J');
        const buryingSuit = cardsToBury.filter(c => c.suit === suit && c.rank !== 'Q' && c.rank !== 'J');
        return suitCards.length > buryingSuit.length && !suitCards.some(c => c.rank === 'A');
      }) || null;

      const warning = coachingActions.checkBury(activePlayer.hand, cardsToBury, intendedCallSuit);
      if (warning) {
        setPendingBury(cardsToBury);
        return;
      }
    }

    actions.onBury(cardsToBury);
    setSelectedCards([]);
  }, [selectedCards, coachingEnabled, coachingActions, activePlayer, actions]);

  // Execute pending bury (after dismissing warning)
  const executePendingBury = useCallback(() => {
    if (pendingBury) {
      actions.onBury(pendingBury);
      setSelectedCards([]);
      setPendingBury(null);
    }
  }, [pendingBury, actions]);

  // Handle pick with announcement
  const handlePick = useCallback(() => {
    setAnnouncement({ type: 'pick', playerPosition: activePlayerPosition });
    setTimeout(() => {
      setAnnouncement(null);
      actions.onPick();
    }, 1500);
  }, [actions, activePlayerPosition]);

  // Handle call ace with announcement
  const handleCallAce = useCallback((suit: Suit) => {
    setAnnouncement({ type: 'call', playerPosition: activePlayerPosition, details: suit });
    setTimeout(() => {
      setAnnouncement(null);
      actions.onCallAce(suit);
    }, 2500);
  }, [actions, activePlayerPosition]);

  // Handle go alone with announcement
  const handleGoAlone = useCallback(() => {
    setAnnouncement({ type: 'goAlone', playerPosition: activePlayerPosition });
    setTimeout(() => {
      setAnnouncement(null);
      actions.onGoAlone();
    }, 2000);
  }, [actions, activePlayerPosition]);

  // Get relative position for opponent rendering
  const getPlayerByRelPos = (relPos: number) => {
    const absPos = (activePlayerPosition + relPos) % 5;
    return players.find(p => p.position === absPos);
  };

  // Render opponent avatar
  const renderOpponent = (relPos: number, positionClass: string) => {
    const player = getPlayerByRelPos(relPos);
    if (!player) return null;

    const isDealer = player.position === dealerPosition;
    const isCurrent = player.position === currentPlayer;
    const isPicker = player.isPicker;
    // Only show partner for OTHER players when revealed
    const isPartnerRevealed = player.position !== activePlayerPosition && player.isPartner && calledAce?.revealed;
    const displayInfo = getPlayerDisplayInfo(player.position);

    return (
      <div className={`absolute ${positionClass} flex flex-col items-center z-10`}>
        <div className={`
          relative w-12 h-12 sm:w-14 sm:h-14 rounded-full border-3
          flex items-center justify-center text-2xl sm:text-3xl
          bg-gray-800 shadow-lg transition-all duration-300
          ${isCurrent ? 'border-blue-400 animate-active-turn' : ''}
          ${isPicker && !isCurrent ? 'border-yellow-400 animate-picker-glow' : ''}
          ${isPartnerRevealed && !isCurrent ? 'border-green-400 shadow-green-400/50' : ''}
          ${!isCurrent && !isPicker && !isPartnerRevealed ? 'border-gray-600' : ''}
        `}>
          {displayInfo.avatar}
          {isDealer && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white border-2 border-gray-800 rounded-full flex items-center justify-center text-[10px] font-black text-gray-800">
              D
            </div>
          )}
          {isPicker && (
            <div className="absolute -top-2 -right-2 text-lg">👑</div>
          )}
          {isPartnerRevealed && (
            <div className="absolute -top-2 -right-2 text-sm">🤝</div>
          )}
          {/* Online: show disconnected indicator */}
          {mode === 'online' && player.connected === false && (
            <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[8px]">
              ⚡
            </div>
          )}
        </div>
        <span className={`mt-1 text-xs sm:text-sm font-medium ${
          isPicker ? 'text-yellow-400' :
          isPartnerRevealed ? 'text-green-400' :
          isCurrent ? 'text-blue-400' : 'text-gray-300'
        }`}>
          {player.name}
        </span>
        {mode === 'online' && (
          <span className="text-[10px] text-gray-500">{player.cardCount} cards</span>
        )}
      </div>
    );
  };

  // Calculate running scores
  const actualPartnerPosition = players.findIndex(p => p.isPartner);
  const pickerTeamPoints = completedTricks.reduce((sum, t) => {
    const trickPoints = t.cards.reduce((pts, c) => pts + getCardPoints(c.card), 0);
    const winnerOnPickerTeam = t.winningPlayer === pickerPosition ||
      (actualPartnerPosition !== -1 && t.winningPlayer === actualPartnerPosition);
    return sum + (winnerOnPickerTeam ? trickPoints : 0);
  }, 0);
  const defenderTeamPoints = completedTricks.reduce((sum, t) => {
    const trickPoints = t.cards.reduce((pts, c) => pts + getCardPoints(c.card), 0);
    const winnerOnPickerTeam = t.winningPlayer === pickerPosition ||
      (actualPartnerPosition !== -1 && t.winningPlayer === actualPartnerPosition);
    return sum + (winnerOnPickerTeam ? 0 : trickPoints);
  }, 0);

  // Blind count for display
  const blindCount = typeof blind === 'number' ? blind : blind.length;

  return (
    <div className="min-h-screen text-white bg-felt-table relative overflow-hidden">
      {/* Vignette overlay */}
      <div className="absolute inset-0 felt-vignette pointer-events-none" />

      {/* Header */}
      <div className="relative z-20 flex justify-between items-center p-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="bg-black/40 hover:bg-black/60 text-white p-2 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Online mode: show room code */}
          {mode === 'online' && roomCode && (
            <span className="text-xs text-green-300 bg-green-900/50 px-2 py-0.5 rounded">
              Online: {roomCode}
            </span>
          )}

          {/* Coaching toggle (if available) */}
          {onToggleCoaching && (
            <button
              onClick={onToggleCoaching}
              className={`
                flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all
                ${coachingEnabled
                  ? 'bg-green-600/80 text-white'
                  : 'bg-black/40 text-gray-400 hover:bg-black/60'}
              `}
            >
              <span>🎓</span>
              <span className="hidden sm:inline">{coachingEnabled ? 'Coach ON' : 'Coach OFF'}</span>
            </button>
          )}
        </div>

        {showMenu && (
          <div className="absolute left-2 top-12 bg-gray-900/95 rounded-lg shadow-xl py-1 z-50 w-40 border border-gray-700">
            {onGoHome && (
              <button onClick={() => { onGoHome(); setShowMenu(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-700 text-white text-sm">Home</button>
            )}
            {actions.onNewGame && (
              <button onClick={() => { actions.onNewGame?.(); setShowMenu(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-700 text-white text-sm">New Game</button>
            )}
            {actions.onLeaveGame && (
              <button onClick={() => { actions.onLeaveGame?.(); setShowMenu(false); }} className="w-full text-left px-3 py-2 hover:bg-red-700 text-red-400 hover:text-white text-sm">Leave Game</button>
            )}
            <hr className="border-gray-700 my-1" />
            {onOpenRules && (
              <button onClick={() => { onOpenRules(); setShowMenu(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-700 text-white text-sm">Rules</button>
            )}
            {onOpenStrategy && (
              <button onClick={() => { onOpenStrategy(); setShowMenu(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-700 text-white text-sm">Strategy</button>
            )}
            {onOpenSettings && (
              <button onClick={() => { onOpenSettings(); setShowMenu(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-700 text-white text-sm">Settings</button>
            )}
          </div>
        )}

        {/* Status badges */}
        <div className="flex gap-2 flex-wrap justify-end">
          {pickerPosition !== null && activePlayerRole && (
            <span className={`px-2 py-1 rounded text-xs font-bold ${
              activePlayerRole === 'picker' ? 'bg-yellow-600' :
              activePlayerRole === 'partner' ? 'bg-blue-600' : 'bg-red-700'
            }`}>
              {activePlayerRole === 'picker' ? '👑 PICKER' :
               activePlayerRole === 'partner' ? '🤝 PARTNER' : '⚔️ DEFENDER'}
            </span>
          )}
          {phase === 'playing' && (
            <span className="bg-black/40 px-2 py-1 rounded text-xs">
              Trick {trickNumber}/6
            </span>
          )}
          {calledAce && (
            <CalledAceBadge suit={calledAce.suit} revealed={calledAce.revealed} />
          )}
        </div>
      </div>

      {/* Main game area */}
      <div className="relative z-10 h-[calc(100vh-52px)] flex flex-col">
        {/* Top section - opponents and center */}
        <div className="flex-1 relative min-h-0">
          {/* Opponent positions */}
          {renderOpponent(1, 'left-4 sm:left-8 top-1/2 -translate-y-1/2')}
          {renderOpponent(2, 'left-1/4 top-4 sm:top-8 -translate-x-1/2')}
          {renderOpponent(3, 'right-1/4 top-4 sm:top-8 translate-x-1/2')}
          {renderOpponent(4, 'right-4 sm:right-8 top-1/2 -translate-y-1/2')}

          {/* Center game area */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 max-w-lg px-4">
              {/* Running score - only after partner revealed */}
              {phase === 'playing' && pickerPosition !== null && calledAce?.revealed && (
                <div className="flex gap-2">
                  <span className="bg-yellow-700/90 px-3 py-1 rounded-full text-sm font-bold">
                    👑 {pickerTeamPoints}/61
                  </span>
                  <span className="bg-red-700/90 px-3 py-1 rounded-full text-sm font-bold">
                    ⚔️ {defenderTeamPoints}/60
                  </span>
                </div>
              )}

              {/* Blind - picking phase */}
              {phase === 'picking' && blindCount > 0 && (
                <div className="text-center">
                  <p className="text-white/80 text-lg mb-3 font-medium">
                    {isMyTurn ? 'Pick up the blind?' : `${getPlayerName(currentPlayer)} is deciding...`}
                  </p>
                  <div className="flex justify-center gap-2">
                    {Array.from({ length: blindCount }).map((_, i) => (
                      <div key={i} className="w-14 h-20 sm:w-16 sm:h-24 bg-gradient-to-br from-blue-700 to-blue-900 rounded-lg border-2 border-blue-500 flex items-center justify-center shadow-xl animate-card-slide-in">
                        <span className="text-blue-300 text-xl">🐑</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cracking phase */}
              {phase === 'cracking' && (
                <div className="text-center">
                  <div className="bg-red-900/60 border border-red-500 rounded-lg px-4 py-3 inline-block">
                    <p className="text-red-300 text-lg font-bold mb-1">
                      {crackState?.cracked ? 'Cracked!' : 'Cracking Round'}
                    </p>
                    <p className="text-white/80 text-sm">
                      {crackState?.cracked
                        ? `Stakes doubled! (${multiplier}x)`
                        : 'Defenders can double the stakes'}
                    </p>
                  </div>
                </div>
              )}

              {/* Calling phase */}
              {phase === 'calling' && (
                <div className="text-center">
                  <p className="text-white/80 text-lg mb-2 font-medium">
                    {isMyTurn ? 'Call an Ace for your partner' : `${getPlayerName(currentPlayer)} is calling...`}
                  </p>
                </div>
              )}

              {/* Current trick */}
              {phase === 'playing' && (
                <div className="flex flex-col items-center min-h-[100px] sm:min-h-[120px]">
                  {currentTrick.cards.length === 0 ? (
                    <span className="text-white/40 text-lg">
                      {isMyTurn ? 'Lead a card' : 'Waiting...'}
                    </span>
                  ) : (
                    <div className="flex gap-2 sm:gap-3 items-end justify-center">
                      {currentTrick.cards.map((play, i) => {
                        const isWinner = trickResult && play.playedBy === trickResult.winner;
                        const isLastPlayed = i === currentTrick.cards.length - 1;
                        return (
                          <div key={i} className={`relative flex flex-col items-center animate-card-slide-in ${isWinner ? 'scale-110' : ''}`}>
                            {isLastPlayed && !trickResult && (
                              <div className="absolute -inset-1 bg-yellow-400/20 rounded-lg animate-pulse" />
                            )}
                            <Card card={play.card} size="large" />
                            <span className={`text-xs mt-1 ${isWinner ? 'text-green-400 font-bold' : 'text-white/70'}`}>
                              {play.playedBy === activePlayerPosition ? 'You' : getPlayerName(play.playedBy as PlayerPosition)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Trick winner announcement */}
              {trickResult && (
                <div className="bg-gradient-to-r from-yellow-500 to-amber-600 px-6 py-3 rounded-xl shadow-2xl animate-trick-winner">
                  <div className="text-center">
                    <div className="text-white text-xl font-bold">
                      {getPlayerName(trickResult.winner)}
                    </div>
                    <div className="text-yellow-100">🏆 +{trickResult.points} points</div>
                  </div>
                </div>
              )}

              {/* Hand summary */}
              {phase === 'scoring' && currentHandScore && (
                <HandSummary
                  score={currentHandScore}
                  pickerPosition={pickerPosition}
                  partnerPosition={partnerPosition !== -1 ? partnerPosition as PlayerPosition : null}
                  calledSuit={calledAce?.suit || null}
                  onClose={() => {}}
                  playerNames={playerNames}
                  activeHumanPosition={activePlayerPosition}
                />
              )}
            </div>
          </div>
        </div>

        {/* Game Controls */}
        <div className="relative z-20 px-4 py-2">
          <GameControls
            phase={phase}
            isHumanTurn={isHumanTurn}
            onPick={handlePick}
            onPass={actions.onPass}
            onCrack={actions.onCrack}
            onRecrack={actions.onRecrack}
            onNoCrack={actions.onNoCrack}
            onBlitz={actions.onBlitz}
            onBury={handleBury}
            onCallAce={handleCallAce}
            onGoAlone={handleGoAlone}
            onNewGame={actions.onNewGame || (() => {})}
            onPlayAgain={actions.onNewHand || (() => {})}
            callableSuits={callableSuits}
            canBury={buryValidation.valid && selectedCards.length === 2}
            buryReason={buryValidation.reason}
            selectedCount={selectedCards.length}
            canBlitz={canBlitz?.() ?? false}
            isCracked={crackState?.cracked ?? false}
            isPicker={activePlayer?.isPicker ?? false}
            multiplier={multiplier}
          />
        </div>

        {/* Your Hand */}
        {activePlayer && (
          <div className="relative z-20 pb-4">
            {isHumanTurn && phase === 'burying' && (
              <div className="text-center mb-2 text-base sm:text-lg text-yellow-400 font-medium">
                Select 2 cards to bury
              </div>
            )}

            {/* Suit hint */}
            {phase === 'playing' && isHumanTurn && currentTrick.cards.length > 0 && (
              <div className="mb-2 px-4">
                <SuitHint
                  trickCards={currentTrick.cards}
                  legalPlays={legalPlays}
                  hand={activePlayer.hand}
                  isYourTurn={isHumanTurn}
                />
              </div>
            )}

            {/* Curved card fan */}
            <div className="flex justify-center items-end px-2">
              {activePlayer.hand.map((card, index) => {
                const totalCards = activePlayer.hand.length;
                const middleIndex = (totalCards - 1) / 2;
                const offset = index - middleIndex;
                const rotation = offset * 4;
                const translateY = Math.abs(offset) * 8;
                const isLegal = legalPlays.some(c => c.id === card.id);
                const isSelected = selectedCards.some(c => c.id === card.id);

                return (
                  <div
                    key={card.id}
                    onClick={() => handleCardClick(card)}
                    className={`
                      transition-all duration-300 ease-out cursor-pointer
                      hover:-translate-y-6 hover:scale-110 hover:z-50
                      ${phase === 'playing' && isHumanTurn && !isLegal ? 'opacity-40 cursor-not-allowed hover:translate-y-0 hover:scale-100' : ''}
                      ${isSelected ? '-translate-y-8 scale-110 z-40' : ''}
                    `}
                    style={{
                      transform: `translateY(${isSelected ? -32 : translateY}px) rotate(${rotation}deg)`,
                      marginLeft: index === 0 ? 0 : '-12px',
                      zIndex: isSelected ? 40 : index,
                    }}
                  >
                    <Card
                      card={card}
                      size="xlarge"
                      highlight={phase === 'playing' && isHumanTurn && isLegal}
                      selected={isSelected}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Info Drawer */}
      <InfoDrawer
        scores={playerScores}
        pickerPosition={pickerPosition}
        partnerPosition={partnerPosition !== -1 ? partnerPosition as PlayerPosition : null}
        currentPlayer={currentPlayer}
        handsPlayed={handsPlayed}
        playerNames={playerNames}
        showTips={(showStrategyTips ?? false) && isHumanTurn}
        phase={phase}
        hand={activePlayer?.hand || []}
        isPicker={activePlayer?.isPicker || false}
        isPartner={activePlayer?.isPartner || false}
        currentTrick={currentTrick}
        calledAce={calledAce}
        gameLog={gameLog}
        onClearLog={onClearLog || (() => {})}
        showAIExplanation={mode === 'local' && !!lastAIExplanation && phase === 'playing'}
        onShowExplanation={config.onShowExplanation}
        lastAIPlayerName={lastAIExplanation ? getPlayerName(lastAIExplanation.playerPosition) : undefined}
        statistics={statistics}
        shuffleSeed={shuffleSeed}
        onResetStatistics={onResetStatistics}
      />

      {/* Explanation modal (local mode) */}
      {showExplanation && lastAIExplanation && (
        <ExplanationModal
          playerPosition={lastAIExplanation.playerPosition}
          action={lastAIExplanation.action}
          reason={lastAIExplanation.reason}
          detailedExplanation={lastAIExplanation.detailedExplanation || ''}
          onClose={config.onHideExplanation || (() => {})}
        />
      )}

      {/* Announcement overlay */}
      {announcement && (
        <Announcement
          type={announcement.type}
          playerPosition={announcement.playerPosition}
          details={announcement.details}
        />
      )}

      {/* Coaching warnings and feedback */}
      {coachingState?.currentWarning && coachingActions && (
        <CoachingToast
          feedback={coachingState.currentWarning}
          isWarning={true}
          onDismiss={() => {
            coachingActions.dismissWarning();
            setPendingBury(null);
          }}
          onProceedAnyway={() => {
            coachingActions.dismissWarning();
            executePendingBury();
          }}
        />
      )}

      {coachingState && coachingState.recentFeedback.length > 0 && !coachingState.currentWarning && coachingActions && (
        <CoachingToast
          feedback={coachingState.recentFeedback[0]}
          onDismiss={() => coachingActions.clearRecentFeedback()}
        />
      )}

      {showCoachingSummary && coachingActions && (
        <HandSummaryModal
          summary={coachingActions.getHandSummary()}
          onClose={() => setShowCoachingSummary(false)}
        />
      )}
    </div>
  );
}
