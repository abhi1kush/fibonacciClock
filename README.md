# Fibonacci Clock

Five squares, worth 1, 1, 2, 3, and 5, show the time. Red counts toward the hour, green counts toward the minutes, blue counts toward both, and white is off. Hours use a 12-hour face. Minutes move in five-minute steps. The coloring is chosen at random and chosen again at each minute. When more than one coloring adds up to that time, the next choice is a different one.

**Live:** https://abhi1kush.github.io/fibonacciClock/

## React app

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

`npm test` checks the square combinations, the 12-hour five-minute rules, and the minute face refresh.

Vite is configured with `base: '/fibonacciClock/'`. Pushes to `master` build the app and deploy `dist` to GitHub Pages through [`.github/workflows/pages.yml`](.github/workflows/pages.yml).

## Original Python

The Python 2 and pygame implementation is preserved in [`python/fibonacci.py`](python/fibonacci.py). The React clock uses the same squares, the same colors, and the same combination tables. It still chooses a coloring at random from those tables, then chooses again at each minute and switches to a different valid coloring when one exists. The original program redraws every five minutes. Running that original program requires Python 2 and pygame.
