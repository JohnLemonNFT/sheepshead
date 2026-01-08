import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sheepshead Rules - Complete Guide to the Wisconsin Card Game',
  description: 'Learn the complete rules of Sheepshead, the classic Wisconsin trick-taking card game. Card hierarchy, point values, gameplay flow, following suit, and scoring explained.',
  keywords: ['Sheepshead rules', 'how to play Sheepshead', 'card game rules', 'Wisconsin card game', 'trick-taking game', 'Schafkopf rules'],
  openGraph: {
    title: 'Sheepshead Rules - Complete Guide',
    description: 'Master the rules of Sheepshead with our comprehensive guide covering card hierarchy, points, gameplay, and scoring.',
    type: 'article',
  },
};

// Card display component for visual examples
function Card({ rank, suit, highlight }: { rank: string; suit: string; highlight?: boolean }) {
  const isRed = suit === 'hearts' || suit === 'diamonds';
  const suitSymbol = { clubs: '\u2663', spades: '\u2660', hearts: '\u2665', diamonds: '\u2666' }[suit] || suit;

  return (
    <span className={`
      inline-flex items-center justify-center
      w-10 h-14 bg-white rounded shadow text-lg font-bold
      ${isRed ? 'text-red-600' : 'text-gray-800'}
      ${highlight ? 'ring-2 ring-yellow-400' : ''}
    `}>
      {rank}{suitSymbol}
    </span>
  );
}

