// ============================================
// SHEEPSHEAD COACHING SYSTEM
// Provides contextual tips and feedback to help players learn
// ============================================

import type {
  Card,
  Suit,
  PlayerPosition,
  GameState,
  Trick,
} from './types.js';

// Coaching tip structure
export interface CoachingTip {
  id: string;
  category: 'picking' | 'burying' | 'calling' | 'playing' | 'general';
  level: 'beginner' | 'intermediate' | 'advanced';
  title: string;
  message: string;
  explanation?: string;
}

// ============================================
// PICKING TIPS
// ============================================

export function getPickingTips(
  hand: Card[],
  position: PlayerPosition,
  dealerPosition: PlayerPosition,
  passCount: number
): CoachingTip[] {
  const tips: CoachingTip[] = [];

  const trumpCards = hand.filter(c => isTrump(c));
  const trumpCount = trumpCards.length;
  const queens = trumpCards.filter(c => c.rank === 'Q').length;
  const jacks = trumpCards.filter(c => c.rank === 'J').length;
  const hasQueenOfClubs = trumpCards.some(c => c.rank === 'Q' && c.suit === 'clubs');
  const hasBlackQueens = trumpCards.some(c => c.rank === 'Q' && c.suit === 'clubs') &&
                         trumpCards.some(c => c.rank === 'Q' && c.suit === 'spades');

  // Calculate position in pick order
  const firstPickerPos = ((dealerPosition + 1) % 5) as PlayerPosition;
  const myPickOrder = (position - firstPickerPos + 5) % 5;
  const isPosition2 = myPickOrder === 1;
  const isOnEnd = myPickOrder === 4;
  const hasLead = myPickOrder === 0;

  // Basic trump count advice
  if (trumpCount >= 5) {
    tips.push({
      id: 'pick-5-trump',
      category: 'picking',
      level: 'beginner',
      title: 'Strong Hand',
      message: `You have ${trumpCount} trump - this is a pickable hand!`,
      explanation: 'With 5+ trump, you should almost always pick. You\'ll have trump control.'
    });
  } else if (trumpCount === 4 && queens >= 2) {
    tips.push({
      id: 'pick-4-trump-2-queens',
      category: 'picking',
      level: 'beginner',
      title: 'Good Hand',
      message: 'With 4 trump including 2 Queens, consider picking.',
      explanation: 'Queens are the highest trump. Two queens gives you strong control.'
    });
  } else if (trumpCount < 3) {
    tips.push({
      id: 'weak-hand',
      category: 'picking',
      level: 'beginner',
      title: 'Weak Hand',
      message: `Only ${trumpCount} trump - you should probably pass.`,
      explanation: 'Without enough trump, you\'ll struggle to win tricks and control the game.'
    });
  }

  // Position-based advice
  if (isPosition2 && trumpCount === 4) {
    tips.push({
      id: 'position-2-warning',
      category: 'picking',
      level: 'intermediate',
      title: 'Dangerous Position',
      message: 'Position 2 is risky - 3 players can go over you!',
      explanation: 'You don\'t have the lead and three players act after you. Need a stronger hand here.'
    });
  }

  if ((hasLead || isOnEnd) && hasBlackQueens) {
    tips.push({
      id: 'black-queens-position',
      category: 'picking',
      level: 'intermediate',
      title: 'Black Queens Advantage',
      message: 'You have the "Ma\'s" (black Queens) and good position!',
      explanation: 'The Q♣ and Q♠ are the top two trump. With lead or end position, you can control the game.'
    });
  }

  // If others have passed
  if (passCount >= 3) {
    tips.push({
      id: 'late-pick-opportunity',
      category: 'picking',
      level: 'advanced',
      title: 'Others Passed',
      message: 'Multiple players passed - maybe pick with a weaker hand?',
      explanation: 'When others pass, it often means good trump is in the blind. But beware of mauers!'
    });
  }

  return tips;
}

// ============================================
// BURYING TIPS
// ============================================

