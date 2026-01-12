// ============================================
// GAME LOGGING - Structured data capture for AI training
// ============================================

import { Card, Suit, GameState, PlayerPosition, isTrump, getCardPoints } from '../types';
import { evaluateHandStrength } from './tracking';

// ============================================
// TYPES
// ============================================

/**
 * A single decision point with full context
 */
export interface DecisionRecord {
  // Context
  gameId: string;
  handNumber: number;
  decisionType: 'pick' | 'bury' | 'call' | 'play';
  playerPosition: PlayerPosition;
  isHuman: boolean;
  timestamp: number;

  // Hand state
  hand: Card[];
  handStrength: HandStrengthSnapshot;

  // Game context
  trickNumber?: number;
  currentTrick?: { card: Card; playedBy: PlayerPosition }[];
  cardsPlayed: Card[]; // All cards played so far in hand
  pickerPosition: PlayerPosition | null;
  partnerPosition: PlayerPosition | null;
  calledSuit: Suit | null;

  // The decision made
  decision: DecisionData;

  // Outcome (filled in after hand completes)
  outcome?: DecisionOutcome;
}

export interface HandStrengthSnapshot {
  trumpCount: number;
  highTrump: boolean; // Has queen
  failAces: number;
  voidSuits: Suit[];
  pointsInHand: number;
}

export type DecisionData =
  | { type: 'pick'; picked: boolean }
  | { type: 'bury'; cardsBuried: [Card, Card] }
  | { type: 'call'; suit: Suit | null; goAlone: boolean; callTen: boolean }
  | { type: 'play'; cardPlayed: Card; legalPlays: Card[] };

export interface DecisionOutcome {
  // Did picker team win this hand?
  pickerWon: boolean;
  // Points picker team scored
  pickerPoints: number;
  // Was this specific decision good? (heuristic evaluation)
  wasGoodDecision: boolean;
  // Explanation for training
  outcomeReason: string;
}

/**
 * Complete hand record for analysis
 */
export interface HandRecord {
  gameId: string;
  handNumber: number;
  timestamp: number;

  // Initial deal
  initialHands: Record<PlayerPosition, Card[]>;
  blind: [Card, Card];

  // Decisions made
  decisions: DecisionRecord[];

  // Final outcome
  pickerPosition: PlayerPosition | null;
  partnerPosition: PlayerPosition | null;
  calledSuit: Suit | null;
  goAlone: boolean;
  pickerPoints: number;
  pickerWon: boolean;
  schneider: boolean;
  schwarz: boolean;

  // Trick-by-trick results
  tricks: TrickRecord[];
}

export interface TrickRecord {
  trickNumber: number;
  cards: { card: Card; playedBy: PlayerPosition }[];
  winner: PlayerPosition;
  points: number;
}

/**
 * In-memory game log store
 */
export interface GameLogStore {
  hands: HandRecord[];
  currentHand: Partial<HandRecord> | null;
  decisions: DecisionRecord[]; // Current hand's decisions
}

// ============================================
// SINGLETON STORE
// ============================================

let gameLogStore: GameLogStore = {
  hands: [],
  currentHand: null,
  decisions: [],
};

// ============================================
// LOGGING FUNCTIONS
// ============================================

/**
 * Start logging a new hand
 */
export function startHandLog(
  gameId: string,
  handNumber: number,
  initialHands: Record<PlayerPosition, Card[]>,
  blind: [Card, Card]
): void {
  gameLogStore.currentHand = {
    gameId,
    handNumber,
    timestamp: Date.now(),
    initialHands: { ...initialHands },
    blind: [...blind],
    decisions: [],
    tricks: [],
    pickerPosition: null,
    partnerPosition: null,
    calledSuit: null,
    goAlone: false,
    pickerPoints: 0,
    pickerWon: false,
    schneider: false,
    schwarz: false,
  };
  gameLogStore.decisions = [];
}

/**
 * Log a pick decision
 */
export function logPickDecision(
  gameId: string,
  handNumber: number,
  playerPosition: PlayerPosition,
  isHuman: boolean,
  hand: Card[],
  picked: boolean,
  cardsPlayed: Card[] = []
): void {
  const record: DecisionRecord = {
    gameId,
    handNumber,
    decisionType: 'pick',
    playerPosition,
    isHuman,
    timestamp: Date.now(),
    hand: [...hand],
    handStrength: createHandStrengthSnapshot(hand),
    cardsPlayed: [...cardsPlayed],
    pickerPosition: null,
    partnerPosition: null,
    calledSuit: null,
    decision: { type: 'pick', picked },
  };

  gameLogStore.decisions.push(record);
}

