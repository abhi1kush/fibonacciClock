import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  FIB_COMBINATIONS,
  SQUARE_VALUES,
  fibConvert,
  fiveMinuteBucket,
  formatFace,
  hourEquation,
  masksFromCells,
  minuteEquation,
  partsFromDate,
  readingFromDate,
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
