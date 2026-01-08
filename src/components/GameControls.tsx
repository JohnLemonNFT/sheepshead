// GameControls component - action buttons for game phases

import { Suit, GamePhase } from '../game/types';
import { PhaseHelp, FirstTimeHelp } from './PhaseHelp';

interface GameControlsProps {
  phase: GamePhase;
  isHumanTurn: boolean;
  onPick: () => void;
  onPass: () => void;
  onCrack?: () => void;
  onRecrack?: () => void;
  onNoCrack?: () => void;
  onBlitz?: () => void;
  onBury: () => void;
  onCallAce: (suit: Suit) => void;
  onGoAlone: () => void;
  onNewGame: () => void;
  onPlayAgain: () => void;
  callableSuits: Suit[];
  canBury: boolean;
  buryReason?: string;
  selectedCount: number;
  // Variant props
  canBlitz?: boolean;
  isCracked?: boolean;
  isPicker?: boolean;
  multiplier?: number;
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
  onCrack,
  onRecrack,
  onNoCrack,
  onBlitz,
  onBury,
  onCallAce,
  onGoAlone,
  onNewGame,
  onPlayAgain,
  callableSuits,
  canBury,
  buryReason,
  selectedCount,
  canBlitz,
  isCracked,
  isPicker,
  multiplier = 1,
}: GameControlsProps) {
  // Multiplier display
  const MultiplierBadge = () => multiplier > 1 ? (
    <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
      {multiplier}x Stakes
    </div>
  ) : null;

  // Cracking phase
  if (phase === 'cracking' && isHumanTurn) {
    // Picker deciding on recrack
    if (isPicker && isCracked) {
      return (
        <div className="flex flex-col items-center gap-2 sm:gap-3">
          <MultiplierBadge />
          <div className="flex items-center gap-2">
            <p className="text-sm sm:text-base md:text-lg text-yellow-300">You've been cracked!</p>
          </div>
          <p className="text-xs text-gray-400">Re-crack to double the stakes again?</p>
          <div className="flex gap-2 sm:gap-3 md:gap-4">
            <button
              onClick={onRecrack}
              className="bg-red-500 hover:bg-red-400 active:bg-red-600 text-white font-bold py-2.5 px-5 sm:py-3 sm:px-6 md:px-8 rounded-lg text-sm sm:text-base md:text-lg transition-colors min-h-[44px]"
            >
              Re-crack! ({multiplier * 2}x)
            </button>
            <button
              onClick={onNoCrack}
              className="bg-gray-600 hover:bg-gray-500 active:bg-gray-700 text-white font-bold py-2.5 px-5 sm:py-3 sm:px-6 md:px-8 rounded-lg text-sm sm:text-base md:text-lg transition-colors min-h-[44px]"
            >
              Accept Crack
            </button>
          </div>
        </div>
      );
    }

    // Defender deciding whether to crack
    return (
      <div className="flex flex-col items-center gap-2 sm:gap-3">
        <MultiplierBadge />
        <div className="flex items-center gap-2">
          <p className="text-sm sm:text-base md:text-lg">Double the stakes?</p>
        </div>
        <p className="text-xs text-gray-400">Crack if you have a strong hand</p>
        <div className="flex gap-2 sm:gap-3 md:gap-4">
          <button
            onClick={onCrack}
            className="bg-red-500 hover:bg-red-400 active:bg-red-600 text-white font-bold py-2.5 px-5 sm:py-3 sm:px-6 md:px-8 rounded-lg text-sm sm:text-base md:text-lg transition-colors min-h-[44px]"
          >
            Crack! (2x)
          </button>
          <button
            onClick={onNoCrack}
            className="bg-gray-600 hover:bg-gray-500 active:bg-gray-700 text-white font-bold py-2.5 px-5 sm:py-3 sm:px-6 md:px-8 rounded-lg text-sm sm:text-base md:text-lg transition-colors min-h-[44px]"
          >
            Pass
          </button>
        </div>
      </div>
    );
  }

  // Picking phase
  if (phase === 'picking' && isHumanTurn) {
    return (
      <div className="flex flex-col items-center gap-2 sm:gap-3">
        <FirstTimeHelp phase="picking" />
        <div className="flex items-center gap-2">
          <p className="text-sm sm:text-base md:text-lg">Pick up the blind?</p>
          <PhaseHelp phase={phase} isHumanTurn={isHumanTurn} />
        </div>
        <p className="text-xs text-gray-400">Take 2 bonus cards and become the picker</p>
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
        <MultiplierBadge />
        <FirstTimeHelp phase="burying" />
        <div className="flex items-center gap-2">
          <p className="text-sm sm:text-base md:text-lg">Select 2 cards to bury ({selectedCount}/2)</p>
          <PhaseHelp phase={phase} isHumanTurn={isHumanTurn} />
        </div>
        <p className="text-xs text-gray-400">These points count for your team</p>
        {buryReason && (
          <p className="text-red-400 text-xs sm:text-sm">{buryReason}</p>
        )}
        <div className="flex gap-2 sm:gap-3 md:gap-4 flex-wrap justify-center">
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
          {canBlitz && (
            <button
              onClick={onBlitz}
              className="bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-bold py-2.5 px-4 sm:px-6 rounded-lg text-xs sm:text-sm md:text-base transition-colors min-h-[44px] animate-pulse"
              title="You have both black queens! Double the stakes!"
            >
              Blitz! (2x) Q♣Q♠
            </button>
          )}
        </div>
      </div>
    );
  }

  // Calling phase
  if (phase === 'calling' && isHumanTurn) {
    return (
      <div className="flex flex-col items-center gap-2 sm:gap-3">
        <FirstTimeHelp phase="calling" />
        <div className="flex items-center gap-2">
          <p className="text-sm sm:text-base md:text-lg">Call an ace for your partner</p>
          <PhaseHelp phase={phase} isHumanTurn={isHumanTurn} />
        </div>
        <p className="text-xs text-gray-400">Whoever has this ace is your secret teammate</p>
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
          Go Alone (No Partner)
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
