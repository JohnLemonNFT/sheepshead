// ============================================
// AI PLAY DECISION - Which card to play?
// ============================================

import {
  Card,
  Suit,
  Trick,
  PlayerPosition,
  CalledAce,
  AIDifficulty,
  isTrump,
  getTrumpPower,
  getCardPoints,
  FAIL_SUITS,
} from '../types';
import { getLegalPlays, getEffectiveSuit, determineTrickWinner } from '../rules';
import { AIGameKnowledge, countHigherTrumpRemaining } from './tracking';
import { getPersonalityMessage } from './personalities';

export interface PlayDecision {
  card: Card;
  reason: string;
  confidence: number;
}

/**
 * Decide which card to play
 */
export function decidePlay(
  hand: Card[],
  trick: Trick,
  calledAce: CalledAce | null,
  isPicker: boolean,
  isPartner: boolean,
  isKnownPartner: boolean,
  pickerPosition: PlayerPosition | null,
  myPosition: PlayerPosition,
  knowledge: AIGameKnowledge,
  difficulty: AIDifficulty
): PlayDecision {
  // Get legal plays
  const legalPlays = getLegalPlays(hand, trick, calledAce, isPicker, isPartner);

  if (legalPlays.length === 0) {
    throw new Error('No legal plays available');
  }

  if (legalPlays.length === 1) {
    return {
      card: legalPlays[0],
      reason: 'Only legal play',
      confidence: 1,
    };
  }

  // Determine role and strategy
  const isLeading = trick.cards.length === 0;
  const isOnPickerTeam = isPicker || isPartner;

  if (isLeading) {
    return decideLeadCard(
      legalPlays,
      hand,
      isPicker,
      isPartner,
      calledAce,
      knowledge,
      difficulty,
      myPosition
    );
  } else {
    return decideFollowCard(
      legalPlays,
      hand,
      trick,
      isPicker,
      isPartner,
      isKnownPartner,
      pickerPosition,
      myPosition,
      calledAce,
      knowledge,
      difficulty
    );
  }
}

/**
 * Decide which card to lead with
 */
function decideLeadCard(
  legalPlays: Card[],
  hand: Card[],
  isPicker: boolean,
  isPartner: boolean,
  calledAce: CalledAce | null,
  knowledge: AIGameKnowledge,
  difficulty: AIDifficulty,
  position: PlayerPosition
): PlayDecision {
  const trumpInHand = legalPlays.filter(c => isTrump(c));
  const failInHand = legalPlays.filter(c => !isTrump(c));

  // PICKER STRATEGY: Lead trump to pull out defenders' trump
  if (isPicker) {
    if (trumpInHand.length > 0) {
      // Lead highest trump to establish control
      const sortedTrump = [...trumpInHand].sort(
        (a, b) => getTrumpPower(a) - getTrumpPower(b)
      );

      // If we have queens/jacks, lead them
      const highTrump = sortedTrump.find(c => getTrumpPower(c) < 8);
      if (highTrump) {
        return {
          card: highTrump,
          reason: getPersonalityMessage(position, 'leadTrump') || 'Leading high trump as picker',
          confidence: 0.9,
        };
      }

      // Otherwise lead highest trump we have
      return {
        card: sortedTrump[0],
        reason: getPersonalityMessage(position, 'leadTrump') || 'Leading trump as picker',
        confidence: 0.8,
      };
    }

    // No trump - lead called suit to find partner
    if (calledAce && !calledAce.revealed) {
      const calledSuitCards = failInHand.filter(c => c.suit === calledAce.suit);
      if (calledSuitCards.length > 0) {
        // Lead lowest of called suit
        const sorted = [...calledSuitCards].sort(
          (a, b) => getCardPoints(a) - getCardPoints(b)
        );
        return {
          card: sorted[0],
          reason: getPersonalityMessage(position, 'leadCalledSuit') || `Leading ${calledAce.suit} to find partner`,
          confidence: 0.85,
        };
      }
    }

    // Lead lowest fail card
    const sortedFail = [...failInHand].sort(
      (a, b) => getCardPoints(a) - getCardPoints(b)
    );
    return {
      card: sortedFail[0],
      reason: getPersonalityMessage(position, 'leadFail') || 'Leading low fail card',
      confidence: 0.6,
    };
  }

  // PARTNER STRATEGY: Support picker, lead trump or called suit
  if (isPartner) {
    // Lead trump to help picker
    if (trumpInHand.length > 0 && calledAce?.revealed) {
      const sortedTrump = [...trumpInHand].sort(
        (a, b) => getTrumpPower(a) - getTrumpPower(b)
      );
      return {
        card: sortedTrump[0],
        reason: getPersonalityMessage(position, 'leadTrump') || 'Leading trump as partner',
        confidence: 0.8,
      };
    }

    // Don't lead called suit if holding ace (avoid revealing too early)
    // Lead other fail suits
    const otherFail = failInHand.filter(
      c => !calledAce || c.suit !== calledAce.suit
    );
    if (otherFail.length > 0) {
      const sorted = [...otherFail].sort(
        (a, b) => getCardPoints(a) - getCardPoints(b)
      );
      return {
        card: sorted[0],
        reason: getPersonalityMessage(position, 'leadFail') || 'Leading fail suit as partner',
        confidence: 0.7,
      };
    }
  }

  // DEFENDER STRATEGY: Lead fail suits, avoid helping picker
  // Lead short suits to potentially trump later
  if (!isPicker && !isPartner) {
    // Lead called suit to smoke out partner (great defender play!)
    if (calledAce && !calledAce.revealed) {
      const calledSuitCards = failInHand.filter(c => c.suit === calledAce.suit);
      if (calledSuitCards.length > 0) {
        const sorted = [...calledSuitCards].sort(
          (a, b) => getCardPoints(b) - getCardPoints(a)
        );
        return {
          card: sorted[0],
          reason: getPersonalityMessage(position, 'leadCalledSuit') || 'Leading called suit to find partner',
          confidence: 0.85,
        };
      }
    }

    // Don't lead trump unless necessary (helps picker)
    if (failInHand.length > 0) {
      // Find shortest suit
      const suitCounts = new Map<Suit, number>();
      for (const suit of FAIL_SUITS) {
        const count = failInHand.filter(c => c.suit === suit).length;
        if (count > 0) {
          suitCounts.set(suit, count);
        }
      }

      if (suitCounts.size > 0) {
        // Lead from shortest suit
        const shortestSuit = [...suitCounts.entries()].sort(
          (a, b) => a[1] - b[1]
        )[0][0];
        const suitCards = failInHand.filter(c => c.suit === shortestSuit);

        // Lead highest of that suit (might win, or pull out ace)
        const sorted = [...suitCards].sort(
          (a, b) => getCardPoints(b) - getCardPoints(a)
        );
        return {
          card: sorted[0],
          reason: getPersonalityMessage(position, 'leadFail') || `Leading ${shortestSuit}`,
          confidence: 0.7,
        };
      }
    }

    // Have to lead trump
    if (trumpInHand.length > 0) {
      // Lead lowest trump
      const sortedTrump = [...trumpInHand].sort(
        (a, b) => getTrumpPower(b) - getTrumpPower(a)
      );
      return {
        card: sortedTrump[0],
        reason: getPersonalityMessage(position, 'leadTrump') || 'Leading trump',
        confidence: 0.5,
      };
    }
  }

  // Fallback: play lowest point card
  const sorted = [...legalPlays].sort(
    (a, b) => getCardPoints(a) - getCardPoints(b)
  );
  return {
    card: sorted[0],
    reason: getPersonalityMessage(position, 'cantWin') || 'Playing lowest card',
    confidence: 0.4,
  };
}

