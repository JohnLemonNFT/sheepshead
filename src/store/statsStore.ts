// ============================================
// PLAYER STATS & ACHIEVEMENTS STORE
// ============================================
// Local storage persistence for player progression

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================
// TYPES
// ============================================

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
}

// ============================================
// ACHIEVEMENT DEFINITIONS
// ============================================

export const ACHIEVEMENTS: Omit<Achievement, 'unlockedAt'>[] = [
  // Getting started
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

  // Games played milestones
  {
    id: 'games_10',
    name: 'Getting Started',
    description: 'Play 10 games',
    icon: '🃏',
    requirement: (s) => s.gamesPlayed >= 10,
  },
  {
    id: 'games_50',
    name: 'Regular',
    description: 'Play 50 games',
    icon: '🎯',
    requirement: (s) => s.gamesPlayed >= 50,
  },
  {
    id: 'games_100',
    name: 'Veteran',
    description: 'Play 100 games',
    icon: '⭐',
    requirement: (s) => s.gamesPlayed >= 100,
  },
  {
    id: 'games_500',
    name: 'Sheepshead Master',
    description: 'Play 500 games',
    icon: '👑',
    requirement: (s) => s.gamesPlayed >= 500,
  },

  // Win milestones
  {
    id: 'wins_10',
    name: 'On a Roll',
    description: 'Win 10 games',
    icon: '🔥',
    requirement: (s) => s.gamesWon >= 10,
  },
  {
    id: 'wins_50',
    name: 'Champion',
    description: 'Win 50 games',
    icon: '🏅',
    requirement: (s) => s.gamesWon >= 50,
  },
  {
    id: 'wins_100',
    name: 'Legend',
    description: 'Win 100 games',
    icon: '🌟',
    requirement: (s) => s.gamesWon >= 100,
  },

  // Picker achievements
  {
    id: 'picker_10',
    name: 'Risk Taker',
    description: 'Pick up the blind 10 times',
    icon: '🎲',
    requirement: (s) => s.timesPicked >= 10,
  },
  {
    id: 'picker_wins_10',
    name: "Picker's Instinct",
    description: 'Win 10 games as picker',
    icon: '🧠',
    requirement: (s) => s.pickerWins >= 10,
  },
  {
    id: 'picker_50',
    name: 'Bold Player',
    description: 'Pick up the blind 50 times',
    icon: '💪',
    requirement: (s) => s.timesPicked >= 50,
  },

  // Special outcomes
  {
    id: 'first_schneider',
    name: 'Schneider!',
    description: 'Win a game by 30+ points',
    icon: '💥',
    requirement: (s) => s.schneiders >= 1,
  },
  {
    id: 'schneider_5',
    name: 'Crushing It',
    description: 'Schneider opponents 5 times',
    icon: '⚡',
    requirement: (s) => s.schneiders >= 5,
  },
  {
    id: 'leaster_win',
    name: 'Leaster Master',
    description: 'Win a leaster',
    icon: '🐑',
    requirement: (s) => s.leastersWon >= 1,
  },
  {
    id: 'leaster_wins_5',
    name: 'Reverse Psychology',
    description: 'Win 5 leasters',
    icon: '🔄',
    requirement: (s) => s.leastersWon >= 5,
  },

  // Streaks
  {
    id: 'streak_3',
    name: 'Hot Streak',
    description: 'Win 3 games in a row',
    icon: '🔥',
    requirement: (s) => s.bestWinStreak >= 3,
  },
  {
    id: 'streak_5',
    name: 'Unstoppable',
    description: 'Win 5 games in a row',
    icon: '🚀',
    requirement: (s) => s.bestWinStreak >= 5,
  },
  {
    id: 'streak_10',
    name: 'Dominant',
    description: 'Win 10 games in a row',
    icon: '👊',
    requirement: (s) => s.bestWinStreak >= 10,
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
  stats: PlayerStats;
  unlockedAchievements: Set<string>;
  newlyUnlocked: string[];  // IDs of achievements just unlocked (for notifications)

  // Actions
  recordGameResult: (result: GameResult) => string[];  // Returns newly unlocked achievement IDs
  clearNewlyUnlocked: () => void;
  resetStats: () => void;

  // Computed
  getWinRate: () => number;
  getPickerWinRate: () => number;
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

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useStatsStore = create<StatsState>()(
  persist(
    (set, get) => ({
      stats: DEFAULT_STATS,
      unlockedAchievements: new Set<string>(),
      newlyUnlocked: [],

      recordGameResult: (result: GameResult) => {
        const currentStats = get().stats;
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

        // Check for newly unlocked achievements
        const newlyUnlocked: string[] = [];
        for (const achievement of ACHIEVEMENTS) {
          if (!currentUnlocked.has(achievement.id) && achievement.requirement(newStats)) {
            newlyUnlocked.push(achievement.id);
          }
        }

        // Update state
        const newUnlockedSet = new Set(currentUnlocked);
        newlyUnlocked.forEach(id => newUnlockedSet.add(id));

        set({
          stats: newStats,
          unlockedAchievements: newUnlockedSet,
          newlyUnlocked,
        });

        return newlyUnlocked;
      },

      clearNewlyUnlocked: () => {
        set({ newlyUnlocked: [] });
      },

      resetStats: () => {
        set({
          stats: DEFAULT_STATS,
          unlockedAchievements: new Set(),
          newlyUnlocked: [],
        });
      },

      getWinRate: () => {
        const { gamesPlayed, gamesWon } = get().stats;
        if (gamesPlayed === 0) return 0;
        return Math.round((gamesWon / gamesPlayed) * 100);
      },

      getPickerWinRate: () => {
        const { timesPicked, pickerWins } = get().stats;
        if (timesPicked === 0) return 0;
        return Math.round((pickerWins / timesPicked) * 100);
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
