'use client';

// Player Handoff - Pass the device screen for hotseat multiplayer

import { useGameStore } from '../store/gameStore';
import { getPlayerName } from './PlayerAvatar';

export function PlayerHandoff() {
  const { gameState, confirmHandoff } = useGameStore();
  const { currentPlayer, phase, trickNumber } = gameState;

  const playerName = getPlayerName(currentPlayer);

  // Describe what action the player needs to take
  const getActionDescription = () => {
    switch (phase) {
      case 'picking':
        return 'decide whether to pick or pass';
      case 'burying':
        return 'bury 2 cards';
      case 'calling':
        return 'call a partner';
      case 'playing':
        return `play a card (Trick ${trickNumber})`;
      default:
        return 'take your turn';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Card back decoration */}
        <div className="text-8xl mb-6 opacity-50">🎴</div>

        {/* Main message */}
        <h1 className="text-3xl font-bold text-white mb-2">
          Pass device to
        </h1>
        <h2 className="text-4xl font-bold text-green-400 mb-6">
          {playerName}
        </h2>

        {/* Phase info */}
        <div className="bg-gray-800/50 rounded-lg p-4 mb-8">
          <p className="text-gray-300">
            It's your turn to <span className="text-white font-medium">{getActionDescription()}</span>
          </p>
        </div>

        {/* Ready button */}
        <button
          onClick={confirmHandoff}
          className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 text-xl"
        >
          I'm Ready - Show My Hand
        </button>

        {/* Privacy reminder */}
        <p className="mt-6 text-sm text-gray-500">
          Make sure other players aren't looking at the screen
        </p>
      </div>
    </div>
  );
}
