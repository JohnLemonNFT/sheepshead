// ============================================
// COACHING SYSTEM - Teach players Sheepshead strategy
// ============================================
// Focus: WHY things matter, not statistics
// Keep messages short, friendly, memorable

import {
  Card,
  Suit,
  Trick,
  PlayerPosition,
  CalledAce,
  isTrump,
  getCardPoints,
} from '../types';
import { getLegalPlays, determineTrickWinner } from '../rules';

// ============================================
// COACHING RULE TYPES
// ============================================

export type CoachingSeverity =
  | 'critical'   // Warn BEFORE the action (can prevent)
  | 'notable'    // Show AFTER the trick (learning moment)
  | 'minor'      // Only in hand summary (pattern recognition)
  | 'positive';  // Reinforcement for good play

export interface CoachingRule {
  id: string;
  name: string;
  severity: CoachingSeverity;
  phase: 'picking' | 'burying' | 'playing';

  // The memorable rule the player should internalize
  memorableRule: string;

  // Plain English explanation of what went wrong/right
  consequence: string;
}

export interface CoachingFeedback {
  rule: CoachingRule;
  triggered: boolean;
  context?: string; // Additional context for the specific situation
}

// ============================================
// THE 8 COACHING RULES (Rock-solid only)
// ============================================
// Philosophy: Only coach on things that are OBJECTIVELY wrong 95%+ of the time.
// Experienced players should never be annoyed by these.
// Positive reinforcement is safer - praise good plays, don't nitpick situational ones.

export const COACHING_RULES: CoachingRule[] = [

  // ========== PICKING RULES (1) ==========
  // Most picking decisions are situational - position, hand strength, risk tolerance.
  // We only give encouragement, never criticism.

  {
    id: 'good_forced_pick',
    name: 'Brave dealer pick',
    severity: 'positive',
    phase: 'picking',
    memorableRule: 'Sometimes the dealer has to take one for the team.',
    consequence: 'You made a tough pick as dealer when everyone passed. That takes courage!',
  },

  // ========== BURYING RULES (4) ==========
  // These are objective mistakes that are wrong virtually 100% of the time.

  {
    id: 'bury_trump',
    name: 'Burying trump',
    severity: 'critical',
    phase: 'burying',
    memorableRule: 'Never bury queens or jacks - they\'re your best cards.',
    consequence: 'Queens and jacks win tricks. Burying them is like throwing away your weapons before a fight.',
  },

  {
    id: 'bury_hold_card',
    name: 'Burying the hold card',
    severity: 'critical',
    phase: 'burying',
    memorableRule: 'Keep at least one card in the suit you want to call.',
    consequence: 'Now you can\'t lead that suit to find your partner - they\'re stuck waiting for someone else to lead it.',
  },

  {
    id: 'bury_called_ace',
    name: 'Burying the called ace',
    severity: 'critical',
    phase: 'burying',
    memorableRule: 'Never bury the ace you\'re calling - that\'s your partner!',
    consequence: 'If you bury it, you\'ll be calling for yourself and playing alone without knowing it.',
  },

  {
    id: 'good_bury',
    name: 'Smart bury',
    severity: 'positive',
    phase: 'burying',
    memorableRule: 'Bury points in cards that can\'t win tricks.',
    consequence: 'Nice bury! You kept your trick-winners and buried points in cards that would have been hard to cash.',
  },

  // ========== PLAY RULES (3) ==========
  // Only the most objective play mistakes. Most play decisions are situational.

  {
    id: 'early_called_ace',
    name: 'Playing called ace early',
    severity: 'notable',
    phase: 'playing',
    memorableRule: 'Hold the called ace until that suit is led.',
    consequence: 'You played the called ace before that suit was led. Now the defenders know who you are and can target you.',
  },

  {
    id: 'trump_partner_trick',
    name: 'Trumping partner',
    severity: 'notable',
    phase: 'playing',
    memorableRule: 'Don\'t trump your partner\'s winning trick.',
    consequence: 'You trumped a trick your teammate was already winning. Those points go to the same team either way - now you\'ve wasted trump.',
  },

  {
    id: 'good_schmear',
    name: 'Successful schmear',
    severity: 'positive',
    phase: 'playing',
    memorableRule: 'Schmear points to your partner when they\'re winning.',
    consequence: 'Nice schmear! Your partner won that trick with your points. That\'s team play.',
  },

  {
    id: 'defender_leads_called_suit',
    name: 'Defender leads called suit',
    severity: 'positive',
    phase: 'playing',
    memorableRule: 'As defender, lead the called suit to find the partner.',
    consequence: 'Smart play! Leading the called suit forces the partner to reveal themselves.',
  },

  // ========== NEW RULES FROM RESEARCH ==========

  {
    id: 'bury_fail_ace',
    name: 'Burying a fail ace',
    severity: 'critical',
    phase: 'burying',
    memorableRule: 'Never bury fail aces - they WIN tricks!',
    consequence: 'Aces are control cards that win tricks. Bury 10s instead - same points but 10s can\'t beat aces.',
  },

  {
    id: 'good_void_creation',
    name: 'Created a void',
    severity: 'positive',
    phase: 'burying',
    memorableRule: 'Creating voids lets you trump in on that suit later.',
    consequence: 'Nice! You created a void. Now you can trump when that suit is led.',
  },

  {
    id: 'picker_leads_queen_clubs',
    name: 'Picker leads Q♣',
    severity: 'positive',
    phase: 'playing',
    memorableRule: 'Lead the Queen of Clubs first - it\'s guaranteed to win!',
    consequence: 'Perfect! The Q♣ is the highest trump. Leading it bleeds 5 trump from opponents.',
  },

  {
    id: 'risky_only_schmear',
    name: 'Risking only schmear',
    severity: 'notable',
    phase: 'playing',
    memorableRule: 'Don\'t risk your only schmear - wait for a sure trick.',
    consequence: 'That was your only high-point card. If this trick gets trumped, those points go to the other team.',
  },

  {
    id: 'partner_trump_signal',
    name: 'Partner trump signal',
    severity: 'positive',
    phase: 'playing',
    memorableRule: 'Trumping in with the A♦ signals you\'re the partner.',
    consequence: 'Classic partner move! Trumping with A♦ tells the picker you\'re on their team.',
  },

  {
    id: 'points_before_power',
    name: 'Points before power',
    severity: 'positive',
    phase: 'playing',
    memorableRule: 'Sacrifice points to save power cards for later.',
    consequence: 'Smart! You saved your queen by giving up points on a trick you couldn\'t win. That queen might win a bigger trick later.',
  },

  {
    id: 'defender_leads_trump',
    name: 'Defender leading trump',
    severity: 'notable',
    phase: 'playing',
    memorableRule: 'Defenders should lead fail, not trump.',
    consequence: 'Leading trump as a defender usually helps the picker bleed everyone\'s trump. Lead fail suits to create trumping opportunities.',
  },

  {
    id: 'schneider_awareness',
    name: 'Schneider threshold',
    severity: 'notable',
    phase: 'playing',
    memorableRule: '31 points avoids schneider (double loss).',
    consequence: 'Getting schneidered (under 31 points) counts as a double loss. Fight for those last few points!',
  },

  {
    id: 'good_crossfire',
    name: 'Crossfire positioning',
    severity: 'positive',
    phase: 'playing',
    memorableRule: 'Defenders: keep the lead in front of the picker.',
    consequence: 'Nice crossfire! When defenders play before and after the picker, the picker is forced into difficult decisions.',
  },

  {
    id: 'saved_called_ace',
    name: 'Saved called ace',
    severity: 'positive',
    phase: 'playing',
    memorableRule: 'Save the called ace until that suit is led.',
    consequence: 'Good patience! Holding the called ace keeps your identity hidden and the ace safe from being trumped.',
  },
];