export default function RulesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-950 text-white">
      {/* Header */}
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
        {/* Page Title */}
        <h1 className="text-4xl font-bold mb-2">Sheepshead Rules</h1>
        <p className="text-xl text-green-300 mb-8">
          The complete guide to Wisconsin's favorite card game
        </p>

        {/* Detailed Guides */}
        <section className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-600/50 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-bold text-yellow-400 mb-4">📚 Detailed Rule Guides</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Link href="/rules/card-hierarchy" className="bg-black/30 hover:bg-black/50 p-3 rounded-lg transition-colors">
              <h3 className="font-bold text-white">Card Hierarchy</h3>
              <p className="text-xs text-gray-400">Complete trump order explained</p>
            </Link>
            <Link href="/rules/point-values" className="bg-black/30 hover:bg-black/50 p-3 rounded-lg transition-colors">
              <h3 className="font-bold text-white">Point Values</h3>
              <p className="text-xs text-gray-400">How much each card is worth</p>
            </Link>
            <Link href="/rules/following-suit" className="bg-black/30 hover:bg-black/50 p-3 rounded-lg transition-colors">
              <h3 className="font-bold text-white">Following Suit</h3>
              <p className="text-xs text-gray-400">What you must play when</p>
            </Link>
            <Link href="/rules/scoring" className="bg-black/30 hover:bg-black/50 p-3 rounded-lg transition-colors">
              <h3 className="font-bold text-white">Scoring</h3>
              <p className="text-xs text-gray-400">How points become game score</p>
            </Link>
            <Link href="/rules/called-ace" className="bg-black/30 hover:bg-black/50 p-3 rounded-lg transition-colors">
              <h3 className="font-bold text-white">Called Ace Partner</h3>
              <p className="text-xs text-gray-400">The secret partner system</p>
            </Link>
            <Link href="/rules/leaster" className="bg-black/30 hover:bg-black/50 p-3 rounded-lg transition-colors">
              <h3 className="font-bold text-white">Leaster</h3>
              <p className="text-xs text-gray-400">When everyone passes</p>
            </Link>
            <Link href="/rules/blitz" className="bg-black/30 hover:bg-black/50 p-3 rounded-lg transition-colors">
              <h3 className="font-bold text-white">Blitz</h3>
              <p className="text-xs text-gray-400">Both black Queens variant</p>
            </Link>
            <Link href="/rules/cracking" className="bg-black/30 hover:bg-black/50 p-3 rounded-lg transition-colors">
              <h3 className="font-bold text-white">Cracking</h3>
              <p className="text-xs text-gray-400">Doubling the stakes</p>
            </Link>
            <Link href="/faq" className="bg-black/30 hover:bg-black/50 p-3 rounded-lg transition-colors">
              <h3 className="font-bold text-white">FAQ</h3>
              <p className="text-xs text-gray-400">Common questions answered</p>
            </Link>
          </div>
        </section>

        {/* Quick Navigation */}
        <nav className="bg-black/30 rounded-lg p-4 mb-8">
          <h2 className="text-sm font-medium text-gray-400 mb-2">Jump to section:</h2>
          <div className="flex flex-wrap gap-2">
            <a href="#hierarchy" className="px-3 py-1 bg-green-800 hover:bg-green-700 rounded text-sm">Card Hierarchy</a>
            <a href="#points" className="px-3 py-1 bg-green-800 hover:bg-green-700 rounded text-sm">Point Values</a>
            <a href="#gameplay" className="px-3 py-1 bg-green-800 hover:bg-green-700 rounded text-sm">Game Flow</a>
            <a href="#following" className="px-3 py-1 bg-green-800 hover:bg-green-700 rounded text-sm">Following Suit</a>
            <a href="#scoring" className="px-3 py-1 bg-green-800 hover:bg-green-700 rounded text-sm">Scoring</a>
            <a href="#variants" className="px-3 py-1 bg-green-800 hover:bg-green-700 rounded text-sm">Variants</a>
          </div>
        </nav>

        {/* Card Hierarchy Section */}
        <section id="hierarchy" className="mb-12 scroll-mt-8">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded bg-yellow-500 text-black flex items-center justify-center text-lg">1</span>
            Card Hierarchy
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-yellow-300 mb-3">Trump Cards (14 total)</h3>
              <p className="text-gray-300 mb-4">
                Trump cards always beat fail cards. In Sheepshead, all Queens and Jacks are trump, plus all Diamonds.
                This is the key concept that makes Sheepshead unique among card games.
              </p>

              <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4 space-y-4">
                <div>
                  <p className="text-sm text-yellow-300 mb-2 font-medium">Queens (highest trump):</p>
                  <div className="flex flex-wrap gap-2">
                    <Card rank="Q" suit="clubs" highlight />
                    <Card rank="Q" suit="spades" highlight />
                    <Card rank="Q" suit="hearts" highlight />
                    <Card rank="Q" suit="diamonds" highlight />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Order: Clubs &gt; Spades &gt; Hearts &gt; Diamonds</p>
                </div>

                <div>
                  <p className="text-sm text-yellow-300 mb-2 font-medium">Jacks:</p>
                  <div className="flex flex-wrap gap-2">
                    <Card rank="J" suit="clubs" highlight />
                    <Card rank="J" suit="spades" highlight />
                    <Card rank="J" suit="hearts" highlight />
                    <Card rank="J" suit="diamonds" highlight />
                  </div>
                </div>

                <div>
                  <p className="text-sm text-yellow-300 mb-2 font-medium">Diamonds (lowest trump):</p>
                  <div className="flex flex-wrap gap-2">
                    <Card rank="A" suit="diamonds" highlight />
                    <Card rank="10" suit="diamonds" highlight />
                    <Card rank="K" suit="diamonds" highlight />
                    <Card rank="9" suit="diamonds" highlight />
                    <Card rank="8" suit="diamonds" highlight />
                    <Card rank="7" suit="diamonds" highlight />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-300 mb-3">Fail Cards (6 per suit)</h3>
              <p className="text-gray-400 mb-4">
                Clubs, Spades, and Hearts (without Queens and Jacks) are "fail" suits. Each has 6 cards.
              </p>
              <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">Each fail suit (Ace highest, 7 lowest):</p>
                <div className="flex flex-wrap gap-2">
                  <Card rank="A" suit="clubs" />
                  <Card rank="10" suit="clubs" />
                  <Card rank="K" suit="clubs" />
                  <Card rank="9" suit="clubs" />
                  <Card rank="8" suit="clubs" />
                  <Card rank="7" suit="clubs" />
                </div>
              </div>
            </div>

            <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4">
              <h4 className="font-bold text-blue-300 mb-2">Key Points to Remember</h4>
              <ul className="text-gray-300 space-y-1">
                <li>• <strong>All Queens and Jacks are trump</strong>, regardless of their printed suit</li>
                <li>• Suit ranking: Clubs &gt; Spades &gt; Hearts &gt; Diamonds</li>
                <li>• Any trump card beats any fail card</li>
                <li>• The Q♣ (Queen of Clubs) is the highest card in the game</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Point Values Section */}
        <section id="points" className="mb-12 scroll-mt-8">
          <h2 className="text-2xl font-bold text-green-400 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded bg-green-500 text-white flex items-center justify-center text-lg">2</span>
            Point Values
          </h2>

          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-green-300 mb-4">Card Point Values</h3>
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="pb-2">Card</th>
                  <th className="pb-2 text-right">Points</th>
                  <th className="pb-2 text-right">Total (x4)</th>
                </tr>
              </thead>
              <tbody className="text-lg">
                <tr className="border-b border-gray-700">
                  <td className="py-3">Aces</td>
                  <td className="py-3 text-right font-bold text-yellow-400">11</td>
                  <td className="py-3 text-right text-gray-400">44</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-3">Tens</td>
                  <td className="py-3 text-right font-bold text-yellow-400">10</td>
                  <td className="py-3 text-right text-gray-400">40</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-3">Kings</td>
                  <td className="py-3 text-right font-bold text-blue-400">4</td>
                  <td className="py-3 text-right text-gray-400">16</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-3">Queens</td>
                  <td className="py-3 text-right font-bold text-blue-400">3</td>
                  <td className="py-3 text-right text-gray-400">12</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-3">Jacks</td>
                  <td className="py-3 text-right font-bold text-blue-400">2</td>
                  <td className="py-3 text-right text-gray-400">8</td>
                </tr>
                <tr>
                  <td className="py-3">9, 8, 7</td>
                  <td className="py-3 text-right font-bold text-gray-500">0</td>
                  <td className="py-3 text-right text-gray-400">0</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-600">
                  <td className="py-3 font-bold">Total</td>
                  <td></td>
                  <td className="py-3 text-right font-bold text-green-400">120</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-900/30 border border-green-600 rounded-lg p-4 text-center">
              <p className="text-4xl font-bold text-green-400">120</p>
              <p className="text-green-300">Total Points in Deck</p>
            </div>
            <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4 text-center">
              <p className="text-4xl font-bold text-yellow-400">61</p>
              <p className="text-yellow-300">Points Needed to Win</p>
            </div>
          </div>
        </section>

        {/* Gameplay Section */}
        <section id="gameplay" className="mb-12 scroll-mt-8">
          <h2 className="text-2xl font-bold text-blue-400 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded bg-blue-500 text-white flex items-center justify-center text-lg">3</span>
            Game Flow
          </h2>

          <p className="text-gray-300 mb-6">
            Sheepshead is played with 5 players using a 32-card deck (7s through Aces).
            Here's how a typical hand plays out:
          </p>

          <div className="space-y-4">
            <article className="flex gap-4 items-start bg-gray-800/50 rounded-lg p-4">
              <span className="w-10 h-10 rounded-full bg-yellow-500 text-black font-bold flex items-center justify-center flex-shrink-0 text-lg">1</span>
              <div>
                <h3 className="font-bold text-yellow-400 text-lg">Deal</h3>
                <p className="text-gray-300">
                  Each of the 5 players receives 6 cards. The remaining 2 cards go face-down to form the "blind."
                </p>
              </div>
            </article>

            <article className="flex gap-4 items-start bg-gray-800/50 rounded-lg p-4">
              <span className="w-10 h-10 rounded-full bg-yellow-500 text-black font-bold flex items-center justify-center flex-shrink-0 text-lg">2</span>
              <div>
                <h3 className="font-bold text-yellow-400 text-lg">Pick or Pass</h3>
                <p className="text-gray-300">
                  Starting left of the dealer, each player can "pick" (take the blind) or "pass."
                  The first player who picks becomes the <strong className="text-yellow-300">Picker</strong>.
                </p>
              </div>
            </article>

            <article className="flex gap-4 items-start bg-gray-800/50 rounded-lg p-4">
              <span className="w-10 h-10 rounded-full bg-yellow-500 text-black font-bold flex items-center justify-center flex-shrink-0 text-lg">3</span>
              <div>
                <h3 className="font-bold text-yellow-400 text-lg">Bury</h3>
                <p className="text-gray-300">
                  The Picker takes the 2 blind cards into their hand (now 8 cards), then "buries" 2 cards face-down.
                  These buried cards count toward the Picker's team points at the end.
                </p>
              </div>
            </article>

            <article className="flex gap-4 items-start bg-gray-800/50 rounded-lg p-4">
              <span className="w-10 h-10 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center flex-shrink-0 text-lg">4</span>
              <div>
                <h3 className="font-bold text-blue-400 text-lg">Call Partner</h3>
                <p className="text-gray-300">
                  The Picker calls a fail suit Ace (clubs, spades, or hearts). Whoever holds that Ace becomes their secret
                  <strong className="text-blue-300"> Partner</strong>. The partner's identity is revealed when the called Ace is played.
                </p>
              </div>
            </article>

            <article className="flex gap-4 items-start bg-gray-800/50 rounded-lg p-4">
              <span className="w-10 h-10 rounded-full bg-green-500 text-white font-bold flex items-center justify-center flex-shrink-0 text-lg">5</span>
              <div>
                <h3 className="font-bold text-green-400 text-lg">Play 6 Tricks</h3>
                <p className="text-gray-300">
                  Players take turns playing one card each. The highest trump wins the trick, or if no trump was played,
                  the highest card of the led suit wins. The winner of each trick leads the next one.
                </p>
              </div>
            </article>

            <article className="flex gap-4 items-start bg-gray-800/50 rounded-lg p-4">
              <span className="w-10 h-10 rounded-full bg-purple-500 text-white font-bold flex items-center justify-center flex-shrink-0 text-lg">6</span>
              <div>
                <h3 className="font-bold text-purple-400 text-lg">Score</h3>
                <p className="text-gray-300">
                  Count the points in each team's tricks. The Picker + Partner team needs <strong>61+ points</strong> to win.
                  The 3 Defenders need <strong>60+ points</strong> to defeat them.
                </p>
              </div>
            </article>
          </div>

          <div className="bg-red-900/30 border border-red-600 rounded-lg p-4 mt-6">
            <h4 className="font-bold text-red-300 mb-2">Leaster: When Nobody Picks</h4>
            <p className="text-gray-300">
              If all 5 players pass, a "Leaster" is played. Everyone plays for themselves, and the player
              who takes the <em>fewest</em> points wins!
            </p>
          </div>
        </section>

        {/* Following Suit Section */}
        <section id="following" className="mb-12 scroll-mt-8">
          <h2 className="text-2xl font-bold text-purple-400 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded bg-purple-500 text-white flex items-center justify-center text-lg">4</span>
            Following Suit
          </h2>

          <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-yellow-300 mb-2 text-lg">The Golden Rule</h3>
            <p className="text-xl text-white">
              You <strong>must</strong> follow the suit that was led if you can.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="font-bold text-green-300 mb-2">If Trump is Led...</h4>
              <p className="text-gray-300">
                You must play a trump card if you have one. Remember: Queens and Jacks are trump
                even though they show club/spade/heart symbols!
              </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="font-bold text-blue-300 mb-2">If a Fail Suit is Led...</h4>
              <p className="text-gray-300 mb-3">
                You must play that same fail suit if you have one. Queens and Jacks of that suit
                do <strong>NOT</strong> count as that suit - they're trump.
              </p>
              <div className="bg-gray-700 rounded p-3 text-sm">
                <strong>Example:</strong> If clubs is led and you have Q♣ and 7♣,
                you must play the 7♣ (the Queen is trump, not a club).
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="font-bold text-purple-300 mb-2">If You Can't Follow...</h4>
              <p className="text-gray-300">
                Play any card you want! You can trump to try to win, or "throw off" a card from another suit.
              </p>
            </div>
          </div>

          <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4 mt-6">
            <h4 className="font-bold text-blue-300 mb-2">Who Wins the Trick?</h4>
            <ul className="text-gray-300 space-y-2">
              <li>• If any trump was played: <strong>Highest trump wins</strong></li>
              <li>• If no trump was played: <strong>Highest card of the led suit wins</strong></li>
              <li>• Cards from other suits (not trump, not led) can never win</li>
            </ul>
          </div>
        </section>

        {/* Scoring Section */}
        <section id="scoring" className="mb-12 scroll-mt-8">
          <h2 className="text-2xl font-bold text-green-400 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded bg-green-500 text-white flex items-center justify-center text-lg">5</span>
            Scoring
          </h2>

          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <h3 className="text-xl font-bold text-green-300 mb-4">Standard Scoring</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="pb-2">Result</th>
                  <th className="pb-2 text-center">Picker</th>
                  <th className="pb-2 text-center">Partner</th>
                  <th className="pb-2 text-center">Defenders (each)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-700">
                  <td className="py-3 text-green-400 font-medium">Win (61+ points)</td>
                  <td className="py-3 text-center text-green-400 font-bold">+2</td>
                  <td className="py-3 text-center text-green-400 font-bold">+1</td>
                  <td className="py-3 text-center text-red-400 font-bold">-1</td>
                </tr>
                <tr>
                  <td className="py-3 text-red-400 font-medium">Lose (&lt;61 points)</td>
                  <td className="py-3 text-center text-red-400 font-bold">-2</td>
                  <td className="py-3 text-center text-red-400 font-bold">-1</td>
                  <td className="py-3 text-center text-green-400 font-bold">+1</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4">
              <h4 className="font-bold text-yellow-300 mb-2">Schneider (2x)</h4>
              <p className="text-gray-300">
                If the losing team gets <strong>less than 31 points</strong>, all scores are doubled!
              </p>
            </div>
            <div className="bg-red-900/30 border border-red-600 rounded-lg p-4">
              <h4 className="font-bold text-red-300 mb-2">Schwarz (3x)</h4>
              <p className="text-gray-300">
                If the losing team <strong>wins zero tricks</strong>, all scores are tripled!
              </p>
            </div>
          </div>

          <div className="bg-purple-900/30 border border-purple-600 rounded-lg p-4">
            <h4 className="font-bold text-purple-300 mb-2">Going Alone</h4>
            <p className="text-gray-300">
              If the Picker doesn't call a partner (goes alone), they take on all 4 opponents.
              The Picker receives (or loses) all the points - higher risk, higher reward!
            </p>
          </div>
        </section>

        {/* Variants Section */}
        <section id="variants" className="mb-12 scroll-mt-8">
          <h2 className="text-2xl font-bold text-red-400 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded bg-red-500 text-white flex items-center justify-center text-lg">6</span>
            Game Variants
          </h2>

          <p className="text-gray-300 mb-6">
            These optional rules add extra excitement and strategy to Sheepshead.
          </p>

          <div className="space-y-6">
            <article className="bg-red-900/30 border border-red-600 rounded-lg p-4">
              <h3 className="text-xl font-bold text-red-400 mb-3">Cracking (Doubling)</h3>
              <p className="text-gray-300 mb-3">
                After someone picks, any defender can <strong>"crack"</strong> to double the stakes!
              </p>
              <ul className="text-gray-300 space-y-2">
                <li><strong className="text-red-400">1.</strong> Any defender can crack after the picker is determined</li>
                <li><strong className="text-red-400">2.</strong> Cracking doubles all point values (2x multiplier)</li>
                <li><strong className="text-red-400">3.</strong> The picker can then <strong>re-crack</strong> to double again (4x)!</li>
              </ul>
            </article>

            <article className="bg-purple-900/30 border border-purple-600 rounded-lg p-4">
              <h3 className="text-xl font-bold text-purple-400 mb-3">Blitz (The Ma's)</h3>
              <p className="text-gray-300 mb-3">
                If the picker has <strong>both black Queens</strong> (Q♣ and Q♠), they can declare a <strong>Blitz</strong>!
              </p>
              <div className="flex gap-2 mb-3">
                <Card rank="Q" suit="clubs" highlight />
                <Card rank="Q" suit="spades" highlight />
                <span className="text-purple-400 font-bold self-center ml-2">= Blitz!</span>
              </div>
              <ul className="text-gray-300 space-y-1 text-sm">
                <li>• Blitz doubles the stakes (like a crack)</li>
                <li>• Requires cracking to be enabled</li>
                <li>• Called "The Ma's" because these queens are the two highest cards</li>
              </ul>
            </article>

            <article className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4">
              <h3 className="text-xl font-bold text-yellow-400 mb-3">Jack of Diamonds Partner</h3>
              <p className="text-gray-300 mb-3">
                Instead of calling an ace, the partner is automatically whoever has the <strong>Jack of Diamonds</strong>.
              </p>
              <div className="flex gap-2 mb-3">
                <Card rank="J" suit="diamonds" highlight />
                <span className="text-yellow-400 font-bold self-center ml-2">= Partner</span>
              </div>
              <ul className="text-gray-300 space-y-1 text-sm">
                <li>• Simpler than calling - no decision needed</li>
                <li>• Partner is revealed when J♦ is played</li>
                <li>• If the picker has J♦, they automatically go alone</li>
              </ul>
            </article>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-gradient-to-r from-green-800 to-green-900 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Play?</h2>
          <p className="text-green-200 mb-6">
            Practice against AI opponents and master the game!
          </p>
          <Link
            href="/"
            className="inline-block bg-white text-green-900 font-bold py-3 px-8 rounded-lg hover:bg-green-100 transition-colors text-lg"
          >
            Play Now
          </Link>
        </section>
      </main>

      {/* Footer */}
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
