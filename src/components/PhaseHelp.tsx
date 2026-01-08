// PhaseHelp - contextual help tooltips for each game phase

import { useState } from 'react';
import { GamePhase } from '../game/types';
import { useGameStore } from '../store/gameStore';

interface PhaseHelpProps {
  phase: GamePhase;
  isHumanTurn: boolean;
  isPicker?: boolean;
}

const PHASE_HELP: Record<string, { title: string; tips: string[] }> = {
  picking: {
    title: 'Pick or Pass?',
    tips: [
      'The "blind" is 2 face-down cards you can take',
      'If you PICK, you become the "picker" and must try to win 61+ points',
      'You\'ll get a secret partner (the player with the ace you call)',
      'PICK if you have 4+ trump cards or strong queens/jacks',
      'PASS if your hand is weak - let someone else take the risk',
    ],
  },
  cracking: {
    title: 'Crack or Pass?',
    tips: [
      'Someone picked - now you can CRACK to double the stakes!',
      'CRACK if you have a strong defensive hand (3+ trump, or 2+ fail aces)',
      'Cracking means you think the picker will LOSE',
      'If you crack, the picker can RE-CRACK to double again (4x stakes)',
      'PASS if your hand is weak or you\'re unsure',
    ],
  },
  burying: {
    title: 'Burying Cards',
    tips: [
      'Choose 2 cards to "bury" (hide) - these points count for your team',
      'BURY high-point fail cards (Aces, 10s) to secure those points',
      'BURY cards to create a "void" (empty suit) so you can trump later',
      'NEVER bury trump cards - you need them to win tricks',
      'Don\'t bury the ace you plan to call!',
    ],
  },
  calling: {
    title: 'Calling an Ace',
    tips: [
      'Pick a fail suit (♣♠♥) - whoever has that Ace is your secret partner',
      'Your partner will help you win, but nobody knows who they are yet',
      'Call a suit where you have the 10 or King (good for "schmearing" points)',
      'Call a suit you\'re VOID in to identify your partner quickly',
      'Or "Go Alone" if you have a very strong hand (more risk, more reward)',
    ],
  },
  playing: {
    title: 'Playing Tricks',
    tips: [
      'Lead any card to start a trick',
      'Others must follow suit if they can',
      'Highest trump wins, or highest of led suit if no trump',
      'Your team needs 61 points total to win',
    ],
  },
};

export function PhaseHelp({ phase, isHumanTurn, isPicker }: PhaseHelpProps) {
  const [isOpen, setIsOpen] = useState(false);
  const showBeginnerHelp = useGameStore(state => state.gameSettings.showBeginnerHelp);

  // Only show help during relevant phases when it's human's turn
  const helpKey = phase === 'picking' ? 'picking' :
                  phase === 'cracking' ? 'cracking' :
                  phase === 'burying' ? 'burying' :
                  phase === 'calling' ? 'calling' :
                  phase === 'playing' ? 'playing' : null;

  if (!helpKey || !isHumanTurn || !showBeginnerHelp) return null;

  const help = PHASE_HELP[helpKey];
  if (!help) return null;

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1 px-2 py-1 rounded bg-blue-900/30 hover:bg-blue-900/50 transition-colors"
      >
        <span>💡</span>
        <span>Help</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Help popup */}
          <div className="absolute bottom-full left-0 mb-2 z-50 bg-gray-900 border border-blue-500/50 rounded-lg shadow-xl p-3 w-72 sm:w-80">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-bold text-blue-300">{help.title}</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <ul className="space-y-1.5">
              {help.tips.map((tip, i) => (
                <li key={i} className="text-xs text-gray-300 flex gap-2">
                  <span className="text-blue-400 flex-shrink-0">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>

            {phase === 'picking' && (
              <div className="mt-3 pt-2 border-t border-gray-700">
                <p className="text-[10px] text-gray-500">
                  💡 Tip: Start with the Tutorial from the home screen to learn the basics!
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Inline tip that shows automatically for first-time players
export function FirstTimeHelp({ phase }: { phase: GamePhase }) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const showBeginnerHelp = useGameStore(state => state.gameSettings.showBeginnerHelp);

  const tips: Record<string, string> = {
    picking: '💡 First time? The "blind" is 2 bonus cards. Pick if you have 4+ trump!',
    cracking: '💡 CRACK to double stakes if you think the picker will lose! 3+ trump = crack!',
    burying: '💡 Bury high-point cards (A, 10) from fail suits to secure points',
    calling: '💡 Call an ace suit where you have the 10 - your secret partner has the ace!',
  };

  const tip = tips[phase];
  if (!tip || dismissed.has(phase) || !showBeginnerHelp) return null;

  return (
    <div className="bg-blue-900/40 border border-blue-500/30 rounded-lg px-3 py-2 mb-2 flex items-center justify-between gap-2">
      <p className="text-xs text-blue-200">{tip}</p>
      <button
        onClick={() => setDismissed(prev => new Set(prev).add(phase))}
        className="text-blue-400 hover:text-blue-200 text-xs flex-shrink-0"
      >
        Got it
      </button>
    </div>
  );
}
