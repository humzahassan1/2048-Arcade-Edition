# 2048: Arcade Edition
https://humzahassan1.github.io/2048-Arcade-Edition/

A browser-based twist on the classic 2048 puzzle game, built with vanilla JavaScript and the DOM API. Features a solo mode, a local two-player versus mode, a shuffle power-up, and tile glow effects that intensify as values climb.

## Features

**Solo Mode** - The classic 2048 experience. Use arrow keys to slide tiles, merge matching numbers, and try to reach 2048. Hit 2048 and you can keep going for a higher score.

**Versus Mode** - Two players on the same keyboard. Player 1 uses WASD, Player 2 uses arrow keys. Both players play until their boards lock up, then the highest score wins. No instant eliminations - if you die first, the other player keeps going, so the final score is what matters.

**Shuffle Power-Up** - Each player gets 2 shuffle charges per game. Activating a shuffle randomly rearranges all tiles on your board using a Fisher-Yates shuffle. It can break you out of a deadlock or make things worse — use it wisely.

**Tile Glow** - Tiles emit a glow effect that scales with their value. Low tiles have a subtle shimmer, mid-range tiles glow brighter, and high-value tiles radiate a double-layer bloom.

**UNC vs Duke Theming** - Player 1's board uses a Carolina Blue color palette, and Player 2's board is themed in Duke Blue. The grid borders, score boxes, and overlays all match.

## How to Play

2. Choose **Solo** or **Versus** from the menu
3. Slide tiles to merge matching numbers: `2 + 2 = 4`, `4 + 4 = 8`, and so on
4. Use the **Shuffle** button when you're stuck
5. Game ends when no moves remain

### Controls

| Action | Solo | Versus — P1 | Versus — P2 |
|--------|------|-------------|-------------|
| Move Up | ↑ | W | ↑ |
| Move Down | ↓ | S | ↓ |
| Move Left | ← | A | ← |
| Move Right | → | D | → |
