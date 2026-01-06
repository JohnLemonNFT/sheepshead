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
    <div className="min-h-screen p-4 md:p-8 text-white">
      <div className="max-w-6xl mx-auto">
        {/* Header with Menu */}
        <header className="text-center mb-6 relative">
          {/* Menu Button */}
          <div className="absolute left-0 top-0">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {showMenu && (
              <div className="absolute left-0 top-12 bg-gray-800 rounded-lg shadow-xl py-2 z-50 w-48">
                <button
                  onClick={() => { goToHome(); setShowMenu(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-700 text-white"
                >
                  Home
                </button>
                <button
                  onClick={() => { newGame(); setShowMenu(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-700 text-white"
                >
                  New Game
                </button>
                <hr className="border-gray-700 my-1" />
                <button
                  onClick={() => { openRules(); setShowMenu(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-700 text-white"
                >
                  Rules
                </button>
                <button
                  onClick={() => { openStrategy(); setShowMenu(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-700 text-white"
                >
                  Strategy
                </button>
                <button
                  onClick={() => { openSettings(); setShowMenu(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-700 text-white"
                >
                  Settings
                </button>
              </div>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-1">🐑 Sheepshead</h1>
          <p className="text-green-300 text-sm">
            Hand #{handsPlayed + 1} • Dealer: Player {dealerPosition + 1}
          </p>
        </header>

        {/* Main game area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left sidebar - scores, tips, and log */}
          <div className="lg:col-span-1 space-y-4">
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

            {/* AI explanation button (if enabled in settings) */}
            {gameSettings.showAIExplanations && lastAIExplanation && phase === 'playing' && (
              <button
                onClick={() => showWhyExplanation(lastAIExplanation.playerPosition)}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors"
              >
                Why did {getPlayerDisplayInfo(lastAIExplanation.playerPosition).name} do that?
              </button>
            )}
          </div>

          {/* Center - game table and controls */}
          <div className="lg:col-span-3 space-y-6">
            {/* AI players */}
            <div className="grid grid-cols-4 gap-2">
              {players.slice(1).map((player, i) => {
                const playerPos = i + 1;
                const isPlayerDefender = pickerPosition !== null &&
                  !player.isPicker &&
                  !player.isPartner &&
                  calledAce?.revealed;
                const displayInfo = getPlayerDisplayInfo(playerPos as PlayerPosition);

                return (
                  <Hand
                    key={playerPos}
                    cards={player.hand}
                    faceDown
                    label={displayInfo.name}
                    isCurrentPlayer={currentPlayer === playerPos}
                    compact
                    isPicker={player.isPicker}
                    isPartner={player.isPartner && calledAce?.revealed}
                    isDefender={isPlayerDefender}
                    playerPosition={playerPos}
                    showAvatar
                  />
                );
              })}
            </div>

            {/* Game table / Current trick */}
            <div className="bg-green-900/50 rounded-xl p-6">
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
                <div className="text-center mb-6">
                  <p className="text-green-300 text-sm mb-2">Blind</p>
                  <div className="flex justify-center gap-2">
                    {blind.map((_, i) => (
                      <div
                        key={i}
                        className="w-16 h-24 bg-gradient-to-br from-blue-800 to-blue-900 rounded-lg flex items-center justify-center border-2 border-blue-700"
                      >
                        <span className="text-blue-400 text-xl">🐑</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Current trick */}
              {phase === 'playing' && (
                <div className="text-center mb-6">
                  <p className="text-green-300 text-sm mb-2">
                    Trick {trickNumber}/6
                    {calledAce && (
                      <span className="ml-2">
                        • Called: {calledAce.suit}
                        {calledAce.revealed && ' (revealed)'}
                      </span>
                    )}
                  </p>

                  {/* Winner banner when trick is complete */}
                  {trickResult && (
                    <div className="bg-green-700/80 border-2 border-green-400 rounded-lg px-4 py-2 mb-4 animate-slideIn">
                      <span className="text-green-100 font-bold text-lg">
                        🏆 {getPlayerDisplayInfo(trickResult.winner as PlayerPosition).name} wins!
                      </span>
                      <span className="text-green-200 ml-2">
                        (+{trickResult.points} points)
                      </span>
                    </div>
                  )}

                  <div className="flex justify-center gap-3 min-h-[100px] items-center">
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
                            className={`text-center p-2 rounded-lg transition-all duration-300 ${teamColorClass} ${winnerClass}`}
                          >
                            <Card card={play.card} />
                            <p className={`text-xs mt-1 font-medium ${
                              isWinner
                                ? 'text-green-300 font-bold'
                                : isPicker
                                  ? 'text-yellow-300'
                                  : isPartnerPlay
                                    ? 'text-blue-300'
                                    : showTeamColor && !playerOnPickerTeam
                                      ? 'text-red-300'
                                      : 'text-green-300'
                            }`}>
                              {getPlayerDisplayInfo(play.playedBy as PlayerPosition).name}
                              {isWinner && ' 🏆'}
                              {!isWinner && isPicker && ' 👑'}
                              {!isWinner && isPartnerPlay && ' 🤝'}
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
              <div className="mt-6">
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

            {/* Active human player's hand */}
            {activePlayer && (
              <div className="bg-black/30 rounded-xl p-4">
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

        {/* Footer */}
        <footer className="text-center mt-8 text-green-300/50 text-sm">
          <p>Click cards to {phase === 'burying' ? 'select for burying' : 'play'}</p>
          <p className="mt-1">Yellow ring = Trump • Green highlight = Legal play</p>
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
