// ============================================
// AI PICK DECISION - Should the AI pick up the blind?
// ============================================

import { Card, AIDifficulty, PlayerPosition, isTrump, FAIL_SUITS } from '../types';
import { evaluateHandStrength } from './tracking';
import { getPickThresholdModifier, getPersonalityMessage, getPersonality } from './personalities';
import { simulatePickDecision, QUICK_SIMULATIONS } from './monteCarlo';

export interface PickDecision {
  shouldPick: boolean;
  reason: string;
  confidence: number; // 0-1
}

/**
 * Decide whether to pick based on hand strength and position
 */
export function decideWhetherToPick(
  hand: Card[],
  position: PlayerPosition,
  dealerPosition: PlayerPosition,
  passCount: number,
  difficulty: AIDifficulty
): PickDecision {
  const eval_ = evaluateHandStrength(hand);

  // Position relative to dealer (0 = first to pick, 4 = dealer/last)
  const pickPosition = passCount;
  const isLastChance = pickPosition === 4; // Dealer forced pick in some variants
  const isPosition2 = pickPosition === 1; // Most dangerous - 3 players can go over you!
  const isOnEnd = pickPosition === 4; // Safest - you act last
  const hasLead = pickPosition === 0; // First to pick, will lead first trick

  // Check for the "Ma's" (black queens) - strongest trump combo
  const hasBlackQueens = hand.some(c => c.rank === 'Q' && c.suit === 'clubs') &&
                         hand.some(c => c.rank === 'Q' && c.suit === 'spades');

  // Adjust thresholds based on difficulty
  const thresholds = getPickThresholds(difficulty);

  // Calculate pick score
  let score = 0;
  let reasons: string[] = [];

  // CRITICAL: Minimum trump requirement
  // Without at least 2-3 trump, you have no control and will likely lose
  // This prevents picking with "3 aces + 1 queen" type hands
  if (eval_.trumpCount < 2) {
    // With 0-1 trump, almost never pick (massive penalty)
    score -= 30;
    reasons.push(`only ${eval_.trumpCount} trump - no control!`);
  } else if (eval_.trumpCount === 2) {
    // 2 trump is marginal - need very strong other factors
    score -= 10;
    reasons.push(`only ${eval_.trumpCount} trump`);
  }

  // Trump count is primary factor
  score += eval_.trumpCount * 12;
  if (eval_.trumpCount >= 4) {
    reasons.push(`${eval_.trumpCount} trump`);
  } else if (eval_.trumpCount >= 3) {
    reasons.push(`${eval_.trumpCount} trump`);
  }

  // High trump bonus (Queens are very valuable)
  // STATS: "If picker's side has the high Queen, they win 75% vs 70% baseline"
  if (eval_.hasHighTrump) {
    score += 15;
    reasons.push('have queens');
  }

  // STATS: Q♣ is the BEST card - guarantees first trick win and bleeds 5 trump
  const hasQueenOfClubs = hand.some(c => c.rank === 'Q' && c.suit === 'clubs');
  if (hasQueenOfClubs) {
    score += 8; // Extra bonus for Q♣ specifically
    reasons.push('have Q♣ (the boss)');
  }

  // Trump power (reduced weight - already counting trump quantity)
  score += Math.floor(eval_.trumpPower * 0.5);

  // Fail aces are valuable BUT only with adequate trump
  // Aces without trump control are worthless - you can't set them up
  const aceValue = eval_.trumpCount >= 3 ? 8 : (eval_.trumpCount >= 2 ? 4 : 0);
  score += eval_.failAces * aceValue;
  if (eval_.failAces > 0) {
    reasons.push(`${eval_.failAces} fail ace${eval_.failAces > 1 ? 's' : ''}`);
  }

  // CRITICAL: Having all 3 fail aces means going alone (no partner!)
  // This is VERY risky without excellent trump - need at least 4 trump with queens
  if (eval_.failAces === 3) {
    if (eval_.trumpCount < 4 || !eval_.hasHighTrump) {
      score -= 25; // Huge penalty - going alone with weak trump is suicide
      reasons.push('going alone with weak trump!');
    }
  }

  // CRITICAL: Check if we'd be forced to go alone due to no callable suits
  // A callable suit requires: we DON'T have the ace, and we DO have a hold card
  const failCards = hand.filter(c => !isTrump(c));
  const aceSuits = new Set(failCards.filter(c => c.rank === 'A').map(c => c.suit));

  // Find callable suits: suits where we have a non-ace card but NOT the ace
  const callableSuits = FAIL_SUITS.filter(suit => {
    const hasAce = aceSuits.has(suit);
    const hasHoldCard = failCards.some(c => c.suit === suit && c.rank !== 'A');
    return !hasAce && hasHoldCard;
  });

  // If no callable suits exist, we'd be forced to go alone!
  if (callableSuits.length === 0) {
    // Check if hand is strong enough to go alone
    const hasMonsterHand = eval_.trumpCount >= 6 && eval_.hasHighTrump;
    const hasGoodAloneHand = eval_.trumpCount >= 5 && eval_.failAces >= 2;

    if (!hasMonsterHand && !hasGoodAloneHand) {
      // Weak hand for going alone - big penalty
      score -= 35;
      reasons.push('would be forced alone!');
    } else if (hasMonsterHand) {
      // Strong enough to go alone
      score += 5;
      reasons.push('monster hand - can go alone');
    }
  }

  // Void suits are great for trumping
  score += eval_.voidSuits.length * 6;
  if (eval_.voidSuits.length > 0) {
    reasons.push(`void in ${eval_.voidSuits.length} suit${eval_.voidSuits.length > 1 ? 's' : ''}`);
  }

  // Black queens bonus - the "Ma's" are the best trump combo
  if (hasBlackQueens) {
    score += 18;
    reasons.push('have the Ma\'s (black queens)');
  }

  // POSITION 2 IS DANGEROUS - 3 players can go over you!
  // Need a stronger hand here - be more conservative
  if (isPosition2) {
    score -= 10; // Penalty for dangerous position
    reasons.push('risky position 2');
  }

  // Position adjustment - later position can be more aggressive
  // Blind might have good cards, and if others passed, hand may be marginal
  if (isOnEnd || pickPosition >= 3) {
    score += 6;
    reasons.push('late position');
  }

  // Having the lead is valuable with good trump
  if (hasLead && eval_.hasHighTrump) {
    score += 5;
    reasons.push('can lead trump');
  }

  // Last chance adjustment - don't want leaster with bad hand
  if (isLastChance && score < thresholds.pick) {
    score += 10; // More willing to pick to avoid leaster
    reasons.push('avoiding leaster');
  }

  // Apply personality modifier
  const personalityModifier = getPickThresholdModifier(position) * 5;
  const adjustedThreshold = thresholds.pick + personalityModifier;

  // Initial decision based on heuristics
  let shouldPick = score >= adjustedThreshold;
  let confidence = Math.min(1, Math.max(0, (score - thresholds.maybe) / 40));

  // For advanced/expert difficulty with marginal hands, use Monte Carlo
  // "Marginal" = score is within 15 points of threshold (could go either way)
  const isMarginal = Math.abs(score - adjustedThreshold) < 15;
  const useMonteCarloDecision = (difficulty === 'expert' || difficulty === 'advanced') && isMarginal;

  if (useMonteCarloDecision) {
    const simResult = simulatePickDecision(hand, position, passCount, QUICK_SIMULATIONS);

    // Monte Carlo can override heuristic if strong enough recommendation
    if (simResult.recommendationStrength > 0.2) {
      shouldPick = simResult.recommendation === 'pick';
      // Blend heuristic confidence with MC confidence
      confidence = Math.min(1, (confidence + simResult.recommendationStrength) / 2);

      // Add note about MC usage for explanation
      if (simResult.recommendation === 'pick' && !shouldPick) {
        reasons.push('MC simulation favors picking');
      } else if (simResult.recommendation === 'pass' && shouldPick) {
        reasons.push('MC simulation favors passing');
      }
    }
  }

  // Get personality-appropriate message
  const personality = getPersonality(position);
  let reason: string;

  if (shouldPick) {
    if (isLastChance && score < thresholds.pick) {
      // Forced pick
      reason = getPersonalityMessage(position, 'forcedPick');
    } else {
      reason = getPersonalityMessage(position, 'pick');
    }
  } else {
    if (score >= thresholds.maybe) {
      // Had a decent hand but passed
      reason = getPersonalityMessage(position, 'passStrong');
    } else {
      reason = getPersonalityMessage(position, 'passWeak');
    }
  }

  // Fallback if no personality message
  if (!reason) {
    if (shouldPick) {
      reason = `Picking with ${reasons.slice(0, 3).join(', ')}`;
    } else {
      reason = `Passing`;
    }
  }

  return { shouldPick, reason, confidence };
}

