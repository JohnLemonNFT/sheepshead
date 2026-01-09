import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '3-Player Sheepshead Rules - How to Play Three-Handed',
  description: 'Learn how to play 3-player Sheepshead. Complete rules for three-handed Sheepshead including card distribution, scoring, and strategy tips for this challenging variant.',
  keywords: ['3 player Sheepshead', 'three handed Sheepshead', 'Sheepshead 3 players', '3 person Sheepshead rules', 'Sheepshead variants'],
  openGraph: {
    title: '3-Player Sheepshead Rules',
    description: 'Complete guide to playing Sheepshead with 3 players. Different strategy, more trump emphasis, 10 cards per player.',
    type: 'article',
  },
};

export default function ThreePlayerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-950 text-white">
      <header className="bg-black/30 border-b border-green-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl">🐑</span>
            <span className="font-bold text-lg">Sheepshead</span>
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/rules" className="text-green-400 font-medium">Rules</Link>
            <Link href="/strategy" className="text-gray-300 hover:text-white">Strategy</Link>
            <Link href="/learn" className="text-gray-300 hover:text-white">Learn</Link>
            <Link href="/" className="bg-green-600 hover:bg-green-500 px-3 py-1 rounded font-medium">Play</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <nav className="text-sm text-gray-400 mb-4">
          <Link href="/rules" className="hover:text-white">Rules</Link>
          <span className="mx-2">→</span>
          <span className="text-white">3-Player</span>
        </nav>

        <h1 className="text-4xl font-bold mb-4">3-Player Sheepshead Rules</h1>
        <p className="text-xl text-green-300 mb-8">
          The challenging three-handed variant where every trick counts
        </p>

        {/* Quick Overview */}
        <section className="bg-yellow-900/30 border border-yellow-600 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">Quick Overview</h2>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-yellow-300">10</p>
              <p className="text-gray-300">cards per player</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-yellow-300">2</p>
              <p className="text-gray-300">cards in blind</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-yellow-300">10</p>
              <p className="text-gray-300">tricks per hand</p>
            </div>
          </div>
        </section>

        {/* How It Differs */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">How 3-Player Differs from 5-Player</h2>
          <div className="space-y-4">
            <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4">
              <h3 className="font-bold text-blue-300 mb-2">More Cards Per Player</h3>
              <p className="text-gray-300">Each player receives <strong className="text-white">10 cards</strong> instead of 6. This means you hold nearly a third of the entire deck!</p>
            </div>
            <div className="bg-purple-900/30 border border-purple-600 rounded-lg p-4">
              <h3 className="font-bold text-purple-300 mb-2">No Partner</h3>
              <p className="text-gray-300">The picker plays <strong className="text-white">alone against both defenders</strong>. There's no calling an ace - it's always 1 vs 2.</p>
            </div>
            <div className="bg-green-900/30 border border-green-600 rounded-lg p-4">
              <h3 className="font-bold text-green-300 mb-2">10 Tricks</h3>
              <p className="text-gray-300">With more cards, there are <strong className="text-white">10 tricks</strong> instead of 6. Stamina and card management become crucial.</p>
            </div>
            <div className="bg-orange-900/30 border border-orange-600 rounded-lg p-4">
              <h3 className="font-bold text-orange-300 mb-2">Aces Matter More</h3>
              <p className="text-gray-300">With only 3 cards per trick, fail Aces have a much better chance of winning. <strong className="text-white">Quantity of trump becomes as important as quality.</strong></p>
            </div>
          </div>
        </section>

        {/* The Deal */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">The Deal</h2>
          <div className="bg-gray-800/50 rounded-xl p-6">
            <ol className="space-y-3 text-gray-300">
              <li className="flex gap-3">
                <span className="text-green-400 font-bold">1.</span>
                <span>Use the standard 32-card Sheepshead deck (7 through Ace in all suits)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-green-400 font-bold">2.</span>
                <span>Deal <strong className="text-white">10 cards</strong> to each player (typically 3-4-3 or 4-3-3)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-green-400 font-bold">3.</span>
                <span>Place <strong className="text-white">2 cards</strong> face-down as the blind</span>
              </li>
            </ol>
          </div>
        </section>

        {/* Gameplay */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Gameplay</h2>
          <div className="space-y-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="font-bold text-white mb-2">Picking</h3>
              <p className="text-gray-300">Starting left of dealer, each player can pick or pass. The picker takes the 2 blind cards, then buries 2 cards face-down (these count toward their points).</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="font-bold text-white mb-2">No Partner Call</h3>
              <p className="text-gray-300">Unlike 5-player, there's no calling an ace. The picker automatically plays alone against both opponents.</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="font-bold text-white mb-2">Play</h3>
              <p className="text-gray-300">Player left of dealer leads first. Standard following-suit rules apply. Play continues for 10 tricks.</p>
            </div>
          </div>
        </section>

        {/* Scoring */}
        <section className="bg-green-900/30 border border-green-600 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-green-400 mb-3">Scoring</h2>
          <p className="text-gray-200 mb-4">
            The picker needs <strong className="text-white">61 points</strong> to win (same as standard).
            Points in the bury count for the picker.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="font-bold text-green-300">Picker Wins (61+)</p>
              <p className="text-gray-300 text-sm">Picker gains points from each defender</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="font-bold text-red-300">Picker Loses (&lt;61)</p>
              <p className="text-gray-300 text-sm">Picker pays points to each defender</p>
            </div>
          </div>
          <p className="text-gray-400 text-sm mt-4">
            Schneider (opponent &lt;31) and Schwarz (opponent takes no tricks) bonuses still apply.
          </p>
        </section>

        {/* Strategy */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">3-Player Strategy Tips</h2>
          <div className="bg-gray-800/50 rounded-xl p-6">
            <ul className="space-y-4 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-green-400 font-bold text-xl">✓</span>
                <div>
                  <strong className="text-white">Be more conservative when picking</strong>
                  <p className="text-sm text-gray-400">You need to beat TWO opponents alone. Require stronger hands than in 5-player.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 font-bold text-xl">✓</span>
                <div>
                  <strong className="text-white">Value fail Aces highly</strong>
                  <p className="text-sm text-gray-400">With only 3 cards per trick, Aces often take tricks. They're nearly as valuable as low trump.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 font-bold text-xl">✓</span>
                <div>
                  <strong className="text-white">Count trump carefully</strong>
                  <p className="text-sm text-gray-400">With 10 tricks and more cards visible, tracking becomes crucial. Know when opponents are out of trump.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 font-bold text-xl">✓</span>
                <div>
                  <strong className="text-white">Pace yourself</strong>
                  <p className="text-sm text-gray-400">10 tricks is a marathon. Don't blow all your high trump early - you might need them late.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-yellow-400 font-bold text-xl">!</span>
                <div>
                  <strong className="text-white">All 4 Queens isn't automatic</strong>
                  <p className="text-sm text-gray-400">Unlike 5-player, you can actually lose with all 4 Queens if your fail cards are weak. The extra tricks give defenders more chances.</p>
                </div>
              </li>
            </ul>
          </div>
        </section>

        {/* When Everyone Passes */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">When Everyone Passes</h2>
          <div className="bg-gray-800/50 rounded-xl p-6">
            <p className="text-gray-300 mb-4">
              If all 3 players pass, you can play a <strong className="text-white">Leaster</strong> (everyone plays for themselves, lowest points wins) or use <strong className="text-white">Doublers</strong> (deal again, next hand is worth double).
            </p>
            <p className="text-gray-400 text-sm">
              Agree on your house rules before starting!
            </p>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">3-Player vs 5-Player Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="py-3 text-gray-400">Aspect</th>
                  <th className="py-3 text-green-400">3-Player</th>
                  <th className="py-3 text-blue-400">5-Player</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr className="border-b border-gray-800">
                  <td className="py-3">Cards per player</td>
                  <td className="py-3">10</td>
                  <td className="py-3">6</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3">Tricks per hand</td>
                  <td className="py-3">10</td>
                  <td className="py-3">6</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3">Teams</td>
                  <td className="py-3">1 vs 2 (always)</td>
                  <td className="py-3">2 vs 3 (usually)</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3">Partner</td>
                  <td className="py-3">Never</td>
                  <td className="py-3">Called Ace</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3">Trump emphasis</td>
                  <td className="py-3">Less dominant</td>
                  <td className="py-3">Very dominant</td>
                </tr>
                <tr>
                  <td className="py-3">Ace strength</td>
                  <td className="py-3">Very strong</td>
                  <td className="py-3">Moderate</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Related Links */}
        <section className="border-t border-gray-700 pt-8">
          <h2 className="text-lg font-bold text-gray-400 mb-4">Other Variants</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/rules/4-player" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
              <h3 className="font-bold text-white">4-Player Rules →</h3>
              <p className="text-sm text-gray-400">Partnership variant with 8 cards each</p>
            </Link>
            <Link href="/rules/jack-of-diamonds" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
              <h3 className="font-bold text-white">Jack of Diamonds Partner →</h3>
              <p className="text-sm text-gray-400">Alternative partner selection method</p>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-black/30 border-t border-green-800 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🐑</span>
              <span className="font-bold">Sheepshead</span>
            </div>
            <nav className="flex gap-6 text-sm text-gray-400">
              <Link href="/rules" className="hover:text-white">Rules</Link>
              <Link href="/strategy" className="hover:text-white">Strategy</Link>
              <Link href="/learn" className="hover:text-white">Learn</Link>
              <Link href="/glossary" className="hover:text-white">Glossary</Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
