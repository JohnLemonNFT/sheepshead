// ============================================
// AI ANALYZER - Simulate games and find issues
// ============================================

import {
  Card,
  GameState,
  PlayerPosition,
  Suit,
  isTrump,
  getCardPoints,
  getTrumpPower,
  FAIL_SUITS,
  DEFAULT_CONFIG
} from '../types';
import { createDeck, shuffleDeck, dealCards, sortHand } from '../deck';
import { getLegalPlays, getCallableSuits, determineTrickWinner } from '../rules';
import { decideWhetherToPick } from './pick';
import { decideBury } from './bury';
import { decideCall } from './call';
import { decidePlay } from './play';
import { evaluateHandStrength, createInitialKnowledge, updateKnowledgeAfterPlay, AIGameKnowledge } from './tracking';

// Issue types we're looking for
export interface AIIssue {
  type:
    | 'weak_pick'           // Picked with terrible hand
    | 'forced_alone'        // Went alone when shouldn't have
    | 'bad_bury'            // Buried hold card unnecessarily
    | 'picker_blowout'      // Picker lost badly (schneider/schwarz)
    | 'defender_blowout'    // Defenders lost badly
    | 'illegal_play'        // Made an illegal play (BUG!)
    | 'no_callable_suit';   // Had to go alone due to no callable suits
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  handDetails: {
    pickerPosition: PlayerPosition;
    pickerHand: Card[];
    trumpCount: number;
    failAces: number;
    buried?: Card[];
    calledSuit?: Suit | null;
    wentAlone: boolean;
    pickerPoints: number;
    defenderPoints: number;
  };
  gameNumber: number;
}

export interface AnalysisResult {
  gamesPlayed: number;
  issues: AIIssue[];
  stats: {
    totalPicks: number;
    totalPasses: number;
    pickerWins: number;
    defenderWins: number;
    schneiders: number;
    schwarzes: number;
    goAlones: number;
    goAloneWins: number;
    averagePickerTrump: number;
    averagePickerPoints: number;
  };
}

