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
  InfoDrawer,
  TableView,
} from './components';
import { CoachingToast, HandSummaryModal } from './components/CoachingToast';
import { Tutorial } from './tutorial';
import { useOnlineGame } from './hooks/useOnlineGame';
import { useCoaching } from './hooks/useCoaching';
import { useSounds, playSoundEffect } from './hooks/useSounds';
import { Card as CardType, PlayerPosition, Suit, getCardPoints } from './game/types';
import { RunningScore } from './components/RunningScore';
import { SuitHint } from './components/SuitHint';
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
    if (phase === 'scoring' && gameSettings.showStrategyTips && summaryShownForHand !== handsPlayed) {
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

  // Suit symbols for display
  const SUIT_SYMBOLS: Record<string, string> = {
    clubs: '♣',
    spades: '♠',
    hearts: '♥',
    diamonds: '♦',
  };

  return (
    <div className="min-h-screen text-white bg-gradient-to-b from-green-900 via-green-800 to-green-900">
      {/* Minimal Header Bar */}
      <div className="flex justify-between items-center p-2 bg-black/40">
        <div className="flex items-center gap-2">
          {/* Menu Button */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="bg-gray-800/80 hover:bg-gray-700 text-white p-2 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {showMenu && (
            <div className="absolute left-2 top-12 bg-gray-800 rounded-lg shadow-xl py-1 z-50 w-40">
              <button onClick={() => { goToHome(); setShowMenu(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-700 text-white text-sm">Home</button>
              <button onClick={() => { newGame(); setShowMenu(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-700 text-white text-sm">New Game</button>
              <hr className="border-gray-700 my-1" />
              <button onClick={() => { openRules(); setShowMenu(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-700 text-white text-sm">Rules</button>
              <button onClick={() => { openStrategy(); setShowMenu(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-700 text-white text-sm">Strategy</button>
              <button onClick={() => { openSettings(); setShowMenu(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-700 text-white text-sm">Settings</button>
            </div>
          )}
          <span className="text-sm sm:text-base font-bold text-white">Sheepshead</span>
        </div>
        <div className="text-[10px] sm:text-xs text-green-300/70">
          Hand {handsPlayed + 1}
        </div>
      </div>

      {/* Main Content - Single Column Mobile-First */}
      <div className="p-2 sm:p-4 max-w-4xl mx-auto pb-16 lg:pb-4">
        {/* Compact Role & Game Info */}
        {pickerPosition !== null && phase === 'playing' && (
          <div className="flex items-center justify-center gap-3 mb-2 text-xs sm:text-sm">
            <div className={`
              px-3 py-1 rounded-full font-medium flex items-center gap-1
              ${activePlayerRole === 'picker' ? 'bg-yellow-600' :
                activePlayerRole === 'partner' ? 'bg-blue-600' : 'bg-red-700'}
            `}>
              <span>
                {activePlayerRole === 'picker' ? '👑' :
                 activePlayerRole === 'partner' ? '🤝' : '⚔️'}
              </span>
              <span className="uppercase">{activePlayerRole || 'defender'}</span>
            </div>
            <span className="text-green-300/70">Trick {trickNumber}/6</span>
            {calledAce && (
              <span className="text-gray-300">{SUIT_SYMBOLS[calledAce.suit]} called</span>
            )}
          </div>
        )}

        {/* Table View with players around it */}
        <TableView
          players={players}
          currentPlayer={currentPlayer}
          dealerPosition={dealerPosition}
          yourPosition={(activeHumanPosition ?? 0) as PlayerPosition}
          pickerPosition={pickerPosition}
          partnerRevealed={calledAce?.revealed || false}
        >
          {/* Blind - shown in center of table */}
          {blind.length > 0 && (
            <div className="text-center">
              <p className="text-green-300/70 text-[10px] mb-1">Blind</p>
              <div className="flex justify-center gap-1">
                {blind.map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-11 sm:w-10 sm:h-14 bg-gradient-to-br from-blue-800 to-blue-900 rounded border border-blue-600 flex items-center justify-center shadow-lg"
                  >
                    <span className="text-blue-400 text-xs sm:text-sm">🐑</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current Trick - shown in center of table */}
          {phase === 'playing' && (
            <div className="text-center">
              {/* Running score - compact */}
              <div className="mb-2">
                <RunningScore
                  completedTricks={completedTricks}
                  currentTrick={currentTrick.cards}
                  pickerPosition={pickerPosition}
                  partnerPosition={actualPartnerPosition !== -1 ? actualPartnerPosition as PlayerPosition : null}
                />
              </div>

              {/* Trick cards - LARGER */}
              <div className="flex justify-center gap-1 sm:gap-2 min-h-[70px] sm:min-h-[90px] items-center">
                {currentTrick.cards.length === 0 ? (
                  <span className="text-green-600/40 text-sm">Play a card</span>
                ) : (
                  currentTrick.cards.map((play, i) => {
                    const isWinner = trickResult && play.playedBy === trickResult.winner;
                    const isPickerCard = play.playedBy === pickerPosition;
                    const isPartnerPlay = players[play.playedBy]?.isPartner && calledAce?.revealed;

                    return (
                      <div
                        key={i}
                        className={`
                          text-center transition-all
                          ${isWinner ? 'scale-110 z-10' : ''}
                        `}
                      >
                        <Card card={play.card} size="medium" />
                        <div className={`text-[9px] sm:text-xs mt-0.5 truncate max-w-[50px] ${
                          isWinner ? 'text-green-300 font-bold' :
                          isPickerCard ? 'text-yellow-300' :
                          isPartnerPlay ? 'text-blue-300' :
                          'text-white/70'
                        }`}>
                          {play.playedBy === (activeHumanPosition ?? 0) ? 'You' : getPlayerDisplayInfo(play.playedBy as PlayerPosition).name}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Winner banner */}
              {trickResult && (
                <div className="mt-2">
                  <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                    {getPlayerDisplayInfo(trickResult.winner as PlayerPosition).name} +{trickResult.points}
                  </span>
                </div>
              )}

              {/* Points at stake */}
              {currentTrick.cards.length > 0 && !trickResult && (
                <div className="text-xs text-yellow-300/80 mt-1">
                  {currentTrick.cards.reduce((sum, play) => sum + getCardPoints(play.card), 0)} pts
                </div>
              )}
            </div>
          )}
        </TableView>

        {/* Hand summary */}
        {phase === 'scoring' && currentHandScore && (
          <div className="mb-3">
            <HandSummary
              score={currentHandScore}
              pickerPosition={pickerPosition}
              partnerPosition={partnerPosition !== -1 ? partnerPosition as PlayerPosition : null}
              calledSuit={calledAce?.suit || null}
              onClose={() => {}}
            />
          </div>
        )}

        {/* Game Controls */}
        <div className="mb-3">
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

        {/* Your Hand - THE MAIN FOCUS */}
        {activePlayer && (
          <div className="mt-4">
            {/* Turn instruction */}
            {isHumanTurn && phase === 'playing' && (
              <div className="text-center mb-3 text-lg text-yellow-400 font-medium">
                Your turn - tap a card to play
              </div>
            )}
            {isHumanTurn && phase === 'burying' && (
              <div className="text-center mb-3 text-lg text-yellow-400 font-medium">
                Select 2 cards to bury
              </div>
            )}

            {/* Suit following hint */}
            {phase === 'playing' && isHumanTurn && currentTrick.cards.length > 0 && (
              <div className="mb-2">
                <SuitHint
                  trickCards={currentTrick.cards}
                  legalPlays={legalPlays}
                  hand={activePlayer.hand}
                  isYourTurn={isHumanTurn}
                />
              </div>
            )}

            {/* Cards - EXTRA LARGE and prominent */}
            <div className="bg-gray-900/50 rounded-2xl p-4 sm:p-6 border border-green-600/20">
              <div className="flex flex-wrap gap-2 sm:gap-4 justify-center">
                {activePlayer.hand.map(card => {
                  const isLegal = legalPlays.some(c => c.id === card.id);
                  const isSelected = selectedCards.some(c => c.id === card.id);
                  return (
                    <div
                      key={card.id}
                      onClick={() => handleCardClick(card)}
                      className={`
                        cursor-pointer transition-all duration-200
                        ${phase === 'playing' && isHumanTurn && isLegal ? 'hover:-translate-y-4 hover:scale-105' : ''}
                        ${phase === 'playing' && isHumanTurn && !isLegal ? 'opacity-40 cursor-not-allowed' : ''}
                        ${phase === 'burying' ? 'hover:-translate-y-4 hover:scale-105' : ''}
                        ${isSelected ? '-translate-y-5 scale-110 ring-2 ring-green-400 rounded-lg' : ''}
                      `}
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
          </div>
        )}

        {/* Desktop: Sidebar info */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-4 mt-4">
          <ScoreBoard
            scores={playerScores}
            pickerPosition={pickerPosition}
            partnerPosition={partnerPosition !== -1 ? partnerPosition as PlayerPosition : null}
            currentPlayer={currentPlayer}
            handsPlayed={handsPlayed}
          />
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
          <GameLog entries={gameLog} onClear={clearLog} />
        </div>
      </div>

      {/* Mobile: Info Drawer */}
      <div className="lg:hidden">
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
