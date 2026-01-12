// ============================================
// MONTE CARLO SIMULATION - Simulate outcomes to improve AI decisions
// ============================================

import {
  Card,
  Suit,
  PlayerPosition,
  isTrump,
  getCardPoints,
  FAIL_SUITS,
} from '../types';
import { createDeck, shuffleDeck, dealCards, sortHand } from '../deck';
import { getLegalPlays, getCallableSuits, determineTrickWinner } from '../rules';
import { decideBury } from './bury';
import { decideCall } from './call';
import { decidePlay } from './play';
import { createInitialKnowledge, updateKnowledgeAfterPlay, AIGameKnowledge, evaluateHandStrength } from './tracking';

// ============================================
// TYPES
// ============================================

export interface MonteCarloResult {
  winRate: number;
  avgPoints: number;
  simulations: number;
  confidence: number; // 0-1 based on sample size
}

export interface PickSimulationResult {
  pickResult: MonteCarloResult;
  passResult: MonteCarloResult;
  recommendation: 'pick' | 'pass';
  recommendationStrength: number; // 0-1, how strongly we recommend
}

export interface PlaySimulationResult {
  cardResults: Map<string, MonteCarloResult>; // cardId -> result
  bestCard: Card;
  confidence: number;
}

// ============================================
// CONFIGURATION
// ============================================

// Number of simulations per decision point
// More = more accurate but slower
const DEFAULT_SIMULATIONS = 100;
const QUICK_SIMULATIONS = 30;
const THOROUGH_SIMULATIONS = 200;

// ============================================
// MONTE CARLO FOR PICK DECISION
// ============================================

/**
 * Simulate outcomes for picking vs passing
 * This helps evaluate marginal hands where rule-based logic is uncertain
 */
export function simulatePickDecision(
  hand: Card[],
  position: PlayerPosition,
  passCount: number,
  numSimulations: number = DEFAULT_SIMULATIONS
): PickSimulationResult {
  // Simulate picking
  const pickResult = simulateIfPick(hand, position, numSimulations);

  // Simulate passing (someone else picks, or leaster)
  const passResult = simulateIfPass(hand, position, passCount, numSimulations);

  // Compare results
  // For picker: win rate and points matter
  // For passer: win rate as defender matters (typically ~35% baseline)
  const pickValue = pickResult.winRate * pickResult.avgPoints;
  const passValue = passResult.winRate * passResult.avgPoints;

  // Recommendation: pick if expected value is higher
  // We weight win rate heavily because losing costs double
  const pickScore = pickResult.winRate * 2 + (pickResult.avgPoints / 120);
  const passScore = passResult.winRate + (passResult.avgPoints / 120);

  const recommendation = pickScore > passScore ? 'pick' : 'pass';
  const recommendationStrength = Math.abs(pickScore - passScore) / Math.max(pickScore, passScore);

  return {
    pickResult,
    passResult,
    recommendation,
    recommendationStrength: Math.min(1, recommendationStrength),
  };
}

/**
 * Simulate outcomes if this player picks
 */
function simulateIfPick(
  hand: Card[],
  position: PlayerPosition,
  numSimulations: number
): MonteCarloResult {
  let wins = 0;
  let totalPoints = 0;

  for (let i = 0; i < numSimulations; i++) {
    // Generate random blind (2 cards from remaining deck)
    const result = simulateHandAsPicker(hand, position);
    if (result.pickerWon) wins++;
    totalPoints += result.pickerPoints;
  }

  return {
    winRate: wins / numSimulations,
    avgPoints: totalPoints / numSimulations,
    simulations: numSimulations,
    confidence: Math.min(1, numSimulations / 100),
  };
}

/**
 * Simulate a full hand where the given player picks
 */
