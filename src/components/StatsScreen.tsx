'use client';

// ============================================
// STATS & ACHIEVEMENTS SCREEN
// ============================================

import { useState } from 'react';
import { useStatsStore, ACHIEVEMENTS, type StatsMode } from '../store/statsStore';

interface StatsScreenProps {
  onBack: () => void;
}

type TabMode = 'local' | 'online' | 'combined';

export function StatsScreen({ onBack }: StatsScreenProps) {
  const [activeTab, setActiveTab] = useState<TabMode>('combined');
  const { unlockedAchievements, getStats, getWinRate, getPickerWinRate, resetStats } = useStatsStore();

  const stats = getStats(activeTab);
  const winRate = getWinRate(activeTab);
  const pickerWinRate = getPickerWinRate(activeTab);
  const unlockedCount = unlockedAchievements.size;
  const totalAchievements = ACHIEVEMENTS.length;

  // Sort achievements: unlocked first, then by order in definition
  const sortedAchievements = [...ACHIEVEMENTS].sort((a, b) => {
    const aUnlocked = unlockedAchievements.has(a.id);
    const bUnlocked = unlockedAchievements.has(b.id);
    if (aUnlocked && !bUnlocked) return -1;
    if (!aUnlocked && bUnlocked) return 1;
    return 0;
  });

  const tabs: { key: TabMode; label: string }[] = [
    { key: 'combined', label: 'All' },
    { key: 'local', label: 'Local' },
    { key: 'online', label: 'Online' },
  ];

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 text-white">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <header className="text-center mb-6 pt-4">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Your Stats</h1>
          <p className="text-gray-400 text-sm">Track your Sheepshead journey</p>
        </header>

        {/* Tab Selector */}
        <div className="flex bg-gray-800 rounded-lg p-1 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all
                ${activeTab === tab.key
                  ? 'bg-green-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Stats Overview */}
        <section className="bg-gray-800 rounded-xl p-4 sm:p-5 mb-4">
          <h2 className="text-lg font-semibold text-green-400 mb-4">Overview</h2>

          <div className="grid grid-cols-2 gap-4">
            {/* Games Played */}
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{stats.gamesPlayed}</div>
              <div className="text-xs text-gray-400">Games Played</div>
            </div>

            {/* Win Rate */}
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">{winRate}%</div>
              <div className="text-xs text-gray-400">Win Rate</div>
            </div>

            {/* Games Won */}
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{stats.gamesWon}</div>
              <div className="text-xs text-gray-400">Wins</div>
            </div>

            {/* Best Streak */}
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{stats.bestWinStreak}</div>
              <div className="text-xs text-gray-400">Best Streak</div>
            </div>
          </div>
        </section>

        {/* Picker Stats */}
        <section className="bg-gray-800 rounded-xl p-4 sm:p-5 mb-4">
          <h2 className="text-lg font-semibold text-blue-400 mb-4">As Picker</h2>

          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{stats.timesPicked}</div>
              <div className="text-xs text-gray-400">Times Picked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{stats.pickerWins}</div>
              <div className="text-xs text-gray-400">Picker Wins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{pickerWinRate}%</div>
              <div className="text-xs text-gray-400">Picker Win %</div>
            </div>
          </div>
        </section>

        {/* Special Stats */}
        <section className="bg-gray-800 rounded-xl p-4 sm:p-5 mb-4">
          <h2 className="text-lg font-semibold text-purple-400 mb-4">Special</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💥</span>
              <div>
                <div className="text-lg font-bold text-white">{stats.schneiders}</div>
                <div className="text-xs text-gray-400">Schneiders</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🐑</span>
              <div>
                <div className="text-lg font-bold text-white">{stats.leastersWon}</div>
                <div className="text-xs text-gray-400">Leasters Won</div>
              </div>
            </div>
          </div>
        </section>

        {/* Achievements */}
        <section className="bg-gray-800 rounded-xl p-4 sm:p-5 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-yellow-400">Achievements</h2>
            <span className="text-sm text-gray-400">{unlockedCount}/{totalAchievements}</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
            <div
              className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(unlockedCount / totalAchievements) * 100}%` }}
            />
          </div>

          {/* Achievement grid */}
          <div className="grid grid-cols-1 gap-2">
            {sortedAchievements.map((achievement) => {
              const isUnlocked = unlockedAchievements.has(achievement.id);
              const modeLabel = achievement.mode === 'online' ? '(Online)' : achievement.mode === 'local' ? '(Local)' : '';
              return (
                <div
                  key={achievement.id}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg transition-all
                    ${isUnlocked
                      ? 'bg-gray-700'
                      : 'bg-gray-800/50 opacity-50'
                    }
                  `}
                >
                  <span className={`text-2xl ${isUnlocked ? '' : 'grayscale'}`}>
                    {achievement.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium text-sm ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                      {achievement.name} {modeLabel && <span className="text-xs text-gray-500">{modeLabel}</span>}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {achievement.description}
                    </div>
                  </div>
                  {isUnlocked && (
                    <span className="text-green-400 text-sm">✓</span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Back Button */}
        <button
          onClick={onBack}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors mb-4"
        >
          Back to Menu
        </button>

        {/* Fine print */}
        <div className="text-center space-y-2">
          <p className="text-xs text-gray-600">
            Stats are stored locally on this device
          </p>
          <button
            onClick={() => {
              const resetMode = activeTab === 'combined' ? undefined : activeTab as StatsMode;
              const modeText = activeTab === 'combined' ? 'all stats and achievements' : `${activeTab} stats`;
              if (confirm(`Are you sure you want to reset ${modeText}? This cannot be undone.`)) {
                resetStats(resetMode);
              }
            }}
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            Reset {activeTab === 'combined' ? 'All Stats' : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Stats`}
          </button>
        </div>
      </div>
    </div>
  );
}
