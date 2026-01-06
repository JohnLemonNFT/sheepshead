// Online Game - Game view for online multiplayer

import { useState, useCallback } from 'react';
import { Card } from './Card';
import type { OnlineGameState, OnlineGameActions } from '../hooks/useOnlineGame';
import type { Card as CardType, PlayerPosition, Suit } from '../game/types';
import { isTrump } from '../game/types';

interface OnlineGameProps {
  onlineState: OnlineGameState;
  onlineActions: OnlineGameActions;
}

export function OnlineGame({ onlineState, onlineActions }: OnlineGameProps) {
  const { myPosition, gameState, error, roomCode } = onlineState;
  const [selectedCards, setSelectedCards] = useState<CardType[]>([]);

  // Loading state
  if (!gameState || myPosition === null) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gray-900">
        <div className="text-center">
          <div className="text-4xl mb-4">Loading game...</div>
          <div className="text-gray-400">Room: {roomCode}</div>
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
    pickerPosition,
    calledAce,
    trickNumber,
    playerScores,
    handsPlayed,
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

  return (
    <div className="min-h-screen p-4 text-white bg-gray-900">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-green-400 font-bold">Online Game</span>
            <span className="text-gray-400 ml-2">Room: {roomCode}</span>
          </div>
          <button
            onClick={handleLeave}
            className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded"
          >
            Leave
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/50 p-3 rounded mb-4 text-red-300">
            {error}
          </div>
        )}

        {/* Game Info */}
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-gray-400 text-sm">Phase</div>
              <div className="font-bold">{phase}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Trick</div>
              <div className="font-bold">{trickNumber}/6</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Turn</div>
              <div className={`font-bold ${isMyTurn ? 'text-green-400' : ''}`}>
                {isMyTurn ? 'YOUR TURN' : players.find(p => p.position === currentPlayer)?.name}
              </div>
            </div>
          </div>
        </div>

        {/* Players */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          {players.map(p => (
            <div
              key={p.position}
              className={`
                bg-gray-800 rounded p-2 text-center text-sm
                ${p.position === currentPlayer ? 'ring-2 ring-green-400' : ''}
                ${p.position === myPosition ? 'bg-blue-900' : ''}
              `}
            >
              <div className="truncate">{p.name}</div>
              <div className="text-xs text-gray-400">
                {p.cardCount} cards
                {p.isPicker && ' 👑'}
              </div>
            </div>
          ))}
        </div>

        {/* Current Trick */}
        <div className="bg-green-900/50 rounded-lg p-4 mb-4">
          <div className="text-center text-sm text-gray-400 mb-2">Current Trick</div>
          <div className="flex justify-center gap-2 min-h-[100px] items-center">
            {currentTrick.cards.length === 0 ? (
              <span className="text-gray-500">Waiting for lead...</span>
            ) : (
              currentTrick.cards.map((play, i) => (
                <div key={i} className="text-center">
                  <Card card={play.card} />
                  <div className="text-xs mt-1">
                    {players.find(p => p.position === play.playedBy)?.name}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          {phase === 'picking' && isMyTurn && (
            <div className="flex justify-center gap-4">
              <button onClick={handlePick} className="bg-green-600 hover:bg-green-500 px-6 py-3 rounded-lg font-bold">
                Pick
              </button>
              <button onClick={handlePass} className="bg-red-600 hover:bg-red-500 px-6 py-3 rounded-lg font-bold">
                Pass
              </button>
            </div>
          )}

          {phase === 'burying' && isMyTurn && (
            <div className="text-center">
              <div className="mb-2">Select 2 cards to bury ({selectedCards.length}/2)</div>
              <button
                onClick={handleBury}
                disabled={selectedCards.length !== 2}
                className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 px-6 py-3 rounded-lg font-bold"
              >
                Bury Cards
              </button>
            </div>
          )}

          {phase === 'calling' && isMyTurn && (
            <div className="text-center">
              <div className="mb-2">Call your partner's ace</div>
              <div className="flex justify-center gap-2 flex-wrap">
                {callableSuits.map(suit => (
                  <button
                    key={suit}
                    onClick={() => handleCallAce(suit)}
                    className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded font-bold"
                  >
                    {suit}
                  </button>
                ))}
                <button
                  onClick={handleGoAlone}
                  className="bg-yellow-600 hover:bg-yellow-500 px-4 py-2 rounded font-bold"
                >
                  Go Alone
                </button>
              </div>
            </div>
          )}

          {phase === 'playing' && !isMyTurn && (
            <div className="text-center text-gray-400">
              Waiting for {players.find(p => p.position === currentPlayer)?.name}...
            </div>
          )}

          {phase === 'playing' && isMyTurn && (
            <div className="text-center text-green-400 font-bold">
              Click a card to play!
            </div>
          )}

          {phase === 'scoring' && (
            <div className="text-center text-yellow-400">
              Hand complete! Next hand starting...
            </div>
          )}
        </div>

        {/* My Hand */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-2">Your Hand ({myHand.length} cards)</div>
          <div className="flex flex-wrap gap-1 justify-center">
            {myHand.map(card => {
              const isLegal = legalPlays.some(c => c.id === card.id);
              const isSelected = selectedCards.some(c => c.id === card.id);
              return (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card)}
                  className={`
                    cursor-pointer transition-transform
                    ${isLegal ? 'hover:scale-110' : 'opacity-50'}
                    ${isSelected ? 'ring-2 ring-yellow-400 -translate-y-2' : ''}
                  `}
                >
                  <Card card={card} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Scores */}
        <div className="mt-4 bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-2">Scores (Hand #{handsPlayed + 1})</div>
          <div className="flex justify-around">
            {players.map((p, i) => (
              <div key={i} className="text-center">
                <div className="text-xs text-gray-400">{p.name}</div>
                <div className="font-bold">{playerScores[i]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