function simulateHandAsPicker(
  originalHand: Card[],
  pickerPosition: PlayerPosition
): { pickerWon: boolean; pickerPoints: number } {
  // Create deck and remove picker's hand
  const fullDeck = createDeck();
  const remainingCards = fullDeck.filter(c =>
    !originalHand.some(h => h.id === c.id)
  );

  // Shuffle remaining cards
  const shuffled = shuffleArray(remainingCards);

  // Deal blind (first 2 cards)
  const blind: [Card, Card] = [shuffled[0], shuffled[1]];
  const deckForOthers = shuffled.slice(2);

  // Picker gets hand + blind
  const pickerHand = [...originalHand, ...blind];

  // Deal to other players (6 cards each)
  const otherHands: Card[][] = [[], [], [], []];
  let cardIndex = 0;
  for (let i = 0; i < 5; i++) {
    if (i === pickerPosition) continue;
    const otherIndex = i < pickerPosition ? i : i - 1;
    for (let j = 0; j < 6; j++) {
      otherHands[otherIndex].push(deckForOthers[cardIndex++]);
    }
  }

  // Bury phase
  const buryDecision = decideBury(pickerHand, null);
  const buried = buryDecision.cardsToBury;
  const handAfterBury = pickerHand.filter(c => !buried.some(b => b.id === c.id));

  // Call phase
  const callDecision = decideCall(handAfterBury, true);
  const calledSuit = callDecision.suit;
  const wentAlone = callDecision.goAlone;

  // Assemble hands array
  const hands: Card[][] = [];
  let otherIdx = 0;
  for (let i = 0; i < 5; i++) {
    if (i === pickerPosition) {
      hands.push(sortHand(handAfterBury));
    } else {
      hands.push(sortHand(otherHands[otherIdx++]));
    }
  }

  // Find partner
  let partnerPosition: PlayerPosition | null = null;
  if (calledSuit && !wentAlone) {
    for (let i = 0; i < 5; i++) {
      if (i === pickerPosition) continue;
      if (hands[i].some(c => c.suit === calledSuit && c.rank === 'A' && !isTrump(c))) {
        partnerPosition = i as PlayerPosition;
        break;
      }
    }
  }

  // Simulate tricks
  const result = simulateTricks(hands, pickerPosition, partnerPosition, calledSuit, buried);
  return result;
}

/**
 * Simulate outcomes if this player passes
 */
function simulateIfPass(
  hand: Card[],
  position: PlayerPosition,
  passCount: number,
  numSimulations: number
): MonteCarloResult {
  let wins = 0;
  let totalPoints = 0;

  for (let i = 0; i < numSimulations; i++) {
    const result = simulateHandAsDefender(hand, position, passCount);
    if (result.defenderWon) wins++;
    totalPoints += result.defenderPoints;
  }

  return {
    winRate: wins / numSimulations,
    avgPoints: totalPoints / numSimulations,
    simulations: numSimulations,
    confidence: Math.min(1, numSimulations / 100),
  };
}

/**
 * Simulate a hand where someone else picks
 */
function simulateHandAsDefender(
  originalHand: Card[],
  defenderPosition: PlayerPosition,
  passCount: number
): { defenderWon: boolean; defenderPoints: number } {
  // Create deck and remove defender's hand
  const fullDeck = createDeck();
  const remainingCards = fullDeck.filter(c =>
    !originalHand.some(h => h.id === c.id)
  );

  const shuffled = shuffleArray(remainingCards);

  // Blind
  const blind: [Card, Card] = [shuffled[0], shuffled[1]];
  const deckForOthers = shuffled.slice(2);

  // Deal to other 4 players
  const otherHands: Card[][] = [];
  let cardIndex = 0;
  for (let i = 0; i < 4; i++) {
    const playerHand: Card[] = [];
    for (let j = 0; j < 6; j++) {
      playerHand.push(deckForOthers[cardIndex++]);
    }
    otherHands.push(playerHand);
  }

  // Determine who picks (next player after passCount)
  // Simplified: pick the player with strongest hand
  let pickerPosition: PlayerPosition | null = null;
  let pickerHand: Card[] = [];

  // Check remaining players in order after passCount
  let otherIdx = 0;
  for (let i = 0; i < 5; i++) {
    if (i === defenderPosition) continue;

    // This player is at position (passCount + checks) in pick order
    const hand = otherHands[otherIdx];
    const eval_ = evaluateHandStrength(hand);

    // Simple heuristic: pick if 4+ trump or 3 trump + 2 aces
    if (eval_.trumpCount >= 4 || (eval_.trumpCount >= 3 && eval_.failAces >= 2)) {
      pickerPosition = i as PlayerPosition;
      pickerHand = [...hand, ...blind];
      break;
    }
    otherIdx++;
  }

  // If no one picks, it's a leaster - simplified: defender "wins" with small points
  if (pickerPosition === null) {
    return { defenderWon: true, defenderPoints: 20 };
  }

  // Bury
  const buryDecision = decideBury(pickerHand, null);
  const buried = buryDecision.cardsToBury;
  const handAfterBury = pickerHand.filter(c => !buried.some(b => b.id === c.id));

  // Call
  const callDecision = decideCall(handAfterBury, true);
  const calledSuit = callDecision.suit;
  const wentAlone = callDecision.goAlone;

  // Build hands array
  const hands: Card[][] = [];
  otherIdx = 0;
  for (let i = 0; i < 5; i++) {
    if (i === defenderPosition) {
      hands.push(sortHand(originalHand));
    } else if (i === pickerPosition) {
      hands.push(sortHand(handAfterBury));
    } else {
      hands.push(sortHand(otherHands[otherIdx++]));
    }
  }

  // Find partner
  let partnerPosition: PlayerPosition | null = null;
  if (calledSuit && !wentAlone) {
    for (let i = 0; i < 5; i++) {
      if (i === pickerPosition) continue;
      if (hands[i].some(c => c.suit === calledSuit && c.rank === 'A' && !isTrump(c))) {
        partnerPosition = i as PlayerPosition;
        break;
      }
    }
  }

  // Simulate tricks
  const result = simulateTricks(hands, pickerPosition, partnerPosition, calledSuit, buried);

  // Check if defender won (defenders need picker to get < 61)
  const defenderWon = !result.pickerWon;
  const defenderPoints = 120 - result.pickerPoints;

  return { defenderWon, defenderPoints };
}

