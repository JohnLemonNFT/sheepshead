// ============================================
// TUTORIAL LESSONS - Content for each lesson
// ============================================

import type { Lesson, LessonStep, LessonId } from './types';
import { tutorialCard } from './types';

// ============================================
// LESSON 1: THE CARDS
// ============================================

export const lesson1Cards: Lesson = {
  id: 'cards',
  title: 'The Cards',
  description: 'Learn the 32-card deck and which cards are trump',
  estimatedMinutes: 3,
  steps: [
    {
      type: 'explain',
      text: 'Sheepshead uses 32 cards - the 7 through Ace in each suit. Let\'s look at them all.',
    },
    {
      type: 'showCards',
      cards: [
        // All 32 cards organized by suit
        tutorialCard('clubs', 'A'), tutorialCard('clubs', '10'), tutorialCard('clubs', 'K'),
        tutorialCard('clubs', '9'), tutorialCard('clubs', '8'), tutorialCard('clubs', '7'),
        tutorialCard('spades', 'A'), tutorialCard('spades', '10'), tutorialCard('spades', 'K'),
        tutorialCard('spades', '9'), tutorialCard('spades', '8'), tutorialCard('spades', '7'),
        tutorialCard('hearts', 'A'), tutorialCard('hearts', '10'), tutorialCard('hearts', 'K'),
        tutorialCard('hearts', '9'), tutorialCard('hearts', '8'), tutorialCard('hearts', '7'),
        tutorialCard('diamonds', 'A'), tutorialCard('diamonds', '10'), tutorialCard('diamonds', 'K'),
        tutorialCard('diamonds', '9'), tutorialCard('diamonds', '8'), tutorialCard('diamonds', '7'),
        tutorialCard('clubs', 'Q'), tutorialCard('spades', 'Q'), tutorialCard('hearts', 'Q'), tutorialCard('diamonds', 'Q'),
        tutorialCard('clubs', 'J'), tutorialCard('spades', 'J'), tutorialCard('hearts', 'J'), tutorialCard('diamonds', 'J'),
      ],
      groupBy: 'suit',
      caption: 'All 32 cards in a Sheepshead deck',
    },
    {
      type: 'explain',
      text: 'Now here\'s the key: 14 of these cards are TRUMP. Trump cards beat all non-trump cards.',
      highlight: 'trump',
    },
    {
      type: 'showCards',
      cards: [
        // Trump cards in order
        tutorialCard('clubs', 'Q'), tutorialCard('spades', 'Q'), tutorialCard('hearts', 'Q'), tutorialCard('diamonds', 'Q'),
        tutorialCard('clubs', 'J'), tutorialCard('spades', 'J'), tutorialCard('hearts', 'J'), tutorialCard('diamonds', 'J'),
        tutorialCard('diamonds', 'A'), tutorialCard('diamonds', '10'), tutorialCard('diamonds', 'K'),
        tutorialCard('diamonds', '9'), tutorialCard('diamonds', '8'), tutorialCard('diamonds', '7'),
      ],
      groupBy: 'trump-fail',
      caption: 'The 14 trump cards: All Queens, all Jacks, and all Diamonds (in order from highest to lowest)',
    },
    {
      type: 'explain',
      text: 'Important: Queens and Jacks are ALWAYS trump, even though they show clubs, spades, or hearts. The suit symbol doesn\'t matter for Q and J - they\'re trump.',
    },
    {
      type: 'explain',
      text: 'The other 18 cards are called "fail" suits. Clubs, spades, and hearts each have 6 fail cards: A, 10, K, 9, 8, 7.',
      highlight: 'fail',
    },
    // Quiz: Which card wins?
    {
      type: 'quizWhichWins',
      card1: tutorialCard('clubs', 'Q'),
      card2: tutorialCard('spades', 'A'),
      correctAnswer: 1,
      explanation: 'The Queen of Clubs is trump. The Ace of Spades is just a fail card. Trump always wins!',
    },
    {
      type: 'quizWhichWins',
      card1: tutorialCard('hearts', 'J'),
      card2: tutorialCard('diamonds', 'K'),
      correctAnswer: 1,
      explanation: 'The Jack of Hearts is trump (all jacks are trump). The King of Diamonds is also trump, but Jacks beat all diamond number cards.',
    },
    {
      type: 'quizWhichWins',
      card1: tutorialCard('diamonds', '7'),
      card2: tutorialCard('clubs', 'A'),
      correctAnswer: 1,
      explanation: 'Even the lowly 7 of Diamonds is trump and beats the Ace of Clubs (which is just a fail card).',
    },
    {
      type: 'quizWhichWins',
      card1: tutorialCard('spades', 'Q'),
      card2: tutorialCard('clubs', 'Q'),
      correctAnswer: 2,
      explanation: 'Both are trump, but Queens go: Clubs > Spades > Hearts > Diamonds. Queen of Clubs is the highest card in the game!',
    },
    {
      type: 'quizWhichWins',
      card1: tutorialCard('hearts', 'A'),
      card2: tutorialCard('hearts', '10'),
      leadSuit: 'hearts',
      correctAnswer: 1,
      explanation: 'When no trump is played, Ace beats 10 in the same suit. Aces are highest in fail suits.',
    },
  ],
};

