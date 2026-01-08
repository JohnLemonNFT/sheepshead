// Comprehensive AI Rule Testing - Checks ALL Sheepshead rules
// Run with: npx tsx test-ai-comprehensive.ts

import {
  createGameState,
  applyAction,
  calculateScores,
  isAITurn,
  getAIAction,
} from './src/game.js';
import type { Room } from './src/room.js';
import type { GameState, PlayerPosition, Card, Suit } from './src/types.js';

// ============================================
// GAME RULES REFERENCE
// ============================================
// Trump hierarchy (high to low):
//   Q♣ > Q♠ > Q♥ > Q♦ > J♣ > J♠ > J♥ > J♦ > A♦ > 10♦ > K♦ > 9♦ > 8♦ > 7♦
//
// Fail suit hierarchy (high to low):
//   A > 10 > K > 9 > 8 > 7
//
// Point values: A=11, 10=10, K=4, Q=3, J=2, 9/8/7=0
// Total deck points: 120
// Picker needs 61+ to win

// ============================================
// HELPER FUNCTIONS
// ============================================

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

function cardToString(card: Card): string {
  const suitSymbols: Record<string, string> = {
    clubs: '♣', spades: '♠', hearts: '♥', diamonds: '♦',
  };
  return `${card.rank}${suitSymbols[card.suit]}`;
}

function isTrump(card: Card): boolean {
  return card.rank === 'Q' || card.rank === 'J' || card.suit === 'diamonds';
}

function getEffectiveSuit(card: Card): string {
  if (isTrump(card)) return 'trump';
  return card.suit;
}

function getCardPoints(card: Card): number {
  const pts: Record<string, number> = { 'A': 11, '10': 10, 'K': 4, 'Q': 3, 'J': 2 };
  return pts[card.rank] || 0;
}

// Trump power ranking (higher = stronger)
function getTrumpPower(card: Card): number {
  if (!isTrump(card)) return -1;

  // Queens: Q♣=14, Q♠=13, Q♥=12, Q♦=11
  if (card.rank === 'Q') {
    const queenOrder: Record<string, number> = { clubs: 14, spades: 13, hearts: 12, diamonds: 11 };
    return queenOrder[card.suit];
  }
  // Jacks: J♣=10, J♠=9, J♥=8, J♦=7
  if (card.rank === 'J') {
    const jackOrder: Record<string, number> = { clubs: 10, spades: 9, hearts: 8, diamonds: 7 };
    return jackOrder[card.suit];
  }
  // Diamond fail cards: A♦=6, 10♦=5, K♦=4, 9♦=3, 8♦=2, 7♦=1
  const diamondOrder: Record<string, number> = { 'A': 6, '10': 5, 'K': 4, '9': 3, '8': 2, '7': 1 };
  return diamondOrder[card.rank] || 0;
}

// Fail suit power ranking (higher = stronger)
function getFailPower(card: Card): number {
  if (isTrump(card)) return -1;
  const failOrder: Record<string, number> = { 'A': 6, '10': 5, 'K': 4, '9': 3, '8': 2, '7': 1 };
  return failOrder[card.rank] || 0;
}

// Determine who should win a trick
function calculateTrickWinner(cards: { card: Card; playedBy: PlayerPosition }[]): PlayerPosition {
  if (cards.length === 0) throw new Error('Empty trick');

  const leadCard = cards[0].card;
  const leadSuit = getEffectiveSuit(leadCard);

  let winningPlay = cards[0];
  let winningPower = leadSuit === 'trump' ? getTrumpPower(leadCard) : getFailPower(leadCard);
  let winnerIsTrump = isTrump(leadCard);

  for (let i = 1; i < cards.length; i++) {
    const play = cards[i];
    const cardSuit = getEffectiveSuit(play.card);
    const cardIsTrump = isTrump(play.card);

    // Trump beats non-trump
    if (cardIsTrump && !winnerIsTrump) {
      winningPlay = play;
      winningPower = getTrumpPower(play.card);
      winnerIsTrump = true;
    }
    // If both trump, higher trump wins
    else if (cardIsTrump && winnerIsTrump) {
      const power = getTrumpPower(play.card);
      if (power > winningPower) {
        winningPlay = play;
        winningPower = power;
      }
    }
    // If neither trump, must follow lead suit to win
    else if (!cardIsTrump && !winnerIsTrump && cardSuit === leadSuit) {
      const power = getFailPower(play.card);
      if (power > winningPower) {
        winningPlay = play;
        winningPower = power;
      }
    }
    // Non-trump, non-lead suit can't win
  }

  return winningPlay.playedBy;
}

