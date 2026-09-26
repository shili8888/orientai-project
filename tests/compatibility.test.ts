import assert from "node:assert/strict";
import test from "node:test";
import { calculateBazi } from "../lib/bazi";
import { defaultBirthDetails } from "../lib/birth";
import { calculateCompatibility } from "../lib/compatibility";

test("returns a bounded comparison with actionable factors", () => {
  const first = calculateBazi(new Date(1992, 4, 10), "08:30", "男");
  const second = calculateBazi(new Date(1994, 8, 18), "20:15", "女");
  const firstBirth = {
    ...defaultBirthDetails("男"),
    name: "甲",
    year: 1992,
    month: 5,
    day: 10,
    province: "北京市",
    city: "市辖区",
    district: "朝阳区",
  };
  const secondBirth = {
    ...defaultBirthDetails("女"),
    name: "乙",
    year: 1994,
    month: 9,
    day: 18,
    province: "上海市",
    city: "市辖区",
    district: "黄浦区",
  };
  const result = calculateCompatibility(first, second, firstBirth, secondBirth);

  assert.ok(result.score >= 40 && result.score <= 95);
  assert.equal(result.firstName, "甲");
  assert.equal(result.secondName, "乙");
  assert.equal(result.factors.length, 3);
  assert.ok(result.summary.length > 0);
});
