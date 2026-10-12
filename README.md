# Fibonacci Clock

Five squares, worth 1, 1, 2, 3, and 5, show the time. Red counts toward the hour, green counts toward the minutes, blue counts toward both, and white is off. Hours use a 12-hour face. Minutes move in five-minute steps. When more than one coloring adds up to the hour or the minutes, the clock picks one at random.

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

`npm test` checks the square combinations and the 12-hour, five-minute rules.

Vite is configured with `base: '/fibonacciClock/'`. Pushes to `master` build the app and deploy `dist` to GitHub Pages through [`.github/workflows/pages.yml`](.github/workflows/pages.yml).

## Original Python

The Python 2 and pygame implementation is preserved in [`python/fibonacci.py`](python/fibonacci.py). The React clock uses the same squares, the same colors, the same combination tables, and the same random choice among them. Running that original program requires Python 2 and pygame.
