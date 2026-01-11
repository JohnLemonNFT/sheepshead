// ============================================
// PLAYER STATS & ACHIEVEMENTS STORE
// ============================================
// Local storage persistence for player progression

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================
// TYPES
// ============================================

export type StatsMode = 'local' | 'online';

export interface PlayerStats {
  // Basic stats
  gamesPlayed: number;
  gamesWon: number;

  // Picker stats
  timesPicked: number;
  pickerWins: number;

  // Special outcomes
  schneiders: number;        // Won by 30+ (opponent < 31)
  timesSchneidered: number;  // Lost by 30+ (you < 31)
  leastersPlayed: number;
  leastersWon: number;

  // Streaks
  currentWinStreak: number;
  bestWinStreak: number;

  // Points
  totalPointsWon: number;

  // Timestamps
  firstGameDate: number | null;
  lastGameDate: number | null;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: number | null;  // timestamp or null if locked
  requirement: (stats: PlayerStats) => boolean;
  mode?: 'local' | 'online' | 'combined';  // Which stats to check (default: combined)
}

// ============================================
// ACHIEVEMENT DEFINITIONS
// ============================================

export const ACHIEVEMENTS: Omit<Achievement, 'unlockedAt'>[] = [
  // ============================================
  // GETTING STARTED (Any mode)
  // ============================================
  {
    id: 'first_game',
    name: 'First Hand',
    description: 'Play your first game',
    icon: '🎴',
    requirement: (s) => s.gamesPlayed >= 1,
  },
  {
    id: 'first_win',
    name: 'Winner!',
    description: 'Win your first game',
    icon: '🏆',
    requirement: (s) => s.gamesWon >= 1,
  },

  // ============================================
  // LOCAL PRACTICE
  // ============================================
  {
    id: 'local_practice_10',
    name: 'Practice Makes Perfect',
    description: 'Play 10 local games',
    icon: '🎯',
    requirement: (s) => s.gamesPlayed >= 10,
    mode: 'local',
  },
  {
    id: 'local_first_win',
    name: 'AI Slayer',
    description: 'Win your first local game',
    icon: '🤖',
    requirement: (s) => s.gamesWon >= 1,
    mode: 'local',
  },

  // ============================================
  // ONLINE MILESTONES
  // ============================================
  {
    id: 'online_first',
    name: 'Going Online',
    description: 'Play your first online game',
    icon: '🌐',
    requirement: (s) => s.gamesPlayed >= 1,
    mode: 'online',
  },
  {
    id: 'online_10',
    name: 'Getting Serious',
    description: 'Play 10 online games',
    icon: '📡',
    requirement: (s) => s.gamesPlayed >= 10,
    mode: 'online',
  },
  {
    id: 'online_50',
    name: 'Regular',
    description: 'Play 50 online games',
    icon: '🃏',
    requirement: (s) => s.gamesPlayed >= 50,
    mode: 'online',
  },
  {
    id: 'online_100',
    name: 'Veteran',
    description: 'Play 100 online games',
    icon: '⭐',
    requirement: (s) => s.gamesPlayed >= 100,
    mode: 'online',
  },
  {
    id: 'online_500',
    name: 'Sheepshead Master',
    description: 'Play 500 online games',
    icon: '👑',
    requirement: (s) => s.gamesPlayed >= 500,
    mode: 'online',
  },

  // ============================================
  // ONLINE WINS
  // ============================================
  {
    id: 'online_wins_10',
    name: 'On a Roll',
    description: 'Win 10 online games',
    icon: '🔥',
    requirement: (s) => s.gamesWon >= 10,
    mode: 'online',
  },
  {
    id: 'online_wins_50',
    name: 'Champion',
    description: 'Win 50 online games',
    icon: '🏅',
    requirement: (s) => s.gamesWon >= 50,
    mode: 'online',
  },
  {
    id: 'online_wins_100',
    name: 'Legend',
    description: 'Win 100 online games',
    icon: '🌟',
    requirement: (s) => s.gamesWon >= 100,
    mode: 'online',
  },

  // ============================================
  // ONLINE PICKER ACHIEVEMENTS
  // ============================================
  {
    id: 'online_picker_10',
    name: 'Risk Taker',
    description: 'Pick up the blind 10 times online',
    icon: '🎲',
    requirement: (s) => s.timesPicked >= 10,
    mode: 'online',
  },
  {
    id: 'online_picker_wins_10',
    name: "Picker's Instinct",
    description: 'Win 10 online games as picker',
    icon: '🧠',
    requirement: (s) => s.pickerWins >= 10,
    mode: 'online',
  },
  {
    id: 'online_picker_50',
    name: 'Bold Player',
    description: 'Pick up the blind 50 times online',
    icon: '💪',
    requirement: (s) => s.timesPicked >= 50,
    mode: 'online',
  },

  // ============================================
  // ONLINE SPECIAL OUTCOMES
  // ============================================
  {
    id: 'online_schneider',
    name: 'Schneider!',
    description: 'Win an online game by 30+ points',
    icon: '💥',
    requirement: (s) => s.schneiders >= 1,
    mode: 'online',
  },
  {
    id: 'online_schneider_5',
    name: 'Crushing It',
    description: 'Schneider opponents 5 times online',
    icon: '⚡',
    requirement: (s) => s.schneiders >= 5,
    mode: 'online',
  },
  {
    id: 'online_leaster_win',
    name: 'Leaster Master',
    description: 'Win an online leaster',
    icon: '🐑',
    requirement: (s) => s.leastersWon >= 1,
    mode: 'online',
  },
  {
    id: 'online_leaster_wins_5',
    name: 'Reverse Psychology',
    description: 'Win 5 online leasters',
    icon: '🔄',
    requirement: (s) => s.leastersWon >= 5,
    mode: 'online',
  },

  // ============================================
  // ONLINE STREAKS
  // ============================================
  {
    id: 'online_streak_3',
    name: 'Hot Streak',
    description: 'Win 3 online games in a row',
    icon: '🔥',
    requirement: (s) => s.bestWinStreak >= 3,
    mode: 'online',
  },
  {
    id: 'online_streak_5',
    name: 'Unstoppable',
    description: 'Win 5 online games in a row',
    icon: '🚀',
    requirement: (s) => s.bestWinStreak >= 5,
    mode: 'online',
  },
  {
    id: 'online_streak_10',
    name: 'Dominant',
    description: 'Win 10 online games in a row',
    icon: '👊',
    requirement: (s) => s.bestWinStreak >= 10,
    mode: 'online',
  },
];

