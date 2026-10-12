/**
 * Port of the Python 2 Fibonacci clock in `python/fibonacci.py`.
 *
 * Squares, in mask order, are worth 1, 1, 2, 3, and 5. Hours and minutes
 * are chosen independently from the same combination tables as `fibConvert`.
 * A square's color is the hour flag (0 or 1) plus the minute flag (0 or 3):
 * 0 white / off, 1 red / hours, 3 green / minutes, 4 blue / both.
 *
 * The displayed time still changes on five-minute steps, matching the Python
 * clock. The React face is re-rolled on every wall-clock minute, and that
 * roll is a different valid coloring when more than one exists.
 */

export const SQUARE_VALUES = [1, 1, 2, 3, 5] as const

export type Mask = readonly [number, number, number, number, number]

/** Every mask `fibConvert` returns, in the same order. */
export const FIB_COMBINATIONS: readonly Mask[][] = [
  [[0, 0, 0, 0, 0]],
  [
    [1, 0, 0, 0, 0],
    [0, 1, 0, 0, 0],
  ],
  [
    [1, 1, 0, 0, 0],
    [0, 0, 1, 0, 0],
  ],
  [
    [1, 0, 1, 0, 0],
    [0, 1, 1, 0, 0],
    [0, 0, 0, 1, 0],
  ],
  [
    [1, 1, 1, 0, 0],
    [0, 1, 0, 1, 0],
    [1, 0, 0, 1, 0],
  ],
  [
    [1, 1, 0, 1, 0],
    [0, 0, 1, 1, 0],
    [0, 0, 0, 0, 1],
  ],
  [
    [1, 0, 0, 0, 1],
    [0, 1, 0, 0, 1],
    [0, 1, 1, 1, 0],
    [1, 0, 1, 1, 0],
  ],
  [
    [1, 1, 0, 0, 1],
    [0, 0, 1, 0, 1],
    [1, 1, 1, 1, 0],
  ],
  [
    [1, 0, 1, 0, 1],
    [0, 1, 1, 0, 1],
    [0, 0, 0, 1, 1],
  ],
  [
    [1, 0, 0, 1, 1],
    [0, 1, 0, 1, 1],
    [1, 1, 1, 0, 1],
  ],
  [
    [1, 1, 0, 1, 1],
    [0, 0, 1, 1, 1],
  ],
  [
    [0, 1, 1, 1, 1],
    [1, 0, 1, 1, 1],
  ],
  [[1, 1, 1, 1, 1]],
]

/** 0 off, 1 hours, 3 minutes, 4 both. Matches `fill_color`. */
export type CellState = 0 | 1 | 3 | 4

export const CELL_COLOR: Record<CellState, string> = {
  0: "rgb(255, 255, 255)",
  1: "rgb(255, 0, 0)",
  3: "rgb(0, 255, 0)",
  4: "rgb(0, 0, 255)",
}

export const CELL_LABEL: Record<CellState, string> = {
  0: "Off",
  1: "Hours",
  3: "Minutes",
  4: "Both",
}

export interface ClockReading {
  /** 1–12, with midnight and noon as 12. */
  hour: number
  /** 0–11. Each step is five minutes. */
  minuteSteps: number
  cells: CellState[]
}

export function fibConvert(x: number): readonly Mask[] {
  const list = FIB_COMBINATIONS[x]
  if (!list) {
    throw new Error(`No Fibonacci combination for ${x}`)
  }
  return list
}

/** Inclusive index pick, matching `random.randint(0, len - 1)`. */
export function pickIndex(length: number, random: () => number = Math.random): number {
  return Math.floor(random() * length)
}

function cellsFromMasks(hourMask: readonly number[], minuteMask: readonly number[]): CellState[] {
  const cells: CellState[] = []
  for (let i = 0; i < SQUARE_VALUES.length; i++) {
    const minuteFlag = minuteMask[i] === 1 ? minuteMask[i] + 2 : minuteMask[i]
    cells.push((hourMask[i] + minuteFlag) as CellState)
  }
  return cells
}

function sameCells(left: readonly CellState[], right: readonly CellState[]): boolean {
  return left.length === right.length && left.every((cell, index) => cell === right[index])
}

/** Every valid coloring for this hour and five-minute step, in table order. */
export function facesFor(hour: number, minuteSteps: number): CellState[][] {
  const hourList = fibConvert(hour)
  const minuteList = fibConvert(minuteSteps)
  const faces: CellState[][] = []
  for (const hourMask of hourList) {
    for (const minuteMask of minuteList) {
      faces.push(cellsFromMasks(hourMask, minuteMask))
    }
  }
  return faces
}

