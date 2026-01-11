// ============================================
// GAME LOGIC FOR SERVER
// ============================================

import type { Room } from './room.js';
import type {
  Card,
  Suit,
  Rank,
  PlayerPosition,
  GameState,
  GameAction,
  Player,
  Trick,
  ClientGameState,
  ClientPlayer,
  GameConfig,
  CrackState,
} from './types.js';

// Constants
const SUITS: Suit[] = ['clubs', 'spades', 'hearts', 'diamonds'];
const RANKS: Rank[] = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const TRUMP_ORDER = [
  'Q-clubs', 'Q-spades', 'Q-hearts', 'Q-diamonds',
  'J-clubs', 'J-spades', 'J-hearts', 'J-diamonds',
  'A-diamonds', '10-diamonds', 'K-diamonds', '9-diamonds', '8-diamonds', '7-diamonds',
];
const FAIL_ORDER: Rank[] = ['A', '10', 'K', '9', '8', '7'];
const FAIL_SUITS: Suit[] = ['clubs', 'spades', 'hearts'];
const POINT_VALUES: Record<Rank, number> = {
  'A': 11, '10': 10, 'K': 4, 'Q': 3, 'J': 2, '9': 0, '8': 0, '7': 0,
};

// AI personality names by position (matches client-side personalities)
const AI_NAMES: Record<PlayerPosition, string> = {
  0: 'You', // Not used for AI
  1: 'Greta',
  2: 'Wild Bill',
  3: 'Eddie',
  4: 'Marie',
};

function getAIName(position: PlayerPosition): string {
  return AI_NAMES[position] || `AI ${position + 1}`;
}

const DEFAULT_CONFIG: GameConfig = {
  playerCount: 5,
  partnerVariant: 'calledAce',
  noPickVariant: 'leaster',
  doubleOnBump: true,
  cracking: false,
  blitzes: false,
  callTen: true,
};

// Helper functions
function getCardId(card: Card): string {
  return `${card.rank}-${card.suit}`;
}

function isTrump(card: Card): boolean {
  return card.rank === 'Q' || card.rank === 'J' || card.suit === 'diamonds';
}

function getTrumpPower(card: Card): number {
  if (!isTrump(card)) return -1;
  return TRUMP_ORDER.indexOf(getCardId(card));
}

function getCardPoints(card: Card): number {
  return POINT_VALUES[card.rank];
}

// Create deck
function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, id: `${rank}-${suit}` });
    }
  }
  return deck;
}

// Shuffle deck
function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Sort hand for display
function sortHand(hand: Card[]): Card[] {
  return [...hand].sort((a, b) => {
    const aIsTrump = isTrump(a);
    const bIsTrump = isTrump(b);
    if (aIsTrump && !bIsTrump) return -1;
    if (!aIsTrump && bIsTrump) return 1;
    if (aIsTrump && bIsTrump) {
      return TRUMP_ORDER.indexOf(a.id) - TRUMP_ORDER.indexOf(b.id);
    }
    const suitOrder = ['clubs', 'spades', 'hearts'];
    const suitDiff = suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit);
    if (suitDiff !== 0) return suitDiff;
    return FAIL_ORDER.indexOf(a.rank) - FAIL_ORDER.indexOf(b.rank);
  });
}

// Deal cards
function dealCards(deck: Card[]): { hands: Card[][]; blind: Card[] } {
  const hands: Card[][] = [[], [], [], [], []];
  let idx = 0;

  // First round: 3 to each
  for (let p = 0; p < 5; p++) {
    for (let c = 0; c < 3; c++) hands[p].push(deck[idx++]);
  }
  // Blind
  const blind = [deck[idx++], deck[idx++]];
  // Second round: 3 to each
  for (let p = 0; p < 5; p++) {
    for (let c = 0; c < 3; c++) hands[p].push(deck[idx++]);
  }

  return { hands: hands.map(h => sortHand(h)), blind };
}

// Get legal plays
function getLegalPlays(
  hand: Card[],
  currentTrick: Trick,
  calledAce: { suit: Suit; revealed: boolean; isTen?: boolean } | null,
  isPicker: boolean,
  isPartner: boolean
): Card[] {
  // Determine the called card rank (ace or 10)
  const calledRank = calledAce?.isTen ? '10' : 'A';
  // Determine the hold card rank (for picker: normally any fail card, but when calling 10, it's the ace)
  const holdCardRank = calledAce?.isTen ? 'A' : null; // When calling 10, picker uses ace as hold card

  if (currentTrick.cards.length === 0) {
    // Leading - partner with called card cannot lead OTHER fail cards of that suit
    // They can lead the called card itself, trump, or any other suit - but not "hide" behind small cards
    if (calledAce && !calledAce.revealed && isPartner) {
      const calledSuit = calledAce.suit;
      const hasCalledCard = hand.some(c => c.suit === calledSuit && c.rank === calledRank && !isTrump(c));

      if (hasCalledCard) {
        // Filter out non-called-rank cards of the called suit
        return hand.filter(c => {
          if (isTrump(c)) return true; // Trump is always ok
          if (c.suit !== calledSuit) return true; // Other suits are ok
          if (c.rank === calledRank) return true; // The called card itself is ok to lead
          return false; // Other fail cards of called suit are NOT ok
        });
      }
    }
    return hand;
  }

  // Following
  const leadCard = currentTrick.cards[0].card;
  const leadIsTrump = isTrump(leadCard);
  const leadSuit = leadCard.suit;

  // Called card rules:
  // - Partner can ONLY play the called card (ace or 10) when the called suit is led
  // - Picker must reserve hold card until called suit is led
  const isCalledCard = (c: Card) =>
    calledAce && !calledAce.revealed && isPartner &&
    c.suit === calledAce.suit && c.rank === calledRank && !isTrump(c);

  // Check if this is the picker's hold card
  const isPickerHoldCard = (c: Card) => {
    if (!calledAce || calledAce.revealed || !isPicker) return false;
    if (isTrump(c) || c.suit !== calledAce.suit) return false;

    if (calledAce.isTen) {
      // When calling a 10, the picker's ace IS the hold card
      return c.rank === 'A';
    } else {
      // Normal case: hold card is picker's only remaining card of this suit
      const cardsOfCalledSuit = hand.filter(card => card.suit === calledAce.suit && !isTrump(card));
      return cardsOfCalledSuit.length === 1 && cardsOfCalledSuit[0].id === c.id;
    }
  };

  // Check if called suit is led - partner MUST play the called card
  if (calledAce && !calledAce.revealed && isPartner && !leadIsTrump && leadSuit === calledAce.suit) {
    const calledCard = hand.filter(c => c.suit === calledAce.suit && c.rank === calledRank && !isTrump(c));
    if (calledCard.length > 0) {
      return calledCard; // Must play the called card
    }
  }

  if (leadIsTrump) {
    const trumpInHand = hand.filter(c => isTrump(c));
    if (trumpInHand.length > 0) {
      return trumpInHand;
    }
    // No trump - can play any card EXCEPT locked cards (called card, picker's hold card)
    const playable = hand.filter(c => !isCalledCard(c) && !isPickerHoldCard(c));
    return playable.length > 0 ? playable : hand; // Edge case: only card(s) left are restricted
  }

  const suitInHand = hand.filter(c => c.suit === leadSuit && !isTrump(c));
  if (suitInHand.length > 0) {
    return suitInHand; // Must follow suit
  }

  // Can't follow suit - can play any card EXCEPT locked cards (called card, picker's hold card)
  const playable = hand.filter(c => !isCalledCard(c) && !isPickerHoldCard(c));
  return playable.length > 0 ? playable : hand; // Edge case: only card(s) left are restricted
}

