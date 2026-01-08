// Game Setup - Premium Configure players before starting a game

import { useGameStore, DEFAULT_PLAYER_TYPES, NoPickRule, PartnerVariant } from '../store/gameStore';
import { PlayerType } from '../game/types';
import { getPlayerName, getPlayerEmoji } from './PlayerAvatar';
import { getPersonality } from '../game/ai/personalities';
import type { PlayerPosition } from '../game/types';

interface PlayerRowProps {
  position: number;
  type: PlayerType;
  onToggle: () => void;
  delay?: number;
}

function PlayerRow({ position, type, onToggle, delay = 0 }: PlayerRowProps) {
  const isHuman = type === 'human';
  const playerName = getPlayerName(position);
  const personality = position > 0 ? getPersonality(position as PlayerPosition) : null;

  return (
    <div
      className="flex items-center justify-between p-3 sm:p-4 glass rounded-xl gap-3 hover:bg-white/5 transition-colors"
    >
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
        <div className={`
          w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xl sm:text-2xl flex-shrink-0
          ${position === 0 ? 'bg-gradient-to-br from-emerald-500 to-emerald-700' :
            'bg-gradient-to-br from-slate-600 to-slate-800'}
          shadow-lg border-2 border-white/10
        `}>
          {getPlayerEmoji(position)}
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-white text-sm sm:text-base truncate">{playerName}</div>
          <div className="text-[10px] sm:text-xs text-emerald-300/60">
            {position === 0 ? 'Your seat' : personality ? personality.description : `Seat ${position + 1}`}
          </div>
        </div>
      </div>

      <div className="flex gap-1 flex-shrink-0">
        <button
          onClick={onToggle}
          className={`
            px-3 sm:px-5 py-2.5 sm:py-3 rounded-l-xl font-medium text-xs sm:text-sm transition-all duration-200 min-h-[44px] min-w-[55px] sm:min-w-[70px]
            ${isHuman
              ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30'
              : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50 hover:text-slate-300'
            }
          `}
        >
          Human
        </button>
        <button
          onClick={onToggle}
          className={`
            px-3 sm:px-5 py-2.5 sm:py-3 rounded-r-xl font-medium text-xs sm:text-sm transition-all duration-200 min-h-[44px] min-w-[45px] sm:min-w-[55px]
            ${!isHuman
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
              : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50 hover:text-slate-300'
            }
          `}
        >
          AI
        </button>
      </div>
    </div>
  );
}