/**
 * Log a bury decision
 */
export function logBuryDecision(
  gameId: string,
  handNumber: number,
  playerPosition: PlayerPosition,
  isHuman: boolean,
  hand: Card[],
  cardsBuried: [Card, Card],
  pickerPosition: PlayerPosition
): void {
  const record: DecisionRecord = {
    gameId,
    handNumber,
    decisionType: 'bury',
    playerPosition,
    isHuman,
    timestamp: Date.now(),
    hand: [...hand],
    handStrength: createHandStrengthSnapshot(hand),
    cardsPlayed: [],
    pickerPosition,
    partnerPosition: null,
    calledSuit: null,
    decision: { type: 'bury', cardsBuried },
  };

  gameLogStore.decisions.push(record);
}

/**
 * Log a call decision
 */
export function logCallDecision(
  gameId: string,
  handNumber: number,
  playerPosition: PlayerPosition,
  isHuman: boolean,
  hand: Card[],
  suit: Suit | null,
  goAlone: boolean,
  callTen: boolean
): void {
  const record: DecisionRecord = {
    gameId,
    handNumber,
    decisionType: 'call',
    playerPosition,
    isHuman,
    timestamp: Date.now(),
    hand: [...hand],
    handStrength: createHandStrengthSnapshot(hand),
    cardsPlayed: [],
    pickerPosition: playerPosition,
    partnerPosition: null,
    calledSuit: suit,
    decision: { type: 'call', suit, goAlone, callTen },
  };

  gameLogStore.decisions.push(record);
}

/**
 * Log a play decision
 */
export function logPlayDecision(
  gameId: string,
  handNumber: number,
  playerPosition: PlayerPosition,
  isHuman: boolean,
  hand: Card[],
  cardPlayed: Card,
  legalPlays: Card[],
  trickNumber: number,
  currentTrick: { card: Card; playedBy: PlayerPosition }[],
  cardsPlayed: Card[],
  pickerPosition: PlayerPosition | null,
  partnerPosition: PlayerPosition | null,
  calledSuit: Suit | null
): void {
  const record: DecisionRecord = {
    gameId,
    handNumber,
    decisionType: 'play',
    playerPosition,
    isHuman,
    timestamp: Date.now(),
    hand: [...hand],
    handStrength: createHandStrengthSnapshot(hand),
    trickNumber,
    currentTrick: currentTrick.map(c => ({ ...c })),
    cardsPlayed: [...cardsPlayed],
    pickerPosition,
    partnerPosition,
    calledSuit,
    decision: { type: 'play', cardPlayed, legalPlays: [...legalPlays] },
  };

  gameLogStore.decisions.push(record);
}

/**
 * Log a trick completion
 */
export function logTrickResult(
  trickNumber: number,
  cards: { card: Card; playedBy: PlayerPosition }[],
  winner: PlayerPosition,
  points: number
): void {
  if (gameLogStore.currentHand) {
    gameLogStore.currentHand.tricks = gameLogStore.currentHand.tricks || [];
    gameLogStore.currentHand.tricks.push({
      trickNumber,
      cards: cards.map(c => ({ ...c })),
      winner,
      points,
    });
  }
}

/**
 * Complete the hand log with final results
 */
export function completeHandLog(
  pickerPosition: PlayerPosition | null,
  partnerPosition: PlayerPosition | null,
  calledSuit: Suit | null,
  goAlone: boolean,
  pickerPoints: number,
  pickerWon: boolean,
  schneider: boolean,
  schwarz: boolean
): HandRecord | null {
  if (!gameLogStore.currentHand) return null;

  // Update decisions with outcomes
  const decisions = gameLogStore.decisions.map(d => ({
    ...d,
    outcome: evaluateDecisionOutcome(d, pickerPoints, pickerWon),
  }));

  const handRecord: HandRecord = {
    ...(gameLogStore.currentHand as HandRecord),
    decisions,
    pickerPosition,
    partnerPosition,
    calledSuit,
    goAlone,
    pickerPoints,
    pickerWon,
    schneider,
    schwarz,
  };

  gameLogStore.hands.push(handRecord);
  gameLogStore.currentHand = null;
  gameLogStore.decisions = [];

  return handRecord;
}

// ============================================
// ANALYSIS HELPERS
// ============================================

function createHandStrengthSnapshot(hand: Card[]): HandStrengthSnapshot {
  const eval_ = evaluateHandStrength(hand);
  return {
    trumpCount: eval_.trumpCount,
    highTrump: eval_.hasHighTrump,
    failAces: eval_.failAces,
    voidSuits: eval_.voidSuits,
    pointsInHand: eval_.pointsInHand,
  };
}

