import {
  BAZI_CALCULATION_VERSION,
  calculateBazi,
  type BaziResult,
} from "@/lib/bazi";
import type { BirthDetails } from "@/lib/birth";
import { CompatibilityResult } from "@/lib/compatibility";

const STORAGE_KEY = "orientai_bazi_data_v1";
const LEGACY_RESULT_KEY = "orientai_bazi_result";

export type SavedProfile = {
  id: string;
  name: string;
  savedAt: string;
  birthDetails: BirthDetails;
  result: BaziResult;
};

export type SavedData = {
  latestResult: BaziResult | null;
  latestBirthDetails: BirthDetails | null;
  profiles: SavedProfile[];
  latestCompatibility: CompatibilityResult | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isBaziResult(value: unknown): value is BaziResult {
  if (!isRecord(value)) return false;
  return (
    typeof value.birthDate === "string" &&
    typeof value.birthTime === "string" &&
    (value.gender === "男" || value.gender === "女") &&
    typeof value.yearPillar === "string" &&
    typeof value.monthPillar === "string" &&
    typeof value.dayPillar === "string" &&
    typeof value.hourPillar === "string" &&
    isRecord(value.year) &&
    isRecord(value.month) &&
    isRecord(value.day) &&
    isRecord(value.hour) &&
    Array.isArray(value.daYun) &&
    Array.isArray(value.annualFortunes)
  );
}

function isBirthDetails(value: unknown): value is BirthDetails {
  return (
    isRecord(value) &&
    typeof value.name === "string" &&
    (value.gender === "男" || value.gender === "女") &&
    (value.calendar === "公历" || value.calendar === "农历") &&
    Number.isInteger(value.year) &&
    Number.isInteger(value.month) &&
    Number.isInteger(value.day) &&
    typeof value.isLeapMonth === "boolean" &&
    (value.timeMode === "精准时间" ||
      value.timeMode === "选择时辰" ||
      value.timeMode === "时间不确定") &&
    typeof value.birthTime === "string" &&
    typeof value.hourBranch === "string" &&
    typeof value.province === "string" &&
    typeof value.city === "string" &&
    typeof value.district === "string"
  );
}

function isCompatibilityResult(
  value: unknown
): value is CompatibilityResult {
  return (
    isRecord(value) &&
    typeof value.firstName === "string" &&
    typeof value.secondName === "string" &&
    typeof value.score === "number" &&
    typeof value.summary === "string" &&
    Array.isArray(value.factors) &&
    isBirthDetails(value.firstBirthDetails) &&
    isBirthDetails(value.secondBirthDetails) &&
    isRecord(value.firstChart) &&
    isRecord(value.secondChart) &&
    typeof value.calculatedAt === "string"
  );
}

function deriveLegacyBirthDetails(
  result: BaziResult,
  name = ""
): BirthDetails {
  const [year, month, day] = result.birthDate.split("-").map(Number);
  return {
    name,
    gender: result.gender,
    calendar: "公历",
    year,
    month,
    day,
    isLeapMonth: false,
    timeMode: "精准时间",
    birthTime: result.birthTime,
    hourBranch: "午",
    province: "",
    city: "",
    district: "",
  };
}

function shouldRecalculate(result: BaziResult): boolean {
  const firstFortune = result.annualFortunes[0];
  return (
    result.calculationVersion !== BAZI_CALCULATION_VERSION ||
    !firstFortune ||
    firstFortune.year !== new Date().getFullYear() ||
    !result.daYun.every(
      (item) =>
        typeof item.analysis === "string" &&
        typeof item.stemElement === "string" &&
        typeof item.branchElement === "string"
    )
  );
}

function recalculate(result: BaziResult): BaziResult {
  const [year, month, day] = result.birthDate.split("-").map(Number);
  return calculateBazi(
    new Date(year, month - 1, day, 12),
    result.birthTime,
    result.gender
  );
}

function normalizeProfile(
  value: unknown,
  index: number
): SavedProfile | null {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.name !== "string" ||
    typeof value.savedAt !== "string" ||
    !isBaziResult(value.result)
  ) {
    return null;
  }
  const birthDetails = isBirthDetails(value.birthDetails)
    ? value.birthDetails
    : deriveLegacyBirthDetails(value.result, value.name);
  const result = shouldRecalculate(value.result)
    ? recalculate(value.result)
    : value.result;
  return {
    id: value.id || `migrated-${index}`,
    name: value.name,
    savedAt: value.savedAt,
    birthDetails,
    result,
  };
}

