// Table component - displays the premium game table with current trick

import { Card as CardType, Trick, PlayerPosition, Suit } from '../game/types';
import { Card, CardBack } from './Card';
import { PlayerAvatar } from './PlayerAvatar';
import { getPlayerDisplayInfo } from '../game/ai/personalities';
import { CalledAceIndicator } from './CalledAceIndicator';

interface TableProps {
  currentTrick: Trick;
  blind: CardType[];
  trickNumber: number;
  completedTricksCount: number;
  pickerPosition: PlayerPosition | null;
  partnerPosition?: PlayerPosition | null;
  calledSuit: string | null;
  calledAceRevealed: boolean;
  currentPlayer?: PlayerPosition;
  playerCount?: number;
}

// Suit symbols for display
const SUIT_SYMBOLS: Record<string, string> = {
  clubs: '♣',
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
};

export function Table({
  currentTrick,
  blind,
  trickNumber,
  completedTricksCount,
  pickerPosition,
  partnerPosition,
  calledSuit,
  calledAceRevealed,
  currentPlayer,
  playerCount = 5,
}: TableProps) {
  // Get card played by each position
  const getCardForPosition = (position: number) => {
    const play = currentTrick.cards.find(c => c.playedBy === position);
    return play?.card;
  };

  // Calculate positions around an oval table
  const getPlayerStyle = (index: number, total: number) => {
    // Position 0 (human) at bottom center
    // Others distributed around the top arc
    if (index === 0) {
      return {
        bottom: '8px',
        left: '50%',
        transform: 'translateX(-50%)',
      };
    }

    // Distribute other players in an arc from left to right
    const otherCount = total - 1;
    const position = index - 1;
    const angle = Math.PI * (0.15 + (position / (otherCount - 1)) * 0.7); // 15° to 85° arc
    const radiusX = 45; // % of container width
    const radiusY = 38; // % of container height

    return {
      left: `${50 - Math.cos(angle) * radiusX}%`,
      top: `${50 - Math.sin(angle) * radiusY}%`,
      transform: 'translate(-50%, -50%)',
    };
  };

  // Get card position in center of table for played cards
  const getCardStyle = (playerIndex: number, total: number) => {
    if (playerIndex === 0) {
      return {
        bottom: '35%',
        left: '50%',
        transform: 'translateX(-50%)',
      };
    }

    const otherCount = total - 1;
    const position = playerIndex - 1;
    const angle = Math.PI * (0.2 + (position / (otherCount - 1)) * 0.6);
    const radiusX = 22;
    const radiusY = 18;

    return {
      left: `${50 - Math.cos(angle) * radiusX}%`,
      top: `${50 - Math.sin(angle) * radiusY}%`,
      transform: 'translate(-50%, -50%)',
    };
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto aspect-[16/10]">
      {/* Wood rail border */}
      <div className="absolute inset-0 table-rail rounded-[2rem] sm:rounded-[2.5rem] p-2 sm:p-3">
        {/* Felt surface */}
        <div className="relative w-full h-full felt-surface rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden">

          {/* Center area - blind or current trick cards */}
          <div className="absolute inset-0 flex items-center justify-center">
            {blind.length > 0 ? (
              <div className="text-center animate-fadeIn">
                <p className="text-emerald-300/90 text-xs sm:text-sm mb-2 font-medium tracking-wide uppercase">
                  Blind
                </p>
                <div className="flex gap-2 sm:gap-3 justify-center">
                  {blind.map((_, i) => (
                    <CardBack key={i} animate="deal" animationDelay={i * 100} />
                  ))}
                </div>
              </div>
            ) : currentTrick.cards.length > 0 ? (
              <div className="relative w-48 h-32 sm:w-64 sm:h-40">
                {/* Played cards positioned relative to their players */}
                {currentTrick.cards.map((play, i) => {
                  const style = getCardStyle(play.playedBy, playerCount);
                  const isWinning = i === currentTrick.cards.length - 1; // Simple highlight for last played
                  return (
                    <div
                      key={`${play.playedBy}-${play.card.id}`}
                      className="absolute animate-cardPlay"
                      style={{
                        ...style,
                        animationDelay: `${i * 50}ms`,
                      }}
                    >
                      <Card card={play.card} small />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-emerald-400/40 text-sm">
                {trickNumber > 1 ? 'Play a card' : 'Waiting...'}
              </div>
            )}
          </div>

          {/* Player positions around table */}
          {Array.from({ length: playerCount }).map((_, i) => {
            const displayInfo = getPlayerDisplayInfo(i as PlayerPosition);
            const isPicker = pickerPosition === i;
            const isPartner = partnerPosition === i && calledAceRevealed;
            const isDefender = !isPicker && !isPartner && pickerPosition !== null;
            const isCurrentTurn = currentPlayer === i;

            return (
              <div
                key={i}
                className="absolute"
                style={getPlayerStyle(i, playerCount)}
              >
                <div className={`
                  flex flex-col items-center gap-1
                  ${isCurrentTurn ? 'animate-pulse-glow rounded-full' : ''}
                `}>
                  <PlayerAvatar
                    position={i}
                    size="sm"
                    isPicker={isPicker}
                    isPartner={isPartner}
                    isDefender={isDefender && calledAceRevealed}
                    isCurrentPlayer={isCurrentTurn}
                  />
                  <span className={`
                    text-[10px] sm:text-xs font-medium px-1.5 py-0.5 rounded
                    ${isPicker ? 'bg-yellow-500/20 text-yellow-300' :
                      isPartner ? 'bg-blue-500/20 text-blue-300' :
                      isCurrentTurn ? 'bg-green-500/20 text-green-300' :
                      'text-emerald-200/70'}
                  `}>
                    {displayInfo.name}
                    {isPicker && ' 👑'}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Game info - top left */}
          <div className="absolute top-3 left-4 sm:top-4 sm:left-6">
            <div className="glass rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-2">
              <p className="text-emerald-300 text-[10px] sm:text-xs font-medium">
                Trick {trickNumber}/6
              </p>
            </div>
          </div>

          {/* Called Ace - prominent center-top indicator */}
          {calledSuit && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 sm:top-4 z-10">
              <CalledAceIndicator
                suit={calledSuit as Suit}
                revealed={calledAceRevealed}
                size="sm"
              />
            </div>
          )}

          {/* Completed tricks - top right */}
          <div className="absolute top-3 right-4 sm:top-4 sm:right-6">
            <div className="glass rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-2">
              <p className="text-emerald-300 text-[10px] sm:text-xs font-medium">
                {completedTricksCount} tricks done
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
