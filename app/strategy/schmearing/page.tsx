import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Schmearing in Sheepshead - How to Throw Points Strategically',
  description: 'Learn the art of schmearing in Sheepshead. Throw high-point cards like Aces and Tens to tricks your team is winning to maximize points.',
  keywords: ['Sheepshead schmear', 'schmearing strategy', 'throwing points Sheepshead', 'smear cards'],
  openGraph: {
    title: 'Schmearing Strategy - Sheepshead Tips',
    description: 'Master the art of schmearing - throwing points to maximize your team score.',
    type: 'article',
  },
};

export default function SchmearingPage() {
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
          <span className="text-white">Schmearing</span>
        </nav>

        <h1 className="text-4xl font-bold mb-4">Schmearing in Sheepshead</h1>
        <p className="text-xl text-green-300 mb-8">
          The art of throwing points to maximize your team's score
        </p>

        {/* What is Schmearing */}
        <section className="bg-yellow-900/30 border border-yellow-600 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">What is Schmearing?</h2>
          <p className="text-lg text-gray-200 mb-4">
            <strong className="text-yellow-300">Schmearing</strong> (also spelled "smearing") means throwing high-point cards
            onto a trick that your teammate is winning. It's how you maximize points from tricks you control.
          </p>
          <p className="text-gray-300">
            The word comes from German/Yiddish and literally means "to spread" - you're spreading points onto winning tricks!
          </p>
        </section>

        {/* When to Schmear */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">When to Schmear</h2>
          <div className="space-y-4">
            <div className="bg-green-900/30 border border-green-600 rounded-lg p-4">
              <h3 className="font-bold text-green-300 mb-2">✓ Your Team is Winning the Trick</h3>
              <p className="text-gray-300">Only schmear when you're confident your teammate has the trick won. Check who played the highest card!</p>
            </div>
            <div className="bg-green-900/30 border border-green-600 rounded-lg p-4">
              <h3 className="font-bold text-green-300 mb-2">✓ No One Can Beat Your Teammate</h3>
              <p className="text-gray-300">If players after your teammate could still beat them, don't schmear yet.</p>
            </div>
            <div className="bg-green-900/30 border border-green-600 rounded-lg p-4">
              <h3 className="font-bold text-green-300 mb-2">✓ You Can't Win the Trick Yourself</h3>
              <p className="text-gray-300">If you could win with that Ace, sometimes that's better than schmearing.</p>
            </div>
          </div>
        </section>

        {/* What to Schmear */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">What Cards to Schmear</h2>
          <div className="bg-gray-800/50 rounded-xl p-6">
            <p className="text-gray-300 mb-4">Schmear your highest point cards (in order of priority):</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-yellow-900/30 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-yellow-400">A</p>
                <p className="text-sm text-gray-400">11 points</p>
              </div>
              <div className="bg-orange-900/30 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-orange-400">10</p>
                <p className="text-sm text-gray-400">10 points</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-gray-300">K</p>
                <p className="text-sm text-gray-400">4 points</p>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-gray-400">Q/J</p>
                <p className="text-sm text-gray-400">3/2 points</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mt-4">
              Aces and Tens are the prime schmear targets - they're worth 21 points together!
            </p>
          </div>
        </section>

        {/* Common Mistakes */}
        <section className="bg-red-900/30 border border-red-600 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-red-400 mb-4">⚠️ Schmearing Mistakes</h2>
          <ul className="space-y-3 text-gray-200">
            <li className="flex items-start gap-2">
              <span className="text-red-400">✗</span>
              <span><strong>Schmearing to the wrong team</strong> - Make sure you know who's winning!</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400">✗</span>
              <span><strong>Schmearing before the trick is safe</strong> - Wait until no one can beat your teammate</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400">✗</span>
              <span><strong>Schmearing when you could win</strong> - Sometimes winning the trick yourself is better</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400">✗</span>
              <span><strong>Revealing yourself as partner</strong> - Schmearing too early can expose the secret partner</span>
            </li>
          </ul>
        </section>

        {/* Partner Schmearing */}
        <section className="bg-purple-900/30 border border-purple-600 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-purple-400 mb-3">🤝 Schmearing as the Secret Partner</h2>
          <p className="text-gray-200 mb-4">
            As the secret partner, schmearing is how you help the picker without revealing yourself immediately.
            But be careful - obvious schmearing tells defenders who you are!
          </p>
          <ul className="text-gray-300 space-y-2">
            <li>• <strong>Early game:</strong> Subtle schmears (Kings instead of Aces)</li>
            <li>• <strong>Mid game:</strong> More aggressive if needed</li>
            <li>• <strong>After reveal:</strong> Schmear freely!</li>
          </ul>
        </section>

        {/* Example */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Example Schmear Situation</h2>
          <div className="bg-gray-800/50 rounded-xl p-6">
            <p className="text-gray-300 mb-4">
              <strong>Situation:</strong> The picker leads Q♣ (highest trump). You're the partner holding A♠ and K♣.
            </p>
            <div className="bg-green-900/30 rounded-lg p-4 mb-4">
              <p className="font-bold text-green-400">✓ Good play: Schmear A♠</p>
              <p className="text-gray-400 text-sm">The Q♣ will win (nothing beats it). Throw your 11-point Ace!</p>
            </div>
            <p className="text-gray-400 text-sm">
              Result: The trick is worth 11 (Ace) + 3 (Queen) = 14 points for your team.
            </p>
          </div>
        </section>

        {/* Related Links */}
        <section className="border-t border-gray-700 pt-8">
          <h2 className="text-lg font-bold text-gray-400 mb-4">Related Strategy</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/strategy/when-to-pick" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
              <h3 className="font-bold text-white">← When to Pick</h3>
              <p className="text-sm text-gray-400">Picking decision guide</p>
            </Link>
            <Link href="/rules/point-values" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
              <h3 className="font-bold text-white">Point Values →</h3>
              <p className="text-sm text-gray-400">Know what each card is worth</p>
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
