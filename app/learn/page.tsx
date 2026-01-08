import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Learn Sheepshead - Beginner\'s Guide to the Card Game',
  description: 'New to Sheepshead? Start here! A beginner-friendly guide to learning Wisconsin\'s favorite card game. Step-by-step instructions and tips for new players.',
  keywords: ['learn Sheepshead', 'Sheepshead for beginners', 'how to play Sheepshead', 'card game tutorial', 'Sheepshead guide'],
  openGraph: {
    title: 'Learn Sheepshead - Beginner\'s Guide',
    description: 'New to Sheepshead? Start here with our beginner-friendly guide to Wisconsin\'s favorite card game.',
    type: 'article',
  },
};

function LessonCard({ number, title, description, time, href }: { number: number; title: string; description: string; time: string; href: string }) {
  return (
    <Link href={href} className="block bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800 transition-colors group">
      <div className="flex items-start gap-4">
        <span className="w-10 h-10 rounded-full bg-green-600 text-white font-bold flex items-center justify-center flex-shrink-0 group-hover:bg-green-500 transition-colors">
          {number}
        </span>
        <div className="flex-1">
          <h3 className="font-bold text-white text-lg mb-1 group-hover:text-green-300 transition-colors">{title}</h3>
          <p className="text-gray-400 text-sm mb-2">{description}</p>
          <span className="text-xs text-green-400">{time}</span>
        </div>
        <span className="text-gray-500 group-hover:text-green-400 transition-colors">→</span>
      </div>
    </Link>
  );
}