// ============================================
// LESSON 2: FOLLOWING SUIT
// ============================================

export const lesson2FollowingSuit: Lesson = {
  id: 'following-suit',
  title: 'Following Suit',
  description: 'Learn what cards you can legally play',
  estimatedMinutes: 3,
  steps: [
    {
      type: 'explain',
      text: 'When someone leads a card, you MUST play the same suit if you have it. This is called "following suit."',
    },
    {
      type: 'explain',
      text: 'Key rule: TRUMP IS ITS OWN SUIT. All 14 trump cards (Queens, Jacks, Diamonds) are the same suit for following purposes.',
    },
    {
      type: 'explain',
      text: 'If someone leads trump, you must play trump if you have any. If someone leads clubs, you must play clubs (but NOT the Queen or Jack of clubs - those are trump!).',
    },
    // Quiz: Which cards are legal?
    {
      type: 'quizLegalPlays',
      leadCard: tutorialCard('clubs', 'A'),
      hand: [
        tutorialCard('clubs', '10'),
        tutorialCard('clubs', 'Q'), // This is trump, not clubs!
        tutorialCard('spades', 'K'),
        tutorialCard('hearts', '9'),
        tutorialCard('diamonds', '8'),
        tutorialCard('clubs', '7'),
      ],
      legalCardIds: ['clubs-10', 'clubs-7'],
      explanation: 'Clubs was led. You have 10♣ and 7♣. The Q♣ looks like clubs but it\'s trump! You cannot play it when clubs is led.',
    },
    {
      type: 'quizLegalPlays',
      leadCard: tutorialCard('diamonds', 'A'),
      hand: [
        tutorialCard('clubs', 'Q'),
        tutorialCard('spades', 'J'),
        tutorialCard('hearts', '9'),
        tutorialCard('diamonds', '7'),
        tutorialCard('spades', 'A'),
        tutorialCard('clubs', '10'),
      ],
      legalCardIds: ['clubs-Q', 'spades-J', 'diamonds-7'],
      explanation: 'Trump was led (Ace of Diamonds is trump). You must play trump: Q♣, J♠, or 7♦ are all trump.',
    },
    {
      type: 'quizLegalPlays',
      leadCard: tutorialCard('spades', '10'),
      hand: [
        tutorialCard('clubs', 'A'),
        tutorialCard('hearts', 'K'),
        tutorialCard('diamonds', '9'),
        tutorialCard('clubs', 'J'),
        tutorialCard('hearts', '7'),
        tutorialCard('diamonds', 'Q'),
      ],
      legalCardIds: ['clubs-A', 'hearts-K', 'diamonds-9', 'clubs-J', 'hearts-7', 'diamonds-Q'],
      explanation: 'Spades was led but you have no spades! When you can\'t follow suit, you can play ANY card.',
    },
    {
      type: 'quizLegalPlays',
      leadCard: tutorialCard('hearts', 'J'),
      hand: [
        tutorialCard('hearts', 'A'),
        tutorialCard('hearts', '10'),
        tutorialCard('spades', 'Q'),
        tutorialCard('clubs', '9'),
        tutorialCard('diamonds', 'K'),
        tutorialCard('hearts', '8'),
      ],
      legalCardIds: ['spades-Q', 'diamonds-K'],
      explanation: 'Trump was led (J♥ is trump!). You must play trump. Q♠ and K♦ are your only trump cards. The hearts A, 10, 8 are fail cards - they\'re not trump just because they\'re hearts!',
    },
    {
      type: 'explain',
      text: 'Remember: Queens and Jacks are ALWAYS trump, regardless of their suit symbol. Diamonds are ALWAYS trump. Clubs, spades, and hearts A-10-K-9-8-7 are fail suits.',
    },
  ],
};