// Determine trick winner
function determineTrickWinner(trick: Trick): PlayerPosition {
  let winningPlay = trick.cards[0];
  let winningIsTrump = isTrump(winningPlay.card);

  for (let i = 1; i < trick.cards.length; i++) {
    const play = trick.cards[i];
    const playIsTrump = isTrump(play.card);

    if (playIsTrump && !winningIsTrump) {
      winningPlay = play;
      winningIsTrump = true;
    } else if (playIsTrump && winningIsTrump) {
      if (getTrumpPower(play.card) < getTrumpPower(winningPlay.card)) {
        winningPlay = play;
      }
    } else if (!playIsTrump && !winningIsTrump) {
      if (play.card.suit === winningPlay.card.suit) {
        if (FAIL_ORDER.indexOf(play.card.rank) < FAIL_ORDER.indexOf(winningPlay.card.rank)) {
          winningPlay = play;
        }
      }
    }
  }

  return winningPlay.playedBy;
}

// Get callable suits (for calling an ace)
// Picker can only call a suit where they:
// 1. Don't have the ace (someone else has it to be partner)
// 2. Have at least one fail card of that suit (hold card to receive lead)
function getCallableSuits(hand: Card[]): Suit[] {
  const callable: Suit[] = [];
  const failSuits: Suit[] = ['clubs', 'spades', 'hearts'];

  for (const suit of failSuits) {
    const failCardsOfSuit = hand.filter(c => c.suit === suit && !isTrump(c));
    const hasAce = failCardsOfSuit.some(c => c.rank === 'A');
    const hasHoldCard = failCardsOfSuit.length > 0;

    // Can call this suit if: don't have the ace AND have a hold card
    if (!hasAce && hasHoldCard) {
      callable.push(suit);
    }
  }

  return callable;
}

// Get callable suits for calling a 10 (when picker has all 3 fail aces)
// Picker uses their ace as the hold card, partner has the 10
function getCallableTens(hand: Card[]): Suit[] {
  const failSuits: Suit[] = ['clubs', 'spades', 'hearts'];

  // Must have all 3 fail aces to call a 10
  const hasAllAces = failSuits.every(suit =>
    hand.some(c => c.suit === suit && c.rank === 'A' && !isTrump(c))
  );
  if (!hasAllAces) return [];

  const callable: Suit[] = [];

  for (const suit of failSuits) {
    // Check if picker does NOT have the 10 (can't call own 10)
    const hasTen = hand.some(c => c.suit === suit && c.rank === '10' && !isTrump(c));
    if (!hasTen) {
      callable.push(suit);
    }
  }

  return callable;
}

// Check if must go alone (has all 3 aces and can't call a 10)
function mustGoAlone(hand: Card[], callTenEnabled: boolean = false): boolean {
  const failSuits: Suit[] = ['clubs', 'spades', 'hearts'];
  const hasAllAces = failSuits.every(suit =>
    hand.some(c => c.suit === suit && c.rank === 'A' && !isTrump(c))
  );

  if (!hasAllAces) return false;

  // If callTen is enabled, only must go alone if no 10s can be called
  if (callTenEnabled) {
    const callableTens = getCallableTens(hand);
    return callableTens.length === 0;
  }

  return true;
}

// ============================================
// AI STRATEGIC PLAY SELECTION
// ============================================

/**
 * Get the effective suit for following purposes
 * Trump cards are always "trump" suit, non-trump follow their actual suit
 */
function getEffectiveSuit(card: Card): Suit | 'trump' {
  if (isTrump(card)) return 'trump';
  return card.suit;
}

/**
 * Check if card A can beat card B given lead suit
 */
function canBeatCard(cardA: Card, cardB: Card, leadSuit: Suit | 'trump'): boolean {
  const aIsTrump = isTrump(cardA);
  const bIsTrump = isTrump(cardB);
  const aSuit = getEffectiveSuit(cardA);

  // Trump beats non-trump
  if (aIsTrump && !bIsTrump) return true;
  if (!aIsTrump && bIsTrump) return false;

  // Both trump - compare trump power (lower index = higher power)
  if (aIsTrump && bIsTrump) {
    return getTrumpPower(cardA) < getTrumpPower(cardB);
  }

  // Neither trump - must be same suit as lead to have a chance
  if (aSuit !== leadSuit) return false;

  // Same suit - compare by fail order
  return FAIL_ORDER.indexOf(cardA.rank) < FAIL_ORDER.indexOf(cardB.rank);
}

/**
 * Determine trick winner from current cards
 */
function getCurrentTrickWinner(trick: Trick): { winner: PlayerPosition; card: Card } | null {
  if (trick.cards.length === 0) return null;

  let winningPlay = trick.cards[0];
  let winningIsTrump = isTrump(winningPlay.card);

  for (let i = 1; i < trick.cards.length; i++) {
    const play = trick.cards[i];
    const playIsTrump = isTrump(play.card);

    if (playIsTrump && !winningIsTrump) {
      winningPlay = play;
      winningIsTrump = true;
    } else if (playIsTrump && winningIsTrump) {
      if (getTrumpPower(play.card) < getTrumpPower(winningPlay.card)) {
        winningPlay = play;
      }
    } else if (!playIsTrump && !winningIsTrump) {
      const leadSuit = trick.cards[0].card.suit;
      if (play.card.suit === leadSuit) {
        if (FAIL_ORDER.indexOf(play.card.rank) < FAIL_ORDER.indexOf(winningPlay.card.rank)) {
          winningPlay = play;
        }
      }
    }
  }

  return { winner: winningPlay.playedBy, card: winningPlay.card };
}

/**
 * Strategic card selection for AI play
 */