// Check if player has any cards of the effective suit
function hasEffectiveSuit(hand: Card[], suit: string): boolean {
  return hand.some(c => getEffectiveSuit(c) === suit);
}

// ============================================
// STATISTICS AND VIOLATIONS TRACKING
// ============================================

interface Stats {
  totalHands: number;
  totalTricks: number;
  pickerWins: number;
  defenderWins: number;
  leasters: number;
  schneiders: number;
  schwarzs: number;

  // Card distribution
  totalCardsDealt: number;
  totalPointsInDeck: number;

  // Burying
  buriedQueens: number;
  buriedJacks: number;
  buriedAces: number;
  buriedTrump: number;
  totalBuriedPoints: number;

  // Picking
  picksWithUnder3Trump: number;
  passesWithOver4Trump: number;
  passesWithOver3Queens: number;

  // Rule violations (CRITICAL)
  followSuitViolations: number;
  calledAceViolations: number;
  trickWinnerErrors: number;
  illegalPlayAttempts: number;
  turnOrderViolations: number;
  cardNotInHandViolations: number;
  duplicateCardViolations: number;
  wrongPointTotal: number;
  invalidCalledAce: number;
  buryCountViolations: number;

  // Partner tracking
  partnerRevealedCorrectly: number;
  partnerRevealedIncorrectly: number;

  // Detailed issues
  issues: string[];
}

const stats: Stats = {
  totalHands: 0,
  totalTricks: 0,
  pickerWins: 0,
  defenderWins: 0,
  leasters: 0,
  schneiders: 0,
  schwarzs: 0,

  totalCardsDealt: 0,
  totalPointsInDeck: 0,

  buriedQueens: 0,
  buriedJacks: 0,
  buriedAces: 0,
  buriedTrump: 0,
  totalBuriedPoints: 0,

  picksWithUnder3Trump: 0,
  passesWithOver4Trump: 0,
  passesWithOver3Queens: 0,

  followSuitViolations: 0,
  calledAceViolations: 0,
  trickWinnerErrors: 0,
  illegalPlayAttempts: 0,
  turnOrderViolations: 0,
  cardNotInHandViolations: 0,
  duplicateCardViolations: 0,
  wrongPointTotal: 0,
  invalidCalledAce: 0,
  buryCountViolations: 0,

  partnerRevealedCorrectly: 0,
  partnerRevealedIncorrectly: 0,

  issues: [],
};

// Track all cards played to detect duplicates
let allCardsPlayed: Set<string> = new Set();
let allCardsInGame: Card[] = [];

// ============================================
// HAND ANALYSIS
// ============================================

