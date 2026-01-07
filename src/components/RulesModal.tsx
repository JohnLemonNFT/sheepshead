// Rules Modal - Complete rules reference

import { useState } from 'react';
import { useGameStore } from '../store/gameStore';

type RulesTab = 'hierarchy' | 'points' | 'gameplay' | 'following' | 'scoring';

const TABS: { id: RulesTab; label: string }[] = [
  { id: 'hierarchy', label: 'Card Hierarchy' },
  { id: 'points', label: 'Point Values' },
  { id: 'gameplay', label: 'Game Flow' },
  { id: 'following', label: 'Following Suit' },
  { id: 'scoring', label: 'Scoring' },
];

// Card display helper - smaller on mobile
function CardDisplay({ rank, suit, highlight }: { rank: string; suit: string; highlight?: boolean }) {
  const isRed = suit === '&#x2665;' || suit === '&#x2666;';
  return (
    <span
      className={`
        inline-flex items-center justify-center
        w-8 h-11 sm:w-10 sm:h-14 bg-white rounded shadow text-sm sm:text-lg font-bold
        ${isRed ? 'text-red-600' : 'text-gray-800'}
        ${highlight ? 'ring-2 ring-yellow-400' : ''}
      `}
      dangerouslySetInnerHTML={{ __html: `${rank}${suit}` }}
    />
  );
}

function CardHierarchyTab() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h3 className="text-lg sm:text-xl font-bold text-yellow-400 mb-2 sm:mb-3">Trump Cards (14 total)</h3>
        <p className="text-gray-300 text-sm sm:text-base mb-3 sm:mb-4">
          Trump cards always beat fail cards. Queens are highest, then Jacks, then Diamonds.
        </p>

        <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-3 sm:p-4 space-y-3">
          {/* Queens */}
          <div>
            <div className="text-xs text-yellow-300 mb-2">Queens (highest):</div>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              <CardDisplay rank="Q" suit="&#x2663;" highlight />
              <CardDisplay rank="Q" suit="&#x2660;" highlight />
              <CardDisplay rank="Q" suit="&#x2665;" highlight />
              <CardDisplay rank="Q" suit="&#x2666;" highlight />
            </div>
          </div>
          {/* Jacks */}
          <div>
            <div className="text-xs text-yellow-300 mb-2">Jacks:</div>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              <CardDisplay rank="J" suit="&#x2663;" highlight />
              <CardDisplay rank="J" suit="&#x2660;" highlight />
              <CardDisplay rank="J" suit="&#x2665;" highlight />
              <CardDisplay rank="J" suit="&#x2666;" highlight />
            </div>
          </div>
          {/* Diamonds */}
          <div>
            <div className="text-xs text-yellow-300 mb-2">Diamonds (lowest trump):</div>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              <CardDisplay rank="A" suit="&#x2666;" highlight />
              <CardDisplay rank="10" suit="&#x2666;" highlight />
              <CardDisplay rank="K" suit="&#x2666;" highlight />
              <CardDisplay rank="9" suit="&#x2666;" highlight />
              <CardDisplay rank="8" suit="&#x2666;" highlight />
              <CardDisplay rank="7" suit="&#x2666;" highlight />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-300 mb-2 sm:mb-3">Fail Cards (6 per suit)</h3>
        <p className="text-gray-400 text-sm sm:text-base mb-3 sm:mb-4">
          Clubs, Spades, and Hearts (without Queens/Jacks) are "fail" suits.
        </p>
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 sm:p-4">
          <div className="text-xs text-gray-400 mb-2">Each fail suit (A highest, 7 lowest):</div>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            <CardDisplay rank="A" suit="&#x2663;" />
            <CardDisplay rank="10" suit="&#x2663;" />
            <CardDisplay rank="K" suit="&#x2663;" />
            <CardDisplay rank="9" suit="&#x2663;" />
            <CardDisplay rank="8" suit="&#x2663;" />
            <CardDisplay rank="7" suit="&#x2663;" />
          </div>
        </div>
      </div>

      <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-3 sm:p-4">
        <h4 className="font-bold text-blue-300 mb-2 text-sm sm:text-base">Remember:</h4>
        <ul className="text-xs sm:text-sm text-gray-300 space-y-1">
          <li>&#x2022; ALL Queens and Jacks are trump, regardless of suit</li>
          <li>&#x2022; Suit order: Clubs &gt; Spades &gt; Hearts &gt; Diamonds</li>
          <li>&#x2022; Any trump beats any fail card</li>
        </ul>
      </div>
    </div>
  );
}

