// ============================================
// GAME LOGIC FOR SERVER
// ============================================

import type { Room } from './room.js';
import type {
  Card,
  Suit,
  Rank,
  PlayerPosition,
  GameState,
  GameAction,
  Player,
  Trick,
  ClientGameState,
  ClientPlayer,
  GameConfig,
} from './types.js';

// Constants
const SUITS: Suit[] = ['clubs', 'spades', 'hearts', 'diamonds'];
const RANKS: Rank[] = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const TRUMP_ORDER = [
  'Q-clubs', 'Q-spades', 'Q-hearts', 'Q-diamonds',
  'J-clubs', 'J-spades', 'J-hearts', 'J-diamonds',
  'A-diamonds', '10-diamonds', 'K-diamonds', '9-diamonds', '8-diamonds', '7-diamonds',
];
const FAIL_ORDER: Rank[] = ['A', '10', 'K', '9', '8', '7'];
const POINT_VALUES: Record<Rank, number> = {
  'A': 11, '10': 10, 'K': 4, 'Q': 3, 'J': 2, '9': 0, '8': 0, '7': 0,
};

const DEFAULT_CONFIG: GameConfig = {
  playerCount: 5,
  partnerVariant: 'calledAce',
  noPickVariant: 'leaster',
  doubleOnBump: true,
  cracking: false,
  blitzes: false,
};

// Helper functions
function getCardId(card: Card): string {
  return `${card.rank}-${card.suit}`;
}

function isTrump(card: Card): boolean {
  return card.rank === 'Q' || card.rank === 'J' || card.suit === 'diamonds';
}

function getTrumpPower(card: Card): number {
  if (!isTrump(card)) return -1;
  return TRUMP_ORDER.indexOf(getCardId(card));
}

function getCardPoints(card: Card): number {
  return POINT_VALUES[card.rank];
}

// Create deck
function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, id: `${rank}-${suit}` });
    }
  }
  return deck;
}

// Shuffle deck
function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Sort hand for display
function sortHand(hand: Card[]): Card[] {
  return [...hand].sort((a, b) => {
    const aIsTrump = isTrump(a);
    const bIsTrump = isTrump(b);
    if (aIsTrump && !bIsTrump) return -1;
    if (!aIsTrump && bIsTrump) return 1;
    if (aIsTrump && bIsTrump) {
      return TRUMP_ORDER.indexOf(a.id) - TRUMP_ORDER.indexOf(b.id);
    }
    const suitOrder = ['clubs', 'spades', 'hearts'];
    const suitDiff = suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit);
    if (suitDiff !== 0) return suitDiff;
    return FAIL_ORDER.indexOf(a.rank) - FAIL_ORDER.indexOf(b.rank);
  });
}

// Deal cards
function dealCards(deck: Card[]): { hands: Card[][]; blind: Card[] } {
  const hands: Card[][] = [[], [], [], [], []];
  let idx = 0;

  // First round: 3 to each
  for (let p = 0; p < 5; p++) {
    for (let c = 0; c < 3; c++) hands[p].push(deck[idx++]);
  }
  // Blind
  const blind = [deck[idx++], deck[idx++]];
  // Second round: 3 to each
  for (let p = 0; p < 5; p++) {
    for (let c = 0; c < 3; c++) hands[p].push(deck[idx++]);
  }

  return { hands: hands.map(h => sortHand(h)), blind };
}

// Get legal plays
function getLegalPlays(
  hand: Card[],
  currentTrick: Trick,
  calledAce: { suit: Suit; revealed: boolean } | null,
  isPicker: boolean,
  isPartner: boolean
): Card[] {
  if (currentTrick.cards.length === 0) {
    // Leading - can play anything (with called ace restrictions)
    if (calledAce && !calledAce.revealed && isPartner) {
      const failCards = hand.filter(c => c.suit === calledAce.suit && !isTrump(c));
      if (failCards.length > 0 && failCards.length < 3) {
        // Must lead with called ace if have fewer than 3 of suit
        return failCards.filter(c => c.rank === 'A');
      }
    }
    return hand;
  }

  // Following
  const leadCard = currentTrick.cards[0].card;
  const leadIsTrump = isTrump(leadCard);

  if (leadIsTrump) {
    const trumpInHand = hand.filter(c => isTrump(c));
    return trumpInHand.length > 0 ? trumpInHand : hand;
  }

  const leadSuit = leadCard.suit;
  const suitInHand = hand.filter(c => c.suit === leadSuit && !isTrump(c));
  return suitInHand.length > 0 ? suitInHand : hand;
}

