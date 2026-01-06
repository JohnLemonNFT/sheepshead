// Test AI vs AI - Run 3 hands and log all decisions

import {
  createGameState,
  applyAction,
  calculateScores,
  isAITurn,
  getAIAction,
} from './src/game.js';
import type { Room } from './src/room.js';
import type { GameState, PlayerPosition } from './src/types.js';

// Create a mock room with all AI players
function createMockRoom(): Room {
  return {
    code: 'TEST',
    players: new Map(), // Empty = all AI
    aiPositions: new Set([0, 1, 2, 3, 4] as PlayerPosition[]),
    hostPosition: 0,
    gameState: null,
    gameStarted: true,
    playerScores: [0, 0, 0, 0, 0],
    handsPlayed: 0,
  };
}

function getPlayerName(pos: number): string {
  return `AI-${pos + 1}`;
}

function cardToString(card: { suit: string; rank: string }): string {
  const suitSymbols: Record<string, string> = {
    clubs: '♣',
    spades: '♠',
    hearts: '♥',
    diamonds: '♦',
  };
  return `${card.rank}${suitSymbols[card.suit]}`;
}

function runHand(room: Room, handNum: number): void {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`HAND #${handNum}`);
  console.log(`${'='.repeat(60)}\n`);

  // Create new game state
  room.gameState = createGameState(room);
  const state = room.gameState;

  // Show initial hands
  console.log('DEALT HANDS:');
  for (let i = 0; i < 5; i++) {
    const hand = state.players[i].hand.map(cardToString).join(' ');
    console.log(`  ${getPlayerName(i)}: ${hand}`);
  }
  console.log(`  Blind: ${state.blind.map(cardToString).join(' ')}`);
  console.log(`  Dealer: ${getPlayerName(state.dealerPosition)}`);
  console.log(`  First to pick: ${getPlayerName(state.currentPlayer)}`);
  console.log('');

  // Run game loop
  let actionCount = 0;
  const maxActions = 100; // Safety limit

  while (state.phase !== 'scoring' && state.phase !== 'gameOver' && actionCount < maxActions) {
    actionCount++;

    if (!isAITurn(state, room)) {
      console.log(`ERROR: Not AI turn but no human players! Phase: ${state.phase}, Current: ${state.currentPlayer}`);
      break;
    }

    const position = state.currentPlayer;
    const action = getAIAction(state, position);

    // Log the decision
    let actionDesc = '';
    switch (action.type) {
      case 'pick':
        actionDesc = 'PICKS up the blind';
        break;
      case 'pass':
        actionDesc = 'PASSES';
        break;
      case 'bury':
        actionDesc = `BURIES ${action.cards.map(cardToString).join(', ')}`;
        break;
      case 'callAce':
        actionDesc = `CALLS ${action.suit.toUpperCase()} ace`;
        break;
      case 'goAlone':
        actionDesc = 'GOES ALONE';
        break;
      case 'playCard':
        actionDesc = `plays ${cardToString(action.card)}`;
        break;
    }

    // Add context based on phase
    if (state.phase === 'picking') {
      const trumpCount = state.players[position].hand.filter(c =>
        c.rank === 'Q' || c.rank === 'J' || c.suit === 'diamonds'
      ).length;
      console.log(`[${state.phase.toUpperCase()}] ${getPlayerName(position)} ${actionDesc} (has ${trumpCount} trump)`);
    } else if (state.phase === 'playing') {
      const trickNum = state.trickNumber;
      const cardsInTrick = state.currentTrick.cards.length;
      const leadInfo = cardsInTrick > 0
        ? `(led: ${cardToString(state.currentTrick.cards[0].card)})`
        : '(leading)';
      console.log(`  [Trick ${trickNum}] ${getPlayerName(position)} ${actionDesc} ${leadInfo}`);
    } else {
      console.log(`[${state.phase.toUpperCase()}] ${getPlayerName(position)} ${actionDesc}`);
    }

    // Apply the action
    const success = applyAction(state, position, action);
    if (!success) {
      console.log(`ERROR: Action failed!`);
      break;
    }

    // Check for trick completion
    if (state.phase === 'playing' && state.currentTrick.cards.length === 0 && actionCount > 1) {
      // Trick just completed
      const lastTrick = state.completedTricks[state.completedTricks.length - 1];
      if (lastTrick) {
        const points = lastTrick.cards.reduce((sum, c) => {
          const pts: Record<string, number> = { 'A': 11, '10': 10, 'K': 4, 'Q': 3, 'J': 2 };
          return sum + (pts[c.card.rank] || 0);
        }, 0);
        console.log(`  >> ${getPlayerName(lastTrick.winningPlayer!)} wins trick (+${points} pts)\n`);
      }
    }
  }

  // Calculate scores
  if (state.phase === 'scoring') {
    calculateScores(state, room);

    console.log('\nHAND RESULTS:');

    // Calculate points for each team
    const pickerPos = state.pickerPosition;
    const partnerPos = state.players.findIndex(p => p.isPartner);

    let pickerTeamPoints = 0;
    let defenderPoints = 0;

    for (let i = 0; i < 5; i++) {
      const playerPoints = state.players[i].tricksWon.flat().reduce((sum, card) => {
        const pts: Record<string, number> = { 'A': 11, '10': 10, 'K': 4, 'Q': 3, 'J': 2 };
        return sum + (pts[card.rank] || 0);
      }, 0);

      if (i === pickerPos || i === partnerPos) {
        pickerTeamPoints += playerPoints;
      } else {
        defenderPoints += playerPoints;
      }
    }

    // Add buried points to picker
    const buriedPoints = state.buried.reduce((sum, card) => {
      const pts: Record<string, number> = { 'A': 11, '10': 10, 'K': 4, 'Q': 3, 'J': 2 };
      return sum + (pts[card.rank] || 0);
    }, 0);
    pickerTeamPoints += buriedPoints;

    console.log(`  Picker: ${getPlayerName(pickerPos!)} ${partnerPos >= 0 ? `+ Partner: ${getPlayerName(partnerPos)}` : '(alone)'}`);
    console.log(`  Picker team: ${pickerTeamPoints} points ${pickerTeamPoints >= 61 ? '(WIN)' : '(LOSE)'}`);
    console.log(`  Defenders: ${defenderPoints} points ${defenderPoints >= 60 ? '(WIN)' : '(LOSE)'}`);
    console.log(`  Buried: ${state.buried.map(cardToString).join(', ')} (${buriedPoints} pts)`);

    console.log('\n  SCORES:');
    for (let i = 0; i < 5; i++) {
      console.log(`    ${getPlayerName(i)}: ${room.playerScores[i]}`);
    }
  }

  room.handsPlayed++;
}

// Main
console.log('SHEEPSHEAD AI TEST - 3 Hands\n');

const room = createMockRoom();

for (let hand = 1; hand <= 3; hand++) {
  runHand(room, hand);
}

console.log(`\n${'='.repeat(60)}`);
console.log('FINAL SCORES:');
console.log(`${'='.repeat(60)}`);
for (let i = 0; i < 5; i++) {
  console.log(`  ${getPlayerName(i)}: ${room.playerScores[i]}`);
}
