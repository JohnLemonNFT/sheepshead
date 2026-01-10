'use client';

// ============================================
// STATS & ACHIEVEMENTS SCREEN
// ============================================

import { useStatsStore, ACHIEVEMENTS } from '../store/statsStore';

interface StatsScreenProps {
  onBack: () => void;
}

export function StatsScreen({ onBack }: StatsScreenProps) {
  const { stats, unlockedAchievements, getWinRate, getPickerWinRate, resetStats } = useStatsStore();

  const winRate = getWinRate();
  const pickerWinRate = getPickerWinRate();
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

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 text-white">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <header className="text-center mb-6 pt-4">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Your Stats</h1>
          <p className="text-gray-400 text-sm">Track your Sheepshead journey</p>
        </header>

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
                      {achievement.name}
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
              if (confirm('Are you sure you want to reset all stats and achievements? This cannot be undone.')) {
                resetStats();
              }
            }}
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            Reset Stats
          </button>
        </div>
      </div>
    </div>
  );
}
