// ============================================
// AI PERSONALITIES - Give the AI players soul
// ============================================
// Each player has a name, avatar, play style, and voice

import { PlayerPosition, Card, Suit } from '../types';

// ============================================
// PERSONALITY TYPES
// ============================================

export interface AIPersonality {
  // Identity
  name: string;
  avatar: string; // Emoji avatar
  description: string;
  color: string; // Tailwind color class

  // Play style modifiers
  pickThresholdModifier: number; // Positive = more conservative, negative = more aggressive
  goAloneFrequency: number; // 0-1, how often they'll go alone when they could
  schmearAggressiveness: number; // 0-1, how aggressively they schmear points
  riskTolerance: number; // 0-1, general risk tolerance

  // Timing (in ms, added to base delay)
  thinkingDelayBase: number;
  thinkingDelayVariance: number; // Random variance
  complexDecisionExtraDelay: number; // Extra time for tough calls

  // Voice - used in explanations
  voice: PersonalityVoice;
}

export interface PersonalityVoice {
  // Picking phase
  pick: string[];
  passWeak: string[];
  passStrong: string[]; // When passing with decent hand (strategic)
  forcedPick: string[];

  // Burying
  buryGood: string[];
  buryPoints: string[];

  // Calling
  callAce: string[];
  goAlone: string[];

  // Playing - leading
  leadTrump: string[];
  leadFail: string[];
  leadCalledSuit: string[];

  // Playing - following
  schmear: string[];
  winTrick: string[];
  cantWin: string[];
  trumpPartner: string[];

  // Reactions
  partnerRevealed: string[];
  bigTrickWon: string[];
  bigTrickLost: string[];

  // General
  thinking: string[];
  confident: string[];
  uncertain: string[];
}

// ============================================
// THE FOUR PERSONALITIES
// ============================================

export const GRETA: AIPersonality = {
  name: 'Greta',
  avatar: '👵',
  description: 'The cautious veteran',
  color: 'purple',

  pickThresholdModifier: 2, // Needs stronger hand to pick
  goAloneFrequency: 0.05, // Almost never goes alone
  schmearAggressiveness: 0.7,
  riskTolerance: 0.3,

  thinkingDelayBase: 400,
  thinkingDelayVariance: 300,
  complexDecisionExtraDelay: 600,

  voice: {
    pick: [
      "I'll take it.",
      "This hand will do.",
      "Alright, let's see what the blind brings.",
    ],
    passWeak: [
      "I'll pass on this one.",
      "Not this time.",
      "Too risky for my taste.",
    ],
    passStrong: [
      "I could pick, but I'll let someone else try.",
      "Pass. Let's see who's feeling brave.",
    ],
    forcedPick: [
      "Well, someone has to do it.",
      "Dealer's burden, I suppose.",
      "Here goes nothing.",
    ],

    buryGood: [
      "These will do nicely.",
      "Perfect for burying.",
    ],
    buryPoints: [
      "Safe keeping for later.",
      "Points in the pocket.",
    ],

    callAce: [
      "I'll call {suit}.",
      "{suit} ace, please show yourself.",
    ],
    goAlone: [
      "I don't need a partner for this.",
      "Going alone.",
    ],

    leadTrump: [
      "Let's see what everyone's holding.",
      "Trump it is.",
      "Clearing out the trump.",
    ],
    leadFail: [
      "A safe lead.",
      "Testing the waters.",
    ],
    leadCalledSuit: [
      "Looking for my partner.",
      "Come on out, partner.",
    ],

    schmear: [
      "Some points for my friend.",
      "Take these.",
    ],
    winTrick: [
      "I'll take that.",
      "Mine.",
      "Got it.",
    ],
    cantWin: [
      "Nothing I can do here.",
      "Throwing this away.",
    ],
    trumpPartner: [
      "Sorry, can't let that go.",
      "I need this one.",
    ],

    partnerRevealed: [
      "There's my partner.",
      "Ah, I thought so.",
      "Now we know.",
    ],
    bigTrickWon: [
      "That's a good one.",
      "Points in the bank.",
    ],
    bigTrickLost: [
      "Ouch.",
      "That hurts.",
    ],

    thinking: [
      "Hmm...",
      "Let me think...",
      "One moment...",
    ],
    confident: [
      "Easy choice.",
      "Obvious play.",
    ],
    uncertain: [
      "This is tricky...",
      "Not sure about this...",
    ],
  },
};

