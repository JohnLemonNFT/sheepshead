import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sheepshead History - From Bavaria to Wisconsin',
  description: 'Explore the rich history of Sheepshead. From its origins as Schafkopf in 1700s Bavaria to becoming Wisconsin\'s official card game.',
  keywords: ['Sheepshead history', 'Schafkopf history', 'German card game history', 'Wisconsin Sheepshead history'],
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
        <h1 className="text-4xl font-bold mb-4">Sheepshead History</h1>
        <p className="text-xl text-green-300 mb-8">
          300 years of tradition from Bavaria to Wisconsin
        </p>

        <div className="grid gap-4">
          <Link href="/history/milwaukee" className="bg-gray-800 hover:bg-gray-700 p-6 rounded-xl transition-colors">
            <h2 className="text-xl font-bold text-white mb-2">Milwaukee & Wisconsin →</h2>
            <p className="text-gray-400">How German immigrants made Sheepshead Wisconsin's official card game</p>
          </Link>
          <Link href="/learn/history" className="bg-gray-800 hover:bg-gray-700 p-6 rounded-xl transition-colors">
            <h2 className="text-xl font-bold text-white mb-2">Origins & Evolution →</h2>
            <p className="text-gray-400">From Schafkopf in Bavarian taverns to modern American Sheepshead</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
