import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sheepshead Blitz Rules - Playing with Both Black Queens',
  description: 'Learn the Blitz variant in Sheepshead. When the picker has both black Queens (Q♣ and Q♠), they can declare Blitz to double the stakes.',
  keywords: ['Sheepshead blitz', 'black queens Sheepshead', 'Sheepshead blitz rules', 'the mas Sheepshead'],
  openGraph: {
    title: 'Sheepshead Blitz - The Black Queens Variant',
    description: 'Blitz doubles the stakes when you hold both black Queens. Learn when and how to use this powerful variant.',
    type: 'article',
  },
};

function Card({ rank, suit }: { rank: string; suit: string }) {
  const isRed = suit === 'hearts' || suit === 'diamonds';
  const suitSymbol = { clubs: '\u2663', spades: '\u2660', hearts: '\u2665', diamonds: '\u2666' }[suit] || suit;
  return (
    <span className={`inline-flex items-center justify-center w-14 h-20 bg-white rounded-lg shadow-lg text-2xl font-bold ${isRed ? 'text-red-600' : 'text-gray-800'} ring-2 ring-purple-400`}>
      {rank}{suitSymbol}
    </span>
  );
}

export default function BlitzPage() {
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
          <span className="text-white">Blitz</span>
        </nav>

        <h1 className="text-4xl font-bold mb-4">Sheepshead Blitz</h1>
        <p className="text-xl text-green-300 mb-8">
          Double the stakes when you hold "The Ma's" - both black Queens
        </p>

        {/* The Cards */}
        <section className="bg-purple-900/30 border border-purple-600 rounded-xl p-6 mb-8 text-center">
          <h2 className="text-2xl font-bold text-purple-300 mb-4">The Black Queens ("The Ma's")</h2>
          <div className="flex justify-center gap-4 mb-4">
            <Card rank="Q" suit="clubs" />
            <Card rank="Q" suit="spades" />
          </div>
          <p className="text-gray-300">
            The Queen of Clubs and Queen of Spades - the two highest cards in Sheepshead
          </p>
        </section>

        {/* What is Blitz */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">What is Blitz?</h2>
          <div className="bg-gray-800/50 rounded-xl p-6">
            <p className="text-gray-300 mb-4">
              <strong className="text-yellow-300">Blitz</strong> is a variant where a picker who holds both black Queens
              (Q♣ and Q♠) can declare "Blitz" to <strong>double the stakes</strong> for the hand.
            </p>
            <p className="text-gray-300">
              Since the black Queens are the two most powerful cards in the game, holding both gives
              the picker a significant advantage - and Blitz rewards taking that risk.
            </p>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">How Blitz Works</h2>
          <div className="space-y-4">
            <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4">
              <h3 className="font-bold text-blue-300 mb-2">1. Pick and Check</h3>
              <p className="text-gray-300">After picking up the blind, check if you have both Q♣ and Q♠.</p>
            </div>
            <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4">
              <h3 className="font-bold text-yellow-300 mb-2">2. Declare Blitz (Optional)</h3>
              <p className="text-gray-300">If you have both, you MAY declare "Blitz" before burying. It's optional!</p>
            </div>
            <div className="bg-green-900/30 border border-green-600 rounded-lg p-4">
              <h3 className="font-bold text-green-300 mb-2">3. Double Stakes</h3>
              <p className="text-gray-300">If you declare Blitz, all points for the hand are doubled.</p>
            </div>
            <div className="bg-purple-900/30 border border-purple-600 rounded-lg p-4">
              <h3 className="font-bold text-purple-300 mb-2">4. Play Continues</h3>
              <p className="text-gray-300">The hand is played normally - bury, call partner, play tricks.</p>
            </div>
          </div>
        </section>

        {/* When to Blitz */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">When Should You Blitz?</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-900/30 border border-green-600 rounded-xl p-5">
              <h3 className="font-bold text-green-400 mb-3">✓ Good Time to Blitz</h3>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• You have 6+ trump cards total</li>
                <li>• You have other high trump (Jacks)</li>
                <li>• You can bury significant points</li>
                <li>• Your hand has a clear void to exploit</li>
              </ul>
            </div>
            <div className="bg-red-900/30 border border-red-600 rounded-xl p-5">
              <h3 className="font-bold text-red-400 mb-3">✗ Maybe Don't Blitz</h3>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• You only have 4-5 trump total</li>
                <li>• Your other trump are low (7♦, 8♦, 9♦)</li>
                <li>• You have no fail Aces to bury</li>
                <li>• You're already nervous about picking</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Why It's Called The Ma's */}
        <section className="bg-gray-800/50 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-3">Why "The Ma's"?</h2>
          <p className="text-gray-300 mb-4">
            In traditional Sheepshead slang, the black Queens are affectionately called <strong>"The Ma's"</strong>
            (or "The Moms"). This comes from German-American card game culture where these powerful cards
            are personified as matriarchal figures ruling over the game.
          </p>
          <p className="text-gray-400 text-sm">
            You might also hear: "I've got The Ma's!" or "Watch out, I'm holding both mothers!"
          </p>
        </section>

        {/* Scoring Example */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Blitz Scoring Example</h2>
          <div className="bg-gray-800/50 rounded-xl p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-gray-400 mb-2">Normal Win (No Blitz)</h3>
                <p className="text-gray-300">Picker wins with 65 points</p>
                <p className="text-2xl font-bold text-green-400 mt-2">+2 points</p>
              </div>
              <div className="border-l border-gray-600 pl-6">
                <h3 className="font-bold text-yellow-400 mb-2">With Blitz Declared</h3>
                <p className="text-gray-300">Picker wins with 65 points</p>
                <p className="text-2xl font-bold text-yellow-400 mt-2">+4 points</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mt-4 text-center">
              Blitz doubles both wins AND losses - use it wisely!
            </p>
          </div>
        </section>

        {/* Stacking with Crack */}
        <section className="bg-yellow-900/30 border border-yellow-600 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-yellow-400 mb-3">⚡ Blitz + Crack = Big Stakes!</h2>
          <p className="text-gray-200 mb-4">
            In games that allow both Blitz and Cracking, the multipliers stack:
          </p>
          <ul className="text-gray-300 space-y-1">
            <li>• Blitz alone = 2x</li>
            <li>• Blitz + Crack = 4x</li>
            <li>• Blitz + Crack + Re-crack = 8x</li>
          </ul>
          <p className="text-gray-400 text-sm mt-4">
            This can lead to huge swings in score - exciting but risky!
          </p>
        </section>

        {/* Related Links */}
        <section className="border-t border-gray-700 pt-8">
          <h2 className="text-lg font-bold text-gray-400 mb-4">Related Rules</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/rules/cracking" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
              <h3 className="font-bold text-white">Cracking Rules →</h3>
              <p className="text-sm text-gray-400">Defenders can double the stakes too</p>
            </Link>
            <Link href="/rules/called-ace" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
              <h3 className="font-bold text-white">Called Ace Partner →</h3>
              <p className="text-sm text-gray-400">How the picker chooses a partner</p>
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
