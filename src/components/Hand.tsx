// Hand component for displaying a player's cards - Premium Edition

import { Card as CardType } from '../game/types';
import { Card, CardBack } from './Card';
import { PlayerAvatar, getPlayerName } from './PlayerAvatar';

interface HandProps {
  cards: CardType[];
  onCardClick?: (card: CardType) => void;
  selectedCards?: CardType[];
  legalPlays?: CardType[];
  faceDown?: boolean;
  label?: string;
  isCurrentPlayer?: boolean;
  compact?: boolean;
  isPicker?: boolean;
  isPartner?: boolean;
  isDefender?: boolean;
  playerPosition?: number;
  showAvatar?: boolean;
  animate?: boolean; // Enable dealing animation
}

export function Hand({
  cards,
  onCardClick,
  selectedCards = [],
  legalPlays = [],
  faceDown = false,
  label,
  isCurrentPlayer = false,
  compact = false,
  isPicker = false,
  isPartner = false,
  isDefender = false,
  playerPosition = 0,
  showAvatar = false,
  animate = false,
}: HandProps) {
  const isCardSelected = (card: CardType) =>
    selectedCards.some(c => c.id === card.id);

  const isCardLegal = (card: CardType) =>
    legalPlays.length === 0 || legalPlays.some(c => c.id === card.id);

  // Determine background/border styling based on role - Premium glass effect
  const getRoleStyles = () => {
    if (isPicker) return 'glass bg-yellow-900/30 border border-yellow-500/50 rounded-xl p-2 sm:p-3 shadow-lg';
    if (isPartner) return 'glass bg-blue-900/30 border border-blue-500/50 rounded-xl p-2 sm:p-3 shadow-lg';
    if (isDefender) return 'glass bg-red-900/20 border border-red-500/30 rounded-xl p-2 sm:p-3 shadow-lg';
    if (isCurrentPlayer) return 'glass bg-green-900/20 border border-green-500/40 rounded-xl p-2 sm:p-3 shadow-lg your-turn-glow';
    return '';
  };

  const getRoleBadge = () => {
    if (isPicker) return (
      <span className="ml-1 sm:ml-2 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-gradient-to-r from-yellow-500 to-amber-500 text-black text-[9px] sm:text-xs font-bold rounded-full shadow-md">
        👑 PICKER
      </span>
    );
    if (isPartner) return (
      <span className="ml-1 sm:ml-2 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[9px] sm:text-xs font-bold rounded-full shadow-md">
        🤝 PARTNER
      </span>
    );
    if (isDefender) return (
      <span className="ml-1 sm:ml-2 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-gradient-to-r from-red-500 to-rose-600 text-white text-[9px] sm:text-xs font-bold rounded-full shadow-md">
        ⚔️ DEF
      </span>
    );
    return null;
  };

  if (faceDown) {
    return (
      <div className={`text-center ${getRoleStyles()}`}>
        <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1 sm:mb-2">
          {showAvatar && (
            <PlayerAvatar
              position={playerPosition}
              size="sm"
              isCurrentPlayer={isCurrentPlayer}
              isPicker={isPicker}
              isPartner={isPartner}
            />
          )}
          {label && (
            <p className={`${compact ? 'text-[10px] sm:text-xs' : 'text-xs sm:text-sm'} ${isPicker ? 'text-yellow-300' : isPartner ? 'text-blue-300' : isDefender ? 'text-red-300' : 'text-green-300'} truncate max-w-[120px] sm:max-w-none`}>
              {label}
              {getRoleBadge()}
            </p>
          )}
        </div>
        <div className="flex justify-center gap-0.5 sm:gap-1 flex-wrap">
          {compact ? (
            <>
              <CardBack small />
              {cards.length > 1 && (
                <span className="text-green-300 text-[10px] sm:text-sm self-center ml-0.5 sm:ml-1">
                  x{cards.length}
                </span>
              )}
            </>
          ) : (
            cards.slice(0, 3).map((_, i) => <CardBack key={i} />)
          )}
          {!compact && cards.length > 3 && (
            <span className="text-green-300 text-[10px] sm:text-sm self-center ml-0.5 sm:ml-1">
              +{cards.length - 3}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`text-center ${getRoleStyles()}`}>
      <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1 sm:mb-2">
        {showAvatar && (
          <PlayerAvatar
            position={playerPosition}
            size="sm"
            isCurrentPlayer={isCurrentPlayer}
            isPicker={isPicker}
            isPartner={isPartner}
          />
        )}
        {label && (
          <p
            className={`${compact ? 'text-[10px] sm:text-xs' : 'text-xs sm:text-sm'} ${
              isPicker ? 'text-yellow-300 font-bold' : isPartner ? 'text-blue-300 font-bold' : isDefender ? 'text-red-300 font-bold' : isCurrentPlayer ? 'text-yellow-300 font-bold' : 'text-green-300'
            }`}
          >
            {label}
            {getRoleBadge()}
            {isCurrentPlayer && !isPicker && !isPartner && !isDefender && ' (thinking...)'}
          </p>
        )}
      </div>
      <div className="flex justify-center gap-1 sm:gap-1.5 md:gap-2 flex-wrap">
        {cards.map((card, index) => (
          <Card
            key={card.id}
            card={card}
            onClick={onCardClick ? () => onCardClick(card) : undefined}
            selected={isCardSelected(card)}
            disabled={onCardClick ? !isCardLegal(card) : false}
            highlight={isCardLegal(card) && legalPlays.length > 0}
            small={compact}
            animate={animate ? 'deal' : null}
            animationDelay={animate ? index * 80 : 0}
          />
        ))}
      </div>
    </div>
  );
}
