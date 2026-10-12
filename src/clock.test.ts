import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  FIB_COMBINATIONS,
  SQUARE_VALUES,
  faceFromDate,
  facesFor,
  fibConvert,
  fiveMinuteBucket,
  formatFace,
  hourEquation,
  masksFromCells,
  minuteBucket,
  minuteEquation,
  partsFromDate,
  readingFromDate,
  rerollFace,
  rerollReading,
  squareParts,
  timeConvert,
} from "./clock.ts"

function maskSum(mask: readonly number[]): number {
  return mask.reduce((sum, bit, index) => sum + bit * SQUARE_VALUES[index], 0)
}

function sameMask(left: readonly number[], right: readonly number[]): boolean {
  return left.every((bit, index) => bit === right[index])
}

describe("fibConvert", () => {
  it("matches the Python tables and each mask sums to its index", () => {
    assert.equal(FIB_COMBINATIONS.length, 13)
    for (let value = 0; value <= 12; value++) {
      const masks = fibConvert(value)
      assert.ok(masks.length > 0)
      for (const mask of masks) {
        assert.equal(mask.length, 5)
        assert.ok(mask.every((bit) => bit === 0 || bit === 1))
        assert.equal(maskSum(mask), value)
      }
    }
  })

  it("rejects values the Python table does not define", () => {
    assert.throws(() => fibConvert(13))
    assert.throws(() => fibConvert(-1))
  })
})

describe("timeConvert", () => {
  it("picks the first combination when random returns 0", () => {
    assert.deepEqual(timeConvert(5, 5, () => 0), [4, 4, 0, 4, 0])
    assert.deepEqual(timeConvert(1, 0, () => 0), [1, 0, 0, 0, 0])
    assert.deepEqual(timeConvert(12, 11, () => 0), [1, 4, 4, 4, 4])
  })

  it("picks the last combination when random is just under 1", () => {
    assert.deepEqual(timeConvert(1, 0, () => 0.999), [0, 1, 0, 0, 0])
    assert.deepEqual(timeConvert(2, 2, () => 0.999), [0, 0, 4, 0, 0])
  })

  it("only uses masks from the Python tables", () => {
    for (let hour = 1; hour <= 12; hour++) {
      for (let minuteSteps = 0; minuteSteps <= 11; minuteSteps++) {
        for (let sample = 0; sample < 30; sample++) {
          const cells = timeConvert(hour, minuteSteps)
          const masks = masksFromCells(cells)
          assert.ok(FIB_COMBINATIONS[hour].some((mask) => sameMask(mask, masks.hour)))
          assert.ok(
            FIB_COMBINATIONS[minuteSteps].some((mask) => sameMask(mask, masks.minute)),
          )
          assert.equal(squareParts(cells, "hour").reduce((sum, value) => sum + value, 0), hour)
          assert.equal(
            squareParts(cells, "minute").reduce((sum, value) => sum + value, 0),
            minuteSteps,
          )
        }
      }
    }
  })
})

describe("clock time rules", () => {
  it("uses a 12-hour face and five-minute steps", () => {
    assert.deepEqual(partsFromDate(new Date(2026, 9, 12, 0, 3, 59)), {
      hour: 12,
      minuteSteps: 0,
    })
    assert.deepEqual(partsFromDate(new Date(2026, 9, 12, 12, 0, 0)), {
      hour: 12,
      minuteSteps: 0,
    })
    assert.deepEqual(partsFromDate(new Date(2026, 9, 12, 15, 39, 0)), {
      hour: 3,
      minuteSteps: 7,
    })
    assert.deepEqual(partsFromDate(new Date(2026, 9, 12, 23, 59, 0)), {
      hour: 11,
      minuteSteps: 11,
    })
  })

  it("keeps one bucket within a five-minute step", () => {
    const early = new Date(2026, 9, 12, 10, 0, 1)
    const later = new Date(2026, 9, 12, 10, 4, 59)
    const next = new Date(2026, 9, 12, 10, 5, 0)
    assert.equal(fiveMinuteBucket(early), fiveMinuteBucket(later))
    assert.notEqual(fiveMinuteBucket(later), fiveMinuteBucket(next))
  })

  it("formats the face and the color equations", () => {
    const reading = readingFromDate(new Date(2026, 9, 12, 6, 41, 8), () => 0)
    assert.equal(reading.hour, 6)
    assert.equal(reading.minuteSteps, 8)
    assert.equal(formatFace(reading.hour, reading.minuteSteps), "6:40")
    assert.equal(hourEquation(squareParts(reading.cells, "hour")), "1 + 5 = 6")
    assert.equal(minuteEquation(squareParts(reading.cells, "minute")), "(1 + 2 + 5) × 5 = 40")
    assert.equal(minuteEquation([]), "0")
  })
})

