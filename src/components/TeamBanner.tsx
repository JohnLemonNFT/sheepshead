// TeamBanner component - shows the human player's team role and teammates

import { PlayerPosition } from '../game/types';
import { getPlayerName, getPlayerEmoji } from './PlayerAvatar';

interface TeamBannerProps {
  humanRole: 'picker' | 'partner' | 'defender' | null;
  pickerPosition: PlayerPosition | null;
  partnerPosition: PlayerPosition | null;
  partnerRevealed: boolean;
  calledSuit?: string;
}

export function TeamBanner({
  humanRole,
  pickerPosition,
  partnerPosition,
  partnerRevealed,
  calledSuit,
}: TeamBannerProps) {
  if (!humanRole || pickerPosition === null) return null;

  const getDefenders = (): PlayerPosition[] => {
    const defenders: PlayerPosition[] = [];
    for (let i = 0; i < 5; i++) {
      if (i !== pickerPosition && i !== partnerPosition) {
        defenders.push(i as PlayerPosition);
      }
    }
    return defenders;
  };

  const renderTeammate = (position: PlayerPosition, label?: string) => (
    <span key={position} className="inline-flex items-center gap-1 px-2 py-1 bg-white/10 rounded">
      <span>{getPlayerEmoji(position)}</span>
      <span>{position === 0 ? 'You' : getPlayerName(position)}</span>
      {label && <span className="text-xs opacity-75">({label})</span>}
    </span>
  );

  if (humanRole === 'picker') {
    return (
      <div className="bg-gradient-to-r from-yellow-900/80 to-yellow-800/80 border-2 border-yellow-500 rounded-lg px-4 py-3 mb-4">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👑</span>
            <span className="text-yellow-300 font-bold text-lg">You are the PICKER</span>
          </div>
          <div className="text-yellow-100 text-sm">
            {partnerRevealed && partnerPosition !== null ? (
              <span className="flex items-center gap-2">
                Partner: {renderTeammate(partnerPosition)}
              </span>
            ) : calledSuit ? (
              <span>Partner has A{calledSuit === 'clubs' ? '♣' : calledSuit === 'spades' ? '♠' : calledSuit === 'hearts' ? '♥' : '♦'} (hidden)</span>
            ) : (
              <span>Going alone!</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (humanRole === 'partner') {
    return (
      <div className="bg-gradient-to-r from-blue-900/80 to-blue-800/80 border-2 border-blue-500 rounded-lg px-4 py-3 mb-4">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤝</span>
            <span className="text-blue-300 font-bold text-lg">You are the PARTNER</span>
          </div>
          <div className="text-blue-100 text-sm flex items-center gap-2">
            <span>Teammate:</span>
            {renderTeammate(pickerPosition, 'Picker')}
          </div>
        </div>
        {!partnerRevealed && (
          <p className="text-blue-200/70 text-xs text-center mt-2">
            Your identity is hidden until you play the called ace
          </p>
        )}
      </div>
    );
  }

  // Defender
  const defenders = getDefenders();
  const otherDefenders = defenders.filter(d => d !== 0);

  return (
    <div className="bg-gradient-to-r from-red-900/80 to-red-800/80 border-2 border-red-500 rounded-lg px-4 py-3 mb-4">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🛡️</span>
          <span className="text-red-300 font-bold text-lg">You are a DEFENDER</span>
        </div>
        <div className="text-red-100 text-sm">
          <span className="flex items-center gap-2 flex-wrap">
            <span>vs Picker:</span>
            {renderTeammate(pickerPosition)}
            {partnerRevealed && partnerPosition !== null && (
              <>
                <span>+</span>
                {renderTeammate(partnerPosition, 'Partner')}
              </>
            )}
          </span>
        </div>
      </div>
      {otherDefenders.length > 0 && (
        <div className="text-red-200/80 text-xs text-center mt-2 flex items-center justify-center gap-2 flex-wrap">
          <span>Fellow defenders:</span>
          {otherDefenders.map(d => renderTeammate(d))}
        </div>
      )}
    </div>
  );
}
