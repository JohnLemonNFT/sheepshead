import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sheepshead Point Values - How Much Is Each Card Worth?',
  description: 'Learn Sheepshead card point values. Aces are worth 11, Tens are 10, Kings 4, Queens 3, Jacks 2. Total of 120 points in the deck.',
  keywords: ['Sheepshead point values', 'Sheepshead card points', 'how many points in Sheepshead', 'Sheepshead scoring cards'],
  openGraph: {
    title: 'Sheepshead Point Values - Card Scoring Guide',
    description: 'Complete guide to Sheepshead point values. Learn how much each card is worth and why 61 points wins.',
    type: 'article',
  },
};

export default function PointValuesPage() {
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
          <span className="text-white">Point Values</span>
        </nav>

        <h1 className="text-4xl font-bold mb-4">Sheepshead Point Values</h1>
        <p className="text-xl text-green-300 mb-8">
          Every card has a point value - and capturing points is how you win
        </p>

        {/* Key Numbers */}
        <section className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-yellow-900/30 border border-yellow-600 rounded-xl p-6 text-center">
            <p className="text-4xl font-bold text-yellow-400">120</p>
            <p className="text-gray-300">Total points in deck</p>
          </div>
          <div className="bg-green-900/30 border border-green-600 rounded-xl p-6 text-center">
            <p className="text-4xl font-bold text-green-400">61</p>
            <p className="text-gray-300">Points to win</p>
          </div>
          <div className="bg-red-900/30 border border-red-600 rounded-xl p-6 text-center">
            <p className="text-4xl font-bold text-red-400">30</p>
            <p className="text-gray-300">Schneider threshold</p>
          </div>
        </section>

        {/* Point Values Table */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-yellow-400 mb-6">Card Point Values</h2>
          <div className="bg-gray-800/50 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="text-left px-6 py-4 font-bold">Card</th>
                  <th className="text-center px-6 py-4 font-bold">Points</th>
                  <th className="text-center px-6 py-4 font-bold">Count in Deck</th>
                  <th className="text-center px-6 py-4 font-bold">Total Points</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-700 bg-yellow-900/20">
                  <td className="px-6 py-4 font-bold text-yellow-300">Aces (A)</td>
                  <td className="px-6 py-4 text-center text-2xl">11</td>
                  <td className="px-6 py-4 text-center text-gray-400">4</td>
                  <td className="px-6 py-4 text-center font-bold">44</td>
                </tr>
                <tr className="border-t border-gray-700 bg-orange-900/20">
                  <td className="px-6 py-4 font-bold text-orange-300">Tens (10)</td>
                  <td className="px-6 py-4 text-center text-2xl">10</td>
                  <td className="px-6 py-4 text-center text-gray-400">4</td>
                  <td className="px-6 py-4 text-center font-bold">40</td>
                </tr>
                <tr className="border-t border-gray-700">
                  <td className="px-6 py-4 font-bold text-gray-300">Kings (K)</td>
                  <td className="px-6 py-4 text-center text-2xl">4</td>
                  <td className="px-6 py-4 text-center text-gray-400">4</td>
                  <td className="px-6 py-4 text-center font-bold">16</td>
                </tr>
                <tr className="border-t border-gray-700">
                  <td className="px-6 py-4 font-bold text-gray-300">Queens (Q)</td>
                  <td className="px-6 py-4 text-center text-2xl">3</td>
                  <td className="px-6 py-4 text-center text-gray-400">4</td>
                  <td className="px-6 py-4 text-center font-bold">12</td>
                </tr>
                <tr className="border-t border-gray-700">
                  <td className="px-6 py-4 font-bold text-gray-300">Jacks (J)</td>
                  <td className="px-6 py-4 text-center text-2xl">2</td>
                  <td className="px-6 py-4 text-center text-gray-400">4</td>
                  <td className="px-6 py-4 text-center font-bold">8</td>
                </tr>
                <tr className="border-t border-gray-700 bg-gray-700/30">
                  <td className="px-6 py-4 font-bold text-gray-500">9, 8, 7</td>
                  <td className="px-6 py-4 text-center text-2xl text-gray-500">0</td>
                  <td className="px-6 py-4 text-center text-gray-500">12</td>
                  <td className="px-6 py-4 text-center font-bold text-gray-500">0</td>
                </tr>
                <tr className="border-t-2 border-yellow-600 bg-yellow-900/30">
                  <td className="px-6 py-4 font-bold text-yellow-400" colSpan={3}>TOTAL</td>
                  <td className="px-6 py-4 text-center font-bold text-2xl text-yellow-400">120</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Why 61 Points? */}
        <section className="bg-green-900/30 border border-green-600 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-green-400 mb-3">Why 61 Points to Win?</h2>
          <p className="text-gray-200 mb-4">
            With 120 total points in the deck, 61 is the <strong>majority</strong>. If you have 61, your opponent
            can have at most 59 - so you've captured more than half the points.
          </p>
          <p className="text-gray-300">
            This is why ties go to the defenders - if both teams have exactly 60, neither has a majority,
            so the picker's team hasn't achieved their goal.
          </p>
        </section>

        {/* Important Insight */}
        <section className="bg-blue-900/30 border border-blue-600 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-blue-400 mb-3">💡 Strategic Insight: "Point Cards"</h2>
          <p className="text-gray-200 mb-4">
            <strong>Aces and Tens</strong> are often called "point cards" because they're worth the most.
            Together, the 8 Aces and Tens contain <strong>84 of the 120 points</strong> (70%!).
          </p>
          <ul className="text-gray-300 space-y-2">
            <li>• Bury point cards when safe (they count toward your score)</li>
            <li>• "Schmear" (throw point cards) to tricks your team is winning</li>
            <li>• Protect your Aces from being trumped</li>
          </ul>
        </section>

        {/* Scoring Thresholds */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-yellow-400 mb-6">Scoring Thresholds</h2>
          <div className="space-y-4">
            <div className="bg-gray-800/50 rounded-lg p-4 flex items-center gap-4">
              <span className="text-3xl">✓</span>
              <div>
                <p className="font-bold text-white">61+ Points = Win</p>
                <p className="text-sm text-gray-400">Standard victory</p>
              </div>
            </div>
            <div className="bg-yellow-900/30 rounded-lg p-4 flex items-center gap-4">
              <span className="text-3xl">⚡</span>
              <div>
                <p className="font-bold text-yellow-300">91+ Points = Schneider</p>
                <p className="text-sm text-gray-400">Opponent got less than 30 - double points!</p>
              </div>
            </div>
            <div className="bg-red-900/30 rounded-lg p-4 flex items-center gap-4">
              <span className="text-3xl">💀</span>
              <div>
                <p className="font-bold text-red-300">120 Points = Schwarz</p>
                <p className="text-sm text-gray-400">Opponent won zero tricks - triple points!</p>
              </div>
            </div>
          </div>
        </section>

        {/* Related Links */}
        <section className="border-t border-gray-700 pt-8">
          <h2 className="text-lg font-bold text-gray-400 mb-4">Continue Learning</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/rules/card-hierarchy" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
              <h3 className="font-bold text-white">← Card Hierarchy</h3>
              <p className="text-sm text-gray-400">Which cards beat which</p>
            </Link>
            <Link href="/rules/scoring" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
              <h3 className="font-bold text-white">Game Scoring →</h3>
              <p className="text-sm text-gray-400">How points translate to game scores</p>
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
