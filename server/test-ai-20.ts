// Test AI vs AI - Run 20 hands and analyze decisions

import {
  createGameState,
  applyAction,
  calculateScores,
  isAITurn,
  getAIAction,
} from './src/game.js';
import type { Room } from './src/room.js';
import type { GameState, PlayerPosition, Card } from './src/types.js';

// Create a mock room with all AI players
function createMockRoom(): Room {
  return {
    code: 'TEST',
    players: new Map(),
    aiPositions: new Set([0, 1, 2, 3, 4] as PlayerPosition[]),
    hostPosition: 0,
    gameState: null,
    gameStarted: true,
    isPublic: false,
    settings: { partnerVariant: 'calledAce', noPickRule: 'leaster' },
    createdAt: Date.now(),
    playerScores: [0, 0, 0, 0, 0],
    handsPlayed: 0,
    turnStartTime: null,
    turnTimer: null,
    timedOutPlayers: new Set(),
  };
}

function cardToString(card: { suit: string; rank: string }): string {
  const suitSymbols: Record<string, string> = {
    clubs: '♣', spades: '♠', hearts: '♥', diamonds: '♦',
  };
  return `${card.rank}${suitSymbols[card.suit]}`;
}

function isTrump(card: Card): boolean {
  return card.rank === 'Q' || card.rank === 'J' || card.suit === 'diamonds';
}

function getCardPoints(card: Card): number {
  const pts: Record<string, number> = { 'A': 11, '10': 10, 'K': 4, 'Q': 3, 'J': 2 };
  return pts[card.rank] || 0;
}

// Get the suit of a card for following purposes (trump is its own "suit")
function getEffectiveSuit(card: Card): string {
  if (isTrump(card)) return 'trump';
  return card.suit;
}

// Check if a player has any cards of a given effective suit
function hasEffectiveSuit(hand: Card[], suit: string): boolean {
  return hand.some(c => getEffectiveSuit(c) === suit);
}

// Statistics tracking
const stats = {
  totalHands: 0,
  pickerWins: 0,
  defenderWins: 0,
  leasters: 0,
  schneiders: 0, // Loser got < 31
  schwarzs: 0,   // Loser got 0 tricks

  // Bury analysis
  buriedQueens: 0,
  buriedJacks: 0,
  buriedAces: 0,
  buriedPoints: 0,

  // Pick analysis
  picksWithUnder3Trump: 0,
  picksWithUnder2HighTrump: 0,
  passesWithOver4Trump: 0,
  passesWithOver3Queens: 0,

  // Rule violations
  followSuitViolations: 0,
  calledAceViolations: 0,
  illegalPlayAttempts: 0,

  // Issues found
  issues: [] as string[],
};

