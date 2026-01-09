// ============================================
// HAPTIC FEEDBACK HOOK
// ============================================
// Handles triggering haptics at the right moments for native feel

import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import {
  tapLight,
  tapMedium,
  tapHeavy,
  notifySuccess,
  notifyWarning,
  notifyError
} from '../utils/haptics';
import { isTrump } from '../game/types';

export function useHaptics() {
  const {
    gameState,
    trickResult,
    handHistory,
    activeHumanPosition,
  } = useGameStore();

  const { phase, currentPlayer, currentTrick, calledAce, pickerPosition } = gameState;

  // Track previous values to detect changes
  const prevPhaseRef = useRef(phase);
  const prevTrickCardsRef = useRef(currentTrick.cards.length);
  const prevTrickResultRef = useRef<typeof trickResult>(null);
  const prevCalledAceRevealedRef = useRef(calledAce?.revealed);
  const prevCurrentPlayerRef = useRef(currentPlayer);
  const prevHandHistoryLengthRef = useRef(handHistory.length);

  // Card played haptic
  useEffect(() => {
    if (currentTrick.cards.length > prevTrickCardsRef.current) {
      // A new card was played
      const lastPlay = currentTrick.cards[currentTrick.cards.length - 1];
      if (lastPlay) {
        if (isTrump(lastPlay.card)) {
          tapMedium(); // Stronger feedback for trump
        } else {
          tapLight(); // Light tap for regular card
        }
      }
    }
    prevTrickCardsRef.current = currentTrick.cards.length;
  }, [currentTrick.cards.length]);

  // Trick won haptic
  useEffect(() => {
    if (trickResult && !prevTrickResultRef.current) {
      // Trick just completed
      const timer = setTimeout(() => {
        if (trickResult.winner === activeHumanPosition) {
          tapHeavy(); // Strong feedback when YOU win the trick
        } else {
          tapLight(); // Light tap when someone else wins
        }
      }, 600);
      return () => clearTimeout(timer);
    }
    prevTrickResultRef.current = trickResult;
  }, [trickResult, activeHumanPosition]);

  // Your turn haptic
  useEffect(() => {
    if (
      phase === 'playing' &&
      currentPlayer !== prevCurrentPlayerRef.current &&
      activeHumanPosition !== null &&
      currentPlayer === activeHumanPosition
    ) {
      tapLight(); // Gentle reminder it's your turn
    }
    prevCurrentPlayerRef.current = currentPlayer;
  }, [currentPlayer, phase, activeHumanPosition]);

  // Pick blind haptic
  useEffect(() => {
    if (
      prevPhaseRef.current === 'picking' &&
      (phase === 'burying' || (phase === 'playing' && pickerPosition !== null))
    ) {
      tapMedium(); // Someone picked
    }
    prevPhaseRef.current = phase;
  }, [phase, pickerPosition]);

  // Partner reveal haptic
  useEffect(() => {
    if (calledAce?.revealed && !prevCalledAceRevealedRef.current) {
      tapHeavy(); // Dramatic reveal!
    }
    prevCalledAceRevealedRef.current = calledAce?.revealed;
  }, [calledAce?.revealed]);

  // Hand end haptics
  useEffect(() => {
    if (handHistory.length > prevHandHistoryLengthRef.current) {
      const lastHand = handHistory[handHistory.length - 1];
      if (lastHand) {
        // Check human's score change to determine if they won
        const humanScoreEntry = lastHand.playerScores.find(
          s => s.position === activeHumanPosition
        );
        const humanWon = humanScoreEntry && humanScoreEntry.points > 0;

        if (lastHand.isSchwarz) {
          // Schwarz is a big deal either way
          if (humanWon) {
            notifySuccess();
          } else {
            notifyError();
          }
        } else if (humanWon) {
          notifySuccess();
        } else {
          notifyWarning();
        }
      }
    }
    prevHandHistoryLengthRef.current = handHistory.length;
  }, [handHistory.length, activeHumanPosition]);
}
