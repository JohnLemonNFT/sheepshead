import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'When to Pick in Sheepshead - Picking Strategy Guide',
  description: 'Learn when to pick in Sheepshead. How many trump do you need? What makes a good picking hand? Expert tips for the most important decision in the game.',
  keywords: ['when to pick Sheepshead', 'Sheepshead picking strategy', 'should I pick Sheepshead', 'how many trump to pick'],
  openGraph: {
    title: 'When to Pick in Sheepshead - Strategy Guide',
    description: 'The picking decision is the most important in Sheepshead. Learn what makes a good hand and when to pass.',
    type: 'article',
  },
};

export default function WhenToPickPage() {
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
          <span className="text-white">When to Pick</span>
        </nav>

        <h1 className="text-4xl font-bold mb-4">When to Pick in Sheepshead</h1>
        <p className="text-xl text-green-300 mb-8">
          The most important decision in the game - should you pick or pass?
        </p>

        {/* Quick Answer */}
        <section className="bg-yellow-900/30 border border-yellow-600 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">The Quick Answer</h2>
          <p className="text-lg text-gray-200 mb-4">
            As a general rule: <strong className="text-yellow-300">Pick with 4+ trump and a way to get 61 points</strong>.
          </p>
          <p className="text-gray-300">
            But there's much more nuance. Position matters, trump quality matters, and what you can bury matters.
            Read on for the full picture.
          </p>
        </section>

        {/* The Basics */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">What Makes a Picking Hand?</h2>
          <div className="bg-gray-800/50 rounded-xl p-6">
            <p className="text-gray-300 mb-4">A good picking hand typically has:</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-900/30 rounded-lg p-4">
                <h3 className="font-bold text-green-400 mb-2">✓ Trump Strength</h3>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• 4-6 trump cards minimum</li>
                  <li>• At least one Queen or Jack</li>
                  <li>• Better if trump are high-ranking</li>
                </ul>
              </div>
              <div className="bg-blue-900/30 rounded-lg p-4">
                <h3 className="font-bold text-blue-400 mb-2">✓ Bury Potential</h3>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Fail Aces to bury (11 points each!)</li>
                  <li>• Tens in short suits</li>
                  <li>• Ability to create voids</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Trump Count Guidelines */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Trump Count Guidelines</h2>
          <div className="space-y-4">
            <div className="bg-red-900/30 border border-red-600 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-red-400">0-2</span>
                <div>
                  <p className="font-bold text-red-300">Almost Never Pick</p>
                  <p className="text-gray-400 text-sm">You'll get destroyed. Pass and play defense.</p>
                </div>
              </div>
            </div>
            <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-yellow-400">3</span>
                <div>
                  <p className="font-bold text-yellow-300">Risky - Need Great Extras</p>
                  <p className="text-gray-400 text-sm">Only if you have multiple Aces to bury AND strong trump like Q♣, Q♠.</p>
                </div>
              </div>
            </div>
            <div className="bg-green-900/30 border border-green-600 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-green-400">4-5</span>
                <div>
                  <p className="font-bold text-green-300">The Sweet Spot</p>
                  <p className="text-gray-400 text-sm">Most picks happen here. Consider position and trump quality.</p>
                </div>
              </div>
            </div>
            <div className="bg-purple-900/30 border border-purple-600 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-purple-400">6+</span>
                <div>
                  <p className="font-bold text-purple-300">Almost Always Pick</p>
                  <p className="text-gray-400 text-sm">Strong hand. Consider going alone if you have 7+ good trump.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trump Quality - Q♣ and The Ma's */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Trump Quality Matters</h2>
          <div className="space-y-4">
            <div className="bg-purple-900/30 border border-purple-600 rounded-lg p-4">
              <h3 className="font-bold text-purple-300 mb-2">Q♣ is the Boss Card</h3>
              <p className="text-gray-300">
                The Queen of Clubs is the most valuable card in Sheepshead. Leading Q♣ guarantees
                you win the first trick AND forces all 4 opponents to play trump. That's 5 trump
                out of play in one trick! If you have Q♣, add extra weight to picking.
              </p>
            </div>
            <div className="bg-purple-900/30 border border-purple-600 rounded-lg p-4">
              <h3 className="font-bold text-purple-300 mb-2">The Ma's - Black Queens Together</h3>
              <p className="text-gray-300">
                Having both Q♣ and Q♠ (called "The Ma's") is extremely powerful. You control the
                top two trump and can pull 10 trump from opponents in just two tricks. With the
                Ma's, pick even with slightly fewer trump than normal.
              </p>
            </div>
            <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4">
              <h3 className="font-bold text-blue-300 mb-2">Quality Over Quantity</h3>
              <p className="text-gray-300">
                Having Q♣ Q♠ J♣ J♠ (4 high trump) is often better than having 6 low trump
                like J♦ A♦ 10♦ K♦ 9♦ 8♦. High trump lets you control the game and pull
                trump from opponents.
              </p>
            </div>
          </div>
        </section>

        {/* Position Matters */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Position Matters</h2>
          <div className="bg-gray-800/50 rounded-xl p-6">
            <p className="text-gray-300 mb-4">
              Where you sit relative to the dealer affects your picking decision:
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <span className="bg-green-600 text-white px-3 py-1 rounded font-bold text-sm">1st</span>
                <div>
                  <p className="font-bold text-white">First Position (Left of Dealer)</p>
                  <p className="text-gray-400 text-sm">
                    Be more selective. You're committing before seeing if others want to pick.
                    Need a solid hand - 5+ trump or 4 with great extras.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="bg-red-600 text-white px-3 py-1 rounded font-bold text-sm">2nd</span>
                <div>
                  <p className="font-bold text-white">Second Position (Most Dangerous!)</p>
                  <p className="text-gray-400 text-sm">
                    <span className="text-red-400">Be extra careful here.</span> Three players can still "go over" you
                    (pick after you). If you pick weak and someone else has a monster hand,
                    you're in trouble. Need a stronger hand than other positions.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="bg-blue-600 text-white px-3 py-1 rounded font-bold text-sm">3rd</span>
                <div>
                  <p className="font-bold text-white">Middle Position</p>
                  <p className="text-gray-400 text-sm">
                    Standard guidelines apply. Pick with 4+ good trump.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="bg-yellow-600 text-white px-3 py-1 rounded font-bold text-sm">4-5</span>
                <div>
                  <p className="font-bold text-white">Late Position (Near Dealer)</p>
                  <p className="text-gray-400 text-sm">
                    If everyone passes, you can pick lighter hands. The blind might help!
                    3 trump with good extras becomes pickable.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Example Hands */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Example Hands</h2>
          <div className="space-y-4">
            <div className="bg-green-900/30 border border-green-600 rounded-xl p-5">
              <h3 className="font-bold text-green-400 mb-2">✓ PICK This Hand</h3>
              <p className="font-mono text-gray-200 mb-2">Q♣ J♠ J♦ A♦ 9♦ A♠</p>
              <p className="text-gray-400 text-sm">
                5 trump including a Queen and two Jacks. A♠ can be buried for 11 points.
                This is a strong picking hand.
              </p>
            </div>
            <div className="bg-yellow-900/30 border border-yellow-600 rounded-xl p-5">
              <h3 className="font-bold text-yellow-400 mb-2">⚠️ Borderline Hand</h3>
              <p className="font-mono text-gray-200 mb-2">J♥ A♦ 10♦ 7♦ A♣ K♥</p>
              <p className="text-gray-400 text-sm">
                Only 4 trump and they're not great. But you have an A♣ to bury.
                Pick in late position, pass in early position.
              </p>
            </div>
            <div className="bg-red-900/30 border border-red-600 rounded-xl p-5">
              <h3 className="font-bold text-red-400 mb-2">✗ PASS This Hand</h3>
              <p className="font-mono text-gray-200 mb-2">Q♦ 8♦ 7♦ A♣ A♠ K♣</p>
              <p className="text-gray-400 text-sm">
                Only 3 trump and they're all low. Those Aces look nice but you won't
                control the game. Pass and hope for a Leaster.
              </p>
            </div>
          </div>
        </section>

        {/* Common Mistakes */}
        <section className="bg-red-900/30 border border-red-600 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-red-400 mb-4">⚠️ Common Picking Mistakes</h2>
          <ul className="space-y-3 text-gray-200">
            <li className="flex items-start gap-2">
              <span className="text-red-400">✗</span>
              <span><strong>Picking on Aces alone</strong> - Fail Aces are great to bury, not to play. You need trump to win tricks.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400">✗</span>
              <span><strong>Counting low diamonds as "good" trump</strong> - 7♦, 8♦, 9♦ are trump but they won't win tricks.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400">✗</span>
              <span><strong>Picking weak hands because you're bored</strong> - Patience! A bad pick hurts for multiple hands.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400">✗</span>
              <span><strong>Always picking in last position</strong> - Position helps, but 2 trump is still 2 trump.</span>
            </li>
          </ul>
        </section>

        {/* Pro Tips */}
        <section className="bg-green-900/30 border border-green-600 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-green-400 mb-4">💡 Pro Tips</h2>
          <ul className="space-y-3 text-gray-200">
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span><strong>Think about the bury first</strong> - What will you bury? If you can't bury 10+ points, reconsider.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span><strong>Count potential trump</strong> - The blind has 2 cards. Assume 0-1 trump on average.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span><strong>Value voids</strong> - Being void in a fail suit lets you trump in. Very valuable!</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span><strong>Consider your partner</strong> - You'll call an Ace, so you have help. Don't need to win alone.</span>
            </li>
          </ul>
        </section>

        {/* Related Links */}
        <section className="border-t border-gray-700 pt-8">
          <h2 className="text-lg font-bold text-gray-400 mb-4">Continue Learning Strategy</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/strategy/what-to-bury" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
              <h3 className="font-bold text-white">What to Bury →</h3>
              <p className="text-sm text-gray-400">Maximize your bury for more points</p>
            </Link>
            <Link href="/strategy/schmearing" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
              <h3 className="font-bold text-white">Schmearing Strategy →</h3>
              <p className="text-sm text-gray-400">Throw points to the right tricks</p>
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
