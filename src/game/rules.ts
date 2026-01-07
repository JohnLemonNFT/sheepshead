// ============================================
// RULES ENGINE - Legal Moves & Trick Resolution
// THIS IS THE MOST CRITICAL FILE - MUST BE PERFECT
// ============================================

import {
  Card,
  Suit,
  Trick,
  GameState,
  CalledAce,
  isTrump,
  getTrumpPower,
  getFailPower,
  getCardId,
  FAIL_SUITS,
} from './types';

// ============================================
// LEGAL MOVE DETERMINATION
// ============================================

/**
 * Get all legal cards that can be played from a hand
 * THIS FUNCTION MUST BE BULLETPROOF
 */
export function getLegalPlays(
  hand: Card[],
  currentTrick: Trick,
  calledAce: CalledAce | null,
  isPicker: boolean,
  isPartner: boolean
): Card[] {
  // If leading (no cards played yet), any card is legal
  // EXCEPT: picker must keep hold card, partner must keep called ace until led
  if (currentTrick.cards.length === 0) {
    return getLeadOptions(hand, calledAce, isPicker, isPartner);
  }
  
  // Following: must follow suit if possible
  const leadCard = currentTrick.cards[0].card;
  const leadSuit = getEffectiveSuit(leadCard);
  
  // Get cards that can follow suit
  const followCards = hand.filter(card => getEffectiveSuit(card) === leadSuit);
  
  // Special rule: if called suit is led, whoever has the called ace MUST play it
  // This forces the partner to reveal themselves
  if (calledAce && !calledAce.revealed && leadSuit !== 'trump') {
    const calledSuit = calledAce.suit;
    if (leadCard.suit === calledSuit && !isTrump(leadCard)) {
      // Find the called ace in hand
      const calledAceCard = hand.find(c => c.suit === calledSuit && c.rank === 'A');
      if (calledAceCard) {
        // Player with the called ace MUST play it when called suit is led
        return [calledAceCard];
      }
    }
  }
  
  // If can follow suit, must follow
  if (followCards.length > 0) {
    return followCards;
  }
  
  // Cannot follow suit - can play any card
  // EXCEPT: picker must keep hold card until called suit is led
  return getOffSuitOptions(hand, calledAce, isPicker);
}

/**
 * Get legal lead options
 */
function getLeadOptions(
  hand: Card[],
  calledAce: CalledAce | null,
  isPicker: boolean,
  isPartner: boolean
): Card[] {
  // Partner cannot lead the called ace until called suit has been led by someone else
  // (This is a common house rule - partner holds the ace)
  // Actually, partner CAN lead any card including the ace suit
  // But they must play the ACE when that suit is led by others
  
  // Picker must keep at least one card of the called suit (hold card)
  // But can lead any card including other cards of that suit
  
  // For MVP: all cards are legal to lead
  return [...hand];
}

/**
 * Get legal options when cannot follow suit
 */
function getOffSuitOptions(
  hand: Card[],
  calledAce: CalledAce | null,
  isPicker: boolean
): Card[] {
  // Can play any card when off-suit
  // No restrictions in standard rules
  return [...hand];
}

/**
 * Get the effective suit of a card (accounting for trump)
 * All Queens, Jacks, and Diamonds are "trump" suit
 */
export function getEffectiveSuit(card: Card): Suit | 'trump' {
  if (isTrump(card)) {
    return 'trump';
  }
  return card.suit;
}

/**
 * Check if a specific card is legal to play
 */
export function isLegalPlay(
  card: Card,
  hand: Card[],
  currentTrick: Trick,
  calledAce: CalledAce | null,
  isPicker: boolean,
  isPartner: boolean
): boolean {
  const legalPlays = getLegalPlays(hand, currentTrick, calledAce, isPicker, isPartner);
  return legalPlays.some(c => c.id === card.id);
}

// ============================================
// TRICK RESOLUTION
// ============================================

/**
 * Determine the winner of a completed trick
 * Returns the position of the winning player
 */
export function determineTrickWinner(trick: Trick): number {
  if (trick.cards.length === 0) {
    throw new Error('Cannot determine winner of empty trick');
  }
  
  const leadCard = trick.cards[0].card;
  const leadSuit = getEffectiveSuit(leadCard);
  
  let winningIndex = 0;
  let winningCard = leadCard;
  
  for (let i = 1; i < trick.cards.length; i++) {
    const card = trick.cards[i].card;
    
    if (cardBeats(card, winningCard, leadSuit)) {
      winningIndex = i;
      winningCard = card;
    }
  }
  
  return trick.cards[winningIndex].playedBy;
}

/**
 * Determine if card A beats card B given the lead suit
 */
