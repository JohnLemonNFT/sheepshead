import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sheepshead Card Hierarchy - Trump Order & Rankings Explained',
  description: 'Learn the complete Sheepshead card hierarchy. Queens are highest, then Jacks, then Diamonds. Master the trump order to win more games.',
  keywords: ['Sheepshead card hierarchy', 'Sheepshead trump order', 'Sheepshead card rankings', 'which cards are trump in Sheepshead'],
  openGraph: {
    title: 'Sheepshead Card Hierarchy - Complete Trump Rankings',
    description: 'Master the Sheepshead card hierarchy. Learn why Queens beat Jacks, and how the 14 trump cards rank.',
    type: 'article',
  },
};

function Card({ rank, suit, highlight }: { rank: string; suit: string; highlight?: boolean }) {
  const isRed = suit === 'hearts' || suit === 'diamonds';
  const suitSymbol = { clubs: '\u2663', spades: '\u2660', hearts: '\u2665', diamonds: '\u2666' }[suit] || suit;
  return (
    <span className={`inline-flex items-center justify-center w-12 h-16 bg-white rounded-lg shadow text-xl font-bold ${isRed ? 'text-red-600' : 'text-gray-800'} ${highlight ? 'ring-2 ring-yellow-400' : ''}`}>
      {rank}{suitSymbol}
    </span>
  );
}