function selectCardToPlay(
  legalPlays: Card[],
  currentTrick: Trick,
  isPicker: boolean,
  isPartner: boolean,
  calledAce: { suit: Suit; revealed: boolean } | null,
  pickerPosition: PlayerPosition | null,
  myPosition: PlayerPosition,
  dealerPosition: PlayerPosition
): Card {
  // Only one option - play it
  if (legalPlays.length === 1) {
    return legalPlays[0];
  }

  const isLeading = currentTrick.cards.length === 0;

  if (isLeading) {
    return selectLeadCard(legalPlays, isPicker, isPartner, calledAce, pickerPosition, myPosition, dealerPosition);
  } else {
    return selectFollowCard(legalPlays, currentTrick, isPicker, isPartner, calledAce, pickerPosition, myPosition);
  }
}

/**
 * Select which card to lead with
 * Incorporates best practices:
 * - Lead Q♣ first (guarantees trick, bleeds trump)
 * - "Long thru / Short to" for defenders based on picker position
 */
function selectLeadCard(
  legalPlays: Card[],
  isPicker: boolean,
  isPartner: boolean,
  calledAce: { suit: Suit; revealed: boolean } | null,
  pickerPosition: PlayerPosition | null,
  myPosition: PlayerPosition,
  dealerPosition: PlayerPosition
): Card {
  const trumpInHand = legalPlays.filter(c => isTrump(c));
  const failInHand = legalPlays.filter(c => !isTrump(c));

  // Helper: Check if picker is "on the end" (plays last in trick)
  // Picker is on end if they're position before me in play order
  const isPickerOnEnd = pickerPosition !== null &&
    ((myPosition + 4) % 5) === pickerPosition;

  // PICKER STRATEGY: Lead trump to pull out defenders' trump
  if (isPicker) {
    if (trumpInHand.length > 0) {
      // BEST PRACTICE: Lead Q♣ first if we have it (guarantees trick, bleeds 5 trump)
      const queenOfClubs = trumpInHand.find(c => c.rank === 'Q' && c.suit === 'clubs');
      if (queenOfClubs) return queenOfClubs;

      // Lead highest trump to establish control
      const sortedTrump = [...trumpInHand].sort(
        (a, b) => getTrumpPower(a) - getTrumpPower(b)
      );

      // If we have queens/jacks, lead them (trump power < 8)
      const highTrump = sortedTrump.find(c => getTrumpPower(c) < 8);
      if (highTrump) return highTrump;

      // Otherwise lead highest trump we have
      return sortedTrump[0];
    }

    // No trump - lead called suit to find partner
    if (calledAce && !calledAce.revealed) {
      const calledSuitCards = failInHand.filter(c => c.suit === calledAce.suit);
      if (calledSuitCards.length > 0) {
        // Lead lowest of called suit
        const sorted = [...calledSuitCards].sort(
          (a, b) => getCardPoints(a) - getCardPoints(b)
        );
        return sorted[0];
      }
    }

    // Lead lowest fail card
    if (failInHand.length > 0) {
      const sortedFail = [...failInHand].sort(
        (a, b) => getCardPoints(a) - getCardPoints(b)
      );
      return sortedFail[0];
    }
  }

  // PARTNER STRATEGY: Support picker, lead trump when revealed
  if (isPartner) {
    if (trumpInHand.length > 0 && calledAce?.revealed) {
      // BEST PRACTICE: Lead Q♣ to signal partnership and take trick
      const queenOfClubs = trumpInHand.find(c => c.rank === 'Q' && c.suit === 'clubs');
      if (queenOfClubs) return queenOfClubs;

      // Lead highest trump to help picker
      const sortedTrump = [...trumpInHand].sort(
        (a, b) => getTrumpPower(a) - getTrumpPower(b)
      );
      return sortedTrump[0];
    }

    // Don't lead called suit if holding ace (avoid revealing)
    const otherFail = failInHand.filter(
      c => !calledAce || c.suit !== calledAce.suit
    );
    if (otherFail.length > 0) {
      const sorted = [...otherFail].sort(
        (a, b) => getCardPoints(a) - getCardPoints(b)
      );
      return sorted[0];
    }
  }

  // DEFENDER STRATEGY: Lead called suit to find partner, use Long Thru/Short To
  if (!isPicker && !isPartner) {
    // Lead called suit to smoke out partner (great defender play!)
    if (calledAce && !calledAce.revealed) {
      const calledSuitCards = failInHand.filter(c => c.suit === calledAce.suit);
      if (calledSuitCards.length > 0) {
        // Lead highest of called suit (might win, forces partner to reveal)
        const sorted = [...calledSuitCards].sort(
          (a, b) => getCardPoints(b) - getCardPoints(a)
        );
        return sorted[0];
      }
    }

    // BEST PRACTICE: "Long Thru / Short To"
    // - Picker in middle: Lead LONG suit (partners after picker may trump)
    // - Picker on end: Lead SHORT suit (hope picker has that fail)
    if (failInHand.length > 0) {
      const suitCounts = new Map<Suit, number>();
      for (const suit of FAIL_SUITS) {
        const count = failInHand.filter(c => c.suit === suit).length;
        if (count > 0) {
          suitCounts.set(suit, count);
        }
      }

      if (suitCounts.size > 0) {
        let targetSuit: Suit;

        if (isPickerOnEnd) {
          // Picker on end - lead SHORT suit (hope picker has it)
          targetSuit = [...suitCounts.entries()].sort(
            (a, b) => a[1] - b[1]
          )[0][0];
        } else {
          // Picker in middle - lead LONG suit (partners may trump after)
          targetSuit = [...suitCounts.entries()].sort(
            (a, b) => b[1] - a[1]
          )[0][0];
        }

        const suitCards = failInHand.filter(c => c.suit === targetSuit);
        const sorted = [...suitCards].sort(
          (a, b) => getCardPoints(b) - getCardPoints(a)
        );
        return sorted[0];
      }
    }

    // Have to lead trump - lead lowest
    if (trumpInHand.length > 0) {
      const sortedTrump = [...trumpInHand].sort(
        (a, b) => getTrumpPower(b) - getTrumpPower(a) // Higher index = lower power
      );
      return sortedTrump[0];
    }
  }

  // Fallback: play lowest point card
  const sorted = [...legalPlays].sort(
    (a, b) => getCardPoints(a) - getCardPoints(b)
  );
  return sorted[0];
}

/**
 * Select which card to play when following
 * Incorporates best practices:
 * - "Go high or go home" when trumping in
 * - 2nd/3rd player plays LOW trump on trump leads (don't waste high)
 */