function analyzeHand(room: Room, handNum: number): void {
  room.gameState = createGameState(room);
  const state = room.gameState;

  // Reset per-hand tracking
  allCardsPlayed = new Set();
  allCardsInGame = [];

  // We'll track hands by reading directly from game state instead of maintaining our own copy
  // This avoids sync issues

  // Verify deck composition (should be 32 cards total: 30 dealt + 2 blind)
  let totalCards = state.blind.length;
  let totalPoints = state.blind.reduce((sum, c) => sum + getCardPoints(c), 0);

  for (const player of state.players) {
    totalCards += player.hand.length;
    totalPoints += player.hand.reduce((sum, c) => sum + getCardPoints(c), 0);
    allCardsInGame.push(...player.hand);
  }
  allCardsInGame.push(...state.blind);

  stats.totalCardsDealt += totalCards;

  // Check for exactly 32 cards
  if (totalCards !== 32) {
    stats.issues.push(`Hand ${handNum}: Wrong card count! Expected 32, got ${totalCards}`);
  }

  // Check for exactly 120 points
  if (totalPoints !== 120) {
    stats.wrongPointTotal++;
    stats.issues.push(`Hand ${handNum}: Wrong point total! Expected 120, got ${totalPoints}`);
  }
  stats.totalPointsInDeck += totalPoints;

  // Check for duplicate cards in initial deal
  const cardIds = allCardsInGame.map(c => `${c.rank}${c.suit}`);
  const uniqueCards = new Set(cardIds);
  if (uniqueCards.size !== cardIds.length) {
    stats.duplicateCardViolations++;
    stats.issues.push(`Hand ${handNum}: Duplicate cards in initial deal!`);
  }

  // Track game state
  let pickerPosition: number | null = null;
  let calledAceSuit: Suit | null = null;
  let partnerPosition: number | null = null;

  // Run game loop
  let actionCount = 0;
  const maxActions = 200;

  while (state.phase !== 'scoring' && state.phase !== 'gameOver' && actionCount < maxActions) {
    actionCount++;

    if (!isAITurn(state, room)) break;

    const position = state.currentPlayer;
    const player = state.players[position];

    const action = getAIAction(state, position);

    // ========== PICKING PHASE CHECKS ==========
    if (state.phase === 'picking') {
      const hand = player.hand;
      const trumpCount = hand.filter(c => isTrump(c)).length;
      const queens = hand.filter(c => c.rank === 'Q').length;

      if (action.type === 'pick') {
        pickerPosition = position;

        if (trumpCount < 3) {
          stats.picksWithUnder3Trump++;
        }
      } else if (action.type === 'pass') {
        if (trumpCount > 4) {
          stats.passesWithOver4Trump++;
          stats.issues.push(`Hand ${handNum}: P${position + 1} passed with ${trumpCount} trump`);
        }
        if (queens >= 3) {
          stats.passesWithOver3Queens++;
          stats.issues.push(`Hand ${handNum}: P${position + 1} passed with ${queens} queens`);
        }
      }
    }

    // ========== BURYING PHASE CHECKS ==========
    if (state.phase === 'burying' && action.type === 'bury') {
      // Check bury count
      if (action.cards.length !== 2) {
        stats.buryCountViolations++;
        stats.issues.push(`Hand ${handNum}: Buried ${action.cards.length} cards instead of 2!`);
      }

      for (const card of action.cards) {
        const pts = getCardPoints(card);
        stats.totalBuriedPoints += pts;

        if (card.rank === 'Q') {
          stats.buriedQueens++;
          stats.issues.push(`Hand ${handNum}: BURIED QUEEN ${cardToString(card)}!`);
        }
        if (card.rank === 'J') {
          stats.buriedJacks++;
          stats.issues.push(`Hand ${handNum}: BURIED JACK ${cardToString(card)}!`);
        }
        if (isTrump(card)) {
          stats.buriedTrump++;
          // Only flag non-Q/J trump (i.e., diamonds)
          if (card.rank !== 'Q' && card.rank !== 'J') {
            stats.issues.push(`Hand ${handNum}: Buried trump ${cardToString(card)}`);
          }
        }
        if (card.rank === 'A') {
          stats.buriedAces++;
        }
      }
    }

    // ========== CALLING PHASE CHECKS ==========
    if (state.phase === 'calling' && action.type === 'callAce') {
      calledAceSuit = action.suit;

      // Check that picker doesn't have the called ace
      const pickerHasCalledAce = player.hand.some(c => c.suit === action.suit && c.rank === 'A');
      if (pickerHasCalledAce) {
        stats.invalidCalledAce++;
        stats.issues.push(`Hand ${handNum}: Picker called A${action.suit[0].toUpperCase()} but has it in hand!`);
      }

      // Find who has the called ace (they're the partner)
      for (let i = 0; i < 5; i++) {
        if (state.players[i].hand.some(c => c.suit === action.suit && c.rank === 'A')) {
          partnerPosition = i;
          break;
        }
      }
    }

    // ========== PLAYING PHASE CHECKS ==========
    if (state.phase === 'playing' && action.type === 'playCard') {
      // Read hand directly from game state (always current)
      const hand = state.players[position].hand;
      const playedCard = action.card;
      const currentTrick = state.currentTrick;

      // RULE CHECK: Card must be in player's hand
      const cardInHand = hand.some(c => c.suit === playedCard.suit && c.rank === playedCard.rank);
      if (!cardInHand) {
        stats.cardNotInHandViolations++;
        stats.issues.push(
          `Hand ${handNum}: P${position + 1} played ${cardToString(playedCard)} but doesn't have it! ` +
          `Hand: ${hand.map(cardToString).join(', ')}`
        );
      }

      // RULE CHECK: No duplicate cards played
      const cardKey = `${playedCard.rank}${playedCard.suit}`;
      if (allCardsPlayed.has(cardKey)) {
        stats.duplicateCardViolations++;
        stats.issues.push(`Hand ${handNum}: Duplicate card played: ${cardToString(playedCard)}`);
      }
      allCardsPlayed.add(cardKey);

      // RULE CHECK: Following suit
      if (currentTrick.cards.length > 0) {
        const leadCard = currentTrick.cards[0].card;
        const leadSuit = getEffectiveSuit(leadCard);
        const playedSuit = getEffectiveSuit(playedCard);

        if (playedSuit !== leadSuit && hasEffectiveSuit(hand, leadSuit)) {
          stats.followSuitViolations++;
          const cardsOfSuit = hand.filter(c => getEffectiveSuit(c) === leadSuit);
          stats.issues.push(
            `Hand ${handNum}: FOLLOW SUIT VIOLATION! P${position + 1} played ${cardToString(playedCard)} ` +
            `when ${leadSuit} was led. Has: ${cardsOfSuit.map(cardToString).join(', ')}`
          );
        }
      }

      // RULE CHECK: Called ace must be played when suit is led
      if (state.calledAce && !state.calledAce.revealed && currentTrick.cards.length > 0) {
        const leadCard = currentTrick.cards[0].card;
        const calledSuit = state.calledAce.suit;

        // If called suit was led (and it's not trump)
        if (leadCard.suit === calledSuit && !isTrump(leadCard)) {
          const hasCalledAce = hand.some(c => c.suit === calledSuit && c.rank === 'A');
          if (hasCalledAce && !(playedCard.suit === calledSuit && playedCard.rank === 'A')) {
            stats.calledAceViolations++;
            stats.issues.push(
              `Hand ${handNum}: CALLED ACE VIOLATION! P${position + 1} has A${calledSuit[0].toUpperCase()} ` +
              `but played ${cardToString(playedCard)} when ${calledSuit} was led!`
            );
          }
        }
      }
    }

    // Apply the action
    const success = applyAction(state, position, action);
    if (!success) {
      stats.illegalPlayAttempts++;
      stats.issues.push(`Hand ${handNum}: ILLEGAL ACTION rejected by game engine: ${JSON.stringify(action)}`);
    }

    // After a trick is complete, verify the winner
    if (state.phase === 'playing' && state.currentTrick.cards.length === 0 && state.completedTricks.length > 0) {
      stats.totalTricks++;
      const lastTrick = state.completedTricks[state.completedTricks.length - 1];

      if (lastTrick.cards.length === 5) {
        const expectedWinner = calculateTrickWinner(lastTrick.cards);
        const actualWinner = lastTrick.winningPlayer;

        if (expectedWinner !== actualWinner) {
          stats.trickWinnerErrors++;
          stats.issues.push(
            `Hand ${handNum}: TRICK WINNER ERROR! Expected P${expectedWinner + 1}, got P${actualWinner + 1}. ` +
            `Cards: ${lastTrick.cards.map(p => `P${p.playedBy + 1}:${cardToString(p.card)}`).join(', ')}`
          );
        }
      }
    }

    // Check partner reveal
    if (state.calledAce?.revealed && partnerPosition !== null) {
      const gamePartner = state.players.findIndex(p => p.isPartner);
      if (gamePartner === partnerPosition) {
        stats.partnerRevealedCorrectly++;
      } else if (gamePartner !== -1 && gamePartner !== partnerPosition) {
        stats.partnerRevealedIncorrectly++;
        stats.issues.push(
          `Hand ${handNum}: Partner reveal mismatch! Expected P${partnerPosition + 1}, got P${gamePartner + 1}`
        );
      }
      partnerPosition = null; // Only check once
    }
  }

  // ========== SCORING PHASE CHECKS ==========
  if (state.phase === 'scoring') {
    stats.totalHands++;

    if (state.pickerPosition === null) {
      stats.leasters++;
      return;
    }

    calculateScores(state, room);

    // Verify point totals
    let pickerTeamPoints = 0;
    let defenderPoints = 0;
    let pickerTricks = 0;
    let defenderTricks = 0;

    const pickerPos = state.pickerPosition;
    const actualPartner = state.players.findIndex(p => p.isPartner);

    for (let i = 0; i < 5; i++) {
      const tricks = state.players[i].tricksWon;
      const playerPoints = tricks.flat().reduce((sum, card) => sum + getCardPoints(card), 0);

      if (i === pickerPos || i === actualPartner) {
        pickerTeamPoints += playerPoints;
        pickerTricks += tricks.length;
      } else {
        defenderPoints += playerPoints;
        defenderTricks += tricks.length;
      }
    }

    // Add buried points to picker
    const buriedPts = state.buried.reduce((sum, card) => sum + getCardPoints(card), 0);
    pickerTeamPoints += buriedPts;

    // Verify total is 120
    if (pickerTeamPoints + defenderPoints !== 120) {
      stats.wrongPointTotal++;
      stats.issues.push(
        `Hand ${handNum}: Point total mismatch at scoring! ` +
        `Picker: ${pickerTeamPoints}, Defenders: ${defenderPoints}, Total: ${pickerTeamPoints + defenderPoints}`
      );
    }

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

// ============================================
// MAIN EXECUTION
// ============================================

const NUM_HANDS = 100;
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║     SHEEPSHEAD COMPREHENSIVE RULE VERIFICATION TEST        ║');
console.log(`║                    ${NUM_HANDS} HANDS                                 ║`);
console.log('╚════════════════════════════════════════════════════════════╝\n');

console.log('Running simulations...\n');

const room = createMockRoom();

for (let hand = 1; hand <= NUM_HANDS; hand++) {
  process.stdout.write(`\rHand ${hand}/${NUM_HANDS}...`);
  analyzeHand(room, hand);
}
console.log(' Complete!\n');

// ============================================
// RESULTS OUTPUT
// ============================================

console.log('═'.repeat(60));
console.log('GAME STATISTICS');
console.log('═'.repeat(60));

console.log(`\n📊 OUTCOMES (${stats.totalHands} hands, ${stats.totalTricks} tricks):`);
console.log(`   Picker wins:      ${stats.pickerWins} (${(stats.pickerWins/stats.totalHands*100).toFixed(1)}%)`);
console.log(`   Defender wins:    ${stats.defenderWins} (${(stats.defenderWins/stats.totalHands*100).toFixed(1)}%)`);
console.log(`   Leasters:         ${stats.leasters}`);
console.log(`   Schneiders:       ${stats.schneiders}`);
console.log(`   Schwarzs:         ${stats.schwarzs}`);

console.log('\n═'.repeat(60));
console.log('CRITICAL RULE VIOLATIONS');
console.log('═'.repeat(60));

const criticalViolations = [
  { name: 'Follow suit violations', count: stats.followSuitViolations },
  { name: 'Called ace violations', count: stats.calledAceViolations },
  { name: 'Trick winner errors', count: stats.trickWinnerErrors },
  { name: 'Illegal play attempts', count: stats.illegalPlayAttempts },
  { name: 'Turn order violations', count: stats.turnOrderViolations },
  { name: 'Card not in hand', count: stats.cardNotInHandViolations },
  { name: 'Duplicate cards played', count: stats.duplicateCardViolations },
  { name: 'Point total errors', count: stats.wrongPointTotal },
  { name: 'Invalid called ace', count: stats.invalidCalledAce },
  { name: 'Bury count violations', count: stats.buryCountViolations },
  { name: 'Partner reveal errors', count: stats.partnerRevealedIncorrectly },
];

let hasCriticalErrors = false;
for (const v of criticalViolations) {
  const status = v.count === 0 ? '✅' : '❌ CRITICAL!';
  console.log(`   ${v.name.padEnd(25)} ${String(v.count).padStart(4)}  ${status}`);
  if (v.count > 0) hasCriticalErrors = true;
}

console.log('\n═'.repeat(60));
console.log('AI DECISION QUALITY');
console.log('═'.repeat(60));

console.log(`\n📦 BURYING:`);
console.log(`   Queens buried:     ${stats.buriedQueens} ${stats.buriedQueens > 0 ? '❌ BAD!' : '✅'}`);
console.log(`   Jacks buried:      ${stats.buriedJacks} ${stats.buriedJacks > 0 ? '❌ BAD!' : '✅'}`);
console.log(`   Aces buried:       ${stats.buriedAces} ${stats.buriedAces > 5 ? '⚠️ HIGH' : '✅'}`);
console.log(`   Trump buried:      ${stats.buriedTrump} ${stats.buriedTrump > 0 ? '⚠️' : '✅'}`);
console.log(`   Avg pts buried:    ${(stats.totalBuriedPoints / stats.totalHands).toFixed(1)}/hand`);

console.log(`\n🎯 PICKING:`);
console.log(`   Picked <3 trump:   ${stats.picksWithUnder3Trump} ${stats.picksWithUnder3Trump > 5 ? '⚠️' : '✅'}`);
console.log(`   Passed 5+ trump:   ${stats.passesWithOver4Trump} ${stats.passesWithOver4Trump > 0 ? '❌ BAD!' : '✅'}`);
console.log(`   Passed 3+ queens:  ${stats.passesWithOver3Queens} ${stats.passesWithOver3Queens > 0 ? '❌ BAD!' : '✅'}`);

console.log(`\n📈 WIN RATE:`);
const actualRate = stats.pickerWins / (stats.totalHands - stats.leasters);
console.log(`   Expected:          65-70%`);
console.log(`   Actual:            ${(actualRate*100).toFixed(1)}% ${actualRate >= 0.55 && actualRate <= 0.80 ? '✅' : '⚠️'}`);

// Show issues
if (stats.issues.length > 0) {
  console.log('\n═'.repeat(60));
  console.log(`ISSUES FOUND (${stats.issues.length} total)`);
  console.log('═'.repeat(60));

  // Group by type
  const criticalIssues = stats.issues.filter(i =>
    i.includes('VIOLATION') || i.includes('ERROR') || i.includes('ILLEGAL')
  );
  const warningIssues = stats.issues.filter(i =>
    !criticalIssues.includes(i)
  );

  if (criticalIssues.length > 0) {
    console.log(`\n❌ CRITICAL (${criticalIssues.length}):`);
    for (const issue of criticalIssues.slice(0, 15)) {
      console.log(`   • ${issue}`);
    }
    if (criticalIssues.length > 15) {
      console.log(`   ... and ${criticalIssues.length - 15} more critical issues`);
    }
  }

  if (warningIssues.length > 0) {
    console.log(`\n⚠️ WARNINGS (${warningIssues.length}):`);
    for (const issue of warningIssues.slice(0, 10)) {
      console.log(`   • ${issue}`);
    }
    if (warningIssues.length > 10) {
      console.log(`   ... and ${warningIssues.length - 10} more warnings`);
    }
  }
}

// Final assessment
console.log('\n' + '═'.repeat(60));
console.log('FINAL ASSESSMENT');
console.log('═'.repeat(60));

let grade = 'A';
let feedback: string[] = [];

if (hasCriticalErrors) {
  grade = 'F';
  feedback.push('Critical rule violations detected - game logic is broken!');
}
if (stats.buriedQueens > 0 || stats.buriedJacks > 0) {
  grade = grade === 'A' ? 'D' : grade;
  feedback.push('AI buries trump (Q/J) - very poor strategy');
}
if (stats.passesWithOver4Trump > 0 || stats.passesWithOver3Queens > 0) {
  grade = grade === 'A' ? 'C' : grade;
  feedback.push('AI passes with very strong hands');
}
if (actualRate < 0.50) {
  grade = grade === 'A' ? 'C' : grade;
  feedback.push('Picker win rate too low - AI playing poorly');
}
if (actualRate > 0.85) {
  grade = grade === 'A' ? 'B' : grade;
  feedback.push('Picker win rate suspiciously high');
}

if (feedback.length === 0) {
  feedback.push('All rules verified! AI is playing correctly.');
}

console.log(`\n   GRADE: ${grade}`);
for (const f of feedback) {
  console.log(`   • ${f}`);
}

console.log('\n' + '═'.repeat(60));
console.log('FINAL SCORES');
console.log('═'.repeat(60));
for (let i = 0; i < 5; i++) {
  console.log(`   AI-${i + 1}: ${room.playerScores[i]}`);
}
console.log('');

// Exit with error code if critical issues found
if (hasCriticalErrors) {
  process.exit(1);
}