export default function CardHierarchyPage() {
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
          <span className="text-white">Card Hierarchy</span>
        </nav>

        <h1 className="text-4xl font-bold mb-4">Sheepshead Card Hierarchy</h1>
        <p className="text-xl text-green-300 mb-8">
          Understanding which cards beat which is the foundation of Sheepshead
        </p>

        {/* Key Concept */}
        <section className="bg-yellow-900/30 border border-yellow-600 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">The Key Concept</h2>
          <p className="text-lg text-gray-200 mb-4">
            In Sheepshead, there are <strong className="text-yellow-300">14 trump cards</strong> that beat all other cards.
            The remaining 18 cards are called <strong className="text-gray-300">"fail"</strong> cards.
          </p>
          <p className="text-gray-300">
            Trump cards are: <strong>All 4 Queens</strong>, <strong>All 4 Jacks</strong>, and <strong>All 6 Diamonds</strong>.
          </p>
        </section>

        {/* Complete Trump Order */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-yellow-400 mb-6">Complete Trump Order (Highest to Lowest)</h2>

          <div className="space-y-6">
            {/* Queens */}
            <div className="bg-purple-900/30 border border-purple-600 rounded-xl p-6">
              <h3 className="text-xl font-bold text-purple-300 mb-2">👑 Queens (Highest Trump)</h3>
              <p className="text-gray-400 mb-4">Queens are the most powerful cards. Suit order: Clubs → Spades → Hearts → Diamonds</p>
              <div className="flex flex-wrap gap-3">
                <div className="text-center">
                  <Card rank="Q" suit="clubs" highlight />
                  <p className="text-xs text-gray-400 mt-1">#1</p>
                </div>
                <div className="text-center">
                  <Card rank="Q" suit="spades" highlight />
                  <p className="text-xs text-gray-400 mt-1">#2</p>
                </div>
                <div className="text-center">
                  <Card rank="Q" suit="hearts" highlight />
                  <p className="text-xs text-gray-400 mt-1">#3</p>
                </div>
                <div className="text-center">
                  <Card rank="Q" suit="diamonds" highlight />
                  <p className="text-xs text-gray-400 mt-1">#4</p>
                </div>
              </div>
            </div>

            {/* Jacks */}
            <div className="bg-blue-900/30 border border-blue-600 rounded-xl p-6">
              <h3 className="text-xl font-bold text-blue-300 mb-2">🃏 Jacks</h3>
              <p className="text-gray-400 mb-4">Jacks follow the same suit order as Queens</p>
              <div className="flex flex-wrap gap-3">
                <div className="text-center">
                  <Card rank="J" suit="clubs" highlight />
                  <p className="text-xs text-gray-400 mt-1">#5</p>
                </div>
                <div className="text-center">
                  <Card rank="J" suit="spades" highlight />
                  <p className="text-xs text-gray-400 mt-1">#6</p>
                </div>
                <div className="text-center">
                  <Card rank="J" suit="hearts" highlight />
                  <p className="text-xs text-gray-400 mt-1">#7</p>
                </div>
                <div className="text-center">
                  <Card rank="J" suit="diamonds" highlight />
                  <p className="text-xs text-gray-400 mt-1">#8</p>
                </div>
              </div>
            </div>

            {/* Diamonds */}
            <div className="bg-red-900/30 border border-red-600 rounded-xl p-6">
              <h3 className="text-xl font-bold text-red-300 mb-2">♦️ Diamonds (Lowest Trump)</h3>
              <p className="text-gray-400 mb-4">All Diamonds are trump, ranked by card value: A → 10 → K → 9 → 8 → 7</p>
              <div className="flex flex-wrap gap-3">
                <div className="text-center">
                  <Card rank="A" suit="diamonds" highlight />
                  <p className="text-xs text-gray-400 mt-1">#9</p>
                </div>
                <div className="text-center">
                  <Card rank="10" suit="diamonds" highlight />
                  <p className="text-xs text-gray-400 mt-1">#10</p>
                </div>
                <div className="text-center">
                  <Card rank="K" suit="diamonds" highlight />
                  <p className="text-xs text-gray-400 mt-1">#11</p>
                </div>
                <div className="text-center">
                  <Card rank="9" suit="diamonds" highlight />
                  <p className="text-xs text-gray-400 mt-1">#12</p>
                </div>
                <div className="text-center">
                  <Card rank="8" suit="diamonds" highlight />
                  <p className="text-xs text-gray-400 mt-1">#13</p>
                </div>
                <div className="text-center">
                  <Card rank="7" suit="diamonds" highlight />
                  <p className="text-xs text-gray-400 mt-1">#14</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Fail Cards */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-300 mb-6">Fail Cards (Non-Trump)</h2>
          <div className="bg-gray-800/50 border border-gray-600 rounded-xl p-6">
            <p className="text-gray-300 mb-4">
              The remaining cards in Clubs, Spades, and Hearts (minus their Queens and Jacks) are "fail" cards.
              Each fail suit has 6 cards:
            </p>
            <div className="flex flex-wrap gap-3 mb-4">
              <Card rank="A" suit="clubs" />
              <Card rank="10" suit="clubs" />
              <Card rank="K" suit="clubs" />
              <Card rank="9" suit="clubs" />
              <Card rank="8" suit="clubs" />
              <Card rank="7" suit="clubs" />
            </div>
            <p className="text-gray-400 text-sm">
              Fail cards only beat other fail cards of the same suit. Any trump card beats any fail card.
            </p>
          </div>
        </section>

        {/* Common Mistake */}
        <section className="bg-red-900/30 border border-red-600 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-red-400 mb-3">⚠️ Common Beginner Mistake</h2>
          <p className="text-gray-200">
            <strong>Queens and Jacks are NOT part of their original suit!</strong> If someone leads Clubs
            and you have Q♣ and 7♣, you must play the 7♣. The Queen of Clubs is trump, not a club.
          </p>
        </section>

        {/* Quick Reference */}
        <section className="bg-green-900/30 border border-green-600 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-green-400 mb-3">📋 Quick Reference</h2>
          <div className="font-mono text-sm text-gray-300">
            <p className="mb-2">Trump (14 cards):</p>
            <p className="text-yellow-300">Q♣ {">"} Q♠ {">"} Q♥ {">"} Q♦ {">"} J♣ {">"} J♠ {">"} J♥ {">"} J♦ {">"} A♦ {">"} 10♦ {">"} K♦ {">"} 9♦ {">"} 8♦ {">"} 7♦</p>
            <p className="mt-4 mb-2">Each Fail Suit (6 cards each):</p>
            <p className="text-gray-400">A {">"} 10 {">"} K {">"} 9 {">"} 8 {">"} 7</p>
          </div>
        </section>

        {/* Related Links */}
        <section className="border-t border-gray-700 pt-8">
          <h2 className="text-lg font-bold text-gray-400 mb-4">Continue Learning</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/rules/point-values" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
              <h3 className="font-bold text-white">Point Values →</h3>
              <p className="text-sm text-gray-400">Learn how much each card is worth</p>
            </Link>
            <Link href="/rules/following-suit" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
              <h3 className="font-bold text-white">Following Suit →</h3>
              <p className="text-sm text-gray-400">When must you play trump vs fail?</p>
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
