// TableView - Clean card table inspired by Euchre 3D

import { PlayerPosition } from '../game/types';
import { getPlayerDisplayInfo } from '../game/ai/personalities';

interface Player {
  position: PlayerPosition;
  hand: { length: number } | any[];
  isPicker: boolean;
  isPartner: boolean;
}

interface TableViewProps {
  players: Player[];
  currentPlayer: PlayerPosition;
  dealerPosition: PlayerPosition;
  yourPosition: PlayerPosition;
  pickerPosition: PlayerPosition | null;
  partnerRevealed: boolean;
  children?: React.ReactNode; // For trick cards in center
}

// Player badge component - shows avatar, name, and indicators
function PlayerBadge({
  name,
  avatar,
  isYou,
  isDealer,
  isCurrent,
  isPicker,
  isPartner,
}: {
  name: string;
  avatar: string;
  isYou: boolean;
  isDealer: boolean;
  isCurrent: boolean;
  isPicker: boolean;
  isPartner: boolean;
}) {
  // Determine border color based on role
  const borderColor = isPicker ? 'border-yellow-500' :
                      isPartner ? 'border-blue-500' :
                      isYou ? 'border-emerald-500' :
                      'border-gray-600';

  return (
    <div className={`
      relative flex flex-col items-center
      ${isCurrent ? 'scale-110' : ''}
    `}>
      {/* Avatar with colored border */}
      <div className={`
        w-12 h-12 sm:w-14 sm:h-14 rounded-lg border-2 ${borderColor}
        bg-gray-800 flex items-center justify-center text-2xl sm:text-3xl
        shadow-lg relative overflow-hidden
        ${isCurrent ? 'ring-2 ring-green-400 animate-pulse' : ''}
      `}>
        <span>{avatar}</span>

        {/* Dealer badge */}
        {isDealer && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white border border-blue-400">
            D
          </div>
        )}
      </div>

      {/* Name */}
      <div className={`
        mt-1 text-xs sm:text-sm font-medium truncate max-w-[60px] sm:max-w-[80px]
        ${isPicker ? 'text-yellow-400' :
          isPartner ? 'text-blue-400' :
          isYou ? 'text-emerald-400' :
          'text-gray-300'}
      `}>
        {isYou ? 'You' : name}
      </div>

      {/* Role indicator */}
      {isPicker && (
        <div className="text-[10px] text-yellow-400">👑 Picker</div>
      )}
      {isPartner && (
        <div className="text-[10px] text-blue-400">🤝 Partner</div>
      )}
    </div>
  );
}

export function TableView({
  players,
  currentPlayer,
  dealerPosition,
  yourPosition,
  pickerPosition,
  partnerRevealed,
  children,
}: TableViewProps) {
  // Get relative position (0 = you, 1-4 = clockwise from you)
  const getRelativePosition = (playerPos: PlayerPosition): number => {
    return (playerPos - yourPosition + 5) % 5;
  };

  // Map players to positions
  const playersByRelPos = players.reduce((acc, player) => {
    acc[getRelativePosition(player.position)] = player;
    return acc;
  }, {} as Record<number, Player>);

  // Get player info for rendering
  const getPlayerInfo = (relPos: number) => {
    const player = playersByRelPos[relPos];
    if (!player) return null;

    return {
      player,
      isDealer: player.position === dealerPosition,
      isCurrent: player.position === currentPlayer,
      displayInfo: getPlayerDisplayInfo(player.position),
      isPicker: player.isPicker,
      isPartner: player.isPartner && partnerRevealed,
      isYou: relPos === 0,
    };
  };

  // Render a player badge at a position
  const renderPlayer = (relPos: number) => {
    const info = getPlayerInfo(relPos);
    if (!info) return null;

    return (
      <PlayerBadge
        name={info.displayInfo.name}
        avatar={info.displayInfo.avatar}
        isYou={info.isYou}
        isDealer={info.isDealer}
        isCurrent={info.isCurrent}
        isPicker={info.isPicker}
        isPartner={info.isPartner}
      />
    );
  };

  return (
    <div className="w-full mb-3">
      {/* Table container */}
      <div className="relative mx-auto max-w-md">
        {/* Green felt table */}
        <div className="relative bg-gradient-to-b from-green-700 to-green-800 rounded-[40%] h-48 sm:h-56 border-4 border-amber-900 shadow-2xl">
          {/* Inner felt highlight */}
          <div className="absolute inset-3 rounded-[40%] border border-green-600/30" />

          {/* Top players (positions 2 and 3) */}
          <div className="absolute top-2 left-0 right-0 flex justify-around px-8">
            {renderPlayer(2)}
            {renderPlayer(3)}
          </div>

          {/* Left player (position 1) */}
          <div className="absolute left-2 top-1/2 -translate-y-1/2">
            {renderPlayer(1)}
          </div>

          {/* Right player (position 4) */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {renderPlayer(4)}
          </div>

          {/* Center - trick cards or blind */}
          <div className="absolute inset-0 flex items-center justify-center">
            {children}
          </div>

          {/* You (position 0) - bottom center */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
            {renderPlayer(0)}
          </div>
        </div>
      </div>

      {/* Turn indicator */}
      {currentPlayer !== yourPosition && (
        <div className="text-center mt-2 text-sm text-green-400">
          {getPlayerDisplayInfo(currentPlayer).name}'s turn
        </div>
      )}
      {currentPlayer === yourPosition && (
        <div className="text-center mt-2 text-sm text-yellow-400 font-medium animate-pulse">
          Your turn
        </div>
      )}
    </div>
  );
}
