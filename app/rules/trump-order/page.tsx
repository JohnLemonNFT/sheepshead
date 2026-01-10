import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sheepshead Trump Order - Complete List from Highest to Lowest',
  description: 'The complete Sheepshead trump order from highest to lowest. Q♣ Q♠ Q♥ Q♦ J♣ J♠ J♥ J♦ A♦ 10♦ K♦ 9♦ 8♦ 7♦. Memorize the 14 trump cards.',
  keywords: ['Sheepshead trump order', 'trump cards Sheepshead', 'Sheepshead trump ranking', 'what beats what in Sheepshead'],
  openGraph: {
    title: 'Sheepshead Trump Order - All 14 Trump Cards Ranked',
    description: 'The complete trump order in Sheepshead. Queens, Jacks, then Diamonds.',
    type: 'article',
  },
};

export default function TrumpOrderPage() {
  const trumpOrder = [
    { rank: 'Q', suit: 'clubs', name: 'Queen of Clubs', points: 3, note: 'Highest trump - "The Old Lady"' },
    { rank: 'Q', suit: 'spades', name: 'Queen of Spades', points: 3, note: '' },
    { rank: 'Q', suit: 'hearts', name: 'Queen of Hearts', points: 3, note: '' },
    { rank: 'Q', suit: 'diamonds', name: 'Queen of Diamonds', points: 3, note: '' },
    { rank: 'J', suit: 'clubs', name: 'Jack of Clubs', points: 2, note: '' },
    { rank: 'J', suit: 'spades', name: 'Jack of Spades', points: 2, note: '' },
    { rank: 'J', suit: 'hearts', name: 'Jack of Hearts', points: 2, note: '' },
    { rank: 'J', suit: 'diamonds', name: 'Jack of Diamonds', points: 2, note: 'Partner card in Jack variant' },
    { rank: 'A', suit: 'diamonds', name: 'Ace of Diamonds', points: 11, note: 'Highest point trump' },
    { rank: '10', suit: 'diamonds', name: 'Ten of Diamonds', points: 10, note: '' },
    { rank: 'K', suit: 'diamonds', name: 'King of Diamonds', points: 4, note: '' },
    { rank: '9', suit: 'diamonds', name: 'Nine of Diamonds', points: 0, note: '' },
    { rank: '8', suit: 'diamonds', name: 'Eight of Diamonds', points: 0, note: '' },
    { rank: '7', suit: 'diamonds', name: 'Seven of Diamonds', points: 0, note: 'Lowest trump' },
  ];

  const suitSymbol: Record<string, string> = { clubs: '♣', spades: '♠', hearts: '♥', diamonds: '♦' };
  const isRed = (suit: string) => suit === 'hearts' || suit === 'diamonds';

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
          <span className="text-white">Trump Order</span>
        </nav>

        <h1 className="text-4xl font-bold mb-4">Sheepshead Trump Order</h1>
        <p className="text-xl text-green-300 mb-8">
          All 14 trump cards ranked from highest to lowest
        </p>

        {/* Quick Reference */}
        <section className="bg-yellow-900/30 border border-yellow-600 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-yellow-400 mb-3">Quick Reference</h2>
          <p className="font-mono text-lg text-yellow-200 break-all">
            Q♣ → Q♠ → Q♥ → Q♦ → J♣ → J♠ → J♥ → J♦ → A♦ → 10♦ → K♦ → 9♦ → 8♦ → 7♦
          </p>
          <p className="text-gray-400 mt-3 text-sm">
            Memorize this order. It never changes regardless of what's led.
          </p>
        </section>

        {/* Complete List */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Complete Trump Order</h2>
          <div className="bg-gray-800/50 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">#</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Card</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Points</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 hidden sm:table-cell">Notes</th>
                </tr>
              </thead>
              <tbody>
                {trumpOrder.map((card, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-gray-800/30' : ''}>
                    <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3">
                      <span className={`font-bold text-lg ${isRed(card.suit) ? 'text-red-400' : 'text-white'}`}>
                        {card.rank}{suitSymbol[card.suit]}
                      </span>
                      <span className="text-gray-400 ml-2 text-sm">{card.name}</span>
                    </td>
                    <td className="px-4 py-3 text-yellow-400">{card.points}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm hidden sm:table-cell">{card.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Memory Tips */}
        <section className="bg-blue-900/30 border border-blue-600 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-blue-400 mb-4">How to Memorize It</h2>
          <div className="space-y-3 text-gray-200">
            <p><strong className="text-blue-300">1. Queens first, then Jacks</strong> - Royalty ranks by gender (Queens beat Jacks)</p>
            <p><strong className="text-blue-300">2. Suit order: Clubs → Spades → Hearts → Diamonds</strong> - Same for both Queens and Jacks</p>
            <p><strong className="text-blue-300">3. Then all Diamonds</strong> - Ranked by card value (A, 10, K, 9, 8, 7)</p>
          </div>
        </section>

        {/* Why It Matters */}
        <section className="bg-green-900/30 border border-green-600 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-green-400 mb-4">Why Trump Order Matters</h2>
          <ul className="space-y-2 text-gray-200">
            <li>• <strong>Knowing what beats what</strong> helps you decide when to play high trump</li>
            <li>• <strong>Counting trump</strong> - track which high trump have been played</li>
            <li>• <strong>Leading strategy</strong> - know when your trump is "boss" (highest remaining)</li>
            <li>• <strong>Deciding to pick</strong> - high trump (Queens, Jacks) are more valuable than low trump</li>
          </ul>
        </section>

        {/* Related Links */}
        <section className="border-t border-gray-700 pt-8">
          <h2 className="text-lg font-bold text-gray-400 mb-4">Related Topics</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/rules/card-hierarchy" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
              <h3 className="font-bold text-white">Card Hierarchy →</h3>
              <p className="text-sm text-gray-400">Trump vs fail cards explained</p>
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
