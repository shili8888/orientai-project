import assert from "node:assert/strict";
import test from "node:test";
import { calculateBazi } from "../lib/bazi";
import {
  calculateBirthChart,
  CHINESE_DAYS,
  dateForBirth,
  defaultBirthDetails,
  timeUsed,
} from "../lib/birth";

test("lunar birth dates are converted to Gregorian before real chart calculation", () => {
  const birth = {
    ...defaultBirthDetails("女"),
    name: "农历样例",
    calendar: "农历" as const,
    year: 2023,
    month: 2,
    day: 1,
    isLeapMonth: true,
    birthTime: "09:30",
    province: "北京市",
    city: "市辖区",
    district: "朝阳区",
  };
  const converted = dateForBirth(birth);
  assert.equal(converted.solarDate, "2023-03-22");

  const result = calculateBirthChart(birth);
  const expected = calculateBazi(new Date(2023, 2, 22, 12), "09:30", "女");
  assert.equal(result.dayPillar, expected.dayPillar);
  assert.equal(result.hourPillar, expected.hourPillar);
});

test("lunar date labels use Chinese lunar day names", () => {
  assert.equal(CHINESE_DAYS[0], "初一");
  assert.equal(CHINESE_DAYS[9], "初十");
  assert.equal(CHINESE_DAYS[10], "十一");
  assert.equal(CHINESE_DAYS[19], "二十");
  assert.equal(CHINESE_DAYS[20], "廿一");
  assert.equal(CHINESE_DAYS[28], "廿九");
  assert.equal(CHINESE_DAYS[29], "三十");
  assert.equal(CHINESE_DAYS.length, 30);
});

test("requires name and complete province, city, district", () => {
  assert.throws(
    () => calculateBirthChart(defaultBirthDetails()),
    /请填写姓名/
  );
});

test("marks an uncertain time as an explicit noon placeholder", () => {
  const birth = {
    ...defaultBirthDetails(),
    name: "未确定",
    timeMode: "时间不确定" as const,
    province: "北京市",
    city: "市辖区",
    district: "朝阳区",
  };
  const result = calculateBirthChart(birth);
  const noonChart = calculateBazi(
    new Date(birth.year, birth.month - 1, birth.day, 12),
    "12:00",
    birth.gender
  );
  assert.equal(result.hourPillar, noonChart.hourPillar);
  assert.match(timeUsed(birth), /午时作为排盘占位/);
});
