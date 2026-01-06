// ============================================
// RULES ENGINE TESTS
// These tests ensure the game logic is bulletproof
// ============================================

import { describe, it, expect } from 'vitest'
import {
  getLegalPlays,
  determineTrickWinner,
  cardBeats,
  getEffectiveSuit,
  getCallableSuits,
  isValidBury,
} from '../src/game/rules'
import { Card, Trick, isTrump, getTrumpPower } from '../src/game/types'

// Helper to create cards
const card = (rank: string, suit: string): Card => ({
  rank: rank as Card['rank'],
  suit: suit as Card['suit'],
  id: `${rank}-${suit}`,
})

describe('Trump Detection', () => {
  it('all Queens are trump', () => {
    expect(isTrump(card('Q', 'clubs'))).toBe(true)
    expect(isTrump(card('Q', 'spades'))).toBe(true)
    expect(isTrump(card('Q', 'hearts'))).toBe(true)
    expect(isTrump(card('Q', 'diamonds'))).toBe(true)
  })

  it('all Jacks are trump', () => {
    expect(isTrump(card('J', 'clubs'))).toBe(true)
    expect(isTrump(card('J', 'spades'))).toBe(true)
    expect(isTrump(card('J', 'hearts'))).toBe(true)
    expect(isTrump(card('J', 'diamonds'))).toBe(true)
  })

  it('all Diamonds are trump', () => {
    expect(isTrump(card('A', 'diamonds'))).toBe(true)
    expect(isTrump(card('10', 'diamonds'))).toBe(true)
    expect(isTrump(card('K', 'diamonds'))).toBe(true)
    expect(isTrump(card('9', 'diamonds'))).toBe(true)
    expect(isTrump(card('8', 'diamonds'))).toBe(true)
    expect(isTrump(card('7', 'diamonds'))).toBe(true)
  })

  it('fail suit cards are NOT trump', () => {
    expect(isTrump(card('A', 'clubs'))).toBe(false)
    expect(isTrump(card('10', 'spades'))).toBe(false)
    expect(isTrump(card('K', 'hearts'))).toBe(false)
    expect(isTrump(card('7', 'clubs'))).toBe(false)
  })
})

describe('Trump Ranking', () => {
  it('Queen of Clubs is highest trump', () => {
    expect(getTrumpPower(card('Q', 'clubs'))).toBe(0)
  })

  it('7 of Diamonds is lowest trump', () => {
    expect(getTrumpPower(card('7', 'diamonds'))).toBe(13)
  })

  it('Queens outrank Jacks', () => {
    expect(getTrumpPower(card('Q', 'diamonds'))).toBeLessThan(getTrumpPower(card('J', 'clubs')))
  })

  it('Jacks outrank Diamond pip cards', () => {
    expect(getTrumpPower(card('J', 'diamonds'))).toBeLessThan(getTrumpPower(card('A', 'diamonds')))
  })

  it('correct trump order within Queens', () => {
    expect(getTrumpPower(card('Q', 'clubs'))).toBeLessThan(getTrumpPower(card('Q', 'spades')))
    expect(getTrumpPower(card('Q', 'spades'))).toBeLessThan(getTrumpPower(card('Q', 'hearts')))
    expect(getTrumpPower(card('Q', 'hearts'))).toBeLessThan(getTrumpPower(card('Q', 'diamonds')))
  })

  it('correct trump order within Jacks', () => {
    expect(getTrumpPower(card('J', 'clubs'))).toBeLessThan(getTrumpPower(card('J', 'spades')))
    expect(getTrumpPower(card('J', 'spades'))).toBeLessThan(getTrumpPower(card('J', 'hearts')))
    expect(getTrumpPower(card('J', 'hearts'))).toBeLessThan(getTrumpPower(card('J', 'diamonds')))
  })
})

