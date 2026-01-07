// TableLayout - Visual representation of player positions around the table

import { PlayerPosition } from '../game/types';
import { getPlayerDisplayInfo } from '../game/ai/personalities';

interface Player {
  position: PlayerPosition;
  hand: { length: number } | any[];
  isPicker: boolean;
  isPartner: boolean;
}

interface TableLayoutProps {
  players: Player[];
  currentPlayer: PlayerPosition;
  dealerPosition: PlayerPosition;
  activeHumanPosition: PlayerPosition;
  pickerPosition: PlayerPosition | null;
  partnerRevealed: boolean;
}

export function TableLayout({
  players,
  currentPlayer,
  dealerPosition,
  activeHumanPosition,
  pickerPosition,
  partnerRevealed,
}: TableLayoutProps) {
  // Calculate positions relative to the human player
  // Human is always at the bottom, others arranged clockwise
  const getRelativePosition = (playerPos: PlayerPosition): number => {
    // Returns 0-4 where 0 = you (bottom center), then clockwise
    const offset = (playerPos - activeHumanPosition + 5) % 5;
    return offset;
  };

  // Position labels for clarity
  const positionLabels = ['You', 'Left', 'Far Left', 'Far Right', 'Right'];

  // Arrange players by their relative position
  const arrangedPlayers = players
    .map(p => ({
      ...p,
      relativePos: getRelativePosition(p.position),
      isYou: p.position === activeHumanPosition,
      isDealer: p.position === dealerPosition,
      isCurrent: p.position === currentPlayer,
      displayInfo: getPlayerDisplayInfo(p.position),
    }))
    .sort((a, b) => a.relativePos - b.relativePos);

  // Get the player who leads (left of dealer)
  const leadPosition = ((dealerPosition + 1) % 5) as PlayerPosition;

  return (
    <div className="mb-3">
      {/* Game info bar */}
      <div className="flex justify-center items-center gap-3 mb-2 text-xs text-green-300/70">
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 bg-amber-600 rounded-full flex items-center justify-center text-[8px] font-bold text-white">D</span>
          <span>= Dealer</span>
        </span>
        <span>•</span>
        <span>Lead: {players[leadPosition]?.position === activeHumanPosition ? 'You' : getPlayerDisplayInfo(leadPosition).name}</span>
        <span>•</span>
        <span className="text-green-400">↻ Clockwise</span>
      </div>

      {/* Table visualization - Semi-circle arrangement */}
      <div className="relative h-24 sm:h-28">
        {/* Table felt background */}
        <div className="absolute inset-x-4 top-0 bottom-4 bg-green-800/30 rounded-t-full border-t-2 border-x-2 border-green-600/30" />

        {/* Players positioned around the table */}
        {arrangedPlayers.map(player => {
          // Position styles based on relative position
          // 0 = bottom center (you), 1 = left, 2 = far left, 3 = far right, 4 = right
          const positionStyles: Record<number, string> = {
            0: 'bottom-0 left-1/2 -translate-x-1/2', // You - bottom center
            1: 'bottom-8 left-[15%] sm:left-[20%]', // Left of you
            2: 'top-0 left-[25%] sm:left-[30%]', // Far left (top left)
            3: 'top-0 right-[25%] sm:right-[30%]', // Far right (top right)
            4: 'bottom-8 right-[15%] sm:right-[20%]', // Right of you
          };

          const cardCount = Array.isArray(player.hand) ? player.hand.length : player.hand.length;

          return (
            <div
              key={player.position}
              className={`absolute ${positionStyles[player.relativePos]} transform transition-all duration-300`}
            >
              <div
                className={`
                  flex flex-col items-center gap-0.5
                  ${player.isCurrent ? 'scale-110' : ''}
                `}
              >
                {/* Player chip/avatar */}
                <div
                  className={`
                    relative w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center
                    text-sm sm:text-base font-bold shadow-lg transition-all
                    ${player.isYou
                      ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 ring-2 ring-emerald-400'
                      : 'bg-gradient-to-br from-slate-600 to-slate-800'}
                    ${player.isCurrent ? 'ring-2 ring-green-400 animate-pulse' : ''}
                    ${player.isPicker ? 'ring-2 ring-yellow-400' : ''}
                    ${player.isPartner && partnerRevealed ? 'ring-2 ring-blue-400' : ''}
                  `}
                >
                  {/* Avatar/Emoji */}
                  <span>{player.isYou ? '👤' : player.displayInfo.avatar}</span>

                  {/* Dealer button */}
                  {player.isDealer && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow border border-amber-400">
                      D
                    </div>
                  )}

                  {/* Picker crown */}
                  {player.isPicker && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-sm">
                      👑
                    </div>
                  )}

                  {/* Partner indicator */}
                  {player.isPartner && partnerRevealed && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs">
                      🤝
                    </div>
                  )}

                  {/* Current turn indicator */}
                  {player.isCurrent && (
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-green-400 text-[10px] font-bold whitespace-nowrap">
                      ▲ Turn
                    </div>
                  )}
                </div>

                {/* Name and card count */}
                <div className="text-center mt-1">
                  <div className={`text-[10px] sm:text-xs font-medium ${
                    player.isYou ? 'text-emerald-300' :
                    player.isPicker ? 'text-yellow-300' :
                    player.isPartner && partnerRevealed ? 'text-blue-300' :
                    'text-gray-300'
                  }`}>
                    {player.isYou ? 'You' : player.displayInfo.name}
                  </div>
                  <div className="text-[9px] text-gray-500">
                    {cardCount} cards
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Center of table - could show trick or other info */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-green-600/30 text-2xl">
          🃏
        </div>
      </div>
    </div>
  );
}

// Compact version for smaller screens or when playing
export function TableLayoutCompact({
  players,
  currentPlayer,
  dealerPosition,
  activeHumanPosition,
  pickerPosition,
  partnerRevealed,
}: TableLayoutProps) {
  const leadPosition = ((dealerPosition + 1) % 5) as PlayerPosition;

  return (
    <div className="mb-3">
      {/* Info bar */}
      <div className="flex justify-center items-center gap-2 mb-2 text-[10px] sm:text-xs text-green-300/70">
        <span className="flex items-center gap-1">
          <span className="w-3.5 h-3.5 bg-amber-600 rounded-full flex items-center justify-center text-[7px] font-bold text-white">D</span>
          <span className="hidden sm:inline">Dealer:</span>
          <span>{players[dealerPosition]?.position === activeHumanPosition ? 'You' : getPlayerDisplayInfo(dealerPosition).name}</span>
        </span>
        <span className="text-gray-600">→</span>
        <span className="flex items-center gap-1">
          <span className="text-green-400">Lead:</span>
          <span>{players[leadPosition]?.position === activeHumanPosition ? 'You' : getPlayerDisplayInfo(leadPosition).name}</span>
        </span>
      </div>

      {/* Player strip with position context */}
      <div className="flex justify-center gap-1 sm:gap-1.5 flex-wrap">
        {players.map((player, i) => {
          const isYou = player.position === activeHumanPosition;
          const isDealer = player.position === dealerPosition;
          const isCurrent = player.position === currentPlayer;
          const displayInfo = getPlayerDisplayInfo(player.position);

          // Calculate relative position
          const relPos = (player.position - activeHumanPosition + 5) % 5;
          const posLabel = ['', '←', '↖', '↗', '→'][relPos]; // Direction from you

          const cardCount = Array.isArray(player.hand) ? player.hand.length : player.hand.length;

          return (
            <div
              key={player.position}
              className={`
                relative px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm flex items-center gap-1
                transition-all duration-200
                ${isCurrent ? 'ring-2 ring-green-400 bg-green-900/50' : ''}
                ${isYou ? 'bg-emerald-700' : 'bg-gray-800/80'}
                ${player.isPicker ? 'ring-2 ring-yellow-400' : ''}
                ${player.isPartner && partnerRevealed ? 'ring-2 ring-blue-400' : ''}
              `}
            >
              {/* Position indicator (direction from you) */}
              {!isYou && (
                <span className="text-gray-500 text-[10px] sm:text-xs">{posLabel}</span>
              )}

              {/* Dealer indicator */}
              {isDealer && (
                <span className="w-4 h-4 bg-amber-600 rounded-full flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0">D</span>
              )}

              {/* Picker/Partner icons */}
              {player.isPicker && <span className="text-xs">👑</span>}
              {player.isPartner && partnerRevealed && <span className="text-xs">🤝</span>}

              {/* Name */}
              <span className={`${isYou ? 'font-bold' : ''} truncate max-w-[50px] sm:max-w-none`}>
                {isYou ? 'You' : displayInfo.name}
              </span>

              {/* Card count */}
              <span className="text-gray-400 text-[10px] sm:text-xs">{cardCount}</span>

              {/* Current turn indicator */}
              {isCurrent && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-green-400 text-[8px]">▲</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
