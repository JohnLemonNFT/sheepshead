// InfoDrawer - Collapsible drawer for scores, tips, and game log on mobile

import { useState } from 'react';
import { ScoreBoard } from './ScoreBoard';
import { GameLog } from './GameLog';
import { StrategyTips } from './StrategyTips';
import type { PlayerPosition, Card, Trick, Suit } from '../game/types';
import type { LogEntry } from './GameLog';

interface CalledAce {
  suit: Suit;
  revealed: boolean;
}

interface InfoDrawerProps {
  // Score props
  scores: number[];
  pickerPosition: PlayerPosition | null;
  partnerPosition: PlayerPosition | null;
  currentPlayer: PlayerPosition;
  handsPlayed: number;
  // Tips props
  showTips: boolean;
  phase: string;
  hand: Card[];
  isPicker: boolean;
  isPartner: boolean;
  currentTrick: Trick;
  calledAce: CalledAce | null;
  // Log props
  gameLog: LogEntry[];
  onClearLog: () => void;
  // AI explanation
  showAIExplanation?: boolean;
  onShowExplanation?: () => void;
  lastAIPlayerName?: string;
}

export function InfoDrawer({
  scores,
  pickerPosition,
  partnerPosition,
  currentPlayer,
  handsPlayed,
  showTips,
  phase,
  hand,
  isPicker,
  isPartner,
  currentTrick,
  calledAce,
  gameLog,
  onClearLog,
  showAIExplanation,
  onShowExplanation,
  lastAIPlayerName,
}: InfoDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'scores' | 'tips' | 'log'>('scores');

  return (
    <>
      {/* Toggle Button - Fixed at bottom */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed bottom-0 left-0 right-0 z-40
          bg-gray-900/95 backdrop-blur border-t border-gray-700
          py-2 px-4 flex items-center justify-center gap-2
          text-sm font-medium text-gray-300
          transition-all
          ${isOpen ? 'rounded-t-none' : ''}
        `}
      >
        <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>▲</span>
        <span>{isOpen ? 'Hide Info' : 'Scores & Tips'}</span>
        {!isOpen && (
          <span className="bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full ml-2">
            {scores.reduce((a, b) => a + b, 0)} pts
          </span>
        )}
      </button>

      {/* Drawer Panel */}
      <div
        className={`
          fixed bottom-10 left-0 right-0 z-30
          bg-gray-900/98 backdrop-blur-lg border-t border-gray-700
          transition-all duration-300 ease-out
          ${isOpen ? 'max-h-[60vh] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}
        `}
      >
        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {[
            { id: 'scores' as const, label: '📊 Scores' },
            { id: 'tips' as const, label: '💡 Tips' },
            { id: 'log' as const, label: '📜 Log' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 py-2.5 text-sm font-medium transition-colors
                ${activeTab === tab.id
                  ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-900/20'
                  : 'text-gray-400 hover:text-gray-300'}
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-3 overflow-y-auto max-h-[calc(60vh-80px)]">
          {activeTab === 'scores' && (
            <ScoreBoard
              scores={scores}
              pickerPosition={pickerPosition}
              partnerPosition={partnerPosition}
              currentPlayer={currentPlayer}
              handsPlayed={handsPlayed}
            />
          )}

          {activeTab === 'tips' && showTips && hand.length > 0 && (
            <StrategyTips
              phase={phase}
              hand={hand}
              isPicker={isPicker}
              isPartner={isPartner}
              currentTrick={currentTrick}
              calledAce={calledAce}
              pickerPosition={pickerPosition}
            />
          )}

          {activeTab === 'tips' && (!showTips || hand.length === 0) && (
            <div className="text-center text-gray-500 py-8">
              <p>Strategy tips will appear here during your turn</p>
            </div>
          )}

          {activeTab === 'log' && (
            <>
              <GameLog entries={gameLog} onClear={onClearLog} />
              {showAIExplanation && onShowExplanation && lastAIPlayerName && (
                <button
                  onClick={onShowExplanation}
                  className="w-full mt-3 bg-purple-600 hover:bg-purple-500 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
                >
                  Why did {lastAIPlayerName} do that?
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Backdrop when open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
