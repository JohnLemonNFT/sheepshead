// CalledAceIndicator - Prominent display of the called ace or going alone status

import { Suit } from '../game/types';

// Going Alone indicator - shown when picker has no partner
export function GoingAloneIndicator({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: {
      container: 'px-2 py-1.5',
      icon: 'text-xl',
      label: 'text-[10px]',
      status: 'text-xs',
    },
    md: {
      container: 'px-3 py-2',
      icon: 'text-2xl',
      label: 'text-xs',
      status: 'text-sm',
    },
    lg: {
      container: 'px-4 py-3',
      icon: 'text-3xl',
      label: 'text-sm',
      status: 'text-base',
    },
  };

  const classes = sizeClasses[size];

  return (
    <div className={`
      flex items-center gap-2 ${classes.container}
      bg-gradient-to-r from-red-900/90 to-orange-900/90
      border-2 border-red-400/50
      rounded-xl shadow-lg shadow-red-500/20
    `}>
      {/* Solo icon */}
      <div className={`${classes.icon}`}>
        🎯
      </div>

      {/* Label */}
      <div className="flex flex-col">
        <span className={`${classes.label} text-red-300 font-medium uppercase tracking-wide`}>
          Going Alone
        </span>
        <span className={`${classes.status} text-orange-300 font-bold`}>
          No Partner
        </span>
      </div>
    </div>
  );
}

// Compact badge version for going alone
export function GoingAloneBadge() {
  return (
    <div className={`
      inline-flex items-center gap-1.5 px-2.5 py-1.5
      bg-red-800/90 border border-red-500/50
      rounded-lg shadow-md
    `}>
      <span className="text-base">🎯</span>
      <div className="flex flex-col leading-tight">
        <span className="text-[10px] text-red-300 font-medium">SOLO</span>
        <span className="text-[10px] font-bold text-orange-300">Alone</span>
      </div>
    </div>
  );
}

interface CalledAceIndicatorProps {
  suit: Suit;
  revealed: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SUIT_CONFIG: Record<Suit, { symbol: string; color: string; bgColor: string }> = {
  clubs: { symbol: '♣', color: 'text-gray-900', bgColor: 'bg-white' },
  spades: { symbol: '♠', color: 'text-gray-900', bgColor: 'bg-white' },
  hearts: { symbol: '♥', color: 'text-red-600', bgColor: 'bg-white' },
  diamonds: { symbol: '♦', color: 'text-red-600', bgColor: 'bg-white' },
};

export function CalledAceIndicator({ suit, revealed, size = 'md' }: CalledAceIndicatorProps) {
  const config = SUIT_CONFIG[suit];

  const sizeClasses = {
    sm: {
      container: 'px-2 py-1.5',
      card: 'w-8 h-11',
      symbol: 'text-lg',
      rank: 'text-xs',
      label: 'text-[10px]',
    },
    md: {
      container: 'px-3 py-2',
      card: 'w-10 h-14',
      symbol: 'text-xl',
      rank: 'text-sm',
      label: 'text-xs',
    },
    lg: {
      container: 'px-4 py-3',
      card: 'w-12 h-16',
      symbol: 'text-2xl',
      rank: 'text-base',
      label: 'text-sm',
    },
  };

  const classes = sizeClasses[size];

  return (
    <div className={`
      flex items-center gap-2 ${classes.container}
      bg-gradient-to-r from-purple-900/90 to-indigo-900/90
      border-2 border-purple-400/50
      rounded-xl shadow-lg shadow-purple-500/20
      ${!revealed ? 'animate-pulse-slow' : ''}
    `}>
      {/* Mini card visual */}
      <div className={`
        ${classes.card} ${config.bgColor}
        rounded-md shadow-md
        flex flex-col items-center justify-center
        border border-gray-300
        relative overflow-hidden
      `}>
        {/* Card content */}
        <span className={`${classes.rank} font-bold ${config.color} absolute top-0.5 left-1`}>
          A
        </span>
        <span className={`${classes.symbol} ${config.color}`}>
          {config.symbol}
        </span>
        <span className={`${classes.rank} font-bold ${config.color} absolute bottom-0.5 right-1 rotate-180`}>
          A
        </span>
      </div>

      {/* Label */}
      <div className="flex flex-col">
        <span className={`${classes.label} text-purple-300 font-medium uppercase tracking-wide`}>
          Called Ace
        </span>
        <span className={`${classes.label} ${revealed ? 'text-green-400' : 'text-yellow-300'} font-bold`}>
          {revealed ? 'Revealed!' : 'Hidden'}
        </span>
      </div>
    </div>
  );
}

// Compact inline version for tight spaces
export function CalledAceBadge({ suit, revealed }: { suit: Suit; revealed: boolean }) {
  const config = SUIT_CONFIG[suit];

  return (
    <div className={`
      inline-flex items-center gap-1.5 px-2.5 py-1.5
      bg-purple-800/90 border border-purple-500/50
      rounded-lg shadow-md
      ${!revealed ? 'ring-2 ring-purple-400/50 ring-offset-1 ring-offset-transparent animate-pulse-slow' : ''}
    `}>
      {/* Mini card */}
      <div className={`
        w-6 h-8 ${config.bgColor}
        rounded shadow
        flex items-center justify-center
        border border-gray-300
      `}>
        <span className={`text-sm font-bold ${config.color}`}>
          A{config.symbol}
        </span>
      </div>

      {/* Status */}
      <div className="flex flex-col leading-tight">
        <span className="text-[10px] text-purple-300 font-medium">CALLED</span>
        <span className={`text-[10px] font-bold ${revealed ? 'text-green-400' : 'text-yellow-300'}`}>
          {revealed ? 'Found' : 'Secret'}
        </span>
      </div>
    </div>
  );
}
