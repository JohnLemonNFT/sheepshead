// ============================================
// AI ENGINE - Main orchestrator for AI decisions
// ============================================

import {
  Card,
  Suit,
  GameState,
  AIDecision,
  PlayerPosition,
  AIDifficulty,
  Player,
} from '../types';
import { decideWhetherToPick, explainPickDecision } from './pick';
import { decideBury, explainBuryDecision } from './bury';
import { decideCall, explainCallDecision } from './call';
import { decidePlay, explainPlayDecision } from './play';
import {
  AIGameKnowledge,
  createInitialKnowledge,
  updateKnowledgeAfterPlay,
} from './tracking';

/**
 * AI player state (tracked per game)
 */
export interface AIPlayerState {
  position: PlayerPosition;
  difficulty: AIDifficulty;
  knowledge: AIGameKnowledge;
  lastDecision: AIDecision | null;
}

/**
 * Create initial AI player state
 */
export function createAIPlayerState(
  position: PlayerPosition,
  difficulty: AIDifficulty,
  hand: Card[],
  pickerPosition: PlayerPosition | null
): AIPlayerState {
  return {
    position,
    difficulty,
    knowledge: createInitialKnowledge(hand, position, pickerPosition),
    lastDecision: null,
  };
}

/**
 * Get AI decision for current game state
 */
export function getAIDecision(
  state: GameState,
  player: Player,
  aiState: AIPlayerState
): AIDecision {
  const { phase, currentPlayer, dealerPosition, passCount, calledAce, pickerPosition } = state;

  switch (phase) {
    case 'picking':
      return getPickDecision(player, aiState, dealerPosition, passCount);

    case 'cracking':
      return getCrackDecision(state, player, aiState);

    case 'burying':
      return getBuryDecision(state, player, aiState, calledAce?.suit || null);

    case 'calling':
      return getCallDecision(player, aiState, state.config.callTen);

    case 'playing':
      return getPlayDecision(state, player, aiState);

    default:
      throw new Error(`AI cannot make decision in phase: ${phase}`);
  }
}

/**
 * Get pick/pass decision
 */
function getPickDecision(
  player: Player,
  aiState: AIPlayerState,
  dealerPosition: PlayerPosition,
  passCount: number
): AIDecision {
  const decision = decideWhetherToPick(
    player.hand,
    player.position,
    dealerPosition,
    passCount,
    aiState.difficulty
  );

  const action = decision.shouldPick
    ? { type: 'pick' as const }
    : { type: 'pass' as const };

  return {
    action,
    reason: decision.reason,
  };
}

/**
 * Get crack/recrack/noCrack decision
 * Difficulty affects willingness to crack:
 * - Beginner: Cracks too often (overconfident)
 * - Expert: Only cracks with genuinely strong hands
 */
function getCrackDecision(
  state: GameState,
  player: Player,
  aiState: AIPlayerState
): AIDecision {
  const { crackState, pickerPosition } = state;
  const isPicker = player.position === pickerPosition;
  const difficulty = aiState.difficulty;

  // Difficulty-based thresholds
  const thresholds: Record<string, { trumpToCrack: number; acesToHelp: number; trumpToRecrack: number }> = {
    beginner: { trumpToCrack: 2, acesToHelp: 1, trumpToRecrack: 4 },
    intermediate: { trumpToCrack: 3, acesToHelp: 2, trumpToRecrack: 5 },
    advanced: { trumpToCrack: 3, acesToHelp: 2, trumpToRecrack: 5 },
    expert: { trumpToCrack: 4, acesToHelp: 2, trumpToRecrack: 5 },
  };
  const t = thresholds[difficulty] || thresholds.intermediate;

  const trumpCount = player.hand.filter(c =>
    c.rank === 'Q' || c.rank === 'J' || c.suit === 'diamonds'
  ).length;
  const queenCount = player.hand.filter(c => c.rank === 'Q').length;
  const failAces = player.hand.filter(c =>
    c.rank === 'A' && c.suit !== 'diamonds'
  ).length;

  // If picker is deciding on recrack
  if (isPicker && crackState?.cracked) {
    // Recrack with strong hands
    const hasQueens = queenCount >= 2;

    if (trumpCount >= t.trumpToRecrack || (trumpCount >= t.trumpToRecrack - 1 && hasQueens)) {
      return {
        action: { type: 'recrack' },
        reason: 'Strong hand - re-doubling the stakes!',
      };
    }

    return {
      action: { type: 'noCrack' },
      reason: 'Accepting the crack, not strong enough to re-crack',
    };
  }

  // Defender deciding whether to crack
  if (trumpCount >= t.trumpToCrack || (trumpCount >= t.trumpToCrack - 1 && failAces >= t.acesToHelp)) {
    return {
      action: { type: 'crack' },
      reason: 'Strong defensive hand - doubling the stakes!',
    };
  }

  return {
    action: { type: 'noCrack' },
    reason: 'Passing on crack - not strong enough',
  };
}

