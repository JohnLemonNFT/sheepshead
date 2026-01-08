// ============================================
// AI PICK DECISION - Should the AI pick up the blind?
// ============================================

import { Card, AIDifficulty, PlayerPosition } from '../types';
import { evaluateHandStrength } from './tracking';
import { getPickThresholdModifier, getPersonalityMessage, getPersonality } from './personalities';

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

  // Trump count is primary factor
  score += eval_.trumpCount * 15;
  if (eval_.trumpCount >= 4) {
    reasons.push(`${eval_.trumpCount} trump`);
  } else if (eval_.trumpCount >= 3) {
    reasons.push(`${eval_.trumpCount} trump`);
  } else {
    reasons.push(`only ${eval_.trumpCount} trump`);
  }

  // High trump bonus
  if (eval_.hasHighTrump) {
    score += 20;
    reasons.push('have queens');
  }

  // Trump power
  score += eval_.trumpPower;

  // Fail aces are valuable
  score += eval_.failAces * 10;
  if (eval_.failAces > 0) {
    reasons.push(`${eval_.failAces} fail ace${eval_.failAces > 1 ? 's' : ''}`);
  }

  // Void suits are great for trumping
  score += eval_.voidSuits.length * 8;
  if (eval_.voidSuits.length > 0) {
    reasons.push(`void in ${eval_.voidSuits.length} suit${eval_.voidSuits.length > 1 ? 's' : ''}`);
  }

  // Black queens bonus - the "Ma's" are the best trump combo
  if (hasBlackQueens) {
    score += 25;
    reasons.push('have the Ma\'s (black queens)');
  }

  // POSITION 2 IS DANGEROUS - 3 players can go over you!
  // Need a stronger hand here - be more conservative
  if (isPosition2) {
    score -= 15; // Penalty for dangerous position
    reasons.push('risky position 2');
  }

  // Position adjustment - later position can be more aggressive
  // Blind might have good cards, and if others passed, hand may be marginal
  if (isOnEnd || pickPosition >= 3) {
    score += 10;
    reasons.push('late position');
  }

  // Having the lead is valuable with good trump
  if (hasLead && eval_.hasHighTrump) {
    score += 8;
    reasons.push('can lead trump');
  }

  // Last chance adjustment - don't want leaster with bad hand
  if (isLastChance && score < thresholds.pick) {
    score += 15; // More willing to pick to avoid leaster
    reasons.push('avoiding leaster');
  }

  // Apply personality modifier
  const personalityModifier = getPickThresholdModifier(position) * 5;
  const adjustedThreshold = thresholds.pick + personalityModifier;

  const shouldPick = score >= adjustedThreshold;
  const confidence = Math.min(1, Math.max(0, (score - thresholds.maybe) / 40));

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
      // Beginner picks too often or not enough
      return { pick: 45, maybe: 35 };
    case 'intermediate':
      // Intermediate is reasonable
      return { pick: 55, maybe: 45 };
    case 'advanced':
      // Advanced is more selective
      return { pick: 58, maybe: 48 };
    case 'expert':
      // Expert knows when marginal hands work
      return { pick: 60, maybe: 50 };
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
