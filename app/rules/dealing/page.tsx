import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How to Deal Sheepshead - Dealing Rules & The Blind',
  description: 'Learn how to deal Sheepshead correctly. Deal 6 cards to each player, 2 to the blind. Dealing rotates clockwise. Complete dealing rules explained.',
  keywords: ['how to deal Sheepshead', 'Sheepshead dealing rules', 'Sheepshead blind', 'dealing cards Sheepshead'],
  openGraph: {
    title: 'How to Deal Sheepshead - Complete Dealing Guide',
    description: 'The correct way to deal Sheepshead. 6 cards each, 2 to the blind, rotating dealer.',
    type: 'article',
  },
};

export default function DealingPage() {
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
          <span className="text-white">Dealing</span>
        </nav>

        <h1 className="text-4xl font-bold mb-4">How to Deal Sheepshead</h1>
        <p className="text-xl text-green-300 mb-8">
          The deal sets up everything - get it right from the start
        </p>

        {/* Quick Summary */}
        <section className="bg-yellow-900/30 border border-yellow-600 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-yellow-400 mb-3">Quick Summary</h2>
          <ul className="space-y-2 text-gray-200">
            <li>• <strong className="text-yellow-300">32 cards</strong> in the deck (7, 8, 9, 10, J, Q, K, A of each suit)</li>
            <li>• <strong className="text-yellow-300">6 cards</strong> to each of the 5 players</li>
            <li>• <strong className="text-yellow-300">2 cards</strong> face down in the middle (the "blind")</li>
            <li>• <strong className="text-yellow-300">Dealer rotates</strong> clockwise after each hand</li>
          </ul>
        </section>

        {/* Step by Step */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Step-by-Step Dealing</h2>

          <div className="space-y-4">
            <div className="bg-gray-800/50 border border-gray-600 rounded-xl p-5">
              <div className="flex gap-4">
                <span className="text-2xl font-bold text-green-400">1</span>
                <div>
                  <h3 className="font-bold text-lg mb-1">Shuffle the Deck</h3>
                  <p className="text-gray-300">Use a standard 32-card deck (remove 2s through 6s from a regular deck). Shuffle thoroughly.</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-600 rounded-xl p-5">
              <div className="flex gap-4">
                <span className="text-2xl font-bold text-green-400">2</span>
                <div>
                  <h3 className="font-bold text-lg mb-1">Offer a Cut</h3>
                  <p className="text-gray-300">The player to the dealer's right cuts the deck. This is traditional and helps ensure fairness.</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-600 rounded-xl p-5">
              <div className="flex gap-4">
                <span className="text-2xl font-bold text-green-400">3</span>
                <div>
                  <h3 className="font-bold text-lg mb-1">Deal in Rounds</h3>
                  <p className="text-gray-300">Deal clockwise starting with the player to your left. Traditional dealing is in batches:</p>
                  <ul className="mt-2 text-gray-400 space-y-1">
                    <li>• First round: 3 cards to each player</li>
                    <li>• Place 2 cards face-down in center (the blind)</li>
                    <li>• Second round: 3 more cards to each player</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-600 rounded-xl p-5">
              <div className="flex gap-4">
                <span className="text-2xl font-bold text-green-400">4</span>
                <div>
                  <h3 className="font-bold text-lg mb-1">Keep the Blind Hidden</h3>
                  <p className="text-gray-300">The 2 blind cards stay face-down until someone "picks" them up. No one knows what's in the blind.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Blind */}
        <section className="bg-blue-900/30 border border-blue-600 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-blue-400 mb-4">About the Blind</h2>
          <div className="space-y-3 text-gray-200">
            <p>The <strong className="text-blue-300">blind</strong> (also called "the bury" in some regions) is central to Sheepshead:</p>
            <ul className="space-y-2 ml-4">
              <li>• Contains 2 unknown cards worth 0-22 points</li>
              <li>• The picker takes these cards into their hand</li>
              <li>• Picker then buries 2 cards face-down (those points count for picker's team)</li>
              <li>• Adds mystery and risk to the picking decision</li>
            </ul>
          </div>
        </section>

        {/* Dealer Rotation */}
        <section className="bg-purple-900/30 border border-purple-600 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-purple-400 mb-4">Dealer Rotation</h2>
          <div className="text-gray-200 space-y-3">
            <p>After each hand, the deal passes <strong className="text-purple-300">clockwise</strong> to the next player.</p>
            <p>Why this matters:</p>
            <ul className="space-y-2 ml-4">
              <li>• The player to dealer's left picks first (best position)</li>
              <li>• The dealer picks last (worst position, but forced pick if all pass)</li>
              <li>• Fair rotation ensures everyone gets each position equally</li>
            </ul>
          </div>
        </section>

        {/* Common Variations */}
        <section className="bg-gray-800/50 border border-gray-600 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-300 mb-4">Dealing Variations</h2>
          <div className="text-gray-300 space-y-3">
            <p><strong>3-2-3 deal:</strong> 3 cards, blind, 3 cards (most common)</p>
            <p><strong>2-2-2 deal:</strong> 2 cards, blind, 2 cards, 2 cards (some regions)</p>
            <p><strong>All at once:</strong> 6 cards to each player, then blind (casual play)</p>
            <p className="text-gray-500 text-sm mt-4">The method doesn't affect gameplay - use whatever your group prefers.</p>
          </div>
        </section>

        {/* Related Links */}
        <section className="border-t border-gray-700 pt-8">
          <h2 className="text-lg font-bold text-gray-400 mb-4">Next Steps</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/rules/picking" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
              <h3 className="font-bold text-white">Picking →</h3>
              <p className="text-sm text-gray-400">What happens after the deal</p>
            </Link>
            <Link href="/rules" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
              <h3 className="font-bold text-white">All Rules →</h3>
              <p className="text-sm text-gray-400">Complete rules reference</p>
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
