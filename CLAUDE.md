# Sheepshead App

## Project Overview
A web/mobile app for playing Sheepshead, the classic Wisconsin trick-taking card game. Our goal is to become the definitive resource for learning and playing Sheepshead online.

## Current Phase: MVP (Web App)
Building a playable single-player web app with AI opponents for testing and iteration.

## Tech Stack
- **Frontend**: React 18+ with TypeScript
- **Styling**: Tailwind CSS
- **Build**: Vite
- **State Management**: Zustand (lightweight, simple)
- **Testing**: Vitest + React Testing Library
- **No backend for MVP** - all game logic runs client-side

## Project Structure
```
sheepshead/
├── src/
│   ├── components/       # React components
│   │   ├── Card.tsx
│   │   ├── Hand.tsx
│   │   ├── Table.tsx
│   │   ├── ScoreBoard.tsx
│   │   └── GameControls.tsx
│   ├── game/             # Core game engine (framework-agnostic)
│   │   ├── types.ts      # Card, Player, GameState types
│   │   ├── deck.ts       # Card creation, shuffling
│   │   ├── rules.ts      # Rule enforcement (legal plays, trick winner)
│   │   ├── scoring.ts    # Point counting, game scoring
│   │   └── ai/
│   │       ├── engine.ts     # AI decision orchestrator
│   │       ├── pick.ts       # Pick decision logic
│   │       ├── bury.ts       # Bury decision logic
│   │       ├── call.ts       # Partner call logic
│   │       ├── play.ts       # Card play logic
│   │       ├── tracking.ts   # Trump/point/partner tracking
│   │       └── explain.ts    # Explanation generator
│   ├── store/            # Zustand game state
│   │   └── gameStore.ts
│   ├── hooks/            # Custom React hooks
│   │   └── useGame.ts
│   ├── utils/            # Helpers
│   │   └── random.ts     # Provably fair RNG
│   ├── App.tsx
│   └── main.tsx
├── tests/
│   ├── rules.test.ts     # Rule enforcement tests
│   ├── ai.test.ts        # AI decision tests
│   └── game.test.ts      # Full game simulations
├── CLAUDE.md
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Game Rules Summary

### Card Hierarchy
**Trump (14 cards, highest to lowest):**
Q♣ > Q♠ > Q♥ > Q♦ > J♣ > J♠ > J♥ > J♦ > A♦ > 10♦ > K♦ > 9♦ > 8♦ > 7♦

**Fail Suits (6 cards each in ♣ ♠ ♥):**
A (11pts) > 10 (10pts) > K (4pts) > 9 (0pts) > 8 (0pts) > 7 (0pts)

### Point Values
- Aces: 11 points
- 10s: 10 points
- Kings: 4 points
- Queens: 3 points
- Jacks: 2 points
- 9, 8, 7: 0 points
- **Total in deck: 120 points**
- **Goal: Picker's team needs 61+ to win**

### Game Flow (5-handed, Called Ace)
1. Deal 6 cards to each player, 2 to blind
2. Starting left of dealer, each player can pick or pass
3. Picker takes blind, buries 2 cards, calls a fail ace as partner
4. Play 6 tricks, must follow suit (trump is a suit)
5. Picker + Partner vs other 3 players
6. Score based on points captured

### Following Suit Rules (MUST BE ENFORCED)
- If trump led → must play trump if you have it
- If fail led → must play that fail suit if you have it (queens/jacks of that suit are trump, don't count)
- If you can't follow → play anything
- Trick won by highest trump, or if no trump, highest of led suit

## AI Requirements

### Core Principles
1. **Never break rules** - AI must always make legal plays
2. **No cheating** - AI only knows what a human would know (own cards, played cards, public info)
3. **Explainable** - Every decision must have a human-readable reason
4. **Difficulty-scaled** - Beginner through Expert levels

### AI Decision Points
1. **Pick?** - Evaluate trump count, quality, position, bury potential
2. **Bury what?** - Maximize points, create voids, keep hold card
3. **Call which ace?** - Prefer void suits, 10+ace combos
4. **Play what?** - Role-dependent (picker/partner/defender strategies)

### Partner Identification
- Track probability each player is partner based on:
  - Schmearing to picker (likely partner)
  - Leading trump as non-picker (likely partner)
  - Leading called suit (likely NOT partner)
  - Trumping picker's tricks (likely NOT partner)

## MVP Feature Checklist
- [ ] Card rendering with proper suits/ranks
- [ ] Dealing animation
- [ ] Pick/pass UI
- [ ] Bury card selection
- [ ] Call ace selection  
- [ ] Trick play with legal move enforcement
- [ ] AI opponents (start with Intermediate level)
- [ ] Trick winner determination
- [ ] Score calculation
- [ ] Game end screen with results
- [ ] "Why?" button for AI explanations
- [ ] New game button

## Code Style
- TypeScript strict mode
- Functional components with hooks
- Game logic must be pure functions (no side effects) for testability
- AI decisions return { action, reason } tuples
- Use discriminated unions for game states

## Testing Requirements
- 100% coverage on rules.ts (rule enforcement is critical)
- AI must never make illegal play in 10,000 simulated games
- Picker win rate should be 65-70% (historical average)

## Commands
```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run test     # Run tests
npm run test:ai  # Run AI simulation tests
```

## Current Status
🚧 Project setup in progress

## Next Steps
1. Initialize project with Vite + React + TypeScript
2. Build core game types and deck utilities
3. Implement rule enforcement (the foundation)
4. Build basic UI to visualize cards
5. Implement AI engine
6. Connect UI to game state
7. Playtest and iterate