// Simulate a single hand and return any issues found
function simulateHand(gameNumber: number): {
  issue: AIIssue | null;
  pickerWon: boolean | null;
  wentAlone: boolean;
  pickerTrump: number;
  pickerPoints: number;
  wasSchneider: boolean;
  wasSchwarz: boolean;
} {
  // Deal cards
  const { deck, seed } = shuffleDeck(createDeck());
  const { hands, blind } = dealCards(deck, 5);

  // Sort hands
  const sortedHands = hands.map(h => sortHand(h));

  // Picking phase
  let pickerPosition: PlayerPosition | null = null;
  let pickerHand: Card[] = [];
  let passCount = 0;

  for (let i = 0; i < 5; i++) {
    const pos = i as PlayerPosition;
    const hand = sortedHands[pos];
    const decision = decideWhetherToPick(hand, pos, 0 as PlayerPosition, passCount, 'intermediate');

    if (decision.shouldPick) {
      pickerPosition = pos;
      pickerHand = [...hand, ...blind];
      break;
    }
    passCount++;
  }

  // Everyone passed - leaster (skip for now)
  if (pickerPosition === null) {
    return {
      issue: null,
      pickerWon: null,
      wentAlone: false,
      pickerTrump: 0,
      pickerPoints: 0,
      wasSchneider: false,
      wasSchwarz: false
    };
  }

  // Evaluate picker's hand BEFORE bury
  const eval_ = evaluateHandStrength(pickerHand);
  const pickerTrumpCount = eval_.trumpCount;
  const pickerFailAces = eval_.failAces;

  // Bury phase
  const buryDecision = decideBury(pickerHand, null);
  const buried = buryDecision.cardsToBury;
  const handAfterBury = pickerHand.filter(c => !buried.some(b => b.id === c.id));

  // Call phase
  const callableSuits = getCallableSuits(handAfterBury);
  const callDecision = decideCall(handAfterBury, true);
  const wentAlone = callDecision.goAlone;
  const calledSuit = callDecision.suit;

  // Check for issues so far
  let issue: AIIssue | null = null;

  // Issue: Picked with weak hand (< 3 trump)
  if (pickerTrumpCount < 3 && pickerFailAces < 2) {
    issue = {
      type: 'weak_pick',
      severity: pickerTrumpCount < 2 ? 'high' : 'medium',
      description: `Picked with only ${pickerTrumpCount} trump and ${pickerFailAces} aces`,
      handDetails: {
        pickerPosition,
        pickerHand: [...pickerHand],
        trumpCount: pickerTrumpCount,
        failAces: pickerFailAces,
        buried,
        calledSuit,
        wentAlone,
        pickerPoints: 0,
        defenderPoints: 0,
      },
      gameNumber,
    };
  }

  // Issue: Forced to go alone due to no callable suits (but didn't have all 3 aces)
  if (wentAlone && pickerFailAces < 3 && callableSuits.length === 0) {
    issue = {
      type: 'no_callable_suit',
      severity: 'high',
      description: `Forced alone - no callable suits after bury (had ${pickerFailAces} aces, ${pickerTrumpCount} trump)`,
      handDetails: {
        pickerPosition,
        pickerHand: [...pickerHand],
        trumpCount: pickerTrumpCount,
        failAces: pickerFailAces,
        buried,
        calledSuit,
        wentAlone,
        pickerPoints: 0,
        defenderPoints: 0,
      },
      gameNumber,
    };
  }

  // Issue: Went alone with weak hand (not forced)
  if (wentAlone && pickerFailAces < 3 && callableSuits.length > 0 && pickerTrumpCount < 5) {
    issue = {
      type: 'forced_alone',
      severity: 'medium',
      description: `Chose to go alone with only ${pickerTrumpCount} trump (had callable suits!)`,
      handDetails: {
        pickerPosition,
        pickerHand: [...pickerHand],
        trumpCount: pickerTrumpCount,
        failAces: pickerFailAces,
        buried,
        calledSuit,
        wentAlone,
        pickerPoints: 0,
        defenderPoints: 0,
      },
      gameNumber,
    };
  }

  // Find partner if called
  let partnerPosition: PlayerPosition | null = null;
  if (calledSuit && !wentAlone) {
    for (let i = 0; i < 5; i++) {
      if (i === pickerPosition) continue;
      const hand = sortedHands[i];
      if (hand.some(c => c.suit === calledSuit && c.rank === 'A' && !isTrump(c))) {
        partnerPosition = i as PlayerPosition;
        break;
      }
    }
  }

  // Update hands for play phase
  sortedHands[pickerPosition] = sortHand(handAfterBury);

  // Initialize knowledge for each player
  const playerKnowledge: AIGameKnowledge[] = [];
  for (let i = 0; i < 5; i++) {
    playerKnowledge[i] = createInitialKnowledge(sortedHands[i], i as PlayerPosition, pickerPosition);
  }

  // Track if called ace has been revealed
  let calledAceRevealed = false;

  // Simulate trick play
  const tricksWon: Card[][] = [[], [], [], [], []];
  let currentLeader = ((0 + 1) % 5) as PlayerPosition; // Left of dealer

  for (let trick = 0; trick < 6; trick++) {
    const trickCards: { card: Card; playedBy: PlayerPosition }[] = [];

    for (let p = 0; p < 5; p++) {
      const pos = ((currentLeader + p) % 5) as PlayerPosition;
      const hand = sortedHands[pos];

      if (hand.length === 0) continue;

      const isPicker = pos === pickerPosition;
      const isPartner = pos === partnerPosition;
      const isKnownPartner = calledAceRevealed && isPartner;

      // Get legal plays
      const currentTrick = { cards: trickCards, leadPlayer: currentLeader };
      const calledAceState = calledSuit ? { suit: calledSuit, revealed: calledAceRevealed } : null;
      const legalPlays = getLegalPlays(
        hand,
        currentTrick,
        calledAceState,
        isPicker,
        isPartner
      );

      if (legalPlays.length === 0) {
        // BUG: No legal plays!
        issue = {
          type: 'illegal_play',
          severity: 'critical',
          description: `No legal plays available for position ${pos}!`,
          handDetails: {
            pickerPosition,
            pickerHand: [...pickerHand],
            trumpCount: pickerTrumpCount,
            failAces: pickerFailAces,
            buried,
            calledSuit,
            wentAlone,
            pickerPoints: 0,
            defenderPoints: 0,
          },
          gameNumber,
        };
        break;
      }

      // AI decides play
      const playDecision = decidePlay(
        hand,
        currentTrick,
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

      // Verify it's legal
      if (!legalPlays.some(c => c.id === cardToPlay.id)) {
        issue = {
          type: 'illegal_play',
          severity: 'critical',
          description: `AI chose illegal card ${cardToPlay.rank}-${cardToPlay.suit}!`,
          handDetails: {
            pickerPosition,
            pickerHand: [...pickerHand],
            trumpCount: pickerTrumpCount,
            failAces: pickerFailAces,
            buried,
            calledSuit,
            wentAlone,
            pickerPoints: 0,
            defenderPoints: 0,
          },
          gameNumber,
        };
        break;
      }

      // Check if called ace was played
      if (calledSuit && !calledAceRevealed && cardToPlay.suit === calledSuit && cardToPlay.rank === 'A' && !isTrump(cardToPlay)) {
        calledAceRevealed = true;
      }

      // Play the card
      trickCards.push({ card: cardToPlay, playedBy: pos });
      sortedHands[pos] = hand.filter(c => c.id !== cardToPlay.id);

      // Update all players' knowledge
      for (let k = 0; k < 5; k++) {
        playerKnowledge[k] = updateKnowledgeAfterPlay(
          playerKnowledge[k],
          cardToPlay,
          pos,
          currentTrick,
          calledAceState,
          pickerPosition
        );
      }
    }

    if (trickCards.length < 5) break; // Error occurred

    // Determine trick winner
    const winner = determineTrickWinner({ cards: trickCards, leadPlayer: currentLeader });
    tricksWon[winner].push(...trickCards.map(tc => tc.card));
    currentLeader = winner as PlayerPosition;
  }

  // Calculate points
  let pickerTeamPoints = buried.reduce((sum, c) => sum + getCardPoints(c), 0);
  let defenderPoints = 0;

  for (let i = 0; i < 5; i++) {
    const points = tricksWon[i].reduce((sum, c) => sum + getCardPoints(c), 0);
    if (i === pickerPosition || i === partnerPosition) {
      pickerTeamPoints += points;
    } else {
      defenderPoints += points;
    }
  }

  const pickerWon = pickerTeamPoints >= 61;
  const wasSchneider = pickerWon ? defenderPoints < 31 : pickerTeamPoints < 31;
  const wasSchwarz = pickerWon
    ? [0,1,2,3,4].filter(i => i !== pickerPosition && i !== partnerPosition).every(i => tricksWon[i].length === 0)
    : (tricksWon[pickerPosition!].length === 0 && (partnerPosition === null || tricksWon[partnerPosition].length === 0));

  // Check for blowout issues
  if (!pickerWon && wasSchneider && !issue) {
    issue = {
      type: 'picker_blowout',
      severity: wasSchwarz ? 'high' : 'medium',
      description: `Picker lost ${wasSchwarz ? 'schwarz' : 'schneider'} (${pickerTeamPoints} pts) with ${pickerTrumpCount} trump`,
      handDetails: {
        pickerPosition,
        pickerHand: [...pickerHand],
        trumpCount: pickerTrumpCount,
        failAces: pickerFailAces,
        buried,
        calledSuit,
        wentAlone,
        pickerPoints: pickerTeamPoints,
        defenderPoints,
      },
      gameNumber,
    };
  }

  // Update issue with final scores if we have one
  if (issue) {
    issue.handDetails.pickerPoints = pickerTeamPoints;
    issue.handDetails.defenderPoints = defenderPoints;
  }

  return {
    issue,
    pickerWon,
    wentAlone,
    pickerTrump: pickerTrumpCount,
    pickerPoints: pickerTeamPoints,
    wasSchneider,
    wasSchwarz,
  };
}

// Run analysis on many games
export function analyzeAI(numGames: number = 100): AnalysisResult {
  const issues: AIIssue[] = [];
  let totalPicks = 0;
  let totalPasses = 0;
  let pickerWins = 0;
  let defenderWins = 0;
  let schneiders = 0;
  let schwarzes = 0;
  let goAlones = 0;
  let goAloneWins = 0;
  let totalPickerTrump = 0;
  let totalPickerPoints = 0;

  for (let i = 0; i < numGames; i++) {
    const result = simulateHand(i + 1);

    if (result.pickerWon === null) {
      totalPasses++;
      continue;
    }

    totalPicks++;
    totalPickerTrump += result.pickerTrump;
    totalPickerPoints += result.pickerPoints;

    if (result.wentAlone) {
      goAlones++;
      if (result.pickerWon) goAloneWins++;
    }

    if (result.pickerWon) {
      pickerWins++;
    } else {
      defenderWins++;
    }

    if (result.wasSchneider) schneiders++;
    if (result.wasSchwarz) schwarzes++;

    if (result.issue) {
      issues.push(result.issue);
    }
  }

  return {
    gamesPlayed: numGames,
    issues,
    stats: {
      totalPicks,
      totalPasses,
      pickerWins,
      defenderWins,
      schneiders,
      schwarzes,
      goAlones,
      goAloneWins,
      averagePickerTrump: totalPicks > 0 ? totalPickerTrump / totalPicks : 0,
      averagePickerPoints: totalPicks > 0 ? totalPickerPoints / totalPicks : 0,
    },
  };
}

// Format analysis results for display
export function formatAnalysisReport(result: AnalysisResult): string {
  const lines: string[] = [];

  lines.push('═══════════════════════════════════════════════════════════');
  lines.push('                    AI ANALYSIS REPORT');
  lines.push('═══════════════════════════════════════════════════════════');
  lines.push('');

  // Stats
  lines.push('📊 STATISTICS');
  lines.push('─────────────────────────────────────────────────────────');
  lines.push(`Games played: ${result.gamesPlayed}`);
  lines.push(`Hands picked: ${result.stats.totalPicks} (${((result.stats.totalPicks / result.gamesPlayed) * 100).toFixed(1)}%)`);
  lines.push(`All passed (leaster): ${result.stats.totalPasses}`);
  lines.push('');
  lines.push(`Picker wins: ${result.stats.pickerWins} (${((result.stats.pickerWins / result.stats.totalPicks) * 100).toFixed(1)}%)`);
  lines.push(`Defender wins: ${result.stats.defenderWins} (${((result.stats.defenderWins / result.stats.totalPicks) * 100).toFixed(1)}%)`);
  lines.push(`Schneiders: ${result.stats.schneiders}`);
  lines.push(`Schwarzes: ${result.stats.schwarzes}`);
  lines.push('');
  lines.push(`Go alones: ${result.stats.goAlones} (${result.stats.goAloneWins} wins)`);
  lines.push(`Average picker trump: ${result.stats.averagePickerTrump.toFixed(1)}`);
  lines.push(`Average picker points: ${result.stats.averagePickerPoints.toFixed(1)}`);
  lines.push('');

  // Issues by severity
  const criticalIssues = result.issues.filter(i => i.severity === 'critical');
  const highIssues = result.issues.filter(i => i.severity === 'high');
  const mediumIssues = result.issues.filter(i => i.severity === 'medium');
  const lowIssues = result.issues.filter(i => i.severity === 'low');

  lines.push('🚨 ISSUES FOUND');
  lines.push('─────────────────────────────────────────────────────────');
  lines.push(`Critical: ${criticalIssues.length}`);
  lines.push(`High: ${highIssues.length}`);
  lines.push(`Medium: ${mediumIssues.length}`);
  lines.push(`Low: ${lowIssues.length}`);
  lines.push('');

  // Issue breakdown by type
  const issuesByType = new Map<string, number>();
  for (const issue of result.issues) {
    issuesByType.set(issue.type, (issuesByType.get(issue.type) || 0) + 1);
  }

  lines.push('📋 ISSUES BY TYPE');
  lines.push('─────────────────────────────────────────────────────────');
  for (const [type, count] of issuesByType) {
    lines.push(`${type}: ${count}`);
  }
  lines.push('');

  // Sample issues (first 5 of each severity)
  if (criticalIssues.length > 0) {
    lines.push('🔴 CRITICAL ISSUES (first 5)');
    lines.push('─────────────────────────────────────────────────────────');
    for (const issue of criticalIssues.slice(0, 5)) {
      lines.push(formatIssue(issue));
      lines.push('');
    }
  }

  if (highIssues.length > 0) {
    lines.push('🟠 HIGH SEVERITY ISSUES (first 5)');
    lines.push('─────────────────────────────────────────────────────────');
    for (const issue of highIssues.slice(0, 5)) {
      lines.push(formatIssue(issue));
      lines.push('');
    }
  }

  if (mediumIssues.length > 0) {
    lines.push('🟡 MEDIUM SEVERITY ISSUES (first 5)');
    lines.push('─────────────────────────────────────────────────────────');
    for (const issue of mediumIssues.slice(0, 5)) {
      lines.push(formatIssue(issue));
      lines.push('');
    }
  }

  return lines.join('\n');
}

function formatIssue(issue: AIIssue): string {
  const h = issue.handDetails;
  const trumpCards = h.pickerHand.filter(c => isTrump(c));
  const queens = trumpCards.filter(c => c.rank === 'Q').map(c => c.suit[0].toUpperCase()).join('');
  const jacks = trumpCards.filter(c => c.rank === 'J').map(c => c.suit[0].toUpperCase()).join('');

  let s = `Game #${issue.gameNumber}: ${issue.description}\n`;
  s += `  Hand: ${h.trumpCount} trump (Q:${queens || 'none'} J:${jacks || 'none'}), ${h.failAces} aces\n`;
  s += `  Result: ${h.pickerPoints} vs ${h.defenderPoints} pts`;
  if (h.wentAlone) s += ' (ALONE)';
  if (h.buried) s += `\n  Buried: ${h.buried.map(c => `${c.rank}${c.suit[0]}`).join(', ')}`;

  return s;
}