// ============================================
// MONTE CARLO FOR PLAY DECISION
// ============================================

/**
 * Simulate outcomes for each legal play
 */
export function simulatePlayDecision(
  hand: Card[],
  legalPlays: Card[],
  currentTrick: { card: Card; playedBy: PlayerPosition }[],
  position: PlayerPosition,
  pickerPosition: PlayerPosition | null,
  partnerPosition: PlayerPosition | null,
  calledSuit: Suit | null,
  knowledge: AIGameKnowledge,
  numSimulations: number = QUICK_SIMULATIONS
): PlaySimulationResult {
  const results = new Map<string, MonteCarloResult>();

  // Simulate each legal play
  for (const card of legalPlays) {
    const result = simulatePlayingCard(
      card,
      hand,
      currentTrick,
      position,
      pickerPosition,
      partnerPosition,
      calledSuit,
      knowledge,
      numSimulations
    );
    results.set(card.id, result);
  }

  // Find best card
  let bestCard = legalPlays[0];
  let bestScore = -Infinity;

  for (const card of legalPlays) {
    const result = results.get(card.id)!;
    // Score = win rate weighted heavily + points
    const score = result.winRate * 100 + result.avgPoints / 2;
    if (score > bestScore) {
      bestScore = score;
      bestCard = card;
    }
  }

  const bestResult = results.get(bestCard.id)!;

  return {
    cardResults: results,
    bestCard,
    confidence: bestResult.confidence,
  };
}

/**
 * Simulate outcomes after playing a specific card
 */
function simulatePlayingCard(
  cardToPlay: Card,
  hand: Card[],
  currentTrick: { card: Card; playedBy: PlayerPosition }[],
  position: PlayerPosition,
  pickerPosition: PlayerPosition | null,
  partnerPosition: PlayerPosition | null,
  calledSuit: Suit | null,
  knowledge: AIGameKnowledge,
  numSimulations: number
): MonteCarloResult {
  let wins = 0;
  let totalPoints = 0;

  const isPicker = position === pickerPosition;
  const isPartner = position === partnerPosition;

  for (let i = 0; i < numSimulations; i++) {
    const result = simulateFromPlay(
      cardToPlay,
      hand,
      currentTrick,
      position,
      pickerPosition,
      partnerPosition,
      calledSuit,
      knowledge
    );

    // Check if this player's team won
    const teamWon = isPicker || isPartner ? result.pickerWon : !result.pickerWon;
    if (teamWon) wins++;

    // Track points for this player's team
    const teamPoints = isPicker || isPartner ? result.pickerPoints : 120 - result.pickerPoints;
    totalPoints += teamPoints;
  }

  return {
    winRate: wins / numSimulations,
    avgPoints: totalPoints / numSimulations,
    simulations: numSimulations,
    confidence: Math.min(1, numSimulations / 50),
  };
}

