import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Called Ace Partner in Sheepshead - How Partner Calling Works',
  description: 'Learn how the called ace partner system works in Sheepshead. The picker names a fail suit ace to secretly designate their partner.',
  keywords: ['Sheepshead called ace', 'Sheepshead partner', 'calling partner Sheepshead', 'Sheepshead ace call'],
  openGraph: {
    title: 'Called Ace Partner - Sheepshead Rules',
    description: 'The secret partner mechanic that makes Sheepshead unique. Learn how calling works.',
    type: 'article',
  },
};

export default function CalledAcePage() {
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
          <span className="text-white">Called Ace Partner</span>
        </nav>

        <h1 className="text-4xl font-bold mb-4">Called Ace Partner</h1>
        <p className="text-xl text-green-300 mb-8">
          The secret partner system that makes Sheepshead unique
        </p>

        {/* How It Works */}
        <section className="bg-yellow-900/30 border border-yellow-600 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">How Partner Calling Works</h2>
          <p className="text-lg text-gray-200 mb-4">
            After picking and burying, the picker <strong className="text-yellow-300">calls a fail suit</strong> (Clubs, Spades, or Hearts).
            Whoever holds the <strong className="text-yellow-300">Ace of that suit</strong> becomes the picker's secret partner.
          </p>
          <p className="text-gray-300">
            The partner's identity stays hidden until they play the called Ace - creating suspense and strategy!
          </p>
        </section>

        {/* The Rules */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Partner Calling Rules</h2>
          <div className="space-y-4">
            <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4">
              <h3 className="font-bold text-blue-300 mb-2">1. Call a Fail Suit</h3>
              <p className="text-gray-300">You can only call Clubs, Spades, or Hearts - never Diamonds (that's trump).</p>
            </div>
            <div className="bg-purple-900/30 border border-purple-600 rounded-lg p-4">
              <h3 className="font-bold text-purple-300 mb-2">2. Can't Bury the Called Ace</h3>
              <p className="text-gray-300">If you have the Ace you're calling, you must keep it in your hand - can't bury it!</p>
            </div>
            <div className="bg-green-900/30 border border-green-600 rounded-lg p-4">
              <h3 className="font-bold text-green-300 mb-2">3. Partner Stays Secret</h3>
              <p className="text-gray-300">The partner doesn't reveal themselves until they play the called Ace.</p>
            </div>
            <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4">
              <h3 className="font-bold text-yellow-300 mb-2">4. Must Play When Led</h3>
              <p className="text-gray-300">If the called suit is led, the partner must play the Ace (following suit rules).</p>
            </div>
          </div>
        </section>

        {/* What to Call */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">What Should You Call?</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-900/30 border border-green-600 rounded-xl p-5">
              <h3 className="font-bold text-green-400 mb-3">✓ Good Calls</h3>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• <strong>A suit you're void in</strong> - You can trump when it's led</li>
                <li>• <strong>A suit with only low cards</strong> - Partner's Ace won't get trumped easily</li>
                <li>• <strong>A suit you DON'T have the Ace</strong> - Partner has it, not you</li>
              </ul>
            </div>
            <div className="bg-red-900/30 border border-red-600 rounded-xl p-5">
              <h3 className="font-bold text-red-400 mb-3">✗ Risky Calls</h3>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• <strong>A suit you have the Ace</strong> - You're your own partner!</li>
                <li>• <strong>A suit with many cards</strong> - Ace might get led into and trumped</li>
                <li>• <strong>A suit defenders are likely void in</strong> - Ace gets trumped</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Unknown Partner */}
        <section className="bg-gray-800/50 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-3">🕵️ The Mystery Element</h2>
          <p className="text-gray-300 mb-4">
            The secret partner mechanic creates fascinating dynamics:
          </p>
          <ul className="text-gray-300 space-y-2">
            <li>• <strong>Defenders must guess</strong> who the partner is based on play patterns</li>
            <li>• <strong>The partner can help secretly</strong> by schmearing to picker's tricks</li>
            <li>• <strong>Sometimes you're your own partner</strong> if you called a suit where you have the Ace</li>
            <li>• <strong>The reveal moment</strong> when the Ace is played changes the game dynamic</li>
          </ul>
        </section>

        {/* Going Alone */}
        <section className="bg-purple-900/30 border border-purple-600 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-purple-400 mb-3">Going Alone (No Partner)</h2>
          <p className="text-gray-200 mb-4">
            With a very strong hand, you can choose to <strong>"go alone"</strong> - playing 1 vs 4 without calling a partner.
          </p>
          <p className="text-gray-300">
            This is risky but doubles your potential winnings. Consider it with 7+ trump and 20+ buried points.
          </p>
        </section>

        {/* Related Links */}
        <section className="border-t border-gray-700 pt-8">
          <h2 className="text-lg font-bold text-gray-400 mb-4">Related Topics</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/strategy/what-to-bury" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
              <h3 className="font-bold text-white">What to Bury →</h3>
              <p className="text-sm text-gray-400">Bury strategy affects your call</p>
            </Link>
            <Link href="/strategy/when-to-pick" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
              <h3 className="font-bold text-white">When to Pick →</h3>
              <p className="text-sm text-gray-400">Picking decisions</p>
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
