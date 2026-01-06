// GameLog component - shows history of actions with AI reasoning

import { useEffect, useRef } from 'react';

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

  // Auto-scroll to bottom when new entries added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries.length]);

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
    <div className="hidden lg:flex bg-black/40 rounded-lg p-3 h-full flex-col">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-green-300 font-bold text-sm">Game Log</h3>
        {onClear && entries.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-gray-400 hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-2 text-xs min-h-[200px] max-h-[300px]"
      >
        {entries.length === 0 ? (
          <p className="text-gray-500 italic">Game actions will appear here...</p>
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
                <p className="text-gray-400 mt-0.5 italic">
                  "{entry.reason}"
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