/**
 * Simulate rest of hand after playing a card
 */
function simulateFromPlay(
  cardToPlay: Card,
  originalHand: Card[],
  currentTrick: { card: Card; playedBy: PlayerPosition }[],
  position: PlayerPosition,
  pickerPosition: PlayerPosition | null,
  partnerPosition: PlayerPosition | null,
  calledSuit: Suit | null,
  knowledge: AIGameKnowledge
): { pickerWon: boolean; pickerPoints: number } {
  // This is a simplified simulation - we'd need full game state for accuracy
  // For now, use a heuristic evaluation

  const isPicker = position === pickerPosition;
  const isPartner = position === partnerPosition;
  const isPickerTeam = isPicker || isPartner;

  // Evaluate current position
  const remainingHand = originalHand.filter(c => c.id !== cardToPlay.id);
  const eval_ = evaluateHandStrength(remainingHand);

  // Estimate points based on:
  // - Current knowledge of tricks won
  // - Remaining trump strength
  // - Card being played (winning vs losing trick)

  // Estimate picker team points from tricks won (avg ~20 points per trick)
  let estimatedPickerPoints = knowledge.pickerTeamTricks * 20;

  // Add points from current trick
  const trickPoints = currentTrick.reduce((sum, tc) => sum + getCardPoints(tc.card), 0) + getCardPoints(cardToPlay);

  // Will this card win the trick?
  const willWin = wouldWinTrick(cardToPlay, currentTrick);

  if (willWin && isPickerTeam) {
    estimatedPickerPoints += trickPoints;
  } else if (!willWin && !isPickerTeam) {
    // Defender won, points don't go to picker
  }

  // Estimate remaining points based on trump strength
  const remainingPoints = 120 - estimatedPickerPoints - (120 - estimatedPickerPoints);

  // Heuristic: strong trump = more likely to win remaining tricks
  const trumpAdvantage = eval_.trumpCount - 2; // 2 is average
  const estimatedFinalPickerPoints = estimatedPickerPoints +
    (isPickerTeam ? Math.max(0, trumpAdvantage * 10) : Math.min(0, -trumpAdvantage * 10));

  // Add randomness
  const variance = Math.random() * 20 - 10;
  const finalPoints = Math.max(0, Math.min(120, estimatedFinalPickerPoints + variance));

  return {
    pickerWon: finalPoints >= 61,
    pickerPoints: Math.round(finalPoints),
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Simulate trick play from current state
 */
function simulateTricks(
  hands: Card[][],
  pickerPosition: PlayerPosition,
  partnerPosition: PlayerPosition | null,
  calledSuit: Suit | null,
  buried: Card[]
): { pickerWon: boolean; pickerPoints: number } {
  const tricksWon: Card[][] = [[], [], [], [], []];
  let currentLeader = ((0 + 1) % 5) as PlayerPosition; // Left of dealer
  let calledAceRevealed = false;

  // Initialize knowledge
  const playerKnowledge: AIGameKnowledge[] = [];
  for (let i = 0; i < 5; i++) {
    playerKnowledge[i] = createInitialKnowledge(hands[i], i as PlayerPosition, pickerPosition);
  }

  for (let trick = 0; trick < 6; trick++) {
    const trickCards: { card: Card; playedBy: PlayerPosition }[] = [];

    for (let p = 0; p < 5; p++) {
      const pos = ((currentLeader + p) % 5) as PlayerPosition;
      const hand = hands[pos];

      if (hand.length === 0) continue;

      const isPicker = pos === pickerPosition;
      const isPartner = pos === partnerPosition;
      const isKnownPartner = calledAceRevealed && isPartner;

      const currentTrickState = { cards: trickCards, leadPlayer: currentLeader };
      const calledAceState = calledSuit ? { suit: calledSuit, revealed: calledAceRevealed } : null;

      const legalPlays = getLegalPlays(
        hand,
        currentTrickState,
        calledAceState,
        isPicker,
        isPartner
      );

      if (legalPlays.length === 0) continue;

      // Use decidePlay for AI decisions
      const playDecision = decidePlay(
        hand,
        currentTrickState,
        calledAceState,
        isPicker,
        isPartner,
        isKnownPartner,
        pickerPosition,
        pos,
        playerKnowledge[pos],
        'intermediate'
      );

      const cardToPlay = playDecision.card;

      // Check if called ace revealed
      if (calledSuit && !calledAceRevealed &&
          cardToPlay.suit === calledSuit && cardToPlay.rank === 'A' && !isTrump(cardToPlay)) {
        calledAceRevealed = true;
      }

      trickCards.push({ card: cardToPlay, playedBy: pos });
      hands[pos] = hand.filter(c => c.id !== cardToPlay.id);

      // Update knowledge
      for (let k = 0; k < 5; k++) {
        const kIsPicker = k === pickerPosition;
        const kIsKnownPartner = calledAceRevealed && k === partnerPosition;
        playerKnowledge[k] = updateKnowledgeAfterPlay(
          playerKnowledge[k],
          cardToPlay,
          pos,
          currentTrickState,
          kIsPicker,
          kIsKnownPartner,
          calledSuit
        );
      }
    }

    if (trickCards.length < 5) break;

    const winner = determineTrickWinner({ cards: trickCards, leadPlayer: currentLeader });
    tricksWon[winner].push(...trickCards.map(tc => tc.card));
    currentLeader = winner as PlayerPosition;
  }

  // Calculate points
  let pickerTeamPoints = buried.reduce((sum, c) => sum + getCardPoints(c), 0);

  for (let i = 0; i < 5; i++) {
    const points = tricksWon[i].reduce((sum, c) => sum + getCardPoints(c), 0);
    if (i === pickerPosition || i === partnerPosition) {
      pickerTeamPoints += points;
    }
  }

  return {
    pickerWon: pickerTeamPoints >= 61,
    pickerPoints: pickerTeamPoints,
  };
}

/**
 * Check if a card would win the current trick
 */
function wouldWinTrick(
  card: Card,
  currentTrick: { card: Card; playedBy: PlayerPosition }[]
): boolean {
  if (currentTrick.length === 0) return true;

  // Find current winning card
  let winningCard = currentTrick[0].card;
  for (const tc of currentTrick.slice(1)) {
    if (beats(tc.card, winningCard, currentTrick[0].card)) {
      winningCard = tc.card;
    }
  }

  return beats(card, winningCard, currentTrick[0].card);
}

/**
 * Check if card A beats card B given the led card
 */
function beats(a: Card, b: Card, ledCard: Card): boolean {
  const aIsTrump = isTrump(a);
  const bIsTrump = isTrump(b);

  // Trump beats non-trump
  if (aIsTrump && !bIsTrump) return true;
  if (!aIsTrump && bIsTrump) return false;

  // Both trump - compare power (lower is stronger)
  if (aIsTrump && bIsTrump) {
    return getTrumpPower(a) < getTrumpPower(b);
  }

  // Neither trump - must follow suit
  const ledSuit = isTrump(ledCard) ? 'trump' : ledCard.suit;

  // Can only beat if following led suit
  if (a.suit !== ledSuit) return false;
  if (b.suit !== ledSuit) return true; // A follows, B doesn't

  // Both follow suit - compare by fail order
  return getFailPower(a) < getFailPower(b);
}

/**
 * Get trump power (lower = stronger)
 */
function getTrumpPower(card: Card): number {
  // Queens: 0-3 (clubs highest)
  if (card.rank === 'Q') {
    const suitOrder = ['clubs', 'spades', 'hearts', 'diamonds'];
    return suitOrder.indexOf(card.suit);
  }
  // Jacks: 4-7
  if (card.rank === 'J') {
    const suitOrder = ['clubs', 'spades', 'hearts', 'diamonds'];
    return 4 + suitOrder.indexOf(card.suit);
  }
  // Diamonds: 8-13
  if (card.suit === 'diamonds') {
    const rankOrder = ['A', '10', 'K', '9', '8', '7'];
    return 8 + rankOrder.indexOf(card.rank);
  }
  return 99; // Not trump
}

/**
 * Get fail suit power (lower = stronger)
 */
function getFailPower(card: Card): number {
  const rankOrder = ['A', '10', 'K', '9', '8', '7'];
  return rankOrder.indexOf(card.rank);
}

/**
 * Fisher-Yates shuffle
 */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ============================================
// EXPORTS FOR INTEGRATION
// ============================================

export {
  DEFAULT_SIMULATIONS,
  QUICK_SIMULATIONS,
  THOROUGH_SIMULATIONS,
};