function selectFollowCard(
  legalPlays: Card[],
  currentTrick: Trick,
  isPicker: boolean,
  isPartner: boolean,
  calledAce: { suit: Suit; revealed: boolean } | null,
  pickerPosition: PlayerPosition | null,
  myPosition: PlayerPosition
): Card {
  const leadCard = currentTrick.cards[0].card;
  const leadSuit = getEffectiveSuit(leadCard);
  const leadIsTrump = isTrump(leadCard);
  const trickPosition = currentTrick.cards.length; // 0-indexed position in trick (1 = 2nd player, 2 = 3rd, etc)

  // Calculate who's currently winning
  const currentWinnerInfo = getCurrentTrickWinner(currentTrick);
  if (!currentWinnerInfo) {
    // Shouldn't happen, but fallback
    return legalPlays[0];
  }

  const { winner: currentWinner, card: currentWinnerCard } = currentWinnerInfo;

  // Check if teammate is winning
  // IMPORTANT: Be conservative - only trust teammate if partner is revealed
  let teammateWinning = false;

  if (isPicker) {
    // For picker, partner winning is good only if revealed
    if (calledAce?.revealed) {
      // Partner is revealed - check if they're winning
      // We'd need to track partner position, so for now be conservative
    }
  } else if (isPartner && pickerPosition !== null) {
    // Partner knows picker - check if picker is winning
    teammateWinning = currentWinner === pickerPosition;
  } else if (!isPicker && !isPartner && pickerPosition !== null) {
    // Defender - BE CAREFUL: unknown player could be partner!
    // Only assume teammate if partner has been revealed
    if (calledAce?.revealed) {
      // Partner revealed - current winner is teammate only if not picker AND not partner
      // But we don't track partner position here, so only trust if winner is clearly not picker
      teammateWinning = currentWinner !== pickerPosition;
    }
    // If partner NOT revealed, don't assume teammate - they might be the partner!
  }

  // Calculate trick points
  const trickPoints = currentTrick.cards.reduce(
    (sum, c) => sum + getCardPoints(c.card),
    0
  );

  // Find cards that can win
  const winningPlays = legalPlays.filter(c =>
    canBeatCard(c, currentWinnerCard, leadSuit)
  );
  const canWin = winningPlays.length > 0;

  // Check if we're trumping in (fail was led but we can't follow suit and have trump)
  // This happens when: fail led, we don't have that fail suit, but we have trump to win with
  const trumpInLegal = legalPlays.filter(c => isTrump(c));
  const canFollowLedSuit = legalPlays.some(c => !isTrump(c) && c.suit === leadCard.suit);
  const isTrumpingIn = !leadIsTrump && !canFollowLedSuit && trumpInLegal.length > 0;

  // BEST PRACTICE: 2nd/3rd player on trump lead plays LOW trump (don't waste high)
  // Only applies when teammate is likely winning or we don't need to contest
  if (leadIsTrump && (trickPosition === 1 || trickPosition === 2)) {
    // On picker's team and teammate leading trump - play low
    if ((isPicker || isPartner) && teammateWinning) {
      const sortedTrump = [...legalPlays].sort(
        (a, b) => getTrumpPower(b) - getTrumpPower(a) // Lower power = higher index
      );
      return sortedTrump[0]; // Play lowest trump
    }
  }

  // TEAMMATE IS WINNING - schmear or throw off
  if (teammateWinning) {
    // Schmear points to teammate (especially if trick has good points)
    const highPointCards = legalPlays.filter(c => getCardPoints(c) >= 10);
    if (highPointCards.length > 0 && trickPoints >= 10) {
      const sorted = [...highPointCards].sort(
        (a, b) => getCardPoints(b) - getCardPoints(a)
      );
      return sorted[0];
    }

    // Throw off low card
    const sorted = [...legalPlays].sort(
      (a, b) => getCardPoints(a) - getCardPoints(b)
    );
    return sorted[0];
  }

  // OPPONENT IS WINNING - try to win or minimize loss
  if (canWin) {
    // BEST PRACTICE: "Go high or go home" when trumping in
    // When trumping a fail trick, play high enough to actually win
    // Don't play a low trump that someone behind you can beat
    if (isTrumpingIn) {
      // We're trumping in - ALWAYS try to win the trick (opponent has the lead!)
      const trumpWinners = winningPlays.filter(c => isTrump(c));
      if (trumpWinners.length > 0) {
        // Sort by trump power (lower index = higher power)
        const sortedByPower = [...trumpWinners].sort(
          (a, b) => getTrumpPower(a) - getTrumpPower(b)
        );

        // If we're not last to play, need to play high enough to hold
        if (trickPosition < 4) {
          // If trick has good points OR we're a defender (want to deny picker), play high
          if (trickPoints >= 10 || (!isPicker && !isPartner)) {
            return sortedByPower[0]; // Play our highest trump
          }
          // Otherwise play a reasonably high trump (queens/jacks if available)
          const highEnough = sortedByPower.find(c => getTrumpPower(c) < 10);
          if (highEnough) return highEnough;
        }

        // Last to play or low-value trick - use minimum winning trump
        return sortedByPower[sortedByPower.length - 1];
      }
    }

    // Win with minimum necessary card (save high trump)
    const sortedWinners = [...winningPlays].sort((a, b) => {
      // Prefer winning with lowest trump power
      if (isTrump(a) && isTrump(b)) {
        return getTrumpPower(b) - getTrumpPower(a);
      }
      // Prefer winning with fail over trump
      if (!isTrump(a) && isTrump(b)) return -1;
      if (isTrump(a) && !isTrump(b)) return 1;
      // Win with lowest points
      return getCardPoints(a) - getCardPoints(b);
    });

    // ALWAYS try to win if we can - every trick counts!
    return sortedWinners[0];
  }

  // CAN'T WIN - minimize points given, play lowest
  const sorted = [...legalPlays].sort(
    (a, b) => getCardPoints(a) - getCardPoints(b)
  );
  return sorted[0];
}

// ============================================
// GAME STATE MANAGEMENT
// ============================================

// Generate a random seed for shuffle verification
function generateShuffleSeed(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let seed = '';
  for (let i = 0; i < 8; i++) {
    seed += chars[Math.floor(Math.random() * chars.length)];
  }
  return seed;
}

export function createGameState(room: Room): GameState {
  const seed = generateShuffleSeed();
  const deck = shuffleDeck(createDeck());
  const { hands, blind } = dealCards(deck);

  const dealerPosition = (room.handsPlayed % 5) as PlayerPosition;
  const firstPicker = ((dealerPosition + 1) % 5) as PlayerPosition;

  // Build config from room settings
  const config: GameConfig = {
    ...DEFAULT_CONFIG,
    cracking: room.settings.cracking,
    blitzes: room.settings.blitzes,
    callTen: room.settings.callTen,
    noPickVariant: room.settings.noPickRule,
    partnerVariant: room.settings.partnerVariant,
  };

  const players: Player[] = [];
  for (let i = 0; i < 5; i++) {
    const pos = i as PlayerPosition;
    const humanPlayer = room.players.get(pos);
    players.push({
      position: pos,
      type: humanPlayer ? 'human' : 'ai',
      hand: hands[i],
      tricksWon: [],
      isDealer: i === dealerPosition,
      isPicker: false,
      isPartner: false,
    });
  }

  return {
    config,
    phase: 'picking',
    players,
    deck: [],
    blind,
    buried: [],
    currentTrick: { cards: [], leadPlayer: firstPicker },
    completedTricks: [],
    currentPlayer: firstPicker,
    dealerPosition,
    pickerPosition: null,
    calledAce: null,
    passCount: 0,
    trickNumber: 1,
    seed,
  };
}

