// ============================================
// TUTORIAL VALIDATION SCRIPT
// Run with: npx tsx src/tutorial/test-tutorials.ts
// ============================================

import { ALL_LESSONS, getLesson } from './lessons';
import type { Lesson, LessonStep, QuizWhichWinsStep, QuizLegalPlaysStep, QuizWhoWonStep } from './types';
import { isTrump, getTrumpPower, getCardPoints } from '../game/types';
import type { Card } from '../game/types';

let errors: string[] = [];
let warnings: string[] = [];

function log(msg: string) {
  console.log(msg);
}

function error(msg: string) {
  errors.push(msg);
  console.log(`  ❌ ERROR: ${msg}`);
}

function warn(msg: string) {
  warnings.push(msg);
  console.log(`  ⚠️ WARNING: ${msg}`);
}

function success(msg: string) {
  console.log(`  ✅ ${msg}`);
}

// Validate which card wins
function validateWhichWins(step: QuizWhichWinsStep, lessonId: string, stepIndex: number): void {
  const { card1, card2, correctAnswer, leadSuit } = step;

  // Determine actual winner
  const card1IsTrump = isTrump(card1);
  const card2IsTrump = isTrump(card2);

  let actualWinner: 1 | 2;

  if (card1IsTrump && !card2IsTrump) {
    actualWinner = 1;
  } else if (!card1IsTrump && card2IsTrump) {
    actualWinner = 2;
  } else if (card1IsTrump && card2IsTrump) {
    // Both trump - compare power (lower = higher rank)
    actualWinner = getTrumpPower(card1) < getTrumpPower(card2) ? 1 : 2;
  } else {
    // Neither trump - need lead suit context
    // Assume card1 is leading if no leadSuit specified
    const lead = leadSuit || card1.suit;
    if (card1.suit === lead && card2.suit !== lead) {
      actualWinner = 1;
    } else if (card2.suit === lead && card1.suit !== lead) {
      actualWinner = 2;
    } else if (card1.suit === lead && card2.suit === lead) {
      // Same suit - compare by fail order
      const rankOrder = ['A', '10', 'K', '9', '8', '7'];
      actualWinner = rankOrder.indexOf(card1.rank) < rankOrder.indexOf(card2.rank) ? 1 : 2;
    } else {
      // Neither follows - first card wins by default
      actualWinner = 1;
    }
  }

  if (actualWinner !== correctAnswer) {
    error(`Lesson ${lessonId} step ${stepIndex}: Quiz answer is wrong! Expected ${actualWinner}, got ${correctAnswer}. Cards: ${card1.rank}${card1.suit} vs ${card2.rank}${card2.suit}`);
  } else {
    success(`Quiz "which wins" validated: ${card1.rank}${card1.suit} vs ${card2.rank}${card2.suit} → Card ${correctAnswer} wins`);
  }
}

// Validate legal plays quiz
function validateLegalPlays(step: QuizLegalPlaysStep, lessonId: string, stepIndex: number): void {
  const { hand, leadCard, legalCardIds } = step;

  const leadIsTrump = isTrump(leadCard);

  // Calculate actual legal plays
  let actualLegal: Card[];

  if (leadIsTrump) {
    // Must play trump if you have any
    const trumpInHand = hand.filter(c => isTrump(c));
    actualLegal = trumpInHand.length > 0 ? trumpInHand : hand;
  } else {
    // Must follow lead suit (excluding Q/J which are trump)
    const followCards = hand.filter(c => c.suit === leadCard.suit && !isTrump(c));
    actualLegal = followCards.length > 0 ? followCards : hand;
  }

  const actualLegalIds = actualLegal.map(c => c.id).sort();
  const expectedLegalIds = [...legalCardIds].sort();

  const match = actualLegalIds.length === expectedLegalIds.length &&
                actualLegalIds.every((id, i) => id === expectedLegalIds[i]);

  if (!match) {
    error(`Lesson ${lessonId} step ${stepIndex}: Legal plays mismatch! Expected [${expectedLegalIds.join(', ')}], calculated [${actualLegalIds.join(', ')}]`);
  } else {
    success(`Quiz "legal plays" validated: Lead ${leadCard.rank}${leadCard.suit} → ${legalCardIds.length} legal cards`);
  }
}

