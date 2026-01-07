// TableView - 3D Perspective card table inspired by Euchre 3D

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

// Face-down card component
function FaceDownCard({ className = '' }: { className?: string }) {
  return (
    <div className={`w-7 h-10 sm:w-8 sm:h-11 bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 rounded-sm border border-blue-500/40 shadow-md flex items-center justify-center ${className}`}>
      <div className="w-5 h-7 sm:w-6 sm:h-8 border border-blue-400/20 rounded-sm flex items-center justify-center">
        <span className="text-blue-300/50 text-[8px] sm:text-[10px]">🐑</span>
      </div>
    </div>
  );
}

// Card fan for opponents (horizontal)
function CardFanHorizontal({ count, flipped = false }: { count: number; flipped?: boolean }) {
  const visibleCards = Math.min(count, 6);
  return (
    <div className={`flex ${flipped ? 'flex-row-reverse' : 'flex-row'} -space-x-4`}>
      {Array.from({ length: visibleCards }).map((_, i) => (
        <FaceDownCard key={i} className={flipped ? '-mr-4 first:mr-0' : ''} />
      ))}
    </div>
  );
}

// Card fan for side opponents (vertical)
function CardFanVertical({ count, side }: { count: number; side: 'left' | 'right' }) {
  const visibleCards = Math.min(count, 6);
  return (
    <div className={`flex flex-col -space-y-6 ${side === 'right' ? 'items-start' : 'items-end'}`}>
      {Array.from({ length: visibleCards }).map((_, i) => (
        <div
          key={i}
          className={`transform ${side === 'left' ? '-rotate-90' : 'rotate-90'}`}
        >
          <FaceDownCard />
        </div>
      ))}
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

  // Position names: 0=you (bottom), 1=left, 2=top-left, 3=top-right, 4=right
  const getPlayerInfo = (relPos: number) => {
    const player = playersByRelPos[relPos];
    if (!player) return null;

    const isDealer = player.position === dealerPosition;
    const isCurrent = player.position === currentPlayer;
    const displayInfo = getPlayerDisplayInfo(player.position);
    const cardCount = Array.isArray(player.hand) ? player.hand.length : player.hand.length;

    return {
      player,
      isDealer,
      isCurrent,
      displayInfo,
      cardCount,
      isPicker: player.isPicker,
      isPartner: player.isPartner && partnerRevealed,
    };
  };

  // Player name badge component
  const PlayerBadge = ({ relPos, position }: { relPos: number; position: string }) => {
    const info = getPlayerInfo(relPos);
    if (!info) return null;

    const { displayInfo, isDealer, isCurrent, isPicker, isPartner, cardCount } = info;
    const isYou = relPos === 0;

    return (
      <div className={`flex items-center gap-1 ${position}`}>
        <div
          className={`
            relative px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium
            flex items-center gap-1 shadow-lg
            ${isYou ? 'bg-emerald-600 text-white' : 'bg-gray-800/90 text-gray-200'}
            ${isCurrent ? 'ring-2 ring-green-400 animate-pulse' : ''}
            ${isPicker ? 'ring-2 ring-yellow-400' : ''}
            ${isPartner ? 'ring-2 ring-blue-400' : ''}
          `}
        >
          {isDealer && (
            <span className="w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center text-[8px] font-bold text-white">D</span>
          )}
          {isPicker && <span className="text-[10px]">👑</span>}
          {isPartner && <span className="text-[10px]">🤝</span>}
          <span>{isYou ? 'You' : displayInfo.name}</span>
          {!isYou && <span className="text-gray-400 text-[9px]">{cardCount}</span>}
        </div>
        {isCurrent && !isYou && (
          <span className="text-green-400 text-xs animate-bounce">●</span>
        )}
      </div>
    );
  };

  return (
    <div className="w-full mb-2">
      {/* 3D Perspective Container */}
      <div
        className="relative mx-auto"
        style={{
          perspective: '800px',
          perspectiveOrigin: '50% 100%',
        }}
      >
        {/* The tilted table */}
        <div
          className="relative w-full max-w-lg mx-auto"
          style={{
            transform: 'rotateX(25deg)',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Table surface */}
          <div className="relative h-44 sm:h-52 md:h-60">
            {/* Table felt - oval shape with gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-green-700 via-green-600 to-green-700 rounded-[50%] border-4 border-amber-800 shadow-2xl overflow-hidden">
              {/* Felt texture overlay */}
              <div className="absolute inset-0 opacity-30" style={{
                backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)'
              }} />
              {/* Table rim inner highlight */}
              <div className="absolute inset-2 rounded-[50%] border border-green-500/30" />
            </div>

            {/* === OPPONENTS AROUND TABLE === */}

            {/* Top-Left Opponent (position 2) */}
            {playersByRelPos[2] && (
              <div className="absolute top-2 left-[20%] flex flex-col items-center gap-1 z-10">
                <CardFanHorizontal count={getPlayerInfo(2)?.cardCount || 0} flipped />
                <PlayerBadge relPos={2} position="" />
              </div>
            )}

            {/* Top-Right Opponent (position 3) */}
            {playersByRelPos[3] && (
              <div className="absolute top-2 right-[20%] flex flex-col items-center gap-1 z-10">
                <CardFanHorizontal count={getPlayerInfo(3)?.cardCount || 0} />
                <PlayerBadge relPos={3} position="" />
              </div>
            )}

            {/* Left Opponent (position 1) */}
            {playersByRelPos[1] && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
                <div className="flex flex-col items-center">
                  <PlayerBadge relPos={1} position="" />
                </div>
                <CardFanVertical count={getPlayerInfo(1)?.cardCount || 0} side="left" />
              </div>
            )}

            {/* Right Opponent (position 4) */}
            {playersByRelPos[4] && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
                <CardFanVertical count={getPlayerInfo(4)?.cardCount || 0} side="right" />
                <div className="flex flex-col items-center">
                  <PlayerBadge relPos={4} position="" />
                </div>
              </div>
            )}

            {/* === CENTER OF TABLE (Trick Cards / Blind) === */}
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="transform" style={{ transform: 'rotateX(-25deg)' }}>
                {children}
              </div>
            </div>

            {/* === YOU (bottom) === */}
            {playersByRelPos[0] && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-10">
                <PlayerBadge relPos={0} position="" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Turn indicator - below table */}
      {currentPlayer !== yourPosition && (
        <div className="text-center mt-1 text-xs text-green-400">
          {getPlayerDisplayInfo(currentPlayer).name}'s turn
        </div>
      )}
      {currentPlayer === yourPosition && (
        <div className="text-center mt-1 text-xs text-yellow-400 font-medium animate-pulse">
          Your turn
        </div>
      )}
    </div>
  );
}