function PointValuesTab() {
  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-xl font-bold text-green-300 mb-4">Card Point Values</h3>
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-700">
              <th className="pb-2">Card</th>
              <th className="pb-2 text-right">Points</th>
            </tr>
          </thead>
          <tbody className="text-lg">
            <tr className="border-b border-gray-700">
              <td className="py-3">Aces</td>
              <td className="py-3 text-right font-bold text-yellow-400">11</td>
            </tr>
            <tr className="border-b border-gray-700">
              <td className="py-3">Tens</td>
              <td className="py-3 text-right font-bold text-yellow-400">10</td>
            </tr>
            <tr className="border-b border-gray-700">
              <td className="py-3">Kings</td>
              <td className="py-3 text-right font-bold text-blue-400">4</td>
            </tr>
            <tr className="border-b border-gray-700">
              <td className="py-3">Queens</td>
              <td className="py-3 text-right font-bold text-blue-400">3</td>
            </tr>
            <tr className="border-b border-gray-700">
              <td className="py-3">Jacks</td>
              <td className="py-3 text-right font-bold text-blue-400">2</td>
            </tr>
            <tr>
              <td className="py-3">9, 8, 7</td>
              <td className="py-3 text-right font-bold text-gray-500">0</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-900/30 border border-green-600 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-green-400">120</div>
          <div className="text-sm text-green-300">Total Points in Deck</div>
        </div>
        <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-yellow-400">61</div>
          <div className="text-sm text-yellow-300">Points to Win</div>
        </div>
      </div>

      <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4">
        <h4 className="font-bold text-blue-300 mb-2">Quick Math:</h4>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>&#x2022; 4 Aces x 11 = 44 points</li>
          <li>&#x2022; 4 Tens x 10 = 40 points</li>
          <li>&#x2022; 4 Kings x 4 = 16 points</li>
          <li>&#x2022; 4 Queens x 3 = 12 points</li>
          <li>&#x2022; 4 Jacks x 2 = 8 points</li>
          <li>&#x2022; <strong>Total: 120 points</strong></li>
        </ul>
      </div>
    </div>
  );
}

function GameplayTab() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded-full bg-yellow-500 text-black font-bold flex items-center justify-center flex-shrink-0">
            1
          </div>
          <div>
            <h3 className="font-bold text-yellow-400">Deal</h3>
            <p className="text-gray-300 text-sm">
              Each of the 5 players receives 6 cards. 2 cards go face-down to the "blind."
            </p>
          </div>
        </div>

        <div className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded-full bg-yellow-500 text-black font-bold flex items-center justify-center flex-shrink-0">
            2
          </div>
          <div>
            <h3 className="font-bold text-yellow-400">Pick or Pass</h3>
            <p className="text-gray-300 text-sm">
              Starting left of dealer, each player can "pick" (take the blind) or "pass."
              The player who picks becomes the <strong className="text-yellow-300">Picker</strong>.
            </p>
          </div>
        </div>

        <div className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded-full bg-yellow-500 text-black font-bold flex items-center justify-center flex-shrink-0">
            3
          </div>
          <div>
            <h3 className="font-bold text-yellow-400">Bury</h3>
            <p className="text-gray-300 text-sm">
              The Picker takes the 2 blind cards into their hand (now 8 cards),
              then "buries" 2 cards face-down. These count toward their points at the end.
            </p>
          </div>
        </div>

        <div className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center flex-shrink-0">
            4
          </div>
          <div>
            <h3 className="font-bold text-blue-400">Call Partner</h3>
            <p className="text-gray-300 text-sm">
              The Picker calls a fail suit Ace (clubs, spades, or hearts).
              Whoever holds that Ace becomes their secret <strong className="text-blue-300">Partner</strong>.
              The partner's identity is revealed when the called Ace is played.
            </p>
          </div>
        </div>

        <div className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded-full bg-green-500 text-white font-bold flex items-center justify-center flex-shrink-0">
            5
          </div>
          <div>
            <h3 className="font-bold text-green-400">Play 6 Tricks</h3>
            <p className="text-gray-300 text-sm">
              Players take turns playing cards. Highest trump wins, or if no trump,
              highest card of the led suit. Winner leads the next trick.
            </p>
          </div>
        </div>

        <div className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded-full bg-purple-500 text-white font-bold flex items-center justify-center flex-shrink-0">
            6
          </div>
          <div>
            <h3 className="font-bold text-purple-400">Score</h3>
            <p className="text-gray-300 text-sm">
              Picker + Partner team needs 61+ points to win.
              The 3 Defenders need 60+ points to defeat them.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-red-900/30 border border-red-600 rounded-lg p-4">
        <h4 className="font-bold text-red-300 mb-2">If Nobody Picks (Leaster)</h4>
        <p className="text-sm text-gray-300">
          Everyone plays for themselves. The player who takes the <em>fewest</em> points wins!
        </p>
      </div>
    </div>
  );
}

