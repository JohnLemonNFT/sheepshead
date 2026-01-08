import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sheepshead Strategy Guide - Tips for Winning',
  description: 'Master Sheepshead with expert strategy tips. Learn when to pick, how to bury cards, calling strategies, and how to play as picker, partner, or defender.',
  keywords: ['Sheepshead strategy', 'card game tips', 'how to win Sheepshead', 'picker strategy', 'defender tactics', 'schmear'],
  openGraph: {
    title: 'Sheepshead Strategy Guide',
    description: 'Expert tips and strategies for winning at Sheepshead. Master picking, burying, calling, and play strategies.',
    type: 'article',
  },
};

interface TipCardProps {
  title: string;
  children: React.ReactNode;
  type?: 'tip' | 'warning' | 'info';
}

function TipCard({ title, children, type = 'tip' }: TipCardProps) {
  const colors = {
    tip: 'bg-green-900/30 border-green-600',
    warning: 'bg-yellow-900/30 border-yellow-600',
    info: 'bg-blue-900/30 border-blue-600',
  };
  const titleColors = {
    tip: 'text-green-300',
    warning: 'text-yellow-300',
    info: 'text-blue-300',
  };

  return (
    <div className={`${colors[type]} border rounded-lg p-4 mb-4`}>
      <h4 className={`font-bold mb-2 ${titleColors[type]}`}>{title}</h4>
      <div className="text-gray-300">{children}</div>
    </div>
  );
}

