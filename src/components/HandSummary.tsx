// HandSummary component - shows results after each hand

import { HandScore, PlayerPosition } from '../game/types';

interface HandSummaryProps {
  score: HandScore;
  pickerPosition: PlayerPosition | null;
  partnerPosition: PlayerPosition | null;
  calledSuit: string | null;
  onClose: () => void;
}

export function HandSummary({
  score,
  pickerPosition,
  partnerPosition,
  calledSuit,
  onClose,
}: HandSummaryProps) {
  const getPlayerName = (pos: number) => (pos === 0 ? 'You' : `Player ${pos + 1}`);

  // Leaster
  if (pickerPosition === null) {
    const winner = score.playerScores.find(ps => ps.points > 0);
    return (
      <div className="bg-black/80 rounded-xl p-6 max-w-md mx-auto text-center">
        <h2 className="text-2xl font-bold text-yellow-400 mb-4">Leaster!</h2>
        <p className="text-lg mb-4">Nobody picked - fewest points wins</p>
        {winner && (
          <p className="text-green-400 text-xl">
            {getPlayerName(winner.position)} wins with fewest points!
          </p>
        )}
        <div className="mt-6 space-y-2">
          <h3 className="text-sm text-green-300 font-bold">Score Changes:</h3>
          {score.playerScores.map(ps => (
            <div key={ps.position} className="flex justify-between">
              <span>{getPlayerName(ps.position)}</span>
              <span className={ps.points >= 0 ? 'text-green-400' : 'text-red-400'}>
                {ps.points >= 0 ? '+' : ''}{ps.points}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const pickerName = getPlayerName(pickerPosition);
  const partnerName = partnerPosition !== null ? getPlayerName(partnerPosition) : null;
  const goingAlone = partnerPosition === null;

  return (
    <div className="bg-black/80 rounded-xl p-6 max-w-md mx-auto">
      {/* Result header */}
      <h2
        className={`text-2xl font-bold text-center mb-4 ${
          score.pickerWins ? 'text-yellow-400' : 'text-red-400'
        }`}
      >
        {score.pickerWins ? 'Picker Wins!' : 'Defenders Win!'}
        {score.isSchwarz && ' (SCHWARZ!)'}
        {score.isSchneider && !score.isSchwarz && ' (Schneider)'}
      </h2>

      {/* Teams */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-yellow-900/30 rounded-lg p-3">
          <h3 className="text-yellow-400 font-bold text-sm mb-2">Picker Team</h3>
          <p className="text-white">
            {pickerName} (P)
            {partnerName && (
              <>
                <br />
                {partnerName} (A)
              </>
            )}
            {goingAlone && <span className="text-sm text-gray-400"> (alone)</span>}
          </p>
          <p className="text-2xl font-bold text-yellow-400 mt-2">
            {score.pickerTeamPoints} pts
          </p>
        </div>
        <div className="bg-blue-900/30 rounded-lg p-3">
          <h3 className="text-blue-400 font-bold text-sm mb-2">Defenders</h3>
          <p className="text-white text-sm">
            {[0, 1, 2, 3, 4]
              .filter(i => i !== pickerPosition && i !== partnerPosition)
              .map(i => getPlayerName(i))
              .join(', ')}
          </p>
          <p className="text-2xl font-bold text-blue-400 mt-2">
            {score.defenderTeamPoints} pts
          </p>
        </div>
      </div>

      {/* Called ace info */}
      {calledSuit && (
        <p className="text-center text-gray-300 text-sm mb-4">
          Called ace: {calledSuit.charAt(0).toUpperCase() + calledSuit.slice(1)}
        </p>
      )}

      {/* Score changes */}
      <div className="border-t border-gray-700 pt-4">
        <h3 className="text-sm text-green-300 font-bold mb-3 text-center">
          Score Changes (x{score.multiplier})
        </h3>
        <div className="space-y-2">
          {score.playerScores.map(ps => (
            <div
              key={ps.position}
              className="flex justify-between items-center px-2"
            >
              <span className="text-white">
                {getPlayerName(ps.position)}
                {ps.position === pickerPosition && ' (P)'}
                {ps.position === partnerPosition && ' (A)'}
              </span>
              <span
                className={`font-bold ${
                  ps.points >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {ps.points >= 0 ? '+' : ''}
                {ps.points}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
