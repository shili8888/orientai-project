import assert from "node:assert/strict";
import test from "node:test";
import {
  BAZI_CALCULATION_VERSION,
  calculateBazi,
} from "../lib/bazi";
import { defaultBirthDetails } from "../lib/birth";
import {
  readSavedData,
  saveLatestResult,
  saveProfile,
} from "../lib/storage";

test("migrates previously saved charts and recalculates new annual cycles", () => {
  const values = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    },
  });

  const { annualFortunes: _annualFortunes, ...legacyResult } = calculateBazi(
    new Date(2000, 0, 1),
    "12:00",
    "男"
  );
  values.set("orientai_bazi_result", JSON.stringify(legacyResult));

  const saved = readSavedData();
  assert.equal(saved.latestResult?.annualFortunes.length, 5);
  assert.equal(saved.latestResult?.birthDate, "2000-01-01");
  assert.ok(values.has("orientai_bazi_data_v1"));
});

test("saves the complete birth profile alongside its real chart", () => {
  const values = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    },
  });
  const birth = {
    ...defaultBirthDetails("女"),
    name: "持久化验收",
    calendar: "农历" as const,
    year: 2023,
    month: 2,
    day: 1,
    isLeapMonth: true,
    timeMode: "选择时辰" as const,
    hourBranch: "巳",
    province: "北京市",
    city: "市辖区",
    district: "朝阳区",
  };
  const result = calculateBazi(new Date(2023, 2, 22, 12), "09:00", "女");

  saveLatestResult(birth, result);
  saveProfile(birth, result);
  const saved = readSavedData();

  assert.equal(saved.latestBirthDetails?.name, "持久化验收");
  assert.equal(saved.latestBirthDetails?.calendar, "农历");
  assert.equal(saved.latestBirthDetails?.isLeapMonth, true);
  assert.equal(saved.latestBirthDetails?.province, "北京市");
  assert.equal(saved.latestBirthDetails?.city, "市辖区");
  assert.equal(saved.latestBirthDetails?.district, "朝阳区");
  assert.equal(saved.latestResult?.dayPillar, result.dayPillar);
  assert.equal(saved.profiles[0].result.dayPillar, result.dayPillar);
});

test("recalculates stored charts when their calculation rules are outdated", () => {
  const values = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    },
  });
  const current = calculateBazi(new Date(2000, 0, 1), "12:00", "男");
  const { calculationVersion: _version, ...outdated } = current;
  const birth = {
    ...defaultBirthDetails("男"),
    name: "旧规则排盘",
  };
  values.set(
    "orientai_bazi_data_v1",
    JSON.stringify({
      latestResult: outdated,
      latestBirthDetails: birth,
      profiles: [],
      latestCompatibility: null,
    })
  );

  const saved = readSavedData();
  assert.equal(
    saved.latestResult?.calculationVersion,
    BAZI_CALCULATION_VERSION
  );
  assert.match(saved.latestResult?.interpretation.romance[0] ?? "", /日支为/);
});
