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
          ${small ? 'w-7 h-10 sm:w-9 sm:h-[3.25rem] md:w-10 md:h-14' : 'w-10 h-14 sm:w-12 sm:h-[4.5rem] md:w-16 md:h-24'}
          bg-gradient-to-br from-blue-800 to-blue-900
          rounded-md sm:rounded-lg shadow-lg flex items-center justify-center
          border border-blue-700 sm:border-2
        `}
      >
        <div className={`text-blue-400 ${small ? 'text-[10px] sm:text-xs md:text-sm' : 'text-sm sm:text-base md:text-xl'}`}>&#x1F411;</div>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled && !onClick}
      className={`
        ${small ? 'w-7 h-10 sm:w-9 sm:h-[3.25rem] md:w-10 md:h-14' : 'w-10 h-14 sm:w-12 sm:h-[4.5rem] md:w-16 md:h-24'}
        bg-white rounded-md sm:rounded-lg shadow-lg
        flex flex-col justify-between p-0.5
        transition-all duration-150 relative
        ${isRed ? 'text-red-600' : 'text-gray-800'}
        ${cardIsTrump ? 'ring-1 sm:ring-2 ring-yellow-400' : ''}
        ${selected ? 'ring-2 sm:ring-4 ring-green-400 -translate-y-1 sm:-translate-y-2 scale-105' : ''}
        ${highlight && !disabled ? 'ring-1 sm:ring-2 ring-blue-400' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-xl cursor-pointer active:scale-95'}
        ${onClick && !disabled ? 'hover:-translate-y-1' : ''}
        min-w-[28px] min-h-[40px]
      `}
    >
      <div className={`text-left font-bold ${small ? 'text-[8px] sm:text-[10px] md:text-xs' : 'text-[10px] sm:text-xs md:text-sm'}`}>
        {card.rank}
        <span className="ml-0.5">{SUIT_SYMBOLS[card.suit]}</span>
      </div>
      <div className={`self-center ${small ? 'text-xs sm:text-sm md:text-lg' : 'text-base sm:text-xl md:text-3xl'}`}>
        {SUIT_SYMBOLS[card.suit]}
      </div>
      <div className={`text-right font-bold rotate-180 ${small ? 'text-[8px] sm:text-[10px] md:text-xs' : 'text-[10px] sm:text-xs md:text-sm'}`}>
        {card.rank}
        <span className="ml-0.5">{SUIT_SYMBOLS[card.suit]}</span>
      </div>
      {points > 0 && !small && (
        <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-yellow-400 text-black text-[8px] sm:text-[10px] md:text-xs font-bold rounded-full w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 flex items-center justify-center">
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
        ${small ? 'w-7 h-10 sm:w-9 sm:h-[3.25rem] md:w-10 md:h-14' : 'w-10 h-14 sm:w-12 sm:h-[4.5rem] md:w-16 md:h-24'}
        bg-gradient-to-br from-blue-800 to-blue-900
        rounded-md sm:rounded-lg shadow-lg flex items-center justify-center
        border border-blue-700 sm:border-2
      `}
    >
      <div className={`text-blue-400 ${small ? 'text-[10px] sm:text-xs md:text-sm' : 'text-sm sm:text-base md:text-xl'}`}>&#x1F411;</div>
    </div>
  );
}