export function cardBeats(cardA: Card, cardB: Card, leadSuit: Suit | 'trump'): boolean {
  const aIsTrump = isTrump(cardA);
  const bIsTrump = isTrump(cardB);
  const aSuit = getEffectiveSuit(cardA);
  const bSuit = getEffectiveSuit(cardB);
  
  // Trump beats non-trump
  if (aIsTrump && !bIsTrump) {
    return true;
  }
  if (!aIsTrump && bIsTrump) {
    return false;
  }
  
  // Both trump: higher trump wins
  if (aIsTrump && bIsTrump) {
    // Lower index = higher power
    return getTrumpPower(cardA) < getTrumpPower(cardB);
  }
  
  // Neither is trump
  // Card must match lead suit to have a chance to win
  if (aSuit !== leadSuit && bSuit === leadSuit) {
    return false; // A is off-suit, B follows lead
  }
  if (aSuit === leadSuit && bSuit !== leadSuit) {
    return true; // A follows lead, B is off-suit
  }
  if (aSuit !== leadSuit && bSuit !== leadSuit) {
    return false; // Both off-suit, current winner stands
  }
  
  // Both follow lead suit: higher rank wins
  return getFailPower(cardA) < getFailPower(cardB);
}

// ============================================
// PICKING RULES
// ============================================

/**
 * Check if a player can pick (is it their turn to decide?)
 */
export function canPick(state: GameState, playerPosition: number): boolean {
  if (state.phase !== 'picking') return false;
  if (state.pickerPosition !== null) return false; // Someone already picked
  
  // Players decide in order starting left of dealer
  const expectedDecider = (state.dealerPosition + 1 + state.passCount) % state.config.playerCount;
  return playerPosition === expectedDecider;
}

/**
 * Check if all players have passed
 */
export function allPlayersPassed(state: GameState): boolean {
  return state.passCount >= state.config.playerCount;
}

// ============================================
// CALLED ACE RULES
// ============================================

/**
 * Get valid suits that can be called for partner
 * Picker must have at least one card of the suit (not the ace itself)
 */
export function getCallableSuits(pickerHand: Card[]): Suit[] {
  const validSuits: Suit[] = [];
  
  for (const suit of FAIL_SUITS) {
    // Check if picker has any non-ace card of this suit
    const hasNonAce = pickerHand.some(
      c => c.suit === suit && c.rank !== 'A' && !isTrump(c)
    );
    // Check if picker does NOT have the ace (can't call own ace)
    const hasAce = pickerHand.some(
      c => c.suit === suit && c.rank === 'A'
    );
    
    if (hasNonAce && !hasAce) {
      validSuits.push(suit);
    }
  }
  
  return validSuits;
}

/**
 * Check if picker can go alone (has all fail aces or very strong hand)
 */
export function canGoAlone(pickerHand: Card[]): boolean {
  // Picker can always choose to go alone
  // But typically does when holding all fail aces or extremely strong trump
  return true;
}

/**
 * Check if picker MUST go alone (has all three fail aces)
 */
export function mustGoAlone(pickerHand: Card[]): boolean {
  const hasAllAces = FAIL_SUITS.every(suit =>
    pickerHand.some(c => c.suit === suit && c.rank === 'A')
  );
  return hasAllAces;
}

// ============================================
// BURYING RULES
// ============================================

/**
 * Get valid cards that can be buried
 * Generally can bury anything except:
 * - Cannot bury all cards of called suit (must keep hold card)
 * - Some variants disallow burying trump
 */
export function getValidBuryCards(
  hand: Card[],
  calledSuit: Suit | null
): Card[] {
  // For MVP: can bury any card
  // Just need to ensure at least one card of called suit remains
  return [...hand];
}

/**
 * Validate a bury selection
 */
export function isValidBury(
  selectedCards: Card[],
  hand: Card[],
  calledSuit: Suit | null,
  requiredCount: number
): { valid: boolean; reason?: string } {
  if (selectedCards.length !== requiredCount) {
    return { valid: false, reason: `Must bury exactly ${requiredCount} cards` };
  }
  
  // Check all selected cards are in hand
  for (const card of selectedCards) {
    if (!hand.some(c => c.id === card.id)) {
      return { valid: false, reason: 'Selected card not in hand' };
    }
  }
  
  // If called ace variant, must keep at least one card of called suit
  if (calledSuit) {
    const calledSuitCards = hand.filter(
      c => c.suit === calledSuit && !isTrump(c)
    );
    const buryingCalledSuit = selectedCards.filter(
      c => c.suit === calledSuit && !isTrump(c)
    );
    
    if (buryingCalledSuit.length >= calledSuitCards.length) {
      return { 
        valid: false, 
        reason: `Must keep at least one ${calledSuit} as hold card` 
      };
    }
  }
  
  return { valid: true };
}

// ============================================
// GAME STATE VALIDATION
// ============================================

/**
 * Validate entire game state for consistency
 * Used for debugging and testing
 */
export function validateGameState(state: GameState): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check total cards = 32
  const allCards = [
    ...state.deck,
    ...state.blind,
    ...state.buried,
    ...state.players.flatMap(p => p.hand),
    ...state.currentTrick.cards.map(c => c.card),
    ...state.completedTricks.flatMap(t => t.cards.map(c => c.card)),
  ];
  
  if (allCards.length !== 32) {
    errors.push(`Total cards is ${allCards.length}, expected 32`);
  }
  
  // Check for duplicate cards
  const cardIds = allCards.map(c => c.id);
  const uniqueIds = new Set(cardIds);
  if (uniqueIds.size !== cardIds.length) {
    errors.push('Duplicate cards detected');
  }
  
  // Check player count matches config
  if (state.players.length !== state.config.playerCount) {
    errors.push(`Player count ${state.players.length} doesn't match config ${state.config.playerCount}`);
  }
  
  return { valid: errors.length === 0, errors };
}