// Determine trick winner
function determineTrickWinner(trick: Trick): PlayerPosition {
  let winningPlay = trick.cards[0];
  let winningIsTrump = isTrump(winningPlay.card);

  for (let i = 1; i < trick.cards.length; i++) {
    const play = trick.cards[i];
    const playIsTrump = isTrump(play.card);

    if (playIsTrump && !winningIsTrump) {
      winningPlay = play;
      winningIsTrump = true;
    } else if (playIsTrump && winningIsTrump) {
      if (getTrumpPower(play.card) < getTrumpPower(winningPlay.card)) {
        winningPlay = play;
      }
    } else if (!playIsTrump && !winningIsTrump) {
      if (play.card.suit === winningPlay.card.suit) {
        if (FAIL_ORDER.indexOf(play.card.rank) < FAIL_ORDER.indexOf(winningPlay.card.rank)) {
          winningPlay = play;
        }
      }
    }
  }

  return winningPlay.playedBy;
}

// Get callable suits
function getCallableSuits(hand: Card[]): Suit[] {
  const callable: Suit[] = [];
  const failSuits: Suit[] = ['clubs', 'spades', 'hearts'];

  for (const suit of failSuits) {
    const hasAce = hand.some(c => c.suit === suit && c.rank === 'A' && !isTrump(c));
    if (!hasAce) {
      callable.push(suit);
    }
  }

  return callable;
}

// Check if must go alone
function mustGoAlone(hand: Card[]): boolean {
  const failSuits: Suit[] = ['clubs', 'spades', 'hearts'];
  for (const suit of failSuits) {
    const hasAce = hand.some(c => c.suit === suit && c.rank === 'A' && !isTrump(c));
    if (!hasAce) return false;
  }
  return true; // Has all 3 fail aces
}

// ============================================
// GAME STATE MANAGEMENT
// ============================================

export function createGameState(room: Room): GameState {
  const deck = shuffleDeck(createDeck());
  const { hands, blind } = dealCards(deck);

  const dealerPosition = (room.handsPlayed % 5) as PlayerPosition;
  const firstPicker = ((dealerPosition + 1) % 5) as PlayerPosition;

  const players: Player[] = [];
  for (let i = 0; i < 5; i++) {
    const pos = i as PlayerPosition;
    const humanPlayer = room.players.get(pos);
    players.push({
      position: pos,
      type: humanPlayer ? 'human' : 'ai',
      hand: hands[i],
      tricksWon: [],
      isDealer: i === dealerPosition,
      isPicker: false,
      isPartner: false,
    });
  }

  return {
    config: DEFAULT_CONFIG,
    phase: 'picking',
    players,
    deck: [],
    blind,
    buried: [],
    currentTrick: { cards: [], leadPlayer: firstPicker },
    completedTricks: [],
    currentPlayer: firstPicker,
    dealerPosition,
    pickerPosition: null,
    calledAce: null,
    passCount: 0,
    trickNumber: 1,
  };
}

