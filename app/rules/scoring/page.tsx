import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sheepshead Scoring - How Points Become Game Score',
  description: 'Learn how Sheepshead scoring works. Card points translate to game scores. Schneider doubles, Schwarz triples. Complete scoring guide.',
  keywords: ['Sheepshead scoring', 'Sheepshead game score', 'Schneider Schwarz', 'how to score Sheepshead'],
  openGraph: {
    title: 'Sheepshead Scoring System',
    description: 'How card points become game scores. Learn about Schneider, Schwarz, and multipliers.',
    type: 'article',
  },
};

export default function ScoringPage() {
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
          <span className="text-white">Scoring</span>
        </nav>

        <h1 className="text-4xl font-bold mb-4">Sheepshead Scoring</h1>
        <p className="text-xl text-green-300 mb-8">
          How card points translate into game scores
        </p>

        {/* Basic Scoring */}
        <section className="bg-yellow-900/30 border border-yellow-600 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">Basic Scoring</h2>
          <p className="text-lg text-gray-200 mb-4">
            The picker's team needs <strong className="text-yellow-300">61+ points</strong> (out of 120) to win.
            Defenders need <strong className="text-gray-300">60+ points</strong> to win (ties go to defenders).
          </p>
        </section>

        {/* Win Conditions */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Win Conditions</h2>
          <div className="space-y-4">
            <div className="bg-green-900/30 border border-green-600 rounded-lg p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-green-300">Normal Win</h3>
                <p className="text-gray-400 text-sm">Picker's team: 61-90 points</p>
              </div>
              <span className="text-2xl font-bold text-green-400">1x</span>
            </div>
            <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-yellow-300">Schneider</h3>
                <p className="text-gray-400 text-sm">Loser has 30 or fewer points</p>
              </div>
              <span className="text-2xl font-bold text-yellow-400">2x</span>
            </div>
            <div className="bg-red-900/30 border border-red-600 rounded-lg p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-red-300">Schwarz</h3>
                <p className="text-gray-400 text-sm">Loser wins zero tricks</p>
              </div>
              <span className="text-2xl font-bold text-red-400">3x</span>
            </div>
          </div>
        </section>

        {/* Score Distribution */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">How Scores Are Distributed</h2>
          <div className="bg-gray-800/50 rounded-xl p-6">
            <p className="text-gray-300 mb-4">In a typical 5-player game with called partner:</p>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-2 pr-4">Outcome</th>
                    <th className="text-center py-2 px-2">Picker</th>
                    <th className="text-center py-2 px-2">Partner</th>
                    <th className="text-center py-2 px-2">Each Defender</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-700">
                    <td className="py-2 pr-4 text-green-400">Picker wins</td>
                    <td className="text-center py-2 px-2 text-green-400">+2</td>
                    <td className="text-center py-2 px-2 text-green-400">+1</td>
                    <td className="text-center py-2 px-2 text-red-400">-1</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-2 pr-4 text-red-400">Picker loses</td>
                    <td className="text-center py-2 px-2 text-red-400">-2</td>
                    <td className="text-center py-2 px-2 text-red-400">-1</td>
                    <td className="text-center py-2 px-2 text-green-400">+1</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-gray-400 text-sm mt-4">
              Note: Picker always wins/loses double what the partner does. Scores are multiplied by Schneider (2x) or Schwarz (3x).
            </p>
          </div>
        </section>

        {/* Multipliers */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Score Multipliers</h2>
          <div className="bg-gray-800/50 rounded-xl p-6">
            <p className="text-gray-300 mb-4">Multiple conditions can stack:</p>
            <ul className="space-y-2 text-gray-300">
              <li>• <strong className="text-yellow-300">Schneider:</strong> 2x (loser had ≤30 points)</li>
              <li>• <strong className="text-red-300">Schwarz:</strong> 3x (loser won no tricks)</li>
              <li>• <strong className="text-purple-300">Cracking:</strong> 2x (if enabled)</li>
              <li>• <strong className="text-blue-300">Re-crack:</strong> 2x more (4x total with crack)</li>
              <li>• <strong className="text-green-300">Blitz:</strong> 2x (both black Queens)</li>
            </ul>
            <p className="text-yellow-300 mt-4 text-sm">
              Example: Schneider + Crack = 4x base score!
            </p>
          </div>
        </section>

        {/* Going Alone */}
        <section className="bg-purple-900/30 border border-purple-600 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-purple-400 mb-3">Going Alone Scoring</h2>
          <p className="text-gray-200 mb-4">
            If the picker goes alone (no partner), they get ALL the points - win or lose:
          </p>
          <ul className="text-gray-300 space-y-1">
            <li>• Win alone: <span className="text-green-400">+4</span> (instead of +2 picker, +1 partner)</li>
            <li>• Lose alone: <span className="text-red-400">-4</span> (instead of -2 picker, -1 partner)</li>
          </ul>
        </section>

        {/* Leaster Scoring */}
        <section className="bg-blue-900/30 border border-blue-600 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-blue-400 mb-3">Leaster Scoring</h2>
          <p className="text-gray-200 mb-4">
            In a Leaster (everyone passes), the player with the <strong>fewest points wins</strong>:
          </p>
          <ul className="text-gray-300 space-y-1">
            <li>• Winner: <span className="text-green-400">+2</span> from each other player</li>
            <li>• Others: <span className="text-red-400">-2</span> each</li>
          </ul>
          <p className="text-gray-400 text-sm mt-2">
            (Total: Winner gets +8, each loser gets -2)
          </p>
        </section>

        {/* Related Links */}
        <section className="border-t border-gray-700 pt-8">
          <h2 className="text-lg font-bold text-gray-400 mb-4">Related Topics</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/rules/point-values" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
              <h3 className="font-bold text-white">← Point Values</h3>
              <p className="text-sm text-gray-400">How much each card is worth</p>
            </Link>
            <Link href="/rules/cracking" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
              <h3 className="font-bold text-white">Cracking →</h3>
              <p className="text-sm text-gray-400">Doubling the stakes</p>
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
