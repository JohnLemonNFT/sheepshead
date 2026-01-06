// Main App component - Sheepshead game

import { useEffect, useCallback, useState } from 'react';
import { useGameStore, SPEED_DELAYS } from './store/gameStore';
import {
  Card,
  Hand,
  ScoreBoard,
  GameControls,
  HandSummary,
  ExplanationModal,
  GameLog,
  StrategyTips,
  Announcement,
  PlayerAvatar,
  TeamBanner,
  HomePage,
  GameSetup,
  PlayerHandoff,
  SettingsModal,
  RulesModal,
  StrategyModal,
  OnlineLobby,
  OnlineWaitingRoom,
  OnlineGame,
} from './components';
import { CoachingToast, HandSummaryModal } from './components/CoachingToast';
import { Tutorial } from './tutorial';
import { useOnlineGame } from './hooks/useOnlineGame';
import { useCoaching } from './hooks/useCoaching';
import { useSounds, playSoundEffect } from './hooks/useSounds';
import { Card as CardType, PlayerPosition, Suit } from './game/types';
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
    openSettings,
    openRules,
    openStrategy,
    isHotseatMode,
  } = useGameStore();

  // Online game state
  const [onlineState, onlineActions] = useOnlineGame();

  // Coaching system
  const [coachingState, coachingActions] = useCoaching();
  const [pendingBury, setPendingBury] = useState<[CardType, CardType] | null>(null);
  const [pendingPlay, setPendingPlay] = useState<CardType | null>(null);
  const [showCoachingSummary, setShowCoachingSummary] = useState(false);

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

  // Auto-clear trick result after delay and show coaching feedback
  useEffect(() => {
    if (trickResult) {
      const timer = setTimeout(() => {
        clearTrickResult();
      }, 2000); // Show completed trick for 2 seconds
      return () => clearTimeout(timer);
    }
  }, [trickResult, clearTrickResult]);

  // Show coaching summary at end of hand
  useEffect(() => {
    if (phase === 'scoring' && gameSettings.showStrategyTips) {
      const summary = coachingActions.getHandSummary();
      if (summary.goodPlays.length > 0 || summary.mistakes.length > 0) {
        // Delay slightly so hand result shows first
        const timer = setTimeout(() => {
          setShowCoachingSummary(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [phase, gameSettings.showStrategyTips, coachingActions]);

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
        if (legalPlays.some(c => c.id === card.id)) {
          // Record play for coaching feedback
          if (gameSettings.showStrategyTips && activePlayer) {
            coachingActions.recordPlay(
              activePlayer.hand,
              card,
              currentTrick,
              calledAce,
              activePlayer.isPicker,
              activePlayer.isPartner,
              pickerPosition,
              activeHumanPosition as PlayerPosition,
              trickNumber
            );
          }

          addLogEntry(playerName, `played ${card.rank} of ${card.suit}`, '', true, 'playing');
          playCard(card);
        }
      }
    },
    [phase, isHumanTurn, activeHumanPosition, legalPlays, toggleCardSelection, playCard, addLogEntry, gameSettings.showStrategyTips, activePlayer, coachingActions, currentTrick, calledAce, pickerPosition, trickNumber]
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
      if (gameSettings.showStrategyTips && activePlayer) {
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

  return (
    <div className="min-h-screen p-2 sm:p-4 md:p-8 text-white">
      <div className="max-w-6xl mx-auto">
        {/* Header with Menu */}
        <header className="text-center mb-4 sm:mb-6 relative">
          {/* Menu Button - 44px minimum touch target */}
          <div className="absolute left-0 top-0">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="bg-gray-800 hover:bg-gray-700 text-white p-3 sm:p-2 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {showMenu && (
              <div className="absolute left-0 top-14 bg-gray-800 rounded-lg shadow-xl py-2 z-50 w-48">
                <button
                  onClick={() => { goToHome(); setShowMenu(false); }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-700 text-white min-h-[44px]"
                >
                  Home
                </button>
                <button
                  onClick={() => { newGame(); setShowMenu(false); }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-700 text-white min-h-[44px]"
                >
                  New Game
                </button>
                <hr className="border-gray-700 my-1" />
                <button
                  onClick={() => { openRules(); setShowMenu(false); }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-700 text-white min-h-[44px]"
                >
                  Rules
                </button>
                <button
                  onClick={() => { openStrategy(); setShowMenu(false); }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-700 text-white min-h-[44px]"
                >
                  Strategy
                </button>
                <button
                  onClick={() => { openSettings(); setShowMenu(false); }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-700 text-white min-h-[44px]"
                >
                  Settings
                </button>
              </div>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1">Sheepshead</h1>
          <p className="text-green-300 text-xs sm:text-sm">
            Hand #{handsPlayed + 1} | Dealer: Player {dealerPosition + 1}
          </p>
        </header>

        {/* Main game area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {/* Left sidebar - scores, tips, and log */}
          <div className="lg:col-span-1 space-y-3 sm:space-y-4">
            <ScoreBoard
              scores={playerScores}
              pickerPosition={pickerPosition}
              partnerPosition={partnerPosition !== -1 ? partnerPosition as PlayerPosition : null}
              currentPlayer={currentPlayer}
              handsPlayed={handsPlayed}
            />

            {/* Strategy tips for active human (if enabled in settings) */}
            {gameSettings.showStrategyTips && isHumanTurn && activePlayer && (
              <StrategyTips
                phase={phase}
                hand={activePlayer.hand}
                isPicker={activePlayer.isPicker}
                isPartner={activePlayer.isPartner}
                currentTrick={currentTrick}
                calledAce={calledAce}
                pickerPosition={pickerPosition}
              />
            )}

            {/* Game log */}
            <GameLog entries={gameLog} onClear={clearLog} />

            {/* AI explanation button (if enabled in settings) - desktop only */}
            {gameSettings.showAIExplanations && lastAIExplanation && phase === 'playing' && (
              <button
                onClick={() => showWhyExplanation(lastAIExplanation.playerPosition)}
                className="hidden lg:block w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors"
              >
                Why did {getPlayerDisplayInfo(lastAIExplanation.playerPosition).name} do that?
              </button>
            )}
          </div>

          {/* Center - game table and controls */}
          <div className="lg:col-span-3 space-y-3 sm:space-y-4 lg:space-y-6">
            {/* AI players - compact status strip on mobile */}
            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-2 sm:mb-0">
              {players.slice(1).map((player, i) => {
                const playerPos = i + 1;
                const isPlayerDefender = pickerPosition !== null &&
                  !player.isPicker &&
                  !player.isPartner &&
                  calledAce?.revealed;
                const displayInfo = getPlayerDisplayInfo(playerPos as PlayerPosition);
                const isThinking = currentPlayer === playerPos;

                return (
                  <div
                    key={playerPos}
                    className={`
                      flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs
                      ${isThinking ? 'bg-green-600/30 ring-1 ring-green-400' : 'bg-black/20'}
                      ${player.isPicker ? 'ring-1 ring-yellow-400' : ''}
                      ${player.isPartner && calledAce?.revealed ? 'ring-1 ring-blue-400' : ''}
                      ${isPlayerDefender ? 'ring-1 ring-red-400/50' : ''}
                    `}
                  >
                    <span className="text-base">{displayInfo.avatar}</span>
                    <span className="text-white/90 font-medium">{displayInfo.name}</span>
                    {player.isPicker && <span className="text-yellow-400">👑</span>}
                    {player.isPartner && calledAce?.revealed && <span className="text-blue-400">🤝</span>}
                    {isThinking && <span className="text-green-300 text-[10px]">thinking...</span>}
                    <span className="text-white/50 text-[10px]">{player.hand.length}♠</span>
                  </div>
                );
              })}
            </div>

            {/* Game table / Current trick */}
            <div className="bg-black/20 rounded-xl p-2 sm:p-3 md:p-4">
              {/* Team banner - shows active player's role */}
              {pickerPosition !== null && phase === 'playing' && (
                <TeamBanner
                  humanRole={activePlayerRole}
                  pickerPosition={pickerPosition}
                  partnerPosition={actualPartnerPosition !== -1 ? actualPartnerPosition as PlayerPosition : null}
                  partnerRevealed={calledAce?.revealed || false}
                  calledSuit={calledAce?.suit}
                />
              )}

              {/* Blind */}
              {blind.length > 0 && (
                <div className="text-center mb-3 sm:mb-4 md:mb-6">
                  <p className="text-green-300 text-xs sm:text-sm mb-2">Blind</p>
                  <div className="flex justify-center gap-1 sm:gap-2">
                    {blind.map((_, i) => (
                      <div
                        key={i}
                        className="w-10 h-14 sm:w-12 sm:h-[4.5rem] md:w-16 md:h-24 bg-gradient-to-br from-blue-800 to-blue-900 rounded-lg flex items-center justify-center border-2 border-blue-700"
                      >
                        <span className="text-blue-400 text-sm sm:text-base md:text-xl">🐑</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Current trick */}
              {phase === 'playing' && (
                <div className="text-center mb-2 sm:mb-3">
                  <p className="text-green-300/80 text-[10px] sm:text-xs mb-1.5">
                    Trick {trickNumber}/6
                    {calledAce && (
                      <span className="ml-1">
                        • {calledAce.suit} {calledAce.revealed ? '✓' : ''}
                      </span>
                    )}
                  </p>

                  {/* Winner banner when trick is complete */}
                  {trickResult && (
                    <div className="bg-green-700/80 border border-green-400 rounded px-2 py-1 mb-2 inline-block">
                      <span className="text-green-100 font-bold text-xs sm:text-sm">
                        {getPlayerDisplayInfo(trickResult.winner as PlayerPosition).name} wins +{trickResult.points}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-center gap-1 sm:gap-2 min-h-[60px] sm:min-h-[80px] items-center flex-wrap">
                    {currentTrick.cards.length === 0 ? (
                      <p className="text-gray-400">Waiting for lead...</p>
                    ) : (
                      currentTrick.cards.map((play, i) => {
                        const playerOnPickerTeam = isPickerTeam(play.playedBy);
                        const isPicker = play.playedBy === pickerPosition;
                        const isPartnerPlay = players[play.playedBy]?.isPartner && calledAce?.revealed;
                        const isWinner = trickResult && play.playedBy === trickResult.winner;

                        // Determine team color (only show if partner revealed or for picker)
                        const showTeamColor = isPicker || isPartnerPlay || (calledAce?.revealed);
                        const teamColorClass = showTeamColor
                          ? playerOnPickerTeam
                            ? 'ring-2 ring-yellow-400 bg-yellow-900/30'
                            : 'ring-2 ring-red-400 bg-red-900/30'
                          : '';

                        // Winner gets special highlight
                        const winnerClass = isWinner
                          ? 'ring-4 ring-green-400 bg-green-900/50 scale-110 z-10'
                          : '';

                        return (
                          <div
                            key={i}
                            className={`text-center p-0.5 sm:p-1 rounded transition-all ${teamColorClass} ${winnerClass}`}
                          >
                            <Card card={play.card} small />
                            <p className={`text-[9px] sm:text-[10px] mt-0.5 truncate max-w-[50px] sm:max-w-none ${
                              isWinner ? 'text-green-300 font-bold' :
                              isPicker ? 'text-yellow-300' :
                              isPartnerPlay ? 'text-blue-300' :
                              'text-white/70'
                            }`}>
                              {getPlayerDisplayInfo(play.playedBy as PlayerPosition).name}
                              {isPicker && '👑'}
                              {isPartnerPlay && '🤝'}
                            </p>
                          </div>
                        );
                      })
                    )}
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
                />
              )}

              {/* Game controls */}
              <div className="mt-3 sm:mt-4 md:mt-6">
                <GameControls
                  phase={phase}
                  isHumanTurn={isHumanTurn}
                  onPick={handlePick}
                  onPass={handlePass}
                  onBury={handleBury}
                  onCallAce={handleCallAce}
                  onGoAlone={handleGoAlone}
                  onNewGame={newGame}
                  onPlayAgain={newHand}
                  callableSuits={getCallableSuitsForPicker()}
                  canBury={buryValidation.valid && selectedCards.length === 2}
                  buryReason={buryValidation.reason}
                  selectedCount={selectedCards.length}
                />
              </div>
            </div>

            {/* Mobile AI explanation button - above the hand for visibility */}
            {gameSettings.showAIExplanations && lastAIExplanation && phase === 'playing' && (
              <button
                onClick={() => showWhyExplanation(lastAIExplanation.playerPosition)}
                className="lg:hidden w-full bg-purple-600/90 hover:bg-purple-500 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
              >
                <span>🤔</span>
                <span>Why did {getPlayerDisplayInfo(lastAIExplanation.playerPosition).name} do that?</span>
              </button>
            )}

            {/* Active human player's hand */}
            {activePlayer && (
              <div className="bg-black/30 rounded-lg p-1.5 sm:p-2 md:p-3">
                <Hand
                  cards={activePlayer.hand}
                  onCardClick={handleCardClick}
                  selectedCards={selectedCards}
                  legalPlays={legalPlays}
                  label={activeHumanPosition === 0 ? 'Your Hand' : `Player ${activeHumanPosition! + 1}'s Hand`}
                  isCurrentPlayer={isHumanTurn}
                  isPicker={activePlayer.isPicker}
                  isPartner={activePlayer.isPartner}
                  isDefender={activePlayerRole === 'defender' && calledAce?.revealed}
                  playerPosition={activeHumanPosition ?? 0}
                  showAvatar
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer - hidden on mobile to save space */}
        <footer className="hidden sm:block text-center mt-4 md:mt-6 text-green-300/40 text-xs">
          <p>Yellow ring = Trump | Green = Legal play</p>
        </footer>
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
