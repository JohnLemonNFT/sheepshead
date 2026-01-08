'use client';

// AI Chat Bubble - Shows AI personality voice lines with style

import { useState, useEffect } from 'react';
import { getPlayerDisplayInfo } from '../game/ai/personalities';
import type { PlayerPosition } from '../game/types';

interface AIBubbleProps {
  position: PlayerPosition;
  message: string;
  duration?: number; // How long to show (ms)
  onComplete?: () => void;
}

export function AIBubble({ position, message, duration = 3000, onComplete }: AIBubbleProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const displayInfo = getPlayerDisplayInfo(position);

  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, duration - 300);

    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, duration);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={`
        flex items-start gap-2 max-w-xs
        transition-all duration-300
        ${isExiting ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}
        animate-slideIn
      `}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className={`
          w-8 h-8 sm:w-10 sm:h-10 rounded-full
          bg-gradient-to-br from-slate-600 to-slate-800
          flex items-center justify-center text-lg sm:text-xl
          border-2 border-white/20 shadow-lg
        `}>
          {displayInfo.avatar}
        </div>
      </div>

      {/* Bubble */}
      <div className="flex flex-col">
        <span className="text-[10px] sm:text-xs text-emerald-300/70 font-medium mb-0.5 ml-1">
          {displayInfo.name}
        </span>
        <div className="relative">
          {/* Speech bubble triangle */}
          <div className="absolute -left-1.5 top-2 w-0 h-0 border-t-[6px] border-t-transparent border-r-[8px] border-r-slate-700/90 border-b-[6px] border-b-transparent" />

          {/* Bubble content */}
          <div className="glass bg-slate-700/80 rounded-xl rounded-tl-sm px-3 py-2 shadow-lg border border-white/10">
            <p className="text-xs sm:text-sm text-white/90 italic">
              "{message}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Container for managing multiple bubbles
interface AIBubbleManagerProps {
  bubbles: Array<{
    id: string;
    position: PlayerPosition;
    message: string;
  }>;
  onBubbleComplete?: (id: string) => void;
}

export function AIBubbleManager({ bubbles, onBubbleComplete }: AIBubbleManagerProps) {
  return (
    <div className="fixed bottom-24 left-4 right-4 sm:left-auto sm:right-8 sm:bottom-32 z-50 space-y-2 pointer-events-none">
      {bubbles.map((bubble) => (
        <AIBubble
          key={bubble.id}
          position={bubble.position}
          message={bubble.message}
          onComplete={() => onBubbleComplete?.(bubble.id)}
        />
      ))}
    </div>
  );
}

// Utility hook for managing AI bubbles
import { useCallback } from 'react';

export function useAIBubbles() {
  const [bubbles, setBubbles] = useState<Array<{
    id: string;
    position: PlayerPosition;
    message: string;
  }>>([]);

  const addBubble = useCallback((position: PlayerPosition, message: string) => {
    const id = `${position}-${Date.now()}`;
    setBubbles(prev => [...prev, { id, position, message }]);
    return id;
  }, []);

  const removeBubble = useCallback((id: string) => {
    setBubbles(prev => prev.filter(b => b.id !== id));
  }, []);

  const clearBubbles = useCallback(() => {
    setBubbles([]);
  }, []);

  return {
    bubbles,
    addBubble,
    removeBubble,
    clearBubbles,
    BubbleManager: () => (
      <AIBubbleManager bubbles={bubbles} onBubbleComplete={removeBubble} />
    ),
  };
}
