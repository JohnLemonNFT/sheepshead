// SuitHint - shows what suit must be followed or if void

import { Card, isTrump } from '../game/types';

interface SuitHintProps {
  trickCards: { card: Card; playedBy: number }[];
  legalPlays: Card[];
  hand: Card[];
  isYourTurn: boolean;
}

const SUIT_SYMBOLS: Record<string, string> = {
  clubs: '♣',
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
};

export function SuitHint({ trickCards, legalPlays, hand, isYourTurn }: SuitHintProps) {
  if (!isYourTurn || trickCards.length === 0) return null;

  const leadCard = trickCards[0].card;
  const leadIsTrump = isTrump(leadCard);
  const leadSuit = leadCard.suit;

  // Check if player can follow
  const canFollow = legalPlays.length < hand.length;
  const isVoid = !canFollow;

  if (isVoid) {
    return (
      <div className="text-center text-[10px] sm:text-xs text-green-400 mb-1 animate-pulse">
        ✨ Void in {leadIsTrump ? 'trump' : leadSuit} — play anything!
      </div>
    );
  }

  return (
    <div className="text-center text-[10px] sm:text-xs text-yellow-400 mb-1">
      Must follow {leadIsTrump ? '🃏 trump' : SUIT_SYMBOLS[leadSuit] + ' ' + leadSuit}
    </div>
  );
}
