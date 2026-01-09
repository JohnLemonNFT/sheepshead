'use client';

// InfoDrawer - Side panel for scores, tips, game log, and statistics

import { useState } from 'react';
import { ScoreBoard } from './ScoreBoard';
import { GameLog } from './GameLog';
import { StrategyTips } from './StrategyTips';
import { StatisticsPanel } from './StatisticsPanel';
import type { PlayerPosition, Card, Trick, Suit } from '../game/types';
import type { LogEntry } from './GameLog';
import type { GameStatistics } from '../store/gameStore';

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
  // Statistics props
  statistics?: GameStatistics;
  shuffleSeed?: string | null;
  onResetStatistics?: () => void;
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
  statistics,
  shuffleSeed,
  onResetStatistics,
}: InfoDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'scores' | 'tips' | 'log' | 'stats'>('scores');

  return (
    <>
      {/* Toggle Tab - Fixed on left side */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed left-0 top-1/2 -translate-y-1/2 z-40
          bg-gray-800/95 backdrop-blur-sm border-2 border-l-0 border-gray-600
          py-4 px-1.5 flex flex-col items-center gap-2
          text-xs font-medium text-white rounded-r-lg
          transition-all active:bg-gray-700 hover:bg-gray-700
          ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}
        `}
      >
        <span className="text-base">▶</span>
        <span className="writing-vertical text-[10px] tracking-wider">SCORES</span>
        <span className="bg-yellow-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
          {scores.reduce((a, b) => a + b, 0)}
        </span>
      </button>

      {/* Side Panel */}
      <div
        className={`
          fixed top-0 left-0 bottom-0 z-50
          bg-gray-900/98 backdrop-blur-lg border-r-2 border-gray-600
          transition-all duration-300 ease-out
          flex flex-col
          pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)]
          ${isOpen ? 'w-72 sm:w-80 translate-x-0' : 'w-72 sm:w-80 -translate-x-full'}
        `}
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between p-3 border-b border-gray-700">
          <span className="font-bold text-white">Game Info</span>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white p-1 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {[
            { id: 'scores' as const, label: '📊 Scores' },
            { id: 'stats' as const, label: '📈 Stats' },
            { id: 'tips' as const, label: '💡 Tips' },
            { id: 'log' as const, label: '📜 Log' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 py-2.5 text-sm font-medium transition-colors
                ${activeTab === tab.id
                  ? 'text-yellow-400 border-b-2 border-yellow-400 bg-yellow-900/20'
                  : 'text-gray-400 hover:text-gray-300'}
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-3 overflow-y-auto">
          {activeTab === 'scores' && (
            <ScoreBoard
              scores={scores}
              pickerPosition={pickerPosition}
              partnerPosition={partnerPosition}
              currentPlayer={currentPlayer}
              handsPlayed={handsPlayed}
            />
          )}

          {activeTab === 'stats' && statistics && onResetStatistics && (
            <StatisticsPanel
              statistics={statistics}
              shuffleSeed={shuffleSeed || null}
              onReset={onResetStatistics}
            />
          )}

          {activeTab === 'stats' && !statistics && (
            <div className="text-center text-gray-500 py-8">
              <p>Statistics will track your performance over time</p>
            </div>
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
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
