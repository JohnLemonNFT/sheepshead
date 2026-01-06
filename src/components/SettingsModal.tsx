// Settings Modal - Game configuration options

import { useGameStore, GameSpeed, PartnerVariant, NoPickRule } from '../store/gameStore';
import { setVolume, setMuted, playSound } from '../utils/sounds';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <div className="mb-4 sm:mb-6">
      <h3 className="text-base sm:text-lg font-bold text-green-300 mb-2 sm:mb-3 border-b border-green-700 pb-1">
        {title}
      </h3>
      {children}
    </div>
  );
}

interface OptionButtonProps<T> {
  value: T;
  current: T;
  onChange: (value: T) => void;
  label: string;
  description?: string;
}

function OptionButton<T extends string>({
  value,
  current,
  onChange,
  label,
  description,
}: OptionButtonProps<T>) {
  const isSelected = value === current;
  return (
    <button
      onClick={() => onChange(value)}
      className={`
        p-2.5 sm:p-3 rounded-lg text-left transition-all w-full min-h-[44px]
        ${isSelected
          ? 'bg-green-600 border-2 border-green-400 text-white'
          : 'bg-gray-800 border-2 border-gray-700 text-gray-300 hover:border-gray-500 active:bg-gray-700'
        }
      `}
    >
      <div className="font-medium text-sm sm:text-base">{label}</div>
      {description && (
        <div className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 ${isSelected ? 'text-green-200' : 'text-gray-500'}`}>
          {description}
        </div>
      )}
    </button>
  );
}

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label: string;
  description?: string;
}

function ToggleSwitch({ enabled, onChange, label, description }: ToggleSwitchProps) {
  return (
    <div
      className="flex items-center justify-between p-2.5 sm:p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750 active:bg-gray-700 min-h-[44px] gap-3"
      onClick={() => onChange(!enabled)}
    >
      <div className="flex-1 min-w-0">
        <div className="font-medium text-white text-sm sm:text-base">{label}</div>
        {description && <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">{description}</div>}
      </div>
      <div
        className={`
          w-11 sm:w-12 h-6 rounded-full p-1 transition-colors flex-shrink-0
          ${enabled ? 'bg-green-600' : 'bg-gray-600'}
        `}
      >
        <div
          className={`
            w-4 h-4 rounded-full bg-white transition-transform
            ${enabled ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0'}
          `}
        />
      </div>
    </div>
  );
}

interface VolumeSliderProps {
  volume: number;
  muted: boolean;
  onVolumeChange: (volume: number) => void;
  onMutedChange: (muted: boolean) => void;
}

function VolumeSlider({ volume, muted, onVolumeChange, onMutedChange }: VolumeSliderProps) {
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value, 10);
    onVolumeChange(newVolume);
    setVolume(newVolume);
    // Play a test sound when adjusting
    if (!muted && newVolume > 0) {
      playSound('button_click');
    }
  };

  const handleMuteToggle = () => {
    const newMuted = !muted;
    onMutedChange(newMuted);
    setMuted(newMuted);
    if (!newMuted) {
      playSound('success');
    }
  };

  const getVolumeIcon = () => {
    if (muted || volume === 0) return '&#x1F507;';
    if (volume < 33) return '&#x1F508;';
    if (volume < 66) return '&#x1F509;';
    return '&#x1F50A;';
  };

  return (
    <div className="p-2.5 sm:p-3 bg-gray-800 rounded-lg">
      <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
        <div className="font-medium text-white text-sm sm:text-base">Sound Effects</div>
        <button
          onClick={handleMuteToggle}
          className={`
            px-2.5 sm:px-3 py-1.5 sm:py-1 rounded text-xs sm:text-sm font-medium transition-colors min-h-[36px] sm:min-h-[32px]
            ${muted ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600 active:bg-gray-800'}
          `}
        >
          {muted ? 'Unmute' : 'Mute'}
        </button>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="text-base sm:text-xl w-6 sm:w-8" dangerouslySetInnerHTML={{ __html: getVolumeIcon() }} />
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={handleVolumeChange}
          disabled={muted}
          className={`
            flex-1 h-2 rounded-lg appearance-none cursor-pointer
            ${muted ? 'bg-gray-700 opacity-50' : 'bg-gray-600'}
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-green-500
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-moz-range-thumb]:w-5
            [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-green-500
            [&::-moz-range-thumb]:cursor-pointer
            [&::-moz-range-thumb]:border-none
          `}
        />
        <span className="text-gray-400 text-xs sm:text-sm w-8 sm:w-10 text-right">{volume}%</span>
      </div>
    </div>
  );
}

export function SettingsModal() {
  const { gameSettings, updateSettings, closeSettings } = useGameStore();

  const handleSpeedChange = (speed: GameSpeed) => {
    updateSettings({ gameSpeed: speed });
  };

  const handlePartnerVariantChange = (variant: PartnerVariant) => {
    updateSettings({ partnerVariant: variant });
  };

  const handleNoPickRuleChange = (rule: NoPickRule) => {
    updateSettings({ noPickRule: rule });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-700">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <span>Settings</span>
          </h2>
          <button
            onClick={closeSettings}
            className="text-gray-400 hover:text-white text-2xl font-bold w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center rounded hover:bg-gray-800 active:bg-gray-700 min-w-[44px] min-h-[44px]"
          >
            x
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          {/* Sound Settings */}
          <SettingsSection title="Sound">
            <VolumeSlider
              volume={gameSettings.soundVolume}
              muted={gameSettings.soundMuted}
              onVolumeChange={(volume) => updateSettings({ soundVolume: volume })}
              onMutedChange={(muted) => updateSettings({ soundMuted: muted })}
            />
          </SettingsSection>

          {/* Game Speed */}
          <SettingsSection title="Game Speed">
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              <OptionButton
                value="slow"
                current={gameSettings.gameSpeed}
                onChange={handleSpeedChange}
                label="Slow"
                description="Best for learning"
              />
              <OptionButton
                value="normal"
                current={gameSettings.gameSpeed}
                onChange={handleSpeedChange}
                label="Normal"
                description="Standard pace"
              />
              <OptionButton
                value="fast"
                current={gameSettings.gameSpeed}
                onChange={handleSpeedChange}
                label="Fast"
                description="Quick games"
              />
            </div>
          </SettingsSection>

          {/* Partner Variant */}
          <SettingsSection title="Partner Variant">
            <div className="space-y-1.5 sm:space-y-2">
              <OptionButton
                value="calledAce"
                current={gameSettings.partnerVariant}
                onChange={handlePartnerVariantChange}
                label="Called Ace (Standard)"
                description="Picker calls a fail ace suit - holder of that ace is their secret partner"
              />
              <OptionButton
                value="jackOfDiamonds"
                current={gameSettings.partnerVariant}
                onChange={handlePartnerVariantChange}
                label="Jack of Diamonds"
                description="Player holding the Jack of Diamonds is automatically the partner (coming soon)"
              />
              <OptionButton
                value="none"
                current={gameSettings.partnerVariant}
                onChange={handlePartnerVariantChange}
                label="No Partner (Solo)"
                description="Picker always plays alone against all defenders"
              />
            </div>
          </SettingsSection>

          {/* No-Pick Rule */}
          <SettingsSection title="When Nobody Picks">
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              <OptionButton
                value="leaster"
                current={gameSettings.noPickRule}
                onChange={handleNoPickRuleChange}
                label="Leaster"
                description="Fewest points wins"
              />
              <OptionButton
                value="forcedPick"
                current={gameSettings.noPickRule}
                onChange={handleNoPickRuleChange}
                label="Forced Pick"
                description="Dealer must pick"
              />
            </div>
          </SettingsSection>

          {/* Display Options */}
          <SettingsSection title="Display Options">
            <div className="space-y-2 sm:space-y-3">
              <ToggleSwitch
                enabled={gameSettings.showStrategyTips}
                onChange={(enabled) => updateSettings({ showStrategyTips: enabled })}
                label="Show Strategy Tips"
                description="Display helpful hints during your turn"
              />
              <ToggleSwitch
                enabled={gameSettings.showAIExplanations}
                onChange={(enabled) => updateSettings({ showAIExplanations: enabled })}
                label="Show Opponent Explanations"
                description="See why opponents made their decisions"
              />
            </div>
          </SettingsSection>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-gray-700 flex justify-end">
          <button
            onClick={closeSettings}
            className="bg-green-600 hover:bg-green-500 active:bg-green-700 text-white font-bold py-2.5 sm:py-2 px-5 sm:px-6 rounded-lg transition-colors min-h-[44px] text-sm sm:text-base"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
