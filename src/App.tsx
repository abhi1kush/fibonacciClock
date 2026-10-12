import { useEffect, useRef, useState } from "react"
import "./App.css"
import {
  CELL_COLOR,
  CELL_LABEL,
  type CellState,
  type ClockReading,
  faceFromDate,
  formatFace,
  hourEquation,
  minuteEquation,
  squareParts,
  SQUARE_VALUES,
  type TimedFace,
} from "./clock.ts"

interface Snapshot {
  minute: string
  now: Date
  reading: ClockReading
}

const PLACEMENTS = [
  { index: 2, className: "square-2" },
  { index: 1, className: "square-1 square-1-top" },
  { index: 0, className: "square-1 square-1-bottom" },
  { index: 4, className: "square-5" },
  { index: 3, className: "square-3" },
] as const

const LEGEND: CellState[] = [0, 1, 3, 4]

function useFibonacciClock(): Snapshot {
  const [snapshot, setSnapshot] = useState<Snapshot>(() => {
    const now = new Date()
    const face = faceFromDate(now)
    return { minute: face.minute, now, reading: face.reading }
  })
  const faceRef = useRef<TimedFace>({
    minute: snapshot.minute,
    reading: snapshot.reading,
  })

  useEffect(() => {
    let timer = 0

    const update = () => {
      const date = new Date()
      const next = faceFromDate(date, faceRef.current)
      if (next !== faceRef.current) {
        faceRef.current = next
        setSnapshot({ minute: next.minute, now: date, reading: next.reading })
        return
      }
      setSnapshot((prev) => ({ ...prev, now: date }))
    }

    const arm = () => {
      const delay = 1000 - (Date.now() % 1000)
      timer = window.setTimeout(() => {
        update()
        arm()
      }, delay)
    }

    arm()
    window.addEventListener("focus", update)
    document.addEventListener("visibilitychange", update)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener("focus", update)
      document.removeEventListener("visibilitychange", update)
    }
  }, [])

  return snapshot
}

function App() {
  const { now, reading } = useFibonacciClock()
  const hourParts = squareParts(reading.cells, "hour")
  const minuteParts = squareParts(reading.cells, "minute")
  const face = formatFace(reading.hour, reading.minuteSteps)
  const digital = now.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  })
  const dateLine = now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  return (
    <main className="layout">
      <header className="title-block">
        <p className="eyebrow">Five squares, one clock</p>
        <h1>Fibonacci Clock</h1>
      </header>

      <div className="clock-wrap">
        <div
          className="clock"
          role="img"
          aria-label={`Fibonacci clock reading ${face}. Hours ${hourEquation(hourParts)}. Minutes ${minuteEquation(minuteParts)}.`}
        >
          {PLACEMENTS.map(({ index, className }) => {
            const cell = reading.cells[index]
            const value = SQUARE_VALUES[index]
            return (
              <div
                key={index}
                className={`square ${className}`}
                style={{ background: CELL_COLOR[cell], color: cell === 1 || cell === 4 ? "#fff" : "#111" }}
                title={`${value}, ${CELL_LABEL[cell].toLowerCase()}`}
                aria-hidden="true"
              >
                {value}
              </div>
            )
          })}
        </div>
      </div>

      <div className="sidebar">
        <section className="card readout" aria-label="Digital time">
          <p className="digital">{digital}</p>
          <p className="date">{dateLine}</p>
          <p className="face-line">
            Face reads <strong>{face}</strong>
          </p>
          <div className="equations">
            <p className="equation">
              <span>Hours</span>
              <strong>{hourEquation(hourParts)}</strong>
            </p>
            <p className="equation">
              <span>Minutes</span>
              <strong>{minuteEquation(minuteParts)}</strong>
            </p>
          </div>
        </section>

        <section className="card legend-card" aria-labelledby="legend-title">
          <h2 id="legend-title">How to read it</h2>
          <ul className="legend">
            {LEGEND.map((cell) => (
              <li key={cell}>
                <i className="swatch" style={{ background: CELL_COLOR[cell] }} aria-hidden="true" />
                <span>
                  {CELL_LABEL[cell]}
                  {cell === 0 ? " — leave this square out" : ""}
                  {cell === 1 ? " — count it toward the hour" : ""}
                  {cell === 3 ? " — count it toward the minutes" : ""}
                  {cell === 4 ? " — count it toward both" : ""}
                </span>
              </li>
            ))}
          </ul>
          <p className="help">
            The squares are worth 1, 1, 2, 3, and 5. Add the red and blue squares
            for the hour on a 12-hour clock. Add the green and blue squares and
            multiply by 5 for the minutes. The face steps every five minutes and
            does not show AM or PM. A coloring is chosen at random and chosen
            again at each minute. When more than one coloring adds up to that
            time, the next choice is a different one.
          </p>
          <p className="source">
            <a href="https://github.com/abhi1kush/fibonacciClock/blob/master/python/fibonacci.py">
              Original Python clock
            </a>
          </p>
        </section>
      </div>
    </main>
  )
}

export default App