export function getBuryingTips(hand: Card[]): CoachingTip[] {
  const tips: CoachingTip[] = [];

  const failCards = hand.filter(c => !isTrump(c));
  const trumpCards = hand.filter(c => isTrump(c));

  // Count suits
  const suitCounts: Record<string, number> = {};
  for (const card of failCards) {
    suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1;
  }

  // Check for voidable suits
  const voidableSuits = Object.entries(suitCounts)
    .filter(([_, count]) => count === 1 || count === 2);

  if (voidableSuits.length > 0) {
    tips.push({
      id: 'create-void',
      category: 'burying',
      level: 'intermediate',
      title: 'Create a Void',
      message: `Consider burying your ${voidableSuits[0][0]} to create a void.`,
      explanation: 'If you have no cards in a suit, you can trump when it\'s led. Voids are powerful!'
    });
  }

  // Check for 10s to bury
  const tens = failCards.filter(c => c.rank === '10');
  if (tens.length > 0) {
    tips.push({
      id: 'bury-tens',
      category: 'burying',
      level: 'beginner',
      title: 'Bury Points',
      message: 'Tens are great to bury - 10 points with no control value!',
      explanation: 'Unlike Aces, 10s don\'t win tricks. Burying them adds to your score safely.'
    });
  }

  // Warn about aces
  const aces = failCards.filter(c => c.rank === 'A');
  if (aces.length > 0) {
    tips.push({
      id: 'keep-aces',
      category: 'burying',
      level: 'beginner',
      title: 'Keep Your Aces',
      message: 'Aces are control cards - they win tricks! Don\'t bury them.',
      explanation: 'Even though Aces are worth 11 points, they\'re the highest fail cards and win tricks.'
    });
  }

  return tips;
}

// ============================================
// CALLING TIPS
// ============================================

export function getCallingTips(hand: Card[], callableSuits: Suit[]): CoachingTip[] {
  const tips: CoachingTip[] = [];

  const failCards = hand.filter(c => !isTrump(c));

  for (const suit of callableSuits) {
    const cardsInSuit = failCards.filter(c => c.suit === suit);
    const count = cardsInSuit.length;
    const has10 = cardsInSuit.some(c => c.rank === '10');

    if (count === 0) {
      tips.push({
        id: `call-void-${suit}`,
        category: 'calling',
        level: 'advanced',
        title: 'Unknown Ace',
        message: `Call ${suit} - you\'re void! 80% chance the ace "walks".`,
        explanation: 'When you have no cards in the called suit, the ace is much more likely to win.'
      });
    } else if (has10) {
      tips.push({
        id: `call-with-10-${suit}`,
        category: 'calling',
        level: 'intermediate',
        title: 'Ten Combo',
        message: `Call ${suit} - you have the 10! Partner plays Ace (11) + your 10 = 21 points.`,
        explanation: 'Having the 10 of the called suit lets you schmear big points when partner takes it.'
      });
    }
  }

  if (callableSuits.length === 0) {
    tips.push({
      id: 'must-go-alone',
      category: 'calling',
      level: 'beginner',
      title: 'Going Alone',
      message: 'You have all three fail Aces - you must go alone!',
      explanation: 'You can\'t call an ace you already have. Your hand is so strong you don\'t need a partner.'
    });
  }

  return tips;
}

// ============================================
// PLAYING TIPS
// ============================================

