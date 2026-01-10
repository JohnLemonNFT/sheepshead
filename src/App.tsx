'use client';

// ============================================
// MAIN APP COMPONENT - View Router & Orchestrator
// ============================================
// This component handles view switching and orchestration.
// The actual game UI is rendered by LocalGame (local) or OnlineGame (online),
// both of which use the shared GameUI component.

import { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import {
  HomePage,
  GameSetup,
  PlayerHandoff,
  SettingsModal,
  RulesModal,
  StrategyModal,
  OnlineLobby,
  OnlineWaitingRoom,
  OnlineGame,
  LocalGame,
  StatsScreen,
} from './components';
import { Tutorial } from './tutorial';
import { useOnlineGame } from './hooks/useOnlineGame';
import { useSounds } from './hooks/useSounds';
import { useHaptics } from './hooks/useHaptics';
import { useServiceWorker } from './hooks/useServiceWorker';

function App() {
  const {
    currentView,
    awaitingHandoff,
    showSettingsModal,
    showRulesModal,
    showStrategyModal,
    showTutorial,
    closeTutorial,
    goToHome,
    goToOnlineWaiting,
    goToOnlineGame,
    goToStats,
  } = useGameStore();

  // Online game state
  const [onlineState, onlineActions] = useOnlineGame();

  // Sound and haptic feedback systems (global hooks)
  useSounds();
  useHaptics();

  // Service worker for offline support (PWA)
  useServiceWorker();

  // Watch for online state changes to transition views
  useEffect(() => {
    // When room is created/joined, go to waiting room
    if (onlineState.roomCode && !onlineState.gameStarted && currentView === 'online') {
      goToOnlineWaiting();
    }
    // When game starts, go to online game view
    if (onlineState.gameStarted && currentView === 'onlineWaiting') {
      goToOnlineGame();
    }
    // When left room, go back to home
    if (!onlineState.roomCode && (currentView === 'onlineWaiting' || currentView === 'onlineGame')) {
      goToHome();
    }
  }, [onlineState.roomCode, onlineState.gameStarted, currentView, goToOnlineWaiting, goToOnlineGame, goToHome]);

  // Modals overlay - shown on all views
  const modals = (
    <>
      {showSettingsModal && <SettingsModal />}
      {showRulesModal && <RulesModal />}
      {showStrategyModal && <StrategyModal />}
      {showTutorial && <Tutorial onClose={closeTutorial} />}
    </>
  );

  // Home page
  if (currentView === 'home') {
    return (
      <>
        <HomePage />
        {modals}
      </>
    );
  }

  // Game setup
  if (currentView === 'setup') {
    return (
      <>
        <GameSetup />
        {modals}
      </>
    );
  }

  // Stats screen
  if (currentView === 'stats') {
    return (
      <>
        <StatsScreen onBack={goToHome} />
        {modals}
      </>
    );
  }

  // Online lobby
  if (currentView === 'online') {
    return (
      <>
        <OnlineLobby
          onlineState={onlineState}
          onlineActions={onlineActions}
          onBack={goToHome}
        />
        {modals}
      </>
    );
  }

  // Online waiting room
  if (currentView === 'onlineWaiting') {
    return (
      <>
        <OnlineWaitingRoom
          onlineState={onlineState}
          onlineActions={onlineActions}
        />
        {modals}
      </>
    );
  }

  // Online game
  if (currentView === 'onlineGame') {
    return (
      <>
        <OnlineGame
          onlineState={onlineState}
          onlineActions={onlineActions}
        />
        {modals}
      </>
    );
  }

  // Hotseat handoff screen
  if (awaitingHandoff) {
    return <PlayerHandoff />;
  }

  // Local game (vs AI or hotseat)
  return (
    <>
      <LocalGame />
      {modals}
    </>
  );
}

export default App;
export { App as SheepsheadGame };
