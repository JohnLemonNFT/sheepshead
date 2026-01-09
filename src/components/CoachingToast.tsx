'use client';

// ============================================
// COACHING TOAST - Display coaching feedback
// ============================================

import { useEffect } from 'react';
import { CoachingFeedback, formatCoachingMessage, formatPrePlayWarning } from '../game/ai/coaching';
import { playSound } from '../utils/sounds';

interface CoachingToastProps {
  feedback: CoachingFeedback | null;
  isWarning?: boolean;
  onDismiss: () => void;
  onProceedAnyway?: () => void;
}

export function CoachingToast({
  feedback,
  isWarning = false,
  onDismiss,
  onProceedAnyway,
}: CoachingToastProps) {
  // Play sound when toast appears
  useEffect(() => {
    if (feedback) {
      if (isWarning) {
        playSound('warning');
      } else if (feedback.rule.severity === 'positive') {
        playSound('success');
      }
    }
  }, [feedback, isWarning]);

  if (!feedback) return null;

  const isPositive = feedback.rule.severity === 'positive';

  const bgColor = isPositive
    ? 'bg-green-900/90'
    : isWarning
    ? 'bg-yellow-900/90'
    : 'bg-blue-900/90';

  const borderColor = isPositive
    ? 'border-green-500'
    : isWarning
    ? 'border-yellow-500'
    : 'border-blue-500';

  const icon = isPositive ? '👍' : isWarning ? '⚠️' : '💡';
  const title = isPositive
    ? 'Nice Play!'
    : isWarning
    ? 'Wait a moment...'
    : 'Coaching Tip';

  const message = isWarning
    ? formatPrePlayWarning(feedback)
    : formatCoachingMessage(feedback);

  return (
    <div
      className={`
        fixed left-1/2 -translate-x-1/2 z-50
        max-w-md w-full mx-4
        ${bgColor} ${borderColor} border-2
        rounded-lg shadow-xl p-4
        animate-in slide-in-from-bottom
      `}
      style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <div className="font-bold text-white mb-1">{title}</div>
          <div className="text-gray-200 text-sm whitespace-pre-line">{message}</div>

          {isWarning && (
            <div className="text-xs text-gray-400 mt-2 italic">
              {feedback.rule.memorableRule}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-3">
        {isWarning && onProceedAnyway && (
          <button
            onClick={onProceedAnyway}
            className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded text-gray-300"
          >
            Do it anyway
          </button>
        )}
        <button
          onClick={onDismiss}
          className={`px-3 py-1 text-sm rounded ${
            isWarning
              ? 'bg-yellow-600 hover:bg-yellow-500 text-white'
              : isPositive
              ? 'bg-green-600 hover:bg-green-500 text-white'
              : 'bg-blue-600 hover:bg-blue-500 text-white'
          }`}
        >
          {isWarning ? 'Let me reconsider' : 'Got it'}
        </button>
      </div>
    </div>
  );
}

// ============================================
// HAND SUMMARY MODAL
// ============================================

import type { HandSummary } from '../game/ai/coaching';

interface HandSummaryModalProps {
  summary: HandSummary;
  onClose: () => void;
}

export function HandSummaryModal({ summary, onClose }: HandSummaryModalProps) {
  const { goodPlays, mistakes, tips } = summary;

  if (goodPlays.length === 0 && mistakes.length === 0 && tips.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-lg w-full p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Hand Summary</h2>

        {goodPlays.length > 0 && (
          <div className="mb-4">
            <h3 className="text-green-400 font-semibold mb-2">👍 Good Plays</h3>
            <ul className="space-y-1">
              {goodPlays.map((f, i) => (
                <li key={i} className="text-gray-300 text-sm">
                  • {formatCoachingMessage(f)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {mistakes.length > 0 && (
          <div className="mb-4">
            <h3 className="text-yellow-400 font-semibold mb-2">💡 Learning Moments</h3>
            <ul className="space-y-2">
              {mistakes.map((f, i) => (
                <li key={i} className="text-gray-300 text-sm">
                  <div>• {formatCoachingMessage(f)}</div>
                  <div className="text-xs text-gray-500 mt-1 ml-3 italic">
                    Remember: {f.rule.memorableRule}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {tips.length > 0 && (
          <div className="mb-4">
            <h3 className="text-blue-400 font-semibold mb-2">📝 Tips</h3>
            <ul className="space-y-1">
              {tips.map((tip, i) => (
                <li key={i} className="text-gray-300 text-sm">
                  • {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-500 py-2 rounded font-semibold"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
