// ============================================
// DECK UTILITIES - Creation and Shuffling
// ============================================

import { Card, Suit, Rank, getCardId } from './types';

// All suits in the game
const SUITS: Suit[] = ['clubs', 'spades', 'hearts', 'diamonds'];

// All ranks used in Sheepshead (no 2-6)
const RANKS: Rank[] = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

/**
 * Creates a fresh 32-card Sheepshead deck
 */
export function createDeck(): Card[] {
  const deck: Card[] = [];
  
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        suit,
        rank,
        id: getCardId({ suit, rank } as Card),
      });
    }
  }
  
  return deck;
}

/**
 * Fisher-Yates shuffle with seed support for provably fair shuffling
 * @param deck The deck to shuffle (will be mutated)
 * @param seed Optional seed for reproducible shuffling
 * @returns The shuffled deck and the seed used
 */
export function shuffleDeck(deck: Card[], seed?: string): { deck: Card[]; seed: string } {
  // Generate seed if not provided
  const usedSeed = seed ?? generateSeed();
  
  // Create a seeded random number generator
  const rng = createSeededRNG(usedSeed);
  
  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  
  return { deck, seed: usedSeed };
}

/**
 * Generates a random seed for shuffling
 */
export function generateSeed(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Creates a seeded pseudo-random number generator
 * Using a simple but effective mulberry32 algorithm
 */
function createSeededRNG(seed: string): () => number {
  // Convert seed string to a number
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  
  // Mulberry32 PRNG
  return function() {
    h |= 0;
    h = h + 0x6D2B79F5 | 0;
    let t = Math.imul(h ^ h >>> 15, 1 | h);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/**
 * Generates a hash of the seed for display before the hand
 * (User can verify after hand that hash matches revealed seed)
 */
export async function hashSeed(seed: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(seed);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Deal cards to players and blind
 * @param deck Shuffled deck
 * @param playerCount Number of players (3-6)
 * @returns Dealt hands and blind
 */
export function dealCards(
  deck: Card[],
  playerCount: 3 | 4 | 5 | 6
): { hands: Card[][]; blind: Card[] } {
  const hands: Card[][] = Array.from({ length: playerCount }, () => []);
  
  // Cards per player and blind size vary by player count
  const cardsPerPlayer = getCardsPerPlayer(playerCount);
  const blindSize = getBlindSize(playerCount);
  
  let cardIndex = 0;
  
  // Deal in rounds of 3 cards, with blind dealt between rounds
  // Traditional dealing: 3 to each, 2 to blind, 3 to each
  if (playerCount === 5) {
    // First round: 3 cards to each player
    for (let p = 0; p < playerCount; p++) {
      for (let c = 0; c < 3; c++) {
        hands[p].push(deck[cardIndex++]);
      }
    }
    
    // Blind: 2 cards
    const blind = [deck[cardIndex++], deck[cardIndex++]];
    
    // Second round: 3 more cards to each player
    for (let p = 0; p < playerCount; p++) {
      for (let c = 0; c < 3; c++) {
        hands[p].push(deck[cardIndex++]);
      }
    }
    
    return { hands, blind };
  }
  
  // For other player counts, simple dealing
  for (let p = 0; p < playerCount; p++) {
    for (let c = 0; c < cardsPerPlayer; c++) {
      hands[p].push(deck[cardIndex++]);
    }
  }
  
  const blind = deck.slice(cardIndex, cardIndex + blindSize);
  
  return { hands, blind };
}

/**
 * Get number of cards per player based on player count
 */
function getCardsPerPlayer(playerCount: 3 | 4 | 5 | 6): number {
  switch (playerCount) {
    case 3: return 10;
    case 4: return 7;
    case 5: return 6;
    case 6: return 5;
  }
}

/**
 * Get blind size based on player count
 */
function getBlindSize(playerCount: 3 | 4 | 5 | 6): number {
  switch (playerCount) {
    case 3: return 2;
    case 4: return 4;
    case 5: return 2;
    case 6: return 2;
  }
}

/**
 * Sort a hand for display (trump first, then fail suits)
 */
export function sortHand(hand: Card[]): Card[] {
  return [...hand].sort((a, b) => {
    const aIsTrump = a.rank === 'Q' || a.rank === 'J' || a.suit === 'diamonds';
    const bIsTrump = b.rank === 'Q' || b.rank === 'J' || b.suit === 'diamonds';
    
    // Trump before fail
    if (aIsTrump && !bIsTrump) return -1;
    if (!aIsTrump && bIsTrump) return 1;
    
    // Both trump: sort by trump power
    if (aIsTrump && bIsTrump) {
      const TRUMP_ORDER = [
        'Q-clubs', 'Q-spades', 'Q-hearts', 'Q-diamonds',
        'J-clubs', 'J-spades', 'J-hearts', 'J-diamonds',
        'A-diamonds', '10-diamonds', 'K-diamonds', '9-diamonds', '8-diamonds', '7-diamonds',
      ];
      return TRUMP_ORDER.indexOf(a.id) - TRUMP_ORDER.indexOf(b.id);
    }
    
    // Both fail: sort by suit, then rank
    const suitOrder = ['clubs', 'spades', 'hearts'];
    const suitDiff = suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit);
    if (suitDiff !== 0) return suitDiff;
    
    const rankOrder = ['A', '10', 'K', '9', '8', '7'];
    return rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank);
  });
}
