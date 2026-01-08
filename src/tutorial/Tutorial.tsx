'use client';

// ============================================
// TUTORIAL COMPONENT - Interactive lesson viewer
// ============================================

import { useState } from 'react';
import { Card } from '../components/Card';
import { useTutorial } from './useTutorial';
import type {
  LessonStep,
  QuizWhichWinsStep,
  QuizLegalPlaysStep,
  QuizWhoWonStep,
  QuizPointsStep,
  ShowCardsStep,
} from './types';
import { isTrump, getCardPoints } from '../game/types';
import type { Card as CardType } from '../game/types';

// ============================================
// MAIN TUTORIAL COMPONENT
// ============================================

interface TutorialProps {
  onClose: () => void;
}

export function Tutorial({ onClose }: TutorialProps) {
  const [state, actions] = useTutorial();

  // Lesson selector view
  if (!state.isActive) {
    return (
      <LessonSelector
        lessons={actions.getAllLessons()}
        completedLessons={state.progress.completedLessons}
        onSelectLesson={actions.startLesson}
        onClose={onClose}
        onReset={actions.resetProgress}
      />
    );
  }

  // Active lesson view
  return (
    <LessonViewer
      lesson={state.currentLesson!}
      step={state.currentStep!}
      stepIndex={state.stepIndex}
      totalSteps={state.totalSteps}
      onNext={actions.nextStep}
      onPrev={actions.prevStep}
      onExit={actions.exitLesson}
      onQuizAnswer={actions.recordQuizAnswer}
      quizScore={state.progress.quizScore}
      quizTotal={state.progress.quizTotal}
    />
  );
}

// ============================================
// LESSON SELECTOR
// ============================================

interface LessonSelectorProps {
  lessons: { id: string; title: string; description: string; estimatedMinutes: number }[];
  completedLessons: string[];
  onSelectLesson: (id: any) => void;
  onClose: () => void;
  onReset: () => void;
}

