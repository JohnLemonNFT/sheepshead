// Online Lobby - Connect to server and create/join rooms

import { useState, useEffect } from 'react';
import type { OnlineGameState, OnlineGameActions } from '../hooks/useOnlineGame';

// Use production server if deployed, otherwise localhost
const DEFAULT_SERVER_URL = import.meta.env.VITE_WS_SERVER_URL || 'ws://localhost:3001';

interface OnlineLobbyProps {
  onlineState: OnlineGameState;
  onlineActions: OnlineGameActions;
  onBack: () => void;
}

export function OnlineLobby({ onlineState, onlineActions, onBack }: OnlineLobbyProps) {
  const [serverUrl, setServerUrl] = useState(DEFAULT_SERVER_URL);
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState<'choose' | 'join'>('choose');

  const { connected, connecting, error } = onlineState;

  // Don't auto-connect - let user click Connect after setting URL

  const handleConnect = () => {
    onlineActions.connect(serverUrl);
  };

  const handleCreateRoom = () => {
    if (playerName.trim()) {
      // Ensure connected before creating
      if (!connected) {
        onlineActions.connect(serverUrl);
        // Wait a moment for connection then create
        setTimeout(() => {
          onlineActions.createRoom(playerName.trim());
        }, 500);
      } else {
        onlineActions.createRoom(playerName.trim());
      }
    }
  };

  const handleJoinRoom = () => {
    if (playerName.trim() && roomCode.trim()) {
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
          <h1 className="text-4xl font-bold mb-2">Online Play</h1>
          <p className="text-gray-400">
            Play with friends over the network
          </p>
        </header>

        {/* Connection Status */}
        <section className="mb-6">
          <div className={`
            flex items-center justify-center gap-2 p-3 rounded-lg
            ${connected ? 'bg-green-900/30 text-green-400' :
              connecting ? 'bg-yellow-900/30 text-yellow-400' :
              'bg-gray-800 text-gray-400'}
          `}>
            <div className={`
              w-2 h-2 rounded-full
              ${connected ? 'bg-green-400' :
                connecting ? 'bg-yellow-400 animate-pulse' :
                'bg-gray-500'}
            `} />
            {connected ? 'Connected to server' :
             connecting ? 'Connecting...' :
             'Not connected'}
          </div>
        </section>

        {/* Error Display */}
        {error && (
          <section className="mb-6">
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <p className="text-red-400">{error}</p>
                <button
                  onClick={onlineActions.clearError}
                  className="text-red-400 hover:text-red-300"
                >
                  &times;
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Server Connection - Always show */}
        <section className="mb-8">
          <label className="block text-sm text-gray-400 mb-2">
            Server Address
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder="ws://localhost:3001"
              disabled={connected}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 disabled:opacity-50"
            />
            {!connected ? (
              <button
                onClick={handleConnect}
                disabled={connecting || !serverUrl}
                className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold px-8 py-3 rounded-lg transition-colors text-lg"
              >
                {connecting ? '...' : 'Connect'}
              </button>
            ) : (
              <button
                onClick={() => onlineActions.disconnect()}
                className="bg-gray-600 hover:bg-gray-500 text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Disconnect
              </button>
            )}
          </div>
          {!connected && (
            <p className="text-xs text-yellow-400 mt-2">
              Change the address above, then click Connect
            </p>
          )}
        </section>

        {/* Room Actions - Show when connected */}
        {connected && mode === 'choose' && (
          <section className="space-y-4">
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
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
              />
            </div>

            {/* Create/Join Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleCreateRoom}
                disabled={!playerName.trim()}
                className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-colors"
              >
                Create Room
              </button>
              <button
                onClick={() => setMode('join')}
                disabled={!playerName.trim()}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-colors"
              >
                Join Room
              </button>
            </div>
          </section>
        )}

        {/* Join Room Flow */}
        {connected && mode === 'join' && (
          <section className="space-y-4">
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="text-gray-400 mb-2 text-center">Joining as {playerName}</div>
              <label className="block text-sm text-gray-400 mb-2 mt-4">
                Room Code
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="ABCD"
                maxLength={4}
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

        {/* Instructions */}
        <section className="mt-8 text-center text-sm text-gray-500 space-y-2">
          <p>
            To play with others, start the server and share your room code.
          </p>
          <p>
            For remote play, use ngrok to create a public URL.
          </p>
        </section>
      </div>
    </div>
  );
}
