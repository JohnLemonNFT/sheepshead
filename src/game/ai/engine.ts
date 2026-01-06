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

    case 'burying':
      return getBuryDecision(player, aiState, calledAce?.suit || null);

    case 'calling':
      return getCallDecision(player, aiState);

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
 * Get bury decision
 */
function getBuryDecision(
  player: Player,
  aiState: AIPlayerState,
  calledSuit: Suit | null
): AIDecision {
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
function getCallDecision(player: Player, aiState: AIPlayerState): AIDecision {
  const decision = decideCall(player.hand);

  if (decision.goAlone) {
    return {
      action: { type: 'goAlone' },
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