/**
 * Decide which card to play when following
 */
function decideFollowCard(
  legalPlays: Card[],
  hand: Card[],
  trick: Trick,
  isPicker: boolean,
  isPartner: boolean,
  isKnownPartner: boolean,
  pickerPosition: PlayerPosition | null,
  myPosition: PlayerPosition,
  calledAce: CalledAce | null,
  knowledge: AIGameKnowledge,
  difficulty: AIDifficulty
): PlayDecision {
  const leadCard = trick.cards[0].card;
  const leadSuit = getEffectiveSuit(leadCard);
  const isOnPickerTeam = isPicker || isPartner;

  // Calculate who's currently winning
  const currentWinner = determineTrickWinner(trick);
  const currentWinnerCard = trick.cards.find(
    c => c.playedBy === currentWinner
  )!.card;

  // Check if teammate is winning
  const teammateWinning = isTeammateWinning(
    currentWinner,
    isPicker,
    isPartner,
    pickerPosition,
    knowledge
  );

  // Calculate trick points
  const trickPoints = trick.cards.reduce(
    (sum, c) => sum + getCardPoints(c.card),
    0
  );

  // Check if we can beat current winner
  const winningPlays = legalPlays.filter(c =>
    canBeatCard(c, currentWinnerCard, leadSuit)
  );
  const canWin = winningPlays.length > 0;

  // TEAMMATE IS WINNING - schmear or throw off
  if (teammateWinning) {
    // Schmear points to teammate
    const highPointCards = legalPlays.filter(c => getCardPoints(c) >= 10);
    if (highPointCards.length > 0 && trickPoints >= 10) {
      // Sort by points, play highest
      const sorted = [...highPointCards].sort(
        (a, b) => getCardPoints(b) - getCardPoints(a)
      );
      return {
        card: sorted[0],
        reason: getPersonalityMessage(myPosition, 'schmear') || `Schmearing ${getCardPoints(sorted[0])} points`,
        confidence: 0.9,
      };
    }

    // Throw off low card
    const sorted = [...legalPlays].sort(
      (a, b) => getCardPoints(a) - getCardPoints(b)
    );
    return {
      card: sorted[0],
      reason: getPersonalityMessage(myPosition, 'cantWin') || 'Throwing off low card',
      confidence: 0.8,
    };
  }

  // OPPONENT IS WINNING - try to win or minimize loss
  if (canWin) {
    // Win with minimum necessary trump/card
    const sortedWinners = [...winningPlays].sort((a, b) => {
      // Prefer winning with lowest trump power (save high trump)
      if (isTrump(a) && isTrump(b)) {
        return getTrumpPower(b) - getTrumpPower(a); // Higher index = lower power
      }
      // Prefer winning with fail over trump
      if (!isTrump(a) && isTrump(b)) return -1;
      if (isTrump(a) && !isTrump(b)) return 1;
      // Win with lowest points
      return getCardPoints(a) - getCardPoints(b);
    });

    // If trick has high points, win it
    if (trickPoints >= 15 || isPicker) {
      return {
        card: sortedWinners[0],
        reason: getPersonalityMessage(myPosition, 'winTrick') || `Winning trick worth ${trickPoints + getCardPoints(sortedWinners[0])} points`,
        confidence: 0.85,
      };
    }

    // Low point trick - consider if worth winning
    return {
      card: sortedWinners[0],
      reason: getPersonalityMessage(myPosition, 'winTrick') || `Taking trick`,
      confidence: 0.7,
    };
  }

  // CAN'T WIN - minimize points given
  const sorted = [...legalPlays].sort(
    (a, b) => getCardPoints(a) - getCardPoints(b)
  );

  // If this is partner revealing trick (called ace), must play it
  if (
    isPartner &&
    calledAce &&
    !calledAce.revealed &&
    leadSuit !== 'trump' &&
    leadCard.suit === calledAce.suit
  ) {
    const ace = legalPlays.find(
      c => c.suit === calledAce.suit && c.rank === 'A'
    );
    if (ace) {
      return {
        card: ace,
        reason: getPersonalityMessage(myPosition, 'partnerRevealed') || 'Playing called ace',
        confidence: 1,
      };
    }
  }

  return {
    card: sorted[0],
    reason: getPersonalityMessage(myPosition, 'cantWin') || `Can't win, throwing off`,
    confidence: 0.6,
  };
}

