// StrategyTips component - shows helpful tips for the human player

import { Card, Suit, Trick, CalledAce, isTrump, getTrumpPower, getCardPoints } from '../game/types';
import { getLegalPlays, getEffectiveSuit } from '../game/rules';
import { evaluateHandStrength } from '../game/ai/tracking';

interface StrategyTipsProps {
  phase: string;
  hand: Card[];
  isPicker: boolean;
  isPartner: boolean;
  currentTrick: Trick;
  calledAce: CalledAce | null;
  pickerPosition: number | null;
}

export function StrategyTips({
  phase,
  hand,
  isPicker,
  isPartner,
  currentTrick,
  calledAce,
  pickerPosition,
}: StrategyTipsProps) {
  const tips = getTips(phase, hand, isPicker, isPartner, currentTrick, calledAce, pickerPosition);

  if (tips.length === 0) return null;

  return (
    <div className="bg-indigo-900/40 border border-indigo-500 rounded-lg p-3">
      <h4 className="text-indigo-300 font-bold text-sm mb-2 flex items-center gap-2">
        <span>💡</span> Strategy Tips
      </h4>
      <ul className="space-y-1 text-sm">
        {tips.map((tip, i) => (
          <li key={i} className="text-white flex items-start gap-2">
            <span className="text-indigo-400">•</span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function getTips(
  phase: string,
  hand: Card[],
  isPicker: boolean,
  isPartner: boolean,
  currentTrick: Trick,
  calledAce: CalledAce | null,
  pickerPosition: number | null
): string[] {
  const tips: string[] = [];

  if (phase === 'picking') {
    const eval_ = evaluateHandStrength(hand);

    tips.push(`You have ${eval_.trumpCount} trump cards (${eval_.strength} hand)`);

    if (eval_.trumpCount >= 4) {
      tips.push('4+ trump is usually pickable');
    } else if (eval_.trumpCount >= 3 && eval_.hasHighTrump) {
      tips.push('3 trump with queens can be worth picking');
    } else if (eval_.trumpCount <= 2) {
      tips.push('2 or fewer trump - usually pass unless late position');
    }

    if (eval_.failAces > 0) {
      tips.push(`${eval_.failAces} fail ace${eval_.failAces > 1 ? 's' : ''} add value`);
    }

    if (eval_.voidSuits.length > 0) {
      tips.push(`Void in ${eval_.voidSuits.join(', ')} - good for trumping`);
    }
  }

  if (phase === 'burying') {
    const pointCards = hand.filter(c => getCardPoints(c) >= 10 && !isTrump(c));
    if (pointCards.length > 0) {
      tips.push('Bury high-point fail cards (Aces, 10s) to secure points');
    }

    // Check for potential voids
    const suitCounts = new Map<Suit, number>();
    for (const suit of ['clubs', 'spades', 'hearts'] as Suit[]) {
      const count = hand.filter(c => c.suit === suit && !isTrump(c)).length;
      if (count > 0 && count <= 2) {
        suitCounts.set(suit, count);
      }
    }
    if (suitCounts.size > 0) {
      const shortSuit = [...suitCounts.entries()].sort((a, b) => a[1] - b[1])[0];
      tips.push(`Burying ${shortSuit[0]} cards creates a void for trumping later`);
    }

    tips.push('Keep at least one card of the suit you plan to call');
  }

  if (phase === 'calling') {
    tips.push('Call a suit where you are VOID (partner plays ace, you trump it)');
    tips.push('Or call where you have the 10 (schmear points to partner)');
    tips.push('Avoid calling suits where you have many cards');
  }

  if (phase === 'playing') {
    const legalPlays = getLegalPlays(hand, currentTrick, calledAce, isPicker, isPartner);
    const isLeading = currentTrick.cards.length === 0;

    if (isPicker) {
      if (isLeading) {
        tips.push('As picker, lead trump to pull out defenders\' trump');
        const highTrump = legalPlays.filter(c => isTrump(c) && getTrumpPower(c) < 4);
        if (highTrump.length > 0) {
          tips.push('Lead high trump (Queens) to establish control');
        }
      } else {
        tips.push('Try to win tricks with points');
      }
    } else if (isPartner) {
      if (isLeading) {
        tips.push('As partner, lead trump to help the picker');
      } else {
        tips.push('Schmear points to picker when they\'re winning');
      }
    } else {
      // Defender
      if (isLeading) {
        tips.push('As defender, lead short suits to create trumping opportunities');
        tips.push('Avoid leading trump (helps the picker)');
      } else {
        // Check if picker is winning
        if (currentTrick.cards.length > 0) {
          const highPointCards = legalPlays.filter(c => getCardPoints(c) >= 10);
          tips.push('Don\'t schmear points to the picker team');
          if (highPointCards.length > 0) {
            tips.push('Play low cards when opponents are winning');
          }
        }
      }
    }

    // Must follow suit reminder
    if (!isLeading && legalPlays.length < hand.length) {
      const leadCard = currentTrick.cards[0].card;
      const leadSuit = getEffectiveSuit(leadCard);
      tips.push(`Must follow ${leadSuit === 'trump' ? 'trump' : leadSuit} if able`);
    }
  }

  return tips.slice(0, 4); // Max 4 tips
}