export function applyAction(state: GameState, position: PlayerPosition, action: GameAction): boolean {
  // Validate it's this player's turn
  if (state.currentPlayer !== position) {
    return false;
  }

  const player = state.players[position];

  switch (action.type) {
    case 'pick': {
      if (state.phase !== 'picking') return false;

      // Add blind to hand
      player.hand = sortHand([...player.hand, ...state.blind]);
      player.isPicker = true;
      state.blind = [];
      state.pickerPosition = position;

      // Initialize crack state if cracking is enabled
      if (state.config.cracking) {
        state.crackState = {
          cracked: false,
          crackedBy: null,
          recracked: false,
          blitzed: false,
          multiplier: 1,
        };
      }

      // Check if must go alone
      if (mustGoAlone(player.hand)) {
        state.phase = 'playing';
        const firstPlayer = ((state.dealerPosition + 1) % 5) as PlayerPosition;
        state.currentPlayer = firstPlayer;
        state.currentTrick = { cards: [], leadPlayer: firstPlayer };
      } else if (state.config.cracking) {
        // Go to cracking phase - start with player after picker
        state.phase = 'cracking';
        state.currentPlayer = ((position + 1) % 5) as PlayerPosition;
      } else {
        state.phase = 'burying';
      }
      return true;
    }

    case 'pass': {
      if (state.phase !== 'picking') return false;

      state.passCount++;
      if (state.passCount >= 5) {
        // Everyone passed - leaster or new deal
        state.phase = 'scoring';
      } else {
        state.currentPlayer = ((position + 1) % 5) as PlayerPosition;
      }
      return true;
    }

    case 'bury': {
      if (state.phase !== 'burying') return false;
      if (state.pickerPosition !== position) return false;

      const cards = action.cards;
      // Remove cards from hand
      player.hand = player.hand.filter(c => !cards.some(bc => bc.id === c.id));
      player.hand = sortHand(player.hand);
      state.buried = cards;
      state.phase = 'calling';
      return true;
    }

    case 'callAce': {
      if (state.phase !== 'calling') return false;
      if (state.pickerPosition !== position) return false;

      const suit = action.suit;

      // Validate: picker must have a hold card of this suit (and not the ace)
      const callableSuits = getCallableSuits(player.hand);
      if (!callableSuits.includes(suit)) {
        return false; // Can't call a suit without a hold card
      }

      // Find partner
      const partnerPos = state.players.findIndex(p =>
        p.hand.some(c => c.suit === suit && c.rank === 'A' && !isTrump(c)) &&
        p.position !== position
      );

      if (partnerPos !== -1) {
        state.players[partnerPos].isPartner = true;
      }

      state.calledAce = { suit, revealed: false };
      state.phase = 'playing';
      const firstPlayer = ((state.dealerPosition + 1) % 5) as PlayerPosition;
      state.currentPlayer = firstPlayer;
      state.currentTrick = { cards: [], leadPlayer: firstPlayer };
      return true;
    }

    case 'callTen': {
      if (state.phase !== 'calling') return false;
      if (state.pickerPosition !== position) return false;

      const suit = action.suit;

      // Validate: picker must have all 3 fail aces (to use ace as hold card)
      // and NOT have the 10 of the called suit
      const callableTens = getCallableTens(player.hand);
      if (!callableTens.includes(suit)) {
        return false; // Can't call a 10 without having all aces
      }

      // Find partner (who has the 10)
      const partnerPos = state.players.findIndex(p =>
        p.hand.some(c => c.suit === suit && c.rank === '10' && !isTrump(c)) &&
        p.position !== position
      );

      if (partnerPos !== -1) {
        state.players[partnerPos].isPartner = true;
      }

      state.calledAce = { suit, revealed: false, isTen: true };
      state.phase = 'playing';
      const firstPlayer = ((state.dealerPosition + 1) % 5) as PlayerPosition;
      state.currentPlayer = firstPlayer;
      state.currentTrick = { cards: [], leadPlayer: firstPlayer };
      return true;
    }

    case 'goAlone': {
      if (state.phase !== 'calling') return false;
      if (state.pickerPosition !== position) return false;

      state.phase = 'playing';
      const firstPlayer = ((state.dealerPosition + 1) % 5) as PlayerPosition;
      state.currentPlayer = firstPlayer;
      state.currentTrick = { cards: [], leadPlayer: firstPlayer };
      return true;
    }

    case 'playCard': {
      if (state.phase !== 'playing') return false;

      const card = action.card;
      const legalPlays = getLegalPlays(
        player.hand,
        state.currentTrick,
        state.calledAce,
        player.isPicker,
        player.isPartner
      );

      if (!legalPlays.some(c => c.id === card.id)) {
        return false;
      }

      // Remove card from hand
      player.hand = player.hand.filter(c => c.id !== card.id);

      // Add to trick
      state.currentTrick.cards.push({ card, playedBy: position });

      // Check if called card played (ace or 10)
      if (state.calledAce && !state.calledAce.revealed &&
          card.suit === state.calledAce.suit) {
        const calledRank = state.calledAce.isTen ? '10' : 'A';
        if (card.rank === calledRank) {
          state.calledAce.revealed = true;
        }
      }

      // Check if trick complete
      if (state.currentTrick.cards.length === 5) {
        const winner = determineTrickWinner(state.currentTrick);
        state.currentTrick.winningPlayer = winner;

        // Award trick to winner
        const trickCards = state.currentTrick.cards.map(tc => tc.card);
        state.players[winner].tricksWon.push(trickCards);

        state.completedTricks.push({ ...state.currentTrick });

        if (state.trickNumber >= 6) {
          state.phase = 'scoring';
        } else {
          // DON'T clear trick yet - leave it visible with winningPlayer set
          // clearCompletedTrick() will be called after a delay to start next trick
          state.currentPlayer = winner;
        }
      } else {
        state.currentPlayer = ((position + 1) % 5) as PlayerPosition;
      }
      return true;
    }

    // ============================================
    // CRACKING ACTIONS
    // ============================================

    case 'crack': {
      if (state.phase !== 'cracking') return false;
      if (!state.crackState) return false;
      // Only non-picker can crack
      if (position === state.pickerPosition) return false;

      // Double the stakes
      state.crackState.cracked = true;
      state.crackState.crackedBy = position;
      state.crackState.multiplier *= 2;

      // Move to picker for potential recrack
      state.currentPlayer = state.pickerPosition!;
      return true;
    }

    case 'recrack': {
      if (state.phase !== 'cracking') return false;
      if (!state.crackState || !state.crackState.cracked) return false;
      // Only picker can recrack
      if (position !== state.pickerPosition) return false;

      // Double again and move to burying
      state.crackState.recracked = true;
      state.crackState.multiplier *= 2;
      state.phase = 'burying';
      state.currentPlayer = state.pickerPosition!;
      return true;
    }

    case 'noCrack': {
      if (state.phase !== 'cracking') return false;
      if (!state.crackState) return false;

      const pickerPosition = state.pickerPosition!;

      // If picker is deciding on recrack, move to burying
      if (position === pickerPosition) {
        state.phase = 'burying';
        state.currentPlayer = pickerPosition;
        return true;
      }

      // Otherwise, check if we should move to next player or to burying
      const nextPlayer = ((position + 1) % 5) as PlayerPosition;

      // If we've gone around back to picker without anyone cracking, move to burying
      if (nextPlayer === pickerPosition) {
        state.phase = 'burying';
        state.currentPlayer = pickerPosition;
      } else {
        state.currentPlayer = nextPlayer;
      }
      return true;
    }

    case 'blitz': {
      // Blitz can only be done during picking phase before seeing cards
      // This is when the picker doubles before taking the blind
      if (state.phase !== 'picking') return false;
      if (!state.config.blitzes) return false;

      // Initialize crack state for blitz
      state.crackState = {
        cracked: false,
        crackedBy: null,
        recracked: false,
        blitzed: true,
        multiplier: 2, // Blitz doubles
      };

      // Now player picks (add blind to hand)
      player.hand = sortHand([...player.hand, ...state.blind]);
      player.isPicker = true;
      state.blind = [];
      state.pickerPosition = position;

      // Check if must go alone
      if (mustGoAlone(player.hand)) {
        state.phase = 'playing';
        const firstPlayer = ((state.dealerPosition + 1) % 5) as PlayerPosition;
        state.currentPlayer = firstPlayer;
        state.currentTrick = { cards: [], leadPlayer: firstPlayer };
      } else if (state.config.cracking) {
        // Go to cracking phase even after blitz
        state.phase = 'cracking';
        state.currentPlayer = ((position + 1) % 5) as PlayerPosition;
      } else {
        state.phase = 'burying';
      }
      return true;
    }
  }

  return false;
}

