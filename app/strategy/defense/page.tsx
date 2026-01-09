import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Defensive Strategy in Sheepshead - How to Play as Defender',
  description: 'Master defensive strategy in Sheepshead. Learn when to lead fail, how to identify the partner, when to trump, and how to work with your fellow defenders to beat the picker.',
  keywords: ['Sheepshead defense', 'defensive strategy Sheepshead', 'how to defend Sheepshead', 'Sheepshead defender tips', 'beat the picker'],
  openGraph: {
    title: 'Defensive Strategy in Sheepshead',
    description: 'Learn how to play as a defender and beat the picker\'s team. Tips on leading fail, identifying partners, and coordinating with your team.',
    type: 'article',
  },
};

export default function DefenseStrategyPage() {
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
          <span className="text-white">Defensive Play</span>
        </nav>

        <h1 className="text-4xl font-bold mb-4">Defensive Strategy</h1>
        <p className="text-xl text-green-300 mb-8">
          How to play as a defender and stop the picker from winning
        </p>

        {/* Core Principle */}
        <section className="bg-yellow-900/30 border border-yellow-600 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">The Golden Rule of Defense</h2>
          <p className="text-xl text-gray-200 text-center">
            <strong className="text-yellow-300">Defenders lead FAIL. Picker leads TRUMP.</strong>
          </p>
          <p className="text-gray-400 text-center mt-3">
            This fundamental principle drives almost every defensive decision.
          </p>
        </section>

        {/* Why Lead Fail */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Why Defenders Lead Fail Suits</h2>
          <div className="bg-gray-800/50 rounded-xl p-6">
            <div className="space-y-4">
              <div className="bg-green-900/30 border border-green-600 rounded-lg p-4">
                <h3 className="font-bold text-green-300 mb-2">1. Force the Picker to Trump</h3>
                <p className="text-gray-300">
                  When you lead a fail suit, the picker often must use valuable trump to win. Every trump they spend on fail is one less for the tricks that matter.
                </p>
              </div>
              <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4">
                <h3 className="font-bold text-blue-300 mb-2">2. Expose the Partner</h3>
                <p className="text-gray-300">
                  Lead the called suit! When you lead the suit of the called ace, you force the partner to reveal themselves by playing that ace.
                </p>
              </div>
              <div className="bg-purple-900/30 border border-purple-600 rounded-lg p-4">
                <h3 className="font-bold text-purple-300 mb-2">3. Let Your Aces Win</h3>
                <p className="text-gray-300">
                  Your fail Aces (11 points!) can win tricks if the picker is out of that suit. Leading fail creates opportunities for your point cards.
                </p>
              </div>
              <div className="bg-orange-900/30 border border-orange-600 rounded-lg p-4">
                <h3 className="font-bold text-orange-300 mb-2">4. Coordinate with Defenders</h3>
                <p className="text-gray-300">
                  Your fellow defenders can schmear (throw points) when they see you're winning the trick. Leading fail makes this coordination easier.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Identifying the Partner */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">How to Identify the Secret Partner</h2>
          <div className="bg-gray-800/50 rounded-xl p-6">
            <p className="text-gray-300 mb-4">Before the called ace is played, watch for these tells:</p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-yellow-400 font-bold">⚠️</span>
                <div>
                  <strong className="text-white">Schmearing to picker</strong>
                  <p className="text-gray-400 text-sm">If someone throws an Ace or Ten into a trick the picker is winning, they're probably the partner.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-yellow-400 font-bold">⚠️</span>
                <div>
                  <strong className="text-white">Not leading the called suit</strong>
                  <p className="text-gray-400 text-sm">A defender would want to lead the called suit. If someone avoids it, suspect them.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-yellow-400 font-bold">⚠️</span>
                <div>
                  <strong className="text-white">Leading trump (as non-picker)</strong>
                  <p className="text-gray-400 text-sm">Leading trump usually helps the picker. If a "defender" does this, they might be the partner.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-400 font-bold">✓</span>
                <div>
                  <strong className="text-white">Playing to lose deliberately</strong>
                  <p className="text-gray-400 text-sm">Watch for someone playing just under the current winner on picker's tricks.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Lead the Called Suit */}
        <section className="bg-blue-900/30 border border-blue-600 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-blue-400 mb-3">Lead the Called Suit!</h2>
          <p className="text-gray-200 mb-4">
            This is the most important defensive play. When you lead the called suit:
          </p>
          <ul className="text-gray-300 space-y-2">
            <li>• The partner <strong className="text-white">must play their Ace</strong> if they have cards in that suit</li>
            <li>• You know the picker has at least one card of that suit (their hold card)</li>
            <li>• The picker <strong className="text-white">cannot win the trick</strong> (they don't have the Ace)</li>
            <li>• Your team is guaranteed to win if no one trumps</li>
          </ul>
          <div className="mt-4 bg-gray-800/50 rounded-lg p-3">
            <p className="text-yellow-400 text-sm">
              <strong>Pro Tip:</strong> If you have multiple cards in the called suit, lead your highest-point card (Ten or Ace). You might take 20+ points in one trick!
            </p>
          </div>
        </section>

        {/* When to Trump */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">When to Trump as Defender</h2>
          <div className="space-y-4">
            <div className="bg-green-900/30 border border-green-600 rounded-lg p-4">
              <h3 className="font-bold text-green-300 mb-2">DO Trump When...</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• The trick has lots of points and picker might win it</li>
                <li>• You're last to play and can secure the win</li>
                <li>• You have only low trump left anyway</li>
                <li>• You're confident the picker will have to over-trump</li>
              </ul>
            </div>
            <div className="bg-red-900/30 border border-red-600 rounded-lg p-4">
              <h3 className="font-bold text-red-300 mb-2">DON'T Trump When...</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Another defender is winning with a fail Ace</li>
                <li>• The trick has few points (let it go)</li>
                <li>• You'd have to use high trump on a low-value trick</li>
                <li>• A fellow defender might want to trump higher</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Schmearing as Defender */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Schmearing as Defender</h2>
          <div className="bg-gray-800/50 rounded-xl p-6">
            <p className="text-gray-300 mb-4">
              When a fellow defender is winning a trick, throw your highest point cards (schmear)!
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-900/30 rounded-lg p-3">
                <h3 className="font-bold text-green-300 mb-2">Good Schmears</h3>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Aces (11 pts each!)</li>
                  <li>• Tens (10 pts)</li>
                  <li>• Kings if you can't do better</li>
                </ul>
              </div>
              <div className="bg-yellow-900/30 rounded-lg p-3">
                <h3 className="font-bold text-yellow-300 mb-2">Caution</h3>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Make sure a defender is winning!</li>
                  <li>• Don't schmear to unknown players</li>
                  <li>• Watch for late trump from picker</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Common Mistakes */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Common Defensive Mistakes</h2>
          <div className="space-y-4">
            <div className="bg-red-900/30 border border-red-600 rounded-lg p-4">
              <h3 className="font-bold text-red-300 mb-2">Leading Trump</h3>
              <p className="text-gray-300 text-sm">
                Unless you have a specific plan, leading trump helps the picker by clearing out defenders' trump. Stick to fail!
              </p>
            </div>
            <div className="bg-red-900/30 border border-red-600 rounded-lg p-4">
              <h3 className="font-bold text-red-300 mb-2">Schmearing to the Wrong Team</h3>
              <p className="text-gray-300 text-sm">
                Before throwing points, be sure a defender is winning. Watch who played what and track the partner!
              </p>
            </div>
            <div className="bg-red-900/30 border border-red-600 rounded-lg p-4">
              <h3 className="font-bold text-red-300 mb-2">Forgetting to Lead Called Suit</h3>
              <p className="text-gray-300 text-sm">
                Your #1 priority is exposing the partner. If you can lead the called suit, usually do it!
              </p>
            </div>
            <div className="bg-red-900/30 border border-red-600 rounded-lg p-4">
              <h3 className="font-bold text-red-300 mb-2">Over-trumping Fellow Defenders</h3>
              <p className="text-gray-300 text-sm">
                If another defender already trumped high enough to beat the picker, don't waste your trump!
              </p>
            </div>
          </div>
        </section>

        {/* Advanced Tips */}
        <section className="bg-green-900/30 border border-green-600 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-green-400 mb-3">Advanced Defensive Tips</h2>
          <ul className="text-gray-300 space-y-3">
            <li>• <strong className="text-white">Count trump:</strong> Track how many trump have been played. When picker is out, your fail Aces become golden.</li>
            <li>• <strong className="text-white">Watch the picker's plays:</strong> If they're playing low trump on fail leads, they might be running low.</li>
            <li>• <strong className="text-white">Communicate through play:</strong> Leading a suit you're strong in tells partners to lead it back to you.</li>
            <li>• <strong className="text-white">Endgame planning:</strong> In late tricks, know exactly who has what left. Count cards!</li>
          </ul>
        </section>

        {/* Related Links */}
        <section className="border-t border-gray-700 pt-8">
          <h2 className="text-lg font-bold text-gray-400 mb-4">More Strategy</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/strategy/leading" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
              <h3 className="font-bold text-white">When to Lead Trump →</h3>
              <p className="text-sm text-gray-400">Learn the exceptions to the fail-first rule</p>
            </Link>
            <Link href="/strategy/schmearing" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
              <h3 className="font-bold text-white">Schmearing Guide →</h3>
              <p className="text-sm text-gray-400">Master the art of throwing points</p>
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
