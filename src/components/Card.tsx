// Card component for displaying playing cards

import { Card as CardType, isTrump, getCardPoints } from '../game/types';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  faceDown?: boolean;
  highlight?: boolean;
  small?: boolean;
}

const SUIT_SYMBOLS: Record<string, string> = {
  clubs: '♣',
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
};

export function Card({
  card,
  onClick,
  selected = false,
  disabled = false,
  faceDown = false,
  highlight = false,
  small = false,
}: CardProps) {
  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  const cardIsTrump = isTrump(card);
  const points = getCardPoints(card);

  if (faceDown) {
    return (
      <div
        className={`
          ${small ? 'w-8 h-12 sm:w-10 sm:h-14' : 'w-12 h-18 sm:w-16 sm:h-24'}
          bg-gradient-to-br from-blue-800 to-blue-900
          rounded-lg shadow-lg flex items-center justify-center
          border-2 border-blue-700
        `}
      >
        <div className={`text-blue-400 ${small ? 'text-xs sm:text-sm' : 'text-base sm:text-xl'}`}>🐑</div>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled && !onClick}
      className={`
        ${small ? 'w-8 h-12 sm:w-10 sm:h-14 text-xs' : 'w-12 h-18 sm:w-16 sm:h-24'}
        bg-white rounded-lg shadow-lg
        flex flex-col justify-between p-0.5 sm:p-1
        transition-all duration-150 relative
        ${isRed ? 'text-red-600' : 'text-gray-800'}
        ${cardIsTrump ? 'ring-2 ring-yellow-400' : ''}
        ${selected ? 'ring-4 ring-green-400 -translate-y-2 scale-105' : ''}
        ${highlight && !disabled ? 'ring-2 ring-blue-400' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-xl cursor-pointer'}
        ${onClick && !disabled ? 'hover:-translate-y-1' : ''}
      `}
    >
      <div className={`text-left font-bold ${small ? 'text-[10px] sm:text-xs' : 'text-xs sm:text-sm'}`}>
        {card.rank}
        <span className="ml-0.5">{SUIT_SYMBOLS[card.suit]}</span>
      </div>
      <div className={`self-center ${small ? 'text-sm sm:text-lg' : 'text-xl sm:text-3xl'}`}>
        {SUIT_SYMBOLS[card.suit]}
      </div>
      <div className={`text-right font-bold rotate-180 ${small ? 'text-[10px] sm:text-xs' : 'text-xs sm:text-sm'}`}>
        {card.rank}
        <span className="ml-0.5">{SUIT_SYMBOLS[card.suit]}</span>
      </div>
      {points > 0 && !small && (
        <div className="absolute -top-1 -right-1 bg-yellow-400 text-black text-[10px] sm:text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
          {points}
        </div>
      )}
    </button>
  );
}

export function CardBack({ small = false }: { small?: boolean }) {
  return (
    <div
      className={`
        ${small ? 'w-8 h-12 sm:w-10 sm:h-14' : 'w-12 h-18 sm:w-16 sm:h-24'}
        bg-gradient-to-br from-blue-800 to-blue-900
        rounded-lg shadow-lg flex items-center justify-center
        border-2 border-blue-700
      `}
    >
      <div className={`text-blue-400 ${small ? 'text-xs sm:text-sm' : 'text-base sm:text-xl'}`}>🐑</div>
    </div>
  );
}
