// ============================================
// AI BURY DECISION - What cards should picker bury?
// ============================================
// Key strategy from consumed sources:
// - "Plan the call BEFORE you bury" - decide what to call first
// - "Never bury your hold card" - protect the suit you'll call
// - "Bury points" - 10s are best (10 pts, can't beat aces)
// - "Create voids" - being void lets you trump
// - "Consolidate suits" - don't spread across many fail suits
// - Aces are CONTROL cards - only bury if needed to avoid forced alone

import { Card, Suit, isTrump, getCardPoints, FAIL_SUITS } from '../types';

export interface BuryDecision {
  cardsToBury: [Card, Card];
  reason: string;
  plannedCall?: Suit; // The suit we plan to call after burying
}

interface CallPlan {
  suit: Suit | null; // null = go alone
  holdCards: Card[]; // Cards we must keep for this plan
  score: number; // How good this plan is
  reason: string;
}

/**
 * Decide which 2 cards to bury
 *
 * Strategy (from consumed sources):
 * 1. PLAN THE CALL FIRST - decide what suit to call
 * 2. Protect hold cards for planned call suit
 * 3. Bury 10s first (best points-to-power ratio)
 * 4. Create voids for trumping opportunities
 * 5. Consider burying an ace if it avoids forced go-alone
 */
export function decideBury(
  hand: Card[], // 8 cards (original 6 + 2 from blind)
  calledSuit: Suit | null // Will be null during bury phase
): BuryDecision {
  // STEP 1: Plan the call - what suit should we call?
  const callPlan = planBestCall(hand);

  // STEP 2: Identify cards we MUST keep (hold cards for planned call)
  const protectedCards = new Set(callPlan.holdCards.map(c => c.id));

  // STEP 3: Score all cards for burying (higher = better to bury)
  const buryableCards = hand.filter(c => !protectedCards.has(c.id));

  const scoredCards = buryableCards.map(card => ({
    card,
    score: calculateBuryScore(card, hand, callPlan),
  }));

  // Sort by bury score (higher = bury first)
  scoredCards.sort((a, b) => b.score - a.score);

  // STEP 4: Select best 2 cards to bury
  let selectedCards: Card[] = [];

  for (const { card } of scoredCards) {
    if (selectedCards.length >= 2) break;
    selectedCards.push(card);
  }

  // STEP 5: If we couldn't find 2 cards (all protected), we need fallback
  // This means we're going alone - just pick lowest value cards
  if (selectedCards.length < 2) {
    const remaining = hand
      .filter(c => !selectedCards.some(s => s.id === c.id))
      .sort((a, b) => {
        // Prefer burying non-trump over trump
        if (isTrump(a) && !isTrump(b)) return 1;
        if (!isTrump(a) && isTrump(b)) return -1;
        // Then by points (lower points = keep)
        return getCardPoints(b) - getCardPoints(a);
      });

    while (selectedCards.length < 2 && remaining.length > 0) {
      selectedCards.push(remaining.shift()!);
    }
  }

  const cardsToBury = selectedCards.slice(0, 2) as [Card, Card];

  // Build reason
  const points = cardsToBury.reduce((sum, c) => sum + getCardPoints(c), 0);
  const voids = checkCreatesVoid(hand, cardsToBury);

  let reason = `Buried ${points} points`;
  if (voids.length > 0) {
    reason += `, void in ${voids.join('/')}`;
  }
  if (callPlan.suit) {
    reason += ` (will call ${callPlan.suit})`;
  } else {
    reason += ` (going alone)`;
  }

  return {
    cardsToBury,
    reason,
    plannedCall: callPlan.suit || undefined,
  };
}

/**
 * Plan the best calling strategy BEFORE burying
 * This is the key insight: decide the call first, then bury to support it
 */