describe('Effective Suit', () => {
  it('trump cards have effective suit "trump"', () => {
    expect(getEffectiveSuit(card('Q', 'clubs'))).toBe('trump')
    expect(getEffectiveSuit(card('J', 'hearts'))).toBe('trump')
    expect(getEffectiveSuit(card('A', 'diamonds'))).toBe('trump')
  })

  it('fail cards keep their suit', () => {
    expect(getEffectiveSuit(card('A', 'clubs'))).toBe('clubs')
    expect(getEffectiveSuit(card('10', 'spades'))).toBe('spades')
    expect(getEffectiveSuit(card('K', 'hearts'))).toBe('hearts')
  })
})

describe('Card Beats', () => {
  it('trump beats non-trump', () => {
    expect(cardBeats(card('7', 'diamonds'), card('A', 'clubs'), 'clubs')).toBe(true)
    expect(cardBeats(card('Q', 'clubs'), card('A', 'hearts'), 'hearts')).toBe(true)
  })

  it('non-trump does not beat trump', () => {
    expect(cardBeats(card('A', 'clubs'), card('7', 'diamonds'), 'clubs')).toBe(false)
  })

  it('higher trump beats lower trump', () => {
    expect(cardBeats(card('Q', 'clubs'), card('Q', 'spades'), 'trump')).toBe(true)
    expect(cardBeats(card('J', 'clubs'), card('A', 'diamonds'), 'trump')).toBe(true)
  })

  it('lower trump does not beat higher trump', () => {
    expect(cardBeats(card('Q', 'spades'), card('Q', 'clubs'), 'trump')).toBe(false)
  })

  it('following suit beats off-suit', () => {
    expect(cardBeats(card('7', 'clubs'), card('A', 'hearts'), 'clubs')).toBe(true)
  })

  it('off-suit does not beat following suit', () => {
    expect(cardBeats(card('A', 'hearts'), card('7', 'clubs'), 'clubs')).toBe(false)
  })

  it('higher rank beats lower rank in same suit', () => {
    expect(cardBeats(card('A', 'clubs'), card('10', 'clubs'), 'clubs')).toBe(true)
    expect(cardBeats(card('10', 'clubs'), card('K', 'clubs'), 'clubs')).toBe(true)
  })
})

describe('Trick Winner', () => {
  it('highest trump wins when trump played', () => {
    const trick: Trick = {
      cards: [
        { card: card('A', 'clubs'), playedBy: 0 },
        { card: card('J', 'hearts'), playedBy: 1 },
        { card: card('Q', 'diamonds'), playedBy: 2 },
        { card: card('J', 'clubs'), playedBy: 3 },
        { card: card('10', 'clubs'), playedBy: 4 },
      ],
      leadPlayer: 0,
    }
    // Q of diamonds (power 3) beats J of clubs (power 4) - all Queens beat all Jacks
    expect(determineTrickWinner(trick)).toBe(2)
  })

  it('highest lead suit wins when no trump', () => {
    const trick: Trick = {
      cards: [
        { card: card('K', 'clubs'), playedBy: 0 },
        { card: card('A', 'clubs'), playedBy: 1 },
        { card: card('10', 'clubs'), playedBy: 2 },
        { card: card('9', 'clubs'), playedBy: 3 },
        { card: card('7', 'clubs'), playedBy: 4 },
      ],
      leadPlayer: 0,
    }
    expect(determineTrickWinner(trick)).toBe(1) // Ace of clubs
  })

  it('off-suit cards cannot win', () => {
    const trick: Trick = {
      cards: [
        { card: card('7', 'clubs'), playedBy: 0 },
        { card: card('A', 'hearts'), playedBy: 1 }, // Off-suit ace
        { card: card('8', 'clubs'), playedBy: 2 },
      ],
      leadPlayer: 0,
    }
    expect(determineTrickWinner(trick)).toBe(2) // 8 of clubs beats off-suit ace
  })
})

