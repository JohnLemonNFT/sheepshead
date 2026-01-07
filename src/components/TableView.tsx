// TableView - Visual card table with players seated around it

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

export function TableView({
  players,
  currentPlayer,
  dealerPosition,
  yourPosition,
  pickerPosition,
  partnerRevealed,
  children,
}: TableViewProps) {
  // Arrange players relative to "you" - you're always at the bottom
  // Clockwise: You (bottom) -> Left -> Top-Left -> Top-Right -> Right
  const getRelativePosition = (playerPos: PlayerPosition): number => {
    return (playerPos - yourPosition + 5) % 5;
  };

  const leadPosition = ((dealerPosition + 1) % 5) as PlayerPosition;

  // Player seat component
  const PlayerSeat = ({ player, position }: { player: Player; position: 'bottom' | 'left' | 'top-left' | 'top-right' | 'right' }) => {
    const isYou = player.position === yourPosition;
    const isDealer = player.position === dealerPosition;
    const isCurrent = player.position === currentPlayer;
    const isLead = player.position === leadPosition;
    const displayInfo = getPlayerDisplayInfo(player.position);
    const cardCount = Array.isArray(player.hand) ? player.hand.length : player.hand.length;

    // Position-specific styles
    const positionStyles: Record<string, string> = {
      'bottom': 'bottom-0 left-1/2 -translate-x-1/2',
      'left': 'left-2 sm:left-4 top-1/2 -translate-y-1/2',
      'top-left': 'top-0 left-[15%] sm:left-[20%]',
      'top-right': 'top-0 right-[15%] sm:right-[20%]',
      'right': 'right-2 sm:right-4 top-1/2 -translate-y-1/2',
    };

    // Card fan styles (face-down cards showing)
    const cardFanStyles: Record<string, string> = {
      'bottom': 'flex-row -space-x-3',
      'left': 'flex-col -space-y-4 rotate-90',
      'top-left': 'flex-row -space-x-3 rotate-180',
      'top-right': 'flex-row -space-x-3 rotate-180',
      'right': 'flex-col -space-y-4 -rotate-90',
    };

    // Avatar position relative to cards
    const avatarPosition: Record<string, string> = {
      'bottom': 'mb-1',
      'left': 'mr-1',
      'top-left': 'mt-1',
      'top-right': 'mt-1',
      'right': 'ml-1',
    };

    const isTopPlayer = position === 'top-left' || position === 'top-right';
    const isSidePlayer = position === 'left' || position === 'right';

    return (
      <div className={`absolute ${positionStyles[position]} flex flex-col items-center`}>
        {/* Cards (shown for opponents, not for you) */}
        {!isYou && !isTopPlayer && !isSidePlayer && (
          <div className={`flex ${cardFanStyles[position]} ${avatarPosition[position]}`}>
            {Array.from({ length: Math.min(cardCount, 3) }).map((_, i) => (
              <div
                key={i}
                className="w-6 h-9 sm:w-8 sm:h-11 bg-gradient-to-br from-blue-700 to-blue-900 rounded border border-blue-500/50 shadow-md flex items-center justify-center"
              >
                <span className="text-blue-300/60 text-[8px] sm:text-xs">🐑</span>
              </div>
            ))}
            {cardCount > 3 && (
              <span className="text-[10px] text-gray-400 ml-1">+{cardCount - 3}</span>
            )}
          </div>
        )}

        {/* Player info bubble */}
        <div
          className={`
            relative flex items-center gap-1.5 px-2 py-1 rounded-full
            ${isYou ? 'bg-emerald-600' : 'bg-gray-800/90'}
            ${isCurrent ? 'ring-2 ring-green-400 ring-offset-1 ring-offset-transparent animate-pulse' : ''}
            ${player.isPicker ? 'ring-2 ring-yellow-400' : ''}
            ${player.isPartner && partnerRevealed ? 'ring-2 ring-blue-400' : ''}
            shadow-lg
          `}
        >
          {/* Dealer chip */}
          {isDealer && (
            <div className="absolute -top-1 -left-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center text-[8px] font-bold text-white border border-amber-300 shadow">
              D
            </div>
          )}

          {/* Lead indicator */}
          {isLead && !isDealer && (
            <div className="absolute -top-1 -left-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-[8px] font-bold text-white border border-green-300 shadow">
              1
            </div>
          )}

          {/* Avatar */}
          <span className="text-sm sm:text-base">
            {isYou ? '👤' : displayInfo.avatar}
          </span>

          {/* Name */}
          <span className={`text-[10px] sm:text-xs font-medium ${isYou ? 'text-white' : 'text-gray-200'}`}>
            {isYou ? 'You' : displayInfo.name}
          </span>

          {/* Role badges */}
          {player.isPicker && <span className="text-xs">👑</span>}
          {player.isPartner && partnerRevealed && <span className="text-xs">🤝</span>}

          {/* Card count for non-you players */}
          {!isYou && (
            <span className="text-[9px] text-gray-400 bg-gray-700/50 px-1 rounded">
              {cardCount}
            </span>
          )}

          {/* Turn indicator */}
          {isCurrent && (
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-green-400 text-[10px] font-bold whitespace-nowrap flex flex-col items-center">
              <span className="text-base">▲</span>
            </div>
          )}
        </div>

        {/* Side/top players show cards differently */}
        {!isYou && (isTopPlayer || isSidePlayer) && (
          <div className={`flex items-center gap-0.5 mt-1 ${isTopPlayer ? 'rotate-0' : ''}`}>
            <div className="w-5 h-7 sm:w-6 sm:h-8 bg-gradient-to-br from-blue-700 to-blue-900 rounded border border-blue-500/50 shadow flex items-center justify-center">
              <span className="text-blue-300/60 text-[6px] sm:text-[8px]">🐑</span>
            </div>
            <span className="text-[9px] text-gray-400">×{cardCount}</span>
          </div>
        )}
      </div>
    );
  };

  // Map players to their visual positions
  const playersByRelativePos = players.reduce((acc, player) => {
    const relPos = getRelativePosition(player.position);
    acc[relPos] = player;
    return acc;
  }, {} as Record<number, Player>);

  const positionMap: Record<number, 'bottom' | 'left' | 'top-left' | 'top-right' | 'right'> = {
    0: 'bottom',
    1: 'left',
    2: 'top-left',
    3: 'top-right',
    4: 'right',
  };

  return (
    <div className="relative w-full mb-3">
      {/* Info bar */}
      <div className="flex justify-center items-center gap-3 mb-2 text-[10px] sm:text-xs">
        <span className="flex items-center gap-1 text-amber-400">
          <span className="w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center text-[8px] font-bold text-white">D</span>
          <span>Dealer</span>
        </span>
        <span className="flex items-center gap-1 text-green-400">
          <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-[8px] font-bold text-white">1</span>
          <span>Leads</span>
        </span>
        <span className="text-gray-500">Play goes ↻</span>
      </div>

      {/* Table */}
      <div className="relative h-48 sm:h-56 md:h-64 mx-auto max-w-md">
        {/* Table felt */}
        <div className="absolute inset-4 sm:inset-6 bg-gradient-to-b from-green-700 to-green-800 rounded-[50%] border-4 border-amber-900/60 shadow-xl">
          {/* Table rim highlight */}
          <div className="absolute inset-1 rounded-[50%] border border-green-600/30" />

          {/* Center area for trick cards */}
          <div className="absolute inset-0 flex items-center justify-center">
            {children || (
              <span className="text-green-600/30 text-3xl">🃏</span>
            )}
          </div>
        </div>

        {/* Players around the table */}
        {Object.entries(playersByRelativePos).map(([relPos, player]) => (
          <PlayerSeat
            key={player.position}
            player={player}
            position={positionMap[parseInt(relPos)]}
          />
        ))}
      </div>
    </div>
  );
}