// ============================================
// DEFAULT STATE
// ============================================

const DEFAULT_STATS: PlayerStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  timesPicked: 0,
  pickerWins: 0,
  schneiders: 0,
  timesSchneidered: 0,
  leastersPlayed: 0,
  leastersWon: 0,
  currentWinStreak: 0,
  bestWinStreak: 0,
  totalPointsWon: 0,
  firstGameDate: null,
  lastGameDate: null,
};

// ============================================
// STORE INTERFACE
// ============================================

interface StatsState {
  localStats: PlayerStats;
  onlineStats: PlayerStats;
  unlockedAchievements: Set<string>;
  newlyUnlocked: string[];  // IDs of achievements just unlocked (for notifications)

  // Actions
  recordGameResult: (result: GameResult, mode: StatsMode) => string[];  // Returns newly unlocked achievement IDs
  clearNewlyUnlocked: () => void;
  resetStats: (mode?: StatsMode) => void;

  // Computed
  getStats: (mode: StatsMode | 'combined') => PlayerStats;
  getWinRate: (mode: StatsMode | 'combined') => number;
  getPickerWinRate: (mode: StatsMode | 'combined') => number;
  getAchievements: () => (Achievement & { unlockedAt: number | null })[];
}

export interface GameResult {
  won: boolean;
  wasPicker: boolean;
  wasLeaster: boolean;
  playerPoints: number;       // Points your team scored
  opponentPoints: number;     // Points opponent scored
  isSchneider: boolean;       // Did winner schneider? (loser < 31)
  wasSchneidered: boolean;    // Were you schneidered?
}