function planBestCall(hand: Card[]): CallPlan {
  const plans: CallPlan[] = [];

  // Analyze current hand state
  const failCards = hand.filter(c => !isTrump(c));
  const trumpCount = hand.filter(c => isTrump(c)).length;
  const queens = hand.filter(c => c.rank === 'Q').length;

  // Check each fail suit for calling potential
  for (const suit of FAIL_SUITS) {
    const suitCards = failCards.filter(c => c.suit === suit);
    const hasAce = suitCards.some(c => c.rank === 'A');
    const nonAceCards = suitCards.filter(c => c.rank !== 'A');

    if (!hasAce && nonAceCards.length > 0) {
      // This suit is callable - we don't have the ace but have hold card(s)
      const score = calculateCallPlanScore(hand, suit, nonAceCards);
      plans.push({
        suit,
        holdCards: nonAceCards.slice(0, 1), // Keep at least 1 hold card
        score,
        reason: `Call ${suit}`,
      });
    } else if (hasAce && nonAceCards.length > 0) {
      // We have the ace - but what if we BURY it?
      // This creates a callable suit! Consider this option.
      const aceCard = suitCards.find(c => c.rank === 'A')!;
      const scoreIfBuryAce = calculateCallPlanScore(hand, suit, nonAceCards) - 15; // Penalty for losing ace control

      // Only consider if no other callable suits exist
      const otherCallable = FAIL_SUITS.filter(s => {
        if (s === suit) return false;
        const cards = failCards.filter(c => c.suit === s);
        return !cards.some(c => c.rank === 'A') && cards.length > 0;
      });

      if (otherCallable.length === 0) {
        // No other callable suits - burying this ace creates one
        plans.push({
          suit,
          holdCards: nonAceCards.slice(0, 1),
          score: scoreIfBuryAce + 30, // Bonus: avoids forced alone!
          reason: `Bury ${suit} ace to create callable suit`,
        });
      }
    }
  }

  // Check for forced/voluntary go-alone
  const hasMonsterHand = queens >= 3 || (queens >= 2 && trumpCount >= 6);

  if (plans.length === 0 || hasMonsterHand) {
    // Going alone - either forced or voluntary
    const goAlonePlan: CallPlan = {
      suit: null,
      holdCards: [], // No hold cards needed when going alone
      score: hasMonsterHand ? 100 : -50, // Monster hand = good, forced = bad
      reason: hasMonsterHand ? 'Monster hand - go alone' : 'No callable suits - forced alone',
    };

    if (hasMonsterHand) {
      // Monster hand prefers going alone
      return goAlonePlan;
    }

    // Not monster hand - if we have plans, use them; otherwise forced alone
    if (plans.length === 0) {
      return goAlonePlan;
    }
  }

  // Sort plans by score and return best
  plans.sort((a, b) => b.score - a.score);
  return plans[0];
}

/**
 * Score a calling plan (higher = better)
 */
function calculateCallPlanScore(hand: Card[], suit: Suit, holdCards: Card[]): number {
  let score = 50; // Base score for having a callable suit

  const holdCount = holdCards.length;

  // Void is best (can trump partner's ace)
  // But we need at least 1 hold card... so 1 card is actually best
  if (holdCount === 1) {
    score += 30; // Perfect - minimal exposure
  } else if (holdCount === 2) {
    score += 15; // Good - can lead to partner
  } else {
    score -= (holdCount - 2) * 5; // Many cards = harder for partner
  }

  // Having the 10 is great (can schmear to partner)
  if (holdCards.some(c => c.rank === '10')) {
    score += 25;
  }

  // Low cards are better hold cards (less points at risk)
  const holdPoints = holdCards.reduce((sum, c) => sum + getCardPoints(c), 0);
  score -= holdPoints * 0.5; // Slight penalty for high-point hold cards

  return score;
}

/**
 * Calculate how good a card is to bury (higher = better to bury)
 */
function calculateBuryScore(
  card: Card,
  hand: Card[],
  callPlan: CallPlan
): number {
  let score = 0;

  // === TRUMP ===
  if (isTrump(card)) {
    score -= 100; // Almost never bury trump

    // Exception: low diamonds with lots of trump
    if (card.suit === 'diamonds' && (card.rank === '7' || card.rank === '8')) {
      const trumpCount = hand.filter(c => isTrump(c)).length;
      if (trumpCount >= 7) {
        score += 80; // OK to bury low diamond with 7+ trump
      }
    }
    return score;
  }

  // === FAIL CARDS ===

  // BEST: 10s are the ideal cards to bury
  // - 10 points (great value!)
  // - Can't beat aces (limited trick-winning power)
  // - "Bury 10s first" is standard advice
  if (card.rank === '10') {
    score += 40;
  }

  // GOOD: Kings (4 points, rarely win tricks)
  if (card.rank === 'K') {
    score += 20;
  }

  // ACES: Control cards - generally don't bury
  // Exception: Burying creates a callable suit (handled in planBestCall)
  if (card.rank === 'A') {
    // Check if this is the ace we SHOULD bury (per call plan)
    if (callPlan.reason.includes(`Bury ${card.suit} ace`)) {
      score += 35; // This ace should be buried to create callable suit
    } else {
      score -= 30; // Don't bury aces - they win tricks!
    }
  }

  // Low cards (7, 8, 9) - less valuable to bury (0 points)
  if (card.rank === '7' || card.rank === '8' || card.rank === '9') {
    score -= 10;
  }

  // === VOID CREATION ===
  // Burying to create void is valuable (can trump that suit later)
  const suitCards = hand.filter(c => c.suit === card.suit && !isTrump(c));
  if (suitCards.length === 1) {
    score += 25; // Creates void!
  } else if (suitCards.length === 2) {
    score += 10; // Gets closer to void
  }

  // === PROTECT CALL SUIT ===
  // If this card is in our planned call suit, prefer not to bury
  if (callPlan.suit && card.suit === callPlan.suit) {
    score -= 20;
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

  const actualCalledSuit = calledSuit || decision.plannedCall;
  if (actualCalledSuit) {
    const holdCards = hand.filter(
      c => c.suit === actualCalledSuit && !isTrump(c) && !decision.cardsToBury.includes(c)
    );
    if (holdCards.length > 0) {
      lines.push(`Hold card${holdCards.length > 1 ? 's' : ''}: ${holdCards.map(c => c.rank).join(', ')} of ${actualCalledSuit}`);
    }
  }

  return lines.join('\n');
}
