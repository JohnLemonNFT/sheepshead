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
      <div className="flex flex-col items-center gap-4">
        <p className="text-lg">Pick up the blind?</p>
        <div className="flex gap-4">
          <button
            onClick={onPick}
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-8 rounded-lg text-lg transition-colors"
          >
            Pick
          </button>
          <button
            onClick={onPass}
            className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
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
      <div className="flex flex-col items-center gap-4">
        <p className="text-lg">Select 2 cards to bury ({selectedCount}/2)</p>
        {buryReason && (
          <p className="text-red-400 text-sm">{buryReason}</p>
        )}
        <button
          onClick={onBury}
          disabled={!canBury}
          className={`
            font-bold py-3 px-8 rounded-lg text-lg transition-colors
            ${canBury
              ? 'bg-green-500 hover:bg-green-400 text-black'
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
      <div className="flex flex-col items-center gap-4">
        <p className="text-lg">Call an ace for your partner</p>
        <div className="flex gap-3 flex-wrap justify-center">
          {callableSuits.map(suit => (
            <button
              key={suit}
              onClick={() => onCallAce(suit)}
              className="bg-white hover:bg-gray-100 text-black font-bold py-3 px-6 rounded-lg text-lg transition-colors flex items-center gap-2"
            >
              <span className={SUIT_DISPLAY[suit].color}>
                {SUIT_DISPLAY[suit].symbol}
              </span>
              {suit.charAt(0).toUpperCase() + suit.slice(1)}
            </button>
          ))}
        </div>
        <button
          onClick={onGoAlone}
          className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-6 rounded-lg transition-colors"
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
        <p className="text-lg text-yellow-300">Your turn - select a card to play</p>
      </div>
    );
  }

  // Scoring phase
  if (phase === 'scoring') {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-4">
          <button
            onClick={onPlayAgain}
            className="bg-green-500 hover:bg-green-400 text-black font-bold py-3 px-8 rounded-lg text-lg transition-colors"
          >
            Next Hand
          </button>
          <button
            onClick={onNewGame}
            className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
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
        <p className="text-green-300 animate-pulse">Thinking...</p>
      </div>
    );
  }

  return null;
}
