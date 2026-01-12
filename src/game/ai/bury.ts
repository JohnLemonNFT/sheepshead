// ============================================
// AI BURY DECISION - What cards should picker bury?
// ============================================

import { Card, Suit, isTrump, getCardPoints, FAIL_SUITS } from '../types';

export interface BuryDecision {
  cardsToBury: [Card, Card];
  reason: string;
}

/**
 * Decide which 2 cards to bury
 * Strategy:
 * 1. Bury points (Aces and 10s of fail suits are best)
 * 2. Create voids for trumping opportunities
 * 3. Keep "hold card" for at least one callable suit (CRITICAL!)
 */
export function decideBury(
  hand: Card[], // 8 cards (original 6 + 2 from blind)
  calledSuit: Suit | null
): BuryDecision {
  // IMPORTANT: Identify suits we could potentially call (don't have the ace)
  // We MUST keep at least one hold card in at least one callable suit
  const callableSuits = FAIL_SUITS.filter(suit => {
    const hasAce = hand.some(c => c.suit === suit && c.rank === 'A');
    const hasNonAce = hand.some(c => c.suit === suit && c.rank !== 'A' && !isTrump(c));
    return !hasAce && hasNonAce; // Can call: don't have ace, have hold card
  });

  // Track how many hold cards we have per callable suit
  const holdCardsPerSuit: Record<string, number> = {};
  for (const suit of callableSuits) {
    holdCardsPerSuit[suit] = hand.filter(c => c.suit === suit && !isTrump(c)).length;
  }

  // Score each card for burying
  const scoredCards = hand.map(card => ({
    card,
    score: calculateBuryScore(card, hand, calledSuit),
  }));

  // Sort by bury score (higher = better to bury)
  scoredCards.sort((a, b) => b.score - a.score);

  // Track what we've selected to bury
  let selectedCards: Card[] = [];
  const buriedPerSuit: Record<string, number> = {};

  for (const { card } of scoredCards) {
    if (selectedCards.length >= 2) break;

    // Skip trump cards in this selection pass
    if (isTrump(card)) continue;

    // NEVER bury aces in first pass - they're control cards!
    // Aces win tricks and are too valuable to bury
    if (card.rank === 'A') continue;

    const suit = card.suit;
    const isCallableSuit = callableSuits.includes(suit);

    // If this is a callable suit, check if we can afford to bury it
    if (isCallableSuit) {
      const alreadyBuried = buriedPerSuit[suit] || 0;
      const remaining = holdCardsPerSuit[suit] - alreadyBuried;

      // Check if any OTHER callable suit would remain with hold cards
      const otherCallableSuitsWithHoldCards = callableSuits.filter(s => {
        if (s === suit) return false;
        const sBuried = buriedPerSuit[s] || 0;
        return holdCardsPerSuit[s] - sBuried > 0;
      });

      // Only bury if: we have 2+ hold cards in this suit, OR another callable suit exists
      if (remaining <= 1 && otherCallableSuitsWithHoldCards.length === 0) {
        continue; // Can't bury - would leave no callable suits!
      }

      buriedPerSuit[suit] = alreadyBuried + 1;
    }

    selectedCards.push(card);
  }

  // If we still need more cards, consider trump or other cards
  // BUT STILL respect callable suit protection!
  if (selectedCards.length < 2) {
    for (const { card } of scoredCards) {
      if (selectedCards.length >= 2) break;
      if (selectedCards.includes(card)) continue;

      // Still skip aces in first fallback - try to find other options
      if (card.rank === 'A') continue;

      // Even in fallback, protect the last hold card of callable suits
      if (!isTrump(card)) {
        const suit = card.suit;
        const isCallableSuit = callableSuits.includes(suit);
        if (isCallableSuit) {
          const alreadyBuried = buriedPerSuit[suit] || 0;
          const remaining = holdCardsPerSuit[suit] - alreadyBuried;
          const otherCallableSuitsWithHoldCards = callableSuits.filter(s => {
            if (s === suit) return false;
            const sBuried = buriedPerSuit[s] || 0;
            return holdCardsPerSuit[s] - sBuried > 0;
          });
          // Skip if this would eliminate all callable suits
          if (remaining <= 1 && otherCallableSuitsWithHoldCards.length === 0) {
            continue;
          }
          buriedPerSuit[suit] = alreadyBuried + 1;
        }
      }

      selectedCards.push(card);
    }
  }

  // Final fallback - if we STILL can't find 2 cards, we have no choice
  // This should be rare (means we're forced to bury our only hold card)
  if (selectedCards.length < 2) {
    const remaining = hand.filter(c => !selectedCards.includes(c));
    // Prefer trump over the last hold card
    remaining.sort((a, b) => {
      if (isTrump(a) && !isTrump(b)) return -1;
      if (!isTrump(a) && isTrump(b)) return 1;
      return 0;
    });
    while (selectedCards.length < 2 && remaining.length > 0) {
      selectedCards.push(remaining.shift()!);
    }
  }

  const cardsToBury = selectedCards.slice(0, 2) as [Card, Card];

  // Build reason
  const points = cardsToBury.reduce((sum, c) => sum + getCardPoints(c), 0);
  const createsVoid = checkCreatesVoid(hand, cardsToBury);

  let reason = `Buried ${points} points`;
  if (createsVoid.length > 0) {
    reason += `, created void in ${createsVoid.join(', ')}`;
  }

  return { cardsToBury, reason };
}

