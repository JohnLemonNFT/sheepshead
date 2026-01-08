'use client';

// PlayFeedback - brief contextual feedback on plays

import { useEffect, useState } from 'react';
import { Card, getCardPoints, isTrump, PlayerPosition } from '../game/types';

interface PlayFeedbackProps {
  lastPlay: {
    card: Card;
    playedBy: PlayerPosition;
    isHuman: boolean;
  } | null;
  trickCards: { card: Card; playedBy: PlayerPosition }[];
  pickerPosition: PlayerPosition | null;
  partnerPosition: PlayerPosition | null;
  partnerRevealed: boolean;
}

export function PlayFeedback({
  lastPlay,
  trickCards,
  pickerPosition,
  partnerPosition,
  partnerRevealed,
}: PlayFeedbackProps) {
  const [feedback, setFeedback] = useState<{ text: string; type: 'good' | 'neutral' | 'info' } | null>(null);

  useEffect(() => {
    if (!lastPlay) {
      setFeedback(null);
      return;
    }

    const newFeedback = analyzPlay(lastPlay, trickCards, pickerPosition, partnerPosition, partnerRevealed);
    if (newFeedback) {
      setFeedback(newFeedback);
      // Auto-clear after delay
      const timer = setTimeout(() => setFeedback(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [lastPlay, trickCards, pickerPosition, partnerPosition, partnerRevealed]);

  if (!feedback) return null;

  const bgColor = feedback.type === 'good' ? 'bg-green-600/90' :
                  feedback.type === 'info' ? 'bg-blue-600/90' : 'bg-gray-600/90';

  return (
    <div className={`${bgColor} text-white text-xs px-3 py-1.5 rounded-full animate-fadeIn`}>
      {feedback.text}
    </div>
  );
}

function analyzPlay(
  lastPlay: { card: Card; playedBy: PlayerPosition; isHuman: boolean },
  trickCards: { card: Card; playedBy: PlayerPosition }[],
  pickerPosition: PlayerPosition | null,
  partnerPosition: PlayerPosition | null,
  partnerRevealed: boolean
): { text: string; type: 'good' | 'neutral' | 'info' } | null {
  const { card, playedBy, isHuman } = lastPlay;
  const points = getCardPoints(card);
  const isPickerTeam = playedBy === pickerPosition || (partnerRevealed && playedBy === partnerPosition);
  const isDefender = pickerPosition !== null && !isPickerTeam;

  // Only show feedback sometimes to avoid spam
  if (Math.random() > 0.4 && !isHuman) return null;

  // Check if schmearing (playing high points to partner's winning trick)
  if (trickCards.length >= 2 && points >= 10) {
    const leadCard = trickCards[0].card;
    const currentWinner = findCurrentWinner(trickCards);
    const winnerIsTeammate = (
      (isPickerTeam && (currentWinner === pickerPosition || currentWinner === partnerPosition)) ||
      (isDefender && currentWinner !== pickerPosition && currentWinner !== partnerPosition)
    );

    if (winnerIsTeammate && !isTrump(card)) {
      return { text: `💰 Schmear! +${points} pts`, type: 'good' };
    }
  }

  // Led with trump
  if (trickCards.length === 1 && isTrump(card)) {
    if (card.rank === 'Q' && card.suit === 'clubs') {
      return { text: '👑 Led the boss!', type: 'good' };
    }
    return { text: '🎺 Trump lead', type: 'neutral' };
  }

  // High card played
  if (points >= 10 && trickCards.length === 1) {
    return { text: `⚠️ ${points}pts at risk`, type: 'info' };
  }

  // Trumped a fail trick
  if (trickCards.length >= 2) {
    const leadCard = trickCards[0].card;
    if (!isTrump(leadCard) && isTrump(card)) {
      return { text: '🃏 Trumped!', type: 'good' };
    }
  }

  return null;
}

function findCurrentWinner(trickCards: { card: Card; playedBy: PlayerPosition }[]): PlayerPosition {
  if (trickCards.length === 0) return 0 as PlayerPosition;

  let winningPlay = trickCards[0];
  const leadIsTrump = isTrump(trickCards[0].card);

  for (let i = 1; i < trickCards.length; i++) {
    const play = trickCards[i];
    const playIsTrump = isTrump(play.card);

    if (playIsTrump && !isTrump(winningPlay.card)) {
      winningPlay = play;
    } else if (playIsTrump && isTrump(winningPlay.card)) {
      // Both trump - compare trump power
      if (getTrumpPower(play.card) > getTrumpPower(winningPlay.card)) {
        winningPlay = play;
      }
    } else if (!playIsTrump && !isTrump(winningPlay.card)) {
      // Both fail - must be same suit to beat
      if (play.card.suit === trickCards[0].card.suit) {
        if (getFailPower(play.card) > getFailPower(winningPlay.card)) {
          winningPlay = play;
        }
      }
    }
  }

  return winningPlay.playedBy;
}

// Trump power (higher = stronger)
function getTrumpPower(card: Card): number {
  const trumpOrder = ['Q♣', 'Q♠', 'Q♥', 'Q♦', 'J♣', 'J♠', 'J♥', 'J♦', 'A♦', '10♦', 'K♦', '9♦', '8♦', '7♦'];
  const cardStr = card.rank + (card.suit === 'clubs' ? '♣' : card.suit === 'spades' ? '♠' : card.suit === 'hearts' ? '♥' : '♦');
  const index = trumpOrder.indexOf(cardStr);
  return index === -1 ? -1 : trumpOrder.length - index;
}

// Fail power (higher = stronger)
function getFailPower(card: Card): number {
  const failOrder = ['A', '10', 'K', '9', '8', '7'];
  return failOrder.length - failOrder.indexOf(card.rank);
}
