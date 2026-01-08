import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sheepshead Cracking Rules - Doubling and Re-Doubling Stakes',
  description: 'Learn how Cracking works in Sheepshead. Defenders can "crack" to double stakes, and the picker can "re-crack" to double again.',
  keywords: ['Sheepshead cracking', 'Sheepshead doubling', 'crack and re-crack', 'Sheepshead crack rules'],
  openGraph: {
    title: 'Sheepshead Cracking - Double the Stakes',
    description: 'Cracking lets defenders double the stakes when they think the picker will lose. Learn when to crack and re-crack.',
    type: 'article',
  },
};

export default function CrackingPage() {
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
          <span className="text-white">Cracking</span>
        </nav>

        <h1 className="text-4xl font-bold mb-4">Cracking in Sheepshead</h1>
        <p className="text-xl text-green-300 mb-8">
          Raise the stakes when you're confident in your hand
        </p>

        {/* What is Cracking */}
        <section className="bg-yellow-900/30 border border-yellow-600 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">What is Cracking?</h2>
          <p className="text-lg text-gray-200">
            <strong className="text-yellow-300">Cracking</strong> is a variant that lets defenders double the stakes
            after someone picks. It's like saying "I think you're going to lose - let's make it interesting!"
            The picker can then <strong className="text-yellow-300">"re-crack"</strong> to double again.
          </p>
        </section>

        {/* How It Works */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">How Cracking Works</h2>
          <div className="space-y-4">
            <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4 flex items-start gap-4">
              <span className="text-2xl font-bold text-blue-400">1</span>
              <div>
                <h3 className="font-bold text-blue-300">Someone Picks</h3>
                <p className="text-gray-300">A player picks up the blind as normal.</p>
              </div>
            </div>
            <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4 flex items-start gap-4">
              <span className="text-2xl font-bold text-yellow-400">2</span>
              <div>
                <h3 className="font-bold text-yellow-300">Defenders May Crack</h3>
                <p className="text-gray-300">Any defender can say "Crack!" to double the stakes. This happens before burying.</p>
              </div>
            </div>
            <div className="bg-purple-900/30 border border-purple-600 rounded-lg p-4 flex items-start gap-4">
              <span className="text-2xl font-bold text-purple-400">3</span>
              <div>
                <h3 className="font-bold text-purple-300">Picker May Re-Crack</h3>
                <p className="text-gray-300">If cracked, the picker can "Re-crack!" to double again (4x total).</p>
              </div>
            </div>
            <div className="bg-green-900/30 border border-green-600 rounded-lg p-4 flex items-start gap-4">
              <span className="text-2xl font-bold text-green-400">4</span>
              <div>
                <h3 className="font-bold text-green-300">Play Continues</h3>
                <p className="text-gray-300">After cracking decisions, the picker buries and calls normally.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Multiplier Table */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Stake Multipliers</h2>
          <div className="bg-gray-800/50 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="text-left px-6 py-4 font-bold">Situation</th>
                  <th className="text-center px-6 py-4 font-bold">Multiplier</th>
                  <th className="text-center px-6 py-4 font-bold">Example</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-700">
                  <td className="px-6 py-4 text-gray-300">No crack</td>
                  <td className="px-6 py-4 text-center text-xl">1x</td>
                  <td className="px-6 py-4 text-center text-gray-400">Win = +2</td>
                </tr>
                <tr className="border-t border-gray-700 bg-yellow-900/20">
                  <td className="px-6 py-4 text-yellow-300 font-bold">Cracked</td>
                  <td className="px-6 py-4 text-center text-xl text-yellow-400">2x</td>
                  <td className="px-6 py-4 text-center text-yellow-400">Win = +4</td>
                </tr>
                <tr className="border-t border-gray-700 bg-purple-900/20">
                  <td className="px-6 py-4 text-purple-300 font-bold">Crack + Re-crack</td>
                  <td className="px-6 py-4 text-center text-xl text-purple-400">4x</td>
                  <td className="px-6 py-4 text-center text-purple-400">Win = +8</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-gray-400 text-sm mt-3 text-center">
            These multipliers stack with Schneider/Schwarz bonuses for even bigger swings!
          </p>
        </section>

        {/* When to Crack */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">When Should You Crack?</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-900/30 border border-green-600 rounded-xl p-5">
              <h3 className="font-bold text-green-400 mb-3">✓ Good Reasons to Crack</h3>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• You have 4+ trump as a defender</li>
                <li>• You have a strong off-ace or two</li>
                <li>• The picker is in late position (weak pick)</li>
                <li>• You suspect you might be the partner</li>
                <li>• Your team collectively has strong hands</li>
              </ul>
            </div>
            <div className="bg-red-900/30 border border-red-600 rounded-xl p-5">
              <h3 className="font-bold text-red-400 mb-3">✗ Don't Crack When</h3>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• You have very few trump</li>
                <li>• The picker picked in first position (strong)</li>
                <li>• You're just trying to bluff</li>
                <li>• Your hand is mediocre at best</li>
              </ul>
            </div>
          </div>
        </section>

        {/* When to Re-crack */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">When Should You Re-crack?</h2>
          <div className="bg-purple-900/30 border border-purple-600 rounded-xl p-6">
            <p className="text-gray-200 mb-4">
              Re-cracking is a bold move. Only do it when you're genuinely confident:
            </p>
            <ul className="text-gray-300 space-y-2">
              <li>• <strong>You have 6+ trump</strong> including multiple Queens/Jacks</li>
              <li>• <strong>You can bury big points</strong> (20+ points in the bury)</li>
              <li>• <strong>You have "The Ma's"</strong> (both black Queens)</li>
              <li>• <strong>The crack feels desperate</strong> - like they're bluffing</li>
            </ul>
            <p className="text-yellow-300 mt-4 text-sm">
              ⚠️ Remember: If you lose a re-cracked hand, you lose 4x the normal amount!
            </p>
          </div>
        </section>

        {/* Psychology */}
        <section className="bg-gray-800/50 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-3">🧠 The Psychology of Cracking</h2>
          <p className="text-gray-300 mb-4">
            Cracking adds a poker-like element to Sheepshead. A crack says "I think you'll lose" but
            it also reveals information - why would someone crack unless they have a decent hand?
          </p>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h3 className="font-bold text-gray-300 mb-2">For Defenders</h3>
              <p className="text-gray-400 text-sm">
                Cracking signals strength to your fellow defenders. It can boost morale and encourage
                teamwork - but it also warns the picker to be careful.
              </p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h3 className="font-bold text-gray-300 mb-2">For the Picker</h3>
              <p className="text-gray-400 text-sm">
                A crack might make you play more conservatively. But if you know your hand is strong,
                a re-crack can demoralize the defenders and lead to mistakes.
              </p>
            </div>
          </div>
        </section>

        {/* House Rules Note */}
        <section className="bg-blue-900/30 border border-blue-600 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-blue-400 mb-3">📋 House Rules Variations</h2>
          <p className="text-gray-200 mb-4">
            Different groups play cracking differently:
          </p>
          <ul className="text-gray-300 space-y-2 text-sm">
            <li>• <strong>Who can crack?</strong> - Some only allow first defender, others allow any</li>
            <li>• <strong>When?</strong> - Some allow cracking only before bury, others after</li>
            <li>• <strong>Partner cracking?</strong> - Can the partner (if known) crack? Usually no</li>
            <li>• <strong>Multiple cracks?</strong> - Some allow multiple defenders to crack (not stacking)</li>
          </ul>
          <p className="text-gray-400 text-sm mt-4">
            Always clarify house rules before playing!
          </p>
        </section>

        {/* Related Links */}
        <section className="border-t border-gray-700 pt-8">
          <h2 className="text-lg font-bold text-gray-400 mb-4">Related Rules</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/rules/blitz" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
              <h3 className="font-bold text-white">← Blitz Rules</h3>
              <p className="text-sm text-gray-400">Double stakes with both black Queens</p>
            </Link>
            <Link href="/rules/scoring" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
              <h3 className="font-bold text-white">Scoring System →</h3>
              <p className="text-sm text-gray-400">How points translate to game scores</p>
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