export default function StrategyPage() {
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
            <Link href="/strategy" className="text-green-400 font-medium">Strategy</Link>
            <Link href="/learn" className="text-gray-300 hover:text-white">Learn</Link>
            <Link href="/" className="bg-green-600 hover:bg-green-500 px-3 py-1 rounded font-medium">Play</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Page Title */}
        <h1 className="text-4xl font-bold mb-2">Sheepshead Strategy</h1>
        <p className="text-xl text-green-300 mb-8">
          Tips and tactics to improve your game
        </p>

        {/* Detailed Strategy Guides */}
        <section className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-600/50 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-bold text-purple-400 mb-4">🧠 In-Depth Strategy Guides</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Link href="/strategy/when-to-pick" className="bg-black/30 hover:bg-black/50 p-3 rounded-lg transition-colors">
              <h3 className="font-bold text-white">When to Pick</h3>
              <p className="text-xs text-gray-400">Complete picking decision guide</p>
            </Link>
            <Link href="/strategy/what-to-bury" className="bg-black/30 hover:bg-black/50 p-3 rounded-lg transition-colors">
              <h3 className="font-bold text-white">What to Bury</h3>
              <p className="text-xs text-gray-400">Maximize your bury points</p>
            </Link>
            <Link href="/strategy/schmearing" className="bg-black/30 hover:bg-black/50 p-3 rounded-lg transition-colors">
              <h3 className="font-bold text-white">Schmearing</h3>
              <p className="text-xs text-gray-400">Throw points strategically</p>
            </Link>
            <Link href="/rules/called-ace" className="bg-black/30 hover:bg-black/50 p-3 rounded-lg transition-colors">
              <h3 className="font-bold text-white">Calling Partner</h3>
              <p className="text-xs text-gray-400">Which ace to call</p>
            </Link>
            <Link href="/faq" className="bg-black/30 hover:bg-black/50 p-3 rounded-lg transition-colors">
              <h3 className="font-bold text-white">FAQ</h3>
              <p className="text-xs text-gray-400">Common strategy questions</p>
            </Link>
          </div>
        </section>

        {/* Quick Navigation */}
        <nav className="bg-black/30 rounded-lg p-4 mb-8">
          <h2 className="text-sm font-medium text-gray-400 mb-2">Jump to section:</h2>
          <div className="flex flex-wrap gap-2">
            <a href="#picking" className="px-3 py-1 bg-green-800 hover:bg-green-700 rounded text-sm">When to Pick</a>
            <a href="#burying" className="px-3 py-1 bg-green-800 hover:bg-green-700 rounded text-sm">Burying</a>
            <a href="#calling" className="px-3 py-1 bg-green-800 hover:bg-green-700 rounded text-sm">Calling Partner</a>
            <a href="#picker" className="px-3 py-1 bg-green-800 hover:bg-green-700 rounded text-sm">As Picker</a>
            <a href="#partner" className="px-3 py-1 bg-green-800 hover:bg-green-700 rounded text-sm">As Partner</a>
            <a href="#defender" className="px-3 py-1 bg-green-800 hover:bg-green-700 rounded text-sm">As Defender</a>
          </div>
        </nav>

        {/* When to Pick Section */}
        <section id="picking" className="mb-12 scroll-mt-8">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center gap-3">
            <span className="text-3xl">🎯</span>
            When to Pick
          </h2>

          <p className="text-gray-300 mb-6">
            Deciding whether to pick is one of the most important decisions in Sheepshead.
            A good pick puts you in control; a bad pick can cost you dearly.
          </p>

          <TipCard title="Count Your Trump" type="tip">
            <p className="mb-3">A good rule of thumb:</p>
            <ul className="space-y-2">
              <li><strong className="text-green-400">6+ trump</strong> = Strong pick, go for it</li>
              <li><strong className="text-green-400">5 trump</strong> = Usually pickable with good supporting cards</li>
              <li><strong className="text-yellow-400">4 trump</strong> = Risky, need very strong trump or good position</li>
              <li><strong className="text-red-400">3 or fewer</strong> = Generally pass</li>
            </ul>
          </TipCard>

          <TipCard title="Quality Over Quantity" type="info">
            <p>
              Having Q♣ Q♠ J♣ J♠ (4 high trump) is often better than having
              6 low trump like J♦ A♦ 10♦ K♦ 9♦ 8♦.
              High trump lets you control the game and pull trump from opponents.
            </p>
          </TipCard>

          <TipCard title="Consider Your Position" type="info">
            <p className="mb-3">Position matters when deciding to pick:</p>
            <ul className="space-y-2">
              <li><strong>First seat</strong> (left of dealer): Need a stronger hand since everyone else gets a chance to pick</li>
              <li><strong>Later seats</strong>: Can pick slightly weaker hands since others have already passed</li>
              <li><strong>Last seat</strong>: If everyone passed, consider picking marginal hands to avoid a Leaster</li>
            </ul>
          </TipCard>

          <TipCard title="Look for Bury Potential" type="tip">
            <p>
              If you have fail Aces or 10s you could bury, that's extra points for your team!
              A hand with A♣ A♠ to bury is significantly stronger than one without.
            </p>
          </TipCard>

          <TipCard title="Void Suits Are Valuable" type="tip">
            <p>
              Having zero cards in a fail suit (a "void") is extremely valuable. You can trump in
              when that suit is led and potentially win big tricks full of points.
            </p>
          </TipCard>
        </section>

        {/* Burying Section */}
        <section id="burying" className="mb-12 scroll-mt-8">
          <h2 className="text-2xl font-bold text-blue-400 mb-4 flex items-center gap-3">
            <span className="text-3xl">📦</span>
            Burying Cards
          </h2>

          <p className="text-gray-300 mb-6">
            After picking, you'll have 8 cards and need to bury 2. Choose wisely - buried
            cards count toward your team's points at the end of the hand.
          </p>

          <TipCard title="Bury Points When Safe" type="tip">
            <p>
              Aces (11 points) and Tens (10 points) are high-value bury cards. If you have fail Aces or Tens
              you don't need for calling, consider burying them for guaranteed points.
            </p>
          </TipCard>

          <TipCard title="Create a Void" type="tip">
            <p>
              If you have only 1-2 cards of a fail suit, bury them to create a void.
              This lets you trump in when that suit is led - a very powerful position!
            </p>
          </TipCard>

          <TipCard title="Keep Your Hold Card!" type="warning">
            <p className="mb-2">
              <strong>Never bury the Ace you're planning to call!</strong>
            </p>
            <p>
              If you plan to call Hearts and have A♥, you must keep it - that's your
              "hold card." Burying it would mean calling yourself as partner (going alone).
            </p>
          </TipCard>

          <TipCard title="Don't Bury Trump" type="warning">
            <p>
              Unless absolutely necessary, avoid burying trump. Every trump in your
              hand is a potential trick winner. Even low trump like 7♦ can be
              useful for following suit when trump is led.
            </p>
          </TipCard>

          <TipCard title="Protect Your Tens" type="info">
            <p>
              Be careful burying an Ace if you still have the 10 of that suit.
              The 10 becomes vulnerable if that suit is led and someone plays the Ace.
            </p>
          </TipCard>
        </section>

        {/* Calling Partner Section */}
        <section id="calling" className="mb-12 scroll-mt-8">
          <h2 className="text-2xl font-bold text-purple-400 mb-4 flex items-center gap-3">
            <span className="text-3xl">🤝</span>
            Calling Partner
          </h2>

          <p className="text-gray-300 mb-6">
            Calling the right partner can make or break your hand. You want a partner
            in a position to help you, not one who's stuck.
          </p>

          <TipCard title="Call a Suit You're Void In" type="tip">
            <p>
              If you have no clubs, call clubs! When clubs is led, you can trump in.
              This also means your partner likely has length in clubs and can lead it
              to you safely.
            </p>
          </TipCard>

          <TipCard title="Protect Your Tens" type="tip">
            <p>
              If you have 10♠ but not A♠, consider calling spades.
              Your partner (who has A♠) will protect your 10 from being captured by opponents.
            </p>
          </TipCard>

          <TipCard title="Avoid Calling Your Strength" type="warning">
            <p>
              If you have A♣ K♣ 9♣, don't call clubs - you already
              control that suit! Call a suit where you actually need help.
            </p>
          </TipCard>

          <TipCard title="Consider Going Alone" type="info">
            <p className="mb-3">Go alone if:</p>
            <ul className="space-y-2">
              <li>• You have ALL the fail Aces (can't call anyone anyway)</li>
              <li>• You have 7+ strong trump and can dominate the hand</li>
              <li>• You've buried big points and want them all for yourself</li>
            </ul>
            <p className="mt-3">Going alone doubles your risk but also your reward!</p>
          </TipCard>
        </section>

        {/* Playing as Picker Section */}
        <section id="picker" className="mb-12 scroll-mt-8">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center gap-3">
            <span className="text-3xl">👑</span>
            Playing as Picker
          </h2>

          <p className="text-gray-300 mb-6">
            As picker, you're the captain of your team. Your goal: help your team capture 61+ points.
          </p>

          <TipCard title="Lead Trump Early" type="tip">
            <p>
              Leading trump pulls trump from defenders' hands. Once they're out of trump,
              your partner can safely schmear (throw points) to your winning tricks.
            </p>
          </TipCard>

          <TipCard title="Lead High Trump" type="tip">
            <p>
              Lead your Queens and high Jacks first. This forces defenders to either
              play their trump or give up the trick. Establish control early in the hand.
            </p>
          </TipCard>

          <TipCard title="Identify Your Partner" type="info">
            <p className="mb-3">Watch for these signs that someone is your partner:</p>
            <ul className="space-y-2">
              <li>• Player throws points (schmears) on your winning tricks</li>
              <li>• Player leads trump even though they're not the picker</li>
              <li>• Player avoids trumping your tricks</li>
              <li>• Player doesn't lead the called suit</li>
            </ul>
          </TipCard>

          <TipCard title="Protect the Called Ace" type="warning">
            <p>
              If a defender leads the called suit before your partner has played the Ace,
              your partner might be forced to reveal early. Try to win that trick if possible.
            </p>
          </TipCard>

          <TipCard title="Count Points" type="info">
            <p>
              Keep rough track of points throughout the hand. If you're ahead, play conservatively.
              If you're behind, take more risks to win point-heavy tricks.
            </p>
          </TipCard>
        </section>

        {/* Playing as Partner Section */}
        <section id="partner" className="mb-12 scroll-mt-8">
          <h2 className="text-2xl font-bold text-blue-400 mb-4 flex items-center gap-3">
            <span className="text-3xl">💙</span>
            Playing as Partner
          </h2>

          <p className="text-gray-300 mb-6">
            As the secret partner, your job is to support the picker while keeping
            your identity hidden as long as possible.
          </p>

          <TipCard title="Schmear to the Picker" type="tip">
            <p>
              When the picker wins a trick and you can't beat it, throw your highest
              point cards (Aces, Tens). This is called "schmearing" and adds points
              to your team's total.
            </p>
          </TipCard>

          <TipCard title="Stay Hidden" type="tip">
            <p className="mb-3">Don't reveal yourself too early by:</p>
            <ul className="space-y-2">
              <li>• Avoid leading trump (makes you look like partner)</li>
              <li>• Don't schmear obviously in early tricks</li>
              <li>• Play like a defender until the right moment</li>
            </ul>
          </TipCard>

          <TipCard title="When to Reveal" type="info">
            <p className="mb-3">Good times to play your called Ace:</p>
            <ul className="space-y-2">
              <li>• When you're forced to follow suit anyway</li>
              <li>• When you can win an important high-point trick</li>
              <li>• When revealing helps your team more than staying hidden</li>
            </ul>
          </TipCard>

          <TipCard title="Support Trump Leads" type="tip">
            <p>
              When the picker leads trump, play your lowest trump to follow suit.
              Save your high trump for later - let the picker do the heavy lifting early.
            </p>
          </TipCard>

          <TipCard title="Defend the Picker" type="warning">
            <p>
              If defenders are attacking the picker hard, consider revealing yourself
              to openly help. A revealed partner can directly support the picker.
            </p>
          </TipCard>
        </section>

        {/* Playing as Defender Section */}
        <section id="defender" className="mb-12 scroll-mt-8">
          <h2 className="text-2xl font-bold text-red-400 mb-4 flex items-center gap-3">
            <span className="text-3xl">🛡️</span>
            Playing as Defender
          </h2>

          <p className="text-gray-300 mb-6">
            As a defender, you and your 2 fellow defenders must work together to
            capture 60+ points. Communication through your play is key!
          </p>

          <TipCard title="Identify the Partner" type="tip">
            <p className="mb-3">Watch for these partner tells:</p>
            <ul className="space-y-2">
              <li>• Who schmears to the picker? (Likely partner)</li>
              <li>• Who leads trump as a non-picker? (Likely partner)</li>
              <li>• Who avoids leading the called suit? (Likely partner)</li>
            </ul>
          </TipCard>

          <TipCard title="Lead the Called Suit" type="tip">
            <p>
              If you have the called suit, lead it! This can flush out the partner
              early and let your team know who they are. Once revealed, you can
              target both the picker and partner more effectively.
            </p>
          </TipCard>

          <TipCard title="Trump the Picker's Fail Leads" type="tip">
            <p>
              If the picker leads a fail suit, consider trumping even if you don't
              have to. This prevents them from winning cheap tricks and forces them
              to spend their high trump.
            </p>
          </TipCard>

          <TipCard title="Schmear to Fellow Defenders" type="tip">
            <p>
              When another defender wins a trick, throw your points to them!
              This is especially important once you've identified who the partner is.
            </p>
          </TipCard>

          <TipCard title="Don't Help the Picker" type="warning">
            <p>
              Avoid throwing points on tricks the picker is winning. Even if you
              can't win the trick, play your lowest point cards to deny them points.
            </p>
          </TipCard>

          <TipCard title="Count to 60" type="info">
            <p>
              Remember: you only need 60 points to defeat the picker's team. Keep rough
              track of the score. Once you hit 60, you can play more defensively.
            </p>
          </TipCard>
        </section>

        {/* Call to Action */}
        <section className="bg-gradient-to-r from-green-800 to-green-900 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Put Your Strategy to the Test</h2>
          <p className="text-green-200 mb-6">
            Practice these strategies against AI opponents!
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
