import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How to Choose Which Ace to Call - Sheepshead Partner Selection',
  description: 'Master the art of calling an ace in Sheepshead. Learn which fail ace to call based on your hand, creating voids, and strategic partner selection to maximize your win rate.',
  keywords: ['Sheepshead call ace', 'which ace to call', 'Sheepshead partner selection', 'calling strategy Sheepshead', 'called ace strategy'],
  openGraph: {
    title: 'Sheepshead Partner Selection Strategy',
    description: 'Learn which ace to call as picker. Void suits, Ace-Ten combos, and strategic partner selection explained.',
    type: 'article',
  },
};

export default function PartnerSelectionPage() {
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
          <span className="text-white">Partner Selection</span>
        </nav>

        <h1 className="text-4xl font-bold mb-4">Choosing Which Ace to Call</h1>
        <p className="text-xl text-green-300 mb-8">
          Strategic partner selection can make or break your hand
        </p>

        {/* Quick Rules */}
        <section className="bg-yellow-900/30 border border-yellow-600 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">The Rules of Calling</h2>
          <ul className="text-gray-200 space-y-2">
            <li>• You can only call <strong className="text-yellow-300">Clubs, Spades, or Hearts</strong> (not Diamonds - it's trump!)</li>
            <li>• You <strong className="text-yellow-300">cannot call an Ace you hold</strong></li>
            <li>• You <strong className="text-yellow-300">must have at least one card</strong> in the called suit (your "hold card")</li>
            <li>• When the called suit is first led, you must play your hold card and partner must play the Ace</li>
          </ul>
        </section>

        {/* Priority Order */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Priority Order for Calling</h2>
          <div className="space-y-4">
            <div className="bg-green-900/30 border border-green-600 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center font-bold">1</span>
                <h3 className="font-bold text-green-300">Call a Suit You're VOID In</h3>
              </div>
              <p className="text-gray-300 ml-11">
                If you have no cards in a fail suit (and don't have that Ace), call it! When that suit is led, you can <strong className="text-white">trump it</strong> while your partner takes their Ace. Best of both worlds.
              </p>
            </div>

            <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold">2</span>
                <h3 className="font-bold text-blue-300">Call Where You Have the Ten</h3>
              </div>
              <p className="text-gray-300 ml-11">
                Having the Ten in your called suit is powerful. When the Ace comes out, you can <strong className="text-white">schmear 10 points</strong> to your partner's 11-point Ace. That's 21 points in one trick!
              </p>
            </div>

            <div className="bg-purple-900/30 border border-purple-600 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center font-bold">3</span>
                <h3 className="font-bold text-purple-300">Call Your Shortest Suit</h3>
              </div>
              <p className="text-gray-300 ml-11">
                If you can't be void, call the suit where you have <strong className="text-white">only 1-2 cards</strong>. You'll run out quickly and be able to trump that suit.
              </p>
            </div>

            <div className="bg-orange-900/30 border border-orange-600 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center font-bold">4</span>
                <h3 className="font-bold text-orange-300">Avoid Suits You're Long In</h3>
              </div>
              <p className="text-gray-300 ml-11">
                If you have 3+ cards in a suit, calling it means you'll be stuck following that suit multiple times. Less flexibility, fewer trump opportunities.
              </p>
            </div>
          </div>
        </section>

        {/* Example Hands */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Example Hands</h2>
          <div className="space-y-4">
            <div className="bg-gray-800/50 rounded-xl p-6">
              <h3 className="font-bold text-white mb-3">Example 1: Clear Void</h3>
              <div className="bg-gray-700/50 rounded-lg p-3 mb-3">
                <p className="text-gray-300 font-mono text-sm">
                  Your hand: Q♣ Q♠ J♥ A♦ 10♦ | A♣ K♣ | 7♥
                </p>
              </div>
              <p className="text-gray-300 mb-2">
                You have Clubs and Hearts, but <strong className="text-green-400">no Spades</strong>. And you don't have the A♠.
              </p>
              <p className="text-green-400 font-bold">
                Call Spades! You're void and can trump when it's led.
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6">
              <h3 className="font-bold text-white mb-3">Example 2: Ten Opportunity</h3>
              <div className="bg-gray-700/50 rounded-lg p-3 mb-3">
                <p className="text-gray-300 font-mono text-sm">
                  Your hand: Q♦ J♣ J♠ 9♦ 8♦ | 10♠ 9♠ | A♥
                </p>
              </div>
              <p className="text-gray-300 mb-2">
                You have A♥ (can't call Hearts) but have <strong className="text-blue-400">10♠ and low spade</strong>. No Clubs.
              </p>
              <p className="text-blue-400 font-bold">
                Call Spades! You can schmear the Ten when partner plays A♠.
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6">
              <h3 className="font-bold text-white mb-3">Example 3: No Good Options</h3>
              <div className="bg-gray-700/50 rounded-lg p-3 mb-3">
                <p className="text-gray-300 font-mono text-sm">
                  Your hand: Q♥ Q♦ J♦ K♦ | A♣ 10♣ | A♠ 7♠
                </p>
              </div>
              <p className="text-gray-300 mb-2">
                You have both black Aces! Only option is <strong className="text-purple-400">Hearts</strong>.
              </p>
              <p className="text-purple-400 font-bold">
                Call Hearts (your only legal choice). Consider going alone if strong enough!
              </p>
            </div>
          </div>
        </section>

        {/* Going Alone */}
        <section className="bg-red-900/30 border border-red-600 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-red-400 mb-3">When to Go Alone</h2>
          <p className="text-gray-200 mb-4">
            Instead of calling a partner, you can go alone (1 vs 4) for bigger rewards. Consider it when:
          </p>
          <ul className="text-gray-300 space-y-2">
            <li>• You have <strong className="text-white">all 4 Queens</strong> or 3+ Queens with good Jacks</li>
            <li>• You hold <strong className="text-white">multiple fail Aces</strong> (they become your points)</li>
            <li>• You have <strong className="text-white">8+ trump</strong> including high ones</li>
            <li>• No suit works well for calling (you have all the Aces or are long everywhere)</li>
          </ul>
          <p className="text-gray-400 text-sm mt-4">
            Going alone is high risk, high reward. You double your winnings but also double your losses!
          </p>
        </section>

        {/* Common Mistakes */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Common Calling Mistakes</h2>
          <div className="space-y-3">
            <div className="bg-red-900/30 border border-red-600 rounded-lg p-4">
              <h3 className="font-bold text-red-300 mb-1">Burying Your Only Card in Called Suit</h3>
              <p className="text-gray-300 text-sm">
                Classic beginner mistake! If you call Hearts, don't bury your only Heart. You MUST have a hold card.
              </p>
            </div>
            <div className="bg-red-900/30 border border-red-600 rounded-lg p-4">
              <h3 className="font-bold text-red-300 mb-1">Calling Your Longest Suit</h3>
              <p className="text-gray-300 text-sm">
                If you have 4 Clubs, calling Clubs means following suit 4 times. That's 4 tricks where you can't trump!
              </p>
            </div>
            <div className="bg-red-900/30 border border-red-600 rounded-lg p-4">
              <h3 className="font-bold text-red-300 mb-1">Ignoring the Ten Schmear</h3>
              <p className="text-gray-300 text-sm">
                Having the Ten is almost as good as being void. Don't overlook Ace-Ten combos!
              </p>
            </div>
          </div>
        </section>

        {/* Summary Table */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Quick Reference</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="py-3 text-gray-400">Your Hand</th>
                  <th className="py-3 text-gray-400">Best Call</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr className="border-b border-gray-800">
                  <td className="py-3">Void in a suit (no Ace)</td>
                  <td className="py-3 text-green-400">That suit - you can trump!</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3">Have Ten + low card</td>
                  <td className="py-3 text-blue-400">That suit - schmear 21 pts!</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3">Single low card only</td>
                  <td className="py-3 text-purple-400">That suit - quick void</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3">3+ cards, no Ten</td>
                  <td className="py-3 text-orange-400">Avoid if possible</td>
                </tr>
                <tr>
                  <td className="py-3">Have all 3 fail Aces</td>
                  <td className="py-3 text-red-400">Consider going alone!</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Related Links */}
        <section className="border-t border-gray-700 pt-8">
          <h2 className="text-lg font-bold text-gray-400 mb-4">Related Strategy</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/rules/called-ace" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
              <h3 className="font-bold text-white">Called Ace Rules →</h3>
              <p className="text-sm text-gray-400">Full rules for the called ace method</p>
            </Link>
            <Link href="/strategy/what-to-bury" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
              <h3 className="font-bold text-white">What to Bury →</h3>
              <p className="text-sm text-gray-400">Picking which cards to bury</p>
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
