// Strategy Modal - Tips and strategy guide

import { useState } from 'react';
import { useGameStore } from '../store/gameStore';

type StrategyTab = 'picking' | 'burying' | 'calling' | 'picker' | 'partner' | 'defender';

const TABS: { id: StrategyTab; label: string; icon: string }[] = [
  { id: 'picking', label: 'When to Pick', icon: '&#x1F3AF;' },
  { id: 'burying', label: 'Burying', icon: '&#x1F4E6;' },
  { id: 'calling', label: 'Calling Partner', icon: '&#x1F91D;' },
  { id: 'picker', label: 'As Picker', icon: '&#x1F451;' },
  { id: 'partner', label: 'As Partner', icon: '&#x1F499;' },
  { id: 'defender', label: 'As Defender', icon: '&#x1F6E1;' },
];

interface TipCardProps {
  title: string;
  children: React.ReactNode;
  type?: 'tip' | 'warning' | 'info';
}

function TipCard({ title, children, type = 'tip' }: TipCardProps) {
  const colors = {
    tip: 'bg-green-900/30 border-green-600 text-green-300',
    warning: 'bg-yellow-900/30 border-yellow-600 text-yellow-300',
    info: 'bg-blue-900/30 border-blue-600 text-blue-300',
  };

  return (
    <div className={`${colors[type]} border rounded-lg p-3 sm:p-4 mb-3 sm:mb-4`}>
      <h4 className="font-bold mb-1 sm:mb-2 text-sm sm:text-base">{title}</h4>
      <div className="text-gray-300 text-xs sm:text-sm">{children}</div>
    </div>
  );
}

function PickingTab() {
  return (
    <div className="space-y-3 sm:space-y-4">
      <p className="text-gray-300 text-sm sm:text-base mb-3 sm:mb-4">
        Deciding whether to pick is one of the most important decisions in Sheepshead.
        A good pick puts you in control; a bad pick can cost you dearly.
      </p>

      <TipCard title="Count Your Trump" type="tip">
        <p className="mb-2">A good rule of thumb:</p>
        <ul className="space-y-1">
          <li>&#x2022; <strong>6+ trump</strong> = Strong pick</li>
          <li>&#x2022; <strong>5 trump</strong> = Usually pickable with good supporting cards</li>
          <li>&#x2022; <strong>4 trump</strong> = Risky, need very strong trump or good position</li>
          <li>&#x2022; <strong>3 or fewer</strong> = Generally pass</li>
        </ul>
      </TipCard>

      <TipCard title="Quality Over Quantity" type="info">
        <p>
          Having Q&#x2663; Q&#x2660; J&#x2663; J&#x2660; (4 high trump) is often better than having
          6 low trump like J&#x2666; A&#x2666; 10&#x2666; K&#x2666; 9&#x2666; 8&#x2666;.
          High trump lets you control the game.
        </p>
      </TipCard>

      <TipCard title="Consider Your Position" type="info">
        <p className="mb-2">Position matters:</p>
        <ul className="space-y-1">
          <li>&#x2022; <strong>First seat</strong> (left of dealer): Stronger hand needed - everyone else gets a chance</li>
          <li>&#x2022; <strong>Later seats</strong>: Can pick slightly weaker hands since others passed</li>
          <li>&#x2022; <strong>Last seat</strong>: If everyone passed, consider picking marginal hands</li>
        </ul>
      </TipCard>

      <TipCard title="Look for Bury Potential" type="tip">
        <p>
          If you have fail Aces or 10s you could bury, that's extra points for your team!
          A hand with A&#x2663; A&#x2660; to bury is stronger than one without.
        </p>
      </TipCard>

      <TipCard title="Void Suits Are Valuable" type="tip">
        <p>
          Having zero cards in a fail suit (a "void") is great. You can trump in
          when that suit is led and potentially win big tricks.
        </p>
      </TipCard>
    </div>
  );
}

