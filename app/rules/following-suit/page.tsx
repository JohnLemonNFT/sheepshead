import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Following Suit in Sheepshead - When Must You Play Trump?',
  description: 'Understand Sheepshead following suit rules. When trump is led, play trump. When fail is led, play that fail suit. Queens and Jacks are always trump!',
  keywords: ['Sheepshead following suit', 'Sheepshead suit rules', 'when to play trump', 'Sheepshead must follow'],
  openGraph: {
    title: 'Following Suit Rules - Sheepshead',
    description: 'The rules for what you must play when a card is led. The #1 thing that trips up beginners!',
    type: 'article',
  },
};

export default function FollowingSuitPage() {
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
          <span className="text-white">Following Suit</span>
        </nav>

        <h1 className="text-4xl font-bold mb-4">Following Suit in Sheepshead</h1>
        <p className="text-xl text-green-300 mb-8">
          The rules for what you must play - and the #1 thing beginners get wrong
        </p>

        {/* Core Rule */}
        <section className="bg-yellow-900/30 border border-yellow-600 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">The Core Rule</h2>
          <p className="text-lg text-gray-200 mb-4">
            <strong className="text-yellow-300">You must follow the suit that was led if you can.</strong>
          </p>
          <ul className="text-gray-300 space-y-2">
            <li>• If <strong>trump</strong> is led → you must play trump (if you have any)</li>
            <li>• If a <strong>fail suit</strong> is led → you must play that suit (if you have any)</li>
            <li>• If you <strong>can't follow</strong> → play anything you want</li>
          </ul>
        </section>

        {/* The Tricky Part */}
        <section className="bg-red-900/30 border border-red-600 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-red-400 mb-4">⚠️ The Part Everyone Gets Wrong</h2>
          <p className="text-lg text-gray-200 mb-4">
            <strong>Queens and Jacks are ALWAYS trump - never part of their original suit!</strong>
          </p>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-gray-300 mb-2"><strong>Example:</strong> Clubs is led. You have Q♣ and 7♣.</p>
            <p className="text-green-400 font-bold">✓ You must play 7♣</p>
            <p className="text-gray-400 text-sm">The Q♣ is trump, not a club. Your only club is the 7♣.</p>
          </div>
        </section>

        {/* Detailed Scenarios */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Detailed Scenarios</h2>
          <div className="space-y-4">
            <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4">
              <h3 className="font-bold text-blue-300 mb-2">Trump is Led (Queen, Jack, or Diamond)</h3>
              <p className="text-gray-300">You must play any trump card. All Queens, Jacks, and Diamonds are trump.</p>
              <p className="text-gray-400 text-sm mt-2">Example: J♠ is led. You can play Q♥, J♣, 7♦, or any other trump.</p>
            </div>

            <div className="bg-purple-900/30 border border-purple-600 rounded-lg p-4">
              <h3 className="font-bold text-purple-300 mb-2">Clubs is Led (A♣, 10♣, K♣, 9♣, 8♣, or 7♣)</h3>
              <p className="text-gray-300">You must play a club card - but Q♣ and J♣ are NOT clubs, they're trump!</p>
              <p className="text-gray-400 text-sm mt-2">Your club cards are only: A♣, 10♣, K♣, 9♣, 8♣, 7♣</p>
            </div>

            <div className="bg-green-900/30 border border-green-600 rounded-lg p-4">
              <h3 className="font-bold text-green-300 mb-2">You Can't Follow Suit</h3>
              <p className="text-gray-300">If you have no cards in the led suit, you can play anything - including trump to "trump in"!</p>
              <p className="text-gray-400 text-sm mt-2">This is called "trumping in" or "ruffing".</p>
            </div>
          </div>
        </section>

        {/* Quick Reference */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Quick Reference: What's in Each Suit?</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4">
              <h3 className="font-bold text-yellow-300 mb-2">Trump (14 cards)</h3>
              <p className="text-gray-300 text-sm">Q♣ Q♠ Q♥ Q♦ J♣ J♠ J♥ J♦ A♦ 10♦ K♦ 9♦ 8♦ 7♦</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="font-bold text-gray-300 mb-2">Clubs (6 cards)</h3>
              <p className="text-gray-300 text-sm">A♣ 10♣ K♣ 9♣ 8♣ 7♣</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="font-bold text-gray-300 mb-2">Spades (6 cards)</h3>
              <p className="text-gray-300 text-sm">A♠ 10♠ K♠ 9♠ 8♠ 7♠</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="font-bold text-gray-300 mb-2">Hearts (6 cards)</h3>
              <p className="text-gray-300 text-sm">A♥ 10♥ K♥ 9♥ 8♥ 7♥</p>
            </div>
          </div>
        </section>

        {/* Who Wins */}
        <section className="bg-green-900/30 border border-green-600 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-green-400 mb-3">Who Wins the Trick?</h2>
          <ul className="text-gray-200 space-y-2">
            <li>• <strong>If any trump was played:</strong> Highest trump wins</li>
            <li>• <strong>If no trump was played:</strong> Highest card of the led suit wins</li>
            <li>• <strong>Off-suit non-trump cards:</strong> Can never win (they don't count)</li>
          </ul>
        </section>

        {/* Related Links */}
        <section className="border-t border-gray-700 pt-8">
          <h2 className="text-lg font-bold text-gray-400 mb-4">Related Rules</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/rules/card-hierarchy" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
              <h3 className="font-bold text-white">← Card Hierarchy</h3>
              <p className="text-sm text-gray-400">Which cards beat which</p>
            </Link>
            <Link href="/rules/point-values" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
              <h3 className="font-bold text-white">Point Values →</h3>
              <p className="text-sm text-gray-400">How much each card is worth</p>
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
