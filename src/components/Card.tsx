// Card component for displaying playing cards - Premium Edition

import { Card as CardType, isTrump, getCardPoints } from '../game/types';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  faceDown?: boolean;
  highlight?: boolean;
  small?: boolean;
  animate?: 'deal' | 'play' | 'collect' | null;
  animationDelay?: number;
}

const SUIT_SYMBOLS: Record<string, string> = {
  clubs: '♣',
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
};

// Premium suit colors
const SUIT_COLORS: Record<string, { text: string; shadow: string }> = {
  clubs: { text: 'text-slate-800', shadow: 'drop-shadow-sm' },
  spades: { text: 'text-slate-800', shadow: 'drop-shadow-sm' },
  hearts: { text: 'text-rose-600', shadow: 'drop-shadow-sm' },
  diamonds: { text: 'text-rose-600', shadow: 'drop-shadow-sm' },
};

export function Card({
  card,
  onClick,
  selected = false,
  disabled = false,
  faceDown = false,
  highlight = false,
  small = false,
  animate = null,
  animationDelay = 0,
}: CardProps) {
  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  const cardIsTrump = isTrump(card);
  const points = getCardPoints(card);
  const suitColor = SUIT_COLORS[card.suit];

  const sizeClasses = small
    ? 'w-8 h-11 sm:w-10 sm:h-14 md:w-12 md:h-[4.25rem]'
    : 'w-12 h-[4.25rem] sm:w-14 sm:h-[5rem] md:w-[4.5rem] md:h-[6.25rem]';

  const animationClass = animate === 'deal' ? 'animate-cardDeal' :
                         animate === 'play' ? 'animate-cardPlay' :
                         animate === 'collect' ? 'animate-trickCollect' : '';

  if (faceDown) {
    return (
      <div
        className={`
          ${sizeClasses}
          card-back rounded-lg flex items-center justify-center relative overflow-hidden
          ${animationClass}
        `}
        style={{ animationDelay: `${animationDelay}ms` }}
      >
        {/* Decorative pattern */}
        <div className="absolute inset-2 border-2 border-blue-400/30 rounded" />
        <div className="text-blue-300/80 text-lg sm:text-xl md:text-2xl z-10">🐑</div>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled && !onClick}
      className={`
        ${sizeClasses}
        bg-gradient-to-br from-white via-gray-50 to-gray-100
        rounded-lg relative overflow-hidden
        flex flex-col justify-between
        transition-all duration-200
        ${cardIsTrump ? 'card-trump' : 'shadow-lg hover:shadow-xl'}
        ${selected ? 'ring-3 sm:ring-4 ring-green-400 -translate-y-2 sm:-translate-y-3 scale-105 your-turn-glow' : ''}
        ${highlight && !disabled ? 'ring-2 ring-blue-400/70' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed grayscale-[20%]' : 'cursor-pointer hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98]'}
        ${animationClass}
      `}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Card texture overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent pointer-events-none" />

      {/* Inner border */}
      <div className="absolute inset-[3px] sm:inset-1 border border-gray-200/50 rounded pointer-events-none" />

      {/* Top left corner */}
      <div className={`absolute top-0.5 left-1 sm:top-1 sm:left-1.5 flex flex-col items-center ${suitColor.text}`}>
        <span className={`font-bold leading-none ${small ? 'text-[9px] sm:text-[11px]' : 'text-xs sm:text-sm md:text-base'}`}>
          {card.rank}
        </span>
        <span className={`leading-none ${suitColor.shadow} ${small ? 'text-[8px] sm:text-[10px]' : 'text-[10px] sm:text-xs md:text-sm'}`}>
          {SUIT_SYMBOLS[card.suit]}
        </span>
      </div>

      {/* Center suit - large */}
      <div className={`absolute inset-0 flex items-center justify-center ${suitColor.text} ${suitColor.shadow}`}>
        <span className={`${small ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-4xl md:text-5xl'} opacity-90`}>
          {SUIT_SYMBOLS[card.suit]}
        </span>
      </div>

      {/* Bottom right corner (rotated) */}
      <div className={`absolute bottom-0.5 right-1 sm:bottom-1 sm:right-1.5 flex flex-col items-center rotate-180 ${suitColor.text}`}>
        <span className={`font-bold leading-none ${small ? 'text-[9px] sm:text-[11px]' : 'text-xs sm:text-sm md:text-base'}`}>
          {card.rank}
        </span>
        <span className={`leading-none ${suitColor.shadow} ${small ? 'text-[8px] sm:text-[10px]' : 'text-[10px] sm:text-xs md:text-sm'}`}>
          {SUIT_SYMBOLS[card.suit]}
        </span>
      </div>

      {/* Trump indicator */}
      {cardIsTrump && (
        <div className="absolute top-0 right-0 w-0 h-0 border-t-[12px] sm:border-t-[16px] border-t-yellow-400 border-l-[12px] sm:border-l-[16px] border-l-transparent" />
      )}

      {/* Point value badge */}
      {points > 0 && !small && (
        <div className="absolute -top-2 -right-2 sm:-top-2.5 sm:-right-2.5 bg-gradient-to-br from-amber-400 to-amber-600 text-black text-xs sm:text-sm font-black rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center shadow-lg border-2 border-white/80">
          {points}
        </div>
      )}
    </button>
  );
}

export function CardBack({ small = false, animate = null, animationDelay = 0 }: {
  small?: boolean;
  animate?: 'deal' | 'play' | 'collect' | null;
  animationDelay?: number;
}) {
  const sizeClasses = small
    ? 'w-8 h-11 sm:w-10 sm:h-14 md:w-12 md:h-[4.25rem]'
    : 'w-12 h-[4.25rem] sm:w-14 sm:h-[5rem] md:w-[4.5rem] md:h-[6.25rem]';

  const animationClass = animate === 'deal' ? 'animate-cardDeal' :
                         animate === 'play' ? 'animate-cardPlay' :
                         animate === 'collect' ? 'animate-trickCollect' : '';

  return (
    <div
      className={`
        ${sizeClasses}
        card-back rounded-lg flex items-center justify-center relative overflow-hidden
        ${animationClass}
      `}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Decorative inner border */}
      <div className="absolute inset-1.5 sm:inset-2 border-2 border-blue-400/30 rounded" />
      {/* Sheep logo */}
      <div className="text-blue-300/90 text-base sm:text-lg md:text-2xl z-10 drop-shadow">🐑</div>
    </div>
  );
}