function BuryingTab() {
  return (
    <div className="space-y-4">
      <p className="text-gray-300 mb-4">
        After picking, you'll have 8 cards and need to bury 2. Choose wisely - buried
        cards count toward your team's points.
      </p>

      <TipCard title="Bury Points When Safe" type="tip">
        <p>
          Aces (11) and Tens (10) are high-value bury cards. If you have fail Aces or Tens
          you don't need for calling, consider burying them for free points.
        </p>
      </TipCard>

      <TipCard title="Create a Void" type="tip">
        <p>
          If you have only 1-2 cards of a fail suit, bury them to create a void.
          This lets you trump in when that suit is led - very powerful!
        </p>
      </TipCard>

      <TipCard title="Keep Your Hold Card" type="warning">
        <p className="mb-2">
          <strong>Never bury the Ace you're calling!</strong>
        </p>
        <p>
          If you call Hearts and have A&#x2665;, you must keep it - that's your
          "hold card." Burying it would mean calling yourself as partner.
        </p>
      </TipCard>

      <TipCard title="Don't Bury Trump" type="warning">
        <p>
          Unless absolutely necessary, avoid burying trump. Every trump in your
          hand is a potential trick winner. Even low trump like 7&#x2666; can be
          useful for following suit.
        </p>
      </TipCard>

      <TipCard title="Protect Your Tens" type="info">
        <p>
          Be careful burying an Ace if you still have the 10 of that suit.
          The 10 is now vulnerable if that suit is led and someone plays the Ace.
        </p>
      </TipCard>
    </div>
  );
}