// Calculate scores at end of hand
export function calculateScores(state: GameState, room: Room): void {
  if (state.pickerPosition === null) {
    // Leaster - everyone passed
    room.handsPlayed++;
    return;
  }

  // Calculate points for each team
  let pickerTeamPoints = 0;
  let defenderPoints = 0;

  // Add buried cards to picker's points
  pickerTeamPoints += state.buried.reduce((sum, c) => sum + getCardPoints(c), 0);

  for (const player of state.players) {
    const trickPoints = player.tricksWon.flat().reduce((sum, c) => sum + getCardPoints(c), 0);
    if (player.isPicker || player.isPartner) {
      pickerTeamPoints += trickPoints;
    } else {
      defenderPoints += trickPoints;
    }
  }

  const pickerWins = pickerTeamPoints >= 61;
  const isSchneider = pickerWins ? defenderPoints < 31 : pickerTeamPoints < 31;
  const isSchwarz = pickerWins
    ? state.players.filter(p => !p.isPicker && !p.isPartner).every(p => p.tricksWon.length === 0)
    : state.players.filter(p => p.isPicker || p.isPartner).every(p => p.tricksWon.length === 0);

  // Calculate score changes
  let basePoints = 1;
  if (isSchneider) basePoints = 2;
  if (isSchwarz) basePoints = 3;

  // Apply crack multiplier if applicable
  const crackMultiplier = state.crackState?.multiplier ?? 1;
  basePoints *= crackMultiplier;

  // Partner gets half points, picker gets 2x, defenders split
  const partnerPos = state.players.findIndex(p => p.isPartner);
  const hasPartner = partnerPos !== -1;

  for (let i = 0; i < 5; i++) {
    const player = state.players[i];
    if (player.isPicker) {
      room.playerScores[i] += (pickerWins ? basePoints : -basePoints) * (hasPartner ? 2 : 4);
    } else if (player.isPartner) {
      room.playerScores[i] += (pickerWins ? basePoints : -basePoints);
    } else {
      room.playerScores[i] += (pickerWins ? -basePoints : basePoints);
    }
  }

  room.handsPlayed++;
}

// Clear a completed trick and start the next one (called after delay to show trick result)
export function clearCompletedTrick(state: GameState): void {
  if (state.currentTrick.cards.length === 5 && state.currentTrick.winningPlayer !== undefined) {
    const winner = state.currentTrick.winningPlayer;
    state.trickNumber++;
    state.currentTrick = { cards: [], leadPlayer: winner };
  }
}

// Calculate hand score for display (doesn't modify room scores)
function getHandScore(state: GameState): import('./types.js').HandScore | undefined {
  if (state.phase !== 'scoring' || state.pickerPosition === null) {
    return undefined;
  }

  // Calculate points for each team
  let pickerTeamPoints = state.buried.reduce((sum, c) => sum + getCardPoints(c), 0);
  let defenderPoints = 0;

  for (const player of state.players) {
    const trickPoints = player.tricksWon.flat().reduce((sum, c) => sum + getCardPoints(c), 0);
    if (player.isPicker || player.isPartner) {
      pickerTeamPoints += trickPoints;
    } else {
      defenderPoints += trickPoints;
    }
  }

  const pickerWins = pickerTeamPoints >= 61;
  const isSchneider = pickerWins ? defenderPoints < 31 : pickerTeamPoints < 31;
  const isSchwarz = pickerWins
    ? state.players.filter(p => !p.isPicker && !p.isPartner).every(p => p.tricksWon.length === 0)
    : state.players.filter(p => p.isPicker || p.isPartner).every(p => p.tricksWon.length === 0);

  let multiplier = 1;
  if (isSchneider) multiplier = 2;
  if (isSchwarz) multiplier = 3;

  // Apply crack multiplier if applicable
  const crackMultiplier = state.crackState?.multiplier ?? 1;
  multiplier *= crackMultiplier;

  const partnerPos = state.players.findIndex(p => p.isPartner);
  const hasPartner = partnerPos !== -1;

  const playerScores: { position: PlayerPosition; points: number }[] = [];
  for (let i = 0; i < 5; i++) {
    const player = state.players[i];
    let points: number;
    if (player.isPicker) {
      points = (pickerWins ? multiplier : -multiplier) * (hasPartner ? 2 : 4);
    } else if (player.isPartner) {
      points = pickerWins ? multiplier : -multiplier;
    } else {
      points = pickerWins ? -multiplier : multiplier;
    }
    playerScores.push({ position: i as PlayerPosition, points });
  }

  return {
    pickerTeamPoints,
    defenderTeamPoints: defenderPoints,
    pickerWins,
    isSchneider,
    isSchwarz,
    multiplier,
    playerScores,
  };
}