/**
 * Get pick thresholds based on difficulty
 * Higher difficulty = more accurate evaluation of marginal hands
 */
function getPickThresholds(difficulty: AIDifficulty): {
  pick: number;
  maybe: number;
} {
  switch (difficulty) {
    case 'beginner':
      // Beginner picks too often (lower threshold)
      return { pick: 38, maybe: 30 };
    case 'intermediate':
      // Intermediate is reasonable - needs ~3 trump + something extra
      return { pick: 52, maybe: 42 };
    case 'advanced':
      // Advanced is more selective
      return { pick: 55, maybe: 46 };
    case 'expert':
      // Expert knows when marginal hands work
      return { pick: 58, maybe: 48 };
  }
}

/**
 * Explain why the AI picked or passed in detail
 */
export function explainPickDecision(
  hand: Card[],
  decision: PickDecision
): string {
  const eval_ = evaluateHandStrength(hand);

  const lines: string[] = [];
  lines.push(decision.reason);
  lines.push('');
  lines.push(`Hand analysis:`);
  lines.push(`- ${eval_.trumpCount} trump cards (strength: ${eval_.strength})`);
  lines.push(`- ${eval_.failAces} fail aces`);
  lines.push(`- ${eval_.voidSuits.length} void suits`);
  lines.push(`- ${eval_.pointsInHand} points in hand`);

  if (decision.shouldPick) {
    lines.push('');
    lines.push('Expected to gain points from blind and partner cooperation.');
  }

  return lines.join('\n');
}
