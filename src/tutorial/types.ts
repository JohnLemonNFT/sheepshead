// ============================================
// TUTORIAL TYPES - Interactive learning system
// ============================================

import type { Card, Suit, Rank } from '../game/types';

export type LessonId =
  | 'cards'
  | 'following-suit'
  | 'winning-tricks'
  | 'points'
  | 'picking-burying'
  | 'calling-partner'
  | 'playing-hand';

export interface Lesson {
  id: LessonId;
  title: string;
  description: string;
  estimatedMinutes: number;
  steps: LessonStep[];
}

export type LessonStep =
  | ExplainStep
  | ShowCardsStep
  | QuizWhichWinsStep
  | QuizLegalPlaysStep
  | QuizWhoWonStep
  | QuizPointsStep
  | InteractiveStep;

export interface ExplainStep {
  type: 'explain';
  text: string;
  highlight?: 'trump' | 'fail' | 'points';
}

export interface ShowCardsStep {
  type: 'showCards';
  cards: Card[];
  groupBy?: 'suit' | 'trump-fail' | 'points';
  caption: string;
}

export interface QuizWhichWinsStep {
  type: 'quizWhichWins';
  card1: Card;
  card2: Card;
  leadSuit?: Suit | 'trump';
  correctAnswer: 1 | 2;
  explanation: string;
}

export interface QuizLegalPlaysStep {
  type: 'quizLegalPlays';
  hand: Card[];
  leadCard: Card;
  legalCardIds: string[];
  explanation: string;
}

export interface QuizWhoWonStep {
  type: 'quizWhoWon';
  trick: { card: Card; player: string }[];
  correctPlayer: string;
  explanation: string;
}

export interface QuizPointsStep {
  type: 'quizPoints';
  cards: Card[];
  correctPoints: number;
}

export interface InteractiveStep {
  type: 'interactive';
  scenario: 'pick-or-pass' | 'select-bury' | 'call-ace' | 'play-card';
  setup: any; // Scenario-specific setup
  feedback: string;
}

export interface TutorialProgress {
  completedLessons: LessonId[];
  currentLesson: LessonId | null;
  currentStep: number;
  quizScore: number;
  quizTotal: number;
}

// Helper to create cards for tutorial
export function tutorialCard(suit: Suit, rank: Rank): Card {
  return {
    id: `${suit}-${rank}`,
    suit,
    rank,
  };
}
