import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '4-Player Sheepshead Rules - How to Play Four-Handed',
  description: 'Learn how to play 4-player Sheepshead. Complete rules for four-handed Sheepshead including fixed partnerships, Black Queen partners, and 8 cards per player.',
  keywords: ['4 player Sheepshead', 'four handed Sheepshead', 'Sheepshead 4 players', '4 person Sheepshead rules', 'Sheepshead partnerships'],
  openGraph: {
    title: '4-Player Sheepshead Rules',
    description: 'Complete guide to playing Sheepshead with 4 players. Fixed partnerships, 8 cards each, unique strategic dynamics.',
    type: 'article',
  },
};

export default function FourPlayerPage() {
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
          <span className="text-white">4-Player</span>
        </nav>

        <h1 className="text-4xl font-bold mb-4">4-Player Sheepshead Rules</h1>
        <p className="text-xl text-green-300 mb-8">
          The partnership variant with fixed teams and 8 cards each
        </p>

        {/* Quick Overview */}
        <section className="bg-yellow-900/30 border border-yellow-600 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">Quick Overview</h2>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-yellow-300">8</p>
              <p className="text-gray-300">cards per player</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-yellow-300">0</p>
              <p className="text-gray-300">cards in blind</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-yellow-300">8</p>
              <p className="text-gray-300">tricks per hand</p>
            </div>
          </div>
        </section>

        {/* Partnership Variants */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">4-Player Partnership Methods</h2>
          <p className="text-gray-300 mb-4">There are several ways to determine teams in 4-player Sheepshead:</p>

          <div className="space-y-4">
            <div className="bg-purple-900/30 border border-purple-600 rounded-lg p-4">
              <h3 className="font-bold text-purple-300 mb-2">Black Queens Partnership (Most Common)</h3>
              <p className="text-gray-300 mb-2">The two players holding the <strong className="text-white">Queen of Clubs</strong> and <strong className="text-white">Queen of Spades</strong> are automatic partners against the other two.</p>
              <p className="text-gray-400 text-sm">Partnership is revealed as the Queens are played. Creates natural suspense!</p>
            </div>

            <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4">
              <h3 className="font-bold text-blue-300 mb-2">Picker + Called Ace</h3>
              <p className="text-gray-300 mb-2">One player picks up a blind (if using one) and calls an ace, similar to 5-player.</p>
              <p className="text-gray-400 text-sm">The picker plays with whoever holds the called ace against the other two.</p>
            </div>

            <div className="bg-green-900/30 border border-green-600 rounded-lg p-4">
              <h3 className="font-bold text-green-300 mb-2">Picker vs All</h3>
              <p className="text-gray-300 mb-2">One player picks and plays <strong className="text-white">alone against 3 defenders</strong>.</p>
              <p className="text-gray-400 text-sm">Harder for picker, but wins/losses are bigger. Good for experienced players.</p>
            </div>

            <div className="bg-orange-900/30 border border-orange-600 rounded-lg p-4">
              <h3 className="font-bold text-orange-300 mb-2">First Two Queens Played</h3>
              <p className="text-gray-300 mb-2">Whoever plays the first two Queens (of any kind) become partners.</p>
              <p className="text-gray-400 text-sm">Creates interesting dynamics around when to play Queens.</p>
            </div>
          </div>
        </section>

        {/* The Deal */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">The Deal (No Blind)</h2>
          <div className="bg-gray-800/50 rounded-xl p-6">
            <ol className="space-y-3 text-gray-300">
              <li className="flex gap-3">
                <span className="text-green-400 font-bold">1.</span>
                <span>Use the standard 32-card Sheepshead deck</span>
              </li>
              <li className="flex gap-3">
                <span className="text-green-400 font-bold">2.</span>
                <span>Deal <strong className="text-white">all 32 cards</strong> - 8 to each player</span>
              </li>
              <li className="flex gap-3">
                <span className="text-green-400 font-bold">3.</span>
                <span>There is <strong className="text-white">no blind</strong> in standard 4-player</span>
              </li>
            </ol>
            <p className="text-gray-400 text-sm mt-4">
              Some variants deal 7 cards to each player with 4 in a blind. The picker takes all 4 and buries 4.
            </p>
          </div>
        </section>

        {/* Black Queens in Detail */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Black Queens Partnership Rules</h2>
          <div className="bg-gray-800/50 rounded-xl p-6">
            <div className="space-y-4">
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h3 className="font-bold text-white mb-2">Basic Rule</h3>
                <p className="text-gray-300">Holders of Q♣ and Q♠ are partners. The other two players are their opponents.</p>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-4">
                <h3 className="font-bold text-white mb-2">Both Black Queens to One Player</h3>
                <p className="text-gray-300">If one player has BOTH black Queens, they can:</p>
                <ul className="mt-2 space-y-1 text-gray-300 text-sm">
                  <li>• <strong>Go Alone:</strong> Play 1 vs 3 for bigger stakes</li>
                  <li>• <strong>Call Up:</strong> Name the Q♥ holder as partner</li>
                  <li>• <strong>Call a Jack:</strong> Call a specific Jack as partner</li>
                </ul>
              </div>

              <div className="bg-yellow-900/30 rounded-lg p-4 border border-yellow-600">
                <h3 className="font-bold text-yellow-300 mb-2">Secret Partnership</h3>
                <p className="text-gray-300">Nobody reveals their Queen until they play it. You might not know who your partner is until mid-game!</p>
              </div>
            </div>
          </div>
        </section>

        {/* Gameplay */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Gameplay</h2>
          <div className="space-y-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="font-bold text-white mb-2">Leading</h3>
              <p className="text-gray-300">Player left of dealer leads the first trick. In some variants, the Q♣ holder must lead trump on trick one.</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="font-bold text-white mb-2">Following Suit</h3>
              <p className="text-gray-300">Standard Sheepshead rules - must follow suit if able. All Queens, Jacks, and Diamonds are trump.</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="font-bold text-white mb-2">8 Tricks</h3>
              <p className="text-gray-300">Play continues for 8 tricks. Trick winner leads next.</p>
            </div>
          </div>
        </section>

        {/* Scoring */}
        <section className="bg-green-900/30 border border-green-600 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-green-400 mb-3">Scoring</h2>
          <p className="text-gray-200 mb-4">
            The Black Queens team needs <strong className="text-white">61 points</strong> to win.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="font-bold text-green-300">Black Queens Win (61+)</p>
              <p className="text-gray-300 text-sm">Each Queen holder gains, each opponent loses</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="font-bold text-red-300">Black Queens Lose (&lt;61)</p>
              <p className="text-gray-300 text-sm">Each Queen holder loses, each opponent gains</p>
            </div>
          </div>
          <p className="text-gray-400 text-sm mt-4">
            In a 60-60 tie, the Black Queens team loses (picker disadvantage rule).
          </p>
        </section>

        {/* Strategy */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">4-Player Strategy Tips</h2>
          <div className="bg-gray-800/50 rounded-xl p-6">
            <ul className="space-y-4 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-green-400 font-bold text-xl">✓</span>
                <div>
                  <strong className="text-white">Watch for the Black Queens</strong>
                  <p className="text-sm text-gray-400">Track when they're played to identify teams. Early Queen play often signals a strong hand.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 font-bold text-xl">✓</span>
                <div>
                  <strong className="text-white">Signal to your unknown partner</strong>
                  <p className="text-sm text-gray-400">If you have a Black Queen, play strategically to help your partner (even before they're revealed).</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 font-bold text-xl">✓</span>
                <div>
                  <strong className="text-white">8 tricks means more trump battles</strong>
                  <p className="text-sm text-gray-400">With 8 tricks, there's more opportunity for trump to be drawn out. Plan your trump usage carefully.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 font-bold text-xl">✓</span>
                <div>
                  <strong className="text-white">Schmear wisely</strong>
                  <p className="text-sm text-gray-400">Once you know your partner, throw points (Aces, Tens) into tricks they're winning.</p>
                </div>
              </li>
            </ul>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">4-Player vs 5-Player Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="py-3 text-gray-400">Aspect</th>
                  <th className="py-3 text-green-400">4-Player</th>
                  <th className="py-3 text-blue-400">5-Player</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr className="border-b border-gray-800">
                  <td className="py-3">Cards per player</td>
                  <td className="py-3">8</td>
                  <td className="py-3">6</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3">Tricks per hand</td>
                  <td className="py-3">8</td>
                  <td className="py-3">6</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3">Teams</td>
                  <td className="py-3">2 vs 2</td>
                  <td className="py-3">2 vs 3</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3">Partner method</td>
                  <td className="py-3">Black Queens</td>
                  <td className="py-3">Called Ace</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3">Blind</td>
                  <td className="py-3">Usually none</td>
                  <td className="py-3">2 cards</td>
                </tr>
                <tr>
                  <td className="py-3">Balance</td>
                  <td className="py-3">Even teams</td>
                  <td className="py-3">Picker team outnumbered</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Related Links */}
        <section className="border-t border-gray-700 pt-8">
          <h2 className="text-lg font-bold text-gray-400 mb-4">Other Variants</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/rules/3-player" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
              <h3 className="font-bold text-white">3-Player Rules →</h3>
              <p className="text-sm text-gray-400">Solo picker variant with 10 cards each</p>
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
