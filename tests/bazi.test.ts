import assert from "node:assert/strict";
import test from "node:test";
import { calculateBazi } from "../lib/bazi";

test("calculates four pillars, ten-year luck cycles and annual fortunes", () => {
  const result = calculateBazi(new Date(2000, 0, 1), "12:00", "男");

  assert.equal(result.birthDate, "2000-01-01");
  assert.equal(result.yearPillar, "己卯");
  assert.equal(result.monthPillar, "丙子");
  assert.equal(result.dayPillar, "戊午");
  assert.equal(result.hourPillar, "戊午");
  assert.equal(result.daYun.length, 10);
  assert.equal(result.annualFortunes.length, 5);
  assert.ok(result.annualFortunes.some((fortune) => fortune.year === result.currentYear));
  assert.deepEqual(
    result.annualFortunes.map((fortune) => fortune.year),
    [result.currentYear, result.currentYear + 1, result.currentYear + 2, result.currentYear + 3, result.currentYear + 4]
  );
  assert.ok(result.daYun.every((luck) => Boolean(luck.analysis)));
  assert.ok(result.lunarDate.length > 0);
});

test("rejects an invalid birth time", () => {
  assert.throws(
    () => calculateBazi(new Date(2000, 0, 1), "24:00", "男"),
    /24 小时制/
  );
});

test("rejects an invalid birth date", () => {
  assert.throws(
    () => calculateBazi(new Date(Number.NaN), "12:00", "女"),
    /出生日期无效/
  );
});
