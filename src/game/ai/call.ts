// ============================================
// AI CALL DECISION - Which ace to call for partner?
// ============================================

import { Card, Suit, isTrump, FAIL_SUITS } from '../types';
import { getCallableSuits, getCallableTens } from '../rules';

export interface CallDecision {
  suit: Suit | null; // null = go alone
  goAlone: boolean;
  callTen?: boolean; // true = calling a 10 instead of ace
  reason: string;
}

/**
 * Decide which suit's ace (or 10) to call for partner
 * Strategy:
 * 1. Prefer suits where we're void (partner plays ace, we trump)
 * 2. Prefer suits where we have 10 + other (can schmear to partner)
 * 3. Avoid suits with many cards (harder to get partner to win)
 * 4. Go alone if hand is extremely strong
 * 5. If have all 3 aces and callTen is enabled, call a 10 instead
 */
export function decideCall(
  hand: Card[], // Hand after burying
  callTenEnabled: boolean = false
): CallDecision {
  // Get callable suits
  const callableSuits = getCallableSuits(hand);
  const callableTenSuits = callTenEnabled ? getCallableTens(hand) : [];

  // Check if we have all fail aces
  const failAces = hand.filter(c => !isTrump(c) && c.rank === 'A');
  const hasAllAces = failAces.length >= 3;

  // If have all aces but can call a 10, prefer that over going alone
  if (hasAllAces && callableTenSuits.length > 0) {
    // Score each callable 10 (prefer shortest suit)
    const scoredTens = callableTenSuits.map(suit => {
      const cardsInSuit = hand.filter(c => c.suit === suit && !isTrump(c));
      return { suit, count: cardsInSuit.length };
    });
    scoredTens.sort((a, b) => a.count - b.count);

    return {
      suit: scoredTens[0].suit,
      goAlone: false,
      callTen: true,
      reason: `Calling ${scoredTens[0].suit} 10 - have all fail aces`,
    };
  }

  // If have all aces and can't call a 10, must go alone
  if (hasAllAces) {
    return {
      suit: null,
      goAlone: true,
      reason: 'Going alone - have all fail aces',
    };
  }

  // Check if we SHOULD go alone (very strong hand)
  const trumpCount = hand.filter(c => isTrump(c)).length;
  if (trumpCount >= 6 && failAces.length >= 2) {
    return {
      suit: null,
      goAlone: true,
      reason: `Going alone with ${trumpCount} trump and ${failAces.length} fail aces`,
    };
  }

  if (callableSuits.length === 0) {
    // No valid suits to call - must go alone
    return {
      suit: null,
      goAlone: true,
      reason: 'Going alone - no valid suit to call',
    };
  }

  // Score each callable suit
  const scoredSuits = callableSuits.map(suit => ({
    suit,
    score: calculateCallScore(hand, suit),
    reason: getCallReason(hand, suit),
  }));

  // Sort by score (higher = better to call)
  scoredSuits.sort((a, b) => b.score - a.score);

  const best = scoredSuits[0];

  return {
    suit: best.suit,
    goAlone: false,
    reason: best.reason,
  };
}

/**
 * Calculate how good a suit is to call (higher = better)
 */
function calculateCallScore(hand: Card[], suit: Suit): number {
  let score = 0;

  // Get non-trump cards of this suit
  const suitCards = hand.filter(c => c.suit === suit && !isTrump(c));
  const suitCount = suitCards.length;

  // Void in suit is best - partner plays ace, we can trump
  if (suitCount === 0) {
    score += 50;
  }
  // One card is good - can lead to partner
  else if (suitCount === 1) {
    score += 30;
    // If it's a 10, we can schmear
    if (suitCards[0].rank === '10') {
      score += 20;
    }
  }
  // Two cards is okay
  else if (suitCount === 2) {
    score += 15;
    // If we have 10, can schmear
    if (suitCards.some(c => c.rank === '10')) {
      score += 15;
    }
  }
  // Many cards is bad (harder for partner to win tricks in this suit)
  else {
    score += 5;
  }

  // Check if we have the 10 (can schmear)
  const has10 = suitCards.some(c => c.rank === '10');
  if (has10 && suitCount >= 1) {
    score += 10;
  }

  return score;
}

/**
 * Get human-readable reason for calling a suit
 */
function getCallReason(hand: Card[], suit: Suit): string {
  const suitCards = hand.filter(c => c.suit === suit && !isTrump(c));
  const suitCount = suitCards.length;

  if (suitCount === 0) {
    return `Calling ${suit} - void, can trump partner's ace`;
  }

  const has10 = suitCards.some(c => c.rank === '10');
  if (has10) {
    return `Calling ${suit} - have 10 to schmear to partner`;
  }

  if (suitCount === 1) {
    return `Calling ${suit} - only ${suitCards[0].rank}, can lead to partner`;
  }

  return `Calling ${suit} - ${suitCount} cards, manageable`;
}

/**
 * Explain the call decision in detail
 */
export function explainCallDecision(
  hand: Card[],
  decision: CallDecision
): string {
  const lines: string[] = [];
  lines.push(decision.reason);
  lines.push('');

  if (decision.goAlone) {
    const trumpCount = hand.filter(c => isTrump(c)).length;
    const failAces = hand.filter(c => !isTrump(c) && c.rank === 'A').length;
    lines.push(`Hand strength: ${trumpCount} trump, ${failAces} fail aces`);
    lines.push('Confident in winning without partner help.');
  } else if (decision.suit) {
    const suitCards = hand.filter(c => c.suit === decision.suit && !isTrump(c));
    lines.push(`Cards in ${decision.suit}: ${suitCards.length > 0 ? suitCards.map(c => c.rank).join(', ') : 'void'}`);

    const callableSuits = getCallableSuits(hand);
    if (callableSuits.length > 1) {
      lines.push(`Other options: ${callableSuits.filter(s => s !== decision.suit).join(', ')}`);
    }
  }

  return lines.join('\n');
}
