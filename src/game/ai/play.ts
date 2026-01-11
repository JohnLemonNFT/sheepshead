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
  const isLeaster = pickerPosition === null;

  // LEASTER: Everyone plays for themselves, trying to get FEWEST points
  if (isLeaster) {
    return decideLeasterPlay(legalPlays, hand, trick, myPosition, knowledge);
  }

  if (isLeading) {
    return decideLeadCard(
      legalPlays,
      hand,
      isPicker,
      isPartner,
      calledAce,
      knowledge,
      difficulty,
      myPosition,
      pickerPosition
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
 * Decide which card to play in a Leaster (no picker, lowest points wins)
 * Strategy: Avoid winning tricks, dump high-point cards when others win
 */
function decideLeasterPlay(
  legalPlays: Card[],
  hand: Card[],
  trick: Trick,
  myPosition: PlayerPosition,
  knowledge: AIGameKnowledge
): PlayDecision {
  const isLeading = trick.cards.length === 0;

  // Sort cards by points (high to low for dumping, low to high for winning)
  const byPointsDesc = [...legalPlays].sort((a, b) => getCardPoints(b) - getCardPoints(a));
  const byPointsAsc = [...legalPlays].sort((a, b) => getCardPoints(a) - getCardPoints(b));

  if (isLeading) {
    // LEADING in Leaster: Lead high-point cards to force others to take them
    // Best: Lead fail Aces/Tens - someone else will likely have to win them
    const highPointCards = byPointsDesc.filter(c => getCardPoints(c) >= 10);
    if (highPointCards.length > 0) {
      // Prefer fail suits over trump (harder for others to dodge)
      const failHighCards = highPointCards.filter(c => !isTrump(c));
      if (failHighCards.length > 0) {
        return {
          card: failHighCards[0],
          reason: 'Leaster: Leading high-point fail card to force others to take it',
          confidence: 0.8,
        };
      }
      return {
        card: highPointCards[0],
        reason: 'Leaster: Leading high-point card to offload points',
        confidence: 0.75,
      };
    }

    // No high cards - lead lowest to minimize damage if we win
    return {
      card: byPointsAsc[0],
      reason: 'Leaster: Leading low card to minimize points if stuck winning',
      confidence: 0.6,
    };
  }

  // FOLLOWING in Leaster: Try to lose the trick
  const leadCard = trick.cards[0].card;
  const leadSuit = getEffectiveSuit(leadCard);

  // Determine current trick winner
  const trickWithUs = [...trick.cards];
  let currentWinner = determineTrickWinner({ cards: trickWithUs, leadPlayer: trick.leadPlayer });

  // Check what we can play
  const trumpPlays = legalPlays.filter(c => isTrump(c));
  const followPlays = legalPlays.filter(c => getEffectiveSuit(c) === leadSuit);
  const canFollow = followPlays.length > 0 || (leadSuit === 'trump' && trumpPlays.length > 0);

  // If we're last to play and someone else is winning, dump our highest point card
  if (trick.cards.length === 4 && currentWinner !== myPosition) {
    return {
      card: byPointsDesc[0],
      reason: 'Leaster: Dumping highest points - someone else wins this trick',
      confidence: 0.9,
    };
  }

  // If we must follow suit
  if (canFollow) {
    const relevantCards = leadSuit === 'trump' ? trumpPlays : followPlays;
    // Try to play a card that won't win
    // Find lowest card that stays under current winner
    const sortedByPower = [...relevantCards].sort((a, b) => {
      if (isTrump(a) && isTrump(b)) {
        return getTrumpPower(a) - getTrumpPower(b);
      }
      return getCardPoints(a) - getCardPoints(b);
    });

    // Play lowest to try to lose
    return {
      card: sortedByPower[0],
      reason: 'Leaster: Playing low to avoid winning trick',
      confidence: 0.75,
    };
  }

  // Can't follow - play off-suit
  // If someone else is winning, dump high points
  if (currentWinner !== myPosition) {
    return {
      card: byPointsDesc[0],
      reason: 'Leaster: Off-suit, dumping high points to winner',
      confidence: 0.85,
    };
  }

  // We might win - play lowest point card
  return {
    card: byPointsAsc[0],
    reason: 'Leaster: Playing lowest points in case we win',
    confidence: 0.6,
  };
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
  position: PlayerPosition,
  pickerPosition: PlayerPosition | null
): PlayDecision {
  const trumpInHand = legalPlays.filter(c => isTrump(c));
  const failInHand = legalPlays.filter(c => !isTrump(c));

  // PICKER STRATEGY: Lead trump to pull out defenders' trump
  // BEST PRACTICE: Lead Q♣ first! It's guaranteed to win and bleeds 5 trump from opponents
  if (isPicker) {
    if (trumpInHand.length > 0) {
      // PRIORITY 1: Lead Queen of Clubs if we have it - it ALWAYS wins
      const queenOfClubs = trumpInHand.find(c => c.rank === 'Q' && c.suit === 'clubs');
      if (queenOfClubs) {
        return {
          card: queenOfClubs,
          reason: getPersonalityMessage(position, 'leadTrump') || 'Leading Q♣ - guaranteed winner, bleeds trump!',
          confidence: 0.95,
        };
      }

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
  // BEST PRACTICE: "Long thru, short to"
  // - Lead LONG suit if picker is in the middle (they have to follow before last player)
  // - Lead SHORT suit if picker is on the end (get void, trump their later leads)
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
      // Count cards per suit
      const suitCounts = new Map<Suit, number>();
      for (const suit of FAIL_SUITS) {
        const count = failInHand.filter(c => c.suit === suit).length;
        if (count > 0) {
          suitCounts.set(suit, count);
        }
      }

      if (suitCounts.size > 0) {
        // LONG THRU, SHORT TO strategy
        // Check if picker is "on the end" (last to play after us)
        const isPickerOnEnd = pickerPosition !== null &&
          ((position + 4) % 5) === pickerPosition;

        let targetSuit: Suit;
        let reason: string;

        if (isPickerOnEnd) {
          // Picker plays last - lead SHORT suit to create void for trumping
          targetSuit = [...suitCounts.entries()].sort(
            (a, b) => a[1] - b[1]
          )[0][0];
          reason = `Short to - picker on end, creating void`;
        } else {
          // Picker in middle - lead LONG suit through them
          targetSuit = [...suitCounts.entries()].sort(
            (a, b) => b[1] - a[1]
          )[0][0];
          reason = `Long thru - forcing picker to follow`;
        }

        const suitCards = failInHand.filter(c => c.suit === targetSuit);
        // Lead highest of that suit (might win, or pull out ace)
        const sorted = [...suitCards].sort(
          (a, b) => getCardPoints(b) - getCardPoints(a)
        );
        return {
          card: sorted[0],
          reason: getPersonalityMessage(position, 'leadFail') || reason,
          confidence: 0.7,
        };
      }
    }

    // Have to lead trump (no fail cards left)
    if (trumpInHand.length > 0) {
      // Lead LOWEST trump - minimize damage when forced to lead trump as defender
      const sortedTrump = [...trumpInHand].sort(
        (a, b) => getTrumpPower(a) - getTrumpPower(b)  // Ascending: lowest first
      );
      return {
        card: sortedTrump[0],
        reason: getPersonalityMessage(position, 'leadTrump') || 'Forced to lead trump - playing lowest',
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

  // Position in trick (1 = second to play, 2 = third, etc.)
  const trickPosition = trick.cards.length;
  const isEarlyInTrick = trickPosition <= 2; // 2nd or 3rd player

  // Check if we can beat current winner
  const winningPlays = legalPlays.filter(c =>
    canBeatCard(c, currentWinnerCard, leadSuit)
  );
  const canWin = winningPlays.length > 0;

  // BEST PRACTICE: 2nd/3rd player plays LOW trump on trump leads
  // Save your high trump for later - let teammates behind you handle it
  const trumpWasLed = leadSuit === 'trump';
  const trumpInLegal = legalPlays.filter(c => isTrump(c));

  // Check if we're trumping in (fail was led but we can't follow suit and have trump)
  const canFollowLedSuit = legalPlays.some(c => !isTrump(c) && c.suit === leadCard.suit);
  const isTrumpingIn = !trumpWasLed && !canFollowLedSuit && trumpInLegal.length > 0;

  if (trumpWasLed && isEarlyInTrick && trumpInLegal.length > 0 && !teammateWinning) {
    // Sort by trump power descending (higher index = weaker trump)
    const sortedByPower = [...trumpInLegal].sort(
      (a, b) => getTrumpPower(b) - getTrumpPower(a)
    );

    // If trick isn't worth much yet, play lowest trump
    if (trickPoints < 15) {
      return {
        card: sortedByPower[0], // Lowest trump
        reason: getPersonalityMessage(myPosition, 'cantWin') || 'Playing low trump - saving high trump for later',
        confidence: 0.75,
      };
    }
  }

  // TEAMMATE IS WINNING - schmear or throw off
  if (teammateWinning) {
    // Schmear points to teammate
    const highPointCards = legalPlays.filter(c => getCardPoints(c) >= 10);
    if (highPointCards.length > 0 && trickPoints >= 10) {
      // BEST PRACTICE: "Don't risk your only schmear"
      // If we only have ONE high-point card, only schmear if trick is SURE
      // (teammate winning with high trump, or we're last to play)
      const isLastToPlay = trick.cards.length === 4;
      const winnerCard = trick.cards.find(c => c.playedBy === currentWinner)!.card;
      const winnerIsSafe = isTrump(winnerCard) && getTrumpPower(winnerCard) < 6; // Queen or high Jack

      if (highPointCards.length === 1 && !isLastToPlay && !winnerIsSafe) {
        // Only schmear - save it for a sure trick
        const sorted = [...legalPlays].sort(
          (a, b) => getCardPoints(a) - getCardPoints(b)
        );
        return {
          card: sorted[0],
          reason: getPersonalityMessage(myPosition, 'cantWin') || 'Saving only schmear for sure trick',
          confidence: 0.75,
        };
      }

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
    // TRUMPING IN - when we can't follow suit and have trump to win
    if (isTrumpingIn) {
      const trumpWinners = winningPlays.filter(c => isTrump(c));
      if (trumpWinners.length > 0) {
        // Sort by trump power (lower index = higher power)
        const sortedByPower = [...trumpWinners].sort(
          (a, b) => getTrumpPower(a) - getTrumpPower(b)
        );

        // If we're not last to play, need to play high enough to hold
        if (trickPosition < 4) {
          // If trick has good points OR we're a defender, play high to secure
          if (trickPoints >= 10 || (!isPicker && !isPartner)) {
            return {
              card: sortedByPower[0], // Play our highest trump
              reason: getPersonalityMessage(myPosition, 'winTrick') || `Trumping in to take ${trickPoints} point trick`,
              confidence: 0.85,
            };
          }
          // Otherwise play a reasonably high trump
          const highEnough = sortedByPower.find(c => getTrumpPower(c) < 10);
          if (highEnough) {
            return {
              card: highEnough,
              reason: getPersonalityMessage(myPosition, 'winTrick') || 'Trumping in',
              confidence: 0.75,
            };
          }
        }

        // Last to play - use minimum winning trump
        return {
          card: sortedByPower[sortedByPower.length - 1],
          reason: getPersonalityMessage(myPosition, 'winTrick') || 'Trumping in with minimum trump',
          confidence: 0.8,
        };
      }
    }

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

    // ALWAYS try to win if we can - every trick counts!
    return {
      card: sortedWinners[0],
      reason: getPersonalityMessage(myPosition, 'winTrick') || `Taking trick worth ${trickPoints + getCardPoints(sortedWinners[0])} points`,
      confidence: 0.8,
    };
  }

  // CAN'T WIN - minimize points given
  // BEST PRACTICE: "Points before Power"
  // If forced to lose points, sacrifice an ace/10 to save a queen for later
  // A queen can win a bigger trick later; the ace is lost either way
  const mustFollowTrump = leadSuit === 'trump' && trumpInLegal.length > 0;
  if (mustFollowTrump && !canWin) {
    const queens = trumpInLegal.filter(c => c.rank === 'Q');
    const nonQueens = trumpInLegal.filter(c => c.rank !== 'Q');
    // If we have both queens and non-queens (like A♦), sacrifice non-queen
    if (queens.length > 0 && nonQueens.length > 0) {
      // Play A♦ or other low trump instead of queen
      const sortedNonQueens = [...nonQueens].sort(
        (a, b) => getTrumpPower(b) - getTrumpPower(a)
      );
      return {
        card: sortedNonQueens[0],
        reason: getPersonalityMessage(myPosition, 'cantWin') || 'Points before power - saving queen for later',
        confidence: 0.7,
      };
    }
  }

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
 * BE CONSERVATIVE - only assume teammate if we're very sure
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
    // Partner winning is good - but only if we're very confident
    const partnerProb = knowledge.partnerProbability.get(
      winnerPosition as PlayerPosition
    );
    // Need high confidence (> 0.7) to trust this is partner
    return partnerProb !== undefined && partnerProb > 0.7;
  }

  if (isPartner) {
    // Picker winning is good
    return winnerPosition === pickerPosition;
  }

  // Defender perspective - BE CAREFUL, winner could be partner!
  if (pickerPosition !== null && winnerPosition !== pickerPosition) {
    // Check if winner is likely partner
    const partnerProb = knowledge.partnerProbability.get(
      winnerPosition as PlayerPosition
    );
    // Only trust teammate if partner probability is VERY low (< 0.15)
    // Early game everyone starts at ~0.25, so this prevents false positives
    return partnerProb !== undefined && partnerProb < 0.15;
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
