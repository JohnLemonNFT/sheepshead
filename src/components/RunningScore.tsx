// Running Score - shows live point totals during play

import { Card, getCardPoints, PlayerPosition, Trick } from '../game/types';

interface RunningScoreProps {
  completedTricks: Trick[];
  currentTrick: { card: Card; playedBy: PlayerPosition }[];
  pickerPosition: PlayerPosition | null;
  partnerPosition: PlayerPosition | null;
  buriedCards?: Card[];
}

export function RunningScore({
  completedTricks,
  currentTrick,
  pickerPosition,
  partnerPosition,
  buriedCards = [],
}: RunningScoreProps) {
  if (pickerPosition === null) return null;

  // Calculate points from completed tricks
  let pickerTeamPoints = 0;
  let defenderPoints = 0;

  // Add buried card points to picker team
  pickerTeamPoints += buriedCards.reduce((sum, c) => sum + getCardPoints(c), 0);

  // Add completed trick points
  for (const trick of completedTricks) {
    const trickPoints = trick.cards.reduce((sum, play) => sum + getCardPoints(play.card), 0);
    const winner = trick.winningPlayer;
    if (winner === undefined) continue;

    const winnerIsPickerTeam = winner === pickerPosition || winner === partnerPosition;

    if (winnerIsPickerTeam) {
      pickerTeamPoints += trickPoints;
    } else {
      defenderPoints += trickPoints;
    }
  }

  // Points in current trick (not yet won)
  const currentTrickPoints = currentTrick.reduce((sum, play) => sum + getCardPoints(play.card), 0);

  const pickerNeedsMore = Math.max(0, 61 - pickerTeamPoints);
  const defendersNeedMore = Math.max(0, 60 - defenderPoints);

  return (
    <div className="flex justify-center gap-2 text-[10px] sm:text-xs mb-2">
      <div className={`px-2 py-1 rounded ${pickerTeamPoints >= 61 ? 'bg-yellow-600' : 'bg-yellow-900/50'} border border-yellow-500/50`}>
        <span className="text-yellow-300">👑 Picker: </span>
        <span className="text-white font-bold">{pickerTeamPoints}</span>
        <span className="text-yellow-300/70">/{61}</span>
      </div>
      <div className={`px-2 py-1 rounded ${defenderPoints >= 60 ? 'bg-red-600' : 'bg-red-900/50'} border border-red-500/50`}>
        <span className="text-red-300">⚔️ Def: </span>
        <span className="text-white font-bold">{defenderPoints}</span>
        <span className="text-red-300/70">/{60}</span>
      </div>
      {currentTrickPoints > 0 && (
        <div className="px-2 py-1 rounded bg-white/10 border border-white/20">
          <span className="text-gray-400">🎯 </span>
          <span className="text-white">{currentTrickPoints}</span>
        </div>
      )}
    </div>
  );
}
