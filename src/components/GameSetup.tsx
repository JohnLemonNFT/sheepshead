// Game Setup - Configure players before starting a game

import { useGameStore, DEFAULT_PLAYER_TYPES } from '../store/gameStore';
import { PlayerType } from '../game/types';
import { getPlayerName } from './PlayerAvatar';

interface PlayerRowProps {
  position: number;
  type: PlayerType;
  onToggle: () => void;
}

function PlayerRow({ position, type, onToggle }: PlayerRowProps) {
  const isHuman = type === 'human';
  const playerName = getPlayerName(position);

  return (
    <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-xl">
          {position === 0 ? '👤' : `P${position + 1}`}
        </div>
        <div>
          <div className="font-medium text-white">{playerName}</div>
          <div className="text-xs text-gray-500">
            {position === 0 ? 'Seat 1 (First position)' : `Seat ${position + 1}`}
          </div>
        </div>
      </div>

      <div className="flex gap-1">
        <button
          onClick={onToggle}
          className={`
            px-4 py-2 rounded-l-lg font-medium text-sm transition-colors
            ${isHuman
              ? 'bg-green-600 text-white'
              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }
          `}
        >
          Human
        </button>
        <button
          onClick={onToggle}
          className={`
            px-4 py-2 rounded-r-lg font-medium text-sm transition-colors
            ${!isHuman
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }
          `}
        >
          AI
        </button>
      </div>
    </div>
  );
}

export function GameSetup() {
  const { playerTypes, setPlayerTypes, startGame, goToHome } = useGameStore();

  const humanCount = playerTypes.filter(t => t === 'human').length;
  const aiCount = playerTypes.filter(t => t === 'ai').length;

  const handleToggle = (position: number) => {
    const newTypes = [...playerTypes] as PlayerType[];
    newTypes[position] = newTypes[position] === 'human' ? 'ai' : 'human';

    // Ensure at least one human
    if (newTypes.filter(t => t === 'human').length === 0) {
      return; // Don't allow all AI
    }

    setPlayerTypes(newTypes);
  };

  const handleReset = () => {
    setPlayerTypes([...DEFAULT_PLAYER_TYPES]);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 text-white">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8 pt-8">
          <h1 className="text-4xl font-bold mb-2">Game Setup</h1>
          <p className="text-gray-400">
            Choose which seats are human players or AI
          </p>
        </header>

        {/* Player Configuration */}
        <section className="mb-8">
          <div className="space-y-3">
            {playerTypes.map((type, i) => (
              <PlayerRow
                key={i}
                position={i}
                type={type}
                onToggle={() => handleToggle(i)}
              />
            ))}
          </div>
        </section>

        {/* Summary */}
        <section className="mb-8 bg-gray-800/50 rounded-xl p-4">
          <div className="flex justify-center gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-green-400">{humanCount}</div>
              <div className="text-sm text-gray-400">Human{humanCount !== 1 ? 's' : ''}</div>
            </div>
            <div className="w-px bg-gray-700" />
            <div>
              <div className="text-3xl font-bold text-blue-400">{aiCount}</div>
              <div className="text-sm text-gray-400">AI</div>
            </div>
          </div>

          {humanCount >= 2 && (
            <div className="mt-4 text-center text-sm text-yellow-400 bg-yellow-900/30 rounded-lg p-2">
              Hotseat mode: Players will take turns on this device
            </div>
          )}
        </section>

        {/* Actions */}
        <section className="space-y-3">
          <button
            onClick={startGame}
            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-6 rounded-xl transition-colors text-lg"
          >
            Start Game
          </button>

          <div className="flex gap-3">
            <button
              onClick={goToHome}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleReset}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Reset to Default
            </button>
          </div>
        </section>

        {/* Info */}
        <section className="mt-8 text-center text-sm text-gray-500">
          <p>
            In hotseat mode, a handoff screen will appear between human turns
            to keep each player's cards secret.
          </p>
        </section>
      </div>
    </div>
  );
}
