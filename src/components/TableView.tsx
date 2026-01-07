// TableView - Compact table with focus on gameplay

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
  children?: React.ReactNode;
}

// Tiny player indicator - just avatar and name
function PlayerDot({
  name,
  avatar,
  isDealer,
  isCurrent,
  isPicker,
  isPartner,
}: {
  name: string;
  avatar: string;
  isDealer: boolean;
  isCurrent: boolean;
  isPicker: boolean;
  isPartner: boolean;
}) {
  const borderColor = isPicker ? 'border-yellow-400' :
                      isPartner ? 'border-blue-400' :
                      'border-gray-500';

  return (
    <div className="flex flex-col items-center">
      <div className={`
        relative w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 ${borderColor}
        bg-gray-800 flex items-center justify-center text-sm sm:text-lg
        ${isCurrent ? 'ring-2 ring-green-400 ring-offset-1 ring-offset-green-900' : ''}
      `}>
        {avatar}
        {isDealer && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-[8px] font-bold text-white">D</div>
        )}
      </div>
      <span className={`text-[10px] sm:text-xs mt-0.5 ${
        isPicker ? 'text-yellow-400' : isPartner ? 'text-blue-400' : 'text-gray-400'
      }`}>
        {name}
      </span>
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
  const getRelativePosition = (playerPos: PlayerPosition): number => {
    return (playerPos - yourPosition + 5) % 5;
  };

  const playersByRelPos = players.reduce((acc, player) => {
    acc[getRelativePosition(player.position)] = player;
    return acc;
  }, {} as Record<number, Player>);

  const getPlayerInfo = (relPos: number) => {
    const player = playersByRelPos[relPos];
    if (!player) return null;
    return {
      isDealer: player.position === dealerPosition,
      isCurrent: player.position === currentPlayer,
      displayInfo: getPlayerDisplayInfo(player.position),
      isPicker: player.isPicker,
      isPartner: player.isPartner && partnerRevealed,
    };
  };

  const renderPlayer = (relPos: number) => {
    const info = getPlayerInfo(relPos);
    if (!info) return null;
    return (
      <PlayerDot
        name={info.displayInfo.name}
        avatar={info.displayInfo.avatar}
        isDealer={info.isDealer}
        isCurrent={info.isCurrent}
        isPicker={info.isPicker}
        isPartner={info.isPartner}
      />
    );
  };

  return (
    <div className="w-full">
      {/* Compact oval table */}
      <div className="relative mx-auto max-w-lg">
        <div className="relative bg-gradient-to-b from-green-700 to-green-800 rounded-[50%] h-36 sm:h-44 border-2 border-amber-800/60">

          {/* Top row - 2 players */}
          <div className="absolute -top-2 left-0 right-0 flex justify-center gap-16 sm:gap-24">
            {renderPlayer(2)}
            {renderPlayer(3)}
          </div>

          {/* Left player */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2">
            {renderPlayer(1)}
          </div>

          {/* Right player */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2">
            {renderPlayer(4)}
          </div>

          {/* Center content - trick cards */}
          <div className="absolute inset-0 flex items-center justify-center pt-2">
            {children}
          </div>

          {/* You indicator at bottom */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
            <div className="flex flex-col items-center">
              <div className={`
                w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-emerald-400
                bg-emerald-700 flex items-center justify-center text-sm sm:text-lg
                ${currentPlayer === yourPosition ? 'ring-2 ring-green-400 ring-offset-1 ring-offset-green-900' : ''}
              `}>
                👤
                {dealerPosition === yourPosition && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-[8px] font-bold text-white">D</div>
                )}
              </div>
              <span className="text-[10px] sm:text-xs mt-0.5 text-emerald-400">You</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