export const WILD_BILL: AIPersonality = {
  name: 'Wild Bill',
  avatar: '🤠',
  description: 'The gambler',
  color: 'orange',

  pickThresholdModifier: -3, // Picks with weak hands
  goAloneFrequency: 0.4, // Loves going alone
  schmearAggressiveness: 0.9,
  riskTolerance: 0.9,

  thinkingDelayBase: 150, // Fast player
  thinkingDelayVariance: 100,
  complexDecisionExtraDelay: 200,

  voice: {
    pick: [
      "Let's do this!",
      "Fortune favors the bold!",
      "I've got a good feeling about this.",
      "Let's see what the blind brings!",
    ],
    passWeak: [
      "Not even I'm that crazy.",
      "Fine, I'll pass.",
    ],
    passStrong: [
      "Passing... for now.",
      "I'll let someone else have the glory.",
    ],
    forcedPick: [
      "Dealer special! Let's go!",
      "Forced pick? No problem!",
      "This is gonna be fun!",
    ],

    buryGood: [
      "Beautiful.",
      "Perfect!",
    ],
    buryPoints: [
      "Ka-ching!",
      "Money in the bank!",
    ],

    callAce: [
      "Calling {suit}! Let's ride!",
      "{suit} ace, partner up!",
    ],
    goAlone: [
      "Going alone! Wish me luck!",
      "Solo mission! Let's gooo!",
      "I don't need backup for this!",
    ],

    leadTrump: [
      "Trump time!",
      "Let's shake things up!",
      "Here comes the pain!",
    ],
    leadFail: [
      "Let's see what happens.",
      "Testing, testing...",
    ],
    leadCalledSuit: [
      "Partner, where are you?",
      "Show yourself!",
    ],

    schmear: [
      "Boom! Take it!",
      "Big points coming through!",
      "Load 'em up!",
    ],
    winTrick: [
      "Yes!",
      "Got 'em!",
      "Too easy!",
    ],
    cantWin: [
      "Whatever.",
      "Next time.",
    ],
    trumpPartner: [
      "Sorry partner, gotta do it!",
      "Can't help it!",
    ],

    partnerRevealed: [
      "There you are!",
      "Partner! Let's clean up!",
    ],
    bigTrickWon: [
      "BOOM! Huge!",
      "Now that's what I'm talking about!",
    ],
    bigTrickLost: [
      "Aw man!",
      "They got us.",
    ],

    thinking: [
      "Hmm...",
      "Let me see...",
    ],
    confident: [
      "Easy!",
      "No brainer!",
    ],
    uncertain: [
      "Risky... I like it!",
      "Here goes nothing!",
    ],
  },
};

export const STEADY_EDDIE: AIPersonality = {
  name: 'Steady Eddie',
  avatar: '👨',
  description: 'The fundamentals guy',
  color: 'blue',

  pickThresholdModifier: 0, // Standard thresholds
  goAloneFrequency: 0.15,
  schmearAggressiveness: 0.7,
  riskTolerance: 0.5,

  thinkingDelayBase: 300,
  thinkingDelayVariance: 200,
  complexDecisionExtraDelay: 400,

  voice: {
    pick: [
      "Solid hand, I'll take it.",
      "Good enough to pick.",
      "I like this hand.",
    ],
    passWeak: [
      "I'll pass.",
      "Not strong enough.",
      "Pass.",
    ],
    passStrong: [
      "Could go either way, but I'll pass.",
      "Decent hand, but I'll wait.",
    ],
    forcedPick: [
      "Dealer's gotta pick.",
      "Alright, let's make it work.",
      "Someone has to do it.",
    ],

    buryGood: [
      "Good bury.",
      "That works.",
    ],
    buryPoints: [
      "Nice points to bury.",
      "Solid.",
    ],

    callAce: [
      "Calling {suit}.",
      "I'll go with {suit}.",
    ],
    goAlone: [
      "Going alone on this one.",
      "Solo.",
    ],

    leadTrump: [
      "Leading trump.",
      "Let's pull some trump.",
    ],
    leadFail: [
      "Safe lead.",
      "Starting with this.",
    ],
    leadCalledSuit: [
      "Finding my partner.",
      "Leading the called suit.",
    ],

    schmear: [
      "Schmearing to my partner.",
      "Points for my teammate.",
    ],
    winTrick: [
      "I'll take it.",
      "Mine.",
      "Got it.",
    ],
    cantWin: [
      "Throwing off.",
      "Can't beat that.",
    ],
    trumpPartner: [
      "Had to take it.",
      "No choice.",
    ],

    partnerRevealed: [
      "Partner found.",
      "There's my teammate.",
    ],
    bigTrickWon: [
      "Big trick.",
      "Nice haul.",
    ],
    bigTrickLost: [
      "Tough break.",
      "They got that one.",
    ],

    thinking: [
      "Thinking...",
      "One second...",
    ],
    confident: [
      "Standard play.",
      "By the book.",
    ],
    uncertain: [
      "Close call...",
      "Could go either way...",
    ],
  },
};

