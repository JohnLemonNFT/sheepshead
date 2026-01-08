'use client';

// GameLog component - collapsible history panel

import { useEffect, useRef, useState } from 'react';

export interface LogEntry {
  id: number;
  player: string;
  action: string;
  reason: string;
  timestamp: number;
  isHuman: boolean;
  phase: string;
}

interface GameLogProps {
  entries: LogEntry[];
  onClear?: () => void;
}

export function GameLog({ entries, onClear }: GameLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Auto-scroll to bottom when new entries added and expanded
  useEffect(() => {
    if (scrollRef.current && isExpanded) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries.length, isExpanded]);

  const getActionColor = (phase: string, isHuman: boolean) => {
    if (isHuman) return 'text-green-400';
    switch (phase) {
      case 'picking': return 'text-yellow-400';
      case 'burying': return 'text-orange-400';
      case 'calling': return 'text-purple-400';
      case 'playing': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="hidden lg:block bg-black/40 rounded-lg overflow-hidden">
      {/* Collapsed header - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex justify-between items-center p-3 hover:bg-white/5 transition-colors"
      >
        <h3 className="text-green-300 font-bold text-sm flex items-center gap-2">
          <span>📜</span>
          <span>History</span>
          {entries.length > 0 && (
            <span className="text-xs text-gray-500">({entries.length})</span>
          )}
        </h3>
        <span className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-3 pb-3">
          {onClear && entries.length > 0 && (
            <button
              onClick={onClear}
              className="text-xs text-gray-400 hover:text-white mb-2"
            >
              Clear
            </button>
          )}

          <div
            ref={scrollRef}
            className="overflow-y-auto space-y-2 text-xs max-h-[250px]"
          >
            {entries.length === 0 ? (
              <p className="text-gray-500 italic">No actions yet...</p>
            ) : (
              entries.map((entry) => (
                <div
                  key={entry.id}
                  className={`border-l-2 pl-2 py-1 ${
                    entry.isHuman ? 'border-green-500' : 'border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${getActionColor(entry.phase, entry.isHuman)}`}>
                      {entry.player}
                    </span>
                    <span className="text-white">{entry.action}</span>
                  </div>
                  {entry.reason && (
                    <p className="text-gray-400 mt-0.5 italic text-[11px]">
                      "{entry.reason}"
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
