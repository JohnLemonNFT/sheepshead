// TeamBanner component - compact role indicator for mobile

import { PlayerPosition } from '../game/types';
import { getPlayerName, getPlayerEmoji } from './PlayerAvatar';

interface TeamBannerProps {
  humanRole: 'picker' | 'partner' | 'defender' | null;
  pickerPosition: PlayerPosition | null;
  partnerPosition: PlayerPosition | null;
  partnerRevealed: boolean;
  calledSuit?: string;
}

const SUIT_SYMBOLS: Record<string, string> = {
  clubs: '♣',
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
};

export function TeamBanner({
  humanRole,
  pickerPosition,
  partnerPosition,
  partnerRevealed,
  calledSuit,
}: TeamBannerProps) {
  if (!humanRole || pickerPosition === null) return null;

  // Compact inline badge style
  const getBgColor = () => {
    if (humanRole === 'picker') return 'bg-yellow-600/80 border-yellow-500/50';
    if (humanRole === 'partner') return 'bg-blue-600/80 border-blue-500/50';
    return 'bg-red-600/80 border-red-500/50';
  };

  const getIcon = () => {
    if (humanRole === 'picker') return '👑';
    if (humanRole === 'partner') return '🤝';
    return '⚔️';
  };

  const getLabel = () => {
    if (humanRole === 'picker') return 'PICKER';
    if (humanRole === 'partner') return 'PARTNER';
    return 'DEFENDER';
  };

  // Build compact info string
  const getInfo = () => {
    if (humanRole === 'picker') {
      if (partnerRevealed && partnerPosition !== null) {
        return `w/ ${getPlayerEmoji(partnerPosition)} ${getPlayerName(partnerPosition)}`;
      }
      if (calledSuit) return `Called ${SUIT_SYMBOLS[calledSuit]}`;
      return 'Solo';
    }
    if (humanRole === 'partner') {
      return `w/ ${getPlayerEmoji(pickerPosition)} ${getPlayerName(pickerPosition)}`;
    }
    // Defender
    if (partnerRevealed && partnerPosition !== null) {
      return `vs ${getPlayerEmoji(pickerPosition)}+${getPlayerEmoji(partnerPosition)}`;
    }
    return `vs ${getPlayerEmoji(pickerPosition)} ${getPlayerName(pickerPosition)}`;
  };

  return (
    <div className={`${getBgColor()} border rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 mb-2 sm:mb-3 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm`}>
      <span className="text-sm sm:text-base">{getIcon()}</span>
      <span className="font-bold text-white">{getLabel()}</span>
      <span className="text-white/70 text-[10px] sm:text-xs">{getInfo()}</span>
    </div>
  );
}
