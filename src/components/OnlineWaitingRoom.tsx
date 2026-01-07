// Online Waiting Room - Pre-game lobby showing connected players

import type { OnlineGameState, OnlineGameActions, PlayerInfo } from '../hooks/useOnlineGame';
import { useGameStore } from '../store/gameStore';

interface OnlineWaitingRoomProps {
  onlineState: OnlineGameState;
  onlineActions: OnlineGameActions;
}

function PlayerSlot({ position, player, isMe }: { position: number; player: PlayerInfo | null; isMe: boolean }) {
  const isBot = !player;
  const name = player?.name || `Bot ${position + 1}`;
  const connected = player?.connected ?? true;

  return (
    <div className={`
      flex items-center justify-between p-2.5 sm:p-3 md:p-4 rounded-lg border-2 transition-colors gap-2
      ${isMe ? 'border-green-500 bg-green-900/20' :
        player ? 'border-gray-600 bg-gray-800' :
        'border-gray-700 bg-gray-800/50'}
    `}>
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <div className={`
          w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-lg font-bold flex-shrink-0
          ${isBot ? 'bg-blue-600' : 'bg-green-600'}
        `}>
          {isBot ? '🤖' : name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="font-medium text-white flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
            <span className="truncate">{name}</span>
            {isMe && (
              <span className="text-[10px] sm:text-xs bg-green-600 px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0">You</span>
            )}
          </div>
          <div className="text-[10px] sm:text-xs text-gray-500">
            Seat {position + 1}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        {isBot ? (
          <span className="text-[10px] sm:text-xs bg-blue-900/50 text-blue-400 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">Bot</span>
        ) : (
          <span className={`
            text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded flex items-center gap-1
            ${connected ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}
          `}>
            <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="hidden sm:inline">{connected ? 'Ready' : 'Disconnected'}</span>
          </span>
        )}
      </div>
    </div>
  );
}

export function OnlineWaitingRoom({ onlineState, onlineActions }: OnlineWaitingRoomProps) {
  const { roomCode, myPosition, isHost, players, error } = onlineState;
  const { gameSettings } = useGameStore();

  // Build player slots (5 positions)
  const slots: (PlayerInfo | null)[] = [];
  for (let i = 0; i < 5; i++) {
    const player = players.find(p => p.position === i) || null;
    slots.push(player);
  }

  const humanCount = players.length;
  const botCount = 5 - humanCount;

  const handleStartGame = () => {
    onlineActions.startGame();
  };

  const handleLeaveRoom = () => {
    onlineActions.leaveRoom();
  };

  const copyRoomCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
    }
  };

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-8 text-white">
      <div className="max-w-lg mx-auto">
        {/* Room Code Header */}
        <header className="text-center mb-6 sm:mb-8 pt-4 sm:pt-6 md:pt-8">
          <div className="text-gray-400 mb-1 sm:mb-2 text-xs sm:text-sm">Room Code</div>
          <button
            onClick={copyRoomCode}
            className="group text-3xl sm:text-4xl md:text-5xl font-bold font-mono tracking-widest bg-gray-800 px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-xl hover:bg-gray-700 active:bg-gray-900 transition-colors min-h-[60px]"
            title="Click to copy"
          >
            {roomCode}
            <span className="block text-[10px] sm:text-xs font-normal text-gray-500 group-hover:text-gray-400 mt-1">
              Tap to copy
            </span>
          </button>
          <p className="text-gray-400 mt-3 sm:mt-4 text-xs sm:text-sm">
            Share this code with friends to join!
          </p>
        </header>

        {/* Error Display */}
        {error && (
          <section className="mb-4 sm:mb-6">
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 sm:p-4">
              <div className="flex justify-between items-start gap-2">
                <p className="text-red-400 text-xs sm:text-sm">{error}</p>
                <button
                  onClick={onlineActions.clearError}
                  className="text-red-400 hover:text-red-300 text-xl min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  &times;
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Player List */}
        <section className="mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-semibold text-gray-300 mb-3 sm:mb-4">Players</h2>
          <div className="space-y-2 sm:space-y-3">
            {slots.map((player, i) => (
              <PlayerSlot
                key={i}
                position={i}
                player={player}
                isMe={myPosition === i}
              />
            ))}
          </div>
        </section>

        {/* Player Count Summary */}
        <section className="mb-4 sm:mb-6 bg-gray-800/50 rounded-xl p-3 sm:p-4">
          <div className="flex justify-center gap-6 sm:gap-8 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-green-400">{humanCount}</div>
              <div className="text-xs sm:text-sm text-gray-400">Player{humanCount !== 1 ? 's' : ''}</div>
            </div>
            <div className="w-px bg-gray-700" />
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-blue-400">{botCount}</div>
              <div className="text-xs sm:text-sm text-gray-400">Bot{botCount !== 1 ? 's' : ''}</div>
            </div>
          </div>
        </section>

        {/* Game Rules */}
        <section className="mb-6 sm:mb-8 bg-gray-800/50 rounded-xl p-3 sm:p-4">
          <h3 className="text-sm sm:text-base font-semibold text-green-400 mb-2 sm:mb-3 flex items-center gap-2">
            <span>🎯</span> Game Rules
          </h3>
          <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm">
            <div className="bg-gray-700/50 px-3 py-1.5 rounded-lg">
              <span className="text-gray-400">Partner: </span>
              <span className="text-white font-medium">
                {gameSettings.partnerVariant === 'calledAce' ? 'Called Ace' :
                 gameSettings.partnerVariant === 'jackOfDiamonds' ? 'Jack of ♦' : 'Solo (No Partner)'}
              </span>
            </div>
            <div className="bg-gray-700/50 px-3 py-1.5 rounded-lg">
              <span className="text-gray-400">No-Pick: </span>
              <span className="text-white font-medium">
                {gameSettings.noPickRule === 'leaster' ? 'Leaster' : 'Forced Pick'}
              </span>
            </div>
          </div>
        </section>

        {/* Actions */}
        <section className="space-y-2 sm:space-y-3">
          {isHost && (
            <button
              onClick={handleStartGame}
              className="w-full bg-green-600 hover:bg-green-500 active:bg-green-700 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-colors text-base sm:text-lg min-h-[48px]"
            >
              Start Game
            </button>
          )}

          {!isHost && (
            <div className="text-center text-gray-400 py-3 sm:py-4 bg-gray-800/50 rounded-xl text-sm sm:text-base">
              Waiting for host to start the game...
            </div>
          )}

          <button
            onClick={handleLeaveRoom}
            className="w-full bg-gray-700 hover:bg-gray-600 active:bg-gray-800 text-white font-medium py-2.5 sm:py-3 px-4 rounded-lg transition-colors text-sm sm:text-base min-h-[44px]"
          >
            Leave Room
          </button>
        </section>

        {/* Host Badge */}
        {isHost && (
          <section className="mt-4 sm:mt-6 text-center">
            <span className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-yellow-400 bg-yellow-900/30 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
              <span className="text-base sm:text-lg">👑</span>
              You are the host
            </span>
          </section>
        )}

        {/* Instructions */}
        <section className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-500 space-y-1 sm:space-y-2 px-2">
          <p>
            Empty seats will be filled by computer opponents.
          </p>
          <p>
            The game starts when the host taps "Start Game".
          </p>
        </section>
      </div>
    </div>
  );
}