function analyzeHand(room: Room, handNum: number): void {
  room.gameState = createGameState(room);
  const state = room.gameState;

  let pickerHand: Card[] = [];
  let pickerPosition: number | null = null;
  let buriedCards: Card[] = [];

  // Run game loop
  let actionCount = 0;
  const maxActions = 100;

  while (state.phase !== 'scoring' && state.phase !== 'gameOver' && actionCount < maxActions) {
    actionCount++;

    if (!isAITurn(state, room)) break;

    const position = state.currentPlayer;
    const player = state.players[position];
    const action = getAIAction(state, position);

    // Analyze picking decision
    if (state.phase === 'picking') {
      const hand = player.hand;
      const trumpCount = hand.filter(c => isTrump(c)).length;
      const queens = hand.filter(c => c.rank === 'Q').length;
      const jacks = hand.filter(c => c.rank === 'J').length;
      const highTrump = queens + jacks;

      if (action.type === 'pick') {
        pickerHand = [...hand];
        pickerPosition = position;

        if (trumpCount < 3) {
          stats.picksWithUnder3Trump++;
          stats.issues.push(`Hand ${handNum}: Picked with only ${trumpCount} trump`);
        }
        if (highTrump < 2 && trumpCount < 5) {
          stats.picksWithUnder2HighTrump++;
        }
      } else if (action.type === 'pass') {
        if (trumpCount > 4) {
          stats.passesWithOver4Trump++;
          stats.issues.push(`Hand ${handNum}: Passed with ${trumpCount} trump!`);
        }
        if (queens >= 3) {
          stats.passesWithOver3Queens++;
          stats.issues.push(`Hand ${handNum}: Passed with ${queens} queens!`);
        }
      }
    }

    // Analyze burying decision
    if (state.phase === 'burying' && action.type === 'bury') {
      buriedCards = action.cards;
      for (const card of action.cards) {
        stats.buriedPoints += getCardPoints(card);
        if (card.rank === 'Q') {
          stats.buriedQueens++;
          stats.issues.push(`Hand ${handNum}: BURIED A QUEEN (${cardToString(card)})!`);
        }
        if (card.rank === 'J') {
          stats.buriedJacks++;
          stats.issues.push(`Hand ${handNum}: BURIED A JACK (${cardToString(card)})!`);
        }
        if (card.rank === 'A') {
          stats.buriedAces++;
          stats.issues.push(`Hand ${handNum}: Buried an Ace (${cardToString(card)})`);
        }
      }
    }

    // Check for following suit violations during play
    if (state.phase === 'playing' && action.type === 'playCard') {
      const hand = player.hand;
      const playedCard = action.card;
      const currentTrick = state.currentTrick;

      // If not leading, check following suit
      if (currentTrick.cards.length > 0) {
        const leadCard = currentTrick.cards[0].card;
        const leadSuit = getEffectiveSuit(leadCard);
        const playedSuit = getEffectiveSuit(playedCard);

        // If player has the lead suit but played something else, it's a violation
        if (playedSuit !== leadSuit && hasEffectiveSuit(hand, leadSuit)) {
          stats.followSuitViolations++;
          stats.issues.push(
            `Hand ${handNum}: FOLLOW SUIT VIOLATION! P${position+1} played ${cardToString(playedCard)} ` +
            `when ${leadSuit} was led and they have ${leadSuit} in hand!`
          );
        }
      }

      // Check called ace rule - must play ace if called suit is led
      if (state.calledAce && !state.calledAce.revealed && currentTrick.cards.length > 0) {
        const leadCard = currentTrick.cards[0].card;
        const calledSuit = state.calledAce.suit;

        // If called suit was led (non-trump)
        if (leadCard.suit === calledSuit && !isTrump(leadCard)) {
          // Check if player has the called ace
          const hasCalledAce = hand.some(c => c.suit === calledSuit && c.rank === 'A');
          if (hasCalledAce && !(playedCard.suit === calledSuit && playedCard.rank === 'A')) {
            stats.calledAceViolations++;
            stats.issues.push(
              `Hand ${handNum}: CALLED ACE VIOLATION! P${position+1} has A${calledSuit[0].toUpperCase()} ` +
              `but played ${cardToString(playedCard)} when ${calledSuit} was led!`
            );
          }
        }
      }
    }

    const success = applyAction(state, position, action);
    if (!success) {
      stats.illegalPlayAttempts++;
      stats.issues.push(`Hand ${handNum}: ILLEGAL ACTION by P${position+1}: ${JSON.stringify(action)}`);
    }
  }

  // Analyze results
  if (state.phase === 'scoring') {
    stats.totalHands++;

    // Check if it was a leaster (no picker)
    if (state.pickerPosition === null) {
      stats.leasters++;
      return;
    }

    calculateScores(state, room);

    const pickerPos = state.pickerPosition;
    const partnerPos = state.players.findIndex(p => p.isPartner);

    let pickerTeamPoints = 0;
    let defenderPoints = 0;
    let pickerTricks = 0;
    let defenderTricks = 0;

    for (let i = 0; i < 5; i++) {
      const tricks = state.players[i].tricksWon;
      const playerPoints = tricks.flat().reduce((sum, card) => sum + getCardPoints(card), 0);

      if (i === pickerPos || i === partnerPos) {
        pickerTeamPoints += playerPoints;
        pickerTricks += tricks.length;
      } else {
        defenderPoints += playerPoints;
        defenderTricks += tricks.length;
      }
    }

    // Add buried points
    const buriedPts = state.buried.reduce((sum, card) => sum + getCardPoints(card), 0);
    pickerTeamPoints += buriedPts;

    if (pickerTeamPoints >= 61) {
      stats.pickerWins++;
      if (defenderPoints < 31) stats.schneiders++;
      if (defenderTricks === 0) stats.schwarzs++;
    } else {
      stats.defenderWins++;
      if (pickerTeamPoints < 31) stats.schneiders++;
      if (pickerTricks === 0) stats.schwarzs++;
    }
  }

  room.handsPlayed++;
}

// Main
const NUM_HANDS = 100;
console.log(`SHEEPSHEAD AI ANALYSIS - ${NUM_HANDS} Hands\n`);
console.log('Running simulations...\n');

const room = createMockRoom();

for (let hand = 1; hand <= NUM_HANDS; hand++) {
  process.stdout.write(`Hand ${hand}/${NUM_HANDS}... `);
  analyzeHand(room, hand);
  console.log('done');
}

console.log('\n' + '='.repeat(60));
console.log('RESULTS SUMMARY');
console.log('='.repeat(60));

console.log(`\n📊 GAME OUTCOMES (${stats.totalHands} hands played):`);
console.log(`   Picker wins:    ${stats.pickerWins} (${(stats.pickerWins/stats.totalHands*100).toFixed(1)}%)`);
console.log(`   Defender wins:  ${stats.defenderWins} (${(stats.defenderWins/stats.totalHands*100).toFixed(1)}%)`);
console.log(`   Leasters:       ${stats.leasters}`);
console.log(`   Schneiders:     ${stats.schneiders}`);
console.log(`   Schwarzs:       ${stats.schwarzs}`);