// ============================================
// RULE LOOKUP HELPER
// ============================================

export function getRule(id: string): CoachingRule | undefined {
  return COACHING_RULES.find(r => r.id === id);
}

// ============================================
// PICKING ANALYSIS
// ============================================

export interface PickAnalysis {
  feedback: CoachingFeedback[];
}

export function analyzePickDecision(
  hand: Card[],
  didPick: boolean,
  isDealer: boolean,
  everyonePassed: boolean
): PickAnalysis {
  const feedback: CoachingFeedback[] = [];

  // Only positive reinforcement for picking - no criticism
  // Most pick decisions are situational based on position, risk tolerance, etc.

  if (didPick && isDealer && everyonePassed) {
    const trumpCards = hand.filter(c => isTrump(c));
    const trumpCount = trumpCards.length;
    // Encourage brave dealer picks, especially with weak hands
    if (trumpCount <= 3) {
      feedback.push({
        rule: getRule('good_forced_pick')!,
        triggered: true,
      });
    }
  }

  return { feedback };
}

// ============================================
// BURYING ANALYSIS
// ============================================

export interface BuryAnalysis {
  feedback: CoachingFeedback[];
  warnings: CoachingFeedback[]; // Critical issues to show BEFORE confirming
}

export function analyzeBuryDecision(
  fullHand: Card[], // Hand including blind (8 cards)
  cardsToBury: Card[],
  intendedCallSuit: Suit | null
): BuryAnalysis {
  const feedback: CoachingFeedback[] = [];
  const warnings: CoachingFeedback[] = [];

  // Check for burying trump (queens/jacks)
  const buriedTrump = cardsToBury.filter(c => c.rank === 'Q' || c.rank === 'J');
  if (buriedTrump.length > 0) {
    const warning: CoachingFeedback = {
      rule: getRule('bury_trump')!,
      triggered: true,
      context: `You're about to bury ${buriedTrump.map(c => `${c.rank}${getSuitSymbol(c.suit)}`).join(' and ')}.`,
    };
    warnings.push(warning);
  }

  // Check for burying hold card
  if (intendedCallSuit) {
    const suitCards = fullHand.filter(c => c.suit === intendedCallSuit && !isTrump(c));
    const buryingSuitCards = cardsToBury.filter(c => c.suit === intendedCallSuit && !isTrump(c));

    if (suitCards.length > 0 && suitCards.length === buryingSuitCards.length) {
      const warning: CoachingFeedback = {
        rule: getRule('bury_hold_card')!,
        triggered: true,
        context: `You're burying your only ${intendedCallSuit} card. You won't be able to lead ${intendedCallSuit} to find your partner.`,
      };
      warnings.push(warning);
    }
  }

  // Check for burying the called suit ace (critical mistake)
  const buriedAces = cardsToBury.filter(c => c.rank === 'A' && !isTrump(c));
  if (intendedCallSuit && buriedAces.some(c => c.suit === intendedCallSuit)) {
    const calledAce = buriedAces.find(c => c.suit === intendedCallSuit);
    warnings.push({
      rule: getRule('bury_called_ace')!,
      triggered: true,
      context: `You're about to bury the A${getSuitSymbol(calledAce!.suit)} - the ace you're planning to call!`,
    });
  }

  // Check for burying ANY fail ace (almost always wrong - aces win tricks!)
  const nonCalledBuriedAces = buriedAces.filter(c => c.suit !== intendedCallSuit);
  if (nonCalledBuriedAces.length > 0) {
    const aceList = nonCalledBuriedAces.map(c => `A${getSuitSymbol(c.suit)}`).join(' and ');
    warnings.push({
      rule: getRule('bury_fail_ace')!,
      triggered: true,
      context: `You're about to bury ${aceList}. Aces win tricks - bury 10s instead!`,
    });
  }

  // Check for good bury (10s and kings, no trump buried)
  const buriedPoints = cardsToBury.reduce((sum, c) => sum + getCardPoints(c), 0);
  const buriedHighPointCards = cardsToBury.filter(c => c.rank === '10' || c.rank === 'K');

  if (buriedTrump.length === 0 && buriedPoints >= 10 && buriedHighPointCards.length > 0) {
    feedback.push({
      rule: getRule('good_bury')!,
      triggered: true,
    });
  }

  // Check for void creation (burying creates a void in a fail suit)
  const failSuits: Suit[] = ['clubs', 'spades', 'hearts'];
  for (const suit of failSuits) {
    const suitCards = fullHand.filter(c => c.suit === suit && !isTrump(c));
    const buriedSuitCards = cardsToBury.filter(c => c.suit === suit && !isTrump(c));
    // If we had cards in this suit and burying removes them all, we created a void
    if (suitCards.length > 0 && suitCards.length === buriedSuitCards.length && suit !== intendedCallSuit) {
      feedback.push({
        rule: getRule('good_void_creation')!,
        triggered: true,
        context: `You're now void in ${suit}.`,
      });
      break; // Only show once
    }
  }

  return { feedback, warnings };
}