// Helper to combine two stats objects
function combineStats(a: PlayerStats, b: PlayerStats): PlayerStats {
  return {
    gamesPlayed: a.gamesPlayed + b.gamesPlayed,
    gamesWon: a.gamesWon + b.gamesWon,
    timesPicked: a.timesPicked + b.timesPicked,
    pickerWins: a.pickerWins + b.pickerWins,
    schneiders: a.schneiders + b.schneiders,
    timesSchneidered: a.timesSchneidered + b.timesSchneidered,
    leastersPlayed: a.leastersPlayed + b.leastersPlayed,
    leastersWon: a.leastersWon + b.leastersWon,
    currentWinStreak: Math.max(a.currentWinStreak, b.currentWinStreak),
    bestWinStreak: Math.max(a.bestWinStreak, b.bestWinStreak),
    totalPointsWon: a.totalPointsWon + b.totalPointsWon,
    firstGameDate: a.firstGameDate && b.firstGameDate
      ? Math.min(a.firstGameDate, b.firstGameDate)
      : a.firstGameDate || b.firstGameDate,
    lastGameDate: a.lastGameDate && b.lastGameDate
      ? Math.max(a.lastGameDate, b.lastGameDate)
      : a.lastGameDate || b.lastGameDate,
  };
}

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useStatsStore = create<StatsState>()(
  persist(
    (set, get) => ({
      localStats: DEFAULT_STATS,
      onlineStats: DEFAULT_STATS,
      unlockedAchievements: new Set<string>(),
      newlyUnlocked: [],

      recordGameResult: (result: GameResult, mode: StatsMode) => {
        const currentStats = mode === 'local' ? get().localStats : get().onlineStats;
        const currentUnlocked = get().unlockedAchievements;
        const now = Date.now();

        // Calculate new stats
        const newStats: PlayerStats = {
          ...currentStats,
          gamesPlayed: currentStats.gamesPlayed + 1,
          gamesWon: currentStats.gamesWon + (result.won ? 1 : 0),
          timesPicked: currentStats.timesPicked + (result.wasPicker ? 1 : 0),
          pickerWins: currentStats.pickerWins + (result.wasPicker && result.won ? 1 : 0),
          schneiders: currentStats.schneiders + (result.won && result.isSchneider ? 1 : 0),
          timesSchneidered: currentStats.timesSchneidered + (result.wasSchneidered ? 1 : 0),
          leastersPlayed: currentStats.leastersPlayed + (result.wasLeaster ? 1 : 0),
          leastersWon: currentStats.leastersWon + (result.wasLeaster && result.won ? 1 : 0),
          currentWinStreak: result.won ? currentStats.currentWinStreak + 1 : 0,
          bestWinStreak: result.won
            ? Math.max(currentStats.bestWinStreak, currentStats.currentWinStreak + 1)
            : currentStats.bestWinStreak,
          totalPointsWon: currentStats.totalPointsWon + result.playerPoints,
          firstGameDate: currentStats.firstGameDate || now,
          lastGameDate: now,
        };

        // Get the other stats for combined checking
        const otherStats = mode === 'local' ? get().onlineStats : get().localStats;
        const combinedStats = combineStats(newStats, otherStats);

        // Check for newly unlocked achievements
        const newlyUnlocked: string[] = [];
        for (const achievement of ACHIEVEMENTS) {
          if (currentUnlocked.has(achievement.id)) continue;

          // Determine which stats to check based on achievement mode
          const achievementMode = achievement.mode || 'combined';
          let statsToCheck: PlayerStats;

          if (achievementMode === 'combined') {
            statsToCheck = combinedStats;
          } else if (achievementMode === mode) {
            // Achievement is for the current mode
            statsToCheck = newStats;
          } else {
            // Achievement is for the other mode, skip
            continue;
          }

          if (achievement.requirement(statsToCheck)) {
            newlyUnlocked.push(achievement.id);
          }
        }

        // Update state
        const newUnlockedSet = new Set(currentUnlocked);
        newlyUnlocked.forEach(id => newUnlockedSet.add(id));

        if (mode === 'local') {
          set({
            localStats: newStats,
            unlockedAchievements: newUnlockedSet,
            newlyUnlocked,
          });
        } else {
          set({
            onlineStats: newStats,
            unlockedAchievements: newUnlockedSet,
            newlyUnlocked,
          });
        }

        return newlyUnlocked;
      },

      clearNewlyUnlocked: () => {
        set({ newlyUnlocked: [] });
      },

      resetStats: (mode?: StatsMode) => {
        if (mode === 'local') {
          set({ localStats: DEFAULT_STATS });
        } else if (mode === 'online') {
          set({ onlineStats: DEFAULT_STATS });
        } else {
          // Reset all
          set({
            localStats: DEFAULT_STATS,
            onlineStats: DEFAULT_STATS,
            unlockedAchievements: new Set(),
            newlyUnlocked: [],
          });
        }
      },

      getStats: (mode: StatsMode | 'combined') => {
        if (mode === 'local') return get().localStats;
        if (mode === 'online') return get().onlineStats;
        return combineStats(get().localStats, get().onlineStats);
      },

      getWinRate: (mode: StatsMode | 'combined') => {
        const stats = get().getStats(mode);
        if (stats.gamesPlayed === 0) return 0;
        return Math.round((stats.gamesWon / stats.gamesPlayed) * 100);
      },

      getPickerWinRate: (mode: StatsMode | 'combined') => {
        const stats = get().getStats(mode);
        if (stats.timesPicked === 0) return 0;
        return Math.round((stats.pickerWins / stats.timesPicked) * 100);
      },

      getAchievements: () => {
        const unlocked = get().unlockedAchievements;
        return ACHIEVEMENTS.map(a => ({
          ...a,
          unlockedAt: unlocked.has(a.id) ? 1 : null,  // We don't track exact unlock time for simplicity
        }));
      },
    }),
    {
      name: 'sheepshead-stats',
      // Custom serializer to handle Set
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const data = JSON.parse(str);
          // Convert array back to Set
          if (data.state?.unlockedAchievements) {
            data.state.unlockedAchievements = new Set(data.state.unlockedAchievements);
          }
          // Migration: if old 'stats' exists, move to 'localStats'
          if (data.state?.stats && !data.state?.localStats) {
            data.state.localStats = data.state.stats;
            data.state.onlineStats = DEFAULT_STATS;
            delete data.state.stats;
          }
          return data;
        },
        setItem: (name, value) => {
          // Convert Set to array for JSON
          const data = {
            ...value,
            state: {
              ...value.state,
              unlockedAchievements: Array.from(value.state.unlockedAchievements || []),
            },
          };
          localStorage.setItem(name, JSON.stringify(data));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);