export function GameSetup() {
  const { playerTypes, setPlayerTypes, startGame, goToHome, gameSettings, updateSettings } = useGameStore();

  const humanCount = playerTypes.filter(t => t === 'human').length;
  const aiCount = playerTypes.filter(t => t === 'ai').length;

  const handleToggle = (position: number) => {
    const newTypes = [...playerTypes] as PlayerType[];
    newTypes[position] = newTypes[position] === 'human' ? 'ai' : 'human';

    // Ensure at least one human
    if (newTypes.filter(t => t === 'human').length === 0) {
      return; // Don't allow all AI
    }

    setPlayerTypes(newTypes);
  };

  const handleReset = () => {
    setPlayerTypes([...DEFAULT_PLAYER_TYPES]);
  };

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-8 text-white">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <header className="text-center mb-6 sm:mb-8 pt-4 sm:pt-6 md:pt-8">
          <div className="text-4xl sm:text-5xl mb-3">🎮</div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent">
            Game Setup
          </h1>
          <p className="text-emerald-300/70 text-sm sm:text-base">
            Choose which seats are human players or AI
          </p>
        </header>

        {/* Player Configuration */}
        <section className="mb-6 sm:mb-8">
          <div className="space-y-2 sm:space-y-3">
            {playerTypes.map((type, i) => (
              <PlayerRow
                key={i}
                position={i}
                type={type}
                onToggle={() => handleToggle(i)}
              />
            ))}
          </div>
        </section>

        {/* Game Rules */}
        <section className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-emerald-300 mb-3 sm:mb-4 flex items-center gap-2">
            <span>🎯</span> Game Rules
          </h2>

          <div className="glass rounded-xl p-4 space-y-4">
            {/* Partner Variant */}
            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-2">Partner Variant</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'calledAce' as PartnerVariant, label: 'Called Ace', desc: 'Pick an ace' },
                  { value: 'jackOfDiamonds' as PartnerVariant, label: 'Jack of ♦', desc: 'J♦ is partner' },
                  { value: 'none' as PartnerVariant, label: 'Solo', desc: 'No partner' },
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => updateSettings({ partnerVariant: option.value })}
                    className={`
                      px-2 sm:px-3 py-2.5 rounded-lg text-sm font-medium transition-all min-h-[60px]
                      ${gameSettings.partnerVariant === option.value
                        ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 shadow-lg'
                        : 'bg-slate-700/60 text-slate-300 hover:bg-slate-600/60'}
                    `}
                  >
                    <div className="font-semibold text-xs sm:text-sm">{option.label}</div>
                    <div className="text-[10px] opacity-70 mt-0.5">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* No-Pick Rule */}
            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-2">When Everyone Passes</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'leaster' as NoPickRule, label: 'Leaster', desc: 'Lowest points wins' },
                  { value: 'forcedPick' as NoPickRule, label: 'Forced Pick', desc: 'Dealer must pick' },
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => updateSettings({ noPickRule: option.value })}
                    className={`
                      px-3 py-2.5 rounded-lg text-sm font-medium transition-all min-h-[60px]
                      ${gameSettings.noPickRule === option.value
                        ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 shadow-lg'
                        : 'bg-slate-700/60 text-slate-300 hover:bg-slate-600/60'}
                    `}
                  >
                    <div className="font-semibold">{option.label}</div>
                    <div className="text-[10px] opacity-70 mt-0.5">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Game Variants */}
        <section className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-emerald-300 mb-3 sm:mb-4 flex items-center gap-2">
            <span>⚡</span> Game Variants
          </h2>

          <div className="glass rounded-xl p-4 space-y-3">
            {/* Cracking */}
            <button
              onClick={() => updateSettings({ crackingEnabled: !gameSettings.crackingEnabled })}
              className={`
                w-full flex items-center justify-between p-3 rounded-lg transition-all
                ${gameSettings.crackingEnabled
                  ? 'bg-red-600/30 ring-2 ring-red-400/50'
                  : 'bg-slate-700/40 hover:bg-slate-600/40'}
              `}
            >
              <div className="text-left">
                <div className="font-semibold text-white text-sm sm:text-base">Cracking / Recracking</div>
                <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5">
                  Defenders can double stakes. Picker can re-double.
                </div>
              </div>
              <div className={`
                w-12 h-7 rounded-full p-1 transition-colors flex-shrink-0
                ${gameSettings.crackingEnabled ? 'bg-red-500' : 'bg-slate-600'}
              `}>
                <div className={`
                  w-5 h-5 rounded-full bg-white transition-transform shadow
                  ${gameSettings.crackingEnabled ? 'translate-x-5' : 'translate-x-0'}
                `} />
              </div>
            </button>

            {/* Blitz */}
            <button
              onClick={() => updateSettings({ blitzEnabled: !gameSettings.blitzEnabled })}
              className={`
                w-full flex items-center justify-between p-3 rounded-lg transition-all
                ${gameSettings.blitzEnabled
                  ? 'bg-purple-600/30 ring-2 ring-purple-400/50'
                  : 'bg-slate-700/40 hover:bg-slate-600/40'}
              `}
            >
              <div className="text-left">
                <div className="font-semibold text-white text-sm sm:text-base flex items-center gap-2">
                  Blitz (The Ma's)
                  <span className="text-xs bg-slate-700 px-1.5 py-0.5 rounded">Q♣ Q♠</span>
                </div>
                <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5">
                  Picker with both black queens can double stakes.
                </div>
              </div>
              <div className={`
                w-12 h-7 rounded-full p-1 transition-colors flex-shrink-0
                ${gameSettings.blitzEnabled ? 'bg-purple-500' : 'bg-slate-600'}
              `}>
                <div className={`
                  w-5 h-5 rounded-full bg-white transition-transform shadow
                  ${gameSettings.blitzEnabled ? 'translate-x-5' : 'translate-x-0'}
                `} />
              </div>
            </button>

            {gameSettings.blitzEnabled && !gameSettings.crackingEnabled && (
              <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                Note: Blitz requires Cracking to be enabled to work.
              </div>
            )}
          </div>
        </section>

        {/* Summary */}
        <section className="mb-6 sm:mb-8 glass rounded-2xl p-4 sm:p-5">
          <div className="flex justify-center gap-8 sm:gap-12 text-center">
            <div className="group">
              <div className="text-3xl sm:text-4xl font-bold text-emerald-400 group-hover:scale-110 transition-transform">
                {humanCount}
              </div>
              <div className="text-xs sm:text-sm text-emerald-300/60">Human{humanCount !== 1 ? 's' : ''}</div>
            </div>
            <div className="w-px bg-white/10" />
            <div className="group">
              <div className="text-3xl sm:text-4xl font-bold text-blue-400 group-hover:scale-110 transition-transform">
                {aiCount}
              </div>
              <div className="text-xs sm:text-sm text-blue-300/60">AI</div>
            </div>
          </div>

          {humanCount >= 2 && (
            <div className="mt-4 text-center text-xs sm:text-sm text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-center justify-center gap-2">
              <span>📱</span>
              <span>Hotseat mode: Players will take turns on this device</span>
            </div>
          )}
        </section>

        {/* Actions */}
        <section className="space-y-3">
          <button
            onClick={startGame}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 active:scale-[0.98] text-white font-bold py-4 sm:py-5 px-4 sm:px-6 rounded-2xl transition-all duration-200 text-base sm:text-lg min-h-[56px] shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 flex items-center justify-center gap-2"
          >
            <span>Start Game</span>
            <span className="text-xl">→</span>
          </button>

          <div className="flex gap-3">
            <button
              onClick={goToHome}
              className="flex-1 glass hover:bg-white/10 active:scale-[0.98] text-white font-medium py-3 sm:py-4 px-3 sm:px-4 rounded-xl transition-all duration-200 text-sm sm:text-base min-h-[48px] flex items-center justify-center gap-2"
            >
              <span>←</span>
              <span>Back</span>
            </button>
            <button
              onClick={handleReset}
              className="flex-1 glass hover:bg-white/10 active:scale-[0.98] text-white font-medium py-3 sm:py-4 px-3 sm:px-4 rounded-xl transition-all duration-200 text-sm sm:text-base min-h-[48px] flex items-center justify-center gap-2"
            >
              <span>🔄</span>
              <span>Reset</span>
            </button>
          </div>
        </section>

        {/* Info */}
        <section className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-emerald-200/40 px-2">
          <p>
            In hotseat mode, a handoff screen will appear between human turns
            to keep each player's cards secret.
          </p>
        </section>
      </div>
    </div>
  );
}
