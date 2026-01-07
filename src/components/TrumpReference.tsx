// Trump Reference - collapsible trump order reference

import { useState } from 'react';

export function TrumpReference() {
  const [isOpen, setIsOpen] = useState(false);

  const trumpOrder = [
    { card: 'Q♣', name: 'Queen of Clubs', points: 3 },
    { card: 'Q♠', name: 'Queen of Spades', points: 3 },
    { card: 'Q♥', name: 'Queen of Hearts', points: 3 },
    { card: 'Q♦', name: 'Queen of Diamonds', points: 3 },
    { card: 'J♣', name: 'Jack of Clubs', points: 2 },
    { card: 'J♠', name: 'Jack of Spades', points: 2 },
    { card: 'J♥', name: 'Jack of Hearts', points: 2 },
    { card: 'J♦', name: 'Jack of Diamonds', points: 2 },
    { card: 'A♦', name: 'Ace of Diamonds', points: 11 },
    { card: '10♦', name: 'Ten of Diamonds', points: 10 },
    { card: 'K♦', name: 'King of Diamonds', points: 4 },
    { card: '9♦', name: 'Nine of Diamonds', points: 0 },
    { card: '8♦', name: 'Eight of Diamonds', points: 0 },
    { card: '7♦', name: 'Seven of Diamonds', points: 0 },
  ];

  const failOrder = [
    { card: 'A', points: 11 },
    { card: '10', points: 10 },
    { card: 'K', points: 4 },
    { card: '9', points: 0 },
    { card: '8', points: 0 },
    { card: '7', points: 0 },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-[10px] sm:text-xs bg-purple-600/80 hover:bg-purple-500 px-2 py-1 rounded text-white flex items-center gap-1"
      >
        <span>📚</span>
        <span className="hidden sm:inline">Trump Order</span>
        <span className="sm:hidden">?</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Popup */}
          <div className="absolute top-full right-0 mt-1 z-50 bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-3 w-64 sm:w-72">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-bold text-purple-300">Trump Order (High→Low)</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Trump cards */}
            <div className="space-y-0.5 mb-3">
              {trumpOrder.map((t, i) => (
                <div
                  key={i}
                  className={`flex justify-between items-center text-xs px-2 py-0.5 rounded ${
                    i < 4 ? 'bg-pink-900/30' : i < 8 ? 'bg-blue-900/30' : 'bg-orange-900/30'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-gray-500 w-4">{i + 1}.</span>
                    <span className={`font-mono font-bold ${
                      t.card.includes('♥') || t.card.includes('♦') ? 'text-red-400' : 'text-white'
                    }`}>
                      {t.card}
                    </span>
                  </span>
                  {t.points > 0 && (
                    <span className="text-yellow-400 text-[10px]">{t.points}pts</span>
                  )}
                </div>
              ))}
            </div>

            {/* Fail suit order */}
            <div className="border-t border-gray-700 pt-2">
              <h4 className="text-xs font-bold text-gray-400 mb-1">Fail Suits (♣♠♥)</h4>
              <div className="flex gap-1 flex-wrap">
                {failOrder.map((f, i) => (
                  <span
                    key={i}
                    className="text-[10px] bg-gray-800 px-1.5 py-0.5 rounded"
                  >
                    {f.card}
                    {f.points > 0 && <span className="text-yellow-400 ml-1">{f.points}</span>}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick tips */}
            <div className="border-t border-gray-700 pt-2 mt-2">
              <p className="text-[10px] text-gray-500">
                💡 All Queens & Jacks are trump (not their suit!)
              </p>
              <p className="text-[10px] text-gray-500 mt-1">
                💡 Total points in deck: 120. Need 61 to win.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
