import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Doublers in Sheepshead - Rules When No One Picks',
  description: 'Learn about Doublers in Sheepshead. When all players pass, a Doubler doubles the stakes for the next hand instead of playing a Leaster. Compare Doublers vs Leasters.',
  keywords: ['Sheepshead doubler', 'doubler rules', 'Sheepshead no pick', 'Sheepshead everyone passes', 'doubler vs leaster'],
  openGraph: {
    title: 'Doublers in Sheepshead',
    description: 'When nobody picks, play a Doubler to double the stakes for the next hand. Alternative to Leasters.',
    type: 'article',
  },
};

export default function DoublersPage() {
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
          <span className="text-white">Doublers</span>
        </nav>

        <h1 className="text-4xl font-bold mb-4">Doublers</h1>
        <p className="text-xl text-green-300 mb-8">
          The alternative to Leasters when nobody picks - double the stakes instead!
        </p>

        {/* Quick Answer */}
        <section className="bg-yellow-900/30 border border-yellow-600 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">Quick Summary</h2>
          <p className="text-lg text-gray-200">
            A <strong className="text-yellow-300">Doubler</strong> happens when all players pass (nobody picks).
            Instead of playing a Leaster, the cards are redealt and the <strong className="text-yellow-300">next hand is worth double points</strong>.
          </p>
        </section>

        {/* How It Works */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">How Doublers Work</h2>
          <div className="space-y-4">
            <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4">
              <h3 className="font-bold text-blue-300 mb-2">1. Everyone Passes</h3>
              <p className="text-gray-300">After the deal, all 5 players pass on picking up the blind.</p>
            </div>
            <div className="bg-purple-900/30 border border-purple-600 rounded-lg p-4">
              <h3 className="font-bold text-purple-300 mb-2">2. Cards Redealt</h3>
              <p className="text-gray-300">Instead of playing, gather up all cards and deal a fresh hand.</p>
            </div>
            <div className="bg-green-900/30 border border-green-600 rounded-lg p-4">
              <h3 className="font-bold text-green-300 mb-2">3. Double Stakes</h3>
              <p className="text-gray-300">The next hand is played for <strong className="text-white">2x the normal points</strong>.</p>
            </div>
            <div className="bg-orange-900/30 border border-orange-600 rounded-lg p-4">
              <h3 className="font-bold text-orange-300 mb-2">4. Can Stack</h3>
              <p className="text-gray-300">If everyone passes again, it's another doubler - but most groups <strong className="text-white">don't quadruple</strong>. Instead, the next TWO hands are doubled.</p>
            </div>
          </div>
        </section>

        {/* Consecutive Doublers */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Consecutive Doublers</h2>
          <div className="bg-gray-800/50 rounded-xl p-6">
            <p className="text-gray-300 mb-4">
              What happens when multiple doublers occur in a row? Common house rules:
            </p>
            <div className="space-y-3">
              <div className="bg-gray-700/50 rounded-lg p-3">
                <h3 className="font-bold text-white">Stack Method (Common)</h3>
                <p className="text-gray-400 text-sm">Each doubler adds one more hand at double stakes. Two doublers = next 2 hands doubled. Not quadrupled.</p>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-3">
                <h3 className="font-bold text-white">Multiply Method (Rare)</h3>
                <p className="text-gray-400 text-sm">Stakes actually multiply. Two doublers = 4x stakes. Can get very expensive!</p>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-3">
                <h3 className="font-bold text-white">Cap Method</h3>
                <p className="text-gray-400 text-sm">Maximum of 2x or 4x no matter how many doublers occur.</p>
              </div>
            </div>
            <p className="text-yellow-400 text-sm mt-4">
              Always agree on house rules before playing!
            </p>
          </div>
        </section>

        {/* Doublers vs Leasters */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Doublers vs Leasters</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="py-3 text-gray-400">Aspect</th>
                  <th className="py-3 text-blue-400">Doublers</th>
                  <th className="py-3 text-purple-400">Leasters</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr className="border-b border-gray-800">
                  <td className="py-3">What happens</td>
                  <td className="py-3">Redeal, next hand doubled</td>
                  <td className="py-3">Play the hand differently</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3">Goal</td>
                  <td className="py-3">Normal (61+ to win)</td>
                  <td className="py-3">LOWEST points wins</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3">Teams</td>
                  <td className="py-3">Normal (next hand)</td>
                  <td className="py-3">None - every man for himself</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3">The blind</td>
                  <td className="py-3">Redealt</td>
                  <td className="py-3">Goes to last trick winner</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3">Game pace</td>
                  <td className="py-3">Faster (skip hand)</td>
                  <td className="py-3">Same (play the hand)</td>
                </tr>
                <tr>
                  <td className="py-3">Stakes impact</td>
                  <td className="py-3">Increases next hand</td>
                  <td className="py-3">Normal stakes this hand</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Why Choose Doublers */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Why Play Doublers?</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-900/30 border border-green-600 rounded-lg p-4">
              <h3 className="font-bold text-green-300 mb-3">Reasons to Prefer Doublers</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• Faster - no awkward reversed gameplay</li>
                <li>• Keeps normal game dynamics</li>
                <li>• Builds excitement for next hand</li>
                <li>• Easier to understand</li>
                <li>• Everyone knows the rules</li>
              </ul>
            </div>
            <div className="bg-purple-900/30 border border-purple-600 rounded-lg p-4">
              <h3 className="font-bold text-purple-300 mb-3">Reasons to Prefer Leasters</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• Still get to play the dealt cards</li>
                <li>• Fun strategic challenge</li>
                <li>• No risk of stacking multipliers</li>
                <li>• Traditional Wisconsin style</li>
                <li>• Tests different skills</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Example */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Example Scenario</h2>
          <div className="bg-gray-800/50 rounded-xl p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-gray-300">
                <span className="w-24 text-gray-500">Hand 5:</span>
                <span>Everyone passes → <strong className="text-yellow-400">Doubler!</strong></span>
              </div>
              <div className="flex items-center gap-4 text-gray-300">
                <span className="w-24 text-gray-500">Hand 6:</span>
                <span>Normal play, but <strong className="text-green-400">worth 2x points</strong></span>
              </div>
              <div className="flex items-center gap-4 text-gray-300">
                <span className="w-24 text-gray-500">Result:</span>
                <span>Picker wins with Schneider → normally +4, but gets <strong className="text-green-400">+8!</strong></span>
              </div>
            </div>
          </div>
        </section>

        {/* House Rules Note */}
        <section className="bg-blue-900/30 border border-blue-600 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-blue-400 mb-3">House Rules Reminder</h2>
          <p className="text-gray-200 mb-3">
            Whether to play Doublers or Leasters (or Forced Pick) should be decided <strong className="text-white">before the game starts</strong>.
          </p>
          <p className="text-gray-300">
            Some groups let the dealer choose each time, others stick with one method. Make sure everyone knows the rules!
          </p>
        </section>

        {/* Related Links */}
        <section className="border-t border-gray-700 pt-8">
          <h2 className="text-lg font-bold text-gray-400 mb-4">Related Rules</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/rules/leaster" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
              <h3 className="font-bold text-white">Leaster Rules →</h3>
              <p className="text-sm text-gray-400">Play for lowest points when no one picks</p>
            </Link>
            <Link href="/rules/cracking" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
              <h3 className="font-bold text-white">Cracking Rules →</h3>
              <p className="text-sm text-gray-400">Another way to double the stakes</p>
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
