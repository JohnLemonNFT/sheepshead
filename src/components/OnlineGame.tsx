// Online Game - Game view for online multiplayer (matches single-player UI)

import { useState, useCallback } from 'react';
import { Card } from './Card';
import { InfoDrawer } from './InfoDrawer';
import type { OnlineGameState, OnlineGameActions } from '../hooks/useOnlineGame';
import type { Card as CardType, PlayerPosition, Suit } from '../game/types';
import { isTrump, getCardPoints } from '../game/types';

const SUIT_SYMBOLS: Record<string, string> = {
  clubs: '♣',
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
};

// Avatar emojis for players
const PLAYER_AVATARS = ['🧑', '🤖', '🦊', '🐺', '🦁'];

interface OnlineGameProps {
  onlineState: OnlineGameState;
  onlineActions: OnlineGameActions;
}

export function OnlineGame({ onlineState, onlineActions }: OnlineGameProps) {
  const { myPosition, gameState, error, roomCode } = onlineState;
  const [selectedCards, setSelectedCards] = useState<CardType[]>([]);
  const [showMenu, setShowMenu] = useState(false);

  // Loading state
  if (!gameState || myPosition === null) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-felt-table">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">Loading game...</div>
          <div className="text-gray-300">Room: {roomCode}</div>
        </div>
      </div>
    );
  }

  const {
    phase,
    players,
    blind,
    currentTrick,
    currentPlayer,
    dealerPosition,
    pickerPosition,
    calledAce,
    trickNumber,
    playerScores,
    handsPlayed,
    completedTricks = [],
  } = gameState;

  const myPlayer = players.find(p => p.position === myPosition);
  const myHand = myPlayer?.hand || [];
  const isMyTurn = currentPlayer === myPosition;

  // Simple legal plays calculation
  const getLegalPlays = (): CardType[] => {
    if (phase !== 'playing' || !isMyTurn || myHand.length === 0) {
      return [];
    }
    if (currentTrick.cards.length === 0) {
      return myHand;
    }
    const leadCard = currentTrick.cards[0].card;
    const leadIsTrump = isTrump(leadCard);
    if (leadIsTrump) {
      const trumpCards = myHand.filter(c => isTrump(c));
      return trumpCards.length > 0 ? trumpCards : myHand;
    } else {
      const followCards = myHand.filter(c => c.suit === leadCard.suit && !isTrump(c));
      return followCards.length > 0 ? followCards : myHand;
    }
  };

  const legalPlays = getLegalPlays();

  // Handlers
  const handleCardClick = (card: CardType) => {
    if (phase === 'burying') {
      setSelectedCards(prev => {
        const isSelected = prev.some(c => c.id === card.id);
        if (isSelected) return prev.filter(c => c.id !== card.id);
        if (prev.length < 2) return [...prev, card];
        return prev;
      });
    } else if (phase === 'playing' && isMyTurn) {
      if (legalPlays.some(c => c.id === card.id)) {
        onlineActions.sendAction({ type: 'playCard', card });
      }
    }
  };

  const handlePick = () => onlineActions.sendAction({ type: 'pick' });
  const handlePass = () => onlineActions.sendAction({ type: 'pass' });
  const handleBury = () => {
    if (selectedCards.length === 2) {
      onlineActions.sendAction({ type: 'bury', cards: selectedCards as [CardType, CardType] });
      setSelectedCards([]);
    }
  };
  const handleCallAce = (suit: Suit) => onlineActions.sendAction({ type: 'callAce', suit });
  const handleGoAlone = () => onlineActions.sendAction({ type: 'goAlone' });

  const handleLeave = () => {
    onlineActions.leaveRoom();
  };

  // Get callable suits
  const callableSuits: Suit[] = ['clubs', 'spades', 'hearts'].filter(
    suit => !myHand.some(c => c.suit === suit && c.rank === 'A')
  ) as Suit[];

  // Calculate my role
  const amIPicker = myPosition === pickerPosition;
  const amIPartner = myPlayer?.isPartner || false;
  const amIDefender = pickerPosition !== null && !amIPicker && !amIPartner;

  // Get relative position (0=me, 1-4 clockwise around table)
  const getRelativePosition = (pos: number): number => {
    return (pos - myPosition + 5) % 5;
  };

  // Get player by relative position
  const getPlayerByRelPos = (relPos: number) => {
    const absPos = (myPosition + relPos) % 5;
    return players.find(p => p.position === absPos);
  };

  // Render opponent avatar
  const renderOpponent = (relPos: number, positionClass: string) => {
    const player = getPlayerByRelPos(relPos);
    if (!player) return null;

    const isDealer = player.position === dealerPosition;
    const isCurrent = player.position === currentPlayer;
    const isPicker = player.isPicker;
    const isPartnerRevealed = player.isPartner && calledAce?.revealed;

    return (
      <div className={`absolute ${positionClass} flex flex-col items-center z-10`}>
        <div className={`
          relative w-12 h-12 sm:w-14 sm:h-14 rounded-full border-3
          flex items-center justify-center text-2xl sm:text-3xl
          bg-gray-800 shadow-lg transition-all duration-300
          ${isCurrent ? 'border-blue-400 animate-active-turn' : 'border-gray-600'}
          ${isPicker && !isCurrent ? 'border-yellow-400 animate-picker-glow' : ''}
          ${isPartnerRevealed && !isCurrent ? 'border-green-400' : ''}
        `}>
          {PLAYER_AVATARS[player.position] || '🎭'}

          {/* Dealer badge */}
          {isDealer && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-amber-500 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold text-black border-2 border-amber-700">
              D
            </div>
          )}

          {/* Picker crown */}
          {isPicker && (
            <div className="absolute -top-2 -right-2 text-yellow-400 text-lg">👑</div>
          )}

          {/* Partner badge */}
          {isPartnerRevealed && (
            <div className="absolute -top-2 -right-2 text-green-400 text-lg">🤝</div>
          )}
        </div>

        {/* Name */}
        <span className={`mt-1 text-xs sm:text-sm font-medium ${
          isPicker ? 'text-yellow-400' :
          isPartnerRevealed ? 'text-green-400' :
          isCurrent ? 'text-blue-400' : 'text-gray-300'
        }`}>
          {player.name}
        </span>

        {/* Card count */}
        <span className="text-[10px] text-gray-500">{player.cardCount} cards</span>
      </div>
    );
  };

  // Get my role for display
  const getMyRole = (): 'picker' | 'partner' | 'defender' | null => {
    if (pickerPosition === null) return null;
    if (amIPicker) return 'picker';
    if (amIPartner) return 'partner';
    return 'defender';
  };
  const myRole = getMyRole();

  return (
    <div className="min-h-screen flex flex-col bg-felt-table">
      {/* Vignette overlay */}
      <div className="fixed inset-0 felt-vignette pointer-events-none" />

      {/* Header */}
      <div className="relative z-30 flex justify-between items-center p-2 sm:p-3 bg-black/40">
        <div className="flex items-center gap-2">
          {/* Menu button */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-white p-2 hover:bg-white/10 rounded"
          >
            ☰
          </button>
          <span className="text-sm sm:text-base font-bold text-white">Sheepshead</span>
          <span className="text-xs text-green-300 bg-green-900/50 px-2 py-0.5 rounded">
            Online: {roomCode}
          </span>
        </div>

        {/* Status badges */}
        <div className="flex gap-2 flex-wrap justify-end">
          {myRole && (
            <span className={`px-2 py-1 rounded text-xs font-bold ${
              myRole === 'picker' ? 'bg-yellow-600' :
              myRole === 'partner' ? 'bg-blue-600' : 'bg-red-700'
            }`}>
              {myRole === 'picker' ? '👑 PICKER' :
               myRole === 'partner' ? '🤝 PARTNER' : '⚔️ DEFENDER'}
            </span>
          )}
          {phase === 'playing' && (
            <span className="bg-black/40 px-2 py-1 rounded text-xs text-white">
              Trick {trickNumber}/6
            </span>
          )}
          {calledAce && (
            <span className="bg-purple-600/80 px-2 py-1 rounded text-xs text-white">
              {SUIT_SYMBOLS[calledAce.suit]} called
            </span>
          )}
        </div>
      </div>

      {/* Menu dropdown */}
      {showMenu && (
        <div className="absolute top-12 left-2 z-50 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-1 animate-slide-in">
          <button
            onClick={() => { handleLeave(); setShowMenu(false); }}
            className="w-full text-left px-3 py-2 hover:bg-red-700 text-red-400 hover:text-white text-sm"
          >
            Leave Game
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="relative z-30 bg-red-900/80 p-3 mx-2 mt-2 rounded text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Main game area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Opponent positions around perimeter */}
        {renderOpponent(2, 'top-4 left-1/2 -translate-x-1/2')}
        {renderOpponent(1, 'top-1/4 left-4 sm:left-8')}
        {renderOpponent(3, 'top-1/4 right-4 sm:right-8')}
        {renderOpponent(4, 'top-1/2 right-4 sm:right-8 -translate-y-1/2')}

        {/* Center game area */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 max-w-lg px-4">

            {/* Running score - only after partner revealed */}
            {phase === 'playing' && pickerPosition !== null && calledAce?.revealed && (
              <div className="flex gap-2">
                <span className="bg-yellow-700/90 px-3 py-1 rounded-full text-sm font-bold text-white">
                  👑 {completedTricks.reduce((sum: number, t: any) => {
                    const trickPoints = t.cards?.reduce((pts: number, c: any) => pts + getCardPoints(c.card), 0) || 0;
                    const partnerPos = players.findIndex(p => p.isPartner);
                    const winnerOnPickerTeam = t.winningPlayer === pickerPosition ||
                      (partnerPos !== -1 && t.winningPlayer === partnerPos);
                    return sum + (winnerOnPickerTeam ? trickPoints : 0);
                  }, 0)}/61
                </span>
                <span className="bg-red-700/90 px-3 py-1 rounded-full text-sm font-bold text-white">
                  ⚔️ {completedTricks.reduce((sum: number, t: any) => {
                    const trickPoints = t.cards?.reduce((pts: number, c: any) => pts + getCardPoints(c.card), 0) || 0;
                    const partnerPos = players.findIndex(p => p.isPartner);
                    const winnerOnPickerTeam = t.winningPlayer === pickerPosition ||
                      (partnerPos !== -1 && t.winningPlayer === partnerPos);
                    return sum + (winnerOnPickerTeam ? 0 : trickPoints);
                  }, 0)}/60
                </span>
              </div>
            )}

            {/* Blind - picking phase */}
            {phase === 'picking' && blind > 0 && (
              <div className="text-center">
                <p className="text-white/80 text-lg mb-3 font-medium">
                  {isMyTurn ? 'Pick up the blind?' : `${players.find(p => p.position === currentPlayer)?.name} is deciding...`}
                </p>
                <div className="flex justify-center gap-2">
                  {Array.from({ length: blind }).map((_, i) => (
                    <div key={i} className="w-14 h-20 sm:w-16 sm:h-24 bg-gradient-to-br from-blue-700 to-blue-900 rounded-lg border-2 border-blue-500 flex items-center justify-center shadow-xl animate-card-slide-in">
                      <span className="text-blue-300 text-xl">🐑</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Calling phase */}
            {phase === 'calling' && (
              <div className="text-center">
                <p className="text-white/80 text-lg mb-2 font-medium">
                  {isMyTurn ? 'Call an ace for your partner' : `${players.find(p => p.position === currentPlayer)?.name} is calling...`}
                </p>
              </div>
            )}

            {/* Current trick - playing phase */}
            {phase === 'playing' && (
              <div className="flex gap-2 sm:gap-3 justify-center min-h-[100px] items-center">
                {currentTrick.cards.length === 0 ? (
                  <span className="text-gray-400 text-sm">
                    {isMyTurn ? 'Lead a card' : 'Waiting for lead...'}
                  </span>
                ) : (
                  currentTrick.cards.map((play: any, i: number) => (
                    <div key={i} className="flex flex-col items-center animate-card-slide-in">
                      <Card card={play.card} size="large" />
                      <span className="text-xs mt-1 text-white/70">
                        {play.playedBy === myPosition ? 'You' : players.find(p => p.position === play.playedBy)?.name}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Scoring phase */}
            {phase === 'scoring' && (
              <div className="bg-yellow-600/90 rounded-xl p-4 text-center animate-trick-winner">
                <p className="text-xl font-bold text-white">Hand Complete!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Game Controls */}
      <div className="relative z-20 px-4 py-2">
        {phase === 'picking' && isMyTurn && (
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-3">
              <button onClick={handlePick} className="bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg text-base transition-colors min-h-[44px]">
                Pick
              </button>
              <button onClick={handlePass} className="bg-gray-600 hover:bg-gray-500 active:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg text-base transition-colors min-h-[44px]">
                Pass
              </button>
            </div>
          </div>
        )}

        {phase === 'burying' && isMyTurn && (
          <div className="flex flex-col items-center gap-3">
            <p className="text-white text-base">Select 2 cards to bury ({selectedCards.length}/2)</p>
            <button
              onClick={handleBury}
              disabled={selectedCards.length !== 2}
              className={`font-bold py-3 px-6 rounded-lg text-base transition-colors min-h-[44px] ${
                selectedCards.length === 2
                  ? 'bg-green-500 hover:bg-green-400 text-black'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              Bury Selected
            </button>
          </div>
        )}

        {phase === 'calling' && isMyTurn && (
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-2 flex-wrap justify-center">
              {callableSuits.map(suit => (
                <button
                  key={suit}
                  onClick={() => handleCallAce(suit)}
                  className="bg-white hover:bg-gray-100 text-black font-bold py-3 px-4 rounded-lg text-base transition-colors flex items-center gap-2 min-h-[44px]"
                >
                  <span className={suit === 'hearts' ? 'text-red-600' : 'text-gray-800'}>
                    {SUIT_SYMBOLS[suit]}
                  </span>
                  <span>{suit}</span>
                </button>
              ))}
              <button
                onClick={handleGoAlone}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-4 rounded-lg text-base transition-colors min-h-[44px]"
              >
                Go Alone
              </button>
            </div>
          </div>
        )}

        {phase === 'playing' && isMyTurn && (
          <div className="text-center">
            <p className="text-yellow-300 font-bold text-base">Your turn - tap a card to play</p>
          </div>
        )}

        {phase === 'playing' && !isMyTurn && (
          <div className="text-center">
            <p className="text-green-300 animate-pulse text-base">
              Waiting for {players.find(p => p.position === currentPlayer)?.name}...
            </p>
          </div>
        )}
      </div>

      {/* Your Hand - CURVED FAN at bottom */}
      <div className="relative z-20 pb-4">
        {phase === 'burying' && (
          <div className="text-center mb-2 text-base text-yellow-400 font-medium">
            Select 2 cards to bury
          </div>
        )}

        {/* Curved card fan */}
        <div className="flex justify-center items-end px-2">
          {myHand.map((card, index) => {
            const totalCards = myHand.length;
            const middleIndex = (totalCards - 1) / 2;
            const offset = index - middleIndex;
            const rotation = offset * 4;
            const translateY = Math.abs(offset) * 8;
            const isLegal = legalPlays.some(c => c.id === card.id);
            const isSelected = selectedCards.some(c => c.id === card.id);

            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(card)}
                className={`
                  transition-all duration-300 ease-out cursor-pointer
                  hover:-translate-y-6 hover:scale-110 hover:z-50
                  ${phase === 'playing' && isMyTurn && !isLegal ? 'opacity-40 cursor-not-allowed hover:translate-y-0 hover:scale-100' : ''}
                  ${isSelected ? '-translate-y-8 scale-110 z-40' : ''}
                `}
                style={{
                  transform: `translateY(${isSelected ? -32 : translateY}px) rotate(${rotation}deg)`,
                  marginLeft: index === 0 ? 0 : '-12px',
                  zIndex: isSelected ? 40 : index,
                }}
              >
                <Card
                  card={card}
                  size="xlarge"
                  highlight={phase === 'playing' && isMyTurn && isLegal}
                  selected={isSelected}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Drawer - collapsible scores & log */}
      <div>
        <InfoDrawer
          scores={playerScores}
          pickerPosition={pickerPosition}
          partnerPosition={calledAce?.revealed ? (players.findIndex(p => p.isPartner) as PlayerPosition) : null}
          currentPlayer={currentPlayer}
          handsPlayed={handsPlayed}
          showTips={false}
          phase={phase}
          hand={myHand}
          isPicker={amIPicker}
          isPartner={amIPartner}
          currentTrick={currentTrick}
          calledAce={calledAce}
          gameLog={[]}
          onClearLog={() => {}}
        />
      </div>
    </div>
  );
}
