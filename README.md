# Dragon Stickman Battle

A small mobile-friendly 2D stickman fighting game built with HTML5 Canvas, CSS, and vanilla JavaScript. No framework or build step is required.

## Run it
1. Download or clone this repository.
2. Open `index.html` in a modern browser.
3. On Android, open the project with a local web server or host it with GitHub Pages.

## Controls
- **Phone:** use the on-screen buttons.
- **Keyboard:** ← / → move, ↑ jump, W block, A sword attack, S dragon fire, D dragon special.
- Blue is controlled by the player; Red is controlled by the computer.
- The dragon special uses 25 dragon energy. Regular dragon fire uses 5.

## Project structure
```text
dragon-stickman-battle/
├── index.html
├── README.md
└── src/
    ├── game.js
    └── style.css
```

## GitHub Pages
In your repository, open **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.

## Current prototype features
- Two stickman fighters with matching dragon companions
- AI opponent
- Touch controls and keyboard controls
- Health and dragon-energy bars
- Sword attacks, blocking, jumping, dragon fire and special fireball
- Restart and win screen

This is a playable starter prototype. Multiplayer, character selection, sound, animation sprites, campaign levels and APK packaging can be added in later versions.