// ============================================
// PLAY ANALYSIS
// ============================================

export interface PlayAnalysis {
  feedback: CoachingFeedback[];
  warnings: CoachingFeedback[]; // For critical pre-play warnings
}

export function analyzePlayDecision(
  hand: Card[],
  cardToPlay: Card,
  trick: Trick,
  calledAce: CalledAce | null,
  isPicker: boolean,
  isPartner: boolean,
  pickerPosition: PlayerPosition | null,
  myPosition: PlayerPosition,
  trickNumber: number
): PlayAnalysis {
  const feedback: CoachingFeedback[] = [];
  const warnings: CoachingFeedback[] = [];

  const isLeading = trick.cards.length === 0;
  const isDefender = !isPicker && !isPartner;

  // ========== LEADING ANALYSIS ==========
  if (isLeading) {
    // Picker leading Q♣ (best first lead!)
    if (isPicker && cardToPlay.rank === 'Q' && cardToPlay.suit === 'clubs') {
      feedback.push({
        rule: getRule('picker_leads_queen_clubs')!,
        triggered: true,
      });
    }

    // Defender leading called suit (great - smoke out the partner!)
    // This is one of the best defender plays and is objectively good.
    if (isDefender && calledAce && !calledAce.revealed) {
      if (!isTrump(cardToPlay) && cardToPlay.suit === calledAce.suit) {
        feedback.push({
          rule: getRule('defender_leads_called_suit')!,
          triggered: true,
        });
      }
    }
  }

  // ========== FOLLOWING ANALYSIS ==========
  if (!isLeading) {
    const leadCard = trick.cards[0].card;
    const currentWinner = determineTrickWinner(trick);

    // Check if teammate is winning
    const teammateWinning = isTeammateCurrentlyWinning(
      currentWinner,
      isPicker,
      isPartner,
      pickerPosition
    );

    // Partner playing called ace when suit wasn't led (objective mistake)
    if (isPartner && calledAce && !calledAce.revealed) {
      if (cardToPlay.suit === calledAce.suit && cardToPlay.rank === 'A') {
        const suitWasLed = !isTrump(leadCard) && leadCard.suit === calledAce.suit;
        if (!suitWasLed) {
          // Make sure they had other options (weren't forced)
          const legalPlays = hand.filter(c =>
            isLegalInContext(c, hand, trick, calledAce, isPicker, isPartner)
          );
          if (legalPlays.length > 1) {
            feedback.push({
              rule: getRule('early_called_ace')!,
              triggered: true,
            });
          }
        }
      }
    }

    // Good schmear - positive reinforcement only
    if (teammateWinning) {
      const playingPoints = getCardPoints(cardToPlay);
      if (playingPoints >= 10) {
        feedback.push({
          rule: getRule('good_schmear')!,
          triggered: true,
        });
      }
    }

    // Trumping partner's winning trick (objective mistake)
    if (teammateWinning && isTrump(cardToPlay)) {
      const winnerCard = trick.cards.find(c => c.playedBy === currentWinner)!.card;
      if (!isTrump(winnerCard)) {
        // Partner was winning with fail, we trumped them - this is almost always wrong
        feedback.push({
          rule: getRule('trump_partner_trick')!,
          triggered: true,
        });
      }
    }
  }

  return { feedback, warnings };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getSuitSymbol(suit: Suit): string {
  const symbols: Record<Suit, string> = {
    clubs: '♣',
    spades: '♠',
    hearts: '♥',
    diamonds: '♦',
  };
  return symbols[suit];
}

function isTeammateCurrentlyWinning(
  winnerPosition: number,
  isPicker: boolean,
  isPartner: boolean,
  pickerPosition: PlayerPosition | null
): boolean {
  if (isPicker) {
    // We don't know partner yet in many cases, be conservative
    return false; // Picker can't easily know if partner is winning
  }

  if (isPartner) {
    return winnerPosition === pickerPosition;
  }

  // Defender - teammate is another defender (not picker, not known partner)
  if (pickerPosition !== null) {
    return winnerPosition !== pickerPosition;
  }

  return false;
}

function isLegalInContext(
  card: Card,
  hand: Card[],
  trick: Trick,
  calledAce: CalledAce | null,
  isPicker: boolean,
  isPartner: boolean
): boolean {
  const legalPlays = getLegalPlays(hand, trick, calledAce, isPicker, isPartner);
  return legalPlays.some(c => c.id === card.id);
}

// ============================================
// HAND SUMMARY
// ============================================

export interface HandSummary {
  goodPlays: CoachingFeedback[];
  mistakes: CoachingFeedback[];
  tips: string[];
}

export function generateHandSummary(
  allFeedback: CoachingFeedback[]
): HandSummary {
  const goodPlays = allFeedback.filter(f => f.rule.severity === 'positive' && f.triggered);
  const mistakes = allFeedback.filter(f =>
    f.triggered &&
    (f.rule.severity === 'critical' || f.rule.severity === 'notable')
  );

  const tips: string[] = [];

  // Only show summary if there's something meaningful
  if (goodPlays.length >= 2 && mistakes.length === 0) {
    tips.push('Nice hand! You\'re playing solid Sheepshead.');
  }

  return { goodPlays, mistakes, tips };
}

// ============================================
// COACHING MESSAGE FORMATTER
// ============================================

export function formatCoachingMessage(feedback: CoachingFeedback): string {
  const rule = feedback.rule;

  if (rule.severity === 'positive') {
    return `${rule.consequence}`;
  }

  // For mistakes, show memorable rule + consequence
  let message = rule.consequence;
  if (feedback.context) {
    message = `${feedback.context} ${message}`;
  }

  return message;
}

export function formatPrePlayWarning(feedback: CoachingFeedback): string {
  const rule = feedback.rule;

  let message = '';
  if (feedback.context) {
    message += feedback.context + '\n\n';
  }
  message += rule.memorableRule;

  return message;
}