// ============================================
// LESSON 3: WINNING TRICKS
// ============================================

export const lesson3WinningTricks: Lesson = {
  id: 'winning-tricks',
  title: 'Winning Tricks',
  description: 'Learn how to determine who wins each trick',
  estimatedMinutes: 3,
  steps: [
    {
      type: 'explain',
      text: 'Each round, all 5 players play one card. This is called a "trick." Let\'s learn who wins.',
    },
    {
      type: 'explain',
      text: 'Rule 1: The HIGHEST TRUMP wins the trick, no matter what was led.',
    },
    {
      type: 'explain',
      text: 'Rule 2: If nobody played trump, the highest card OF THE SUIT THAT WAS LED wins.',
    },
    {
      type: 'explain',
      text: 'Rule 3: If you play a different fail suit (not trump, not the led suit), you CANNOT win. Your card is essentially thrown away.',
    },
    // Quiz: Who won?
    {
      type: 'quizWhoWon',
      trick: [
        { card: tutorialCard('spades', 'A'), player: 'Player 1' },
        { card: tutorialCard('spades', '10'), player: 'Player 2' },
        { card: tutorialCard('spades', 'K'), player: 'Player 3' },
        { card: tutorialCard('diamonds', '7'), player: 'Player 4' },
        { card: tutorialCard('spades', '9'), player: 'Player 5' },
      ],
      correctPlayer: 'Player 4',
      explanation: 'Player 4 played the 7♦ - the only trump! Even the lowest trump beats all fail cards.',
    },
    {
      type: 'quizWhoWon',
      trick: [
        { card: tutorialCard('clubs', 'A'), player: 'Player 1' },
        { card: tutorialCard('clubs', '10'), player: 'Player 2' },
        { card: tutorialCard('hearts', 'A'), player: 'Player 3' },
        { card: tutorialCard('clubs', '7'), player: 'Player 4' },
        { card: tutorialCard('spades', 'A'), player: 'Player 5' },
      ],
      correctPlayer: 'Player 1',
      explanation: 'No trump was played. Clubs was led, so highest clubs wins. Player 1\'s A♣ beats the 10♣ and 7♣. The other aces are different suits - they can\'t win!',
    },
    {
      type: 'quizWhoWon',
      trick: [
        { card: tutorialCard('diamonds', 'A'), player: 'Player 1' },
        { card: tutorialCard('clubs', 'Q'), player: 'Player 2' },
        { card: tutorialCard('diamonds', '10'), player: 'Player 3' },
        { card: tutorialCard('spades', 'J'), player: 'Player 4' },
        { card: tutorialCard('diamonds', '8'), player: 'Player 5' },
      ],
      correctPlayer: 'Player 2',
      explanation: 'Multiple trump were played. Q♣ is the highest trump (Queens beat Jacks, which beat diamond number cards).',
    },
    {
      type: 'quizWhoWon',
      trick: [
        { card: tutorialCard('hearts', '10'), player: 'Player 1' },
        { card: tutorialCard('hearts', 'K'), player: 'Player 2' },
        { card: tutorialCard('clubs', 'A'), player: 'Player 3' },
        { card: tutorialCard('spades', '10'), player: 'Player 4' },
        { card: tutorialCard('hearts', '9'), player: 'Player 5' },
      ],
      correctPlayer: 'Player 1',
      explanation: 'No trump played. Hearts was led. Player 1\'s 10♥ is the highest heart. Players 3 and 4 played different suits - those cards can\'t win!',
    },
  ],
};

