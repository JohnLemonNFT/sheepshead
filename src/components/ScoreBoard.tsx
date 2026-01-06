// ScoreBoard component - displays running scores

import { PlayerPosition } from '../game/types';

interface ScoreBoardProps {
  scores: number[];
  pickerPosition: PlayerPosition | null;
  partnerPosition?: PlayerPosition | null;
  currentPlayer?: PlayerPosition;
  handsPlayed: number;
}

export function ScoreBoard({
  scores,
  pickerPosition,
  partnerPosition,
  currentPlayer,
  handsPlayed,
}: ScoreBoardProps) {
  return (
    <div className="bg-black/30 rounded-lg p-2 sm:p-3 md:p-4">
      <h3 className="text-green-300 font-bold mb-2 sm:mb-3 text-xs sm:text-sm">
        Scores (Hand #{handsPlayed + 1})
      </h3>
      <div className="space-y-0.5 sm:space-y-1">
        {scores.map((score, i) => {
          const isPicker = pickerPosition === i;
          const isPartner = partnerPosition === i;
          const isCurrent = currentPlayer === i;
          const isHuman = i === 0;

          return (
            <div
              key={i}
              className={`
                flex justify-between items-center text-xs sm:text-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded
                ${isCurrent ? 'bg-green-700/50' : ''}
                ${isPicker ? 'text-yellow-400' : ''}
                ${isPartner ? 'text-blue-400' : ''}
              `}
            >
              <span className="truncate mr-2">
                {isHuman ? 'You' : `P${i + 1}`}
                {isPicker && ' (P)'}
                {isPartner && ' (A)'}
              </span>
              <span className="font-mono font-bold flex-shrink-0">
                {score >= 0 ? '+' : ''}
                {score}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
