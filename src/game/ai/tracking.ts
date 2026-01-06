// ============================================
// AI TRACKING - Track game state from AI perspective
// ============================================

import {
  Card,
  PlayerPosition,
  Trick,
  isTrump,
  getTrumpPower,
  getCardPoints,
  TRUMP_ORDER,
  FAIL_SUITS,
  Suit,
} from '../types';

/**
 * Information the AI tracks about the game state
 */
export interface AIGameKnowledge {
  // Cards that have been played
  playedCards: Card[];

  // Cards still in play (not in AI's hand, not played)
  remainingCards: Card[];

  // Trump cards remaining (not played, not in hand)
  remainingTrump: Card[];

  // Partner probability for each player (0-1)
  partnerProbability: Map<PlayerPosition, number>;

  // Which players are void in which suits
  knownVoids: Map<PlayerPosition, Set<Suit | 'trump'>>;

  // High trump still out (for decision making)
  highTrumpOut: Card[];

  // Points played so far
  pointsPlayed: number;

  // Tricks won by picker team vs defenders
  pickerTeamTricks: number;
  defenderTricks: number;
}

/**
 * Create initial AI knowledge state
 */
export function createInitialKnowledge(
  myHand: Card[],
  myPosition: PlayerPosition,
  pickerPosition: PlayerPosition | null
): AIGameKnowledge {
  // All 32 cards
  const allCards = createAllCards();

  // Cards not in my hand are remaining
  const myCardIds = new Set(myHand.map(c => c.id));
  const remainingCards = allCards.filter(c => !myCardIds.has(c.id));

  // Remaining trump
  const remainingTrump = remainingCards.filter(c => isTrump(c));

  // High trump not in hand
  const highTrumpOut = TRUMP_ORDER.slice(0, 8)
    .map(id => allCards.find(c => c.id === id)!)
    .filter(c => !myCardIds.has(c.id));

  // Initialize partner probabilities
  const partnerProbability = new Map<PlayerPosition, number>();
  for (let i = 0; i < 5; i++) {
    if (i !== myPosition && i !== pickerPosition) {
      // Initially equal probability among non-picker, non-self players
      partnerProbability.set(i as PlayerPosition, pickerPosition !== null ? 0.33 : 0);
    }
  }

  return {
    playedCards: [],
    remainingCards,
    remainingTrump,
    partnerProbability,
    knownVoids: new Map(),
    highTrumpOut,
    pointsPlayed: 0,
    pickerTeamTricks: 0,
    defenderTricks: 0,
  };
}

/**
 * Update knowledge after a card is played
 */
export function updateKnowledgeAfterPlay(
  knowledge: AIGameKnowledge,
  card: Card,
  playedBy: PlayerPosition,
  trick: Trick,
  isPicker: boolean,
  isKnownPartner: boolean,
  calledSuit: Suit | null
): AIGameKnowledge {
  const newKnowledge = { ...knowledge };

  // Track played card
  newKnowledge.playedCards = [...knowledge.playedCards, card];
  newKnowledge.remainingCards = knowledge.remainingCards.filter(c => c.id !== card.id);
  newKnowledge.remainingTrump = knowledge.remainingTrump.filter(c => c.id !== card.id);
  newKnowledge.highTrumpOut = knowledge.highTrumpOut.filter(c => c.id !== card.id);
  newKnowledge.pointsPlayed = knowledge.pointsPlayed + getCardPoints(card);

  // Detect voids
  if (trick.cards.length > 0) {
    const leadCard = trick.cards[0].card;
    const leadSuit = isTrump(leadCard) ? 'trump' : leadCard.suit;
    const playedSuit = isTrump(card) ? 'trump' : card.suit;

    // If player didn't follow suit, they're void
    if (playedSuit !== leadSuit) {
      const voids = newKnowledge.knownVoids.get(playedBy) || new Set();
      voids.add(leadSuit);
      newKnowledge.knownVoids = new Map(newKnowledge.knownVoids);
      newKnowledge.knownVoids.set(playedBy, voids);
    }
  }

  // Update partner probability based on play patterns
  if (!isPicker && !isKnownPartner && calledSuit) {
    newKnowledge.partnerProbability = new Map(knowledge.partnerProbability);
    const currentProb = knowledge.partnerProbability.get(playedBy) || 0.33;

    // Playing called ace reveals partner
    if (card.suit === calledSuit && card.rank === 'A') {
      // This player is definitely the partner
      for (const [pos] of newKnowledge.partnerProbability) {
        newKnowledge.partnerProbability.set(pos, pos === playedBy ? 1 : 0);
      }
    }
    // Schmearing to picker increases partner probability
    else if (trick.cards.length > 0 && getCardPoints(card) >= 10) {
      const trickLeader = trick.cards[0].playedBy;
      // If schmearing when picker is winning
      if (trickLeader === (knowledge as any).pickerPosition) {
        newKnowledge.partnerProbability.set(playedBy, Math.min(1, currentProb + 0.2));
      }
    }
    // Leading called suit when NOT void decreases probability (partner avoids leading it)
    else if (trick.cards.length === 0 && card.suit === calledSuit && card.rank !== 'A') {
      newKnowledge.partnerProbability.set(playedBy, Math.max(0, currentProb - 0.15));
    }
  }

  return newKnowledge;
}

