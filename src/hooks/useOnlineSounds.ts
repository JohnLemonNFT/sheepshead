// ============================================
// ONLINE SOUND INTEGRATION HOOK
// ============================================
// Handles playing sounds for online games based on WebSocket state

import { useEffect, useRef } from 'react';
import { playSound, initAudio, setVolume, setMuted } from '../utils/sounds';
import { useGameStore } from '../store/gameStore';
import { isTrump } from '../game/types';
import type { OnlineGameState } from './useOnlineGame';
import type { PlayerPosition, Trick, Card as CardType } from '../game/types';

interface OnlineSoundsState {
  phase: string;
  currentPlayer: PlayerPosition;
  currentTrick: Trick;
  pickerPosition: PlayerPosition | null;
  calledAce: { suit: string; revealed: boolean } | null;
  trickNumber: number;
  handScore: any | null;
}

export function useOnlineSounds(onlineState: OnlineGameState) {
  const { gameSettings } = useGameStore();
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
  }, [currentTrick.cards.length, currentTrick.cards]);

  // Trick collected sound (when trick number increases or cards reset)
  useEffect(() => {
    if (trickNumber > prevTrickNumberRef.current && phase === 'playing') {
      // Trick just completed - play collect sound
      playSound('trick_collect');
    }
    prevTrickNumberRef.current = trickNumber;
  }, [trickNumber, phase]);

  // Your turn sound (only for human's turn)
  useEffect(() => {
    if (
      phase === 'playing' &&
      currentPlayer !== prevCurrentPlayerRef.current &&
      myPosition !== null &&
      currentPlayer === myPosition
    ) {
      playSound('your_turn');
    }
    prevCurrentPlayerRef.current = currentPlayer;
  }, [currentPlayer, phase, myPosition]);

  // Pick blind sound
  useEffect(() => {
    if (
      prevPhaseRef.current === 'picking' &&
      (phase === 'burying' || phase === 'calling' || (phase === 'playing' && pickerPosition !== null))
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

  // Hand end sounds (when handScore appears in scoring phase)
  useEffect(() => {
    if (phase === 'scoring' && handScore && !prevHandScoreRef.current) {
      const pickerWon = handScore.pickerWins;

      if (handScore.isSchwarz) {
        playSound(pickerWon ? 'schwarz' : 'lose_hand');
      } else if (handScore.isSchneider) {
        playSound(pickerWon ? 'schneider' : 'lose_hand');
      } else if (pickerWon) {
        playSound('win_hand');
      } else {
        playSound('lose_hand');
      }
    }

    // Reset when phase changes away from scoring
    if (phase !== 'scoring') {
      prevHandScoreRef.current = null;
    } else {
      prevHandScoreRef.current = handScore;
    }
  }, [phase, handScore]);
}
