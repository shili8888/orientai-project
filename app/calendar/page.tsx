"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { lunarToSolar, type LunarConversion } from "@/lib/lunar";

export default function CalendarPage() {
  const [year, setYear] = useState(1990);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [isLeapMonth, setIsLeapMonth] = useState(false);
  const [conversion, setConversion] = useState<LunarConversion | null>(null);
  const [error, setError] = useState("");

  function convert(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setError("");
      setConversion(lunarToSolar({ year, month, day, isLeapMonth }));
    } catch (cause) {
      setConversion(null);
      setError(cause instanceof Error ? cause.message : "日期换算失败。");
    }
  }

  return (
    <main className="min-h-screen px-5 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-slate-400 hover:text-white">
          ← 东方命格 AI
        </Link>
        <h1 className="mt-4 text-3xl font-bold">农历转公历</h1>
        <p className="mt-2 text-slate-400">
          输入农历年、月、日；闰月请勾选闰月选项。换算范围为 1900—2100 年。
        </p>

        <form
          onSubmit={convert}
          className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6"
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="space-y-2">
              <span className="block text-sm text-slate-400">农历年份</span>
              <input
                type="number"
                min={1900}
                max={2100}
                value={year}
                onChange={(event) => setYear(Number(event.target.value))}
                className="w-full rounded-xl bg-slate-900 px-4 py-3"
              />
            </label>
            <label className="space-y-2">
              <span className="block text-sm text-slate-400">农历月份</span>
              <select
                value={month}
                onChange={(event) => setMonth(Number(event.target.value))}
                className="w-full rounded-xl bg-slate-900 px-4 py-3"
              >
                {Array.from({ length: 12 }, (_, index) => (
                  <option key={index + 1} value={index + 1}>
                    {index + 1} 月
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="block text-sm text-slate-400">农历日期</span>
              <select
                value={day}
                onChange={(event) => setDay(Number(event.target.value))}
                className="w-full rounded-xl bg-slate-900 px-4 py-3"
              >
                {Array.from({ length: 30 }, (_, index) => (
                  <option key={index + 1} value={index + 1}>
                    {index + 1} 日
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="mt-5 flex items-center gap-3 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={isLeapMonth}
              onChange={(event) => setIsLeapMonth(event.target.checked)}
              className="h-4 w-4 accent-amber-400"
            />
            闰月
          </label>
          <button
            type="submit"
            className="mt-6 w-full rounded-2xl bg-amber-500 py-4 font-bold text-slate-950 hover:bg-amber-400"
          >
            换算为公历
          </button>
          {error && (
            <p role="alert" className="mt-4 text-sm text-rose-300">
              {error}
            </p>
          )}
        </form>

        {conversion && (
          <section
            aria-live="polite"
            className="mt-6 rounded-3xl border border-amber-400/30 bg-amber-500/10 p-6"
          >
            <p className="text-sm text-slate-300">{conversion.lunarDate}</p>
            <p className="mt-2 text-3xl font-bold text-amber-300">
              {conversion.solarDate}
            </p>
            <p className="mt-2 text-slate-300">{conversion.weekday}</p>
          </section>
        )}
      </div>
    </main>
  );
}
