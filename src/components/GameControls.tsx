// GameControls component - action buttons for game phases

import { Suit, GamePhase } from '../game/types';

interface GameControlsProps {
  phase: GamePhase;
  isHumanTurn: boolean;
  onPick: () => void;
  onPass: () => void;
  onBury: () => void;
  onCallAce: (suit: Suit) => void;
  onGoAlone: () => void;
  onNewGame: () => void;
  onPlayAgain: () => void;
  callableSuits: Suit[];
  canBury: boolean;
  buryReason?: string;
  selectedCount: number;
}

const SUIT_DISPLAY: Record<Suit, { symbol: string; color: string }> = {
  clubs: { symbol: '♣', color: 'text-gray-800' },
  spades: { symbol: '♠', color: 'text-gray-800' },
  hearts: { symbol: '♥', color: 'text-red-600' },
  diamonds: { symbol: '♦', color: 'text-red-600' },
};

export function GameControls({
  phase,
  isHumanTurn,
  onPick,
  onPass,
  onBury,
  onCallAce,
  onGoAlone,
  onNewGame,
  onPlayAgain,
  callableSuits,
  canBury,
  buryReason,
  selectedCount,
}: GameControlsProps) {
  // Picking phase
  if (phase === 'picking' && isHumanTurn) {
    return (
      <div className="flex flex-col items-center gap-2 sm:gap-3">
        <p className="text-sm sm:text-base md:text-lg">Pick up the blind?</p>
        <div className="flex gap-2 sm:gap-3 md:gap-4">
          <button
            onClick={onPick}
            className="bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-600 text-black font-bold py-2.5 px-5 sm:py-3 sm:px-6 md:px-8 rounded-lg text-sm sm:text-base md:text-lg transition-colors min-h-[44px] min-w-[80px]"
          >
            Pick
          </button>
          <button
            onClick={onPass}
            className="bg-gray-600 hover:bg-gray-500 active:bg-gray-700 text-white font-bold py-2.5 px-5 sm:py-3 sm:px-6 md:px-8 rounded-lg text-sm sm:text-base md:text-lg transition-colors min-h-[44px] min-w-[80px]"
          >
            Pass
          </button>
        </div>
      </div>
    );
  }

  // Burying phase
  if (phase === 'burying' && isHumanTurn) {
    return (
      <div className="flex flex-col items-center gap-2 sm:gap-3">
        <p className="text-sm sm:text-base md:text-lg">Select 2 cards to bury ({selectedCount}/2)</p>
        {buryReason && (
          <p className="text-red-400 text-xs sm:text-sm">{buryReason}</p>
        )}
        <button
          onClick={onBury}
          disabled={!canBury}
          className={`
            font-bold py-2.5 px-5 sm:py-3 sm:px-6 md:px-8 rounded-lg text-sm sm:text-base md:text-lg transition-colors min-h-[44px]
            ${canBury
              ? 'bg-green-500 hover:bg-green-400 active:bg-green-600 text-black'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          Bury Selected
        </button>
      </div>
    );
  }

  // Calling phase
  if (phase === 'calling' && isHumanTurn) {
    return (
      <div className="flex flex-col items-center gap-2 sm:gap-3">
        <p className="text-sm sm:text-base md:text-lg">Call an ace for your partner</p>
        <div className="flex gap-1.5 sm:gap-2 md:gap-3 flex-wrap justify-center">
          {callableSuits.map(suit => (
            <button
              key={suit}
              onClick={() => onCallAce(suit)}
              className="bg-white hover:bg-gray-100 active:bg-gray-200 text-black font-bold py-2.5 px-3 sm:py-3 sm:px-4 md:px-6 rounded-lg text-sm sm:text-base md:text-lg transition-colors flex items-center gap-1 sm:gap-2 min-h-[44px] min-w-[44px]"
            >
              <span className={SUIT_DISPLAY[suit].color}>
                {SUIT_DISPLAY[suit].symbol}
              </span>
              <span className="hidden sm:inline">{suit.charAt(0).toUpperCase() + suit.slice(1)}</span>
            </button>
          ))}
        </div>
        <button
          onClick={onGoAlone}
          className="bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-bold py-2.5 px-4 sm:px-6 rounded-lg text-xs sm:text-sm md:text-base transition-colors min-h-[44px]"
        >
          Go Alone
        </button>
      </div>
    );
  }

  // Playing phase message
  if (phase === 'playing' && isHumanTurn) {
    return (
      <div className="text-center">
        <p className="text-sm sm:text-base md:text-lg text-yellow-300">Your turn - tap a card to play</p>
      </div>
    );
  }

  // Scoring phase
  if (phase === 'scoring') {
    return (
      <div className="flex flex-col items-center gap-2 sm:gap-3">
        <div className="flex gap-2 sm:gap-3 md:gap-4 flex-wrap justify-center">
          <button
            onClick={onPlayAgain}
            className="bg-green-500 hover:bg-green-400 active:bg-green-600 text-black font-bold py-2.5 px-4 sm:py-3 sm:px-6 md:px-8 rounded-lg text-sm sm:text-base md:text-lg transition-colors min-h-[44px]"
          >
            Next Hand
          </button>
          <button
            onClick={onNewGame}
            className="bg-blue-500 hover:bg-blue-400 active:bg-blue-600 text-white font-bold py-2.5 px-4 sm:py-3 sm:px-6 md:px-8 rounded-lg text-sm sm:text-base md:text-lg transition-colors min-h-[44px]"
          >
            New Game
          </button>
        </div>
      </div>
    );
  }

  // Waiting for opponent (scoring already handled above, dealing/gameOver don't need message)
  if (!isHumanTurn && phase !== 'dealing' && phase !== 'gameOver') {
    return (
      <div className="text-center">
        <p className="text-green-300 animate-pulse text-sm sm:text-base">Thinking...</p>
      </div>
    );
  }

  return null;
}