/**
 * Check if card A can beat card B given lead suit
 */
function canBeatCard(
  cardA: Card,
  cardB: Card,
  leadSuit: Suit | 'trump'
): boolean {
  const aIsTrump = isTrump(cardA);
  const bIsTrump = isTrump(cardB);
  const aSuit = getEffectiveSuit(cardA);

  // Trump beats non-trump
  if (aIsTrump && !bIsTrump) return true;
  if (!aIsTrump && bIsTrump) return false;

  // Both trump
  if (aIsTrump && bIsTrump) {
    return getTrumpPower(cardA) < getTrumpPower(cardB);
  }

  // Neither trump - must follow lead suit to win
  if (aSuit !== leadSuit) return false;

  // Same suit - compare by fail order
  const rankOrder = ['A', '10', 'K', '9', '8', '7'];
  return rankOrder.indexOf(cardA.rank) < rankOrder.indexOf(cardB.rank);
}

/**
 * Check if the current winner is a teammate
 */
function isTeammateWinning(
  winnerPosition: number,
  isPicker: boolean,
  isPartner: boolean,
  pickerPosition: PlayerPosition | null,
  knowledge: AIGameKnowledge
): boolean {
  // Picker team perspective
  if (isPicker) {
    // Partner winning is good
    const partnerProb = knowledge.partnerProbability.get(
      winnerPosition as PlayerPosition
    );
    return partnerProb !== undefined && partnerProb > 0.6;
  }

  if (isPartner) {
    // Picker winning is good
    return winnerPosition === pickerPosition;
  }

  // Defender perspective - teammate is another defender
  if (pickerPosition !== null && winnerPosition !== pickerPosition) {
    // Check if winner is likely partner
    const partnerProb = knowledge.partnerProbability.get(
      winnerPosition as PlayerPosition
    );
    // If not likely partner, they're a defender teammate
    return partnerProb !== undefined && partnerProb < 0.4;
  }

  return false;
}

/**
 * Explain the play decision in detail
 */
export function explainPlayDecision(
  hand: Card[],
  trick: Trick,
  decision: PlayDecision,
  isPicker: boolean,
  isPartner: boolean
): string {
  const lines: string[] = [];
  lines.push(decision.reason);
  lines.push('');

  const role = isPicker ? 'Picker' : isPartner ? 'Partner' : 'Defender';
  lines.push(`Role: ${role}`);

  if (trick.cards.length > 0) {
    const leadCard = trick.cards[0].card;
    lines.push(`Lead: ${leadCard.rank} of ${leadCard.suit}`);

    const trickPoints = trick.cards.reduce(
      (sum, c) => sum + getCardPoints(c.card),
      0
    );
    lines.push(`Trick points so far: ${trickPoints}`);
  }

  const legalPlays = getLegalPlays(
    hand,
    trick,
    null,
    isPicker,
    isPartner
  );
  lines.push(`Legal options: ${legalPlays.length}`);

  return lines.join('\n');
}
