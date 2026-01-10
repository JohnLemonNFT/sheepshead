import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Picking in Sheepshead - Rules for Picking Up the Blind',
  description: 'Learn the picking rules in Sheepshead. Who picks first, when to pick or pass, and what happens after picking. Complete guide to the pick phase.',
  keywords: ['Sheepshead picking', 'pick up blind Sheepshead', 'Sheepshead pick rules', 'when to pick Sheepshead'],
  openGraph: {
    title: 'Picking in Sheepshead - Complete Picking Rules',
    description: 'Everything about picking in Sheepshead. Pick order, picking strategy, and what to do after picking.',
    type: 'article',
  },
};

export default function PickingPage() {
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
          <span className="text-white">Picking</span>
        </nav>

        <h1 className="text-4xl font-bold mb-4">Picking in Sheepshead</h1>
        <p className="text-xl text-green-300 mb-8">
          The pick decision determines who plays offense vs defense
        </p>

        {/* What is Picking */}
        <section className="bg-yellow-900/30 border border-yellow-600 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-yellow-400 mb-3">What is Picking?</h2>
          <p className="text-gray-200 mb-3">
            <strong className="text-yellow-300">Picking</strong> means taking the 2 blind cards into your hand.
            The picker becomes the offense and must win 61+ points to succeed.
          </p>
          <p className="text-gray-300">
            If you <strong>pass</strong>, the opportunity moves to the next player clockwise.
          </p>
        </section>

        {/* Pick Order */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Pick Order</h2>
          <div className="bg-gray-800/50 border border-gray-600 rounded-xl p-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-4">
              <div className="text-center p-4 bg-green-900/50 rounded-lg flex-1">
                <div className="text-3xl mb-2">1️⃣</div>
                <div className="font-bold text-green-400">First Pick</div>
                <div className="text-sm text-gray-400">Left of dealer</div>
                <div className="text-xs text-green-300 mt-1">Best position</div>
              </div>
              <div className="text-2xl text-gray-500">→</div>
              <div className="text-center p-4 bg-gray-700/50 rounded-lg flex-1">
                <div className="text-3xl mb-2">2️⃣</div>
                <div className="font-bold">Second Pick</div>
                <div className="text-sm text-gray-400">Next clockwise</div>
              </div>
              <div className="text-2xl text-gray-500">→</div>
              <div className="text-center p-4 bg-gray-700/50 rounded-lg flex-1">
                <div className="text-3xl mb-2">3️⃣</div>
                <div className="font-bold">Third Pick</div>
                <div className="text-sm text-gray-400">Continues around</div>
              </div>
              <div className="text-2xl text-gray-500">→</div>
              <div className="text-center p-4 bg-red-900/50 rounded-lg flex-1">
                <div className="text-3xl mb-2">5️⃣</div>
                <div className="font-bold text-red-400">Dealer</div>
                <div className="text-sm text-gray-400">Last pick</div>
                <div className="text-xs text-red-300 mt-1">Worst position</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm text-center">
              Earlier position = more information advantage. You know fewer players have passed.
            </p>
          </div>
        </section>

        {/* After Picking */}
        <section className="bg-blue-900/30 border border-blue-600 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-blue-400 mb-4">What Happens After Picking</h2>
          <div className="space-y-4 text-gray-200">
            <div className="flex gap-3">
              <span className="text-blue-400 font-bold">1.</span>
              <p><strong className="text-blue-300">Take the blind</strong> - Add both blind cards to your hand (now 8 cards)</p>
            </div>
            <div className="flex gap-3">
              <span className="text-blue-400 font-bold">2.</span>
              <p><strong className="text-blue-300">Bury 2 cards</strong> - Discard 2 cards face-down. These count for your team's points.</p>
            </div>
            <div className="flex gap-3">
              <span className="text-blue-400 font-bold">3.</span>
              <p><strong className="text-blue-300">Call a partner</strong> - Name a fail ace. Whoever holds it is secretly your partner. (Called Ace variant)</p>
            </div>
            <div className="flex gap-3">
              <span className="text-blue-400 font-bold">4.</span>
              <p><strong className="text-blue-300">Play begins</strong> - Player left of dealer leads the first trick</p>
            </div>
          </div>
        </section>

        {/* If Everyone Passes */}
        <section className="bg-purple-900/30 border border-purple-600 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-purple-400 mb-4">If Everyone Passes</h2>
          <p className="text-gray-200 mb-4">When all 5 players pass, one of two things happens depending on house rules:</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="font-bold text-purple-300 mb-2">Leaster</h3>
              <p className="text-gray-400 text-sm">No one picks. Lowest point-taker wins. Everyone plays for themselves.</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="font-bold text-purple-300 mb-2">Forced Pick</h3>
              <p className="text-gray-400 text-sm">Dealer must pick, even with a bad hand. "Stuck" with the blind.</p>
            </div>
          </div>
        </section>

        {/* When to Pick - Brief */}
        <section className="bg-green-900/30 border border-green-600 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-green-400 mb-4">Quick Guide: When to Pick</h2>
          <div className="space-y-2 text-gray-200">
            <p><strong className="text-green-300">Usually pick with:</strong> 4+ trump, including at least one Queen or Jack</p>
            <p><strong className="text-green-300">Consider passing with:</strong> Less than 3 trump, or weak trump (no Queens/Jacks)</p>
            <p><strong className="text-green-300">Position matters:</strong> Be more aggressive early, more cautious in late position</p>
          </div>
          <Link href="/strategy/when-to-pick" className="inline-block mt-4 text-green-400 hover:text-green-300 text-sm">
            Read full picking strategy guide →
          </Link>
        </section>

        {/* Related Links */}
        <section className="border-t border-gray-700 pt-8">
          <h2 className="text-lg font-bold text-gray-400 mb-4">Related Topics</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/strategy/when-to-pick" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
              <h3 className="font-bold text-white">When to Pick →</h3>
              <p className="text-sm text-gray-400">Detailed picking strategy</p>
            </Link>
            <Link href="/strategy/what-to-bury" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
              <h3 className="font-bold text-white">What to Bury →</h3>
              <p className="text-sm text-gray-400">Choosing which cards to bury</p>
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
