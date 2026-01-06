// ============================================
// TUTORIAL HOOK - State management for lessons
// ============================================

import { useState, useCallback, useEffect } from 'react';
import type { LessonId, TutorialProgress, Lesson, LessonStep } from './types';
import { ALL_LESSONS, getLesson } from './lessons';

const STORAGE_KEY = 'sheepshead-tutorial-progress';

function loadProgress(): TutorialProgress {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    // Ignore
  }
  return {
    completedLessons: [],
    currentLesson: null,
    currentStep: 0,
    quizScore: 0,
    quizTotal: 0,
  };
}

function saveProgress(progress: TutorialProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    // Ignore
  }
}

export interface TutorialState {
  progress: TutorialProgress;
  currentLesson: Lesson | null;
  currentStep: LessonStep | null;
  isActive: boolean;
  stepIndex: number;
  totalSteps: number;
}

export interface TutorialActions {
  startLesson: (id: LessonId) => void;
  nextStep: () => void;
  prevStep: () => void;
  exitLesson: () => void;
  recordQuizAnswer: (correct: boolean) => void;
  resetProgress: () => void;
  getAllLessons: () => Lesson[];
  isLessonCompleted: (id: LessonId) => boolean;
}

export function useTutorial(): [TutorialState, TutorialActions] {
  const [progress, setProgress] = useState<TutorialProgress>(loadProgress);

  // Save progress whenever it changes
  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const currentLesson = progress.currentLesson ? getLesson(progress.currentLesson) || null : null;
  const currentStep = currentLesson?.steps[progress.currentStep] || null;
  const isActive = currentLesson !== null;
  const stepIndex = progress.currentStep;
  const totalSteps = currentLesson?.steps.length || 0;

  const startLesson = useCallback((id: LessonId) => {
    setProgress(prev => ({
      ...prev,
      currentLesson: id,
      currentStep: 0,
      quizScore: 0,
      quizTotal: 0,
    }));
  }, []);

  const nextStep = useCallback(() => {
    setProgress(prev => {
      if (!prev.currentLesson) return prev;

      const lesson = getLesson(prev.currentLesson);
      if (!lesson) return prev;

      const nextIndex = prev.currentStep + 1;

      // If we've completed all steps, mark lesson complete
      if (nextIndex >= lesson.steps.length) {
        const newCompleted = prev.completedLessons.includes(prev.currentLesson)
          ? prev.completedLessons
          : [...prev.completedLessons, prev.currentLesson];

        return {
          ...prev,
          completedLessons: newCompleted,
          currentLesson: null,
          currentStep: 0,
        };
      }

      return {
        ...prev,
        currentStep: nextIndex,
      };
    });
  }, []);

  const prevStep = useCallback(() => {
    setProgress(prev => ({
      ...prev,
      currentStep: Math.max(0, prev.currentStep - 1),
    }));
  }, []);

  const exitLesson = useCallback(() => {
    setProgress(prev => ({
      ...prev,
      currentLesson: null,
      currentStep: 0,
    }));
  }, []);

  const recordQuizAnswer = useCallback((correct: boolean) => {
    setProgress(prev => ({
      ...prev,
      quizScore: prev.quizScore + (correct ? 1 : 0),
      quizTotal: prev.quizTotal + 1,
    }));
  }, []);

  const resetProgress = useCallback(() => {
    const fresh: TutorialProgress = {
      completedLessons: [],
      currentLesson: null,
      currentStep: 0,
      quizScore: 0,
      quizTotal: 0,
    };
    setProgress(fresh);
  }, []);

  const getAllLessons = useCallback(() => ALL_LESSONS, []);

  const isLessonCompleted = useCallback(
    (id: LessonId) => progress.completedLessons.includes(id),
    [progress.completedLessons]
  );

  return [
    {
      progress,
      currentLesson,
      currentStep,
      isActive,
      stepIndex,
      totalSteps,
    },
    {
      startLesson,
      nextStep,
      prevStep,
      exitLesson,
      recordQuizAnswer,
      resetProgress,
      getAllLessons,
      isLessonCompleted,
    },
  ];
}