function LessonSelector({ lessons, completedLessons, onSelectLesson, onClose, onReset }: LessonSelectorProps) {
  const completedCount = completedLessons.length;
  const totalCount = lessons.length;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-gray-800 rounded-xl max-w-2xl w-full p-4 sm:p-6 border border-gray-700 my-2 sm:my-4 max-h-[95vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Learn Sheepshead</h1>
            <p className="text-gray-400">
              {completedCount === 0
                ? 'New to Sheepshead? Start with Lesson 1!'
                : `Progress: ${completedCount}/${totalCount} lessons completed`}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-700">
            ×
          </button>
        </div>

        <div className="space-y-3 mb-4 sm:mb-6">
          {lessons.map((lesson, i) => {
            const isCompleted = completedLessons.includes(lesson.id);
            const isNext = i === 0 || completedLessons.includes(lessons[i - 1].id);

            return (
              <button
                key={lesson.id}
                onClick={() => onSelectLesson(lesson.id)}
                className={`
                  w-full text-left p-4 rounded-lg border transition-all
                  ${isCompleted
                    ? 'bg-green-900/30 border-green-700 hover:bg-green-900/50'
                    : isNext
                    ? 'bg-blue-900/30 border-blue-600 hover:bg-blue-900/50'
                    : 'bg-gray-700/30 border-gray-600 hover:bg-gray-700/50'}
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm">Lesson {i + 1}</span>
                      {isCompleted && <span className="text-green-400">✓</span>}
                    </div>
                    <div className="text-white font-semibold">{lesson.title}</div>
                    <div className="text-gray-400 text-sm">{lesson.description}</div>
                  </div>
                  <div className="text-gray-500 text-sm">{lesson.estimatedMinutes} min</div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={onReset}
            className="text-gray-500 hover:text-gray-300 text-sm"
          >
            Reset Progress
          </button>
          <button
            onClick={onClose}
            className="bg-green-600 hover:bg-green-500 active:bg-green-700 px-4 py-2 rounded-lg font-medium"
          >
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// LESSON VIEWER
// ============================================

interface LessonViewerProps {
  lesson: { title: string; steps: LessonStep[] };
  step: LessonStep;
  stepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onExit: () => void;
  onQuizAnswer: (correct: boolean) => void;
  quizScore: number;
  quizTotal: number;
}

function LessonViewer({
  lesson,
  step,
  stepIndex,
  totalSteps,
  onNext,
  onPrev,
  onExit,
  onQuizAnswer,
  quizScore,
  quizTotal,
}: LessonViewerProps) {
  const [quizState, setQuizState] = useState<'unanswered' | 'correct' | 'incorrect'>('unanswered');

  // Reset quiz state when step changes
  const handleNext = () => {
    setQuizState('unanswered');
    onNext();
  };

  const handleQuizAnswer = (correct: boolean) => {
    setQuizState(correct ? 'correct' : 'incorrect');
    onQuizAnswer(correct);
  };

  const progress = ((stepIndex + 1) / totalSteps) * 100;
  const isLastStep = stepIndex === totalSteps - 1;
  const canProceed = step.type === 'explain' || step.type === 'showCards' || quizState !== 'unanswered';

  return (
    <div className="fixed inset-0 bg-black/95 flex flex-col z-50">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold">{lesson.title}</h2>
            <div className="text-gray-400 text-sm">
              Step {stepIndex + 1} of {totalSteps}
              {quizTotal > 0 && ` • Quiz: ${quizScore}/${quizTotal}`}
            </div>
          </div>
          <button onClick={onExit} className="text-gray-400 hover:text-white">
            Exit Lesson
          </button>
        </div>
        {/* Progress bar */}
        <div className="max-w-3xl mx-auto mt-2">
          <div className="h-1 bg-gray-700 rounded-full">
            <div
              className="h-1 bg-blue-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-3xl mx-auto">
          <StepContent
            step={step}
            quizState={quizState}
            onQuizAnswer={handleQuizAnswer}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <div className="max-w-3xl mx-auto flex justify-between">
          <button
            onClick={() => { setQuizState('unanswered'); onPrev(); }}
            disabled={stepIndex === 0}
            className="bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2 rounded-lg"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className={`
              px-6 py-2 rounded-lg font-semibold
              ${canProceed
                ? 'bg-blue-600 hover:bg-blue-500'
                : 'bg-gray-600 opacity-50 cursor-not-allowed'}
            `}
          >
            {isLastStep ? 'Complete Lesson' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// STEP CONTENT RENDERER
// ============================================

interface StepContentProps {
  step: LessonStep;
  quizState: 'unanswered' | 'correct' | 'incorrect';
  onQuizAnswer: (correct: boolean) => void;
}

function StepContent({ step, quizState, onQuizAnswer }: StepContentProps) {
  switch (step.type) {
    case 'explain':
      return <ExplainContent step={step} />;
    case 'showCards':
      return <ShowCardsContent step={step} />;
    case 'quizWhichWins':
      return <QuizWhichWinsContent step={step} quizState={quizState} onAnswer={onQuizAnswer} />;
    case 'quizLegalPlays':
      return <QuizLegalPlaysContent step={step} quizState={quizState} onAnswer={onQuizAnswer} />;
    case 'quizWhoWon':
      return <QuizWhoWonContent step={step} quizState={quizState} onAnswer={onQuizAnswer} />;
    case 'quizPoints':
      return <QuizPointsContent step={step} quizState={quizState} onAnswer={onQuizAnswer} />;
    default:
      return <div className="text-white">Unknown step type</div>;
  }
}

// ============================================
// EXPLAIN STEP
// ============================================

function ExplainContent({ step }: { step: { text: string; highlight?: string } }) {
  return (
    <div className="bg-gray-800 rounded-xl p-8 text-center">
      <p className="text-xl text-white leading-relaxed">{step.text}</p>
    </div>
  );
}

// ============================================
// SHOW CARDS STEP
// ============================================

function ShowCardsContent({ step }: { step: ShowCardsStep }) {
  const groupCards = () => {
    if (step.groupBy === 'trump-fail') {
      const trump = step.cards.filter(c => isTrump(c));
      const fail = step.cards.filter(c => !isTrump(c));
      return [
        { label: 'Trump', cards: trump },
        { label: 'Fail', cards: fail },
      ];
    }
    if (step.groupBy === 'points') {
      return [{ label: '', cards: step.cards }];
    }
    // Default: by suit
    const clubs = step.cards.filter(c => c.suit === 'clubs');
    const spades = step.cards.filter(c => c.suit === 'spades');
    const hearts = step.cards.filter(c => c.suit === 'hearts');
    const diamonds = step.cards.filter(c => c.suit === 'diamonds');
    return [
      { label: 'Clubs', cards: clubs },
      { label: 'Spades', cards: spades },
      { label: 'Hearts', cards: hearts },
      { label: 'Diamonds', cards: diamonds },
    ].filter(g => g.cards.length > 0);
  };

  const groups = groupCards();

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <p className="text-gray-300 text-center mb-6">{step.caption}</p>

      {groups.map((group, i) => (
        <div key={i} className="mb-4">
          {group.label && (
            <div className={`text-sm font-semibold mb-2 ${
              group.label === 'Trump' ? 'text-yellow-400' : 'text-gray-400'
            }`}>
              {group.label}
            </div>
          )}
          <div className="flex flex-wrap gap-1 justify-center">
            {group.cards.map(card => (
              <div key={card.id} className="relative">
                <Card card={card} />
                {step.groupBy === 'points' && (
                  <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {getCardPoints(card)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// QUIZ: WHICH CARD WINS?
// ============================================

function QuizWhichWinsContent({
  step,
  quizState,
  onAnswer,
}: {
  step: QuizWhichWinsStep;
  quizState: 'unanswered' | 'correct' | 'incorrect';
  onAnswer: (correct: boolean) => void;
}) {
  const handleChoice = (choice: 1 | 2) => {
    if (quizState !== 'unanswered') return;
    onAnswer(choice === step.correctAnswer);
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 text-center">
      <h3 className="text-xl text-white mb-6">Which card wins?</h3>

      <div className="flex justify-center items-center gap-8 mb-6">
        <button
          onClick={() => handleChoice(1)}
          disabled={quizState !== 'unanswered'}
          className={`
            p-2 rounded-lg transition-all
            ${quizState === 'unanswered' ? 'hover:bg-blue-900/50 cursor-pointer' : ''}
            ${quizState !== 'unanswered' && step.correctAnswer === 1 ? 'ring-4 ring-green-500' : ''}
            ${quizState === 'incorrect' && step.correctAnswer !== 1 ? 'opacity-50' : ''}
          `}
        >
          <Card card={step.card1} />
        </button>

        <span className="text-gray-500 text-2xl">vs</span>

        <button
          onClick={() => handleChoice(2)}
          disabled={quizState !== 'unanswered'}
          className={`
            p-2 rounded-lg transition-all
            ${quizState === 'unanswered' ? 'hover:bg-blue-900/50 cursor-pointer' : ''}
            ${quizState !== 'unanswered' && step.correctAnswer === 2 ? 'ring-4 ring-green-500' : ''}
            ${quizState === 'incorrect' && step.correctAnswer !== 2 ? 'opacity-50' : ''}
          `}
        >
          <Card card={step.card2} />
        </button>
      </div>

      {quizState === 'unanswered' && (
        <p className="text-gray-400">Click the winning card</p>
      )}

      {quizState === 'correct' && (
        <div className="bg-green-900/50 border border-green-600 rounded-lg p-4">
          <p className="text-green-400 font-bold mb-2">Correct!</p>
          <p className="text-gray-300">{step.explanation}</p>
        </div>
      )}

      {quizState === 'incorrect' && (
        <div className="bg-red-900/50 border border-red-600 rounded-lg p-4">
          <p className="text-red-400 font-bold mb-2">Not quite!</p>
          <p className="text-gray-300">{step.explanation}</p>
        </div>
      )}
    </div>
  );
}

// ============================================
// QUIZ: LEGAL PLAYS
// ============================================

function QuizLegalPlaysContent({
  step,
  quizState,
  onAnswer,
}: {
  step: QuizLegalPlaysStep;
  quizState: 'unanswered' | 'correct' | 'incorrect';
  onAnswer: (correct: boolean) => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleCard = (id: string) => {
    if (quizState !== 'unanswered') return;
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const checkAnswer = () => {
    const selectedIds = Array.from(selected).sort();
    const correctIds = [...step.legalCardIds].sort();
    const isCorrect =
      selectedIds.length === correctIds.length &&
      selectedIds.every((id, i) => id === correctIds[i]);
    onAnswer(isCorrect);
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h3 className="text-xl text-white text-center mb-4">Which cards can you legally play?</h3>

      <div className="text-center mb-6">
        <p className="text-gray-400 mb-2">Card led:</p>
        <div className="flex justify-center">
          <Card card={step.leadCard} />
        </div>
      </div>

      <p className="text-gray-400 text-center mb-2">Your hand (tap legal cards):</p>
      <div className="flex flex-wrap gap-1 justify-center mb-6">
        {step.hand.map(card => {
          const isSelected = selected.has(card.id);
          const isLegal = step.legalCardIds.includes(card.id);

          let borderClass = '';
          if (quizState === 'unanswered') {
            borderClass = isSelected ? 'ring-4 ring-blue-500' : '';
          } else {
            borderClass = isLegal ? 'ring-4 ring-green-500' : 'opacity-50';
          }

          return (
            <button
              key={card.id}
              onClick={() => toggleCard(card.id)}
              disabled={quizState !== 'unanswered'}
              className={`p-1 rounded-lg transition-all ${borderClass}`}
            >
              <Card card={card} />
            </button>
          );
        })}
      </div>

      {quizState === 'unanswered' && (
        <div className="text-center">
          <button
            onClick={checkAnswer}
            disabled={selected.size === 0}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-6 py-2 rounded-lg font-semibold"
          >
            Check Answer
          </button>
        </div>
      )}

      {quizState !== 'unanswered' && (
        <div className={`${quizState === 'correct' ? 'bg-green-900/50 border-green-600' : 'bg-red-900/50 border-red-600'} border rounded-lg p-4`}>
          <p className={`${quizState === 'correct' ? 'text-green-400' : 'text-red-400'} font-bold mb-2`}>
            {quizState === 'correct' ? 'Correct!' : 'Not quite!'}
          </p>
          <p className="text-gray-300">{step.explanation}</p>
        </div>
      )}
    </div>
  );
}

// ============================================
// QUIZ: WHO WON?
// ============================================

function QuizWhoWonContent({
  step,
  quizState,
  onAnswer,
}: {
  step: QuizWhoWonStep;
  quizState: 'unanswered' | 'correct' | 'incorrect';
  onAnswer: (correct: boolean) => void;
}) {
  const handleChoice = (player: string) => {
    if (quizState !== 'unanswered') return;
    onAnswer(player === step.correctPlayer);
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h3 className="text-xl text-white text-center mb-6">Who won this trick?</h3>

      <div className="flex flex-wrap justify-center gap-4 mb-6">
        {step.trick.map((play, i) => {
          const isCorrect = play.player === step.correctPlayer;
          const showResult = quizState !== 'unanswered';

          return (
            <button
              key={i}
              onClick={() => handleChoice(play.player)}
              disabled={quizState !== 'unanswered'}
              className={`
                p-2 rounded-lg transition-all text-center
                ${quizState === 'unanswered' ? 'hover:bg-blue-900/50 cursor-pointer' : ''}
                ${showResult && isCorrect ? 'ring-4 ring-green-500' : ''}
                ${showResult && !isCorrect ? 'opacity-50' : ''}
              `}
            >
              <Card card={play.card} />
              <div className={`text-sm mt-1 ${showResult && isCorrect ? 'text-green-400 font-bold' : 'text-gray-400'}`}>
                {play.player}
              </div>
            </button>
          );
        })}
      </div>

      {quizState === 'unanswered' && (
        <p className="text-gray-400 text-center">Click the winning card</p>
      )}

      {quizState !== 'unanswered' && (
        <div className={`${quizState === 'correct' ? 'bg-green-900/50 border-green-600' : 'bg-red-900/50 border-red-600'} border rounded-lg p-4`}>
          <p className={`${quizState === 'correct' ? 'text-green-400' : 'text-red-400'} font-bold mb-2`}>
            {quizState === 'correct' ? 'Correct!' : 'Not quite!'}
          </p>
          <p className="text-gray-300">{step.explanation}</p>
        </div>
      )}
    </div>
  );
}

// ============================================
// QUIZ: POINTS
// ============================================

function QuizPointsContent({
  step,
  quizState,
  onAnswer,
}: {
  step: QuizPointsStep;
  quizState: 'unanswered' | 'correct' | 'incorrect';
  onAnswer: (correct: boolean) => void;
}) {
  const [guess, setGuess] = useState('');

  const checkAnswer = () => {
    const guessNum = parseInt(guess, 10);
    onAnswer(guessNum === step.correctPoints);
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h3 className="text-xl text-white text-center mb-6">How many points is this trick worth?</h3>

      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {step.cards.map(card => (
          <div key={card.id} className="relative">
            <Card card={card} />
            {quizState !== 'unanswered' && (
              <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {getCardPoints(card)}
              </div>
            )}
          </div>
        ))}
      </div>

      {quizState === 'unanswered' && (
        <div className="flex justify-center items-center gap-4">
          <input
            type="number"
            value={guess}
            onChange={e => setGuess(e.target.value)}
            placeholder="Enter points"
            className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white text-center w-32"
          />
          <button
            onClick={checkAnswer}
            disabled={!guess}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-6 py-2 rounded-lg font-semibold"
          >
            Check
          </button>
        </div>
      )}

      {quizState !== 'unanswered' && (
        <div className={`${quizState === 'correct' ? 'bg-green-900/50 border-green-600' : 'bg-red-900/50 border-red-600'} border rounded-lg p-4 text-center`}>
          <p className={`${quizState === 'correct' ? 'text-green-400' : 'text-red-400'} font-bold mb-2`}>
            {quizState === 'correct' ? 'Correct!' : `Not quite! The answer is ${step.correctPoints} points.`}
          </p>
          <p className="text-gray-300">
            {step.cards.map(c => `${c.rank}=${getCardPoints(c)}`).join(' + ')} = {step.correctPoints}
          </p>
        </div>
      )}
    </div>
  );
}