// ============================================
// LESSON 4: POINTS
// ============================================

export const lesson4Points: Lesson = {
  id: 'points',
  title: 'Points',
  description: 'Learn how points work and what you need to win',
  estimatedMinutes: 2,
  steps: [
    {
      type: 'explain',
      text: 'Each card is worth points. The team that collects the most points wins the hand.',
    },
    {
      type: 'showCards',
      cards: [
        tutorialCard('hearts', 'A'),
        tutorialCard('spades', '10'),
        tutorialCard('clubs', 'K'),
        tutorialCard('diamonds', 'Q'),
        tutorialCard('hearts', 'J'),
        tutorialCard('clubs', '9'),
      ],
      groupBy: 'points',
      caption: 'Point values: Aces = 11, Tens = 10, Kings = 4, Queens = 3, Jacks = 2, Others = 0',
    },
    {
      type: 'explain',
      text: 'There are exactly 120 points in the deck. To win, your team needs 61 points (more than half).',
    },
    {
      type: 'explain',
      text: 'If the losing team gets less than 31 points, they got "schneidered" and lose double. If they win zero tricks, it\'s "schwarz" and even worse!',
    },
    // Quiz: How many points?
    {
      type: 'quizPoints',
      cards: [
        tutorialCard('hearts', 'A'),
        tutorialCard('spades', '10'),
        tutorialCard('clubs', 'K'),
        tutorialCard('hearts', 'J'),
        tutorialCard('spades', '9'),
      ],
      correctPoints: 27, // 11 + 10 + 4 + 2 + 0
    },
    {
      type: 'quizPoints',
      cards: [
        tutorialCard('clubs', 'Q'),
        tutorialCard('diamonds', 'Q'),
        tutorialCard('hearts', 'Q'),
        tutorialCard('spades', 'Q'),
        tutorialCard('diamonds', '7'),
      ],
      correctPoints: 12, // 3 + 3 + 3 + 3 + 0
    },
    {
      type: 'quizPoints',
      cards: [
        tutorialCard('spades', 'A'),
        tutorialCard('spades', '10'),
        tutorialCard('hearts', 'A'),
        tutorialCard('hearts', '10'),
        tutorialCard('clubs', '7'),
      ],
      correctPoints: 42, // 11 + 10 + 11 + 10 + 0
    },
    {
      type: 'quizPoints',
      cards: [
        tutorialCard('clubs', '9'),
        tutorialCard('spades', '8'),
        tutorialCard('hearts', '7'),
        tutorialCard('diamonds', '9'),
        tutorialCard('diamonds', '8'),
      ],
      correctPoints: 0,
    },
  ],
};

// ============================================
// LESSON 5: PICKING AND BURYING
// ============================================

