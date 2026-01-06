// ExplanationModal - shows AI decision reasoning

interface ExplanationModalProps {
  playerPosition: number;
  action: string;
  reason: string;
  detailedExplanation: string;
  onClose: () => void;
}

export function ExplanationModal({
  playerPosition,
  action,
  reason,
  detailedExplanation,
  onClose,
}: ExplanationModalProps) {
  const playerName = playerPosition === 0 ? 'You' : `Player ${playerPosition + 1}`;

  const actionDisplay: Record<string, string> = {
    pick: 'Picked',
    pass: 'Passed',
    bury: 'Buried cards',
    callAce: 'Called ace',
    goAlone: 'Going alone',
    playCard: 'Played card',
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-yellow-400">
              Why did {playerName} do that?
            </h2>
            <p className="text-green-300 text-sm">
              Action: {actionDisplay[action] || action}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="bg-black/30 rounded-lg p-4 mb-4">
          <h3 className="text-green-400 font-bold text-sm mb-2">Quick Reason:</h3>
          <p className="text-white">{reason}</p>
        </div>

        <div className="bg-black/30 rounded-lg p-4">
          <h3 className="text-green-400 font-bold text-sm mb-2">Detailed Analysis:</h3>
          <pre className="text-white text-sm whitespace-pre-wrap font-mono">
            {detailedExplanation}
          </pre>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
