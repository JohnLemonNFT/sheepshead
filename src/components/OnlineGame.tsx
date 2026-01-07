// Online Game - Game view for online multiplayer

import { useState, useCallback } from 'react';
import { Card } from './Card';
import { TrumpReference } from './TrumpReference';
import type { OnlineGameState, OnlineGameActions } from '../hooks/useOnlineGame';
import type { Card as CardType, PlayerPosition, Suit } from '../game/types';
import { isTrump, getCardPoints } from '../game/types';

const SUIT_SYMBOLS: Record<string, string> = {
  clubs: '♣',
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
};

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

  // Calculate my role
  const amIPicker = myPosition === pickerPosition;
  const amIPartner = myPlayer?.isPartner || false;
  const amIDefender = pickerPosition !== null && !amIPicker && !amIPartner;
  const pickerPlayer = pickerPosition !== null ? players.find(p => p.position === pickerPosition) : null;

  // Calculate running score
  const calculateRunningScore = () => {
    let pickerTeamPoints = 0;
    let defenderPoints = 0;

    // Add points from completed tricks (simplified - server should track this)
    // For now just show current trick points
    const currentTrickPoints = currentTrick.cards.reduce((sum, play) => sum + getCardPoints(play.card), 0);

    return { pickerTeamPoints, defenderPoints, currentTrickPoints };
  };
  const { currentTrickPoints } = calculateRunningScore();

  return (
    <div className="min-h-screen text-white bg-gradient-to-b from-green-900 via-green-800 to-green-900">
      {/* Header */}
      <div className="flex justify-between items-center p-2 sm:p-3 bg-black/30">
        <div className="flex items-center gap-2">
          <span className="text-lg sm:text-xl font-bold text-white">Sheepshead</span>
          <span className="text-xs sm:text-sm text-green-300 bg-green-900/50 px-2 py-0.5 rounded">
            Room: {roomCode}
          </span>
        </div>
        <button
          onClick={handleLeave}
          className="bg-red-600 hover:bg-red-500 px-3 py-1.5 rounded text-sm font-medium"
        >
          Leave
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/80 p-3 mx-2 mt-2 rounded text-red-200 text-sm">
          {error}
        </div>
      )}

      <div className="p-2 sm:p-4 max-w-4xl mx-auto">
        {/* Players strip */}
        <div className="flex justify-center gap-1 sm:gap-2 mb-3 flex-wrap">
          {players.map(p => (
            <div
              key={p.position}
              className={`
                px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm flex items-center gap-1
                ${p.position === currentPlayer ? 'ring-2 ring-green-400' : ''}
                ${p.position === myPosition ? 'bg-green-700' : 'bg-gray-800/80'}
                ${p.isPicker ? 'ring-2 ring-yellow-400' : ''}
              `}
            >
              {p.isPicker && <span>👑</span>}
              <span className={p.position === myPosition ? 'font-bold' : ''}>
                {p.position === myPosition ? 'You' : p.name}
              </span>
              <span className="text-gray-400">{p.cardCount}</span>
            </div>
          ))}
        </div>

        {/* Role Banner - shows when picker is determined */}
        {pickerPosition !== null && phase === 'playing' && (
          <div className={`
            rounded-lg p-2 sm:p-3 mb-3 text-center
            ${amIPicker ? 'bg-yellow-600' : amIPartner ? 'bg-blue-600' : 'bg-red-700'}
          `}>
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg sm:text-xl">
                {amIPicker ? '👑' : amIPartner ? '🤝' : '⚔️'}
              </span>
              <span className="font-bold text-sm sm:text-base">
                {amIPicker ? 'PICKER' : amIPartner ? 'PARTNER' : 'DEFENDER'}
              </span>
              {pickerPlayer && !amIPicker && (
                <span className="text-xs sm:text-sm opacity-80">
                  vs {pickerPlayer.name}
                </span>
              )}
            </div>
            {/* Called Ace info */}
            {calledAce && (
              <div className="text-xs sm:text-sm mt-1 opacity-90">
                Called: <span className={calledAce.suit === 'hearts' ? 'text-red-300' : ''}>
                  {SUIT_SYMBOLS[calledAce.suit]} {calledAce.suit}
                </span>
                {calledAce.revealed && <span className="ml-1 text-green-300">✓ revealed</span>}
              </div>
            )}
          </div>
        )}

        {/* Game Info Bar */}
        <div className="flex justify-center items-center gap-2 sm:gap-4 mb-2 text-xs sm:text-sm">
          <span className="text-green-300/80">Trick {trickNumber}/6</span>
          {calledAce && !pickerPosition && (
            <span className="text-yellow-300">
              Called: {SUIT_SYMBOLS[calledAce.suit]} {calledAce.suit}
            </span>
          )}
          <TrumpReference />
        </div>

        {/* Current Trick */}
        <div className="bg-green-800/50 rounded-xl p-3 sm:p-4 mb-3 border border-green-600/30">
          <div className="flex justify-center gap-1 sm:gap-2 min-h-[80px] sm:min-h-[100px] items-center">
            {currentTrick.cards.length === 0 ? (
              <span className="text-gray-400">Waiting for lead...</span>
            ) : (
              currentTrick.cards.map((play, i) => {
                const player = players.find(p => p.position === play.playedBy);
                return (
                  <div key={i} className="text-center">
                    <Card card={play.card} small />
                    <div className="text-[10px] sm:text-xs mt-1 text-green-200 truncate max-w-[50px]">
                      {play.playedBy === myPosition ? 'You' : player?.name}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {currentTrickPoints > 0 && (
            <div className="text-center text-xs text-yellow-300 mt-1">
              🎯 {currentTrickPoints} points at stake
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mb-3">
          {phase === 'picking' && isMyTurn && (
            <div className="bg-gray-800/80 rounded-lg p-3 sm:p-4 text-center">
              <p className="text-sm sm:text-base mb-2">Pick up the blind?</p>
              <div className="flex justify-center gap-3">
                <button onClick={handlePick} className="bg-yellow-500 hover:bg-yellow-400 text-black px-5 sm:px-6 py-2.5 rounded-lg font-bold text-sm sm:text-base">
                  Pick
                </button>
                <button onClick={handlePass} className="bg-gray-600 hover:bg-gray-500 px-5 sm:px-6 py-2.5 rounded-lg font-bold text-sm sm:text-base">
                  Pass
                </button>
              </div>
            </div>
          )}

          {phase === 'burying' && isMyTurn && (
            <div className="bg-gray-800/80 rounded-lg p-3 sm:p-4 text-center">
              <p className="text-sm sm:text-base mb-2">Select 2 cards to bury ({selectedCards.length}/2)</p>
              <button
                onClick={handleBury}
                disabled={selectedCards.length !== 2}
                className="bg-green-500 hover:bg-green-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-black px-5 sm:px-6 py-2.5 rounded-lg font-bold text-sm sm:text-base"
              >
                Bury Selected
              </button>
            </div>
          )}

          {phase === 'calling' && isMyTurn && (
            <div className="bg-gray-800/80 rounded-lg p-3 sm:p-4 text-center">
              <p className="text-sm sm:text-base mb-2">Call an ace for your partner</p>
              <div className="flex justify-center gap-2 flex-wrap">
                {callableSuits.map(suit => (
                  <button
                    key={suit}
                    onClick={() => handleCallAce(suit)}
                    className="bg-white hover:bg-gray-100 text-black px-4 py-2 rounded-lg font-bold flex items-center gap-1"
                  >
                    <span className={suit === 'hearts' ? 'text-red-600' : 'text-gray-800'}>
                      {SUIT_SYMBOLS[suit]}
                    </span>
                    <span className="text-sm">{suit}</span>
                  </button>
                ))}
                <button
                  onClick={handleGoAlone}
                  className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg font-bold text-sm"
                >
                  Go Alone
                </button>
              </div>
            </div>
          )}

          {phase === 'playing' && isMyTurn && (
            <div className="text-center">
              <p className="text-yellow-300 font-bold text-sm sm:text-base">Your turn - tap a card to play</p>
            </div>
          )}

          {phase === 'playing' && !isMyTurn && (
            <div className="text-center">
              <p className="text-green-300 animate-pulse text-sm sm:text-base">
                Waiting for {players.find(p => p.position === currentPlayer)?.name}...
              </p>
            </div>
          )}

          {phase === 'scoring' && (
            <div className="bg-yellow-600/80 rounded-lg p-3 text-center">
              <p className="font-bold">Hand complete!</p>
            </div>
          )}
        </div>

        {/* My Hand */}
        <div className="bg-gray-900/80 rounded-xl p-3 sm:p-4 border border-green-600/30">
          <div className="text-center mb-2">
            <span className="text-green-300 text-sm sm:text-base font-medium">
              Your Hand
              {amIPicker && <span className="ml-1 text-yellow-400">(Picker)</span>}
              {amIPartner && calledAce?.revealed && <span className="ml-1 text-blue-400">(Partner)</span>}
            </span>
          </div>
          <div className="flex flex-wrap gap-1 sm:gap-1.5 justify-center">
            {myHand.map(card => {
              const isLegal = legalPlays.some(c => c.id === card.id);
              const isSelected = selectedCards.some(c => c.id === card.id);
              return (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card)}
                  className={`
                    cursor-pointer transition-all duration-200
                    ${phase === 'playing' && isMyTurn && isLegal ? 'hover:-translate-y-2 hover:scale-105' : ''}
                    ${phase === 'playing' && isMyTurn && !isLegal ? 'opacity-50 cursor-not-allowed' : ''}
                    ${isSelected ? '-translate-y-3 scale-105 ring-2 ring-green-400' : ''}
                  `}
                >
                  <Card
                    card={card}
                    highlight={phase === 'playing' && isMyTurn && isLegal}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Scores */}
        <div className="mt-3 flex justify-center gap-2 text-xs sm:text-sm">
          {players.map((p, i) => (
            <div key={i} className={`
              px-2 py-1 rounded
              ${p.position === myPosition ? 'bg-green-700' : 'bg-gray-800/60'}
            `}>
              <span className="text-gray-400">{p.position === myPosition ? 'You' : p.name}:</span>
              <span className="font-bold ml-1">{playerScores[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