export const lesson5PickingBurying: Lesson = {
  id: 'picking-burying',
  title: 'Picking & Burying',
  description: 'Learn how to start each hand',
  estimatedMinutes: 3,
  steps: [
    {
      type: 'explain',
      text: 'Each hand starts with 2 cards face-down in the middle called the "blind." Each player gets 6 cards.',
    },
    {
      type: 'explain',
      text: 'Going around the table, each player can "pick" (take the blind) or "pass." The first player to pick becomes the PICKER.',
    },
    {
      type: 'explain',
      text: 'The picker takes the 2 blind cards, then must "bury" 2 cards face-down. These buried cards count toward the picker\'s points at the end.',
    },
    {
      type: 'explain',
      text: 'When should you pick? You need a strong hand - usually 4+ trump with some high cards (Queens or Jacks). The blind might help, but don\'t count on it!',
    },
    {
      type: 'explain',
      text: 'What should you bury? Bury points in cards that can\'t win tricks. 10s and Kings are great to bury. NEVER bury Queens or Jacks - they\'re your best cards!',
    },
    {
      type: 'explain',
      text: 'If everyone passes, the dealer MUST pick (called a "forced pick"). Sometimes you have to make the best of a bad hand!',
    },
    {
      type: 'showCards',
      cards: [
        // Good picking hand
        tutorialCard('clubs', 'Q'),
        tutorialCard('hearts', 'Q'),
        tutorialCard('clubs', 'J'),
        tutorialCard('diamonds', 'A'),
        tutorialCard('diamonds', 'K'),
        tutorialCard('spades', '10'),
      ],
      groupBy: 'trump-fail',
      caption: 'Good picking hand: 5 trump including 2 Queens and a Jack. You should pick!',
    },
    {
      type: 'showCards',
      cards: [
        // Bad picking hand
        tutorialCard('diamonds', '9'),
        tutorialCard('diamonds', '8'),
        tutorialCard('clubs', 'A'),
        tutorialCard('spades', 'K'),
        tutorialCard('hearts', '10'),
        tutorialCard('hearts', '7'),
      ],
      groupBy: 'trump-fail',
      caption: 'Weak hand: Only 2 low trump, no Queens or Jacks. Pass unless you\'re forced!',
    },
  ],
};

// ============================================
// LESSON 6: CALLING A PARTNER
// ============================================

export const lesson6CallingPartner: Lesson = {
  id: 'calling-partner',
  title: 'Calling a Partner',
  description: 'Learn how the picker gets a teammate',
  estimatedMinutes: 2,
  steps: [
    {
      type: 'explain',
      text: 'After burying, the picker "calls" an Ace. Whoever has that Ace becomes the picker\'s secret partner!',
    },
    {
      type: 'explain',
      text: 'You can only call a fail ace (clubs, spades, or hearts) that you DON\'T have. If you have all three fail aces, you "go alone."',
    },
    {
      type: 'explain',
      text: 'The partner is SECRET until they play the called ace. Nobody knows who the partner is until that moment!',
    },
    {
      type: 'explain',
      text: 'Strategy: Call an ace in a suit where you have other cards. That way you can lead that suit later to find your partner.',
    },
    {
      type: 'explain',
      text: 'Teams: The picker + partner (2 players) vs the defenders (3 players). Even though it\'s 2 vs 3, the picker\'s team has an advantage from the blind cards.',
    },
    {
      type: 'showCards',
      cards: [
        tutorialCard('clubs', 'Q'),
        tutorialCard('spades', 'J'),
        tutorialCard('diamonds', '10'),
        tutorialCard('diamonds', '9'),
        tutorialCard('spades', 'K'),
        tutorialCard('spades', '7'),
      ],
      groupBy: 'trump-fail',
      caption: 'Example: You have spades but no spade ace. Call the Ace of Spades! You can lead the K♠ or 7♠ later to find your partner.',
    },
  ],
};

// ============================================
// ALL LESSONS
// ============================================

export const ALL_LESSONS: Lesson[] = [
  lesson1Cards,
  lesson2FollowingSuit,
  lesson3WinningTricks,
  lesson4Points,
  lesson5PickingBurying,
  lesson6CallingPartner,
];

export function getLesson(id: LessonId): Lesson | undefined {
  return ALL_LESSONS.find(l => l.id === id);
}
