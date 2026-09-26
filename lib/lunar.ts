import { Lunar, LunarMonth, LunarYear } from "lunar-typescript";

export type LunarDateInput = {
  year: number;
  month: number;
  day: number;
  isLeapMonth: boolean;
};

export type LunarConversion = {
  lunarDate: string;
  solarDate: string;
  weekday: string;
};

export function lunarToSolar(input: LunarDateInput): LunarConversion {
  const { year, month, day, isLeapMonth } = input;
  if (
    !Number.isInteger(year) ||
    year < 1900 ||
    year > 2100 ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12 ||
    !Number.isInteger(day) ||
    day < 1 ||
    day > 30
  ) {
    throw new Error("请输入 1900—2100 年范围内有效的农历日期。");
  }

  const lunarMonth = isLeapMonth ? -month : month;
  const lunarYear = LunarYear.fromYear(year);
  if (isLeapMonth && lunarYear.getLeapMonth() !== month) {
    throw new Error("该年份不存在所选闰月。");
  }
  const monthInfo = LunarMonth.fromYm(year, lunarMonth);
  if (!monthInfo) {
    throw new Error("该年份不存在所选农历月份。");
  }
  if (day > monthInfo.getDayCount()) {
    throw new Error("该农历月份没有这一天。");
  }
  const lunar = Lunar.fromYmd(year, lunarMonth, day);
  if (
    lunar.getYear() !== year ||
    lunar.getMonth() !== lunarMonth ||
    lunar.getDay() !== day
  ) {
    throw new Error("该农历月份没有这一天，或所选年份不存在该闰月。");
  }

  const solar = lunar.getSolar();
  const solarDate = [
    solar.getYear(),
    String(solar.getMonth()).padStart(2, "0"),
    String(solar.getDay()).padStart(2, "0"),
  ].join("-");

  return {
    lunarDate: `${year}年${isLeapMonth ? "闰" : ""}${month}月${day}日`,
    solarDate,
    weekday: `星期${solar.getWeekInChinese()}`,
  };
}