describe("minute face refresh", () => {
  it("lists every hour and minute combination once", () => {
    for (let hour = 0; hour <= 12; hour++) {
      for (let minuteSteps = 0; minuteSteps <= 12; minuteSteps++) {
        const faces = facesFor(hour, minuteSteps)
        assert.equal(
          faces.length,
          FIB_COMBINATIONS[hour].length * FIB_COMBINATIONS[minuteSteps].length,
        )
        const keys = new Set(faces.map((face) => face.join(",")))
        assert.equal(keys.size, faces.length)
        for (const face of faces) {
          const masks = masksFromCells(face)
          assert.ok(FIB_COMBINATIONS[hour].some((mask) => sameMask(mask, masks.hour)))
          assert.ok(FIB_COMBINATIONS[minuteSteps].some((mask) => sameMask(mask, masks.minute)))
        }
      }
    }
  })

  it("changes on each wall-clock minute inside one five-minute step", () => {
    const first = new Date(2026, 9, 12, 10, 5, 0)
    const sameMinute = new Date(2026, 9, 12, 10, 5, 59)
    const nextMinute = new Date(2026, 9, 12, 10, 6, 0)
    const lastInStep = new Date(2026, 9, 12, 10, 9, 59)
    const nextStep = new Date(2026, 9, 12, 10, 10, 0)
    assert.equal(minuteBucket(first), minuteBucket(sameMinute))
    assert.notEqual(minuteBucket(first), minuteBucket(nextMinute))
    assert.notEqual(minuteBucket(nextMinute), minuteBucket(lastInStep))
    assert.equal(fiveMinuteBucket(first), fiveMinuteBucket(lastInStep))
    assert.notEqual(fiveMinuteBucket(lastInStep), fiveMinuteBucket(nextStep))
    assert.notEqual(minuteBucket(new Date(2026, 9, 12, 10, 59, 59)), minuteBucket(nextStep))
    assert.notEqual(
      minuteBucket(new Date(2026, 9, 12, 10, 59, 59)),
      minuteBucket(new Date(2026, 9, 12, 11, 0, 0)),
    )
  })

  it("keeps the five-minute time and switches to the other coloring", () => {
    const start = new Date(2026, 9, 12, 10, 1, 30)
    const first = readingFromDate(start, () => 0)
    assert.equal(first.hour, 10)
    assert.equal(first.minuteSteps, 0)
    assert.deepEqual(first.cells, [1, 1, 0, 1, 1])

    const next = rerollReading(new Date(2026, 9, 12, 10, 2, 0), first, () => 0)
    assert.equal(next.hour, 10)
    assert.equal(next.minuteSteps, 0)
    assert.deepEqual(next.cells, [0, 0, 1, 1, 1])
    assert.equal(formatFace(next.hour, next.minuteSteps), "10:00")

    for (let step = 0; step < 10; step++) {
      const rolled = rerollFace(10, 0, first.cells, () => step / 10)
      assert.deepEqual(rolled, [0, 0, 1, 1, 1])
    }
  })

  it("walks every other face and can return to an earlier one", () => {
    const faces = facesFor(1, 1)
    assert.equal(faces.length, 4)
    const current = faces[0]
    const seen: string[] = []
    for (let index = 0; index < faces.length - 1; index++) {
      const rolled = rerollFace(1, 1, current, () => (index + 0.5) / (faces.length - 1))
      seen.push(rolled.join(","))
      assert.notDeepEqual(rolled, current)
    }
    assert.deepEqual(seen, ["1,3,0,0,0", "3,1,0,0,0", "0,4,0,0,0"])
    assert.deepEqual(rerollFace(1, 1, faces[0], () => 0), [1, 3, 0, 0, 0])
    assert.deepEqual(rerollFace(1, 1, faces[0], () => 0.999), [0, 4, 0, 0, 0])
    assert.deepEqual(rerollFace(1, 1, faces[2], () => 0), faces[0])

    const back = rerollReading(
      new Date(2026, 9, 12, 1, 7, 0),
      { hour: 1, minuteSteps: 1, cells: faces[1] },
      () => 0,
    )
    assert.equal(back.hour, 1)
    assert.equal(back.minuteSteps, 1)
    assert.deepEqual(back.cells, faces[0])
  })

  it("repeats the only coloring when the time has a single face", () => {
    const current = readingFromDate(new Date(2026, 9, 12, 12, 0, 10), () => 0.4)
    assert.equal(facesFor(12, 0).length, 1)
    const rolled = rerollReading(new Date(2026, 9, 12, 12, 1, 0), current, () => 0.9)
    assert.equal(rolled.hour, 12)
    assert.equal(rolled.minuteSteps, 0)
    assert.deepEqual(rolled.cells, current.cells)
    assert.deepEqual(rolled.cells, [1, 1, 1, 1, 1])
  })

  it("uses a fresh timeConvert pick when the five-minute step changes", () => {
    const current = readingFromDate(new Date(2026, 9, 12, 1, 4, 0), () => 0)
    assert.deepEqual(current.cells, [1, 0, 0, 0, 0])
    const rolled = rerollReading(new Date(2026, 9, 12, 1, 5, 0), current, () => 0)
    assert.equal(rolled.hour, 1)
    assert.equal(rolled.minuteSteps, 1)
    assert.deepEqual(rolled.cells, timeConvert(1, 1, () => 0))
    assert.deepEqual(rolled.cells, [4, 0, 0, 0, 0])
  })

  it("holds the face within a minute and re-rolls on the next minute boundary", () => {
    const first = faceFromDate(new Date(2026, 9, 12, 10, 6, 10), undefined, () => 0)
    assert.equal(first.reading.hour, 10)
    assert.equal(first.reading.minuteSteps, 1)
    assert.equal(formatFace(first.reading.hour, first.reading.minuteSteps), "10:05")

    const later = faceFromDate(new Date(2026, 9, 12, 10, 6, 50), first, () => 0)
    assert.equal(later, first)

    const nextMinute = faceFromDate(new Date(2026, 9, 12, 10, 7, 0), first, () => 0)
    assert.notEqual(nextMinute.minute, first.minute)
    assert.equal(nextMinute.reading.hour, first.reading.hour)
    assert.equal(nextMinute.reading.minuteSteps, first.reading.minuteSteps)
    assert.notDeepEqual(nextMinute.reading.cells, first.reading.cells)
    assert.equal(fiveMinuteBucket(new Date(2026, 9, 12, 10, 6, 10)), fiveMinuteBucket(new Date(2026, 9, 12, 10, 7, 0)))

    const onlyFace = faceFromDate(new Date(2026, 9, 12, 12, 0, 20), undefined, () => 0)
    const stillOnly = faceFromDate(new Date(2026, 9, 12, 12, 1, 0), onlyFace, () => 0.5)
    assert.notEqual(stillOnly, onlyFace)
    assert.deepEqual(stillOnly.reading.cells, onlyFace.reading.cells)
    assert.equal(stillOnly.reading.minuteSteps, 0)
  })
})
