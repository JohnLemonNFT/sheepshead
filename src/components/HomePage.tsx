// Home Page - Landing page with navigation to game and guides

import { useGameStore } from '../store/gameStore';

interface MenuCardProps {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
  color: string;
}

function MenuCard({ icon, title, description, onClick, color }: MenuCardProps) {
  return (
    <button
      onClick={onClick}
      className={`
        ${color}
        p-6 rounded-xl text-left
        transform hover:scale-105 transition-all
        shadow-lg hover:shadow-xl
        w-full
      `}
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
      <p className="text-sm opacity-80">{description}</p>
    </button>
  );
}

export function HomePage() {
  const { goToSetup, goToOnline, openSettings, openRules, openStrategy, openTutorial } = useGameStore();

  return (
    <div className="min-h-screen p-4 md:p-8 text-white">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <header className="text-center mb-12 pt-8">
          <div className="text-8xl mb-4">&#x1F411;</div>
          <h1 className="text-5xl md:text-6xl font-bold mb-3">Sheepshead</h1>
          <p className="text-xl text-green-300">
            The Classic Wisconsin Card Game
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Learn, practice, and master this beloved trick-taking game
          </p>
        </header>

        {/* Main Menu Grid */}
        <section className="mb-12">
          {/* Tutorial Banner for New Players */}
          <div className="mb-4">
            <button
              onClick={openTutorial}
              className="w-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 p-4 rounded-xl text-left hover:from-blue-500 hover:via-blue-400 hover:to-cyan-400 transition-all shadow-lg"
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">&#x1F393;</span>
                <div>
                  <h3 className="text-xl font-bold text-white">New to Sheepshead?</h3>
                  <p className="text-blue-100 text-sm">Start here! Interactive lessons teach you step by step.</p>
                </div>
                <span className="ml-auto text-2xl">→</span>
              </div>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MenuCard
              icon="&#x1F3AE;"
              title="Local Play"
              description="Solo or hotseat with friends"
              onClick={goToSetup}
              color="bg-gradient-to-br from-purple-600 to-purple-800 text-purple-100"
            />
            <MenuCard
              icon="&#x1F310;"
              title="Online Play"
              description="Play with friends over the network"
              onClick={goToOnline}
              color="bg-gradient-to-br from-green-600 to-green-800 text-green-100"
            />
            <MenuCard
              icon="&#x1F4D6;"
              title="Rules Reference"
              description="Card hierarchy, point values, and gameplay"
              onClick={openRules}
              color="bg-gradient-to-br from-yellow-600 to-yellow-800 text-yellow-100"
            />
            <MenuCard
              icon="&#x1F9E0;"
              title="Strategy Guide"
              description="Tips for picking, burying, and winning"
              onClick={openStrategy}
              color="bg-gradient-to-br from-pink-600 to-pink-800 text-pink-100"
            />
            <MenuCard
              icon="&#x2699;&#xFE0F;"
              title="Settings"
              description="Game speed, variants, and display options"
              onClick={openSettings}
              color="bg-gradient-to-br from-gray-600 to-gray-800 text-gray-100"
            />
          </div>
        </section>

        {/* Info Section */}
        <section className="bg-black/30 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-green-300 mb-4">About Sheepshead</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-300">
            <div>
              <h3 className="font-bold text-white mb-2">Origins</h3>
              <p>
                Sheepshead is a trick-taking card game that originated in Central Europe
                and became hugely popular in German-American communities, especially in Wisconsin.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-2">The Basics</h3>
              <p>
                Five players, 32 cards. One player becomes the "picker" and teams up with
                a secret partner. Together they try to capture 61+ of the 120 total points.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-2">What Makes It Special</h3>
              <p>
                The hidden partnership, unique trump hierarchy, and strategic depth make
                Sheepshead one of the most engaging card games you'll ever play.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm pb-8">
          <p>Play solo, hotseat, or online with friends</p>
          <p className="mt-2">Built with &#x2764;&#xFE0F; for Sheepshead fans everywhere</p>
        </footer>
      </div>
    </div>
  );
}
