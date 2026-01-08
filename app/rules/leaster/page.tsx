import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'What is a Leaster in Sheepshead? - Rules Explained',
  description: 'Learn what a Leaster is in Sheepshead. When all players pass, everyone plays for themselves and the player who takes the FEWEST points wins.',
  keywords: ['Sheepshead leaster', 'what is a leaster', 'Sheepshead everyone passes', 'Sheepshead leaster rules'],
  openGraph: {
    title: 'Sheepshead Leaster - When Everyone Passes',
    description: 'A Leaster happens when all 5 players pass. The goal flips - win by taking the fewest points!',
    type: 'article',
  },
};

export default function LeasterPage() {
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
          <span className="text-white">Leaster</span>
        </nav>

        <h1 className="text-4xl font-bold mb-4">What is a Leaster?</h1>
        <p className="text-xl text-green-300 mb-8">
          The special hand where everyone plays for themselves - and FEWEST points wins
        </p>

        {/* Quick Answer */}
        <section className="bg-yellow-900/30 border border-yellow-600 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">Quick Answer</h2>
          <p className="text-lg text-gray-200">
            A <strong className="text-yellow-300">Leaster</strong> happens when all 5 players pass (nobody picks up the blind).
            In a Leaster, there are no teams - everyone plays for themselves, and the player who captures
            the <strong className="text-yellow-300">fewest points</strong> wins the hand.
          </p>
        </section>

        {/* When Does It Happen */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">When Does a Leaster Happen?</h2>
          <div className="bg-gray-800/50 rounded-xl p-6">
            <p className="text-gray-300 mb-4">
              After the cards are dealt, players take turns deciding whether to "pick" (take the blind) or "pass."
              Starting from the player to the dealer's left, each player has one chance to pick.
            </p>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-gray-200">
                <strong>If all 5 players pass</strong> → It's a Leaster!
              </p>
            </div>
            <p className="text-gray-400 mt-4 text-sm">
              Note: Some groups play "Forced Pick" where the dealer must pick if everyone else passes.
              In that variant, Leasters don't happen.
            </p>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">How a Leaster Works</h2>
          <div className="space-y-4">
            <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4">
              <h3 className="font-bold text-blue-300 mb-2">1. No Teams</h3>
              <p className="text-gray-300">Everyone plays for themselves. There's no picker, no partner, no defenders.</p>
            </div>
            <div className="bg-purple-900/30 border border-purple-600 rounded-lg p-4">
              <h3 className="font-bold text-purple-300 mb-2">2. The Blind Stays Hidden</h3>
              <p className="text-gray-300">The 2 blind cards stay face-down. Whoever wins the last trick also takes the blind cards.</p>
            </div>
            <div className="bg-green-900/30 border border-green-600 rounded-lg p-4">
              <h3 className="font-bold text-green-300 mb-2">3. Lowest Points Wins</h3>
              <p className="text-gray-300">After all 6 tricks, the player who captured the <strong>fewest points</strong> wins.</p>
            </div>
            <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4">
              <h3 className="font-bold text-yellow-300 mb-2">4. Last Trick Risk</h3>
              <p className="text-gray-300">Winning the last trick is risky - you get the blind, which might have points in it!</p>
            </div>
          </div>
        </section>

        {/* Strategy Tips */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Leaster Strategy Tips</h2>
          <div className="bg-gray-800/50 rounded-xl p-6">
            <ul className="space-y-4 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-green-400 font-bold text-xl">✓</span>
                <div>
                  <strong className="text-white">Dump your high point cards early</strong>
                  <p className="text-sm text-gray-400">Get rid of Aces and Tens when someone else is winning the trick</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 font-bold text-xl">✓</span>
                <div>
                  <strong className="text-white">Avoid winning the last trick</strong>
                  <p className="text-sm text-gray-400">The blind often contains point cards that will hurt you</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 font-bold text-xl">✓</span>
                <div>
                  <strong className="text-white">Use low trump strategically</strong>
                  <p className="text-sm text-gray-400">Low diamonds can help you duck winning tricks</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 font-bold text-xl">✗</span>
                <div>
                  <strong className="text-white">Don't hold onto Aces hoping to win tricks</strong>
                  <p className="text-sm text-gray-400">In a Leaster, winning tricks with points is BAD</p>
                </div>
              </li>
            </ul>
          </div>
        </section>

        {/* Scoring */}
        <section className="bg-green-900/30 border border-green-600 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-green-400 mb-3">Leaster Scoring</h2>
          <p className="text-gray-200 mb-4">
            The winner (player with fewest points) typically wins <strong>2 points</strong> from each other player,
            for a total of <strong>+8 points</strong>. Each loser gets <strong>-2 points</strong>.
          </p>
          <p className="text-gray-400 text-sm">
            Some variants score Leasters differently - check your house rules!
          </p>
        </section>

        {/* Example */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Example Leaster Result</h2>
          <div className="bg-gray-800/50 rounded-xl p-6">
            <div className="grid grid-cols-5 gap-2 text-center mb-4">
              <div className="bg-green-900/50 rounded-lg p-3 border-2 border-green-500">
                <p className="font-bold text-green-400">You</p>
                <p className="text-2xl font-bold">12</p>
                <p className="text-xs text-gray-400">points</p>
                <p className="text-green-400 text-sm mt-1">WINNER!</p>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-3">
                <p className="font-bold text-gray-400">P2</p>
                <p className="text-2xl font-bold">28</p>
                <p className="text-xs text-gray-400">points</p>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-3">
                <p className="font-bold text-gray-400">P3</p>
                <p className="text-2xl font-bold">31</p>
                <p className="text-xs text-gray-400">points</p>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-3">
                <p className="font-bold text-gray-400">P4</p>
                <p className="text-2xl font-bold">22</p>
                <p className="text-xs text-gray-400">points</p>
              </div>
              <div className="bg-red-900/50 rounded-lg p-3">
                <p className="font-bold text-gray-400">P5</p>
                <p className="text-2xl font-bold">27</p>
                <p className="text-xs text-gray-400">points</p>
                <p className="text-red-400 text-xs mt-1">+blind</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm text-center">
              You captured only 12 points (maybe just a King and some low cards), winning the Leaster!
            </p>
          </div>
        </section>

        {/* Related Links */}
        <section className="border-t border-gray-700 pt-8">
          <h2 className="text-lg font-bold text-gray-400 mb-4">Learn More Variants</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/rules/blitz" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
              <h3 className="font-bold text-white">Blitz Rules →</h3>
              <p className="text-sm text-gray-400">Double stakes with both black Queens</p>
            </Link>
            <Link href="/rules/cracking" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
              <h3 className="font-bold text-white">Cracking Rules →</h3>
              <p className="text-sm text-gray-400">Doubling and re-doubling stakes</p>
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