function parseSavedData(raw: string): SavedData {
  const value: unknown = JSON.parse(raw);
  if (!isRecord(value)) {
    throw new Error("本地保存的数据格式无效，请检查浏览器存储。");
  }

  if (value.profiles !== undefined && !Array.isArray(value.profiles)) {
    throw new Error("本地个人档案列表格式无效，请检查浏览器存储。");
  }
  const profileEntries = Array.isArray(value.profiles) ? value.profiles : [];
  const legacyProfiles = profileEntries.map((entry, index) => {
    const profile = normalizeProfile(entry, index);
    if (!profile) {
      throw new Error(`第 ${index + 1} 份本地个人档案格式无效。`);
    }
    return profile;
  });

  let latestResult: BaziResult | null = null;
  let latestNeedsRefresh = false;
  if (value.latestResult !== null && value.latestResult !== undefined) {
    if (!isBaziResult(value.latestResult)) {
      throw new Error("本地排盘结果格式无效，请重新排盘。");
    }
    latestNeedsRefresh = shouldRecalculate(value.latestResult);
    latestResult = latestNeedsRefresh
      ? recalculate(value.latestResult)
      : value.latestResult;
  }

  const latestBirthDetails =
    latestResult === null
      ? null
      : isBirthDetails(value.latestBirthDetails)
        ? value.latestBirthDetails
        : deriveLegacyBirthDetails(latestResult);
  const latestCompatibility = isCompatibilityResult(value.latestCompatibility)
    ? value.latestCompatibility
    : null;

  const saved: SavedData = {
    latestResult,
    latestBirthDetails,
    profiles: legacyProfiles,
    latestCompatibility,
  };
  if (
    !isBirthDetails(value.latestBirthDetails) ||
    legacyProfiles.some((profile, index) => {
      const original = profileEntries[index];
      return (
        !isRecord(original) ||
        !isBirthDetails(original.birthDetails) ||
        !isBaziResult(original.result) ||
        shouldRecalculate(original.result)
      );
    })
    || latestNeedsRefresh
  ) {
    writeSavedData(saved);
  }
  return saved;
}

function emptySavedData(): SavedData {
  return {
    latestResult: null,
    latestBirthDetails: null,
    profiles: [],
    latestCompatibility: null,
  };
}

export function readSavedData(): SavedData {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw !== null) return parseSavedData(raw);

  const legacy = localStorage.getItem(LEGACY_RESULT_KEY);
  if (legacy === null) return emptySavedData();

  const value: unknown = JSON.parse(legacy);
  if (
    !isRecord(value) ||
    typeof value.birthDate !== "string" ||
    typeof value.birthTime !== "string" ||
    (value.gender !== "男" && value.gender !== "女")
  ) {
    throw new Error("旧版保存的排盘数据格式无效，请重新排盘。");
  }
  const [year, month, day] = value.birthDate.split("-").map(Number);
  const result = calculateBazi(
    new Date(year, month - 1, day, 12),
    value.birthTime,
    value.gender
  );
  const saved: SavedData = {
    latestResult: result,
    latestBirthDetails: deriveLegacyBirthDetails(result),
    profiles: [],
    latestCompatibility: null,
  };
  writeSavedData(saved);
  return saved;
}

function writeSavedData(data: SavedData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function saveLatestResult(
  birthDetails: BirthDetails,
  result: BaziResult
): void {
  writeSavedData({
    ...readSavedData(),
    latestResult: result,
    latestBirthDetails: birthDetails,
  });
}

export function saveProfile(
  birthDetails: BirthDetails,
  result: BaziResult
): SavedProfile {
  const name = birthDetails.name.trim();
  if (!name) throw new Error("请填写姓名后再保存个人档案。");

  const profile: SavedProfile = {
    id: crypto.randomUUID(),
    name,
    savedAt: new Date().toISOString(),
    birthDetails,
    result,
  };
  const data = readSavedData();
  writeSavedData({
    ...data,
    latestResult: result,
    latestBirthDetails: birthDetails,
    profiles: [profile, ...data.profiles],
  });
  return profile;
}

export function deleteProfile(id: string): void {
  const data = readSavedData();
  writeSavedData({
    ...data,
    profiles: data.profiles.filter((profile) => profile.id !== id),
  });
}

export function saveLatestCompatibility(
  result: CompatibilityResult
): void {
  writeSavedData({ ...readSavedData(), latestCompatibility: result });
}
