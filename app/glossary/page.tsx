import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sheepshead Glossary - Card Game Terminology',
  description: 'Complete glossary of Sheepshead terms and terminology. Learn what picker, schmear, leaster, trump, fail, bury, and other Sheepshead words mean.',
  keywords: ['Sheepshead glossary', 'Sheepshead terms', 'card game terminology', 'picker', 'schmear', 'leaster', 'trump cards'],
  openGraph: {
    title: 'Sheepshead Glossary - Game Terminology',
    description: 'Complete glossary of Sheepshead terms. Learn the language of Wisconsin\'s favorite card game.',
    type: 'article',
  },
};

interface TermProps {
  term: string;
  definition: string;
  example?: string;
}

function Term({ term, definition, example }: TermProps) {
  return (
    <div className="border-b border-gray-700 pb-4 mb-4 last:border-0">
      <dt className="text-lg font-bold text-green-400 mb-1">{term}</dt>
      <dd className="text-gray-300 mb-2">{definition}</dd>
      {example && (
        <dd className="text-sm text-gray-500 italic">Example: {example}</dd>
      )}
    </div>
  );
}

export default function GlossaryPage() {
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
            <Link href="/learn" className="text-gray-300 hover:text-white">Learn</Link>
            <Link href="/" className="bg-green-600 hover:bg-green-500 px-3 py-1 rounded font-medium">Play</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Page Title */}
        <h1 className="text-4xl font-bold mb-2">Sheepshead Glossary</h1>
        <p className="text-xl text-green-300 mb-8">
          All the terms you need to know
        </p>

        {/* Quick Jump */}
        <nav className="bg-black/30 rounded-lg p-4 mb-8">
          <h2 className="text-sm font-medium text-gray-400 mb-2">Jump to:</h2>
          <div className="flex flex-wrap gap-2">
            {['A', 'B', 'C', 'D', 'F', 'G', 'H', 'L', 'M', 'P', 'R', 'S', 'T', 'V'].map((letter) => (
              <a
                key={letter}
                href={`#${letter}`}
                className="w-8 h-8 flex items-center justify-center bg-green-800 hover:bg-green-700 rounded text-sm font-bold"
              >
                {letter}
              </a>
            ))}
          </div>
        </nav>

        {/* Glossary Sections */}
        <div className="space-y-8">
          {/* A */}
          <section id="A">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4 border-b border-yellow-600 pb-2">A</h2>
            <dl>
              <Term
                term="Ace"
                definition="The highest-ranking card in each fail suit, worth 11 points. In Sheepshead, fail Aces (Clubs, Spades, Hearts) are often called as partners."
                example="If you call Clubs, whoever has the Ace of Clubs is your partner."
              />
            </dl>
          </section>

          {/* B */}
          <section id="B">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4 border-b border-yellow-600 pb-2">B</h2>
            <dl>
              <Term
                term="Blind"
                definition="The two face-down cards dealt in the center of the table. The player who 'picks' takes these cards into their hand."
              />
              <Term
                term="Blitz"
                definition="A variant where the picker can declare 'Blitz' if they hold both black Queens (Q♣ and Q♠). This doubles the stakes like a crack."
                example="Also called 'The Ma's' because the two black queens are the highest cards."
              />
              <Term
                term="Bury"
                definition="After picking up the blind, the picker must discard ('bury') 2 cards face-down. These count toward the picker's team's points."
                example="Good players bury point cards like Aces and Tens when safe."
              />
            </dl>
          </section>

          {/* C */}
          <section id="C">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4 border-b border-yellow-600 pb-2">C</h2>
            <dl>
              <Term
                term="Call"
                definition="When the picker names a fail suit Ace to designate their partner. The partner is the player holding that Ace."
                example="'I call Spades' means whoever has the Ace of Spades is the partner."
              />
              <Term
                term="Crack (Doubling)"
                definition="A variant where defenders can 'crack' to double the stakes after someone picks. The picker can then 're-crack' to double again."
              />
            </dl>
          </section>

          {/* D */}
          <section id="D">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4 border-b border-yellow-600 pb-2">D</h2>
            <dl>
              <Term
                term="Dealer"
                definition="The player who deals the cards. The deal rotates clockwise after each hand. The player to the dealer's left gets first chance to pick."
              />
              <Term
                term="Defender"
                definition="One of the three players opposing the picker and partner. Defenders work together to capture 60+ points."
              />
              <Term
                term="Diamonds"
                definition="The suit that forms the lower trump cards. All Diamonds (A♦ through 7♦) are trump, ranked below the Jacks."
              />
            </dl>
          </section>

          {/* F */}
          <section id="F">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4 border-b border-yellow-600 pb-2">F</h2>
            <dl>
              <Term
                term="Fail (Fail Suit)"
                definition="Any suit that is not trump. In Sheepshead, Clubs, Spades, and Hearts (without their Queens and Jacks) are fail suits."
                example="If you can't follow trump, you might have to play from a fail suit."
              />
              <Term
                term="Follow Suit"
                definition="The requirement to play a card of the same suit that was led, if you have one. Trump is considered its own suit."
              />
              <Term
                term="Forced Pick"
                definition="A variant where the dealer must pick if everyone else passes, preventing a Leaster."
              />
            </dl>
          </section>

          {/* G */}
          <section id="G">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4 border-b border-yellow-600 pb-2">G</h2>
            <dl>
              <Term
                term="Go Alone"
                definition="When the picker chooses not to call a partner and plays against all four opponents. The picker gets/loses all the points."
                example="With 7+ strong trump and buried Aces, going alone can be very profitable."
              />
            </dl>
          </section>

          {/* H */}
          <section id="H">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4 border-b border-yellow-600 pb-2">H</h2>
            <dl>
              <Term
                term="Hand"
                definition="A complete round of Sheepshead, from dealing through scoring. Also refers to the cards a player is holding."
              />
              <Term
                term="Hold Card"
                definition="The called Ace when you're the partner. You must keep this card (can't bury it) since it designates you as partner."
                example="If Hearts is called and you have A♥, that's your hold card."
              />
            </dl>
          </section>

          {/* L */}
          <section id="L">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4 border-b border-yellow-600 pb-2">L</h2>
            <dl>
              <Term
                term="Lead"
                definition="To play the first card of a trick. The player who won the previous trick (or the player left of dealer on the first trick) leads."
              />
              <Term
                term="Leaster"
                definition="A special hand played when all 5 players pass. Everyone plays for themselves, and the player who takes the FEWEST points wins."
                example="In a Leaster, you want to avoid winning point-heavy tricks!"
              />
            </dl>
          </section>

          {/* M */}
          <section id="M">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4 border-b border-yellow-600 pb-2">M</h2>
            <dl>
              <Term
                term="The Ma's"
                definition="Slang for the two black Queens (Q♣ and Q♠), the two highest cards in the game. Having 'The Ma's' lets you declare a Blitz."
              />
            </dl>
          </section>

          {/* P */}
          <section id="P">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4 border-b border-yellow-600 pb-2">P</h2>
            <dl>
              <Term
                term="Partner"
                definition="The player holding the called Ace who teams up with the picker. The partner's identity is secret until the called Ace is played."
              />
              <Term
                term="Pass"
                definition="To decline picking up the blind. If all players pass, a Leaster is played (or forced pick, depending on rules)."
              />
              <Term
                term="Pick"
                definition="To take the blind cards. The picker leads their team against the defenders and must choose what to bury and which Ace to call."
              />
              <Term
                term="Picker"
                definition="The player who took the blind. They're the 'captain' of their team and score double points (win or lose)."
              />
              <Term
                term="Points"
                definition="The scoring value of cards: Aces=11, Tens=10, Kings=4, Queens=3, Jacks=2, 9/8/7=0. Total in deck: 120."
              />
            </dl>
          </section>

          {/* R */}
          <section id="R">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4 border-b border-yellow-600 pb-2">R</h2>
            <dl>
              <Term
                term="Re-crack"
                definition="When the picker doubles the stakes again after a defender has cracked. Results in 4x the normal stakes."
              />
              <Term
                term="Reveal"
                definition="When the partner plays the called Ace, revealing their identity to all players."
                example="Once revealed, the partner can openly help the picker."
              />
            </dl>
          </section>

          {/* S */}
          <section id="S">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4 border-b border-yellow-600 pb-2">S</h2>
            <dl>
              <Term
                term="Schafkopf"
                definition="The German ancestor of Sheepshead. The name means 'sheep's head' in German."
              />
              <Term
                term="Schmear"
                definition="To throw high-point cards (Aces, Tens) on a trick your teammate is winning. Essential strategy for maximizing points."
                example="When the picker wins with a Queen, their partner should schmear their A♣ for +11 points."
              />
              <Term
                term="Schneider"
                definition="When the losing team scores fewer than 31 points. Doubles all scores for the hand."
              />
              <Term
                term="Schwarz"
                definition="When the losing team wins zero tricks. Triples all scores for the hand. Rare but devastating!"
              />
            </dl>
          </section>

          {/* T */}
          <section id="T">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4 border-b border-yellow-600 pb-2">T</h2>
            <dl>
              <Term
                term="Trick"
                definition="One round of play where each player contributes one card. There are 6 tricks in a hand. The highest card wins the trick."
              />
              <Term
                term="Trump"
                definition="The powerful suit that beats all fail cards. In Sheepshead: all Queens, all Jacks, and all Diamonds are trump (14 cards total)."
              />
              <Term
                term="Trump In"
                definition="To play a trump card when a fail suit was led (because you have none of that fail suit). A way to win tricks you otherwise couldn't."
              />
            </dl>
          </section>

          {/* V */}
          <section id="V">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4 border-b border-yellow-600 pb-2">V</h2>
            <dl>
              <Term
                term="Void"
                definition="Having no cards in a particular suit. Being void in a fail suit is valuable because you can trump in when it's led."
                example="'I'm void in clubs' means you have no clubs, so you can trump club leads."
              />
            </dl>
          </section>
        </div>

        {/* Call to Action */}
        <section className="bg-gradient-to-r from-green-800 to-green-900 rounded-xl p-8 text-center mt-12">
          <h2 className="text-2xl font-bold mb-4">Ready to Use These Terms?</h2>
          <p className="text-green-200 mb-6">
            Practice against AI and see these concepts in action!
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/rules"
              className="inline-block bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-500 transition-colors"
            >
              Read Rules
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