function CallingTab() {
  return (
    <div className="space-y-4">
      <p className="text-gray-300 mb-4">
        Calling the right partner can make or break your hand. You want a strong
        partner in a good position.
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
          If you have 10&#x2660; but not A&#x2660;, consider calling spades.
          Your partner (who has A&#x2660;) will protect your 10 from being captured.
        </p>
      </TipCard>

      <TipCard title="Avoid Calling Your Strength" type="warning">
        <p>
          If you have A&#x2663; K&#x2663; 9&#x2663;, don't call clubs - you already
          control that suit! Call a suit where you need help.
        </p>
      </TipCard>

      <TipCard title="Consider Going Alone" type="info">
        <p className="mb-2">Go alone if:</p>
        <ul className="space-y-1">
          <li>&#x2022; You have ALL fail Aces (can't call anyone)</li>
          <li>&#x2022; You have 7+ high trump and can dominate</li>
          <li>&#x2022; You've buried big points and want them all</li>
        </ul>
        <p className="mt-2">Going alone doubles your risk but also your reward!</p>
      </TipCard>
    </div>
  );
}

function PickerPlayTab() {
  return (
    <div className="space-y-4">
      <p className="text-gray-300 mb-4">
        As picker, you're the captain. Your goal: help your team capture 61+ points.
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
          play their trump or give up the trick. Establish control early.
        </p>
      </TipCard>

      <TipCard title="Identify Your Partner" type="info">
        <p className="mb-2">Watch for these signs:</p>
        <ul className="space-y-1">
          <li>&#x2022; Player throws points (schmears) on your winning tricks</li>
          <li>&#x2022; Player leads trump even though they're not picker</li>
          <li>&#x2022; Player avoids trumping your tricks</li>
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
          Keep rough track of points. If you're ahead, play conservatively.
          If behind, take risks to win point-heavy tricks.
        </p>
      </TipCard>
    </div>
  );
}

function PartnerPlayTab() {
  return (
    <div className="space-y-4">
      <p className="text-gray-300 mb-4">
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
        <p className="mb-2">Don't reveal yourself too early:</p>
        <ul className="space-y-1">
          <li>&#x2022; Avoid leading trump (makes you look like partner)</li>
          <li>&#x2022; Don't schmear obviously in early tricks</li>
          <li>&#x2022; Play normally until the right moment</li>
        </ul>
      </TipCard>

      <TipCard title="When to Reveal" type="info">
        <p className="mb-2">Good times to play your called Ace:</p>
        <ul className="space-y-1">
          <li>&#x2022; When you're forced to follow suit</li>
          <li>&#x2022; When you can win an important trick</li>
          <li>&#x2022; When revealing helps your team more than it hurts</li>
        </ul>
      </TipCard>

      <TipCard title="Support Trump Leads" type="tip">
        <p>
          When the picker leads trump, play your lowest trump to follow suit.
          Save your high trump for later - let the picker do the heavy lifting.
        </p>
      </TipCard>

      <TipCard title="Defend the Picker" type="warning">
        <p>
          If defenders are attacking the picker, consider revealing yourself
          to help. A revealed partner can openly support the picker.
        </p>
      </TipCard>
    </div>
  );
}

function DefenderPlayTab() {
  return (
    <div className="space-y-4">
      <p className="text-gray-300 mb-4">
        As a defender, you and your 2 fellow defenders must work together to
        capture 60+ points. Communication through play is key!
      </p>

      <TipCard title="Identify the Partner" type="tip">
        <p className="mb-2">Watch for partner tells:</p>
        <ul className="space-y-1">
          <li>&#x2022; Who schmears to the picker? (Likely partner)</li>
          <li>&#x2022; Who leads trump as non-picker? (Likely partner)</li>
          <li>&#x2022; Who avoids leading the called suit? (Likely partner)</li>
        </ul>
      </TipCard>

      <TipCard title="Lead the Called Suit" type="tip">
        <p>
          If you have the called suit, lead it! This can flush out the partner
          early and let your team know who they are. Once revealed, you can
          target the partner more effectively.
        </p>
      </TipCard>

      <TipCard title="Trump Picker's Fail Leads" type="tip">
        <p>
          If the picker leads a fail suit, consider trumping even if you don't
          have to. This prevents them from winning cheap tricks and forces them
          to spend their trump.
        </p>
      </TipCard>

      <TipCard title="Schmear to Fellow Defenders" type="tip">
        <p>
          When another defender wins a trick, throw your points to them!
          This is especially important once you've identified who's who.
        </p>
      </TipCard>

      <TipCard title="Don't Help the Picker" type="warning">
        <p>
          Avoid throwing points on tricks the picker is winning. Even if you
          can't win the trick, play your lowest cards to deny them points.
        </p>
      </TipCard>

      <TipCard title="Count to 60" type="info">
        <p>
          Remember: you only need 60 points to defeat the picker. Keep rough
          track of the score. Once you hit 60, play defensively.
        </p>
      </TipCard>
    </div>
  );
}

export function StrategyModal() {
  const { closeStrategy } = useGameStore();
  const [activeTab, setActiveTab] = useState<StrategyTab>('picking');

  const renderContent = () => {
    switch (activeTab) {
      case 'picking': return <PickingTab />;
      case 'burying': return <BuryingTab />;
      case 'calling': return <CallingTab />;
      case 'picker': return <PickerPlayTab />;
      case 'partner': return <PartnerPlayTab />;
      case 'defender': return <DefenderPlayTab />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-gray-900 rounded-xl w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col my-2 sm:my-0">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-700">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Strategy Guide</h2>
          <button
            onClick={closeStrategy}
            className="text-gray-400 hover:text-white text-xl font-bold w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-800 active:bg-gray-700"
          >
            &times;
          </button>
        </div>

        {/* Tabs - horizontal scroll on mobile, hide icons on small screens */}
        <div className="flex border-b border-gray-700 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1 sm:gap-2 flex-shrink-0
                ${activeTab === tab.id
                  ? 'text-green-400 border-b-2 border-green-400 bg-green-900/20'
                  : 'text-gray-400 hover:text-white active:bg-gray-800'
                }
              `}
            >
              <span className="hidden sm:inline" dangerouslySetInnerHTML={{ __html: tab.icon }} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-gray-700">
          <button
            onClick={closeStrategy}
            className="w-full sm:w-auto sm:float-right bg-green-600 hover:bg-green-500 active:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
}