// Create client view of game state
export function getClientGameState(state: GameState, position: PlayerPosition, room: Room): ClientGameState {
  const clientPlayers: ClientPlayer[] = state.players.map((p, i) => {
    const roomPlayer = room.players.get(i as PlayerPosition);
    return {
      position: p.position,
      name: roomPlayer?.name ?? getAIName(i as PlayerPosition),
      cardCount: p.hand.length,
      hand: i === position ? p.hand : null,
      tricksWon: p.tricksWon,
      isDealer: p.isDealer,
      isPicker: p.isPicker,
      isPartner: p.isPartner && (state.calledAce?.revealed ?? false),
      isAI: !roomPlayer,
      connected: roomPlayer?.connected ?? true,
    };
  });

  return {
    phase: state.phase,
    players: clientPlayers,
    blind: state.blind.length,
    currentTrick: state.currentTrick,
    completedTricks: state.completedTricks,
    currentPlayer: state.currentPlayer,
    dealerPosition: state.dealerPosition,
    pickerPosition: state.pickerPosition,
    calledAce: state.calledAce,
    passCount: state.passCount,
    trickNumber: state.trickNumber,
    playerScores: room.playerScores,
    handsPlayed: room.handsPlayed,
    handScore: getHandScore(state),
    shuffleSeed: state.seed,
    crackState: state.crackState,
  };
}

// Check if current player is AI
export function isAITurn(state: GameState, room: Room): boolean {
  if (state.phase === 'scoring' || state.phase === 'dealing' || state.phase === 'gameOver') {
    return false;
  }
  return !room.players.has(state.currentPlayer);
}

