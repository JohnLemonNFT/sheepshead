// Table component - displays the game table with current trick

import { Card as CardType, Trick, PlayerPosition } from '../game/types';
import { Card, CardBack } from './Card';

interface TableProps {
  currentTrick: Trick;
  blind: CardType[];
  trickNumber: number;
  completedTricksCount: number;
  pickerPosition: PlayerPosition | null;
  calledSuit: string | null;
  calledAceRevealed: boolean;
}

// Position players around the table (human at bottom)
const PLAYER_POSITIONS = [
  { label: 'You', position: 'bottom' },
  { label: 'Player 2', position: 'left' },
  { label: 'Player 3', position: 'top-left' },
  { label: 'Player 4', position: 'top-right' },
  { label: 'Player 5', position: 'right' },
];

export function Table({
  currentTrick,
  blind,
  trickNumber,
  completedTricksCount,
  pickerPosition,
  calledSuit,
  calledAceRevealed,
}: TableProps) {
  // Get card played by each position
  const getCardForPosition = (position: number) => {
    const play = currentTrick.cards.find(c => c.playedBy === position);
    return play?.card;
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto aspect-[4/3] bg-green-800/50 rounded-xl p-4">
      {/* Center area - blind or current trick */}
      <div className="absolute inset-0 flex items-center justify-center">
        {blind.length > 0 ? (
          <div className="text-center">
            <p className="text-green-300 text-sm mb-2">Blind</p>
            <div className="flex gap-2">
              {blind.map((_, i) => (
                <CardBack key={i} />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-2 max-w-xs">
            {currentTrick.cards.map((play, i) => (
              <div key={i} className="text-center">
                <Card card={play.card} small />
                <p className="text-xs text-green-300 mt-1">
                  P{play.playedBy + 1}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Player positions around table */}
      {PLAYER_POSITIONS.map((pos, i) => {
        const card = getCardForPosition(i);
        const isPicker = pickerPosition === i;

        return (
          <div
            key={i}
            className={`absolute ${getPositionClasses(pos.position)}`}
          >
            <div className="text-center">
              <span
                className={`text-xs ${
                  isPicker ? 'text-yellow-400 font-bold' : 'text-green-300'
                }`}
              >
                {pos.label}
                {isPicker && ' (P)'}
              </span>
            </div>
          </div>
        );
      })}

      {/* Game info */}
      <div className="absolute top-2 left-2 text-xs text-green-300">
        <p>Trick {trickNumber}/6</p>
        {calledSuit && (
          <p>
            Called: {calledSuit}
            {calledAceRevealed ? ' (revealed)' : ''}
          </p>
        )}
      </div>

      {/* Completed tricks indicator */}
      <div className="absolute top-2 right-2 text-xs text-green-300">
        <p>{completedTricksCount} tricks played</p>
      </div>
    </div>
  );
}

function getPositionClasses(position: string): string {
  switch (position) {
    case 'bottom':
      return 'bottom-2 left-1/2 -translate-x-1/2';
    case 'left':
      return 'left-2 top-1/2 -translate-y-1/2';
    case 'top-left':
      return 'top-2 left-1/4';
    case 'top-right':
      return 'top-2 right-1/4';
    case 'right':
      return 'right-2 top-1/2 -translate-y-1/2';
    default:
      return '';
  }
}
