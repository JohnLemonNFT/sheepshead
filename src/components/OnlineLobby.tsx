// Online Lobby - Create or join rooms for online play

import { useState, useEffect } from 'react';
import type { OnlineGameState, OnlineGameActions } from '../hooks/useOnlineGame';

// Use production server if deployed, otherwise localhost
const getDefaultServerUrl = () => {
  if (import.meta.env.VITE_WS_SERVER_URL) {
    return import.meta.env.VITE_WS_SERVER_URL;
  }
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return 'wss://sheepshead.onrender.com';
  }
  return 'ws://localhost:3001';
};
const SERVER_URL = getDefaultServerUrl();

interface OnlineLobbyProps {
  onlineState: OnlineGameState;
  onlineActions: OnlineGameActions;
  onBack: () => void;
}

export function OnlineLobby({ onlineState, onlineActions, onBack }: OnlineLobbyProps) {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState<'choose' | 'join'>('choose');

  const { connected, connecting, error } = onlineState;

  // Auto-connect on mount
  useEffect(() => {
    if (!connected && !connecting) {
      onlineActions.connect(SERVER_URL);
    }
  }, []);

  const handleCreateRoom = () => {
    if (playerName.trim() && connected) {
      onlineActions.createRoom(playerName.trim());
    }
  };

  const handleJoinRoom = () => {
    if (playerName.trim() && roomCode.trim() && connected) {
      onlineActions.joinRoom(roomCode.trim().toUpperCase(), playerName.trim());
    }
  };

  const handleBack = () => {
    if (mode !== 'choose') {
      setMode('choose');
    } else {
      onlineActions.disconnect();
      onBack();
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 text-white">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <header className="text-center mb-8 pt-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Online Play</h1>
          <p className="text-gray-400">
            Play Sheepshead with friends
          </p>
        </header>

        {/* Connection Status - only show if connecting or error */}
        {(connecting || error) && (
          <section className="mb-6">
            <div className={`
              flex items-center justify-center gap-2 p-3 rounded-lg
              ${connecting ? 'bg-yellow-900/30 text-yellow-400' : 'bg-red-900/30 text-red-400'}
            `}>
              {connecting && (
                <>
                  <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                  Connecting to server...
                </>
              )}
              {error && !connecting && (
                <div className="flex justify-between items-center w-full">
                  <span>{error}</span>
                  <button
                    onClick={() => {
                      onlineActions.clearError();
                      onlineActions.connect(SERVER_URL);
                    }}
                    className="text-red-300 hover:text-white underline ml-2"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Main Flow - Show when connected */}
        {connected && mode === 'choose' && (
          <section className="space-y-6">
            {/* Player Name */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                maxLength={20}
                autoFocus
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
              />
            </div>

            {/* Create/Join Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleCreateRoom}
                disabled={!playerName.trim()}
                className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-colors text-lg"
              >
                Create Room
              </button>
              <button
                onClick={() => setMode('join')}
                disabled={!playerName.trim()}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-colors text-lg"
              >
                Join Room
              </button>
            </div>

            {!playerName.trim() && (
              <p className="text-center text-gray-500 text-sm">
                Enter your name to continue
              </p>
            )}
          </section>
        )}

        {/* Join Room Flow */}
        {connected && mode === 'join' && (
          <section className="space-y-4">
            <div className="bg-gray-800 rounded-xl p-6">
              <p className="text-gray-400 mb-4 text-center">
                Joining as <span className="text-white font-medium">{playerName}</span>
              </p>
              <label className="block text-sm text-gray-400 mb-2">
                Room Code
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="ABCD"
                maxLength={4}
                autoFocus
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white text-center text-2xl font-mono tracking-widest uppercase placeholder-gray-500 focus:outline-none focus:border-green-500"
              />
              <button
                onClick={handleJoinRoom}
                disabled={roomCode.length < 4}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-colors"
              >
                Join Room
              </button>
            </div>
          </section>
        )}

        {/* Back Button */}
        <section className="mt-8">
          <button
            onClick={handleBack}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            {mode !== 'choose' ? 'Back' : 'Return to Menu'}
          </button>
        </section>

        {/* Simple instruction */}
        {connected && mode === 'choose' && (
          <p className="mt-6 text-center text-sm text-gray-500">
            Create a room and share the code with friends to play together
          </p>
        )}
      </div>
    </div>
  );
}
