import { calculateBazi, type BaziResult, type Gender } from "@/lib/bazi";
import { lunarToSolar } from "@/lib/lunar";

export type CalendarType = "公历" | "农历";
export type TimeMode = "精准时间" | "选择时辰" | "时间不确定";

export type BirthDetails = {
  name: string;
  gender: Gender;
  calendar: CalendarType;
  year: number;
  month: number;
  day: number;
  isLeapMonth: boolean;
  timeMode: TimeMode;
  birthTime: string;
  hourBranch: string;
  province: string;
  city: string;
  district: string;
};

export const HOUR_BRANCHES = [
  { name: "子时", branch: "子", start: 23 },
  { name: "丑时", branch: "丑", start: 1 },
  { name: "寅时", branch: "寅", start: 3 },
  { name: "卯时", branch: "卯", start: 5 },
  { name: "辰时", branch: "辰", start: 7 },
  { name: "巳时", branch: "巳", start: 9 },
  { name: "午时", branch: "午", start: 11 },
  { name: "未时", branch: "未", start: 13 },
  { name: "申时", branch: "申", start: 15 },
  { name: "酉时", branch: "酉", start: 17 },
  { name: "戌时", branch: "戌", start: 19 },
  { name: "亥时", branch: "亥", start: 21 },
] as const;

export const CHINESE_DAYS = [
  "初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十",
  "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
  "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十",
] as const;

export function dateForBirth(details: BirthDetails): {
  solarDate: string;
  displayDate: string;
} {
  const { year, month, day, calendar, isLeapMonth } = details;
  if (
    !Number.isInteger(year) ||
    year < 1900 ||
    year > 2100 ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12 ||
    !Number.isInteger(day) ||
    day < 1 ||
    day > 31
  ) {
    throw new Error("请输入 1900—2100 年范围内的有效出生日期。");
  }

  if (calendar === "农历") {
    const converted = lunarToSolar({
      year,
      month,
      day,
      isLeapMonth,
    });
    return {
      solarDate: converted.solarDate,
      displayDate: `${year}年${isLeapMonth ? "闰" : ""}${month}月${CHINESE_DAYS[day - 1]}（公历 ${converted.solarDate}）`,
    };
  }

  const solar = new Date(year, month - 1, day, 12);
  if (
    solar.getFullYear() !== year ||
    solar.getMonth() !== month - 1 ||
    solar.getDate() !== day
  ) {
    throw new Error("该公历月份没有这一天。");
  }
  const solarDate = [
    year,
    String(month).padStart(2, "0"),
    String(day).padStart(2, "0"),
  ].join("-");
  return { solarDate, displayDate: `${solarDate}（公历）` };
}

export function calculateBirthChart(details: BirthDetails): BaziResult {
  if (!details.name.trim()) throw new Error("请填写姓名。");
  if (!details.province || !details.city || !details.district) {
    throw new Error("请完整选择出生省、市和区县。");
  }

  const { solarDate } = dateForBirth(details);
  const [year, month, day] = solarDate.split("-").map(Number);
  const birthTime =
    details.timeMode === "时间不确定"
      ? "12:00"
      : details.timeMode === "选择时辰"
        ? `${String(HOUR_BRANCHES.find((item) => item.branch === details.hourBranch)?.start ?? 12).padStart(2, "0")}:00`
        : details.birthTime;
  const result = calculateBazi(
    new Date(year, month - 1, day, 12),
    birthTime,
    details.gender
  );
  return result;
}

export function defaultBirthDetails(gender: Gender = "男"): BirthDetails {
  return {
    name: "",
    gender,
    calendar: "公历",
    year: 1990,
    month: 1,
    day: 1,
    isLeapMonth: false,
    timeMode: "精准时间",
    birthTime: "12:00",
    hourBranch: "午",
    province: "",
    city: "",
    district: "",
  };
}

export function timeUsed(details: BirthDetails): string {
  if (details.timeMode === "时间不确定") return "时间不确定（午时作为排盘占位）";
  if (details.timeMode === "选择时辰") {
    return `${details.hourBranch}时（约 ${HOUR_BRANCHES.find((item) => item.branch === details.hourBranch)?.start}:00）`;
  }
  return details.birthTime;
}
