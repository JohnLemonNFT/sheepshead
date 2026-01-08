'use client';

// StatisticsPanel - Display game statistics and provably fair info

import { GameStatistics } from '../store/gameStore';

interface StatisticsPanelProps {
  statistics: GameStatistics;
  shuffleSeed: string | null;
  onReset: () => void;
}

function StatRow({ label, value, subtext }: { label: string; value: string | number; subtext?: string }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-gray-700/50 last:border-0">
      <span className="text-gray-400 text-xs">{label}</span>
      <div className="text-right">
        <span className="text-white font-medium text-sm">{value}</span>
        {subtext && <span className="text-gray-500 text-xs ml-1">{subtext}</span>}
      </div>
    </div>
  );
}

function WinRateBar({ wins, total, label }: { wins: number; total: number; label: string }) {
  const rate = total > 0 ? (wins / total) * 100 : 0;
  const rateStr = total > 0 ? `${rate.toFixed(0)}%` : '-';

  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-white">{wins}/{total} ({rateStr})</span>
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 transition-all duration-300"
          style={{ width: `${rate}%` }}
        />
      </div>
    </div>
  );
}

export function StatisticsPanel({ statistics, shuffleSeed, onReset }: StatisticsPanelProps) {
  const totalWins = statistics.winsAsPicker + statistics.winsAsPartner + statistics.winsAsDefender + statistics.leastersWon;
  const totalHands = statistics.totalHandsPlayed;
  const overallWinRate = totalHands > 0 ? ((totalWins / totalHands) * 100).toFixed(1) : '0';

  // Calculate average trump per hand from distribution
  const totalTrumpHands = statistics.trumpCountDistribution.reduce((a, b) => a + b, 0);
  const totalTrump = statistics.trumpCountDistribution.reduce((sum, count, idx) => sum + count * idx, 0);
  const avgTrump = totalTrumpHands > 0 ? (totalTrump / totalTrumpHands).toFixed(1) : '-';

  // Expected average trump is about 2.8 per hand (14 trump / 5 players)
  const expectedAvgTrump = 2.8;

  return (
    <div className="space-y-4">
      {/* Overall Stats */}
      <div className="bg-gray-800/50 rounded-lg p-3">
        <h4 className="text-green-400 font-bold text-sm mb-2">Overall Performance</h4>
        <div className="text-center mb-3">
          <div className="text-3xl font-bold text-white">{overallWinRate}%</div>
          <div className="text-xs text-gray-400">Win Rate ({totalWins}/{totalHands})</div>
        </div>
        <StatRow label="Hands Played" value={statistics.totalHandsPlayed} />
        <StatRow label="Games Started" value={statistics.totalGamesStarted} />
        <StatRow
          label="Net Points"
          value={statistics.totalPointsWon - statistics.totalPointsLost}
          subtext={statistics.totalPointsWon - statistics.totalPointsLost >= 0 ? '' : ''}
        />
      </div>

      {/* Win Rates by Role */}
      <div className="bg-gray-800/50 rounded-lg p-3">
        <h4 className="text-yellow-400 font-bold text-sm mb-2">Win Rate by Role</h4>
        <WinRateBar
          wins={statistics.winsAsPicker}
          total={statistics.handsAsPicker}
          label="As Picker"
        />
        <WinRateBar
          wins={statistics.winsAsPartner}
          total={statistics.handsAsPartner}
          label="As Partner"
        />
        <WinRateBar
          wins={statistics.winsAsDefender}
          total={statistics.handsAsDefender}
          label="As Defender"
        />
        {statistics.leastersPlayed > 0 && (
          <WinRateBar
            wins={statistics.leastersWon}
            total={statistics.leastersPlayed}
            label="Leasters"
          />
        )}
      </div>

      {/* Trump Distribution - Proves fair dealing */}
      <div className="bg-gray-800/50 rounded-lg p-3">
        <h4 className="text-blue-400 font-bold text-sm mb-2">Trump Distribution</h4>
        <p className="text-xs text-gray-400 mb-2">
          Proves cards are dealt fairly. Expected avg: ~{expectedAvgTrump} trump/hand
        </p>
        <StatRow label="Your Average" value={avgTrump} subtext="trump/hand" />
        <StatRow label="Hands Tracked" value={totalTrumpHands} />

        {/* Distribution chart */}
        {totalTrumpHands > 0 && (
          <div className="mt-2">
            <div className="flex items-end gap-0.5 h-12">
              {statistics.trumpCountDistribution.slice(0, 10).map((count, idx) => {
                const maxCount = Math.max(...statistics.trumpCountDistribution);
                const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                return (
                  <div
                    key={idx}
                    className="flex-1 bg-blue-500/60 rounded-t transition-all"
                    style={{ height: `${height}%` }}
                    title={`${idx} trump: ${count} times`}
                  />
                );
              })}
            </div>
            <div className="flex gap-0.5 text-[8px] text-gray-500">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                <div key={n} className="flex-1 text-center">{n}</div>
              ))}
            </div>
            <div className="text-center text-[9px] text-gray-500 mt-0.5">Trump count</div>
          </div>
        )}
      </div>

      {/* Special Outcomes */}
      {(statistics.schneiderWins > 0 || statistics.schneiderLosses > 0 ||
        statistics.schwarzWins > 0 || statistics.schwarzLosses > 0) && (
        <div className="bg-gray-800/50 rounded-lg p-3">
          <h4 className="text-purple-400 font-bold text-sm mb-2">Special Outcomes</h4>
          {(statistics.schneiderWins > 0 || statistics.schneiderLosses > 0) && (
            <StatRow
              label="Schneider"
              value={`${statistics.schneiderWins}W / ${statistics.schneiderLosses}L`}
            />
          )}
          {(statistics.schwarzWins > 0 || statistics.schwarzLosses > 0) && (
            <StatRow
              label="Schwarz"
              value={`${statistics.schwarzWins}W / ${statistics.schwarzLosses}L`}
            />
          )}
        </div>
      )}

      {/* Provably Fair Seed */}
      {shuffleSeed && (
        <div className="bg-green-900/30 border border-green-600/50 rounded-lg p-3">
          <h4 className="text-green-400 font-bold text-sm mb-1">Provably Fair</h4>
          <p className="text-xs text-gray-400 mb-2">
            Current shuffle seed - verify cards are random
          </p>
          <code className="text-xs text-green-300 bg-black/30 px-2 py-1 rounded block break-all">
            {shuffleSeed}
          </code>
        </div>
      )}

      {/* Reset Button */}
      <button
        onClick={onReset}
        className="w-full text-xs text-gray-500 hover:text-red-400 py-2 transition-colors"
      >
        Reset All Statistics
      </button>
    </div>
  );
}