/**
 * Calculate how good a card is to bury (higher = bury it)
 */
function calculateBuryScore(
  card: Card,
  hand: Card[],
  calledSuit: Suit | null
): number {
  let score = 0;

  // Trump should generally not be buried
  if (isTrump(card)) {
    score -= 50;
    // But low trump with many trump can be buried
    if (card.rank === '7' || card.rank === '8') {
      const trumpCount = hand.filter(c => isTrump(c)).length;
      if (trumpCount >= 6) {
        score += 30; // OK to bury low trump if we have lots
      }
    }
    return score;
  }

  // BEST PRACTICE: NEVER bury fail aces!
  // Aces are CONTROL cards - they WIN tricks. 11 points that can win is better
  // than 11 points buried. Bury points that CAN'T win (10s, Kings).
  if (card.rank === 'A') {
    score -= 50; // Strong penalty - aces are control cards!
  }

  // 10s are GREAT to bury (10 points but don't beat aces)
  if (card.rank === '10') {
    score += 30; // 10s are the best cards to bury
  }

  // Kings are decent to bury (4 points, rarely win)
  if (card.rank === 'K') {
    score += 12;
  }

  // Creating void is valuable
  const suitCount = hand.filter(c => c.suit === card.suit && !isTrump(c)).length;
  if (suitCount === 1) {
    score += 20; // Burying creates void
  } else if (suitCount === 2) {
    score += 10; // Getting closer to void
  }

  // Penalty for called suit cards (need hold card)
  if (calledSuit && card.suit === calledSuit) {
    score -= 25; // Prefer not to bury called suit
  }

  // Low cards without points are less valuable to bury
  // (burying 0 points doesn't help, but creating void might)
  if (card.rank === '7' || card.rank === '8' || card.rank === '9') {
    score -= 5;
  }

  return score;
}

/**
 * Check if burying these cards creates any voids
 */
function checkCreatesVoid(hand: Card[], toBury: Card[]): Suit[] {
  const voids: Suit[] = [];

  for (const suit of FAIL_SUITS) {
    const suitCards = hand.filter(c => c.suit === suit && !isTrump(c));
    const remainingAfterBury = suitCards.filter(
      c => !toBury.some(b => b.id === c.id)
    );

    if (suitCards.length > 0 && remainingAfterBury.length === 0) {
      voids.push(suit);
    }
  }

  return voids;
}

/**
 * Explain the bury decision in detail
 */
export function explainBuryDecision(
  hand: Card[],
  decision: BuryDecision,
  calledSuit: Suit | null
): string {
  const lines: string[] = [];
  lines.push(decision.reason);
  lines.push('');

  const [card1, card2] = decision.cardsToBury;
  lines.push(`Buried cards:`);
  lines.push(`- ${card1.rank} of ${card1.suit} (${getCardPoints(card1)} pts)`);
  lines.push(`- ${card2.rank} of ${card2.suit} (${getCardPoints(card2)} pts)`);

  const points = getCardPoints(card1) + getCardPoints(card2);
  lines.push(`Total: ${points} points secured for picker team`);

  if (calledSuit) {
    const holdCards = hand.filter(
      c => c.suit === calledSuit && !isTrump(c) && !decision.cardsToBury.includes(c)
    );
    lines.push(`Hold card${holdCards.length > 1 ? 's' : ''}: ${holdCards.map(c => c.rank).join(', ')} of ${calledSuit}`);
  }

  return lines.join('\n');
}