/**
 * Evaluate if a decision was good based on outcome
 */
function evaluateDecisionOutcome(
  decision: DecisionRecord,
  pickerPoints: number,
  pickerWon: boolean
): DecisionOutcome {
  const isPicker = decision.playerPosition === decision.pickerPosition;
  const playerWon = isPicker ? pickerWon : !pickerWon;

  let wasGoodDecision = playerWon; // Default: good if your team won
  let outcomeReason = playerWon ? 'Team won the hand' : 'Team lost the hand';

  // More nuanced evaluation based on decision type
  if (decision.decision.type === 'pick') {
    const pickDecision = decision.decision;
    if (pickDecision.picked) {
      // Picked - was it a good pick?
      if (pickerWon && pickerPoints >= 90) {
        wasGoodDecision = true;
        outcomeReason = 'Excellent pick - schneider!';
      } else if (pickerWon) {
        wasGoodDecision = true;
        outcomeReason = 'Good pick - won the hand';
      } else if (pickerPoints >= 45) {
        wasGoodDecision = false;
        outcomeReason = 'Marginal pick - close loss';
      } else {
        wasGoodDecision = false;
        outcomeReason = 'Bad pick - significant loss';
      }
    } else {
      // Passed - was it right to pass?
      // Can't fully evaluate without knowing what would have happened
      wasGoodDecision = true; // Assume passing was reasonable
      outcomeReason = 'Passed on hand';
    }
  }

  return { pickerWon, pickerPoints, wasGoodDecision, outcomeReason };
}

// ============================================
// DATA ACCESS
// ============================================

/**
 * Get all logged hands
 */
export function getLoggedHands(): HandRecord[] {
  return [...gameLogStore.hands];
}

/**
 * Get human-only decisions for training
 */
export function getHumanDecisions(): DecisionRecord[] {
  return gameLogStore.hands
    .flatMap(h => h.decisions)
    .filter(d => d.isHuman);
}

/**
 * Get decisions filtered by type and outcome
 */
export function getDecisionsByType(
  type: DecisionRecord['decisionType'],
  onlyHuman: boolean = false,
  onlyGood: boolean = false
): DecisionRecord[] {
  return gameLogStore.hands
    .flatMap(h => h.decisions)
    .filter(d => d.decisionType === type)
    .filter(d => !onlyHuman || d.isHuman)
    .filter(d => !onlyGood || d.outcome?.wasGoodDecision);
}

/**
 * Export logs as JSON for external analysis
 */
export function exportLogs(): string {
  return JSON.stringify({
    exportDate: new Date().toISOString(),
    totalHands: gameLogStore.hands.length,
    hands: gameLogStore.hands,
  }, null, 2);
}

/**
 * Import logs from JSON
 */
export function importLogs(json: string): number {
  const data = JSON.parse(json);
  if (data.hands && Array.isArray(data.hands)) {
    gameLogStore.hands.push(...data.hands);
    return data.hands.length;
  }
  return 0;
}

/**
 * Clear all logs
 */
export function clearLogs(): void {
  gameLogStore.hands = [];
  gameLogStore.currentHand = null;
  gameLogStore.decisions = [];
}

/**
 * Get statistics on logged games
 */
export function getLogStats(): {
  totalHands: number;
  humanDecisions: number;
  aiDecisions: number;
  pickRate: number;
  avgPickerPoints: number;
  pickerWinRate: number;
} {
  const hands = gameLogStore.hands;
  const allDecisions = hands.flatMap(h => h.decisions);
  const humanDecisions = allDecisions.filter(d => d.isHuman).length;
  const aiDecisions = allDecisions.filter(d => !d.isHuman).length;

  const pickDecisions = hands.flatMap(h => h.decisions).filter(d =>
    d.decisionType === 'pick' && (d.decision as { picked: boolean }).picked
  );

  const handsWithPicker = hands.filter(h => h.pickerPosition !== null);
  const pickerWins = handsWithPicker.filter(h => h.pickerWon).length;
  const avgPoints = handsWithPicker.length > 0
    ? handsWithPicker.reduce((sum, h) => sum + h.pickerPoints, 0) / handsWithPicker.length
    : 0;

  return {
    totalHands: hands.length,
    humanDecisions,
    aiDecisions,
    pickRate: hands.length > 0 ? handsWithPicker.length / hands.length : 0,
    avgPickerPoints: avgPoints,
    pickerWinRate: handsWithPicker.length > 0 ? pickerWins / handsWithPicker.length : 0,
  };
}
