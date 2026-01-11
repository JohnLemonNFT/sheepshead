// Announcement component - shows important game events

import { PlayerAvatar, getPlayerName } from './PlayerAvatar';

interface AnnouncementProps {
  type: 'pick' | 'call' | 'callTen' | 'goAlone' | 'partnerReveal' | 'trickWin' | 'leaster' | 'dealer';
  playerPosition: number;
  details?: string;
  onDismiss?: () => void;
}

const SUIT_DISPLAY: Record<string, { symbol: string; color: string; name: string }> = {
  clubs: { symbol: '♣', color: 'text-gray-800', name: 'Clubs' },
  spades: { symbol: '♠', color: 'text-gray-800', name: 'Spades' },
  hearts: { symbol: '♥', color: 'text-red-600', name: 'Hearts' },
  diamonds: { symbol: '♦', color: 'text-red-600', name: 'Diamonds' },
};

export function Announcement({
  type,
  playerPosition,
  details,
  onDismiss,
}: AnnouncementProps) {
  const playerName = getPlayerName(playerPosition);

  const getContent = () => {
    switch (type) {
      case 'pick':
        return {
          title: `${playerName} Picked!`,
          subtitle: 'Taking the blind and becoming the Picker',
          bgColor: 'bg-yellow-900/90',
          borderColor: 'border-yellow-500',
        };
      case 'call':
        const suitAce = details ? SUIT_DISPLAY[details] : null;
        return {
          title: `${playerName} Calls...`,
          subtitle: suitAce ? (
            <span className="flex items-center justify-center gap-2 text-2xl">
              <span>Ace of</span>
              <span className={`${suitAce.color} bg-white px-3 py-1 rounded-lg text-3xl`}>
                {suitAce.symbol}
              </span>
              <span>{suitAce.name}</span>
            </span>
          ) : 'Partner ace',
          bgColor: 'bg-purple-900/90',
          borderColor: 'border-purple-500',
        };
      case 'callTen':
        const suitTen = details ? SUIT_DISPLAY[details] : null;
        return {
          title: `${playerName} Calls...`,
          subtitle: suitTen ? (
            <span className="flex items-center justify-center gap-2 text-2xl">
              <span>10 of</span>
              <span className={`${suitTen.color} bg-white px-3 py-1 rounded-lg text-3xl`}>
                {suitTen.symbol}
              </span>
              <span>{suitTen.name}</span>
            </span>
          ) : 'Partner 10',
          bgColor: 'bg-amber-900/90',
          borderColor: 'border-amber-500',
        };
      case 'goAlone':
        return {
          title: `${playerName} Goes Alone!`,
          subtitle: 'No partner - taking on all defenders solo',
          bgColor: 'bg-red-900/90',
          borderColor: 'border-red-500',
        };
      case 'partnerReveal':
        return {
          title: `Partner Revealed!`,
          subtitle: `${playerName} played the called ace`,
          bgColor: 'bg-blue-900/90',
          borderColor: 'border-blue-500',
        };
      case 'trickWin':
        return {
          title: `${playerName} wins the trick!`,
          subtitle: details || '',
          bgColor: 'bg-green-900/90',
          borderColor: 'border-green-500',
        };
      case 'leaster':
        return {
          title: 'Leaster!',
          subtitle: 'Everyone passed. Lowest points wins!',
          bgColor: 'bg-orange-900/90',
          borderColor: 'border-orange-500',
        };
      case 'dealer':
        return {
          title: `${playerName} is Dealing`,
          subtitle: 'New hand starting...',
          bgColor: 'bg-gray-800/90',
          borderColor: 'border-gray-500',
        };
      default:
        return {
          title: '',
          subtitle: '',
          bgColor: 'bg-gray-900/90',
          borderColor: 'border-gray-500',
        };
    }
  };

  const content = getContent();

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 animate-fadeIn">
      <div
        className={`
          ${content.bgColor} ${content.borderColor}
          border-2 rounded-xl p-8 max-w-md mx-4
          text-center shadow-2xl
          animate-slideIn
        `}
      >
        {type !== 'leaster' && (
          <div className="flex justify-center mb-4">
            <PlayerAvatar
              position={playerPosition}
              size="lg"
              isPicker={type === 'pick' || type === 'call' || type === 'goAlone'}
              isPartner={type === 'partnerReveal'}
            />
          </div>
        )}
        {type === 'leaster' && (
          <div className="flex justify-center mb-4 text-6xl">
            🎲
          </div>
        )}

        <h2 className="text-2xl font-bold text-white mb-2">{content.title}</h2>
        <div className="text-lg text-gray-200">{content.subtitle}</div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="mt-6 bg-white/20 hover:bg-white/30 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