export default function LearnPage() {
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
            <Link href="/rules" className="text-gray-300 hover:text-white">Rules</Link>
            <Link href="/strategy" className="text-gray-300 hover:text-white">Strategy</Link>
            <Link href="/learn" className="text-green-400 font-medium">Learn</Link>
            <Link href="/" className="bg-green-600 hover:bg-green-500 px-3 py-1 rounded font-medium">Play</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="text-center mb-12">
          <span className="text-6xl mb-4 block">🎓</span>
          <h1 className="text-4xl font-bold mb-2">Learn Sheepshead</h1>
          <p className="text-xl text-green-300">
            New to the game? You're in the right place!
          </p>
        </div>

        {/* What is Sheepshead */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">What is Sheepshead?</h2>
          <div className="bg-gray-800/50 rounded-lg p-6">
            <p className="text-gray-300 mb-4">
              Sheepshead is a classic <strong className="text-white">trick-taking card game</strong> that originated
              in Germany and became wildly popular in Wisconsin. It's often called "the unofficial state card game
              of Wisconsin" and has been played in the Midwest for over 150 years.
            </p>
            <p className="text-gray-300 mb-4">
              The game is played with 5 players using a 32-card deck (7s through Aces). What makes Sheepshead
              unique is its <strong className="text-white">partner system</strong> - one player "picks" and secretly
              calls a partner, creating a 2-vs-3 dynamic where you might not know who's on your team!
            </p>
            <p className="text-gray-300">
              Don't worry if this sounds complicated - it's easier than it looks, and incredibly fun once you get the hang of it!
            </p>
          </div>
        </section>

        {/* Why Learn Sheepshead */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Why Learn Sheepshead?</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-purple-900/30 border border-purple-600 rounded-lg p-4 text-center">
              <span className="text-3xl block mb-2">🧠</span>
              <h3 className="font-bold text-purple-300 mb-2">Strategic Depth</h3>
              <p className="text-gray-400 text-sm">
                Every hand is a puzzle. Reading opponents, managing trump, and timing your plays keeps it endlessly interesting.
              </p>
            </div>
            <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4 text-center">
              <span className="text-3xl block mb-2">👥</span>
              <h3 className="font-bold text-blue-300 mb-2">Social Game</h3>
              <p className="text-gray-400 text-sm">
                Perfect for game nights! The secret partner mechanic creates great moments of surprise and teamwork.
              </p>
            </div>
            <div className="bg-green-900/30 border border-green-600 rounded-lg p-4 text-center">
              <span className="text-3xl block mb-2">🏆</span>
              <h3 className="font-bold text-green-300 mb-2">Easy to Learn</h3>
              <p className="text-gray-400 text-sm">
                Despite its depth, the basic rules are simple. You can start playing in 15 minutes!
              </p>
            </div>
          </div>
        </section>

        {/* Quick Start Guide */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Quick Start: The Essentials</h2>

          <div className="space-y-6">
            <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4">
              <h3 className="font-bold text-yellow-300 mb-3 text-lg">1. The Trump Cards</h3>
              <p className="text-gray-300 mb-3">
                The most important thing to learn is which cards are <strong>trump</strong> (the powerful cards that beat others):
              </p>
              <ul className="text-gray-300 space-y-1">
                <li>• <strong className="text-yellow-400">All Queens</strong> (highest trump)</li>
                <li>• <strong className="text-yellow-400">All Jacks</strong></li>
                <li>• <strong className="text-yellow-400">All Diamonds</strong> (lowest trump)</li>
              </ul>
              <p className="text-gray-400 text-sm mt-3">
                That's 14 trump cards total. Everything else (Clubs, Spades, Hearts without Q/J) are "fail" cards.
              </p>
            </div>

            <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4">
              <h3 className="font-bold text-blue-300 mb-3 text-lg">2. The Goal</h3>
              <p className="text-gray-300">
                Your team needs to collect <strong className="text-white">61 or more points</strong> from the cards you win.
                There are 120 points total in the deck. Aces are worth 11, Tens are worth 10, and so on.
              </p>
            </div>

            <div className="bg-green-900/30 border border-green-600 rounded-lg p-4">
              <h3 className="font-bold text-green-300 mb-3 text-lg">3. The Teams</h3>
              <p className="text-gray-300 mb-3">
                One player "picks" (takes the blind) and calls a partner by naming an Ace.
                It becomes <strong className="text-white">Picker + Partner vs 3 Defenders</strong>.
              </p>
              <p className="text-gray-400 text-sm">
                The twist? Nobody knows who the partner is until the called Ace is played!
              </p>
            </div>

            <div className="bg-purple-900/30 border border-purple-600 rounded-lg p-4">
              <h3 className="font-bold text-purple-300 mb-3 text-lg">4. Following Suit</h3>
              <p className="text-gray-300">
                When someone leads a card, you <strong className="text-white">must follow that suit</strong> if you can.
                If you can't follow, you can play anything. Highest trump wins, or highest card of the led suit if no trump.
              </p>
            </div>
          </div>
        </section>

        {/* Learning Path */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Your Learning Path</h2>
          <p className="text-gray-300 mb-6">
            We recommend learning in this order. Take your time with each step!
          </p>

          <div className="space-y-3">
            <LessonCard
              number={1}
              title="Learn the Card Rankings"
              description="Understand which cards are trump and their order. This is the foundation!"
              time="5 minutes"
              href="/rules/card-hierarchy"
            />
            <LessonCard
              number={2}
              title="Learn Point Values"
              description="Know how much each card is worth. This affects every decision you make."
              time="3 minutes"
              href="/rules/point-values"
            />
            <LessonCard
              number={3}
              title="Understand the Game Flow"
              description="Deal, pick, bury, call, play - learn the sequence of a hand."
              time="5 minutes"
              href="/rules"
            />
            <LessonCard
              number={4}
              title="Practice Following Suit"
              description="The rules for what you can play. This trips up beginners most often!"
              time="5 minutes"
              href="/rules/following-suit"
            />
            <LessonCard
              number={5}
              title="Play Your First Game"
              description="Jump in with AI opponents. Don't worry about strategy yet - just get the feel."
              time="15 minutes"
              href="/"
            />
            <LessonCard
              number={6}
              title="Learn Basic Strategy"
              description="Now that you know how to play, learn when to pick and how to play your role."
              time="10 minutes"
              href="/strategy"
            />
          </div>
        </section>

        {/* Common Beginner Mistakes */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Common Beginner Mistakes</h2>
          <div className="space-y-4">
            <div className="bg-red-900/30 border border-red-600 rounded-lg p-4">
              <h3 className="font-bold text-red-300 mb-2">Forgetting Queens/Jacks Are Trump</h3>
              <p className="text-gray-300 text-sm">
                If Clubs is led and you have Q♣ and 7♣, you must play the 7♣!
                The Queen is trump, not a club. This is the #1 mistake new players make.
              </p>
            </div>
            <div className="bg-red-900/30 border border-red-600 rounded-lg p-4">
              <h3 className="font-bold text-red-300 mb-2">Picking With Too Few Trump</h3>
              <p className="text-gray-300 text-sm">
                Don't pick just because you have an Ace or two. You need trump to control the game.
                As a beginner, aim for 5+ trump before picking.
              </p>
            </div>
            <div className="bg-red-900/30 border border-red-600 rounded-lg p-4">
              <h3 className="font-bold text-red-300 mb-2">Revealing Yourself as Partner Too Early</h3>
              <p className="text-gray-300 text-sm">
                If you're the secret partner, don't obviously help the picker in early tricks.
                Play normally until the right moment to reveal.
              </p>
            </div>
            <div className="bg-red-900/30 border border-red-600 rounded-lg p-4">
              <h3 className="font-bold text-red-300 mb-2">Throwing Points to the Wrong Team</h3>
              <p className="text-gray-300 text-sm">
                Before schmearing (throwing points), make sure you know who's winning the trick!
                Pay attention to who's on what team.
              </p>
            </div>
          </div>
        </section>

        {/* Tips for New Players */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Tips for New Players</h2>
          <div className="bg-green-900/30 border border-green-600 rounded-lg p-6">
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-green-400 font-bold">1.</span>
                <span><strong className="text-white">Enable coaching mode</strong> in the game. It will warn you before mistakes and explain what's happening.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 font-bold">2.</span>
                <span><strong className="text-white">Play at slow speed</strong> at first. You can speed up once you're comfortable.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 font-bold">3.</span>
                <span><strong className="text-white">Watch the AI explanations</strong>. Turn on "Show Opponent Explanations" in settings to learn why the AI made each decision.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 font-bold">4.</span>
                <span><strong className="text-white">Don't worry about losing!</strong> Everyone loses while learning. Focus on understanding why things happened.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 font-bold">5.</span>
                <span><strong className="text-white">Keep the rules reference handy</strong>. It's okay to check the card hierarchy while playing!</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Call to Action */}
        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-blue-800 to-blue-900 rounded-xl p-6 text-center">
            <span className="text-4xl block mb-3">📖</span>
            <h2 className="text-xl font-bold mb-2">Read the Full Rules</h2>
            <p className="text-blue-200 mb-4 text-sm">
              Detailed explanation of every rule and mechanic.
            </p>
            <Link
              href="/rules"
              className="inline-block bg-white text-blue-900 font-bold py-2 px-6 rounded-lg hover:bg-blue-100 transition-colors"
            >
              View Rules
            </Link>
          </div>

          <div className="bg-gradient-to-r from-green-800 to-green-900 rounded-xl p-6 text-center">
            <span className="text-4xl block mb-3">🎮</span>
            <h2 className="text-xl font-bold mb-2">Start Playing</h2>
            <p className="text-green-200 mb-4 text-sm">
              Jump in and learn by doing! AI coaching will help you.
            </p>
            <Link
              href="/"
              className="inline-block bg-white text-green-900 font-bold py-2 px-6 rounded-lg hover:bg-green-100 transition-colors"
            >
              Play Now
            </Link>
          </div>
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