/**
 * Update knowledge after a trick is complete
 */
export function updateKnowledgeAfterTrick(
  knowledge: AIGameKnowledge,
  trick: Trick,
  winnerPosition: PlayerPosition,
  isPicker: boolean,
  isKnownPartner: boolean
): AIGameKnowledge {
  const newKnowledge = { ...knowledge };

  if (isPicker || isKnownPartner) {
    newKnowledge.pickerTeamTricks = knowledge.pickerTeamTricks + 1;
  } else {
    newKnowledge.defenderTricks = knowledge.defenderTricks + 1;
  }

  return newKnowledge;
}

/**
 * Evaluate hand strength for picking decision
 */
export function evaluateHandStrength(hand: Card[]): {
  trumpCount: number;
  trumpPower: number;
  failAces: number;
  pointsInHand: number;
  hasHighTrump: boolean;
  voidSuits: Suit[];
  strength: 'weak' | 'marginal' | 'good' | 'strong';
} {
  const trumpCards = hand.filter(c => isTrump(c));
  const trumpCount = trumpCards.length;

  // Trump power score (lower index = higher power)
  const trumpPower = trumpCards.reduce((sum, c) => {
    const power = getTrumpPower(c);
    return sum + (14 - power); // Convert to higher = better
  }, 0);

  // Fail aces
  const failAces = hand.filter(c => !isTrump(c) && c.rank === 'A').length;

  // Points in hand
  const pointsInHand = hand.reduce((sum, c) => sum + getCardPoints(c), 0);

  // Has high trump (top 4: Queens)
  const hasHighTrump = trumpCards.some(c => getTrumpPower(c) < 4);

  // Void suits
  const voidSuits: Suit[] = [];
  for (const suit of FAIL_SUITS) {
    const hasSuit = hand.some(c => c.suit === suit && !isTrump(c));
    if (!hasSuit) voidSuits.push(suit);
  }

  // Overall strength evaluation
  let strength: 'weak' | 'marginal' | 'good' | 'strong';

  // Strong: 4+ trump with queens, or 5+ trump
  if ((trumpCount >= 4 && hasHighTrump) || trumpCount >= 5) {
    strength = 'strong';
  }
  // Good: 3-4 trump with decent power
  else if (trumpCount >= 3 && trumpPower >= 20) {
    strength = 'good';
  }
  // Marginal: 3 trump or 2 with high power
  else if (trumpCount >= 3 || (trumpCount >= 2 && hasHighTrump)) {
    strength = 'marginal';
  }
  // Weak
  else {
    strength = 'weak';
  }

  return {
    trumpCount,
    trumpPower,
    failAces,
    pointsInHand,
    hasHighTrump,
    voidSuits,
    strength,
  };
}

/**
 * Count remaining trump higher than a given card
 */
export function countHigherTrumpRemaining(card: Card, knowledge: AIGameKnowledge): number {
  if (!isTrump(card)) return 0;
  const myPower = getTrumpPower(card);
  return knowledge.remainingTrump.filter(c => getTrumpPower(c) < myPower).length;
}

/**
 * Helper to create all 32 cards
 */
function createAllCards(): Card[] {
  const suits: Suit[] = ['clubs', 'spades', 'hearts', 'diamonds'];
  const ranks: Card['rank'][] = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const cards: Card[] = [];

  for (const suit of suits) {
    for (const rank of ranks) {
      cards.push({ suit, rank, id: `${rank}-${suit}` });
    }
  }

  return cards;
}
