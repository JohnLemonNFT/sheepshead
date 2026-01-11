'use client';

// ============================================
// ONLINE GAME - Wrapper for GameUI with WebSocket data
// ============================================
// This component maps WebSocket state to GameUI's common interface
// All game UI logic is in GameUI - this just provides the data

import { useState, useCallback, useEffect, useRef } from 'react';
import { GameUI } from './GameUI';
import type { GameUIState, GameUIActions, GameUIConfig, PlayerData } from './GameUI';
import type { OnlineGameState, OnlineGameActions } from '../hooks/useOnlineGame';
import type { Card as CardType, PlayerPosition, Suit, Trick } from '../game/types';
import { isTrump, getCardPoints } from '../game/types';
import { getPlayerDisplayInfo } from '../game/ai/personalities';
import { Announcement } from './Announcement';
import { useGameStore } from '../store/gameStore';
import { useStatsStore } from '../store/statsStore';
import { useCoaching } from '../hooks/useCoaching';
import { useOnlineSounds } from '../hooks/useOnlineSounds';
import { useOnlineHaptics } from '../hooks/useOnlineHaptics';
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
  const { myPosition, gameState, error, roomCode, gameEnded, finalStandings, inactivePlayers } = onlineState;

  // Get modal openers, goToHome, and settings from game store
  const { openSettings, openRules, openStrategy, goToHome, gameSettings, updateSettings } = useGameStore();

  // Coaching system
  const [coachingState, coachingActions] = useCoaching();

  // Sync coaching enabled state with settings
  useEffect(() => {
    coachingActions.setEnabled(gameSettings.coachingEnabled);
  }, [gameSettings.coachingEnabled, coachingActions]);

  // Sound effects for online game
  useOnlineSounds(onlineState);

  // Haptic feedback for online game
  useOnlineHaptics(onlineState);

  // Track previous state for detecting changes
  const prevStateRef = useRef<{
    pickerPosition: PlayerPosition | null;
    calledAce: { suit: Suit; revealed: boolean } | null;
    trickNumber: number;
    completedTricksLength: number;
    phase: string;
    dealerPosition: PlayerPosition;
  } | null>(null);

  // Announcement state
  const [announcement, setAnnouncement] = useState<{
    type: 'pick' | 'call' | 'callTen' | 'goAlone' | 'partnerReveal' | 'trickWin' | 'leaster' | 'dealer';
    playerPosition: number;
    details?: string;
  } | null>(null);

  // Trick result state (for showing who won)
  const [trickResult, setTrickResult] = useState<TrickResult | null>(null);

  // Game log (built from state changes)
  const [gameLog, setGameLog] = useState<LogEntry[]>([]);

  // Log ID counter
  const logIdRef = useRef(0);

  // Extract values from gameState (with safe defaults for when loading)
  const phase = gameState?.phase ?? 'dealing';
  const serverPlayers = gameState?.players ?? [];
  const blind = gameState?.blind ?? 0;
  const currentTrick: Trick = gameState?.currentTrick ?? { cards: [], leadPlayer: 0 as PlayerPosition };
  const completedTricks = gameState?.completedTricks ?? [];
  const currentPlayer = gameState?.currentPlayer ?? (0 as PlayerPosition);
  const dealerPosition = gameState?.dealerPosition ?? (0 as PlayerPosition);
  const pickerPosition = gameState?.pickerPosition ?? null;
  const calledAce = gameState?.calledAce ?? null;
  const trickNumber = gameState?.trickNumber ?? 1;
  const playerScores = gameState?.playerScores ?? [0, 0, 0, 0, 0];
  const handsPlayed = gameState?.handsPlayed ?? 0;

  // Find my player data
  const myPlayer = serverPlayers.find(p => p.position === myPosition);
  const myHand = myPlayer?.hand || [];

  // Get player name helper
  const getPlayerName = useCallback((position: PlayerPosition): string => {
    const player = serverPlayers.find(p => p.position === position);
    return player?.name || getPlayerDisplayInfo(position).name;
  }, [serverPlayers]);

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
    // Only run detection logic when we have valid game state
    if (!gameState || myPosition === null) return;

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

      // Detect going alone (phase went to playing with picker but no called ace)
      if ((prev.phase === 'calling' || prev.phase === 'burying') &&
          phase === 'playing' &&
          pickerPosition !== null &&
          calledAce === null &&
          pickerPosition !== myPosition) {
        const pickerName = getPlayerName(pickerPosition);
        addLogEntry(pickerName, 'going alone!', 'No partner', false, 'calling');
        setAnnouncement({ type: 'goAlone', playerPosition: pickerPosition });
      }

      // Detect partner reveal
      if (prev.calledAce && !prev.calledAce.revealed && calledAce?.revealed) {
        const partnerPos = serverPlayers.find(p => p.isPartner && p.position !== pickerPosition)?.position;
        if (partnerPos !== undefined) {
          addLogEntry(getPlayerName(partnerPos), 'is the partner!', '', false, 'playing');
          setAnnouncement({ type: 'partnerReveal', playerPosition: partnerPos });
        }
      }

      // Detect leaster (phase went to playing with no picker)
      if (prev.phase === 'picking' && phase === 'playing' && pickerPosition === null) {
        addLogEntry('Game', 'Leaster - everyone passed!', 'Lowest points wins', false, 'playing');
        setAnnouncement({ type: 'leaster', playerPosition: 0 });
      }

      // Detect trick completion (completedTricks array grew)
      if (completedTricks.length > prev.completedTricksLength) {
        // New trick completed - find winner from the most recent completed trick
        const lastCompletedTrick = completedTricks[completedTricks.length - 1];
        if (lastCompletedTrick && lastCompletedTrick.winningPlayer !== undefined) {
          const points = lastCompletedTrick.cards.reduce((sum, c) => sum + getCardPoints(c.card), 0);

          setTrickResult({
            cards: lastCompletedTrick.cards,
            winner: lastCompletedTrick.winningPlayer,
            points,
          });
        }
      }
    }

    // Detect new hand (dealer changed or first hand)
    if (phase === 'picking' && (!prev || prev.dealerPosition !== dealerPosition || prev.phase !== 'picking')) {
      setAnnouncement({ type: 'dealer', playerPosition: dealerPosition });
    }

    // Update previous state
    prevStateRef.current = {
      pickerPosition,
      calledAce,
      trickNumber,
      completedTricksLength: completedTricks.length,
      phase,
      dealerPosition,
    };
  }, [gameState, myPosition, pickerPosition, calledAce, trickNumber, completedTricks, phase, dealerPosition, getPlayerName, addLogEntry, serverPlayers]);

  // Auto-dismiss announcements
  useEffect(() => {
    if (announcement) {
      const announcementDelays: Record<string, number> = {
        call: 2500, callTen: 2500, goAlone: 2500, leaster: 2500, partnerReveal: 3000, dealer: 2500
      };
      const delay = announcementDelays[announcement.type] ?? 2000;
      const timer = setTimeout(() => setAnnouncement(null), delay);
      return () => clearTimeout(timer);
    }
  }, [announcement]);

  // Auto-clear trick result
  useEffect(() => {
    if (trickResult) {
      const timer = setTimeout(() => setTrickResult(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [trickResult]);

  // Clear log when new hand starts
  useEffect(() => {
    if (phase === 'picking' && trickNumber === 1) {
      setGameLog([]);
    }
  }, [phase, trickNumber]);

  // Track which hands we've recorded stats for to avoid duplicates
  const recordedHandsRef = useRef<Set<string>>(new Set());

  // Record stats when a hand completes
  useEffect(() => {
    const handScore = gameState?.handScore;
    if (!handScore || myPosition === null) return;

    // Create a unique key for this hand to avoid double-counting
    const handKey = `${roomCode}-${handsPlayed}`;
    if (recordedHandsRef.current.has(handKey)) return;
    recordedHandsRef.current.add(handKey);

    // Determine if this is a leaster (no picker)
    const isLeaster = pickerPosition === null;

    // Find if player was picker
    const wasPicker = pickerPosition === myPosition;

    // Find if player's team won
    const myScore = handScore.playerScores.find(p => p.position === myPosition);
    const humanWon = myScore ? myScore.points > 0 : false;

    // Determine points: in a leaster, track differently
    let playerPoints: number;
    let opponentPoints: number;

    if (isLeaster) {
      // In leaster, low points win - just track the raw values
      playerPoints = handScore.pickerTeamPoints; // In leaster this is winner's points
      opponentPoints = handScore.defenderTeamPoints;
    } else if (wasPicker || myPlayer?.isPartner) {
      // Picker's team
      playerPoints = handScore.pickerTeamPoints;
      opponentPoints = handScore.defenderTeamPoints;
    } else {
      // Defender
      playerPoints = handScore.defenderTeamPoints;
      opponentPoints = handScore.pickerTeamPoints;
    }

    // Record the game result
    useStatsStore.getState().recordGameResult({
      won: humanWon,
      wasPicker,
      wasLeaster: isLeaster,
      playerPoints,
      opponentPoints,
      isSchneider: handScore.isSchneider && humanWon,
      wasSchneidered: handScore.isSchneider && !humanWon,
    }, 'online');
  }, [gameState?.handScore, myPosition, roomCode, handsPlayed, pickerPosition, myPlayer?.isPartner]);

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

  // Get callable tens (suits where I have the Ace but not the 10)
  // Only relevant when callTen option is enabled and player has all fail aces
  const getCallableTens = useCallback((): Suit[] => {
    const failSuits: Suit[] = ['clubs', 'spades', 'hearts'];
    // Check if player has all 3 fail aces
    const failAces = myHand.filter(c => failSuits.includes(c.suit) && c.rank === 'A' && !isTrump(c));
    if (failAces.length < 3) return [];

    // Return suits where we have the ace but not the 10
    return failSuits.filter(suit => {
      const hasAce = myHand.some(c => c.suit === suit && c.rank === 'A' && !isTrump(c));
      const hasTen = myHand.some(c => c.suit === suit && c.rank === '10' && !isTrump(c));
      return hasAce && !hasTen;
    });
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
    if (myPosition === null) return;
    const myName = getPlayerName(myPosition);
    addLogEntry(myName, 'picked up the blind', '', true, 'picking');
    setAnnouncement({ type: 'pick', playerPosition: myPosition });
    setTimeout(() => {
      setAnnouncement(null);
      onlineActions.sendAction({ type: 'pick' });
    }, 1500);
  }, [myPosition, getPlayerName, addLogEntry, onlineActions]);

  const handlePass = useCallback(() => {
    if (myPosition === null) return;
    const myName = getPlayerName(myPosition);
    addLogEntry(myName, 'passed', '', true, 'picking');
    onlineActions.sendAction({ type: 'pass' });
  }, [myPosition, getPlayerName, addLogEntry, onlineActions]);

  const handleCallAce = useCallback((suit: Suit) => {
    if (myPosition === null) return;
    const myName = getPlayerName(myPosition);
    addLogEntry(myName, `called ${suit} ace`, '', true, 'calling');
    setAnnouncement({ type: 'call', playerPosition: myPosition, details: suit });
    setTimeout(() => {
      setAnnouncement(null);
      onlineActions.sendAction({ type: 'callAce', suit });
    }, 2500);
  }, [myPosition, getPlayerName, addLogEntry, onlineActions]);

  const handleGoAlone = useCallback(() => {
    if (myPosition === null) return;
    const myName = getPlayerName(myPosition);
    addLogEntry(myName, 'going alone', '', true, 'calling');
    setAnnouncement({ type: 'goAlone', playerPosition: myPosition });
    setTimeout(() => {
      setAnnouncement(null);
      onlineActions.sendAction({ type: 'goAlone' });
    }, 2000);
  }, [myPosition, getPlayerName, addLogEntry, onlineActions]);

  // Handle calling a 10 instead of ace (when player has all fail aces)
  const handleCallTen = useCallback((suit: Suit) => {
    if (myPosition === null) return;
    const myName = getPlayerName(myPosition);
    addLogEntry(myName, `called ${suit} 10`, '', true, 'calling');
    setAnnouncement({ type: 'callTen', playerPosition: myPosition, details: suit });
    setTimeout(() => {
      setAnnouncement(null);
      onlineActions.sendAction({ type: 'callTen', suit });
    }, 2500);
  }, [myPosition, getPlayerName, addLogEntry, onlineActions]);

  const handleBury = useCallback((cards: [CardType, CardType]) => {
    if (myPosition === null) return;
    const myName = getPlayerName(myPosition);
    const pts = cards.reduce((sum, c) => sum + getCardPoints(c), 0);
    addLogEntry(myName, `buried 2 cards (${pts} pts)`, '', true, 'burying');

    // Record bury for coaching feedback
    if (gameSettings.coachingEnabled) {
      coachingActions.recordBury(myHand, cards, calledAce?.suit || null);
    }

    onlineActions.sendAction({ type: 'bury', cards });
  }, [myPosition, getPlayerName, addLogEntry, onlineActions, gameSettings.coachingEnabled, coachingActions, myHand, calledAce]);

  const handlePlayCard = useCallback((card: CardType) => {
    if (myPosition === null) return;
    const myName = getPlayerName(myPosition);

    // Record play for coaching feedback
    if (gameSettings.coachingEnabled) {
      const myPlayerData = serverPlayers.find(p => p.position === myPosition);
      const isPicker = myPlayerData?.isPicker ?? false;
      const isPartner = myPlayerData?.isPartner ?? false;
      const partnerPos = calledAce?.revealed
        ? serverPlayers.find(p => p.isPartner && p.position !== pickerPosition)?.position ?? null
        : null;

      coachingActions.recordPlay(
        myHand,
        card,
        currentTrick,
        calledAce,
        isPicker,
        isPartner,
        pickerPosition,
        myPosition,
        trickNumber,
        partnerPos
      );
    }

    addLogEntry(myName, `played ${card.rank} of ${card.suit}`, '', true, 'playing');
    onlineActions.sendAction({ type: 'playCard', card });
  }, [myPosition, getPlayerName, addLogEntry, onlineActions, gameSettings.coachingEnabled, coachingActions, serverPlayers, calledAce, pickerPosition, myHand, currentTrick, trickNumber]);

  // Loading state - show AFTER all hooks have been called
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

  // Game Over Screen
  if (gameEnded && finalStandings) {
    // Find my standing
    const myStanding = finalStandings.find(s => s.position === myPosition);
    const myRank = myStanding?.rank ?? 0;

    // Medal emojis for top 3
    const getMedal = (rank: number) => {
      if (rank === 1) return '🥇';
      if (rank === 2) return '🥈';
      if (rank === 3) return '🥉';
      return '';
    };

    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white bg-felt-table p-4">
        <div className="bg-black/70 rounded-2xl p-6 sm:p-8 max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2">Game Over!</h1>
            <p className="text-gray-400 text-sm">
              {handsPlayed} hands played
            </p>
          </div>

          {/* Your result */}
          <div className="text-center mb-6 py-4 bg-amber-900/30 rounded-lg">
            <p className="text-gray-400 text-sm mb-1">Your Finish</p>
            <div className="text-4xl font-bold">
              {getMedal(myRank)} #{myRank}
            </div>
            <p className="text-2xl text-amber-400 mt-1">
              {myStanding?.score ?? 0} points
            </p>
          </div>

          {/* Leaderboard */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 text-center">Final Standings</h2>
            <div className="space-y-2">
              {finalStandings.map((standing) => (
                <div
                  key={standing.position}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    standing.position === myPosition
                      ? 'bg-amber-600/30 border border-amber-500/50'
                      : 'bg-black/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl w-8 text-center">
                      {getMedal(standing.rank) || `#${standing.rank}`}
                    </span>
                    <span className={standing.position === myPosition ? 'font-bold' : ''}>
                      {standing.name}
                      {standing.position === myPosition && ' (You)'}
                    </span>
                  </div>
                  <span className="font-mono text-lg">
                    {standing.score}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={() => onlineActions.playAgain()}
              className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-lg transition-colors"
            >
              Back to Lobby
            </button>

            <button
              onClick={() => {
                onlineActions.leaveRoom();
                goToHome();
              }}
              className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
            >
              Leave Room
            </button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-red-900/90 p-3 text-center text-red-200 text-sm">
            {error}
          </div>
        )}
      </div>
    );
  }

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
    crackState: gameState?.crackState,
  };

  // Build GameUIActions - map to WebSocket actions with logging
  const gameUIActions: GameUIActions = {
    onPick: handlePick,
    onPass: handlePass,
    onBury: handleBury,
    onCallAce: handleCallAce,
    onCallTen: handleCallTen,
    onGoAlone: handleGoAlone,
    onPlayCard: handlePlayCard,
    onLeaveGame: () => onlineActions.leaveRoom(),
    // Cracking actions
    onCrack: () => {
      if (myPosition === null) return;
      addLogEntry(getPlayerName(myPosition), 'cracked!', '', true, 'cracking');
      onlineActions.sendAction({ type: 'crack' });
    },
    onRecrack: () => {
      if (myPosition === null) return;
      addLogEntry(getPlayerName(myPosition), 'recracked!', '', true, 'cracking');
      onlineActions.sendAction({ type: 'recrack' });
    },
    onNoCrack: () => {
      if (myPosition === null) return;
      addLogEntry(getPlayerName(myPosition), 'passed on crack', '', true, 'cracking');
      onlineActions.sendAction({ type: 'noCrack' });
    },
    onBlitz: () => {
      if (myPosition === null) return;
      addLogEntry(getPlayerName(myPosition), 'blitzed!', '', true, 'picking');
      onlineActions.sendAction({ type: 'blitz' });
    },
    // Online mode doesn't have these local features
    onNewGame: undefined,
    onNewHand: undefined,
  };

  // Hand score from server (sent when phase is 'scoring')
  const currentHandScore = gameState?.handScore || null;

  // Build GameUIConfig
  const gameUIConfig: GameUIConfig = {
    mode: 'online',
    roomCode: roomCode || undefined,
    activePlayerPosition: myPosition,

    // Feature toggles
    coachingEnabled: gameSettings.coachingEnabled,
    showStrategyTips: gameSettings.showStrategyTips,
    showAIExplanations: false, // No AI explanations in online (other players)

    // Scores and history
    playerScores,
    handsPlayed,
    maxHands: onlineState.roomSettings?.maxHands ?? 0,
    gameLog,
    shuffleSeed: gameState?.shuffleSeed || null,

    // Helpers
    getLegalPlays,
    getCallableSuits,
    getCallableTens,
    canBury,
    canBlitz: () => {
      // Can blitz if blitzes are enabled and we're in picking phase and it's our turn
      if (!onlineState.roomSettings?.blitzes) return false;
      if (phase !== 'picking') return false;
      if (myPosition === null || currentPlayer !== myPosition) return false;
      return true;
    },
    getMultiplier: () => gameState?.crackState?.multiplier ?? 1,

    // Trick result
    trickResult,
    onClearTrickResult: () => setTrickResult(null),

    // Hand score
    currentHandScore,

    // Coaching
    coachingState,
    coachingActions,

    // Callbacks
    onClearLog: () => setGameLog([]),
    onToggleCoaching: () => updateSettings({ coachingEnabled: !gameSettings.coachingEnabled }),
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

      {/* Inactive player notification with kick button */}
      {inactivePlayers.size > 0 && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-amber-900/95 p-2 text-center">
          {Array.from(inactivePlayers).map(pos => {
            const player = serverPlayers.find(p => p.position === pos);
            const playerName = player?.name || `Player ${pos + 1}`;
            // Don't show kick button for yourself
            if (pos === myPosition) return null;
            return (
              <div key={pos} className="flex items-center justify-center gap-3 text-amber-100">
                <span className="text-sm">{playerName} is inactive (AI playing)</span>
                <button
                  onClick={() => onlineActions.kickInactive(pos)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-xs font-semibold transition-colors"
                >
                  Kick
                </button>
              </div>
            );
          })}
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
