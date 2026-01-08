// ============================================
// COACHING HOOK - Integrate coaching into game UI
// ============================================

import { useState, useCallback } from 'react';
import type { Card, Suit, Trick, PlayerPosition, CalledAce } from '../game/types';
import {
  CoachingFeedback,
  analyzePickDecision,
  analyzeBuryDecision,
  analyzePlayDecision,
  generateHandSummary,
  formatCoachingMessage,
  formatPrePlayWarning,
  HandSummary,
} from '../game/ai/coaching';

export interface CoachingState {
  enabled: boolean;
  currentWarning: CoachingFeedback | null;
  recentFeedback: CoachingFeedback[];
  handFeedback: CoachingFeedback[];
}

export interface CoachingActions {
  setEnabled: (enabled: boolean) => void;

  // Check before an action - returns warning if critical issue
  checkPick: (hand: Card[], isDealer: boolean, everyonePassed: boolean) => CoachingFeedback | null;
  checkBury: (fullHand: Card[], cardsToBury: Card[], intendedCallSuit: Suit | null) => CoachingFeedback | null;
  checkPlay: (
    hand: Card[],
    cardToPlay: Card,
    trick: Trick,
    calledAce: CalledAce | null,
    isPicker: boolean,
    isPartner: boolean,
    pickerPosition: PlayerPosition | null,
    myPosition: PlayerPosition,
    trickNumber: number,
    partnerPosition: PlayerPosition | null
  ) => CoachingFeedback | null;

  // Record what happened after action
  recordPick: (hand: Card[], didPick: boolean, isDealer: boolean, everyonePassed: boolean) => void;
  recordBury: (fullHand: Card[], cardsBuried: Card[], calledSuit: Suit | null) => void;
  recordPlay: (
    hand: Card[],
    cardPlayed: Card,
    trick: Trick,
    calledAce: CalledAce | null,
    isPicker: boolean,
    isPartner: boolean,
    pickerPosition: PlayerPosition | null,
    myPosition: PlayerPosition,
    trickNumber: number,
    partnerPosition: PlayerPosition | null
  ) => void;

  // Clear warning (user acknowledged or proceeded anyway)
  dismissWarning: () => void;

  // Get feedback to show after trick
  getRecentFeedback: () => CoachingFeedback[];
  clearRecentFeedback: () => void;

  // End of hand summary
  getHandSummary: () => HandSummary;
  clearHandFeedback: () => void;
}

export function useCoaching(): [CoachingState, CoachingActions] {
  const [enabled, setEnabled] = useState(true);
  const [currentWarning, setCurrentWarning] = useState<CoachingFeedback | null>(null);
  const [recentFeedback, setRecentFeedback] = useState<CoachingFeedback[]>([]);
  const [handFeedback, setHandFeedback] = useState<CoachingFeedback[]>([]);

  // Check pick decision for critical warnings
  const checkPick = useCallback((
    hand: Card[],
    isDealer: boolean,
    everyonePassed: boolean
  ): CoachingFeedback | null => {
    if (!enabled) return null;

    // For picking, we analyze PASSING with a strong hand as the critical issue
    // We'd need to check if NOT picking would be bad
    const analysis = analyzePickDecision(hand, false, isDealer, everyonePassed);
    const critical = analysis.feedback.find(f => f.rule.severity === 'critical' && f.triggered);

    if (critical) {
      setCurrentWarning(critical);
      return critical;
    }
    return null;
  }, [enabled]);

  // Check bury decision for critical warnings
  const checkBury = useCallback((
    fullHand: Card[],
    cardsToBury: Card[],
    intendedCallSuit: Suit | null
  ): CoachingFeedback | null => {
    if (!enabled) return null;

    const analysis = analyzeBuryDecision(fullHand, cardsToBury, intendedCallSuit);

    if (analysis.warnings.length > 0) {
      setCurrentWarning(analysis.warnings[0]);
      return analysis.warnings[0];
    }
    return null;
  }, [enabled]);

  // Check play decision for critical warnings
  const checkPlay = useCallback((
    hand: Card[],
    cardToPlay: Card,
    trick: Trick,
    calledAce: CalledAce | null,
    isPicker: boolean,
    isPartner: boolean,
    pickerPosition: PlayerPosition | null,
    myPosition: PlayerPosition,
    trickNumber: number,
    partnerPosition: PlayerPosition | null
  ): CoachingFeedback | null => {
    if (!enabled) return null;

    const analysis = analyzePlayDecision(
      hand, cardToPlay, trick, calledAce,
      isPicker, isPartner, pickerPosition, myPosition, trickNumber,
      partnerPosition
    );

    if (analysis.warnings.length > 0) {
      setCurrentWarning(analysis.warnings[0]);
      return analysis.warnings[0];
    }
    return null;
  }, [enabled]);

  // Record pick decision and generate feedback
  const recordPick = useCallback((
    hand: Card[],
    didPick: boolean,
    isDealer: boolean,
    everyonePassed: boolean
  ) => {
    if (!enabled) return;

    const analysis = analyzePickDecision(hand, didPick, isDealer, everyonePassed);
    const triggered = analysis.feedback.filter(f => f.triggered);

    setRecentFeedback(triggered);
    setHandFeedback(prev => [...prev, ...triggered]);
  }, [enabled]);

  // Record bury decision
  const recordBury = useCallback((
    fullHand: Card[],
    cardsBuried: Card[],
    calledSuit: Suit | null
  ) => {
    if (!enabled) return;

    const analysis = analyzeBuryDecision(fullHand, cardsBuried, calledSuit);
    const triggered = analysis.feedback.filter(f => f.triggered);

    setRecentFeedback(triggered);
    setHandFeedback(prev => [...prev, ...triggered]);
  }, [enabled]);

  // Record play and generate feedback
  const recordPlay = useCallback((
    hand: Card[],
    cardPlayed: Card,
    trick: Trick,
    calledAce: CalledAce | null,
    isPicker: boolean,
    isPartner: boolean,
    pickerPosition: PlayerPosition | null,
    myPosition: PlayerPosition,
    trickNumber: number,
    partnerPosition: PlayerPosition | null
  ) => {
    if (!enabled) return;

    const analysis = analyzePlayDecision(
      hand, cardPlayed, trick, calledAce,
      isPicker, isPartner, pickerPosition, myPosition, trickNumber,
      partnerPosition
    );

    const triggered = analysis.feedback.filter(f => f.triggered);

    setRecentFeedback(triggered);
    setHandFeedback(prev => [...prev, ...triggered]);
  }, [enabled]);

  const dismissWarning = useCallback(() => {
    setCurrentWarning(null);
  }, []);

  const getRecentFeedback = useCallback(() => {
    return recentFeedback;
  }, [recentFeedback]);

  const clearRecentFeedback = useCallback(() => {
    setRecentFeedback([]);
  }, []);

  const getHandSummary = useCallback(() => {
    return generateHandSummary(handFeedback);
  }, [handFeedback]);

  const clearHandFeedback = useCallback(() => {
    setHandFeedback([]);
    setRecentFeedback([]);
  }, []);

  return [
    { enabled, currentWarning, recentFeedback, handFeedback },
    {
      setEnabled,
      checkPick,
      checkBury,
      checkPlay,
      recordPick,
      recordBury,
      recordPlay,
      dismissWarning,
      getRecentFeedback,
      clearRecentFeedback,
      getHandSummary,
      clearHandFeedback,
    },
  ];
}

// ============================================
// MESSAGE FORMATTING EXPORTS
// ============================================

export { formatCoachingMessage, formatPrePlayWarning };