export function applyAction(state: GameState, position: PlayerPosition, action: GameAction): boolean {
  // Validate it's this player's turn
  if (state.currentPlayer !== position) {
    return false;
  }

  const player = state.players[position];

  switch (action.type) {
    case 'pick': {
      if (state.phase !== 'picking') return false;

      // Add blind to hand
      player.hand = sortHand([...player.hand, ...state.blind]);
      player.isPicker = true;
      state.blind = [];
      state.pickerPosition = position;

      // Check if must go alone
      if (mustGoAlone(player.hand)) {
        state.phase = 'playing';
        const firstPlayer = ((state.dealerPosition + 1) % 5) as PlayerPosition;
        state.currentPlayer = firstPlayer;
        state.currentTrick = { cards: [], leadPlayer: firstPlayer };
      } else {
        state.phase = 'burying';
      }
      return true;
    }

    case 'pass': {
      if (state.phase !== 'picking') return false;

      state.passCount++;
      if (state.passCount >= 5) {
        // Everyone passed - leaster or new deal
        state.phase = 'scoring';
      } else {
        state.currentPlayer = ((position + 1) % 5) as PlayerPosition;
      }
      return true;
    }

    case 'bury': {
      if (state.phase !== 'burying') return false;
      if (state.pickerPosition !== position) return false;

      const cards = action.cards;
      // Remove cards from hand
      player.hand = player.hand.filter(c => !cards.some(bc => bc.id === c.id));
      player.hand = sortHand(player.hand);
      state.buried = cards;
      state.phase = 'calling';
      return true;
    }

    case 'callAce': {
      if (state.phase !== 'calling') return false;
      if (state.pickerPosition !== position) return false;

      const suit = action.suit;
      // Find partner
      const partnerPos = state.players.findIndex(p =>
        p.hand.some(c => c.suit === suit && c.rank === 'A' && !isTrump(c)) &&
        p.position !== position
      );

      if (partnerPos !== -1) {
        state.players[partnerPos].isPartner = true;
      }

      state.calledAce = { suit, revealed: false };
      state.phase = 'playing';
      const firstPlayer = ((state.dealerPosition + 1) % 5) as PlayerPosition;
      state.currentPlayer = firstPlayer;
      state.currentTrick = { cards: [], leadPlayer: firstPlayer };
      return true;
    }

    case 'goAlone': {
      if (state.phase !== 'calling') return false;
      if (state.pickerPosition !== position) return false;

      state.phase = 'playing';
      const firstPlayer = ((state.dealerPosition + 1) % 5) as PlayerPosition;
      state.currentPlayer = firstPlayer;
      state.currentTrick = { cards: [], leadPlayer: firstPlayer };
      return true;
    }

    case 'playCard': {
      if (state.phase !== 'playing') return false;

      const card = action.card;
      const legalPlays = getLegalPlays(
        player.hand,
        state.currentTrick,
        state.calledAce,
        player.isPicker,
        player.isPartner
      );

      if (!legalPlays.some(c => c.id === card.id)) {
        return false;
      }

      // Remove card from hand
      player.hand = player.hand.filter(c => c.id !== card.id);

      // Add to trick
      state.currentTrick.cards.push({ card, playedBy: position });

      // Check if called ace played
      if (state.calledAce && !state.calledAce.revealed &&
          card.suit === state.calledAce.suit && card.rank === 'A') {
        state.calledAce.revealed = true;
      }

      // Check if trick complete
      if (state.currentTrick.cards.length === 5) {
        const winner = determineTrickWinner(state.currentTrick);
        state.currentTrick.winningPlayer = winner;

        // Award trick to winner
        const trickCards = state.currentTrick.cards.map(tc => tc.card);
        state.players[winner].tricksWon.push(trickCards);

        state.completedTricks.push({ ...state.currentTrick });

        if (state.trickNumber >= 6) {
          state.phase = 'scoring';
        } else {
          state.trickNumber++;
          state.currentPlayer = winner;
          state.currentTrick = { cards: [], leadPlayer: winner };
        }
      } else {
        state.currentPlayer = ((position + 1) % 5) as PlayerPosition;
      }
      return true;
    }
  }

  return false;
}

// Calculate scores at end of hand
export function calculateScores(state: GameState, room: Room): void {
  if (state.pickerPosition === null) {
    // Leaster - everyone passed
    room.handsPlayed++;
    return;
  }

  // Calculate points for each team
  let pickerTeamPoints = 0;
  let defenderPoints = 0;

  // Add buried cards to picker's points
  pickerTeamPoints += state.buried.reduce((sum, c) => sum + getCardPoints(c), 0);

  for (const player of state.players) {
    const trickPoints = player.tricksWon.flat().reduce((sum, c) => sum + getCardPoints(c), 0);
    if (player.isPicker || player.isPartner) {
      pickerTeamPoints += trickPoints;
    } else {
      defenderPoints += trickPoints;
    }
  }

  const pickerWins = pickerTeamPoints >= 61;
  const isSchneider = pickerWins ? defenderPoints < 31 : pickerTeamPoints < 31;
  const isSchwarz = pickerWins
    ? state.players.filter(p => !p.isPicker && !p.isPartner).every(p => p.tricksWon.length === 0)
    : state.players.filter(p => p.isPicker || p.isPartner).every(p => p.tricksWon.length === 0);

  // Calculate score changes
  let basePoints = 1;
  if (isSchneider) basePoints = 2;
  if (isSchwarz) basePoints = 3;

  // Partner gets half points, picker gets 2x, defenders split
  const partnerPos = state.players.findIndex(p => p.isPartner);
  const hasPartner = partnerPos !== -1;

  for (let i = 0; i < 5; i++) {
    const player = state.players[i];
    if (player.isPicker) {
      room.playerScores[i] += (pickerWins ? basePoints : -basePoints) * (hasPartner ? 2 : 4);
    } else if (player.isPartner) {
      room.playerScores[i] += (pickerWins ? basePoints : -basePoints);
    } else {
      room.playerScores[i] += (pickerWins ? -basePoints : basePoints);
    }
  }

  room.handsPlayed++;
}