// Validate who won quiz
function validateWhoWon(step: QuizWhoWonStep, lessonId: string, stepIndex: number): void {
  const { trick, correctPlayer } = step;

  // Determine lead suit
  const leadCard = trick[0].card;
  const leadIsTrump = isTrump(leadCard);
  const leadSuit = leadIsTrump ? 'trump' : leadCard.suit;

  // Find winner
  let winner = trick[0];
  let winnerIsTrump = isTrump(winner.card);

  for (let i = 1; i < trick.length; i++) {
    const play = trick[i];
    const playIsTrump = isTrump(play.card);

    // Trump beats non-trump
    if (playIsTrump && !winnerIsTrump) {
      winner = play;
      winnerIsTrump = true;
      continue;
    }

    // Non-trump can't beat trump
    if (!playIsTrump && winnerIsTrump) {
      continue;
    }

    // Both trump - compare power
    if (playIsTrump && winnerIsTrump) {
      if (getTrumpPower(play.card) < getTrumpPower(winner.card)) {
        winner = play;
      }
      continue;
    }

    // Neither trump - must follow lead suit to win
    if (play.card.suit === leadSuit && winner.card.suit === leadSuit) {
      const rankOrder = ['A', '10', 'K', '9', '8', '7'];
      if (rankOrder.indexOf(play.card.rank) < rankOrder.indexOf(winner.card.rank)) {
        winner = play;
      }
    } else if (play.card.suit === leadSuit && winner.card.suit !== leadSuit) {
      winner = play;
    }
    // Off-suit non-trump can never win
  }

  if (winner.player !== correctPlayer) {
    error(`Lesson ${lessonId} step ${stepIndex}: Who won answer is wrong! Expected "${correctPlayer}", calculated "${winner.player}"`);
  } else {
    success(`Quiz "who won" validated: ${correctPlayer} wins the trick`);
  }
}

// Validate points quiz
function validatePoints(step: { cards: Card[]; correctPoints: number }, lessonId: string, stepIndex: number): void {
  const actualPoints = step.cards.reduce((sum, c) => sum + getCardPoints(c), 0);

  if (actualPoints !== step.correctPoints) {
    error(`Lesson ${lessonId} step ${stepIndex}: Points answer is wrong! Expected ${step.correctPoints}, calculated ${actualPoints}`);
  } else {
    success(`Quiz "points" validated: ${step.correctPoints} points`);
  }
}

// Validate a single lesson
function validateLesson(lesson: Lesson): void {
  log(`\n📚 Lesson: ${lesson.title} (${lesson.id})`);
  log(`   ${lesson.steps.length} steps, ~${lesson.estimatedMinutes} min`);

  if (lesson.steps.length === 0) {
    error(`Lesson ${lesson.id} has no steps!`);
    return;
  }

  let quizCount = 0;
  let explainCount = 0;

  lesson.steps.forEach((step, i) => {
    switch (step.type) {
      case 'explain':
        explainCount++;
        if (!step.text || step.text.trim().length === 0) {
          error(`Lesson ${lesson.id} step ${i}: Empty explanation text`);
        }
        break;

      case 'showCards':
        if (!step.cards || step.cards.length === 0) {
          error(`Lesson ${lesson.id} step ${i}: No cards to show`);
        }
        break;

      case 'quizWhichWins':
        quizCount++;
        validateWhichWins(step, lesson.id, i);
        break;

      case 'quizLegalPlays':
        quizCount++;
        validateLegalPlays(step, lesson.id, i);
        break;

      case 'quizWhoWon':
        quizCount++;
        validateWhoWon(step, lesson.id, i);
        break;

      case 'quizPoints':
        quizCount++;
        validatePoints(step, lesson.id, i);
        break;
    }
  });

  log(`   ${explainCount} explanations, ${quizCount} quizzes`);

  if (quizCount === 0 && lesson.id !== 'picking-burying' && lesson.id !== 'calling-partner') {
    warn(`Lesson ${lesson.id} has no quizzes - consider adding interactive elements`);
  }
}

// Main
console.log('==========================================');
console.log('SHEEPSHEAD TUTORIAL VALIDATION');
console.log('==========================================');

console.log(`\nFound ${ALL_LESSONS.length} lessons to validate\n`);

for (const lesson of ALL_LESSONS) {
  validateLesson(lesson);
}

console.log('\n==========================================');
console.log('SUMMARY');
console.log('==========================================');

if (errors.length === 0 && warnings.length === 0) {
  console.log('\n✅ ALL TUTORIALS VALIDATED SUCCESSFULLY!\n');
} else {
  if (errors.length > 0) {
    console.log(`\n❌ ${errors.length} ERRORS found:`);
    errors.forEach(e => console.log(`   - ${e}`));
  }
  if (warnings.length > 0) {
    console.log(`\n⚠️ ${warnings.length} WARNINGS:`);
    warnings.forEach(w => console.log(`   - ${w}`));
  }
  console.log('');
}

// Exit with error code if there were errors
if (errors.length > 0) {
  process.exit(1);
}
