// ============================================
// ONLINE HAPTIC FEEDBACK HOOK
// ============================================
// Handles triggering haptics for online games based on WebSocket state

import { useEffect, useRef } from 'react';
import {
  tapLight,
  tapMedium,
  tapHeavy,
  notifySuccess,
  notifyWarning,
  notifyError
} from '../utils/haptics';
import { isTrump } from '../game/types';
import type { OnlineGameState } from './useOnlineGame';
import type { PlayerPosition, Trick } from '../game/types';

export function useOnlineHaptics(onlineState: OnlineGameState) {
  const { myPosition, gameState } = onlineState;

  // Extract state with safe defaults
  const phase = gameState?.phase ?? 'dealing';
  const currentPlayer = gameState?.currentPlayer ?? (0 as PlayerPosition);
  const currentTrick: Trick = gameState?.currentTrick ?? { cards: [], leadPlayer: 0 as PlayerPosition };
  const pickerPosition = gameState?.pickerPosition ?? null;
  const calledAce = gameState?.calledAce ?? null;
  const trickNumber = gameState?.trickNumber ?? 1;
  const handScore = gameState?.handScore ?? null;

  // Track previous values to detect changes
  const prevPhaseRef = useRef(phase);
  const prevTrickCardsRef = useRef(currentTrick.cards.length);
  const prevCalledAceRevealedRef = useRef(calledAce?.revealed);
  const prevCurrentPlayerRef = useRef(currentPlayer);
  const prevTrickNumberRef = useRef(trickNumber);
  const prevHandScoreRef = useRef<any>(null);

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
  }, [currentTrick.cards.length, currentTrick.cards]);

  // Trick won haptic
  useEffect(() => {
    if (trickNumber > prevTrickNumberRef.current && phase === 'playing') {
      // Check who won the last trick based on current player (winner leads next)
      // For simplicity, give feedback when trick completes
      tapLight();
    }
    prevTrickNumberRef.current = trickNumber;
  }, [trickNumber, phase]);

  // Your turn haptic
  useEffect(() => {
    if (
      phase === 'playing' &&
      currentPlayer !== prevCurrentPlayerRef.current &&
      myPosition !== null &&
      currentPlayer === myPosition
    ) {
      tapLight(); // Gentle reminder it's your turn
    }
    prevCurrentPlayerRef.current = currentPlayer;
  }, [currentPlayer, phase, myPosition]);

  // Pick blind haptic
  useEffect(() => {
    if (
      prevPhaseRef.current === 'picking' &&
      (phase === 'burying' || phase === 'calling' || (phase === 'playing' && pickerPosition !== null))
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

  // Hand end haptics (when handScore appears in scoring phase)
  useEffect(() => {
    if (phase === 'scoring' && handScore && !prevHandScoreRef.current) {
      // Find my score change
      const myScoreEntry = handScore.playerScores?.find(
        (s: { position: PlayerPosition }) => s.position === myPosition
      );
      const myWon = myScoreEntry && myScoreEntry.points > 0;

      if (handScore.isSchwarz) {
        if (myWon) {
          notifySuccess();
        } else {
          notifyError();
        }
      } else if (myWon) {
        notifySuccess();
      } else {
        notifyWarning();
      }
    }

    // Reset when phase changes away from scoring
    if (phase !== 'scoring') {
      prevHandScoreRef.current = null;
    } else {
      prevHandScoreRef.current = handScore;
    }
  }, [phase, handScore, myPosition]);
}
