// Main App component - Sheepshead game

import { useEffect, useCallback, useState } from 'react';
import { useGameStore, SPEED_DELAYS } from './store/gameStore';
import {
  Card,
  ScoreBoard,
  GameControls,
  HandSummary,
  ExplanationModal,
  GameLog,
  StrategyTips,
  Announcement,
  HomePage,
  GameSetup,
  PlayerHandoff,
  SettingsModal,
  RulesModal,
  StrategyModal,
  OnlineLobby,
  OnlineWaitingRoom,
  OnlineGame,
  InfoDrawer,
} from './components';
import { CoachingToast, HandSummaryModal } from './components/CoachingToast';
import { Tutorial } from './tutorial';
import { useOnlineGame } from './hooks/useOnlineGame';
import { useCoaching } from './hooks/useCoaching';
import { useSounds, playSoundEffect } from './hooks/useSounds';
import { Card as CardType, PlayerPosition, Suit, getCardPoints } from './game/types';
import { RunningScore } from './components/RunningScore';
import { SuitHint } from './components/SuitHint';
import { CalledAceBadge } from './components/CalledAceIndicator';
import type { CoachingFeedback } from './game/ai/coaching';
import { getPlayerDisplayInfo } from './game/ai/personalities';

function App() {
  const {
    gameState,
    gameSettings,
    playerTypes,
    awaitingHandoff,
    activeHumanPosition,
    currentView,
    showSettingsModal,
    showRulesModal,
    showStrategyModal,
    showTutorial,
    closeTutorial,
    selectedCards,
    lastAIExplanation,
    showExplanation,
    playerScores,
    handsPlayed,
    handHistory,
    gameLog,
    trickResult,
    goToHome,
    goToOnlineWaiting,
    goToOnlineGame,
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
    clearSelection,
    showWhyExplanation,
    hideExplanation,
    addLogEntry,
    clearLog,
    executeAITurn,
    isAITurn,
    getLegalPlaysForHuman,
    getCallableSuitsForPicker,
    canBurySelection,
    canBlitz,
    getMultiplier,
    openSettings,
    openRules,
    openStrategy,
    isHotseatMode,
    updateSettings,
  } = useGameStore();

  // Online game state
  const [onlineState, onlineActions] = useOnlineGame();

  // Coaching system
  const [coachingState, coachingActions] = useCoaching();
  const [pendingBury, setPendingBury] = useState<[CardType, CardType] | null>(null);
  const [pendingPlay, setPendingPlay] = useState<CardType | null>(null);
  const [showCoachingSummary, setShowCoachingSummary] = useState(false);

  // Sync coaching enabled state with settings
  useEffect(() => {
    coachingActions.setEnabled(gameSettings.coachingEnabled);
  }, [gameSettings.coachingEnabled, coachingActions]);

  // Sound system
  useSounds();

  // Watch for online state changes to transition views
  useEffect(() => {
    // When room is created/joined, go to waiting room
    if (onlineState.roomCode && !onlineState.gameStarted && currentView === 'online') {
      goToOnlineWaiting();
    }
    // When game starts, go to online game view
    if (onlineState.gameStarted && currentView === 'onlineWaiting') {
      goToOnlineGame();
    }
    // When left room, go back to home
    if (!onlineState.roomCode && (currentView === 'onlineWaiting' || currentView === 'onlineGame')) {
      goToHome();
    }
  }, [onlineState.roomCode, onlineState.gameStarted, currentView, goToOnlineWaiting, goToOnlineGame, goToHome]);

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

  // Announcement state
  const [announcement, setAnnouncement] = useState<{
    type: 'pick' | 'call' | 'goAlone' | 'partnerReveal';
    playerPosition: number;
    details?: string;
  } | null>(null);

  // Menu dropdown state
  const [showMenu, setShowMenu] = useState(false);

  // Prevent double card plays
  const [isPlayingCard, setIsPlayingCard] = useState(false);

  // Auto-clear trick result after delay and show coaching feedback
  useEffect(() => {
    if (trickResult) {
      const timer = setTimeout(() => {
        clearTrickResult();
      }, 2000); // Show completed trick for 2 seconds
      return () => clearTimeout(timer);
    }
  }, [trickResult, clearTrickResult]);

  // Track if we've shown summary for current hand to prevent re-showing
  const [summaryShownForHand, setSummaryShownForHand] = useState(-1);

  // Show coaching summary at end of hand
  useEffect(() => {
    // Only show once per hand - check if we already showed for this hand
    if (phase === 'scoring' && gameSettings.coachingEnabled && summaryShownForHand !== handsPlayed) {
      const summary = coachingActions.getHandSummary();
      if (summary.goodPlays.length > 0 || summary.mistakes.length > 0) {
        // Mark this hand as having shown the summary
        setSummaryShownForHand(handsPlayed);
        // Delay slightly so hand result shows first
        const timer = setTimeout(() => {
          setShowCoachingSummary(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [phase, gameSettings.showStrategyTips, handsPlayed, summaryShownForHand]);

  // Clear coaching feedback when starting new hand
  useEffect(() => {
    if (phase === 'dealing') {
      coachingActions.clearHandFeedback();
      setShowCoachingSummary(false);
    }
  }, [phase, coachingActions]);

  // Execute AI turns automatically (using game speed from settings)
  useEffect(() => {
    // Only run during game view
    if (currentView !== 'game') return;

    // Don't execute AI turns while announcement or trick result is showing
    if (announcement || trickResult) return;

    // Check if it's an AI player's turn (and not awaiting handoff)
    const currentPlayerData = players[currentPlayer];
    const shouldAIPlay = currentPlayerData?.type === 'ai' &&
                         phase !== 'dealing' &&
                         phase !== 'scoring' &&
                         phase !== 'gameOver' &&
                         !awaitingHandoff;

    if (shouldAIPlay) {
      const delay = SPEED_DELAYS[gameSettings.gameSpeed];
      const timer = setTimeout(() => {
        executeAITurn();
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, phase, players, trickNumber, currentTrick.cards.length, executeAITurn, announcement, trickResult, currentView, gameSettings.gameSpeed, awaitingHandoff]);

  // Determine if current player is human and active (for hotseat)
  const isCurrentPlayerHuman = playerTypes[currentPlayer] === 'human';
  const isHumanTurn = isCurrentPlayerHuman && activeHumanPosition === currentPlayer;

  // Reset play lock when turn changes back to human or new trick starts
  useEffect(() => {
    if (isHumanTurn) {
      setIsPlayingCard(false);
    }
  }, [currentPlayer, isHumanTurn, trickNumber]);

  // The active human player (whose hand is shown)
  const activePlayer = activeHumanPosition !== null ? players[activeHumanPosition] : null;

  // Get legal plays for active human
  const legalPlays = phase === 'playing' && isHumanTurn ? getLegalPlaysForHuman() : [];

  // Handle card click based on phase
  const handleCardClick = useCallback(
    (card: CardType) => {
      if (!isHumanTurn) return;
      const playerName = activeHumanPosition === 0 ? 'You' : `Player ${activeHumanPosition! + 1}`;

      if (phase === 'burying') {
        toggleCardSelection(card);
      } else if (phase === 'playing') {
        // Prevent double-plays while processing
        if (isPlayingCard) return;

        if (legalPlays.some(c => c.id === card.id)) {
          setIsPlayingCard(true);

          // Record play for coaching feedback
          if (gameSettings.coachingEnabled && activePlayer) {
            // Find partner position for accurate team detection
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
        }
      }
    },
    [phase, isHumanTurn, activeHumanPosition, legalPlays, toggleCardSelection, playCard, addLogEntry, gameSettings.showStrategyTips, activePlayer, coachingActions, currentTrick, calledAce, pickerPosition, trickNumber, isPlayingCard]
  );

  // Get display name for active human player
  const getActivePlayerName = useCallback(() => {
    return activeHumanPosition === 0 ? 'You' : `Player ${activeHumanPosition! + 1}`;
  }, [activeHumanPosition]);

  // Handle bury confirmation with coaching check
  const handleBury = useCallback(() => {
    if (selectedCards.length === 2) {
      const cardsToBury = selectedCards as [CardType, CardType];

      // Check for coaching warnings before burying
      if (gameSettings.coachingEnabled && activePlayer) {
        // Determine intended call suit (first fail suit we have cards in that we're not burying)
        const failSuits: Suit[] = ['clubs', 'spades', 'hearts'];
        const intendedCallSuit = failSuits.find(suit => {
          const suitCards = activePlayer.hand.filter(c => c.suit === suit && c.rank !== 'Q' && c.rank !== 'J');
          const buryingSuit = cardsToBury.filter(c => c.suit === suit && c.rank !== 'Q' && c.rank !== 'J');
          return suitCards.length > buryingSuit.length && !suitCards.some(c => c.rank === 'A');
        }) || null;

        const warning = coachingActions.checkBury(activePlayer.hand, cardsToBury, intendedCallSuit);
        if (warning) {
          setPendingBury(cardsToBury);
          return; // Wait for user to dismiss or proceed
        }
      }

      // No warning, proceed with bury
      executeBury(cardsToBury);
    }
  }, [selectedCards, activePlayer, gameSettings.showStrategyTips, coachingActions]);

  // Execute the actual bury action
  const executeBury = useCallback((cardsToBury: [CardType, CardType]) => {
    const pts = cardsToBury.reduce((sum, c) => sum + (c.rank === 'A' ? 11 : c.rank === '10' ? 10 : c.rank === 'K' ? 4 : c.rank === 'Q' ? 3 : c.rank === 'J' ? 2 : 0), 0);
    addLogEntry(getActivePlayerName(), `buried 2 cards (${pts} pts)`, '', true, 'burying');

    // Record for coaching feedback
    if (activePlayer) {
      coachingActions.recordBury(activePlayer.hand, cardsToBury, calledAce?.suit || null);
    }

    bury(cardsToBury);
    setPendingBury(null);
  }, [bury, addLogEntry, getActivePlayerName, activePlayer, coachingActions, calledAce]);

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

  const handleCallAce = useCallback((suit: string) => {
    const pos = activeHumanPosition ?? 0;
    addLogEntry(getActivePlayerName(), `called ${suit} ace`, '', true, 'calling');
    setAnnouncement({ type: 'call', playerPosition: pos, details: suit });
    setTimeout(() => {
      setAnnouncement(null);
      callAce(suit as Suit);
    }, 2500); // Longer delay to let player see what was called
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

  // Get bury validation
  const buryValidation = canBurySelection();

  // Find partner position (if revealed)
  const partnerPosition = calledAce?.revealed
    ? players.findIndex(p => p.isPartner)
    : null;

  // Determine active player's role (for UI display)
  const getActivePlayerRole = (): 'picker' | 'partner' | 'defender' | null => {
    if (pickerPosition === null) return null;
    if (activePlayer?.isPicker) return 'picker';
    if (activePlayer?.isPartner) return 'partner';
    return 'defender';
  };
  const activePlayerRole = getActivePlayerRole();

  // Get actual partner position (even if not revealed for UI purposes)
  const actualPartnerPosition = players.findIndex(p => p.isPartner);

  // Helper to determine if a player is on picker's team
  const isPickerTeam = (position: number): boolean => {
    if (pickerPosition === null) return false;
    return position === pickerPosition || players[position]?.isPartner;
  };

  // Watch for AI actions that should trigger announcements
  useEffect(() => {
    if (lastAIExplanation && lastAIExplanation.playerPosition !== 0) {
      const { action, playerPosition } = lastAIExplanation;

      if (action === 'pick') {
        setAnnouncement({ type: 'pick', playerPosition });
      } else if (action === 'callAce') {
        // Extract suit from the explanation
        const suitMatch = lastAIExplanation.detailedExplanation?.match(/calling (\w+)/i);
        const suit = suitMatch ? suitMatch[1].toLowerCase() : calledAce?.suit;
        setAnnouncement({ type: 'call', playerPosition, details: suit });
      } else if (action === 'goAlone') {
        setAnnouncement({ type: 'goAlone', playerPosition });
      }
    }
  }, [lastAIExplanation, calledAce?.suit]);

  // Auto-dismiss announcements after delay
  useEffect(() => {
    if (announcement) {
      const delay = announcement.type === 'call' ? 2500 : 2000;
      const timer = setTimeout(() => {
        setAnnouncement(null);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [announcement]);

  // Get current hand score if in scoring phase
  const currentHandScore = handHistory.length > 0 ? handHistory[handHistory.length - 1] : null;

  // Show home page if on home view
  if (currentView === 'home') {
    return (
      <>
        <HomePage />
        {showSettingsModal && <SettingsModal />}
        {showRulesModal && <RulesModal />}
        {showStrategyModal && <StrategyModal />}
        {showTutorial && <Tutorial onClose={closeTutorial} />}
      </>
    );
  }

  // Show setup screen if on setup view
  if (currentView === 'setup') {
    return (
      <>
        <GameSetup />
        {showSettingsModal && <SettingsModal />}
        {showRulesModal && <RulesModal />}
        {showStrategyModal && <StrategyModal />}
      </>
    );
  }

  // Show online lobby
  if (currentView === 'online') {
    return (
      <>
        <OnlineLobby
          onlineState={onlineState}
          onlineActions={onlineActions}
          onBack={goToHome}
        />
        {showSettingsModal && <SettingsModal />}
        {showRulesModal && <RulesModal />}
        {showStrategyModal && <StrategyModal />}
      </>
    );
  }

  // Show online waiting room
  if (currentView === 'onlineWaiting') {
    return (
      <>
        <OnlineWaitingRoom
          onlineState={onlineState}
          onlineActions={onlineActions}
        />
        {showSettingsModal && <SettingsModal />}
        {showRulesModal && <RulesModal />}
        {showStrategyModal && <StrategyModal />}
      </>
    );
  }

  // Show online game
  if (currentView === 'onlineGame') {
    return (
      <>
        <OnlineGame
          onlineState={onlineState}
          onlineActions={onlineActions}
        />
        {showSettingsModal && <SettingsModal />}
        {showRulesModal && <RulesModal />}
        {showStrategyModal && <StrategyModal />}
      </>
    );
  }

  // Show handoff screen in hotseat mode when awaiting handoff
  if (awaitingHandoff) {
    return <PlayerHandoff />;
  }

  // Suit symbols for display
  const SUIT_SYMBOLS: Record<string, string> = {
    clubs: '♣',
    spades: '♠',
    hearts: '♥',
    diamonds: '♦',
  };

  // Helper to get relative player position (0=you, 1-4 clockwise)
  const getRelativePosition = (pos: PlayerPosition): number => {
    return (pos - (activeHumanPosition ?? 0) + 5) % 5;
  };

  // Get player by relative position
  const getPlayerByRelPos = (relPos: number) => {
    const absPos = ((activeHumanPosition ?? 0) + relPos) % 5;
    return players[absPos];
  };

  // Render opponent avatar
  const renderOpponent = (relPos: number, positionClass: string) => {
    const player = getPlayerByRelPos(relPos);
    if (!player) return null;

    const isDealer = player.position === dealerPosition;
    const isCurrent = player.position === currentPlayer;
    const isPicker = player.isPicker;
    const isPartnerRevealed = player.isPartner && calledAce?.revealed;
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
        </div>
        <span className={`mt-1 text-xs sm:text-sm font-medium ${
          isPicker ? 'text-yellow-400' :
          isPartnerRevealed ? 'text-green-400' :
          isCurrent ? 'text-blue-400' : 'text-gray-300'
        }`}>
          {displayInfo.name}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen text-white bg-felt-table relative overflow-hidden">
      {/* Vignette overlay */}
      <div className="absolute inset-0 felt-vignette pointer-events-none" />

      {/* Header - minimal */}
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

          {/* Coaching toggle */}
          <button
            onClick={() => updateSettings({ coachingEnabled: !gameSettings.coachingEnabled })}
            className={`
              flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all
              ${gameSettings.coachingEnabled
                ? 'bg-green-600/80 text-white'
                : 'bg-black/40 text-gray-400 hover:bg-black/60'}
            `}
            title={gameSettings.coachingEnabled ? 'Coaching ON - Click to disable' : 'Coaching OFF - Click to enable'}
          >
            <span>🎓</span>
            <span className="hidden sm:inline">{gameSettings.coachingEnabled ? 'Coach ON' : 'Coach OFF'}</span>
          </button>
        </div>

        {showMenu && (
          <div className="absolute left-2 top-12 bg-gray-900/95 rounded-lg shadow-xl py-1 z-50 w-40 border border-gray-700">
            <button onClick={() => { goToHome(); setShowMenu(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-700 text-white text-sm">Home</button>
            <button onClick={() => { newGame(); setShowMenu(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-700 text-white text-sm">New Game</button>
            <hr className="border-gray-700 my-1" />
            <button onClick={() => { openRules(); setShowMenu(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-700 text-white text-sm">Rules</button>
            <button onClick={() => { openStrategy(); setShowMenu(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-700 text-white text-sm">Strategy</button>
            <button onClick={() => { openSettings(); setShowMenu(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-700 text-white text-sm">Settings</button>
          </div>
        )}

        {/* Status badges */}
        <div className="flex gap-2 flex-wrap justify-end">
          {pickerPosition !== null && (
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

              {/* Running score during play - only show team breakdown after partner revealed */}
              {phase === 'playing' && pickerPosition !== null && calledAce?.revealed && (
                <div className="flex gap-2">
                  <span className="bg-yellow-700/90 px-3 py-1 rounded-full text-sm font-bold">
                    👑 {completedTricks.reduce((sum, t) => {
                      const trickPoints = t.cards.reduce((pts, c) => pts + getCardPoints(c.card), 0);
                      const winnerOnPickerTeam = t.winningPlayer === pickerPosition ||
                        (actualPartnerPosition !== -1 && t.winningPlayer === actualPartnerPosition);
                      return sum + (winnerOnPickerTeam ? trickPoints : 0);
                    }, 0)}/61
                  </span>
                  <span className="bg-red-700/90 px-3 py-1 rounded-full text-sm font-bold">
                    ⚔️ {completedTricks.reduce((sum, t) => {
                      const trickPoints = t.cards.reduce((pts, c) => pts + getCardPoints(c.card), 0);
                      const winnerOnPickerTeam = t.winningPlayer === pickerPosition ||
                        (actualPartnerPosition !== -1 && t.winningPlayer === actualPartnerPosition);
                      return sum + (winnerOnPickerTeam ? 0 : trickPoints);
                    }, 0)}/60
                  </span>
                </div>
              )}

              {/* Blind - picking phase */}
              {phase === 'picking' && blind.length > 0 && (
                <div className="text-center">
                  <p className="text-white/80 text-lg mb-3 font-medium">
                    {currentPlayer === (activeHumanPosition ?? 0) ? 'Pick up the blind?' : `${getPlayerDisplayInfo(currentPlayer).name} is deciding...`}
                  </p>
                  <div className="flex justify-center gap-2">
                    {blind.map((_, i) => (
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
                      {gameState.crackState?.cracked ? 'Cracked!' : 'Cracking Round'}
                    </p>
                    <p className="text-white/80 text-sm">
                      {gameState.crackState?.cracked
                        ? `Stakes doubled! (${getMultiplier()}x)`
                        : 'Defenders can double the stakes'}
                    </p>
                  </div>
                </div>
              )}

              {/* Calling phase */}
              {phase === 'calling' && (
                <div className="text-center">
                  <p className="text-white/80 text-lg mb-2 font-medium">Call an Ace for your partner</p>
                </div>
              )}

              {/* Current trick - playing phase */}
              {phase === 'playing' && (
                <div className="flex gap-2 sm:gap-3 items-end justify-center min-h-[100px] sm:min-h-[120px]">
                  {currentTrick.cards.length === 0 ? (
                    <span className="text-white/40 text-lg">
                      {currentPlayer === (activeHumanPosition ?? 0) ? 'Lead a card' : 'Waiting...'}
                    </span>
                  ) : (
                    currentTrick.cards.map((play, i) => {
                      const isWinner = trickResult && play.playedBy === trickResult.winner;
                      return (
                        <div key={i} className={`flex flex-col items-center animate-card-slide-in ${isWinner ? 'scale-110' : ''}`}>
                          <Card card={play.card} size="large" />
                          <span className={`text-xs mt-1 ${isWinner ? 'text-green-400 font-bold' : 'text-white/70'}`}>
                            {play.playedBy === (activeHumanPosition ?? 0) ? 'You' : getPlayerDisplayInfo(play.playedBy as PlayerPosition).name}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Trick winner announcement */}
              {trickResult && (
                <div className="bg-gradient-to-r from-yellow-500 to-amber-600 px-6 py-3 rounded-xl shadow-2xl animate-trick-winner">
                  <div className="text-center">
                    <div className="text-white text-xl font-bold">
                      {getPlayerDisplayInfo(trickResult.winner as PlayerPosition).name}
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
                  playerNames={[0, 1, 2, 3, 4].map(pos => getPlayerDisplayInfo(pos as PlayerPosition).name)}
                  activeHumanPosition={activeHumanPosition ?? 0}
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
            onPass={handlePass}
            onCrack={crack}
            onRecrack={recrack}
            onNoCrack={noCrack}
            onBlitz={blitz}
            onBury={handleBury}
            onCallAce={handleCallAce}
            onGoAlone={handleGoAlone}
            onNewGame={newGame}
            onPlayAgain={newHand}
            callableSuits={getCallableSuitsForPicker()}
            canBury={buryValidation.valid && selectedCards.length === 2}
            buryReason={buryValidation.reason}
            selectedCount={selectedCards.length}
            canBlitz={canBlitz()}
            isCracked={gameState.crackState?.cracked ?? false}
            isPicker={activePlayer?.isPicker ?? false}
            multiplier={getMultiplier()}
          />
        </div>

        {/* Your Hand - CURVED FAN at bottom */}
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
                const rotation = offset * 4; // degrees
                const translateY = Math.abs(offset) * 8; // pixels
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

      {/* Info Drawer - collapsible scores & log */}
      <div>
        <InfoDrawer
          scores={playerScores}
          pickerPosition={pickerPosition}
          partnerPosition={partnerPosition !== -1 ? partnerPosition as PlayerPosition : null}
          currentPlayer={currentPlayer}
          handsPlayed={handsPlayed}
          showTips={gameSettings.showStrategyTips && isHumanTurn}
          phase={phase}
          hand={activePlayer?.hand || []}
          isPicker={activePlayer?.isPicker || false}
          isPartner={activePlayer?.isPartner || false}
          currentTrick={currentTrick}
          calledAce={calledAce}
          gameLog={gameLog}
          onClearLog={clearLog}
          showAIExplanation={gameSettings.showAIExplanations && !!lastAIExplanation && phase === 'playing'}
          onShowExplanation={lastAIExplanation ? () => showWhyExplanation(lastAIExplanation.playerPosition) : undefined}
          lastAIPlayerName={lastAIExplanation ? getPlayerDisplayInfo(lastAIExplanation.playerPosition).name : undefined}
        />
      </div>

      {/* Explanation modal */}
      {showExplanation && lastAIExplanation && (
        <ExplanationModal
          playerPosition={lastAIExplanation.playerPosition}
          action={lastAIExplanation.action}
          reason={lastAIExplanation.reason}
          detailedExplanation={lastAIExplanation.detailedExplanation}
          onClose={hideExplanation}
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

      {/* Settings, Rules, Strategy modals */}
      {showSettingsModal && <SettingsModal />}
      {showRulesModal && <RulesModal />}
      {showStrategyModal && <StrategyModal />}

      {/* Coaching warnings and feedback */}
      {coachingState.currentWarning && (
        <CoachingToast
          feedback={coachingState.currentWarning}
          isWarning={true}
          onDismiss={() => {
            coachingActions.dismissWarning();
            setPendingBury(null);
            setPendingPlay(null);
          }}
          onProceedAnyway={() => {
            coachingActions.dismissWarning();
            if (pendingBury) {
              executeBury(pendingBury);
            }
            if (pendingPlay) {
              playCard(pendingPlay);
              setPendingPlay(null);
            }
          }}
        />
      )}

      {/* Post-play coaching feedback (positive reinforcement or tips) */}
      {coachingState.recentFeedback.length > 0 && !coachingState.currentWarning && (
        <CoachingToast
          feedback={coachingState.recentFeedback[0]}
          onDismiss={() => coachingActions.clearRecentFeedback()}
        />
      )}

      {/* Hand summary coaching modal */}
      {showCoachingSummary && (
        <HandSummaryModal
          summary={coachingActions.getHandSummary()}
          onClose={() => setShowCoachingSummary(false)}
        />
      )}
    </div>
  );
}

export default App;