export const MARIE: AIPersonality = {
  name: 'Marie',
  avatar: '👩',
  description: 'The sharp one',
  color: 'pink',

  pickThresholdModifier: 1, // Slightly conservative
  goAloneFrequency: 0.25,
  schmearAggressiveness: 0.8,
  riskTolerance: 0.6,

  thinkingDelayBase: 250,
  thinkingDelayVariance: 400, // Highly variable - fast on easy, slow on hard
  complexDecisionExtraDelay: 800, // Takes time on important decisions

  voice: {
    pick: [
      "I'll take this.",
      "Interesting hand... I'm in.",
      "This could work.",
    ],
    passWeak: [
      "No thanks.",
      "Pass.",
      "I'll wait.",
    ],
    passStrong: [
      "Tempting, but no.",
      "I'll let it go.",
    ],
    forcedPick: [
      "Forced, but I can work with this.",
      "Let's see what I can do.",
      "Challenge accepted.",
    ],

    buryGood: [
      "Perfect.",
      "Exactly what I wanted.",
    ],
    buryPoints: [
      "These are safe now.",
      "Secured.",
    ],

    callAce: [
      "I'm calling {suit}.",
      "{suit}.",
    ],
    goAlone: [
      "Going alone.",
      "I'll handle this myself.",
    ],

    leadTrump: [
      "Drawing trump.",
      "Let's see your trump.",
    ],
    leadFail: [
      "Testing...",
      "Interesting...",
    ],
    leadCalledSuit: [
      "Come out, partner.",
      "Revealing time.",
    ],

    schmear: [
      "For you.",
      "Take these.",
    ],
    winTrick: [
      "Mine.",
      "I'll take that.",
      "As expected.",
    ],
    cantWin: [
      "Fine.",
      "Noted.",
    ],
    trumpPartner: [
      "Sorry, but I need this.",
      "Necessary.",
    ],

    partnerRevealed: [
      "I knew it.",
      "Thought so.",
      "There you are.",
    ],
    bigTrickWon: [
      "Excellent.",
      "Perfect.",
    ],
    bigTrickLost: [
      "Hmm.",
      "Interesting play.",
    ],

    thinking: [
      "...",
      "Hmm...",
    ],
    confident: [
      "Obviously.",
      "Clear choice.",
    ],
    uncertain: [
      "Interesting...",
      "Let's see...",
    ],
  },
};

// ============================================
// PERSONALITY MAPPING
// ============================================

// Map player positions to personalities (position 0 is human)
export const AI_PERSONALITIES: Record<PlayerPosition, AIPersonality> = {
  0: GRETA, // Not used (human), but needed for type safety
  1: GRETA,
  2: WILD_BILL,
  3: STEADY_EDDIE,
  4: MARIE,
};

export function getPersonality(position: PlayerPosition): AIPersonality {
  return AI_PERSONALITIES[position] || STEADY_EDDIE;
}

// ============================================
// VOICE HELPERS
// ============================================

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function formatMessage(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(`{${key}}`, value);
  }
  return result;
}

// Get a personality-appropriate message for an action
export function getPersonalityMessage(
  position: PlayerPosition,
  category: keyof PersonalityVoice,
  vars: Record<string, string> = {}
): string {
  const personality = getPersonality(position);
  const messages = personality.voice[category];
  if (!messages || messages.length === 0) {
    return '';
  }
  return formatMessage(pickRandom(messages), vars);
}

// Get thinking delay for a player
export function getThinkingDelay(
  position: PlayerPosition,
  isComplexDecision: boolean = false
): number {
  const personality = getPersonality(position);
  const base = personality.thinkingDelayBase;
  const variance = Math.random() * personality.thinkingDelayVariance;
  const extra = isComplexDecision ? personality.complexDecisionExtraDelay : 0;
  return base + variance + extra;
}

// Get personality-modified pick threshold
export function getPickThresholdModifier(position: PlayerPosition): number {
  return getPersonality(position).pickThresholdModifier;
}

// Should this player go alone?
export function shouldGoAlone(position: PlayerPosition, canGoAlone: boolean): boolean {
  if (!canGoAlone) return false;
  const personality = getPersonality(position);
  return Math.random() < personality.goAloneFrequency;
}

// Get display info for a player
export function getPlayerDisplayInfo(position: PlayerPosition): {
  name: string;
  avatar: string;
  color: string;
} {
  if (position === 0) {
    return { name: 'You', avatar: '🧑', color: 'green' };
  }
  const personality = getPersonality(position);
  return {
    name: personality.name,
    avatar: personality.avatar,
    color: personality.color,
  };
}
