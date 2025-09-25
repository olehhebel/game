
# While AI works — Mini Game (9-cell tapper)

Simple, mobile-first web mini-game that runs in **Safari, Chrome, Firefox**, etc.
Use it as a "smart wait" while your AI task is processing.

## Rules
- 9 circular cells. Exactly **one sprite** appears at a time.
- **Flower** = +1 score.
- **Angry flower** = -1 score (no score goes below 0).
- Vibration/haptic on bad tap (supported on Android/desktop browsers with `navigator.vibrate`; iOS Safari usually ignores).

## Run
Just open **index.html** in a browser or host as static files.
- Works as a full-screen phone mock in desktop too.
- Auto-starts on first user tap; or press **Start**.

## Customize
Open `game.js`:
- `ASSETS.good/bad` — path to sprites (current images are in `assets/` and preloaded).
- Spawn odds/speed: tune in `spawn()` and interval in `startGame()`.
- Exposed hooks: `window.AI_MINIGAME.start()`, `window.AI_MINIGAME.stop()`, `window.AI_MINIGAME.setBusy(true/false)` to toggle spinner intensity.

## Notes
- iOS doesn't expose a public Vibration API for Safari; we gracefully call `navigator.vibrate` which is a no-op there.
- All visuals were built with CSS; no frameworks.
- Colors follow your palette: #0E15AB (bg), #D5F20E (accent).