// Create client view of game state
export function getClientGameState(state: GameState, position: PlayerPosition, room: Room): ClientGameState {
  const clientPlayers: ClientPlayer[] = state.players.map((p, i) => {
    const roomPlayer = room.players.get(i as PlayerPosition);
    return {
      position: p.position,
      name: roomPlayer?.name ?? `AI ${i + 1}`,
      cardCount: p.hand.length,
      hand: i === position ? p.hand : null,
      tricksWon: p.tricksWon,
      isDealer: p.isDealer,
      isPicker: p.isPicker,
      isPartner: p.isPartner && (state.calledAce?.revealed ?? false),
      isAI: !roomPlayer,
      connected: roomPlayer?.connected ?? true,
    };
  });

  return {
    phase: state.phase,
    players: clientPlayers,
    blind: state.blind.length,
    currentTrick: state.currentTrick,
    completedTricks: state.completedTricks,
    currentPlayer: state.currentPlayer,
    dealerPosition: state.dealerPosition,
    pickerPosition: state.pickerPosition,
    calledAce: state.calledAce,
    passCount: state.passCount,
    trickNumber: state.trickNumber,
    playerScores: room.playerScores,
    handsPlayed: room.handsPlayed,
  };
}

// Check if current player is AI
export function isAITurn(state: GameState, room: Room): boolean {
  if (state.phase === 'scoring' || state.phase === 'dealing' || state.phase === 'gameOver') {
    return false;
  }
  return !room.players.has(state.currentPlayer);
}

// Get AI decision (simplified)
export function getAIAction(state: GameState, position: PlayerPosition): GameAction {
  const player = state.players[position];

  switch (state.phase) {
    case 'picking': {
      // Evaluate hand strength for picking
      const hand = player.hand;
      const trumpCards = hand.filter(c => isTrump(c));
      const trumpCount = trumpCards.length;

      // Count high trump (queens and jacks)
      const queens = trumpCards.filter(c => c.rank === 'Q').length;
      const jacks = trumpCards.filter(c => c.rank === 'J').length;
      const highTrump = queens + jacks;

      // Count fail aces (not diamond ace, that's trump)
      const failAces = hand.filter(c => c.rank === 'A' && c.suit !== 'diamonds').length;

      // Pick criteria (more realistic):
      // - 4+ trump with at least 2 high trump (queens/jacks)
      // - 3+ trump with 3+ high trump
      // - Any hand with 3+ queens
      // - 5+ trump regardless
      const shouldPick =
        trumpCount >= 5 ||
        (trumpCount >= 4 && highTrump >= 2) ||
        (trumpCount >= 3 && highTrump >= 3) ||
        queens >= 3 ||
        (trumpCount >= 4 && failAces >= 1);

      if (shouldPick) {
        return { type: 'pick' };
      }
      return { type: 'pass' };
    }

    case 'burying': {
      // Smart burying: maximize points buried, but prefer low cards
      // NEVER bury queens or jacks (top trump)
      // Prefer to bury: fail 10s/Kings (points but not control), then create voids

      const hand = player.hand;

      // Sort candidates: prefer non-trump, prefer low point value, but bury points if safe
      const buryPriority = (card: Card): number => {
        // Never bury queens or jacks
        if (card.rank === 'Q' || card.rank === 'J') return 1000;
        // Prefer to keep aces (control cards)
        if (card.rank === 'A') return 100;
        // Trump diamonds we want to keep
        if (isTrump(card)) return 50 + getCardPoints(card);
        // Non-trump: prefer to bury 10s and Kings (points), then low cards
        // Lower score = bury first
        const points = getCardPoints(card);
        if (points >= 10) return 5; // 10s - good to bury (10 pts, no control)
        if (points === 4) return 10; // Kings - ok to bury
        return 20 - points; // Low cards (7,8,9) - fine to bury but no points
      };

      const sortedHand = [...hand].sort((a, b) => buryPriority(a) - buryPriority(b));
      const toBury = sortedHand.slice(0, 2);

      return { type: 'bury', cards: toBury as [Card, Card] };
    }

    case 'calling': {
      const callable = getCallableSuits(player.hand);
      if (callable.length > 0) {
        return { type: 'callAce', suit: callable[0] };
      }
      return { type: 'goAlone' };
    }

    case 'playing': {
      const legalPlays = getLegalPlays(
        player.hand,
        state.currentTrick,
        state.calledAce,
        player.isPicker,
        player.isPartner
      );
      // Play highest trump or lowest fail
      return { type: 'playCard', card: legalPlays[0] };
    }

    default:
      return { type: 'pass' };
  }
}
