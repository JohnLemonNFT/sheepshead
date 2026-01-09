import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'History of Sheepshead - Wisconsin\'s Card Game Origins',
  description: 'Discover the history of Sheepshead, from its German origins as Schafkopf to becoming Wisconsin\'s unofficial state card game. Learn how German immigrants brought this beloved game to Milwaukee.',
  keywords: ['Sheepshead history', 'Schafkopf origin', 'Wisconsin card game', 'Milwaukee Sheepshead', 'German card game history', 'Sheepshead origin'],
  openGraph: {
    title: 'History of Sheepshead - From Bavaria to Wisconsin',
    description: 'How German immigrants brought Schafkopf to America, where it became Sheepshead - Wisconsin\'s beloved card game.',
    type: 'article',
  },
};

export default function HistoryPage() {
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
            <Link href="/strategy" className="text-gray-300 hover:text-white">Strategy</Link>
            <Link href="/learn" className="text-green-400 font-medium">Learn</Link>
            <Link href="/" className="bg-green-600 hover:bg-green-500 px-3 py-1 rounded font-medium">Play</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <nav className="text-sm text-gray-400 mb-4">
          <Link href="/learn" className="hover:text-white">Learn</Link>
          <span className="mx-2">→</span>
          <span className="text-white">History</span>
        </nav>

        <h1 className="text-4xl font-bold mb-4">The History of Sheepshead</h1>
        <p className="text-xl text-green-300 mb-8">
          From Bavarian taverns to Wisconsin game nights - how Schafkopf became Sheepshead
        </p>

        {/* Origin Story */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">German Origins: Schafkopf</h2>
          <div className="bg-gray-800/50 rounded-xl p-6">
            <p className="text-gray-300 mb-4">
              Sheepshead began as <strong className="text-white">Schafkopf</strong> (literally "sheep's head") in Bavaria, Germany during the late 18th century. But why such an odd name?
            </p>
            <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4 mb-4">
              <h3 className="font-bold text-blue-300 mb-2">The Name Mystery</h3>
              <p className="text-gray-300">
                The German word "Schaf" can mean "sheep," but it also refers to the flat end of a barrel. Players would traditionally sit around a barrel head (Schafkopf) to play cards. When the game came to America, the name was literally translated to "Sheepshead."
              </p>
            </div>
            <p className="text-gray-300">
              Schafkopf was primarily a <strong className="text-white">"poor person's game"</strong> - a pub pastime for working-class Germans. It was simpler than the complex bidding games of the aristocracy, yet offered rich strategic depth.
            </p>
          </div>
        </section>

        {/* Journey to America */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Crossing the Atlantic</h2>
          <div className="space-y-4">
            <div className="bg-purple-900/30 border border-purple-600 rounded-lg p-4">
              <h3 className="font-bold text-purple-300 mb-2">The Great Migration (1840s-1880s)</h3>
              <p className="text-gray-300">
                In the mid-19th century, millions of Germans immigrated to America, many settling in the Upper Midwest. They brought their culture, their beer, and their card games - including Schafkopf.
              </p>
            </div>
            <div className="bg-green-900/30 border border-green-600 rounded-lg p-4">
              <h3 className="font-bold text-green-300 mb-2">Milwaukee: The German Heart of America</h3>
              <p className="text-gray-300">
                By 1880, <strong className="text-white">27% of Milwaukee's population</strong> was German-born. The city became a stronghold of German-American culture - and Sheepshead became part of its identity.
              </p>
            </div>
            <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4">
              <h3 className="font-bold text-yellow-300 mb-2">Beer Halls and Card Tables</h3>
              <p className="text-gray-300">
                Milwaukee's famous Deutscher Club and countless neighborhood taverns hosted regular Sheepshead games. It became a social ritual - as important as the beer itself.
              </p>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Sheepshead Timeline</h2>
          <div className="bg-gray-800/50 rounded-xl p-6">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-20 text-green-400 font-bold">1780s</div>
                <div className="text-gray-300">Schafkopf emerges in Bavaria, Germany</div>
              </div>
              <div className="flex gap-4">
                <div className="w-20 text-green-400 font-bold">1840s</div>
                <div className="text-gray-300">German immigration to Wisconsin begins</div>
              </div>
              <div className="flex gap-4">
                <div className="w-20 text-green-400 font-bold">1850s</div>
                <div className="text-gray-300">Game adapts to American playing cards (32-card deck)</div>
              </div>
              <div className="flex gap-4">
                <div className="w-20 text-green-400 font-bold">1880s</div>
                <div className="text-gray-300">Sheepshead firmly established in Wisconsin culture</div>
              </div>
              <div className="flex gap-4">
                <div className="w-20 text-green-400 font-bold">1900s</div>
                <div className="text-gray-300">Regional variants develop (Called Ace, Jack of Diamonds)</div>
              </div>
              <div className="flex gap-4">
                <div className="w-20 text-green-400 font-bold">1983</div>
                <div className="text-gray-300 font-bold">Declared official card game of Milwaukee!</div>
              </div>
              <div className="flex gap-4">
                <div className="w-20 text-green-400 font-bold">Today</div>
                <div className="text-gray-300">Still thriving in Wisconsin, spreading via digital play</div>
              </div>
            </div>
          </div>
        </section>

        {/* Milwaukee Official Game */}
        <section className="bg-yellow-900/30 border border-yellow-600 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-yellow-400 mb-3">Milwaukee's Official Card Game</h2>
          <p className="text-gray-200 mb-4">
            In <strong className="text-white">1983</strong>, the city of Milwaukee officially declared Sheepshead its official card game - the only major American city to officially recognize a card game!
          </p>
          <p className="text-gray-300">
            This wasn't just ceremonial. It reflected the game's deep roots in the city's German-American heritage and its continued importance as a social tradition.
          </p>
        </section>

        {/* Regional Differences */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">How Sheepshead Evolved in America</h2>
          <div className="bg-gray-800/50 rounded-xl p-6">
            <p className="text-gray-300 mb-4">
              As Sheepshead spread through Wisconsin, different communities developed their own house rules and traditions:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h3 className="font-bold text-white mb-2">Milwaukee Style</h3>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Called Ace partner</li>
                  <li>• Leasters when no one picks</li>
                  <li>• Cracking allowed</li>
                </ul>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h3 className="font-bold text-white mb-2">Door County Style</h3>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Jack of Diamonds partner</li>
                  <li>• "Call up" when you have J♦</li>
                  <li>• Different scoring</li>
                </ul>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h3 className="font-bold text-white mb-2">Dubois County (Indiana)</h3>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• 4-player variant</li>
                  <li>• Different deal structure</li>
                  <li>• Unique to German enclave</li>
                </ul>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h3 className="font-bold text-white mb-2">Modern Online</h3>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Milwaukee rules standard</li>
                  <li>• AI opponents available</li>
                  <li>• Global player pool</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Cultural Impact */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Cultural Significance</h2>
          <div className="space-y-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-gray-300">
                <strong className="text-white">"Anyone who knows how to play sheepshead prefers it to Euchre. If you think Sheepshead is similar to Euchre, think of it like chess is similar to checkers."</strong>
              </p>
              <p className="text-gray-400 text-sm mt-2">- Wisconsin Sheepshead player</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-gray-300">
                Sheepshead isn't just a game in Wisconsin - it's a <strong className="text-white">cultural identifier</strong>. Knowing how to play marks you as a local. Teaching someone to play passes down tradition. Tournaments bring communities together.
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-gray-300">
                The game has survived where many other immigrant traditions faded. While few Wisconsin residents still speak German, <strong className="text-white">Sheepshead endures</strong> - played at family gatherings, in VFW halls, and now online.
              </p>
            </div>
          </div>
        </section>

        {/* Schafkopf vs Sheepshead */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Schafkopf vs American Sheepshead</h2>
          <div className="bg-gray-800/50 rounded-xl p-6">
            <p className="text-gray-300 mb-4">
              While they share origins, the games have diverged:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="py-3 text-gray-400">Aspect</th>
                    <th className="py-3 text-blue-400">German Schafkopf</th>
                    <th className="py-3 text-green-400">American Sheepshead</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300 text-sm">
                  <tr className="border-b border-gray-800">
                    <td className="py-3">Deck</td>
                    <td className="py-3">Bavarian pattern (32 cards)</td>
                    <td className="py-3">French/American (32 cards)</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-3">Players</td>
                    <td className="py-3">Usually 4</td>
                    <td className="py-3">Usually 5</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-3">Trump suit</td>
                    <td className="py-3">Can vary by game type</td>
                    <td className="py-3">Always Q, J, Diamonds</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-3">Complexity</td>
                    <td className="py-3">Multiple game modes</td>
                    <td className="py-3">Simplified, standardized</td>
                  </tr>
                  <tr>
                    <td className="py-3">Where played</td>
                    <td className="py-3">Bavaria, Germany</td>
                    <td className="py-3">Wisconsin, Upper Midwest</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* The Future */}
        <section className="bg-green-900/30 border border-green-600 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-green-400 mb-3">Sheepshead Today and Tomorrow</h2>
          <p className="text-gray-200 mb-4">
            While Sheepshead's heartland remains Wisconsin, digital platforms are introducing the game to new players worldwide. Online play has standardized rules while preserving the strategic depth that made the game beloved.
          </p>
          <p className="text-gray-300">
            Annual tournaments, teaching programs, and online communities are ensuring that this 200+ year old tradition continues for generations to come.
          </p>
        </section>

        {/* Related Links */}
        <section className="border-t border-gray-700 pt-8">
          <h2 className="text-lg font-bold text-gray-400 mb-4">Learn More</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/learn" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
              <h3 className="font-bold text-white">How to Play →</h3>
              <p className="text-sm text-gray-400">Start learning Sheepshead today</p>
            </Link>
            <Link href="/learn/sheepshead-vs-euchre" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
              <h3 className="font-bold text-white">Sheepshead vs Euchre →</h3>
              <p className="text-sm text-gray-400">Compare two Midwest favorites</p>
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
