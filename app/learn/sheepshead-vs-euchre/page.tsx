import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sheepshead vs Euchre - Comparing Midwest Card Games',
  description: 'Compare Sheepshead and Euchre - two beloved Midwest trick-taking card games. Learn the key differences in rules, strategy, complexity, and which game might be right for you.',
  keywords: ['Sheepshead vs Euchre', 'Euchre vs Sheepshead', 'Midwest card games', 'trick taking games comparison', 'which is better Sheepshead or Euchre'],
  openGraph: {
    title: 'Sheepshead vs Euchre - Which Midwest Card Game Is For You?',
    description: 'A detailed comparison of two Midwest favorites. Sheepshead offers more strategy, Euchre is faster to learn.',
    type: 'article',
  },
};

export default function SheepsheadVsEuchrePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-950 text-white">
      <header className="bg-black/30 border-b border-green-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl">🐑</span>
            <span className="font-bold text-lg">Sheepshead</span>
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/rules" className="text-gray-300 hover:text-white">Rules</Link>
            <Link href="/strategy" className="text-gray-300 hover:text-white">Strategy</Link>
            <Link href="/learn" className="text-green-400 font-medium">Learn</Link>
            <Link href="/" className="bg-green-600 hover:bg-green-500 px-3 py-1 rounded font-medium">Play</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <nav className="text-sm text-gray-400 mb-4">
          <Link href="/learn" className="hover:text-white">Learn</Link>
          <span className="mx-2">→</span>
          <span className="text-white">Sheepshead vs Euchre</span>
        </nav>

        <h1 className="text-4xl font-bold mb-4">Sheepshead vs Euchre</h1>
        <p className="text-xl text-green-300 mb-8">
          Two Midwest favorites - which trick-taking game is right for you?
        </p>

        {/* Quick Verdict */}
        <section className="bg-yellow-900/30 border border-yellow-600 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">The Quick Verdict</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="font-bold text-green-300 mb-2">Choose Sheepshead If...</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• You want deeper strategy</li>
                <li>• You enjoy hidden information</li>
                <li>• You have 5 players</li>
                <li>• You like longer, meatier hands</li>
              </ul>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="font-bold text-blue-300 mb-2">Choose Euchre If...</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• You want quick, casual games</li>
                <li>• You prefer simpler rules</li>
                <li>• You have 4 players</li>
                <li>• You want easy-to-teach games</li>
              </ul>
            </div>
          </div>
        </section>

        {/* The Famous Quote */}
        <section className="mb-8">
          <div className="bg-gray-800/50 rounded-xl p-6">
            <blockquote className="text-xl text-gray-200 italic text-center">
              "If you think Sheepshead is similar to Euchre, think of it like <strong className="text-yellow-400">chess is similar to checkers</strong>."
            </blockquote>
            <p className="text-gray-400 text-center mt-3 text-sm">- Wisconsin card player wisdom</p>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Side-by-Side Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="py-3 text-gray-400">Feature</th>
                  <th className="py-3 text-green-400">Sheepshead</th>
                  <th className="py-3 text-blue-400">Euchre</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr className="border-b border-gray-800">
                  <td className="py-3 font-medium">Best player count</td>
                  <td className="py-3">5 players</td>
                  <td className="py-3">4 players</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3 font-medium">Deck size</td>
                  <td className="py-3">32 cards (7-A)</td>
                  <td className="py-3">24 cards (9-A)</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3 font-medium">Cards per player</td>
                  <td className="py-3">6 cards</td>
                  <td className="py-3">5 cards</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3 font-medium">Trump cards</td>
                  <td className="py-3">14 (Q, J, all diamonds)</td>
                  <td className="py-3">7 (chosen suit + Jacks)</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3 font-medium">Trump selection</td>
                  <td className="py-3">Fixed (always same)</td>
                  <td className="py-3">Changes each hand</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3 font-medium">Teams</td>
                  <td className="py-3">2 vs 3 (secret partner)</td>
                  <td className="py-3">2 vs 2 (fixed)</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3 font-medium">Bidding</td>
                  <td className="py-3">Pick or pass (blind)</td>
                  <td className="py-3">Order up or pass</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3 font-medium">Point goal</td>
                  <td className="py-3">61 of 120 points</td>
                  <td className="py-3">3 of 5 tricks</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3 font-medium">Game length</td>
                  <td className="py-3">10-15 min/hand</td>
                  <td className="py-3">2-5 min/hand</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3 font-medium">Learning time</td>
                  <td className="py-3">30-60 minutes</td>
                  <td className="py-3">10-15 minutes</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3 font-medium">Strategic depth</td>
                  <td className="py-3 text-green-400">High</td>
                  <td className="py-3 text-blue-400">Medium</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium">Popular in</td>
                  <td className="py-3">Wisconsin</td>
                  <td className="py-3">Midwest, Canada</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Key Differences Explained */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Key Differences Explained</h2>
          <div className="space-y-4">
            <div className="bg-purple-900/30 border border-purple-600 rounded-lg p-4">
              <h3 className="font-bold text-purple-300 mb-2">The Secret Partner</h3>
              <p className="text-gray-300">
                Sheepshead's most distinctive feature is the <strong className="text-white">secret partner</strong>. When you pick, you call an ace - and nobody knows who your partner is until that ace is played. This creates incredible tension and deduction.
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Euchre has fixed partnerships - you always know who's on your team.
              </p>
            </div>

            <div className="bg-green-900/30 border border-green-600 rounded-lg p-4">
              <h3 className="font-bold text-green-300 mb-2">Fixed vs Variable Trump</h3>
              <p className="text-gray-300">
                In Sheepshead, trump is <strong className="text-white">always the same</strong>: Queens, Jacks, and Diamonds. You can memorize it once and always know. In Euchre, trump changes every hand based on what's turned up or called.
              </p>
              <p className="text-gray-400 text-sm mt-2">
                This makes Sheepshead easier to master once you learn the hierarchy, but the fixed trump means 14 of 32 cards are always trump!
              </p>
            </div>

            <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4">
              <h3 className="font-bold text-blue-300 mb-2">Points vs Tricks</h3>
              <p className="text-gray-300">
                Euchre counts <strong className="text-white">tricks won</strong> - get 3 of 5 and you win. Sheepshead counts <strong className="text-white">card points</strong> - Aces are worth 11, Tens worth 10, etc. This adds a layer of strategy about which tricks are worth winning.
              </p>
              <p className="text-gray-400 text-sm mt-2">
                A trick with four 7s is worthless in Sheepshead but counts the same as any trick in Euchre.
              </p>
            </div>

            <div className="bg-orange-900/30 border border-orange-600 rounded-lg p-4">
              <h3 className="font-bold text-orange-300 mb-2">Asymmetric Teams</h3>
              <p className="text-gray-300">
                Euchre is always 2 vs 2. Sheepshead is <strong className="text-white">2 vs 3</strong> - the picker's team is outnumbered, which is why they get the blind cards as compensation.
              </p>
              <p className="text-gray-400 text-sm mt-2">
                This creates natural underdog drama every hand.
              </p>
            </div>
          </div>
        </section>

        {/* Complexity Breakdown */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Complexity Breakdown</h2>
          <div className="bg-gray-800/50 rounded-xl p-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-300">Rules Complexity</span>
                  <span className="text-gray-400 text-sm">Euchre simpler</span>
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-green-500" style={{ width: '75%' }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Euchre</span>
                  <span>Sheepshead</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-300">Strategic Depth</span>
                  <span className="text-gray-400 text-sm">Sheepshead deeper</span>
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-green-500" style={{ width: '85%' }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Euchre</span>
                  <span>Sheepshead</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-300">Hidden Information</span>
                  <span className="text-gray-400 text-sm">Sheepshead more</span>
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-green-500" style={{ width: '90%' }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Euchre</span>
                  <span>Sheepshead</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-300">Game Speed</span>
                  <span className="text-gray-400 text-sm">Euchre faster</span>
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-blue-500" style={{ width: '30%' }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Sheepshead</span>
                  <span>Euchre</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Which Should You Learn First */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Which Should You Learn First?</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4">
              <h3 className="font-bold text-blue-300 mb-2">Start with Euchre If...</h3>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• You're new to trick-taking games</li>
                <li>• You want quick games at parties</li>
                <li>• You have exactly 4 players regularly</li>
                <li>• You prefer straightforward rules</li>
                <li>• You want to play immediately</li>
              </ul>
            </div>
            <div className="bg-green-900/30 border border-green-600 rounded-lg p-4">
              <h3 className="font-bold text-green-300 mb-2">Start with Sheepshead If...</h3>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• You already play trick-taking games</li>
                <li>• You want a game with longevity</li>
                <li>• You have 5 players often</li>
                <li>• You enjoy deduction and bluffing</li>
                <li>• You want to impress Wisconsinites</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Can You Play Both? */}
        <section className="bg-green-900/30 border border-green-600 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-green-400 mb-3">Can You Play Both?</h2>
          <p className="text-gray-200 mb-4">
            Absolutely! Many Midwest card players know both games. They serve different purposes:
          </p>
          <ul className="text-gray-300 space-y-2">
            <li>• <strong className="text-white">Euchre</strong> for casual gatherings, bars, quick games</li>
            <li>• <strong className="text-white">Sheepshead</strong> for dedicated game nights, family traditions, serious play</li>
          </ul>
          <p className="text-gray-400 text-sm mt-4">
            Skills transfer between them - both reward card counting, partnership play, and knowing when to be aggressive.
          </p>
        </section>

        {/* Historical Connection */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Historical Connection</h2>
          <div className="bg-gray-800/50 rounded-xl p-6">
            <p className="text-gray-300 mb-4">
              Both games have German roots and came to America with 19th-century immigrants. Euchre evolved from Juckerspiel and spread more widely, while Sheepshead (from Schafkopf) stayed concentrated in Wisconsin's German communities.
            </p>
            <p className="text-gray-300">
              Today, Euchre is played across the Midwest, Ontario, and beyond. Sheepshead remains Wisconsin's special treasure - which is exactly what makes it worth learning!
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-green-800 to-green-900 rounded-xl p-6 text-center">
            <h3 className="text-xl font-bold mb-2">Ready to Learn Sheepshead?</h3>
            <p className="text-green-200 mb-4 text-sm">
              Jump in and discover why Wisconsinites are so passionate about it.
            </p>
            <Link
              href="/learn"
              className="inline-block bg-white text-green-900 font-bold py-2 px-6 rounded-lg hover:bg-green-100 transition-colors"
            >
              Start Learning
            </Link>
          </div>
          <div className="bg-gradient-to-r from-green-700 to-green-800 rounded-xl p-6 text-center">
            <h3 className="text-xl font-bold mb-2">Already Know Euchre?</h3>
            <p className="text-green-200 mb-4 text-sm">
              Your trick-taking skills will transfer. Here are the key differences.
            </p>
            <Link
              href="/rules"
              className="inline-block bg-white text-green-900 font-bold py-2 px-6 rounded-lg hover:bg-green-100 transition-colors"
            >
              View Rules
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
