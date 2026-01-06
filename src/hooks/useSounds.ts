// ============================================
// SOUND INTEGRATION HOOK
// ============================================
// Handles playing sounds at the right moments

import { useEffect, useRef } from 'react';
import { playSound, initAudio, setVolume, setMuted } from '../utils/sounds';
import { useGameStore } from '../store/gameStore';
import { isTrump } from '../game/types';

export function useSounds() {
  const {
    gameState,
    gameSettings,
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

  // Initialize audio on first user interaction
  useEffect(() => {
    const handleInteraction = () => {
      initAudio();
      // Apply saved settings
      setVolume(gameSettings.soundVolume);
      setMuted(gameSettings.soundMuted);
      // Remove listeners after first interaction
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };

    document.addEventListener('click', handleInteraction);
    document.addEventListener('keydown', handleInteraction);

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
  }, [gameSettings.soundVolume, gameSettings.soundMuted]);

  // Sync settings changes
  useEffect(() => {
    setVolume(gameSettings.soundVolume);
    setMuted(gameSettings.soundMuted);
  }, [gameSettings.soundVolume, gameSettings.soundMuted]);

  // Card played sound
  useEffect(() => {
    if (currentTrick.cards.length > prevTrickCardsRef.current) {
      // A new card was played
      const lastPlay = currentTrick.cards[currentTrick.cards.length - 1];
      if (lastPlay) {
        if (isTrump(lastPlay.card)) {
          playSound('card_play_trump');
        } else {
          playSound('card_play');
        }
      }
    }
    prevTrickCardsRef.current = currentTrick.cards.length;
  }, [currentTrick.cards.length]);

  // Trick collected sound
  useEffect(() => {
    if (trickResult && !prevTrickResultRef.current) {
      // Trick just completed - play collect sound after a brief delay
      const timer = setTimeout(() => {
        playSound('trick_collect');
      }, 800); // Wait for the "winner" display
      return () => clearTimeout(timer);
    }
    prevTrickResultRef.current = trickResult;
  }, [trickResult]);

  // Your turn sound (only for human's turn)
  useEffect(() => {
    if (
      phase === 'playing' &&
      currentPlayer !== prevCurrentPlayerRef.current &&
      activeHumanPosition !== null &&
      currentPlayer === activeHumanPosition
    ) {
      playSound('your_turn');
    }
    prevCurrentPlayerRef.current = currentPlayer;
  }, [currentPlayer, phase, activeHumanPosition]);

  // Pick blind sound
  useEffect(() => {
    if (
      prevPhaseRef.current === 'picking' &&
      (phase === 'burying' || (phase === 'playing' && pickerPosition !== null))
    ) {
      playSound('pick_blind');
    }
    prevPhaseRef.current = phase;
  }, [phase, pickerPosition]);

  // Partner reveal sound
  useEffect(() => {
    if (calledAce?.revealed && !prevCalledAceRevealedRef.current) {
      playSound('reveal_partner');
    }
    prevCalledAceRevealedRef.current = calledAce?.revealed;
  }, [calledAce?.revealed]);

  // Hand end sounds
  useEffect(() => {
    if (handHistory.length > prevHandHistoryLengthRef.current) {
      // A new hand just finished
      const lastHand = handHistory[handHistory.length - 1];
      if (lastHand) {
        const pickerWon = lastHand.pickerWins;

        if (lastHand.isSchwarz) {
          playSound(pickerWon ? 'schwarz' : 'lose_hand');
        } else if (lastHand.isSchneider) {
          playSound(pickerWon ? 'schneider' : 'lose_hand');
        } else if (pickerWon) {
          playSound('win_hand');
        } else {
          playSound('lose_hand');
        }
      }
    }
    prevHandHistoryLengthRef.current = handHistory.length;
  }, [handHistory.length]);
}

// Standalone sound helpers for use in callbacks
export function playSoundEffect(name: Parameters<typeof playSound>[0]) {
  playSound(name);
}