export function getPlayingTips(
  hand: Card[],
  trick: Trick,
  isPicker: boolean,
  isPartner: boolean,
  calledAce: { suit: Suit; revealed: boolean } | null,
  pickerPosition: PlayerPosition | null
): CoachingTip[] {
  const tips: CoachingTip[] = [];

  const trumpInHand = hand.filter(c => isTrump(c));
  const failInHand = hand.filter(c => !isTrump(c));
  const isLeading = trick.cards.length === 0;

  // PICKER TIPS
  if (isPicker) {
    if (isLeading && trumpInHand.length > 0) {
      const hasQueenOfClubs = trumpInHand.some(c => c.rank === 'Q' && c.suit === 'clubs');
      if (hasQueenOfClubs) {
        tips.push({
          id: 'lead-queen-clubs',
          category: 'playing',
          level: 'beginner',
          title: 'Lead Q♣',
          message: 'Lead the Queen of Clubs! It\'s guaranteed to win and bleeds 5 trump.',
          explanation: 'The Q♣ is the highest trump. Leading it establishes control immediately.'
        });
      } else {
        tips.push({
          id: 'picker-lead-trump',
          category: 'playing',
          level: 'beginner',
          title: 'Lead Trump',
          message: 'As picker, lead trump to pull out opponents\' trump.',
          explanation: 'You likely have the most trump. Each trump lead costs them more than you.'
        });
      }
    }
  }

  // PARTNER TIPS
  if (isPartner && !calledAce?.revealed) {
    tips.push({
      id: 'stay-hidden',
      category: 'playing',
      level: 'intermediate',
      title: 'Stay Hidden',
      message: 'Try to stay hidden! Don\'t reveal yourself as partner too early.',
      explanation: 'Defenders don\'t know who you are. Use this to your advantage.'
    });
  }

  // DEFENDER TIPS
  if (!isPicker && !isPartner) {
    if (isLeading && calledAce && !calledAce.revealed) {
      const calledSuitCards = failInHand.filter(c => c.suit === calledAce.suit);
      if (calledSuitCards.length > 0) {
        tips.push({
          id: 'lead-called-suit',
          category: 'playing',
          level: 'intermediate',
          title: 'Lead Called Suit',
          message: `Lead ${calledAce.suit} to flush out the partner!`,
          explanation: 'Partner must play the called ace when the suit is led. This reveals them.'
        });
      }
    }

    if (!isLeading) {
      tips.push({
        id: 'defender-schmear',
        category: 'playing',
        level: 'beginner',
        title: 'Schmear Wisely',
        message: 'If a defender is winning, schmear points to them!',
        explanation: 'When in doubt, schmear - it\'s correct about 60% of the time.'
      });
    }
  }

  // GENERAL FOLLOWING TIPS
  if (!isLeading) {
    const leadCard = trick.cards[0].card;
    const leadIsTrump = isTrump(leadCard);

    if (leadIsTrump && trumpInHand.length > 0 && trick.cards.length <= 2) {
      tips.push({
        id: 'save-high-trump',
        category: 'playing',
        level: 'intermediate',
        title: 'Save High Trump',
        message: '2nd/3rd player should play LOW trump - don\'t waste your best!',
        explanation: 'Playing low lets teammates behind you go over if needed.'
      });
    }
  }

  return tips;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function isTrump(card: Card): boolean {
  return card.rank === 'Q' || card.rank === 'J' || card.suit === 'diamonds';
}

// ============================================
// COACHING MESSAGES FOR UI
// ============================================

export const COACHING_MESSAGES = {
  // Beginner fundamentals
  TRUMP_ORDER: 'Trump order: Q♣ > Q♠ > Q♥ > Q♦ > J♣ > J♠ > J♥ > J♦ > A♦ > 10♦ > K♦ > 9♦ > 8♦ > 7♦',
  FAIL_ORDER: 'Fail suits rank: A > 10 > K > 9 > 8 > 7 (note: 10 beats King!)',
  POINT_VALUES: 'Points: A=11, 10=10, K=4, Q=3, J=2. Need 61 to win.',
  FOLLOW_SUIT: 'You must follow the suit led if you can. Trump is a suit!',

  // Key statistics
  PICKER_WINS: 'The picker wins about 70% of the time.',
  ACE_WALKS_PICKER: 'If picker leads trump, called ace has 80% chance of walking.',
  ACE_WALKS_DEFENSE: 'If defense leads, called ace only walks 50% of the time.',
  SCHMEAR_CORRECT: 'When in doubt, schmear - it\'s correct ~60% of the time.',

  // Strategic reminders
  QUEENS_AND_JACKS: 'All Queens and Jacks are always trump, regardless of suit!',
  DIAMOND_ACE_TRUMP: 'The Ace of Diamonds is trump, not a fail card!',
  HOLD_CARD: 'You must keep at least one card of the called suit (your hold card).',
  PARTNER_MUST_PLAY: 'Partner MUST play the called ace when that suit is led.',
};

// ============================================
// POST-HAND ANALYSIS
// ============================================

export interface HandAnalysis {
  summary: string;
  tips: CoachingTip[];
  keyMoments: string[];
}

export function analyzeHand(
  state: GameState,
  playerPosition: PlayerPosition,
  playerTricks: Card[][],
  finalScore: number
): HandAnalysis {
  const tips: CoachingTip[] = [];
  const keyMoments: string[] = [];

  const player = state.players[playerPosition];
  const wasOnPickerTeam = player.isPicker || player.isPartner;
  const won = wasOnPickerTeam ? finalScore >= 61 : finalScore < 61;

  // Analyze result
  let summary = '';
  if (player.isPicker) {
    summary = won
      ? `Great job! You picked and won with ${finalScore} points.`
      : `You picked but only got ${finalScore} points. Need 61 to win.`;
  } else if (player.isPartner) {
    summary = won
      ? `Your team won! You helped the picker get ${finalScore} points.`
      : `Your team lost with ${finalScore} points. The defense stopped you.`;
  } else {
    summary = won
      ? `Defense wins! The picker only got ${finalScore} points.`
      : `The picker's team won with ${finalScore} points.`;
  }

  // Add schneider/schwarz notes
  if (won && finalScore < 31) {
    keyMoments.push('Schneider! Losers got less than 31 points (double penalty).');
  }
  if (won && playerTricks.length === 0) {
    keyMoments.push('Schwarz! Losers took no tricks (triple penalty).');
  }

  return { summary, tips, keyMoments };
}
