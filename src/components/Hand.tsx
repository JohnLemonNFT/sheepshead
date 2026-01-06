// Hand component for displaying a player's cards

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
}: HandProps) {
  const isCardSelected = (card: CardType) =>
    selectedCards.some(c => c.id === card.id);

  const isCardLegal = (card: CardType) =>
    legalPlays.length === 0 || legalPlays.some(c => c.id === card.id);

  // Determine background/border styling based on role
  const getRoleStyles = () => {
    if (isPicker) return 'bg-yellow-900/40 border-2 border-yellow-500 rounded-lg p-1.5 sm:p-2';
    if (isPartner) return 'bg-blue-900/40 border-2 border-blue-500 rounded-lg p-1.5 sm:p-2';
    if (isDefender) return 'bg-red-900/30 border-2 border-red-500/50 rounded-lg p-1.5 sm:p-2';
    return '';
  };

  const getRoleBadge = () => {
    if (isPicker) return <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 bg-yellow-500 text-black text-[10px] sm:text-xs font-bold rounded">PICKER</span>;
    if (isPartner) return <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 bg-blue-500 text-white text-[10px] sm:text-xs font-bold rounded">PARTNER</span>;
    if (isDefender) return <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 bg-red-500/80 text-white text-[10px] sm:text-xs font-bold rounded">DEF</span>;
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
      <div className="flex justify-center gap-0.5 sm:gap-1 md:gap-2 flex-wrap">
        {cards.map(card => (
          <Card
            key={card.id}
            card={card}
            onClick={onCardClick ? () => onCardClick(card) : undefined}
            selected={isCardSelected(card)}
            disabled={onCardClick ? !isCardLegal(card) : false}
            highlight={isCardLegal(card) && legalPlays.length > 0}
            small={compact}
          />
        ))}
      </div>
    </div>
  );
}