function FollowingSuitTab() {
  return (
    <div className="space-y-6">
      <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4">
        <h3 className="font-bold text-yellow-300 mb-3">The Golden Rule</h3>
        <p className="text-lg text-white">
          You <strong>must</strong> follow the suit that was led if you can.
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="font-bold text-green-300 mb-2">If Trump is Led...</h4>
          <p className="text-gray-300 text-sm">
            You must play a trump card if you have one. Remember: Queens and Jacks
            are trump even though they show club/spade/heart symbols!
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="font-bold text-blue-300 mb-2">If a Fail Suit is Led...</h4>
          <p className="text-gray-300 text-sm">
            You must play that same fail suit if you have one. Queens and Jacks
            of that suit do <strong>NOT</strong> count - they're trump.
          </p>
          <div className="mt-3 p-3 bg-gray-700 rounded text-sm">
            <strong>Example:</strong> If clubs is led and you have Q&#x2663; and 7&#x2663;,
            you must play the 7&#x2663; (the Queen is trump, not clubs).
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="font-bold text-purple-300 mb-2">If You Can't Follow...</h4>
          <p className="text-gray-300 text-sm">
            Play any card you want! You can trump to try to win, or "throw off"
            a card from another suit.
          </p>
        </div>
      </div>

      <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4">
        <h4 className="font-bold text-blue-300 mb-2">Who Wins the Trick?</h4>
        <ul className="text-sm text-gray-300 space-y-2">
          <li>&#x2022; If any trump was played: <strong>Highest trump wins</strong></li>
          <li>&#x2022; If no trump was played: <strong>Highest card of the led suit wins</strong></li>
          <li>&#x2022; Cards from other suits (not trump, not led) cannot win</li>
        </ul>
      </div>
    </div>
  );
}

function ScoringTab() {
  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-xl font-bold text-green-300 mb-4">Standard Scoring</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-700">
              <th className="pb-2">Result</th>
              <th className="pb-2 text-center">Picker</th>
              <th className="pb-2 text-center">Partner</th>
              <th className="pb-2 text-center">Defenders</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-700">
              <td className="py-2 text-green-400">Win (61+)</td>
              <td className="py-2 text-center text-green-400">+2</td>
              <td className="py-2 text-center text-green-400">+1</td>
              <td className="py-2 text-center text-red-400">-1 each</td>
            </tr>
            <tr className="border-b border-gray-700">
              <td className="py-2 text-red-400">Lose (&lt;61)</td>
              <td className="py-2 text-center text-red-400">-2</td>
              <td className="py-2 text-center text-red-400">-1</td>
              <td className="py-2 text-center text-green-400">+1 each</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4">
          <h4 className="font-bold text-yellow-300 mb-2">Schneider (2x)</h4>
          <p className="text-sm text-gray-300">
            If the losing team gets <strong>less than 31 points</strong>,
            scores are doubled!
          </p>
        </div>
        <div className="bg-red-900/30 border border-red-600 rounded-lg p-4">
          <h4 className="font-bold text-red-300 mb-2">Schwarz (3x)</h4>
          <p className="text-sm text-gray-300">
            If the losing team <strong>wins zero tricks</strong>,
            scores are tripled!
          </p>
        </div>
      </div>

      <div className="bg-purple-900/30 border border-purple-600 rounded-lg p-4">
        <h4 className="font-bold text-purple-300 mb-2">Going Alone</h4>
        <p className="text-sm text-gray-300">
          If the Picker doesn't call a partner (goes alone), they get all the
          points - win or lose. Higher risk, higher reward!
        </p>
      </div>

      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="font-bold text-gray-300 mb-2">Leaster Scoring</h4>
        <p className="text-sm text-gray-300 mb-2">
          When nobody picks, each player plays for themselves:
        </p>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>&#x2022; Player with fewest points wins</li>
          <li>&#x2022; Winner gets +1 from each other player</li>
          <li>&#x2022; If tied, player who won the last trick wins</li>
        </ul>
      </div>
    </div>
  );
}

export function RulesModal() {
  const { closeRules } = useGameStore();
  const [activeTab, setActiveTab] = useState<RulesTab>('hierarchy');

  const renderContent = () => {
    switch (activeTab) {
      case 'hierarchy': return <CardHierarchyTab />;
      case 'points': return <PointValuesTab />;
      case 'gameplay': return <GameplayTab />;
      case 'following': return <FollowingSuitTab />;
      case 'scoring': return <ScoringTab />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-gray-900 rounded-xl w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col my-2 sm:my-0">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-700">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Rules</h2>
          <button
            onClick={closeRules}
            className="text-gray-400 hover:text-white text-xl font-bold w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-800 active:bg-gray-700"
          >
            &times;
          </button>
        </div>

        {/* Tabs - horizontal scroll on mobile */}
        <div className="flex border-b border-gray-700 overflow-x-auto scrollbar-hide px-2 sm:px-3">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0
                ${activeTab === tab.id
                  ? 'text-green-400 border-b-2 border-green-400 bg-green-900/20'
                  : 'text-gray-400 hover:text-white active:bg-gray-800'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-gray-700">
          <button
            onClick={closeRules}
            className="w-full sm:w-auto sm:float-right bg-green-600 hover:bg-green-500 active:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
}