// Get AI decision (simplified)
export function getAIAction(state: GameState, position: PlayerPosition): GameAction {
  const player = state.players[position];

  switch (state.phase) {
    case 'cracking': {
      // AI cracking logic - generally conservative
      // Cracking is risky - only crack with very strong defensive hands
      if (!state.crackState) {
        return { type: 'noCrack' };
      }

      // If we're the picker (deciding on recrack)
      if (position === state.pickerPosition) {
        // Recracking is even riskier - only with monster hands
        const hand = player.hand;
        const trumpCards = hand.filter(c => isTrump(c));
        const queens = trumpCards.filter(c => c.rank === 'Q').length;
        const jacks = trumpCards.filter(c => c.rank === 'J').length;

        // Only recrack with truly dominant hands
        if (queens >= 3 || (queens >= 2 && jacks >= 2 && trumpCards.length >= 6)) {
          return { type: 'recrack' };
        }
        return { type: 'noCrack' };
      }

      // As a defender, only crack with strong defensive hands
      // This is rare - we want trump depth to stop the picker
      const hand = player.hand;
      const trumpCards = hand.filter(c => isTrump(c));
      const queens = trumpCards.filter(c => c.rank === 'Q').length;
      const jacks = trumpCards.filter(c => c.rank === 'J').length;
      const failAces = hand.filter(c => c.rank === 'A' && !isTrump(c)).length;

      // Crack with: 3+ trump including multiple high trump, AND fail aces
      if (trumpCards.length >= 3 && (queens + jacks) >= 2 && failAces >= 2) {
        return { type: 'crack' };
      }

      return { type: 'noCrack' };
    }

    case 'picking': {
      // Evaluate hand strength for picking
      const hand = player.hand;
      const trumpCards = hand.filter(c => isTrump(c));
      const trumpCount = trumpCards.length;

      // Count high trump (queens and jacks)
      const queens = trumpCards.filter(c => c.rank === 'Q').length;
      const jacks = trumpCards.filter(c => c.rank === 'J').length;
      const highTrump = queens + jacks;

      // Count fail aces (not diamond ace, that's trump)
      const failAces = hand.filter(c => c.rank === 'A' && c.suit !== 'diamonds').length;

      // Check for black queens (the "Ma's")
      const hasBlackQueens = trumpCards.some(c => c.rank === 'Q' && c.suit === 'clubs') &&
                             trumpCards.some(c => c.rank === 'Q' && c.suit === 'spades');

      // BEST PRACTICE: Position-aware picking
      // Position 2 (second to dealer's left) is most dangerous - 3 players behind, no lead
      const firstPickerPos = ((state.dealerPosition + 1) % 5) as PlayerPosition;
      const myPickOrder = (position - firstPickerPos + 5) % 5; // 0 = first to pick, 4 = dealer
      const isPosition2 = myPickOrder === 1; // Second picker position (most dangerous)
      const isOnEnd = myPickOrder === 4; // Dealer position (safest)
      const hasLead = myPickOrder === 0; // First picker gets the lead

      // Base pick criteria:
      // - 5+ trump regardless of position
      // - 4+ trump with 2+ high trump
      // - 3+ trump with 3+ high trump (all queens/jacks)
      // - 3+ queens
      // - Black queens ("Ma's") when leading or on end
      let shouldPick =
        trumpCount >= 5 ||
        (trumpCount >= 4 && highTrump >= 2) ||
        (trumpCount >= 3 && highTrump >= 3) ||
        queens >= 3 ||
        (hasBlackQueens && (hasLead || isOnEnd));

      // BEST PRACTICE: Don't pick thin in position 2 - require stronger hand
      if (isPosition2 && shouldPick) {
        // Require higher standards for position 2
        shouldPick =
          trumpCount >= 5 ||
          (trumpCount >= 4 && highTrump >= 3) ||
          queens >= 3;
      }

      // Bonus: position 1 (lead) or 5 (end) can be slightly more aggressive
      if ((hasLead || isOnEnd) && !shouldPick) {
        shouldPick =
          (trumpCount >= 4 && highTrump >= 1 && failAces >= 1) ||
          (hasBlackQueens && trumpCount >= 3);
      }

      if (shouldPick) {
        return { type: 'pick' };
      }
      return { type: 'pass' };
    }

    case 'burying': {
      // BEST PRACTICE: Strategic burying
      // Goals: 1) Keep at least one callable suit! 2) Create voids 3) Bury points 4) Keep control
      // NEVER bury queens or jacks (top trump)
      // CRITICAL: Must preserve at least one hold card for a callable suit!

      const hand = player.hand;

      // Separate cards by type
      const trumpCards = hand.filter(c => isTrump(c));
      const failCards = hand.filter(c => !isTrump(c));

      // Count cards per fail suit
      const suitCounts: Record<Suit, Card[]> = {
        clubs: failCards.filter(c => c.suit === 'clubs'),
        spades: failCards.filter(c => c.suit === 'spades'),
        hearts: failCards.filter(c => c.suit === 'hearts'),
        diamonds: [], // All diamonds are trump
      };

      // CRITICAL: Identify callable suits (don't have ace, have at least one hold card)
      const callableSuits = FAIL_SUITS.filter(suit => {
        const hasAce = suitCounts[suit].some(c => c.rank === 'A');
        const hasNonAce = suitCounts[suit].some(c => c.rank !== 'A');
        return !hasAce && hasNonAce;
      });

      // Track hold cards per callable suit
      const holdCardsPerSuit: Record<string, number> = {};
      for (const suit of callableSuits) {
        holdCardsPerSuit[suit] = suitCounts[suit].length;
      }

      // Find suits we can SAFELY void (won't eliminate our only callable suit)
      const voidableSuits = FAIL_SUITS.filter(suit => {
        const cards = suitCounts[suit];
        if (cards.length === 0 || cards.length > 2) return false;
        if (cards.some(c => c.rank === 'A')) return false; // Don't void if we have ace

        // Check if voiding this suit would leave no callable suits
        if (callableSuits.includes(suit)) {
          const otherCallable = callableSuits.filter(s => s !== suit);
          if (otherCallable.length === 0) return false; // Can't void our only callable suit!
        }
        return true;
      });

      const toBury: Card[] = [];
      const buriedPerSuit: Record<string, number> = {};

      // Helper to check if we can bury a card from a callable suit
      const canBuryFromSuit = (suit: Suit): boolean => {
        if (!callableSuits.includes(suit)) return true; // Not callable, can bury freely

        const buried = buriedPerSuit[suit] || 0;
        const remaining = holdCardsPerSuit[suit] - buried;

        // Check if another callable suit has hold cards
        const otherCallable = callableSuits.filter(s => {
          if (s === suit) return false;
          const sBuried = buriedPerSuit[s] || 0;
          return holdCardsPerSuit[s] - sBuried > 0;
        });

        // Can only bury if we have 2+ hold cards OR another callable suit exists
        return remaining > 1 || otherCallable.length > 0;
      };

      // Priority 1: Void an entire suit if safe
      for (const suit of voidableSuits) {
        const cards = suitCounts[suit];
        let canVoid = true;

        // Check if we can bury all cards from this suit
        for (const card of cards) {
          if (!canBuryFromSuit(suit)) {
            canVoid = false;
            break;
          }
        }

        if (canVoid) {
          for (const card of cards) {
            if (toBury.length < 2) {
              toBury.push(card);
              buriedPerSuit[suit] = (buriedPerSuit[suit] || 0) + 1;
            }
          }
        }
        if (toBury.length >= 2) break;
      }

      // Priority 2: If not enough, add high-point non-ace fail cards (safely)
      if (toBury.length < 2) {
        const otherFail = failCards
          .filter(c => !toBury.includes(c) && c.rank !== 'A')
          .sort((a, b) => getCardPoints(b) - getCardPoints(a)); // Highest points first

        for (const card of otherFail) {
          if (toBury.length >= 2) break;
          if (canBuryFromSuit(card.suit)) {
            toBury.push(card);
            buriedPerSuit[card.suit] = (buriedPerSuit[card.suit] || 0) + 1;
          }
        }
      }

      // Priority 3: Low trump if desperate (not Q/J)
      if (toBury.length < 2) {
        const lowTrump = trumpCards
          .filter(c => c.rank !== 'Q' && c.rank !== 'J')
          .sort((a, b) => getTrumpPower(b) - getTrumpPower(a)); // Lowest trump first

        for (const card of lowTrump) {
          if (toBury.length < 2) {
            toBury.push(card);
          }
        }
      }

      // Fallback: just pick any two non-Q/J cards
      if (toBury.length < 2) {
        const remaining = hand.filter(c =>
          !toBury.includes(c) && c.rank !== 'Q' && c.rank !== 'J'
        );
        for (const card of remaining) {
          if (toBury.length < 2) {
            toBury.push(card);
          }
        }
      }

      return { type: 'bury', cards: toBury as [Card, Card] };
    }

    case 'calling': {
      const callable = getCallableSuits(player.hand);
      const callableTenSuits = getCallableTens(player.hand);

      // If can call an ace, do so
      if (callable.length > 0) {
        // BEST PRACTICE: Strategic ace calling
        // Priority 1: Call suit we're void in (80% walk rate vs 50%)
        // Priority 2: Call suit where we have the 10 (can schmear 21 points)
        // Priority 3: Call shortest suit (easier partner identification)

        const hand = player.hand;

        // Score each callable suit
        const suitScores = callable.map(suit => {
          const cardsInSuit = hand.filter(c => c.suit === suit && !isTrump(c));
          const count = cardsInSuit.length;
          const has10 = cardsInSuit.some(c => c.rank === '10');

          let score = 0;

          // Void = highest priority (unknown ace, 80% walk rate)
          if (count === 0) score += 100;

          // Having the 10 is valuable (A + 10 = 21 points if both played)
          if (has10) score += 50;

          // Prefer shorter suits (easier to get called suit led)
          score += (6 - count) * 10;

          return { suit, score };
        });

        // Sort by score descending and pick best
        suitScores.sort((a, b) => b.score - a.score);
        return { type: 'callAce', suit: suitScores[0].suit };
      }

      // If has all 3 aces and can call a 10, do so
      if (callableTenSuits.length > 0) {
        // Prefer calling a 10 over going alone - partner helps!
        // Call the suit where we have fewest other fail cards
        const hand = player.hand;
        const suitScores = callableTenSuits.map(suit => {
          // With calling a 10, we have the ace as hold card
          // Prefer suits where we have the ace and not too many other cards
          const cardsInSuit = hand.filter(c => c.suit === suit && !isTrump(c));
          const count = cardsInSuit.length; // Should be 1 (just the ace) typically
          return { suit, count };
        });
        // Prefer shortest suit
        suitScores.sort((a, b) => a.count - b.count);
        return { type: 'callTen', suit: suitScores[0].suit };
      }

      return { type: 'goAlone' };
    }

    case 'playing': {
      const legalPlays = getLegalPlays(
        player.hand,
        state.currentTrick,
        state.calledAce,
        player.isPicker,
        player.isPartner
      );

      // Strategic card selection
      const card = selectCardToPlay(
        legalPlays,
        state.currentTrick,
        player.isPicker,
        player.isPartner,
        state.calledAce,
        state.pickerPosition,
        position,
        state.dealerPosition
      );
      return { type: 'playCard', card };
    }

    default:
      return { type: 'pass' };
  }
}
