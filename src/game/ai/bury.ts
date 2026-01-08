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
 * 3. Keep "hold card" for called suit
 */
export function decideBury(
  hand: Card[], // 8 cards (original 6 + 2 from blind)
  calledSuit: Suit | null
): BuryDecision {
  // Score each card for burying
  const scoredCards = hand.map(card => ({
    card,
    score: calculateBuryScore(card, hand, calledSuit),
  }));

  // Sort by bury score (higher = better to bury)
  scoredCards.sort((a, b) => b.score - a.score);

  // Can't bury all cards of called suit
  let selectedCards: Card[] = [];
  const calledSuitCount = calledSuit
    ? hand.filter(c => c.suit === calledSuit && !isTrump(c)).length
    : 0;
  let calledSuitBuried = 0;

  for (const { card } of scoredCards) {
    if (selectedCards.length >= 2) break;

    // Check if burying this would leave no hold card
    if (calledSuit && card.suit === calledSuit && !isTrump(card)) {
      if (calledSuitBuried + 1 >= calledSuitCount) {
        continue; // Can't bury - need hold card
      }
      calledSuitBuried++;
    }

    selectedCards.push(card);
  }

  // Fallback if we couldn't find 2 cards
  if (selectedCards.length < 2) {
    const remaining = hand.filter(c => !selectedCards.includes(c));
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
