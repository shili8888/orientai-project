import assert from "node:assert/strict";
import test from "node:test";
import { lunarToSolar } from "../lib/lunar";

test("converts Lunar New Year 2024 to its Gregorian date", () => {
  assert.deepEqual(
    lunarToSolar({ year: 2024, month: 1, day: 1, isLeapMonth: false }),
    {
      lunarDate: "2024年1月1日",
      solarDate: "2024-02-10",
      weekday: "星期六",
    }
  );
});

test("supports leap-month dates", () => {
  const converted = lunarToSolar({
    year: 2023,
    month: 2,
    day: 1,
    isLeapMonth: true,
  });
  assert.equal(converted.solarDate, "2023-03-22");
  assert.equal(converted.lunarDate, "2023年闰2月1日");
});

test("rejects a leap month not present in the selected year", () => {
  assert.throws(
    () =>
      lunarToSolar({
        year: 2024,
        month: 2,
        day: 1,
        isLeapMonth: true,
      }),
    /不存在所选闰月/
  );
});