console.log(`\n📦 BURYING ANALYSIS:`);
console.log(`   Queens buried:  ${stats.buriedQueens} ${stats.buriedQueens > 0 ? '❌ BAD!' : '✅'}`);
console.log(`   Jacks buried:   ${stats.buriedJacks} ${stats.buriedJacks > 0 ? '❌ BAD!' : '✅'}`);
console.log(`   Aces buried:    ${stats.buriedAces} ${stats.buriedAces > 2 ? '⚠️ HIGH' : '✅'}`);
console.log(`   Avg points buried: ${(stats.buriedPoints / stats.totalHands).toFixed(1)} per hand`);

console.log(`\n🎯 PICKING ANALYSIS:`);
console.log(`   Picked with <3 trump:     ${stats.picksWithUnder3Trump} ${stats.picksWithUnder3Trump > 0 ? '⚠️' : '✅'}`);
console.log(`   Picked with <2 high trump: ${stats.picksWithUnder2HighTrump} ${stats.picksWithUnder2HighTrump > 3 ? '⚠️' : '✅'}`);
console.log(`   Passed with 5+ trump:     ${stats.passesWithOver4Trump} ${stats.passesWithOver4Trump > 0 ? '❌ BAD!' : '✅'}`);
console.log(`   Passed with 3+ queens:    ${stats.passesWithOver3Queens} ${stats.passesWithOver3Queens > 0 ? '❌ BAD!' : '✅'}`);

console.log(`\n⚖️ RULE VIOLATIONS:`);
console.log(`   Follow suit violations:   ${stats.followSuitViolations} ${stats.followSuitViolations > 0 ? '❌ CRITICAL!' : '✅'}`);
console.log(`   Called ace violations:    ${stats.calledAceViolations} ${stats.calledAceViolations > 0 ? '❌ CRITICAL!' : '✅'}`);
console.log(`   Illegal play attempts:    ${stats.illegalPlayAttempts} ${stats.illegalPlayAttempts > 0 ? '❌ CRITICAL!' : '✅'}`);

// Historical picker win rate is about 65-70%
const expectedPickerWinRate = 0.65;
const actualRate = stats.pickerWins / stats.totalHands;
const rateOk = actualRate >= 0.55 && actualRate <= 0.80;

console.log(`\n📈 WIN RATE ANALYSIS:`);
console.log(`   Expected picker win rate: ~65-70%`);
console.log(`   Actual picker win rate:   ${(actualRate*100).toFixed(1)}% ${rateOk ? '✅' : '⚠️'}`);

if (stats.issues.length > 0) {
  console.log(`\n⚠️ ISSUES FOUND (${stats.issues.length}):`);
  for (const issue of stats.issues.slice(0, 10)) {
    console.log(`   - ${issue}`);
  }
  if (stats.issues.length > 10) {
    console.log(`   ... and ${stats.issues.length - 10} more`);
  }
} else {
  console.log(`\n✅ NO MAJOR ISSUES FOUND!`);
}

console.log(`\n${'='.repeat(60)}`);
console.log('FINAL SCORES:');
console.log('='.repeat(60));
for (let i = 0; i < 5; i++) {
  console.log(`  AI-${i + 1}: ${room.playerScores[i]}`);
}

// Overall assessment
console.log(`\n${'='.repeat(60)}`);
console.log('OVERALL ASSESSMENT:');
console.log('='.repeat(60));

let grade = 'A';
let feedback = [];

// Critical rule violations = automatic F
if (stats.followSuitViolations > 0) {
  grade = 'F';
  feedback.push(`AI violated follow suit rules ${stats.followSuitViolations} times - CRITICAL BUG!`);
}
if (stats.calledAceViolations > 0) {
  grade = 'F';
  feedback.push(`AI violated called ace rules ${stats.calledAceViolations} times - CRITICAL BUG!`);
}
if (stats.illegalPlayAttempts > 0) {
  grade = 'F';
  feedback.push(`AI made ${stats.illegalPlayAttempts} illegal play attempts - CRITICAL BUG!`);
}
if (stats.buriedQueens > 0 || stats.buriedJacks > 0) {
  grade = 'F';
  feedback.push('AI is burying Queens/Jacks - critical bug!');
}
if (stats.passesWithOver4Trump > 0 || stats.passesWithOver3Queens > 0) {
  grade = grade === 'A' ? 'C' : grade;
  feedback.push('AI passes with very strong hands');
}
if (actualRate < 0.50) {
  grade = grade === 'A' ? 'C' : grade;
  feedback.push('Picker win rate too low');
}
if (actualRate > 0.85) {
  grade = grade === 'A' ? 'B' : grade;
  feedback.push('Picker win rate suspiciously high');
}
if (stats.buriedAces > 5) {
  grade = grade === 'A' ? 'B' : grade;
  feedback.push('AI buries aces too often');
}

if (feedback.length === 0) {
  feedback.push('AI is making reasonable decisions!');
}

console.log(`\n   GRADE: ${grade}`);
for (const f of feedback) {
  console.log(`   • ${f}`);
}
console.log('');
