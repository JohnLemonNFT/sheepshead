// Online Waiting Room - Pre-game lobby showing connected players

import type { OnlineGameState, OnlineGameActions, PlayerInfo } from '../hooks/useOnlineGame';

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
      flex items-center justify-between p-4 rounded-lg border-2 transition-colors
      ${isMe ? 'border-green-500 bg-green-900/20' :
        player ? 'border-gray-600 bg-gray-800' :
        'border-gray-700 bg-gray-800/50'}
    `}>
      <div className="flex items-center gap-3">
        <div className={`
          w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold
          ${isBot ? 'bg-blue-600' : 'bg-green-600'}
        `}>
          {isBot ? '🤖' : name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="font-medium text-white flex items-center gap-2">
            {name}
            {isMe && (
              <span className="text-xs bg-green-600 px-2 py-0.5 rounded-full">You</span>
            )}
          </div>
          <div className="text-xs text-gray-500">
            Seat {position + 1}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isBot ? (
          <span className="text-xs bg-blue-900/50 text-blue-400 px-2 py-1 rounded">Bot</span>
        ) : (
          <span className={`
            text-xs px-2 py-1 rounded flex items-center gap-1
            ${connected ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}
          `}>
            <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
            {connected ? 'Ready' : 'Disconnected'}
          </span>
        )}
      </div>
    </div>
  );
}

export function OnlineWaitingRoom({ onlineState, onlineActions }: OnlineWaitingRoomProps) {
  const { roomCode, myPosition, isHost, players, error } = onlineState;

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
    <div className="min-h-screen p-4 md:p-8 text-white">
      <div className="max-w-lg mx-auto">
        {/* Room Code Header */}
        <header className="text-center mb-8 pt-8">
          <div className="text-gray-400 mb-2">Room Code</div>
          <button
            onClick={copyRoomCode}
            className="group text-5xl font-bold font-mono tracking-widest bg-gray-800 px-8 py-4 rounded-xl hover:bg-gray-700 transition-colors"
            title="Click to copy"
          >
            {roomCode}
            <span className="block text-xs font-normal text-gray-500 group-hover:text-gray-400 mt-1">
              Click to copy
            </span>
          </button>
          <p className="text-gray-400 mt-4">
            Share this code with friends to join!
          </p>
        </header>

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

        {/* Player List */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-300 mb-4">Players</h2>
          <div className="space-y-3">
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
        <section className="mb-8 bg-gray-800/50 rounded-xl p-4">
          <div className="flex justify-center gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-green-400">{humanCount}</div>
              <div className="text-sm text-gray-400">Player{humanCount !== 1 ? 's' : ''}</div>
            </div>
            <div className="w-px bg-gray-700" />
            <div>
              <div className="text-3xl font-bold text-blue-400">{botCount}</div>
              <div className="text-sm text-gray-400">Bot{botCount !== 1 ? 's' : ''}</div>
            </div>
          </div>
        </section>

        {/* Actions */}
        <section className="space-y-3">
          {isHost && (
            <button
              onClick={handleStartGame}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-6 rounded-xl transition-colors text-lg"
            >
              Start Game
            </button>
          )}

          {!isHost && (
            <div className="text-center text-gray-400 py-4 bg-gray-800/50 rounded-xl">
              Waiting for host to start the game...
            </div>
          )}

          <button
            onClick={handleLeaveRoom}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Leave Room
          </button>
        </section>

        {/* Host Badge */}
        {isHost && (
          <section className="mt-6 text-center">
            <span className="inline-flex items-center gap-2 text-sm text-yellow-400 bg-yellow-900/30 px-4 py-2 rounded-full">
              <span className="text-lg">👑</span>
              You are the host
            </span>
          </section>
        )}

        {/* Instructions */}
        <section className="mt-8 text-center text-sm text-gray-500 space-y-2">
          <p>
            Empty seats will be filled by computer opponents.
          </p>
          <p>
            The game starts when the host clicks "Start Game".
          </p>
        </section>
      </div>
    </div>
  );
}
