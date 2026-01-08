import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sheepshead FAQ - Frequently Asked Questions About the Card Game',
  description: 'Answers to common Sheepshead questions. Why are Queens and Jacks trump? How many players? What is a Leaster? Get all your questions answered.',
  keywords: ['Sheepshead FAQ', 'Sheepshead questions', 'how to play Sheepshead', 'Sheepshead help'],
  openGraph: {
    title: 'Sheepshead FAQ - Your Questions Answered',
    description: 'Common questions about Sheepshead answered. Learn about trump, partners, scoring, and more.',
    type: 'article',
  },
};

function FAQItem({ question, answer, link }: { question: string; answer: string; link?: { href: string; text: string } }) {
  return (
    <div className="border-b border-gray-700 pb-6 mb-6 last:border-0">
      <h3 className="text-lg font-bold text-yellow-400 mb-3">{question}</h3>
      <p className="text-gray-300 mb-2">{answer}</p>
      {link && (
        <Link href={link.href} className="text-green-400 hover:text-green-300 text-sm font-medium">
          {link.text} →
        </Link>
      )}
    </div>
  );
}

export default function FAQPage() {
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
            <Link href="/learn" className="text-gray-300 hover:text-white">Learn</Link>
            <Link href="/" className="bg-green-600 hover:bg-green-500 px-3 py-1 rounded font-medium">Play</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
        <p className="text-xl text-green-300 mb-8">
          Everything you wanted to know about Sheepshead
        </p>

        {/* Basic Questions */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-yellow-400">📖</span> Basic Questions
          </h2>
          <div className="bg-gray-800/50 rounded-xl p-6">
            <FAQItem
              question="What is Sheepshead?"
              answer="Sheepshead is a trick-taking card game that originated in Germany and became hugely popular in Wisconsin and the American Midwest. It's played with 5 players using a 32-card deck (7s through Aces), featuring unique trump rules and a secret partner mechanic."
              link={{ href: "/learn", text: "Learn the basics" }}
            />
            <FAQItem
              question="How many players do you need?"
              answer="Traditional Sheepshead is played with 5 players. However, variants exist for 3, 4, and 6 players. The 5-player version with called Ace partner is considered the 'standard' game and is what most people mean when they say 'Sheepshead.'"
            />
            <FAQItem
              question="What cards do you use?"
              answer="Sheepshead uses a 32-card deck: 7, 8, 9, 10, Jack, Queen, King, and Ace of each suit. You can create this from a standard deck by removing 2s through 6s. Some stores sell dedicated Sheepshead decks."
            />
            <FAQItem
              question="Why is it called Sheepshead?"
              answer="The name comes from the German word 'Schafkopf' (sheep's head). The exact origin is debated - some say it refers to the pattern on old German cards, others to a practice of keeping score on a sheep's head-shaped board. The game is also called 'Schafskopf' in some regions."
            />
          </div>
        </section>

        {/* Trump Questions */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-yellow-400">👑</span> Trump & Card Questions
          </h2>
          <div className="bg-gray-800/50 rounded-xl p-6">
            <FAQItem
              question="Which cards are trump in Sheepshead?"
              answer="All 4 Queens, all 4 Jacks, and all 6 Diamonds are trump (14 cards total). The order from highest to lowest is: Q♣ > Q♠ > Q♥ > Q♦ > J♣ > J♠ > J♥ > J♦ > A♦ > 10♦ > K♦ > 9♦ > 8♦ > 7♦."
              link={{ href: "/rules/card-hierarchy", text: "See the full card hierarchy" }}
            />
            <FAQItem
              question="Why are Queens and Jacks trump?"
              answer="This comes from the German Schafkopf tradition where 'Ober' (Queens) and 'Unter' (Jacks) are the permanent high trumps. It's what makes Sheepshead unique among card games - you always know which 8 cards are the highest trump, regardless of what's led."
            />
            <FAQItem
              question="If I have Q♣ and 7♣, and clubs is led, what do I play?"
              answer="You must play the 7♣! The Queen of Clubs is trump, not a club. This trips up many beginners. When clubs is led, only your actual club cards (A, 10, K, 9, 8, 7 of clubs) can follow suit - Queens and Jacks are never part of their original suit."
              link={{ href: "/rules/following-suit", text: "Learn about following suit" }}
            />
            <FAQItem
              question="How much is each card worth?"
              answer="Aces = 11 points, Tens = 10, Kings = 4, Queens = 3, Jacks = 2, and 9/8/7 = 0. The total in the deck is 120 points. Your team needs 61 points to win."
              link={{ href: "/rules/point-values", text: "See the point values table" }}
            />
          </div>
        </section>

        {/* Gameplay Questions */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-yellow-400">🎮</span> Gameplay Questions
          </h2>
          <div className="bg-gray-800/50 rounded-xl p-6">
            <FAQItem
              question="What does it mean to 'pick'?"
              answer="To 'pick' means to take the two face-down blind cards, adding them to your hand. The picker then buries (discards) two cards and calls a partner by naming a fail suit Ace. The picker leads their team against the three defenders."
            />
            <FAQItem
              question="How does the partner system work?"
              answer="After picking, you call a fail suit (Clubs, Spades, or Hearts). Whoever holds that Ace becomes your secret partner. They don't reveal themselves until they play the called Ace - creating suspense and strategic deduction!"
              link={{ href: "/rules/called-ace", text: "Learn about calling a partner" }}
            />
            <FAQItem
              question="What is a Leaster?"
              answer="A Leaster happens when all 5 players pass (nobody picks). Everyone plays for themselves, and the player who captures the FEWEST points wins. The blind goes to whoever wins the last trick."
              link={{ href: "/rules/leaster", text: "Learn about Leasters" }}
            />
            <FAQItem
              question="What does 'schmear' mean?"
              answer="To 'schmear' (or 'smear') means to throw high-point cards (Aces, Tens) onto a trick your teammate is winning. It's a key strategy for maximizing points when your team controls a trick."
              link={{ href: "/strategy/schmearing", text: "Learn schmearing strategy" }}
            />
            <FAQItem
              question="What is the 'bury'?"
              answer="After picking up the blind, you must discard 2 cards face-down. These 'buried' cards count toward your team's points at the end. Smart players bury Aces and Tens (worth 21 points together!) when safe."
              link={{ href: "/strategy/what-to-bury", text: "Learn what to bury" }}
            />
          </div>
        </section>

        {/* Variant Questions */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-yellow-400">⚡</span> Variants & Options
          </h2>
          <div className="bg-gray-800/50 rounded-xl p-6">
            <FAQItem
              question="What is 'Cracking'?"
              answer="Cracking is an optional variant where defenders can 'crack' (double the stakes) after someone picks. The picker can then 're-crack' to double again. It adds a poker-like betting element to the game."
              link={{ href: "/rules/cracking", text: "Learn cracking rules" }}
            />
            <FAQItem
              question="What is 'Blitz' or 'The Ma's'?"
              answer="Blitz is a variant where holding both black Queens (Q♣ and Q♠, called 'The Ma's') lets you double the stakes. Since these are the two highest cards, it rewards having ultimate trump power."
              link={{ href: "/rules/blitz", text: "Learn blitz rules" }}
            />
            <FAQItem
              question="What is 'Forced Pick'?"
              answer="In Forced Pick, if everyone passes, the dealer must pick regardless of their hand. This prevents Leasters and ensures every hand has a picker. It's a common house rule variation."
            />
            <FAQItem
              question="What is 'Schneider'?"
              answer="Schneider means the losing team got less than 31 points (less than 30 for defenders). It typically doubles the score for the hand - a significant penalty for getting crushed."
            />
          </div>
        </section>

        {/* Strategy Questions */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-yellow-400">🧠</span> Strategy Questions
          </h2>
          <div className="bg-gray-800/50 rounded-xl p-6">
            <FAQItem
              question="When should I pick?"
              answer="Generally, pick with 4+ trump and a way to score points (either through the bury or tricks). Position matters too - you can pick lighter hands in late position. Avoid picking on Aces alone - you need trump to control the game."
              link={{ href: "/strategy/when-to-pick", text: "Full picking strategy guide" }}
            />
            <FAQItem
              question="How do I know who the partner is?"
              answer="Watch for clues! The partner often: schmears to the picker's tricks, avoids leading the called suit, plays supportively. They're revealed for certain when they play the called Ace. Good players track these signals."
            />
            <FAQItem
              question="Should I lead trump or fail?"
              answer="As the picker, usually lead trump to pull out defenders' trump cards. As a defender, consider leading fail suits to force the picker to use trump. Leading the called suit can help find or pressure the partner."
            />
            <FAQItem
              question="What's the best Ace to call?"
              answer="Call a suit where you're void (have no cards) or have only small cards. This way you can trump in when that suit is led. Avoid calling a suit where you have the Ace yourself - you want the partner to have it!"
            />
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-gradient-to-r from-green-800 to-green-900 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Play?</h2>
          <p className="text-green-200 mb-6">
            Practice against AI opponents and put your knowledge to the test!
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/learn"
              className="inline-block bg-white/10 border border-white/30 text-white font-bold py-2 px-6 rounded-lg hover:bg-white/20 transition-colors"
            >
              More Learning Resources
            </Link>
            <Link
              href="/"
              className="inline-block bg-white text-green-900 font-bold py-2 px-6 rounded-lg hover:bg-green-100 transition-colors"
            >
              Play Now
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
