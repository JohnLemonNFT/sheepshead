// Online Lobby - Create or join rooms for online play

import { useState, useEffect } from 'react';
import type { OnlineGameState, OnlineGameActions, RoomSettings, PublicRoomInfo } from '../hooks/useOnlineGame';
import { useGameStore, NoPickRule, PartnerVariant } from '../store/gameStore';

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
  const [mode, setMode] = useState<'choose' | 'create' | 'join' | 'browse'>('choose');
  const [isPublic, setIsPublic] = useState(false);
  const { gameSettings, updateSettings } = useGameStore();

  const { connected, connecting, error, publicRooms } = onlineState;

  // Auto-connect on mount
  useEffect(() => {
    if (!connected && !connecting) {
      onlineActions.connect(SERVER_URL);
    }
  }, []);

  const handleCreateRoom = () => {
    if (playerName.trim() && connected) {
      const settings: RoomSettings = {
        partnerVariant: gameSettings.partnerVariant,
        noPickRule: gameSettings.noPickRule,
      };
      onlineActions.createRoom(playerName.trim(), isPublic, settings);
    }
  };

  const handleBrowseRooms = () => {
    setMode('browse');
    onlineActions.listPublicRooms();
  };

  const handleJoinPublicRoom = (room: PublicRoomInfo) => {
    if (playerName.trim() && connected) {
      onlineActions.joinRoom(room.code, playerName.trim());
    }
  };

  const refreshPublicRooms = () => {
    onlineActions.listPublicRooms();
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
    <div className="min-h-screen p-3 sm:p-4 md:p-8 text-white">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <header className="text-center mb-6 sm:mb-8 pt-4 sm:pt-6 md:pt-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Online Play</h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Play Sheepshead with friends
          </p>
        </header>

        {/* Connection Status - only show if connecting or error */}
        {(connecting || error) && (
          <section className="mb-4 sm:mb-6">
            <div className={`
              flex items-center justify-center gap-2 p-2 sm:p-3 rounded-lg text-sm sm:text-base
              ${connecting ? 'bg-yellow-900/30 text-yellow-400' : 'bg-red-900/30 text-red-400'}
            `}>
              {connecting && (
                <>
                  <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                  Connecting to server...
                </>
              )}
              {error && !connecting && (
                <div className="flex justify-between items-center w-full gap-2">
                  <span className="text-xs sm:text-sm">{error}</span>
                  <button
                    onClick={() => {
                      onlineActions.clearError();
                      onlineActions.connect(SERVER_URL);
                    }}
                    className="text-red-300 hover:text-white underline text-sm min-h-[44px] px-2"
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
          <section className="space-y-4 sm:space-y-6">
            {/* Player Name */}
            <div>
              <label className="block text-xs sm:text-sm text-gray-400 mb-1.5 sm:mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value.slice(0, 12))}
                placeholder="Enter your name"
                maxLength={12}
                autoFocus
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 text-sm sm:text-base min-h-[44px]"
              />
              <p className="text-xs text-gray-500 mt-1 text-right">{playerName.length}/12</p>
            </div>

            {/* Create/Join Buttons */}
            <div className="space-y-2 sm:space-y-3">
              <button
                onClick={() => setMode('create')}
                disabled={!playerName.trim()}
                className="w-full bg-green-600 hover:bg-green-500 active:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-colors text-base sm:text-lg min-h-[48px]"
              >
                Create Room
              </button>
              <button
                onClick={handleBrowseRooms}
                disabled={!playerName.trim()}
                className="w-full bg-purple-600 hover:bg-purple-500 active:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-colors text-base sm:text-lg min-h-[48px]"
              >
                Browse Public Games
              </button>
              <button
                onClick={() => setMode('join')}
                disabled={!playerName.trim()}
                className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-colors text-base sm:text-lg min-h-[48px]"
              >
                Join with Code
              </button>
            </div>

            {!playerName.trim() && (
              <p className="text-center text-gray-500 text-xs sm:text-sm">
                Enter your name to continue
              </p>
            )}
          </section>
        )}

        {/* Create Room Flow - Pick Rules */}
        {connected && mode === 'create' && (
          <section className="space-y-4 sm:space-y-5">
            <div className="bg-gray-800 rounded-xl p-4 sm:p-5">
              <p className="text-gray-400 mb-4 text-center text-sm sm:text-base">
                Creating room as <span className="text-white font-medium">{playerName}</span>
              </p>

              {/* Public/Private Toggle */}
              <div className="mb-4">
                <label className="block text-xs sm:text-sm text-gray-400 mb-2">Room Visibility</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setIsPublic(false)}
                    className={`
                      px-3 py-3 rounded-lg text-sm font-medium transition-all min-h-[50px]
                      ${!isPublic
                        ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
                    `}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span>🔒</span>
                      <span>Private</span>
                    </div>
                    <div className="text-[9px] sm:text-[10px] opacity-70 mt-1">Code required</div>
                  </button>
                  <button
                    onClick={() => setIsPublic(true)}
                    className={`
                      px-3 py-3 rounded-lg text-sm font-medium transition-all min-h-[50px]
                      ${isPublic
                        ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
                    `}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span>🌐</span>
                      <span>Public</span>
                    </div>
                    <div className="text-[9px] sm:text-[10px] opacity-70 mt-1">Anyone can join</div>
                  </button>
                </div>
              </div>

              {/* Game Rules */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-green-400 flex items-center gap-2">
                  <span>🎯</span> Game Rules
                </h3>

                {/* Partner Variant */}
                <div>
                  <label className="block text-xs sm:text-sm text-gray-400 mb-2">Partner Variant</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'calledAce' as PartnerVariant, label: 'Called Ace', desc: 'Pick an ace' },
                      { value: 'jackOfDiamonds' as PartnerVariant, label: 'Jack ♦', desc: 'J♦ is partner' },
                      { value: 'none' as PartnerVariant, label: 'Solo', desc: 'No partner' },
                    ].map(option => (
                      <button
                        key={option.value}
                        onClick={() => updateSettings({ partnerVariant: option.value })}
                        className={`
                          px-2 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all min-h-[50px]
                          ${gameSettings.partnerVariant === option.value
                            ? 'bg-green-600 text-white ring-2 ring-green-400'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
                        `}
                      >
                        <div className="font-semibold">{option.label}</div>
                        <div className="text-[9px] sm:text-[10px] opacity-70">{option.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* No-Pick Rule */}
                <div>
                  <label className="block text-xs sm:text-sm text-gray-400 mb-2">When Everyone Passes</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'leaster' as NoPickRule, label: 'Leaster', desc: 'Lowest points wins' },
                      { value: 'forcedPick' as NoPickRule, label: 'Forced Pick', desc: 'Dealer must pick' },
                    ].map(option => (
                      <button
                        key={option.value}
                        onClick={() => updateSettings({ noPickRule: option.value })}
                        className={`
                          px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all min-h-[50px]
                          ${gameSettings.noPickRule === option.value
                            ? 'bg-green-600 text-white ring-2 ring-green-400'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
                        `}
                      >
                        <div className="font-semibold">{option.label}</div>
                        <div className="text-[9px] sm:text-[10px] opacity-70">{option.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleCreateRoom}
                className="w-full mt-4 bg-green-600 hover:bg-green-500 active:bg-green-700 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-colors text-sm sm:text-base min-h-[48px]"
              >
                Create Room
              </button>
            </div>
          </section>
        )}

        {/* Join Room Flow */}
        {connected && mode === 'join' && (
          <section className="space-y-3 sm:space-y-4">
            <div className="bg-gray-800 rounded-xl p-4 sm:p-6">
              <p className="text-gray-400 mb-3 sm:mb-4 text-center text-sm sm:text-base">
                Joining as <span className="text-white font-medium">{playerName}</span>
              </p>
              <label className="block text-xs sm:text-sm text-gray-400 mb-1.5 sm:mb-2">
                Room Code
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="ABCD"
                maxLength={4}
                autoFocus
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-white text-center text-xl sm:text-2xl font-mono tracking-widest uppercase placeholder-gray-500 focus:outline-none focus:border-green-500 min-h-[44px]"
              />
              <button
                onClick={handleJoinRoom}
                disabled={roomCode.length < 4}
                className="w-full mt-3 sm:mt-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-colors text-sm sm:text-base min-h-[48px]"
              >
                Join Room
              </button>
            </div>
          </section>
        )}

        {/* Browse Public Rooms */}
        {connected && mode === 'browse' && (
          <section className="space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-semibold text-purple-400">
                Public Games
              </h2>
              <button
                onClick={refreshPublicRooms}
                className="text-sm text-gray-400 hover:text-white flex items-center gap-1 px-3 py-1 rounded hover:bg-gray-800"
              >
                <span>↻</span> Refresh
              </button>
            </div>

            {publicRooms.length === 0 ? (
              <div className="bg-gray-800 rounded-xl p-6 text-center">
                <p className="text-gray-400 mb-2">No public games available</p>
                <p className="text-gray-500 text-sm">Be the first to create one!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {publicRooms.map((room) => (
                  <div
                    key={room.code}
                    className="bg-gray-800 rounded-xl p-4 hover:bg-gray-750 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-white font-medium">{room.hostName}'s Game</span>
                        <span className="text-gray-500 text-xs ml-2">#{room.code}</span>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-medium ${room.playerCount >= room.maxPlayers ? 'text-red-400' : 'text-green-400'}`}>
                          {room.playerCount}/{room.maxPlayers} players
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">
                        {room.settings.partnerVariant === 'calledAce' ? 'Called Ace' :
                         room.settings.partnerVariant === 'jackOfDiamonds' ? 'Jack ♦' : 'Solo'}
                      </span>
                      <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">
                        {room.settings.noPickRule === 'leaster' ? 'Leaster' : 'Forced Pick'}
                      </span>
                    </div>
                    <button
                      onClick={() => handleJoinPublicRoom(room)}
                      disabled={room.playerCount >= room.maxPlayers}
                      className="w-full bg-purple-600 hover:bg-purple-500 active:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm min-h-[40px]"
                    >
                      {room.playerCount >= room.maxPlayers ? 'Room Full' : 'Join Game'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Back Button */}
        <section className="mt-6 sm:mt-8">
          <button
            onClick={handleBack}
            className="w-full bg-gray-700 hover:bg-gray-600 active:bg-gray-800 text-white font-medium py-2.5 sm:py-3 px-4 rounded-lg transition-colors text-sm sm:text-base min-h-[44px]"
          >
            {mode !== 'choose' ? 'Back' : 'Return to Menu'}
          </button>
        </section>

        {/* Simple instruction */}
        {connected && mode === 'choose' && (
          <p className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-500 px-2">
            Create a room and share the code with friends to play together
          </p>
        )}
      </div>
    </div>
  );
}