export function timeConvert(
  hour: number,
  minuteSteps: number,
  random: () => number = Math.random,
): CellState[] {
  const hourList = fibConvert(hour)
  const minuteList = fibConvert(minuteSteps)
  const hList = hourList[pickIndex(hourList.length, random)]
  const tmpList = minuteList[pickIndex(minuteList.length, random)]
  return cellsFromMasks(hList, tmpList)
}

/**
 * Choose a coloring for this quantized time. A fresh pick uses `timeConvert`.
 * When `current` is already a valid coloring and another one exists, the
 * result is one of the others.
 */
export function rerollFace(
  hour: number,
  minuteSteps: number,
  current: readonly CellState[],
  random: () => number = Math.random,
): CellState[] {
  const faces = facesFor(hour, minuteSteps)
  const avoidIndex = faces.findIndex((face) => sameCells(face, current))
  if (avoidIndex < 0 || faces.length <= 1) {
    return timeConvert(hour, minuteSteps, random)
  }
  let pick = pickIndex(faces.length - 1, random)
  if (pick >= avoidIndex) pick += 1
  return faces[pick]
}

/** 12-hour face and five-minute minute count, matching the Python loop. */
export function partsFromDate(date: Date): { hour: number; minuteSteps: number } {
  const hour24 = date.getHours()
  const hour = hour24 % 12 === 0 ? 12 : hour24 % 12
  const minuteSteps = Math.floor(date.getMinutes() / 5)
  return { hour, minuteSteps }
}

export function readingFromDate(date: Date, random: () => number = Math.random): ClockReading {
  const { hour, minuteSteps } = partsFromDate(date)
  return {
    hour,
    minuteSteps,
    cells: timeConvert(hour, minuteSteps, random),
  }
}

/** Re-pick the coloring for `date`, avoiding `current` when another face exists. */
export function rerollReading(
  date: Date,
  current: ClockReading,
  random: () => number = Math.random,
): ClockReading {
  const { hour, minuteSteps } = partsFromDate(date)
  return {
    hour,
    minuteSteps,
    cells: rerollFace(hour, minuteSteps, current.cells, random),
  }
}

/** Changes once per five local minutes, when the Python loop would redraw. */
export function fiveMinuteBucket(date: Date): string {
  return [
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    Math.floor(date.getMinutes() / 5),
  ].join("-")
}

/** Changes once per local minute, when the React face is re-rolled. */
export function minuteBucket(date: Date): string {
  return [
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
  ].join("-")
}

export interface TimedFace {
  /** Wall-clock minute this coloring was chosen. */
  minute: string
  reading: ClockReading
}

/**
 * Keep the current coloring inside a wall-clock minute. On a new minute,
 * re-roll it while the hour and five-minute step stay quantized.
 */
export function faceFromDate(
  date: Date,
  previous?: TimedFace,
  random: () => number = Math.random,
): TimedFace {
  const minute = minuteBucket(date)
  if (previous && previous.minute === minute) return previous
  const reading = previous
    ? rerollReading(date, previous.reading, random)
    : readingFromDate(date, random)
  return { minute, reading }
}

export function squareParts(cells: readonly CellState[], kind: "hour" | "minute"): number[] {
  const parts: number[] = []
  cells.forEach((cell, index) => {
    const counts =
      kind === "hour" ? cell === 1 || cell === 4 : cell === 3 || cell === 4
    if (counts) parts.push(SQUARE_VALUES[index])
  })
  return parts
}

export function hourEquation(parts: readonly number[]): string {
  const total = parts.reduce((sum, value) => sum + value, 0)
  if (parts.length === 0) return "0"
  if (parts.length === 1) return `${parts[0]} = ${total}`
  return `${parts.join(" + ")} = ${total}`
}

export function minuteEquation(parts: readonly number[]): string {
  const steps = parts.reduce((sum, value) => sum + value, 0)
  const minutes = steps * 5
  if (parts.length === 0) return "0"
  if (parts.length === 1) return `${parts[0]} × 5 = ${minutes}`
  return `(${parts.join(" + ")}) × 5 = ${minutes}`
}

export function formatFace(hour: number, minuteSteps: number): string {
  return `${hour}:${String(minuteSteps * 5).padStart(2, "0")}`
}

export function masksFromCells(cells: readonly CellState[]): { hour: number[]; minute: number[] } {
  return {
    hour: cells.map((cell) => (cell === 1 || cell === 4 ? 1 : 0)),
    minute: cells.map((cell) => (cell === 3 || cell === 4 ? 1 : 0)),
  }
}
