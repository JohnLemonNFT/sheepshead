'use client';

// GameLog component - collapsible history panel with condensed trick view

import { useEffect, useRef, useState, useMemo } from 'react';

export interface LogEntry {
  id: number;
  player: string;
  action: string;
  reason: string;
  timestamp: number;
  isHuman: boolean;
  phase: string;
  trickNumber?: number;
  // For trick summary entries
  trickCards?: { player: string; card: string; isWinner: boolean }[];
  trickPoints?: number;
}

interface GameLogProps {
  entries: LogEntry[];
  onClear?: () => void;
}

// Suit symbols and colors for card display
const SUIT_DISPLAY: Record<string, { symbol: string; color: string }> = {
  clubs: { symbol: '♣', color: 'text-gray-300' },
  spades: { symbol: '♠', color: 'text-gray-300' },
  hearts: { symbol: '♥', color: 'text-red-400' },
  diamonds: { symbol: '♦', color: 'text-red-400' },
};

// Parse "played X of suit" to get card info
function parseCard(action: string): { rank: string; suit: string } | null {
  const playMatch = action.match(/played (\w+) of (\w+)/i);
  if (playMatch) {
    return { rank: playMatch[1], suit: playMatch[2].toLowerCase() };
  }
  return null;
}

// Format a card as a nice badge
function CardBadge({ rank, suit, highlight }: { rank: string; suit: string; highlight?: boolean }) {
  const suitInfo = SUIT_DISPLAY[suit];
  if (!suitInfo) return <span>{rank}</span>;

  return (
    <span className={`font-bold ${suitInfo.color} ${highlight ? 'bg-green-800' : 'bg-gray-800'} px-1 py-0.5 rounded text-[11px]`}>
      {rank}{suitInfo.symbol}
    </span>
  );
}

// Format called ace action
function formatCalledAce(action: string): JSX.Element | null {
  const callMatch = action.match(/called (\w+) (ace|10)/i);
  if (callMatch) {
    const [, suit, rank] = callMatch;
    const suitInfo = SUIT_DISPLAY[suit.toLowerCase()];
    if (suitInfo) {
      return (
        <span className="flex items-center gap-1">
          <span>called</span>
          <span className={`font-bold ${suitInfo.color}`}>
            {rank === '10' ? '10' : 'A'}{suitInfo.symbol}
          </span>
        </span>
      );
    }
  }
  return null;
}

// Group entries for display
interface TrickGroup {
  type: 'trick';
  trickNumber: number;
  plays: { player: string; card: { rank: string; suit: string }; isHuman: boolean }[];
}

interface EventEntry {
  type: 'event';
  entry: LogEntry;
}

type DisplayItem = TrickGroup | EventEntry;

export function GameLog({ entries, onClear }: GameLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  // Group entries by trick for playing phase, keep others as events
  const displayItems = useMemo((): DisplayItem[] => {
    const items: DisplayItem[] = [];
    const trickGroups: Map<number, TrickGroup> = new Map();

    for (const entry of entries) {
      if (entry.phase === 'playing' && entry.trickNumber !== undefined) {
        const card = parseCard(entry.action);
        if (card) {
          let group = trickGroups.get(entry.trickNumber);
          if (!group) {
            group = { type: 'trick', trickNumber: entry.trickNumber, plays: [] };
            trickGroups.set(entry.trickNumber, group);
          }
          group.plays.push({ player: entry.player, card, isHuman: entry.isHuman });
          continue;
        }
      }

      // Non-card-play entries (picking, burying, calling, partner revealed, etc.)
      items.push({ type: 'event', entry });
    }

    // Add trick groups in order
    const sortedTricks = Array.from(trickGroups.values()).sort((a, b) => a.trickNumber - b.trickNumber);

    // Interleave events and tricks by timestamp/order
    // For simplicity, put all events first, then tricks
    // Actually let's keep the original order by inserting tricks at their first play position
    const result: DisplayItem[] = [];
    let trickIndex = 0;
    let eventIndex = 0;

    // Simple approach: events first, then all tricks
    result.push(...items);
    result.push(...sortedTricks);

    return result;
  }, [entries]);

  // Auto-scroll to bottom when new entries added
  useEffect(() => {
    if (scrollRef.current && isExpanded) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries.length, isExpanded]);

  // Count tricks for header
  const trickCount = displayItems.filter(item => item.type === 'trick').length;
  const eventCount = displayItems.filter(item => item.type === 'event').length;

  return (
    <div className="bg-black/40 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex justify-between items-center p-3 hover:bg-white/5 transition-colors"
      >
        <h3 className="text-green-300 font-bold text-sm flex items-center gap-2">
          <span>📜</span>
          <span>Hand History</span>
          {trickCount > 0 && (
            <span className="text-xs text-gray-500">({trickCount} tricks)</span>
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
            {displayItems.length === 0 ? (
              <p className="text-gray-500 italic">No actions yet...</p>
            ) : (
              displayItems.map((item, idx) => {
                if (item.type === 'event') {
                  const entry = item.entry;
                  // Skip individual card plays that are now in tricks
                  if (entry.phase === 'playing' && parseCard(entry.action)) {
                    return null;
                  }

                  const calledAce = formatCalledAce(entry.action);

                  return (
                    <div
                      key={`event-${entry.id}`}
                      className={`border-l-2 pl-2 py-1 ${
                        entry.isHuman ? 'border-green-500' : 'border-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-bold ${entry.isHuman ? 'text-green-400' : 'text-yellow-400'}`}>
                          {entry.player}
                        </span>
                        <span className="text-white">
                          {calledAce || entry.action}
                        </span>
                      </div>
                    </div>
                  );
                }

                // Trick summary
                const trick = item;
                const leader = trick.plays[0];

                return (
                  <div
                    key={`trick-${trick.trickNumber}`}
                    className="border-l-2 border-blue-500 pl-2 py-1.5 bg-blue-900/10 rounded-r"
                  >
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-blue-400 font-bold text-[11px]">
                        T{trick.trickNumber}
                      </span>
                      <span className="text-gray-500 text-[10px]">•</span>
                      {trick.plays.map((play, i) => (
                        <span key={i} className="flex items-center gap-0.5">
                          <span className={`text-[10px] ${play.isHuman ? 'text-green-400' : 'text-gray-400'}`}>
                            {play.player.substring(0, 3)}:
                          </span>
                          <CardBadge rank={play.card.rank} suit={play.card.suit} />
                          {i < trick.plays.length - 1 && <span className="text-gray-600 mx-0.5">→</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
