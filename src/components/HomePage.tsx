'use client';

// Home Page - Premium Landing page with navigation to game and guides

import { useGameStore } from '../store/gameStore';

interface MenuCardProps {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
  gradient: string;
  delay?: number;
}

function MenuCard({ icon, title, description, onClick, gradient, delay = 0 }: MenuCardProps) {
  return (
    <button
      onClick={onClick}
      className={`
        ${gradient}
        p-4 sm:p-5 md:p-6 rounded-2xl text-left
        transform hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200
        shadow-lg hover:shadow-xl
        w-full min-h-[100px] sm:min-h-[120px]
        border border-white/10
        group
      `}
    >
      <div className="text-2xl sm:text-3xl md:text-4xl mb-2 sm:mb-3 transform group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-1 drop-shadow-sm">{title}</h3>
      <p className="text-xs sm:text-sm text-white/70 group-hover:text-white/90 transition-colors">{description}</p>
    </button>
  );
}

export function HomePage() {
  const { goToSetup, goToOnline, openSettings, openRules, openStrategy, openTutorial } = useGameStore();

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-8 text-white overflow-hidden">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <header className="text-center mb-6 sm:mb-8 md:mb-12 pt-4 sm:pt-6 md:pt-8">
          <div className="relative inline-block">
            <div className="text-6xl sm:text-7xl md:text-8xl mb-3 sm:mb-4">🐑</div>
            {/* Subtle glow behind sheep */}
            <div className="absolute inset-0 blur-2xl bg-emerald-500/10 -z-10 scale-125"></div>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent drop-shadow-lg">
            Sheepshead
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-emerald-300 font-medium tracking-wide">
            The Classic Wisconsin Card Game
          </p>
          <p className="text-xs sm:text-sm text-emerald-200/60 mt-2 px-4 max-w-md mx-auto">
            Learn, practice, and master this beloved trick-taking game
          </p>
        </header>

        {/* Main Menu Grid */}
        <section className="mb-6 sm:mb-8 md:mb-12">
          {/* Tutorial Banner for New Players */}
          <div className="mb-4 sm:mb-5">
            <button
              onClick={openTutorial}
              className="w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 p-4 sm:p-5 rounded-2xl text-left hover:from-blue-500 hover:via-indigo-400 hover:to-purple-500 active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-xl min-h-[70px] border border-white/10 group"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="text-3xl sm:text-4xl md:text-5xl transform group-hover:scale-105 transition-transform">🎓</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">New to Sheepshead?</h3>
                  <p className="text-blue-100/80 text-xs sm:text-sm truncate sm:whitespace-normal">Start here! Interactive lessons teach you step by step.</p>
                </div>
                <span className="text-2xl sm:text-3xl flex-shrink-0 transform group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <MenuCard
              icon="🎮"
              title="Local Play"
              description="Solo or hotseat with friends"
              onClick={goToSetup}
              gradient="bg-gradient-to-br from-violet-600/90 to-purple-800/90"
            />
            <MenuCard
              icon="🌐"
              title="Online Play"
              description="Play with friends over the network"
              onClick={goToOnline}
              gradient="bg-gradient-to-br from-emerald-600/90 to-teal-800/90"
            />
            <MenuCard
              icon="📖"
              title="Rules Reference"
              description="Card hierarchy, point values, and gameplay"
              onClick={openRules}
              gradient="bg-gradient-to-br from-amber-600/90 to-orange-800/90"
            />
            <MenuCard
              icon="🧠"
              title="Strategy Guide"
              description="Tips for picking, burying, and winning"
              onClick={openStrategy}
              gradient="bg-gradient-to-br from-rose-600/90 to-pink-800/90"
            />
            <MenuCard
              icon="⚙️"
              title="Settings"
              description="Game speed, variants, and display options"
              onClick={openSettings}
              gradient="bg-gradient-to-br from-slate-600/90 to-slate-800/90"
            />
          </div>
        </section>

        {/* Info Section */}
        <section className="glass rounded-2xl p-4 sm:p-5 md:p-6 mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-emerald-300 mb-3 sm:mb-4 flex items-center gap-2">
            <span>📜</span> About Sheepshead
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6 text-xs sm:text-sm text-gray-300">
            <div className="group">
              <h3 className="font-bold text-white mb-1 sm:mb-2 group-hover:text-emerald-300 transition-colors">🏔️ Origins</h3>
              <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                A trick-taking card game from Central Europe, hugely popular in German-American communities, especially Wisconsin.
              </p>
            </div>
            <div className="group">
              <h3 className="font-bold text-white mb-1 sm:mb-2 group-hover:text-emerald-300 transition-colors">🃏 The Basics</h3>
              <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                Five players, 32 cards. The "picker" teams with a secret partner to capture 61+ of 120 total points.
              </p>
            </div>
            <div className="group">
              <h3 className="font-bold text-white mb-1 sm:mb-2 group-hover:text-emerald-300 transition-colors">✨ What Makes It Special</h3>
              <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                Hidden partnerships, unique trump hierarchy, and strategic depth make it endlessly engaging.
              </p>
            </div>
          </div>
        </section>

        {/* SEO Pages Links */}
        <nav className="glass rounded-2xl p-4 sm:p-5 mb-6 sm:mb-8">
          <h2 className="text-sm font-medium text-emerald-300/80 mb-3 text-center">Learn More</h2>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            <button
              onClick={() => window.location.href = '/rules'}
              className="px-4 py-2 bg-amber-600/20 hover:bg-amber-600/40 border border-amber-500/30 rounded-lg text-amber-200 text-sm font-medium transition-colors"
            >
              📖 Full Rules
            </button>
            <button
              onClick={() => window.location.href = '/strategy'}
              className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/40 border border-rose-500/30 rounded-lg text-rose-200 text-sm font-medium transition-colors"
            >
              🧠 Strategy Guide
            </button>
            <button
              onClick={() => window.location.href = '/learn'}
              className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 rounded-lg text-blue-200 text-sm font-medium transition-colors"
            >
              🎓 Beginner's Guide
            </button>
            <button
              onClick={() => window.location.href = '/glossary'}
              className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 rounded-lg text-purple-200 text-sm font-medium transition-colors"
            >
              📚 Glossary
            </button>
            <button
              onClick={() => window.location.href = '/faq'}
              className="px-4 py-2 bg-gray-600/20 hover:bg-gray-600/40 border border-gray-500/30 rounded-lg text-gray-200 text-sm font-medium transition-colors"
            >
              ❓ FAQ
            </button>
          </div>
        </nav>

        {/* Footer */}
        <footer className="text-center text-emerald-200/40 text-xs sm:text-sm pb-6 sm:pb-8">
          <p>Play solo, hotseat, or online with friends</p>
          <p className="mt-1 sm:mt-2 flex items-center justify-center gap-1">
            Built with <span className="text-rose-400">❤️</span> for Sheepshead fans everywhere
          </p>
        </footer>
      </div>
    </div>
  );
}
