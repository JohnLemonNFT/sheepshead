import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'What to Bury in Sheepshead - Bury Strategy Guide',
  description: 'Learn what cards to bury in Sheepshead. Maximize points by burying Aces and Tens. Create voids for trumping. Complete bury strategy guide.',
  keywords: ['Sheepshead bury strategy', 'what to bury Sheepshead', 'Sheepshead burying cards', 'Sheepshead blind strategy'],
  openGraph: {
    title: 'What to Bury in Sheepshead - Strategy Guide',
    description: 'Your bury can be worth 20+ points. Learn to maximize it and create winning voids.',
    type: 'article',
  },
};

export default function WhatToBuryPage() {
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
            <Link href="/strategy" className="text-green-400 font-medium">Strategy</Link>
            <Link href="/learn" className="text-gray-300 hover:text-white">Learn</Link>
            <Link href="/" className="bg-green-600 hover:bg-green-500 px-3 py-1 rounded font-medium">Play</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <nav className="text-sm text-gray-400 mb-4">
          <Link href="/strategy" className="hover:text-white">Strategy</Link>
          <span className="mx-2">→</span>
          <span className="text-white">What to Bury</span>
        </nav>

        <h1 className="text-4xl font-bold mb-4">What to Bury in Sheepshead</h1>
        <p className="text-xl text-green-300 mb-8">
          Your bury counts toward your team's points - make it count!
        </p>

        {/* Key Concept */}
        <section className="bg-yellow-900/30 border border-yellow-600 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">Why the Bury Matters</h2>
          <p className="text-lg text-gray-200 mb-4">
            After picking up the blind (2 cards), you must discard 2 cards face-down.
            These buried cards <strong className="text-yellow-300">count toward your team's points</strong> at the end.
          </p>
          <p className="text-gray-300">
            A smart bury of 20+ points means you only need to win 41 more to reach 61. That's a huge head start!
          </p>
        </section>

        {/* Priority Order */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Bury Priority (Best to Worst)</h2>
          <div className="space-y-4">
            <div className="bg-green-900/30 border border-green-600 rounded-lg p-4">
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-green-400 w-8">1</span>
                <div className="flex-1">
                  <p className="font-bold text-green-300">Fail Aces (11 points each)</p>
                  <p className="text-gray-400 text-sm">The best bury. Safe points that can't be captured by opponents.</p>
                </div>
                <span className="text-2xl font-bold text-green-400">+11</span>
              </div>
            </div>
            <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4">
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-blue-400 w-8">2</span>
                <div className="flex-1">
                  <p className="font-bold text-blue-300">Fail Tens (10 points each)</p>
                  <p className="text-gray-400 text-sm">Almost as good as Aces. Especially bury if in a short suit.</p>
                </div>
                <span className="text-2xl font-bold text-blue-400">+10</span>
              </div>
            </div>
            <div className="bg-purple-900/30 border border-purple-600 rounded-lg p-4">
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-purple-400 w-8">3</span>
                <div className="flex-1">
                  <p className="font-bold text-purple-300">Kings (4 points each)</p>
                  <p className="text-gray-400 text-sm">Decent points, and Kings are hard to win tricks with.</p>
                </div>
                <span className="text-2xl font-bold text-purple-400">+4</span>
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-gray-400 w-8">4</span>
                <div className="flex-1">
                  <p className="font-bold text-gray-300">9s, 8s, 7s (0 points)</p>
                  <p className="text-gray-400 text-sm">No point value, but might be necessary to create a void.</p>
                </div>
                <span className="text-2xl font-bold text-gray-500">+0</span>
              </div>
            </div>
          </div>
        </section>

        {/* The Called Ace Rule */}
        <section className="bg-red-900/30 border border-red-600 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-red-400 mb-3">⚠️ Never Bury the Called Ace!</h2>
          <p className="text-gray-200 mb-4">
            If you plan to call a suit, you <strong>cannot bury that Ace</strong> if you have it.
            The called Ace must stay in your hand to be played.
          </p>
          <p className="text-gray-300 text-sm">
            This is why you often call a suit where you DON'T have the Ace - you want that card
            in your partner's hand, not your bury!
          </p>
        </section>

        {/* Creating Voids */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Creating Voids</h2>
          <div className="bg-gray-800/50 rounded-xl p-6">
            <p className="text-gray-300 mb-4">
              Sometimes it's better to bury low cards to <strong>create a void</strong> (having zero cards in a suit).
              A void lets you trump when that suit is led!
            </p>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="bg-green-900/30 rounded-lg p-4">
                <h3 className="font-bold text-green-400 mb-2">Example: Good Void</h3>
                <p className="text-gray-300 text-sm">
                  You have: K♠, 7♠ (no other spades)<br/>
                  Bury both → Now void in spades!<br/>
                  When spades led, you can trump in.
                </p>
              </div>
              <div className="bg-blue-900/30 rounded-lg p-4">
                <h3 className="font-bold text-blue-400 mb-2">The Trade-off</h3>
                <p className="text-gray-300 text-sm">
                  Burying K♠ + 7♠ = only 4 points<br/>
                  But the void might win you 20+ points in tricks later!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Example Scenarios */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Example Bury Scenarios</h2>
          <div className="space-y-4">
            <div className="bg-gray-800/50 rounded-xl p-5">
              <h3 className="font-bold text-yellow-400 mb-2">Scenario 1: Dream Bury</h3>
              <p className="text-gray-300 text-sm mb-2">
                Your 8 cards: Q♣, J♠, A♦, 10♦, 9♦, <span className="text-yellow-300">A♠</span>, <span className="text-yellow-300">A♥</span>, K♣
              </p>
              <p className="text-green-400 font-bold">Bury: A♠ + A♥ = 22 points!</p>
              <p className="text-gray-400 text-sm mt-1">Call clubs (you have no A♣). Partner has A♣.</p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-5">
              <h3 className="font-bold text-yellow-400 mb-2">Scenario 2: Create a Void</h3>
              <p className="text-gray-300 text-sm mb-2">
                Your 8 cards: Q♠, J♣, J♥, A♦, K♦, A♣, <span className="text-yellow-300">10♠</span>, <span className="text-yellow-300">7♠</span>
              </p>
              <p className="text-green-400 font-bold">Bury: 10♠ + 7♠ = 10 points + void!</p>
              <p className="text-gray-400 text-sm mt-1">Now you're void in spades and can trump when spades are led.</p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-5">
              <h3 className="font-bold text-yellow-400 mb-2">Scenario 3: Tough Choice</h3>
              <p className="text-gray-300 text-sm mb-2">
                Your 8 cards: Q♦, J♦, 10♦, 8♦, A♣, A♠, 10♣, K♠
              </p>
              <p className="text-blue-400 font-bold">Bury: A♠ + K♠ = 15 points + spade void</p>
              <p className="text-gray-400 text-sm mt-1">Can't bury both Aces (need one to call). Bury A♠ + K♠ for void.</p>
            </div>
          </div>
        </section>

        {/* Don't Bury These */}
        <section className="bg-red-900/30 border border-red-600 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-red-400 mb-4">❌ Never Bury These</h2>
          <ul className="space-y-3 text-gray-200">
            <li className="flex items-start gap-2">
              <span className="text-red-400">✗</span>
              <span><strong>Trump cards</strong> - You need every trump to control the game.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400">✗</span>
              <span><strong>The called Ace</strong> - It must stay in your hand if you have it.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400">✗</span>
              <span><strong>Your only card in a fail suit</strong> - Unless strategically creating a void.</span>
            </li>
          </ul>
        </section>

        {/* Pro Tips */}
        <section className="bg-green-900/30 border border-green-600 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-green-400 mb-4">💡 Pro Bury Tips</h2>
          <ul className="space-y-3 text-gray-200">
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span><strong>Plan your call first</strong> - Decide what you'll call before deciding what to bury.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span><strong>Count your trump</strong> - With many trump, bury aggressively. With few, be careful.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span><strong>Consider going alone</strong> - With 20+ points buried and 6+ trump, maybe skip the partner!</span>
            </li>
          </ul>
        </section>

        {/* Related Links */}
        <section className="border-t border-gray-700 pt-8">
          <h2 className="text-lg font-bold text-gray-400 mb-4">Continue Learning</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/strategy/when-to-pick" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
              <h3 className="font-bold text-white">← When to Pick</h3>
              <p className="text-sm text-gray-400">Should you even pick this hand?</p>
            </Link>
            <Link href="/rules/called-ace" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
              <h3 className="font-bold text-white">Calling a Partner →</h3>
              <p className="text-sm text-gray-400">How to choose which Ace to call</p>
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
