"use client";

import { useMemo } from "react";
import areaData from "china-area-data";
import { LunarMonth, LunarYear } from "lunar-typescript";
import {
  CHINESE_DAYS,
  type BirthDetails,
  type CalendarType,
  type TimeMode,
  HOUR_BRANCHES,
} from "@/lib/birth";

const AREA_DATA = areaData as Record<string, Record<string, string>>;
const PROVINCES = Object.entries(AREA_DATA["86"] ?? {});
const SELECT_CLASS =
  "w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white";

type Props = {
  value: BirthDetails;
  onChange: (value: BirthDetails) => void;
  heading?: string;
};

export default function BirthDetailsForm({
  value,
  onChange,
  heading = "出生信息",
}: Props) {
  const provinceCode =
    PROVINCES.find(([, name]) => name === value.province)?.[0] ?? "";
  const cities = Object.entries(AREA_DATA[provinceCode] ?? {});
  const cityCode = cities.find(([, name]) => name === value.city)?.[0] ?? "";
  const districts = Object.entries(AREA_DATA[cityCode] ?? {});
  const leapMonth = useMemo(
    () => LunarYear.fromYear(value.year).getLeapMonth(),
    [value.year]
  );
  const validLeapMonth =
    value.calendar === "农历" &&
    leapMonth === value.month &&
    leapMonth !== 0;
  const maxDay = useMemo(() => {
    if (value.calendar === "农历") {
      const lunarMonth = value.isLeapMonth ? -value.month : value.month;
      return LunarMonth.fromYm(value.year, lunarMonth)?.getDayCount() ?? 30;
    }
    return new Date(value.year, value.month, 0).getDate();
  }, [value.calendar, value.day, value.isLeapMonth, value.month, value.year]);

  function update<K extends keyof BirthDetails>(
    field: K,
    nextValue: BirthDetails[K]
  ) {
    onChange({ ...value, [field]: nextValue });
  }

  function setCalendar(calendar: CalendarType) {
    const nextLeapMonth =
      calendar === "农历" &&
      LunarYear.fromYear(value.year).getLeapMonth() === value.month &&
      value.isLeapMonth;
    const maximum =
      calendar === "农历"
        ? LunarMonth.fromYm(value.year, nextLeapMonth ? -value.month : value.month)
            ?.getDayCount() ?? 30
        : new Date(value.year, value.month, 0).getDate();
    onChange({
      ...value,
      calendar,
      isLeapMonth: nextLeapMonth,
      day: Math.min(value.day, maximum),
    });
  }

  function setMonth(month: number) {
    const selectedLeapMonth =
      value.calendar === "农历" && leapMonth === month;
    const nextValue = {
      ...value,
      month,
      isLeapMonth: selectedLeapMonth && value.isLeapMonth,
    };
    const validMonth = nextValue.isLeapMonth ? -month : month;
    const nextMax =
      value.calendar === "农历"
        ? LunarMonth.fromYm(value.year, validMonth)?.getDayCount() ?? 30
        : new Date(value.year, month, 0).getDate();
    onChange({ ...nextValue, day: Math.min(value.day, nextMax) });
  }

  function setLeapMonth(isLeapMonth: boolean) {
    const nextMax =
      LunarMonth.fromYm(value.year, isLeapMonth ? -value.month : value.month)
        ?.getDayCount() ?? 30;
    onChange({
      ...value,
      isLeapMonth,
      day: Math.min(value.day, nextMax),
    });
  }

  function setProvince(code: string) {
    const province = PROVINCES.find(([provinceCode]) => provinceCode === code);
    onChange({
      ...value,
      province: province?.[1] ?? "",
      city: "",
      district: "",
    });
  }

  function setCity(code: string) {
    const city = cities.find(([cityCode]) => cityCode === code);
    onChange({ ...value, city: city?.[1] ?? "", district: "" });
  }

  function setDistrict(code: string) {
    const district = districts.find(
      ([districtCode]) => districtCode === code
    );
    update("district", district?.[1] ?? "");
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <h2 className="text-xl font-bold">{heading}</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="space-y-2">
          <span className="block text-sm text-slate-400">姓名</span>
          <input
            value={value.name}
            onChange={(event) => update("name", event.target.value)}
            required
            maxLength={40}
            autoComplete="name"
            className={SELECT_CLASS}
            placeholder="请输入姓名"
          />
        </label>
        <label className="space-y-2">
          <span className="block text-sm text-slate-400">性别</span>
          <select
            value={value.gender}
            onChange={(event) =>
              update("gender", event.target.value as BirthDetails["gender"])
            }
            className={SELECT_CLASS}
          >
            <option value="男">男</option>
            <option value="女">女</option>
          </select>
        </label>
        <div className="space-y-2">
          <span className="block text-sm text-slate-400">历法</span>
          <div className="grid grid-cols-2 rounded-xl bg-slate-900 p-1">
            {(["公历", "农历"] as const).map((calendar) => (
              <button
                key={calendar}
                type="button"
                aria-pressed={value.calendar === calendar}
                onClick={() => setCalendar(calendar)}
                className={`rounded-lg px-3 py-2 text-sm ${
                  value.calendar === calendar
                    ? "bg-amber-500 font-semibold text-slate-950"
                    : "text-slate-300"
                }`}
              >
                {calendar}
              </button>
            ))}
          </div>
        </div>
        <label className="space-y-2">
          <span className="block text-sm text-slate-400">
            {value.calendar}年份
          </span>
          <select
            value={value.year}
            onChange={(event) => {
              const year = Number(event.target.value);
              const max = value.calendar === "公历"
                ? new Date(year, value.month, 0).getDate()
                : LunarMonth.fromYm(year, value.month)?.getDayCount() ?? 30;
              onChange({
                ...value,
                year,
                day: Math.min(value.day, max),
                isLeapMonth: false,
              });
            }}
            className={SELECT_CLASS}
          >
            {Array.from({ length: 2100 - 1900 + 1 }, (_, index) => 2100 - index)
              .filter((year) => year <= new Date().getFullYear())
              .map((year) => (
                <option key={year} value={year}>
                  {year} 年
                </option>
              ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="block text-sm text-slate-400">
            {value.calendar}月份
          </span>
          <select
            value={value.month}
            onChange={(event) => setMonth(Number(event.target.value))}
            className={SELECT_CLASS}
          >
            {Array.from({ length: 12 }, (_, index) => (
              <option key={index + 1} value={index + 1}>
                {index + 1} 月
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="block text-sm text-slate-400">
            {value.calendar}日期
          </span>
          <select
            value={value.day}
            onChange={(event) => update("day", Number(event.target.value))}
            className={SELECT_CLASS}
          >
            {Array.from(
              { length: value.calendar === "农历" ? 30 : maxDay },
              (_, index) => (
              <option key={index + 1} value={index + 1}>
                {value.calendar === "农历"
                  ? CHINESE_DAYS[index]
                  : `${index + 1} 日`}
              </option>
              )
            )}
          </select>
        </label>
        {validLeapMonth && (
          <label className="flex items-center gap-3 self-end pb-3 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={value.isLeapMonth}
              onChange={(event) => setLeapMonth(event.target.checked)}
              className="h-4 w-4 accent-amber-400"
            />
            闰{value.month}月
          </label>
        )}
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-slate-300">出生时间</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {(["精准时间", "选择时辰", "时间不确定"] as const).map(
            (mode: TimeMode) => (
              <button
                key={mode}
                type="button"
                aria-pressed={value.timeMode === mode}
                onClick={() => update("timeMode", mode)}
                className={`rounded-xl border px-4 py-3 text-sm ${
                  value.timeMode === mode
                    ? "border-amber-400 bg-amber-500/10 text-amber-200"
                    : "border-white/10 bg-slate-900 text-slate-300"
                }`}
              >
                {mode}
              </button>
            )
          )}
        </div>
        {value.timeMode === "精准时间" && (
          <label className="mt-3 block max-w-xs space-y-2">
            <span className="text-sm text-slate-400">出生时分</span>
            <input
              type="time"
              value={value.birthTime}
              required
              onChange={(event) => update("birthTime", event.target.value)}
              className={SELECT_CLASS}
            />
          </label>
        )}
        {value.timeMode === "选择时辰" && (
          <label className="mt-3 block max-w-xs space-y-2">
            <span className="text-sm text-slate-400">出生时辰</span>
            <select
              value={value.hourBranch}
              onChange={(event) => update("hourBranch", event.target.value)}
              className={SELECT_CLASS}
            >
              {HOUR_BRANCHES.map((item) => (
                <option key={item.branch} value={item.branch}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        )}
        {value.timeMode === "时间不确定" && (
          <p className="mt-3 text-sm leading-6 text-amber-200/80">
            时辰未知，排盘暂以午时占位；年、月、日柱照常计算，时柱及相关解读仅供参考。
          </p>
        )}
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-slate-300">出生地区</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <label className="space-y-2">
            <span className="block text-sm text-slate-400">省 / 直辖市 / 自治区</span>
            <select
              value={provinceCode}
              onChange={(event) => setProvince(event.target.value)}
              required
              className={SELECT_CLASS}
            >
              <option value="">请选择省级地区</option>
              {PROVINCES.map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="block text-sm text-slate-400">市 / 州</span>
            <select
              value={cityCode}
              onChange={(event) => setCity(event.target.value)}
              required
              disabled={!provinceCode}
              className={SELECT_CLASS}
            >
              <option value="">请选择城市</option>
              {cities.map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="block text-sm text-slate-400">区 / 县 / 县级市</span>
            <select
              value={
                districts.find(([, name]) => name === value.district)?.[0] ?? ""
              }
              onChange={(event) => setDistrict(event.target.value)}
              required
              disabled={!cityCode}
              className={SELECT_CLASS}
            >
              <option value="">请选择区县</option>
              {districts.map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          地区会随出生信息一并保存。当前按输入的当地标准时间排盘，不进行真太阳时校正。
        </p>
      </div>
    </section>
  );
}
