// PlayerAvatar component - unique avatar for each player

import { getPlayerDisplayInfo, getPersonality } from '../game/ai/personalities';
import type { PlayerPosition } from '../game/types';

interface PlayerAvatarProps {
  position: number;
  size?: 'sm' | 'md' | 'lg';
  isCurrentPlayer?: boolean;
  isPicker?: boolean;
  isPartner?: boolean;
  isDefender?: boolean;
  showName?: boolean;
}

// Color mappings for personality colors
const COLOR_MAP: Record<string, { bg: string; border: string }> = {
  green: { bg: 'bg-green-600', border: 'border-green-400' },
  purple: { bg: 'bg-purple-600', border: 'border-purple-400' },
  orange: { bg: 'bg-orange-600', border: 'border-orange-400' },
  blue: { bg: 'bg-blue-600', border: 'border-blue-400' },
  pink: { bg: 'bg-pink-600', border: 'border-pink-400' },
};

const SIZES = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-lg',
  lg: 'w-14 h-14 text-2xl',
};

export function PlayerAvatar({
  position,
  size = 'md',
  isCurrentPlayer = false,
  isPicker = false,
  isPartner = false,
  isDefender = false,
  showName = false,
}: PlayerAvatarProps) {
  const displayInfo = getPlayerDisplayInfo(position as PlayerPosition);
  const colors = COLOR_MAP[displayInfo.color] || COLOR_MAP.green;

  return (
    <div className="flex items-center gap-2">
      <div
        className={`
          ${SIZES[size]}
          ${colors.bg}
          rounded-full flex items-center justify-center
          border-2 ${colors.border}
          ${isCurrentPlayer ? 'ring-2 ring-white ring-offset-2 ring-offset-green-900 animate-pulse' : ''}
          ${isPicker ? 'ring-2 ring-yellow-400' : ''}
          ${isPartner ? 'ring-2 ring-blue-400' : ''}
          ${isDefender ? 'ring-2 ring-red-400' : ''}
          transition-all duration-200
        `}
      >
        <span>{displayInfo.avatar}</span>
      </div>
      {showName && (
        <span className={`text-sm font-medium ${
          isPicker ? 'text-yellow-300' :
          isPartner ? 'text-blue-300' :
          isDefender ? 'text-red-300' :
          'text-gray-300'
        }`}>
          {displayInfo.name}
        </span>
      )}
    </div>
  );
}

export function getPlayerName(position: number): string {
  return getPlayerDisplayInfo(position as PlayerPosition).name;
}

export function getPlayerEmoji(position: number): string {
  return getPlayerDisplayInfo(position as PlayerPosition).avatar;
}
