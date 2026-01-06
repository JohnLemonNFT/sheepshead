// ============================================
// SCORING - Point calculation and game scoring
// ============================================

import {
  Card,
  Player,
  PlayerPosition,
  GameState,
  HandScore,
  getCardPoints,
  getTotalPoints,
} from './types';

/**
 * Calculate points won by a player from their tricks
 */
export function calculatePlayerPoints(player: Player): number {
  return player.tricksWon.reduce((total, trick) => {
    return total + getTotalPoints(trick);
  }, 0);
}

/**
 * Calculate the score for a completed hand
 */
export function calculateHandScore(state: GameState): HandScore {
  const { players, pickerPosition, buried, config } = state;

  if (pickerPosition === null) {
    // Leaster - no one picked
    return calculateLeasterScore(state);
  }

  const picker = players[pickerPosition];

  // Find partner (if any)
  const partnerPosition = players.findIndex(p => p.isPartner && p.position !== pickerPosition);
  const partner = partnerPosition >= 0 ? players[partnerPosition] : null;

  // Calculate picker team points (including buried cards)
  let pickerTeamPoints = getTotalPoints(buried);
  pickerTeamPoints += calculatePlayerPoints(picker);
  if (partner) {
    pickerTeamPoints += calculatePlayerPoints(partner);
  }

  // Defender points
  const defenderTeamPoints = 120 - pickerTeamPoints;

  // Determine winner
  const pickerWins = pickerTeamPoints >= 61;

  // Check for schneider (loser < 31 points)
  const loserPoints = pickerWins ? defenderTeamPoints : pickerTeamPoints;
  const isSchneider = loserPoints < 31;

  // Check for schwarz (loser won no tricks)
  let isSchwarz = false;
  if (pickerWins) {
    // Defenders won no tricks
    const defenderTricks = players
      .filter((_, i) => i !== pickerPosition && i !== partnerPosition)
      .reduce((sum, p) => sum + p.tricksWon.length, 0);
    isSchwarz = defenderTricks === 0;
  } else {
    // Picker team won no tricks
    const pickerTricks = picker.tricksWon.length + (partner?.tricksWon.length || 0);
    isSchwarz = pickerTricks === 0;
  }

  // Calculate multiplier
  let multiplier = 1;
  if (isSchneider) multiplier = 2;
  if (isSchwarz) multiplier = 3;

  // Calculate individual scores
  const playerScores = calculatePlayerScores(
    players,
    pickerPosition,
    partnerPosition >= 0 ? partnerPosition : null,
    pickerWins,
    multiplier,
    config.playerCount
  );

  return {
    pickerTeamPoints,
    defenderTeamPoints,
    pickerWins,
    isSchneider,
    isSchwarz,
    multiplier,
    playerScores,
  };
}

/**
 * Calculate individual player scores for the hand
 * Standard 5-handed scoring:
 * - If picker wins: picker +2, partner +1, each defender -1
 * - If defenders win: picker -2, partner -1, each defender +1
 * Multiply by schneider/schwarz multiplier
 */
function calculatePlayerScores(
  players: Player[],
  pickerPosition: number,
  partnerPosition: number | null,
  pickerWins: boolean,
  multiplier: number,
  playerCount: number
): { position: PlayerPosition; points: number }[] {
  const scores: { position: PlayerPosition; points: number }[] = [];

  const basePickerScore = 2 * multiplier;
  const basePartnerScore = 1 * multiplier;
  const baseDefenderScore = 1 * multiplier;

  for (let i = 0; i < playerCount; i++) {
    const position = i as PlayerPosition;
    let points: number;

    if (i === pickerPosition) {
      points = pickerWins ? basePickerScore : -basePickerScore;
    } else if (i === partnerPosition) {
      points = pickerWins ? basePartnerScore : -basePartnerScore;
    } else {
      points = pickerWins ? -baseDefenderScore : baseDefenderScore;
    }

    scores.push({ position, points });
  }

  return scores;
}

/**
 * Calculate leaster scoring (when no one picks)
 * Player with fewest points wins, takes 1 point from each other player
 */
function calculateLeasterScore(state: GameState): HandScore {
  const { players } = state;

  // Find player with fewest points
  let minPoints = Infinity;
  let winnerPosition = 0;

  for (let i = 0; i < players.length; i++) {
    const points = calculatePlayerPoints(players[i]);
    if (points < minPoints) {
      minPoints = points;
      winnerPosition = i;
    }
  }

  // Winner gets 1 point from each other player
  const playerScores = players.map((_, i) => ({
    position: i as PlayerPosition,
    points: i === winnerPosition ? players.length - 1 : -1,
  }));

  return {
    pickerTeamPoints: 0,
    defenderTeamPoints: 120,
    pickerWins: false,
    isSchneider: false,
    isSchwarz: false,
    multiplier: 1,
    playerScores,
  };
}

/**
 * Get a summary description of the hand result
 */
export function getHandResultSummary(score: HandScore, picker: number, partner: number | null): string {
  if (score.pickerTeamPoints === 0 && score.defenderTeamPoints === 120) {
    return `Leaster! Player with fewest points wins.`;
  }

  const team = partner !== null
    ? `Player ${picker + 1} (picker) and Player ${partner + 1} (partner)`
    : `Player ${picker + 1} (going alone)`;

  let result = score.pickerWins ? 'wins' : 'loses';

  if (score.isSchwarz) {
    result += ' with SCHWARZ (no tricks)!';
  } else if (score.isSchneider) {
    result += ' with schneider (under 31 points)';
  }

  return `${team} ${result} - ${score.pickerTeamPoints} to ${score.defenderTeamPoints}`;
}
