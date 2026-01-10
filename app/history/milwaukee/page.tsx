import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Milwaukee Sheepshead - History of Wisconsin\'s Card Game',
  description: 'Discover how Sheepshead became Milwaukee\'s official card game. German immigrants brought Schafkopf in the 1840s, and it became a Wisconsin tradition.',
  keywords: ['Milwaukee Sheepshead', 'Wisconsin Sheepshead', 'Sheepshead history', 'German card game Wisconsin', 'Schafkopf Milwaukee'],
  openGraph: {
    title: 'Milwaukee Sheepshead - A Wisconsin Tradition',
    description: 'How German immigrants made Sheepshead Milwaukee\'s official card game.',
    type: 'article',
  },
};

export default function MilwaukeeHistoryPage() {
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
          <span className="text-white">Milwaukee History</span>
        </nav>

        <h1 className="text-4xl font-bold mb-4">Sheepshead in Milwaukee</h1>
        <p className="text-xl text-green-300 mb-8">
          How a Bavarian card game became Wisconsin's favorite pastime
        </p>

        {/* Official Status */}
        <section className="bg-yellow-900/30 border border-yellow-600 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-yellow-400 mb-3">Milwaukee's Official Card Game</h2>
          <p className="text-gray-200 text-lg">
            In <strong className="text-yellow-300">1983</strong>, Milwaukee officially declared Sheepshead the city's official card game -
            a recognition of its deep cultural roots in Wisconsin's German-American community.
          </p>
        </section>

        {/* Timeline */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">The Journey to Wisconsin</h2>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="text-yellow-400 font-bold w-20 flex-shrink-0">1700s</div>
              <div className="bg-gray-800/50 border-l-4 border-yellow-600 pl-4 py-2">
                <h3 className="font-bold text-lg">Born in Bavaria</h3>
                <p className="text-gray-300">Schafkopf ("sheep's head") develops in southern Germany. Played in taverns and homes across Bavaria.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-yellow-400 font-bold w-20 flex-shrink-0">1840s</div>
              <div className="bg-gray-800/50 border-l-4 border-blue-600 pl-4 py-2">
                <h3 className="font-bold text-lg">German Immigration Wave</h3>
                <p className="text-gray-300">Political upheaval and failed revolutions drive German immigration to America. Many settle in Wisconsin.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-yellow-400 font-bold w-20 flex-shrink-0">1880</div>
              <div className="bg-gray-800/50 border-l-4 border-purple-600 pl-4 py-2">
                <h3 className="font-bold text-lg">Peak German Milwaukee</h3>
                <p className="text-gray-300"><strong>27% of Milwaukee</strong> is German-born. German is spoken in homes, schools, and businesses. Sheepshead is everywhere.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-yellow-400 font-bold w-20 flex-shrink-0">1900s</div>
              <div className="bg-gray-800/50 border-l-4 border-green-600 pl-4 py-2">
                <h3 className="font-bold text-lg">Americanization</h3>
                <p className="text-gray-300">"Schafkopf" becomes "Sheepshead." The game evolves with American variations while keeping its German soul.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-yellow-400 font-bold w-20 flex-shrink-0">1983</div>
              <div className="bg-gray-800/50 border-l-4 border-yellow-400 pl-4 py-2">
                <h3 className="font-bold text-lg">Official Recognition</h3>
                <p className="text-gray-300">Milwaukee declares Sheepshead the official city card game. A nod to its German heritage.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-yellow-400 font-bold w-20 flex-shrink-0">Today</div>
              <div className="bg-gray-800/50 border-l-4 border-green-400 pl-4 py-2">
                <h3 className="font-bold text-lg">Living Tradition</h3>
                <p className="text-gray-300">Sheepshead remains beloved in Wisconsin. Played at family gatherings, taverns, and now online.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Wisconsin */}
        <section className="bg-blue-900/30 border border-blue-600 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-blue-400 mb-4">Why Wisconsin?</h2>
          <div className="space-y-3 text-gray-200">
            <p>Wisconsin attracted German immigrants for several reasons:</p>
            <ul className="space-y-2 ml-4">
              <li>• <strong className="text-blue-300">Familiar climate</strong> - Similar to southern Germany</li>
              <li>• <strong className="text-blue-300">Brewing industry</strong> - Milwaukee became America's brewing capital</li>
              <li>• <strong className="text-blue-300">Established communities</strong> - Germans attracted more Germans</li>
              <li>• <strong className="text-blue-300">Land availability</strong> - Farmland for families seeking opportunity</li>
            </ul>
            <p className="mt-4 text-gray-300">
              By 1900, Milwaukee had more German-language newspapers than English ones.
              Sheepshead was as common as baseball.
            </p>
          </div>
        </section>

        {/* German Terminology */}
        <section className="bg-purple-900/30 border border-purple-600 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-purple-400 mb-4">German Words That Stuck</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="font-bold text-purple-300">Schmear</h3>
              <p className="text-gray-400 text-sm">From "schmieren" (to grease) - adding points to your partner's trick</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="font-bold text-purple-300">Schneider</h3>
              <p className="text-gray-400 text-sm">Means "tailor" - losing by 30+ points (cut short!)</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="font-bold text-purple-300">Schwarz</h3>
              <p className="text-gray-400 text-sm">Means "black" - losing every trick (total darkness)</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="font-bold text-purple-300">Mauer</h3>
              <p className="text-gray-400 text-sm">Means "wall" - refusing to pick (building a wall)</p>
            </div>
          </div>
        </section>

        {/* Where to Play */}
        <section className="bg-green-900/30 border border-green-600 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-green-400 mb-4">Keeping the Tradition Alive</h2>
          <p className="text-gray-200 mb-4">
            Today, Sheepshead lives on at family gatherings, Wisconsin taverns, and online.
            Many Wisconsinites learn the game from grandparents who learned from their grandparents.
          </p>
          <Link href="/" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg font-medium transition-colors">
            <span>Play Sheepshead Online</span>
            <span>→</span>
          </Link>
        </section>

        {/* Related Links */}
        <section className="border-t border-gray-700 pt-8">
          <h2 className="text-lg font-bold text-gray-400 mb-4">Learn More</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/learn/history" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
              <h3 className="font-bold text-white">Full History →</h3>
              <p className="text-sm text-gray-400">Complete history of Sheepshead</p>
            </Link>
            <Link href="/glossary" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
              <h3 className="font-bold text-white">Glossary →</h3>
              <p className="text-sm text-gray-400">Sheepshead terminology explained</p>
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