describe('Legal Plays - Following Suit', () => {
  it('must follow suit when able', () => {
    const hand = [
      card('A', 'clubs'),
      card('10', 'clubs'),
      card('A', 'hearts'),
      card('Q', 'spades'), // trump
    ]
    const trick: Trick = {
      cards: [{ card: card('K', 'clubs'), playedBy: 1 }],
      leadPlayer: 1,
    }
    
    const legal = getLegalPlays(hand, trick, null, false, false)
    
    // Must play clubs (A and 10 only, not Q of spades which is trump)
    expect(legal).toHaveLength(2)
    expect(legal.map(c => c.id)).toContain('A-clubs')
    expect(legal.map(c => c.id)).toContain('10-clubs')
  })

  it('must follow trump when trump led', () => {
    const hand = [
      card('A', 'clubs'),
      card('J', 'hearts'), // trump
      card('9', 'diamonds'), // trump
    ]
    const trick: Trick = {
      cards: [{ card: card('Q', 'clubs'), playedBy: 1 }], // trump led
      leadPlayer: 1,
    }
    
    const legal = getLegalPlays(hand, trick, null, false, false)
    
    // Must play trump
    expect(legal).toHaveLength(2)
    expect(legal.map(c => c.id)).toContain('J-hearts')
    expect(legal.map(c => c.id)).toContain('9-diamonds')
  })

  it('can play anything when cannot follow suit', () => {
    const hand = [
      card('A', 'hearts'),
      card('10', 'hearts'),
      card('Q', 'diamonds'), // trump
    ]
    const trick: Trick = {
      cards: [{ card: card('K', 'clubs'), playedBy: 1 }],
      leadPlayer: 1,
    }
    
    const legal = getLegalPlays(hand, trick, null, false, false)
    
    // Can play any card
    expect(legal).toHaveLength(3)
  })
})

describe('Callable Suits', () => {
  it('can call suit where picker has non-ace cards but not the ace', () => {
    const hand = [
      card('10', 'clubs'),
      card('K', 'clubs'),
      card('A', 'hearts'), // Has ace, cannot call hearts
      card('Q', 'spades'), // trump
      card('J', 'clubs'), // trump
      card('9', 'diamonds'), // trump
      card('7', 'spades'),
      card('8', 'spades'),
    ]
    
    const callable = getCallableSuits(hand)
    
    expect(callable).toContain('clubs') // Has non-ace clubs, no ace
    expect(callable).toContain('spades') // Has non-ace spades, no ace
    expect(callable).not.toContain('hearts') // Has ace, cannot call
  })

  it('cannot call suit where picker has no cards', () => {
    const hand = [
      card('A', 'clubs'),
      card('Q', 'clubs'), // trump, not clubs for this purpose
      card('Q', 'spades'), // trump
      card('J', 'clubs'), // trump
      card('A', 'diamonds'), // trump
      card('10', 'diamonds'), // trump
    ]
    
    const callable = getCallableSuits(hand)
    
    // Has no non-trump hearts or spades cards
    expect(callable).not.toContain('hearts')
    expect(callable).not.toContain('clubs') // Only has ace
  })
})

describe('Valid Bury', () => {
  it('must bury exactly 2 cards', () => {
    const hand = [card('A', 'clubs'), card('10', 'clubs'), card('K', 'hearts')]
    
    expect(isValidBury([card('A', 'clubs')], hand, null, 2).valid).toBe(false)
    expect(isValidBury([card('A', 'clubs'), card('10', 'clubs'), card('K', 'hearts')], hand, null, 2).valid).toBe(false)
    expect(isValidBury([card('A', 'clubs'), card('10', 'clubs')], hand, null, 2).valid).toBe(true)
  })

  it('must keep at least one card of called suit', () => {
    const hand = [
      card('10', 'clubs'),
      card('7', 'clubs'),
      card('A', 'hearts'),
    ]
    
    // Trying to bury both clubs when clubs is called suit
    expect(isValidBury([card('10', 'clubs'), card('7', 'clubs')], hand, 'clubs', 2).valid).toBe(false)
    
    // Burying one club is OK
    expect(isValidBury([card('10', 'clubs'), card('A', 'hearts')], hand, 'clubs', 2).valid).toBe(true)
  })
})
