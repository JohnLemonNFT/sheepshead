import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Jack of Diamonds Partner Rules - Sheepshead Variant',
  description: 'Learn the Jack of Diamonds partner variant in Sheepshead. In this version, the J♦ holder is automatically the picker\'s partner. Popular in parts of Wisconsin outside Milwaukee.',
  keywords: ['Jack of Diamonds partner', 'Sheepshead JD partner', 'Sheepshead partner rules', 'called ace vs jack of diamonds', 'Sheepshead variants'],
  openGraph: {
    title: 'Jack of Diamonds Partner - Sheepshead Variant',
    description: 'The J♦ partner variant where partnership is automatic but hidden. Compare to Called Ace method.',
    type: 'article',
  },
};

export default function JackOfDiamondsPage() {
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
          <span className="text-white">Jack of Diamonds Partner</span>
        </nav>

        <h1 className="text-4xl font-bold mb-4">Jack of Diamonds Partner</h1>
        <p className="text-xl text-green-300 mb-8">
          The alternative partner method where J♦ holder is automatically the partner
        </p>

        {/* Quick Answer */}
        <section className="bg-yellow-900/30 border border-yellow-600 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">Quick Summary</h2>
          <p className="text-lg text-gray-200">
            In the <strong className="text-yellow-300">Jack of Diamonds</strong> variant, whoever holds the J♦ is automatically the picker's partner.
            Unlike Called Ace, the picker doesn't choose - the partner is determined by the cards dealt.
          </p>
        </section>

        {/* How It Works */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">How Jack of Diamonds Partner Works</h2>
          <div className="space-y-4">
            <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4">
              <h3 className="font-bold text-blue-300 mb-2">Automatic Partnership</h3>
              <p className="text-gray-300">When someone picks up the blind, the player holding the <strong className="text-white">Jack of Diamonds (J♦)</strong> becomes their partner automatically.</p>
            </div>
            <div className="bg-purple-900/30 border border-purple-600 rounded-lg p-4">
              <h3 className="font-bold text-purple-300 mb-2">No Announcement</h3>
              <p className="text-gray-300">The picker doesn't call anything. Partnership remains <strong className="text-white">secret until the J♦ is played</strong>.</p>
            </div>
            <div className="bg-green-900/30 border border-green-600 rounded-lg p-4">
              <h3 className="font-bold text-green-300 mb-2">Play When Able</h3>
              <p className="text-gray-300">Unlike Called Ace rules, the partner can play the J♦ <strong className="text-white">anytime trump is led or legal</strong>. No forced reveal.</p>
            </div>
          </div>
        </section>

        {/* Picker Has the J♦ */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">What If Picker Has the Jack of Diamonds?</h2>
          <div className="bg-gray-800/50 rounded-xl p-6">
            <p className="text-gray-300 mb-4">
              If the picker ends up with the J♦ (either dealt or from the blind), there are several common house rules:
            </p>
            <div className="space-y-3">
              <div className="bg-gray-700/50 rounded-lg p-3">
                <h3 className="font-bold text-white">Option 1: Go Alone (Most Common)</h3>
                <p className="text-gray-400 text-sm">Picker must play 1 vs 4 with no partner. Higher risk, higher reward.</p>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-3">
                <h3 className="font-bold text-white">Option 2: Call Up</h3>
                <p className="text-gray-400 text-sm">Picker can "call up" to the next highest Jack they don't have (J♥, J♠, or J♣).</p>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-3">
                <h3 className="font-bold text-white">Option 3: Unknown Partner</h3>
                <p className="text-gray-400 text-sm">Some groups play that the J♥ holder becomes partner instead.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison to Called Ace */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Jack of Diamonds vs Called Ace</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="py-3 text-gray-400">Aspect</th>
                  <th className="py-3 text-blue-400">Jack of Diamonds</th>
                  <th className="py-3 text-purple-400">Called Ace</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr className="border-b border-gray-800">
                  <td className="py-3">Partner chosen by</td>
                  <td className="py-3">Random (cards dealt)</td>
                  <td className="py-3">Picker's choice</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3">Picker control</td>
                  <td className="py-3">None</td>
                  <td className="py-3">Full control</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3">Partner reveal</td>
                  <td className="py-3">When J♦ played</td>
                  <td className="py-3">When called Ace played</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3">Forced reveal</td>
                  <td className="py-3">No - play J♦ anytime</td>
                  <td className="py-3">Yes - must play Ace when suit led</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3">Partner secrecy</td>
                  <td className="py-3">Longer (more control)</td>
                  <td className="py-3">Shorter (forced plays)</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3">Strategy depth</td>
                  <td className="py-3">Less (random element)</td>
                  <td className="py-3">More (calculated choice)</td>
                </tr>
                <tr>
                  <td className="py-3">Popular in</td>
                  <td className="py-3">Door County, rural WI</td>
                  <td className="py-3">Milwaukee, Madison</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Strategy */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Jack of Diamonds Strategy Tips</h2>
          <div className="bg-gray-800/50 rounded-xl p-6">
            <ul className="space-y-4 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-green-400 font-bold text-xl">✓</span>
                <div>
                  <strong className="text-white">As Partner: Hide your identity longer</strong>
                  <p className="text-sm text-gray-400">Since you're not forced to play the J♦ on any specific trick, you can stay hidden and help the picker subtly before revealing.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 font-bold text-xl">✓</span>
                <div>
                  <strong className="text-white">As Picker: Watch for helpful play</strong>
                  <p className="text-sm text-gray-400">Look for players who seem to be helping you - they might be your partner. Schmearing and favorable plays are tells.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 font-bold text-xl">✓</span>
                <div>
                  <strong className="text-white">As Defender: Track the J♦</strong>
                  <p className="text-sm text-gray-400">Once J♦ is played, teams are known. Until then, be cautious about who you schmear to.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-yellow-400 font-bold text-xl">!</span>
                <div>
                  <strong className="text-white">J♦ is valuable - don't waste it</strong>
                  <p className="text-sm text-gray-400">The J♦ is the 8th highest trump. Don't throw it away early just to reveal yourself - use it strategically to win tricks.</p>
                </div>
              </li>
            </ul>
          </div>
        </section>

        {/* Regional Note */}
        <section className="bg-blue-900/30 border border-blue-600 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-blue-400 mb-3">Regional Popularity</h2>
          <p className="text-gray-200 mb-4">
            The Jack of Diamonds variant is popular in <strong className="text-white">Door County</strong>, <strong className="text-white">Sturgeon Bay</strong>, and many rural Wisconsin communities.
          </p>
          <p className="text-gray-300">
            As one player put it: "Milwaukee Sheepshead, you call an ace for a partner. A lot of places around the state, you play jack of diamonds is the partner."
          </p>
          <p className="text-gray-400 text-sm mt-3">
            Neither method is "correct" - they're regional traditions. Always ask about house rules before playing!
          </p>
        </section>

        {/* Pros and Cons */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Pros and Cons</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-900/30 border border-green-600 rounded-lg p-4">
              <h3 className="font-bold text-green-300 mb-3">Advantages</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• Simpler - no calling decision</li>
                <li>• Partner can stay hidden longer</li>
                <li>• More suspense about teams</li>
                <li>• Faster gameplay (no call phase)</li>
                <li>• Random element adds variety</li>
              </ul>
            </div>
            <div className="bg-red-900/30 border border-red-600 rounded-lg p-4">
              <h3 className="font-bold text-red-300 mb-3">Disadvantages</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• Less strategic depth</li>
                <li>• Picker has no control over partner</li>
                <li>• Can get unlucky pairings</li>
                <li>• Partner might have weak hand</li>
                <li>• Going alone more common</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Related Links */}
        <section className="border-t border-gray-700 pt-8">
          <h2 className="text-lg font-bold text-gray-400 mb-4">Learn More</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/rules/called-ace" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
              <h3 className="font-bold text-white">Called Ace Rules →</h3>
              <p className="text-sm text-gray-400">The Milwaukee-style partner method</p>
            </Link>
            <Link href="/strategy/partner-selection" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
              <h3 className="font-bold text-white">Partner Selection Strategy →</h3>
              <p className="text-sm text-gray-400">How to choose which ace to call</p>
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
