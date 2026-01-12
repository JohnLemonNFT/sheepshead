import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'When to Lead Trump in Sheepshead - Leading Strategy',
  description: 'Learn when to lead trump vs fail in Sheepshead. As picker, lead trump to draw out opponents\' trump. As defender, usually lead fail. Master the leading strategy.',
  keywords: ['Sheepshead lead trump', 'when to lead trump', 'Sheepshead leading strategy', 'lead fail Sheepshead', 'picker strategy'],
  openGraph: {
    title: 'When to Lead Trump in Sheepshead',
    description: 'Master the strategy of when to lead trump as picker and when to lead fail as defender.',
    type: 'article',
  },
};

export default function LeadingStrategyPage() {
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
          <span className="text-white">Leading Strategy</span>
        </nav>

        <h1 className="text-4xl font-bold mb-4">When to Lead Trump</h1>
        <p className="text-xl text-green-300 mb-8">
          The most important decision: what suit to lead
        </p>

        {/* Core Principle */}
        <section className="bg-yellow-900/30 border border-yellow-600 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">The Cardinal Rule</h2>
          <div className="grid md:grid-cols-2 gap-4 text-center">
            <div className="bg-green-900/50 rounded-lg p-4">
              <p className="text-3xl mb-2">👑</p>
              <p className="font-bold text-green-300">PICKER</p>
              <p className="text-white text-xl">Leads TRUMP</p>
            </div>
            <div className="bg-blue-900/50 rounded-lg p-4">
              <p className="text-3xl mb-2">🛡️</p>
              <p className="font-bold text-blue-300">DEFENDER</p>
              <p className="text-white text-xl">Leads FAIL</p>
            </div>
          </div>
          <p className="text-gray-400 text-center mt-4">
            This rule holds true 80%+ of the time. Learn it before learning the exceptions.
          </p>
        </section>

        {/* Why Picker Leads Trump */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Why Picker Leads Trump</h2>
          <div className="bg-gray-800/50 rounded-xl p-6">
            <div className="space-y-4">
              <div className="bg-green-900/30 border border-green-600 rounded-lg p-4">
                <h3 className="font-bold text-green-300 mb-2">Pull Enemy Trump</h3>
                <p className="text-gray-300">
                  With 14 trump cards split 5 ways, defenders have trump too. Leading trump forces them to spend it, making your fail cards safer later.
                </p>
              </div>
              <div className="bg-green-900/30 border border-green-600 rounded-lg p-4">
                <h3 className="font-bold text-green-300 mb-2">You Have More Trump</h3>
                <p className="text-gray-300">
                  As picker, you should have strong trump (that's why you picked!). Trump leads favor the player with more trump - you.
                </p>
              </div>
              <div className="bg-green-900/30 border border-green-600 rounded-lg p-4">
                <h3 className="font-bold text-green-300 mb-2">Protect Your Partner</h3>
                <p className="text-gray-300">
                  Your partner can schmear (throw points) into your trump tricks. Leading fail gives defenders the same opportunity against you.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Picker Trump Leading Strategy */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">How to Lead Trump as Picker</h2>
          <div className="space-y-4">
            <div className="bg-purple-900/30 border border-purple-600 rounded-lg p-4">
              <h3 className="font-bold text-purple-300 mb-2">Lead High to Start</h3>
              <p className="text-gray-300">
                Open with your Queens and high Jacks. This pulls out opponents' best trump and establishes dominance. Don't save your best for last!
              </p>
            </div>
            <div className="bg-purple-900/30 border border-purple-600 rounded-lg p-4">
              <h3 className="font-bold text-purple-300 mb-2">Count Trump as You Go</h3>
              <p className="text-gray-300">
                Track how many trump have been played. Once opponents are out of trump, your fail Aces become unbeatable.
              </p>
            </div>
            <div className="bg-purple-900/30 border border-purple-600 rounded-lg p-4">
              <h3 className="font-bold text-purple-300 mb-2">Switch to Fail When Safe</h3>
              <p className="text-gray-300">
                Once you've drawn most trump, lead your fail Aces to collect big points. Timing this switch is key to winning.
              </p>
            </div>
          </div>
        </section>

        {/* Picker: Delay the Called Suit */}
        <section className="bg-green-900/30 border border-green-600 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-green-400 mb-3">Picker's Secret: DELAY the Called Suit</h2>
          <p className="text-gray-200 mb-4">
            <strong className="text-green-300">When you lead fail suits, lead ANYTHING except the called suit.</strong>
            This is one of the best strategic moves for the picker.
          </p>
          <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
            <p className="text-gray-300">
              <strong>Why delay works:</strong> When the called suit is led, the partner must play their Ace
              and reveal themselves. By delaying, you let the partner's Ace "walk" - potentially winning
              a late trick when defenders have run out of trump to stop it.
            </p>
          </div>
          <p className="text-gray-400 text-sm">
            <strong>Tip:</strong> Lead your other fail suits first. The partner's called Ace is strongest
            when played late in the hand after trump has been depleted.
          </p>
        </section>

        {/* Exceptions for Picker */}
        <section className="bg-orange-900/30 border border-orange-600 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-orange-400 mb-3">Other Times Picker Should Lead Fail</h2>
          <ul className="text-gray-300 space-y-2">
            <li>• <strong className="text-white">You have bare Aces:</strong> An Ace in a short suit might win before opponents can trump it</li>
            <li>• <strong className="text-white">Trump is exhausted:</strong> Once most trump is gone, fail Aces are king</li>
            <li>• <strong className="text-white">You're weak in trump:</strong> If you picked light, fail-first might be your only chance</li>
          </ul>
        </section>

        {/* Why Defender Leads Fail */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Why Defender Leads Fail</h2>
          <div className="bg-gray-800/50 rounded-xl p-6">
            <div className="space-y-4">
              <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4">
                <h3 className="font-bold text-blue-300 mb-2">Expose the Partner</h3>
                <p className="text-gray-300">
                  Lead the called suit! This forces the partner to play their ace, revealing the teams.
                </p>
              </div>
              <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4">
                <h3 className="font-bold text-blue-300 mb-2">Make Picker Spend Trump</h3>
                <p className="text-gray-300">
                  When you lead fail, the picker often must trump. This depletes their trump advantage.
                </p>
              </div>
              <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4">
                <h3 className="font-bold text-blue-300 mb-2">Your Aces Can Win</h3>
                <p className="text-gray-300">
                  If picker is void in your fail suit, they must trump. If they're also out of trump, your Ace wins!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* NEVER Lead Trump as Defender */}
        <section className="bg-red-900/30 border border-red-600 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-red-400 mb-3">⚠️ Defenders: Almost NEVER Lead Trump</h2>
          <p className="text-gray-200 mb-4">
            <strong className="text-red-300">This is one of the most important rules in Sheepshead.</strong>
            When defenders lead trump, it actually helps the picker more than hurts them!
          </p>
          <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
            <p className="text-gray-300">
              <strong>Why leading trump hurts defenders:</strong> The picker has more trump than any individual defender.
              When you lead trump, you're bleeding trump from your fellow defenders while the picker
              gladly follows suit. After a few trump leads, the picker's fail cards become unbeatable.
            </p>
          </div>
          <p className="text-gray-400 text-sm">
            <strong className="text-yellow-400">Rare exceptions:</strong> Only lead trump if you have 5+ trump yourself
            (you're essentially a second picker) or in the endgame when you know exactly what's left.
          </p>
        </section>

        {/* Lead Selection Chart */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Quick Reference: What to Lead</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="py-3 text-gray-400">Situation</th>
                  <th className="py-3 text-gray-400">Lead</th>
                  <th className="py-3 text-gray-400">Why</th>
                </tr>
              </thead>
              <tbody className="text-gray-300 text-sm">
                <tr className="border-b border-gray-800">
                  <td className="py-3">Picker, opening lead</td>
                  <td className="py-3 text-green-400">High trump</td>
                  <td className="py-3">Establish dominance, pull enemy trump</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3">Defender, opening lead</td>
                  <td className="py-3 text-blue-400">Called suit</td>
                  <td className="py-3">Expose the partner immediately</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3">Defender, no called suit cards</td>
                  <td className="py-3 text-blue-400">Any fail suit</td>
                  <td className="py-3">Force picker to trump</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3">Picker, trump exhausted</td>
                  <td className="py-3 text-green-400">Fail Aces</td>
                  <td className="py-3">They can't be trumped now</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3">Partner, picker leading</td>
                  <td className="py-3 text-purple-400">Follow picker's lead</td>
                  <td className="py-3">Support the plan</td>
                </tr>
                <tr>
                  <td className="py-3">Defender, endgame</td>
                  <td className="py-3 text-blue-400">Count cards!</td>
                  <td className="py-3">Lead what you know will win</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Related Links */}
        <section className="border-t border-gray-700 pt-8">
          <h2 className="text-lg font-bold text-gray-400 mb-4">More Strategy</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/strategy/defense" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
              <h3 className="font-bold text-white">Defensive Strategy →</h3>
              <p className="text-sm text-gray-400">Complete guide to playing as defender</p>
            </Link>
            <Link href="/strategy/when-to-pick" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
              <h3 className="font-bold text-white">When to Pick →</h3>
              <p className="text-sm text-gray-400">Know when to take the blind</p>
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