/**
 * Get bury decision (may include blitz)
 */
function getBuryDecision(
  state: GameState,
  player: Player,
  aiState: AIPlayerState,
  calledSuit: Suit | null
): AIDecision {
  // Check if AI should blitz (has both black queens)
  // Requires: crackState exists, blitzes enabled in config, not already blitzed
  if (state.crackState && state.config.blitzes && !state.crackState.blitzed) {
    const hasQueenClubs = player.hand.some(c => c.id === 'Q-clubs');
    const hasQueenSpades = player.hand.some(c => c.id === 'Q-spades');

    if (hasQueenClubs && hasQueenSpades) {
      // AI always blitzes with black queens - it's usually a good hand!
      return {
        action: { type: 'blitz' },
        reason: 'Blitzing with black queens! (The Ma\'s)',
      };
    }
  }

  const decision = decideBury(player.hand, calledSuit);

  return {
    action: {
      type: 'bury',
      cards: decision.cardsToBury,
    },
    reason: decision.reason,
  };
}

/**
 * Get call decision
 */
function getCallDecision(player: Player, aiState: AIPlayerState, callTenEnabled: boolean): AIDecision {
  const decision = decideCall(player.hand, callTenEnabled);

  if (decision.goAlone) {
    return {
      action: { type: 'goAlone' },
      reason: decision.reason,
    };
  }

  // If calling a 10 (has all 3 aces)
  if (decision.callTen) {
    return {
      action: {
        type: 'callTen',
        suit: decision.suit!,
      },
      reason: decision.reason,
    };
  }

  return {
    action: {
      type: 'callAce',
      suit: decision.suit!,
    },
    reason: decision.reason,
  };
}

/**
 * Get play decision
 */
function getPlayDecision(
  state: GameState,
  player: Player,
  aiState: AIPlayerState
): AIDecision {
  const decision = decidePlay(
    player.hand,
    state.currentTrick,
    state.calledAce,
    player.isPicker,
    player.isPartner,
    player.isPartner, // isKnownPartner - simplified for now
    state.pickerPosition,
    player.position,
    aiState.knowledge,
    aiState.difficulty
  );

  return {
    action: {
      type: 'playCard',
      card: decision.card,
    },
    reason: decision.reason,
  };
}

/**
 * Get detailed explanation of the last AI decision
 */
export function getDetailedExplanation(
  state: GameState,
  player: Player,
  aiState: AIPlayerState,
  decision: AIDecision
): string {
  switch (decision.action.type) {
    case 'pick':
    case 'pass': {
      const pickDecision = decideWhetherToPick(
        player.hand,
        player.position,
        state.dealerPosition,
        state.passCount,
        aiState.difficulty
      );
      return explainPickDecision(player.hand, pickDecision);
    }

    case 'bury': {
      const buryDecision = decideBury(player.hand, state.calledAce?.suit || null);
      return explainBuryDecision(
        player.hand,
        buryDecision,
        state.calledAce?.suit || null
      );
    }

    case 'callAce':
    case 'goAlone': {
      const callDecision = decideCall(player.hand);
      return explainCallDecision(player.hand, callDecision);
    }

    case 'playCard': {
      const playDecision = decidePlay(
        player.hand,
        state.currentTrick,
        state.calledAce,
        player.isPicker,
        player.isPartner,
        player.isPartner,
        state.pickerPosition,
        player.position,
        aiState.knowledge,
        aiState.difficulty
      );
      return explainPlayDecision(
        player.hand,
        state.currentTrick,
        playDecision,
        player.isPicker,
        player.isPartner
      );
    }

    default:
      return decision.reason;
  }
}

/**
 * Update AI knowledge after a card is played (called by game engine)
 */
export function updateAIKnowledge(
  aiState: AIPlayerState,
  card: Card,
  playedBy: PlayerPosition,
  state: GameState
): AIPlayerState {
  const player = state.players[playedBy];

  return {
    ...aiState,
    knowledge: updateKnowledgeAfterPlay(
      aiState.knowledge,
      card,
      playedBy,
      state.currentTrick,
      player.isPicker,
      player.isPartner,
      state.calledAce?.suit || null
    ),
  };
}
