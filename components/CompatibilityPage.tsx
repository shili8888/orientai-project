"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import BirthDetailsForm from "@/components/BirthDetailsForm";
import {
  calculateBirthChart,
  dateForBirth,
  defaultBirthDetails,
  timeUsed,
  type BirthDetails,
} from "@/lib/birth";
import {
  calculateCompatibility,
  type CompatibilityResult,
} from "@/lib/compatibility";
import { saveLatestCompatibility } from "@/lib/storage";

export default function CompatibilityPage() {
  const [people, setPeople] = useState<[BirthDetails, BirthDetails]>([
    defaultBirthDetails("男"),
    defaultBirthDetails("女"),
  ]);
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [error, setError] = useState("");

  function updatePerson(index: 0 | 1, value: BirthDetails) {
    setPeople((current) => {
      const updated: [BirthDetails, BirthDetails] = [
        { ...current[0] },
        { ...current[1] },
      ];
      updated[index] = value;
      return updated;
    });
  }

  function calculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setError("");
      const firstChart = calculateBirthChart(people[0]);
      const secondChart = calculateBirthChart(people[1]);
      const comparison = calculateCompatibility(
        firstChart,
        secondChart,
        people[0],
        people[1]
      );
      saveLatestCompatibility(comparison);
      setResult(comparison);
    } catch (cause) {
      setResult(null);
      setError(
        cause instanceof Error ? cause.message : "合婚计算失败，请检查出生信息。"
      );
    }
  }

  return (
    <main className="min-h-screen px-5 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/" className="text-sm text-slate-400 hover:text-white">
              ← 东方命格 AI
            </Link>
            <h1 className="mt-4 text-3xl font-bold">合婚参考</h1>
            <p className="mt-2 max-w-2xl text-slate-400">
              双方使用相同的出生信息结构和真实四柱引擎；公历、农历均会先正确换算。
            </p>
          </div>
          <Link
            href="/pan"
            className="rounded-xl border border-white/10 px-4 py-3 text-sm hover:bg-white/5"
          >
            八字排盘
          </Link>
        </div>

        <form onSubmit={calculate} className="mt-8 grid gap-5 lg:grid-cols-2">
          {([0, 1] as const).map((index) => (
            <BirthDetailsForm
              key={index}
              heading={`${index === 0 ? "甲方" : "乙方"}出生信息`}
              value={people[index]}
              onChange={(value) => updatePerson(index, value)}
            />
          ))}
          <button
            type="submit"
            className="rounded-2xl bg-amber-500 py-4 font-bold text-slate-950 hover:bg-amber-400 lg:col-span-2"
          >
            计算双方八字并生成合婚参考
          </button>
        </form>

        {error && (
          <p
            role="alert"
            className="mt-5 rounded-xl bg-rose-500/10 p-4 text-rose-300"
          >
            {error}
          </p>
        )}

        {result && (
          <section
            aria-live="polite"
            className="mt-8 space-y-5 rounded-3xl border border-amber-400/30 bg-white/[0.04] p-6"
          >
            <div>
              <p className="text-sm text-slate-400">
                {result.firstName} × {result.secondName}
              </p>
              <div className="mt-2 flex flex-wrap items-end gap-3">
                <span className="text-5xl font-bold text-amber-300">
                  {result.score}
                </span>
                <span className="pb-1 text-slate-400">
                  双方实际命盘结构的传统互动参考分（满分 100）
                </span>
              </div>
              <p className="mt-4 leading-7 text-slate-200">{result.summary}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                {
                  name: result.firstName,
                  chart: result.firstChart,
                  birth: result.firstBirthDetails,
                },
                {
                  name: result.secondName,
                  chart: result.secondChart,
                  birth: result.secondBirthDetails,
                },
              ].map(({ name, chart, birth }, index) => (
                <article
                  key={`${name}-${index}`}
                  className="rounded-2xl bg-slate-900 p-5"
                >
                  <h2 className="font-semibold">{name}实际四柱</h2>
                  <p className="mt-2 text-xl font-bold text-amber-300">
                    {chart.yearPillar} · {chart.monthPillar} ·{" "}
                    {chart.dayPillar} · {chart.hourPillar}
                  </p>
                  <p className="mt-2 text-sm text-slate-300">
                    日主 {chart.dayMaster}（{chart.dayMasterElement}）·{" "}
                    {chart.strength}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    {dateForBirth(birth).displayDate} · {timeUsed(birth)} ·{" "}
                    {birth.province} {birth.city} {birth.district} · 喜用
                    {chart.usefulElements.join("、")} · 忌用
                    {chart.avoidElements.join("、")}
                  </p>
                </article>
              ))}
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {result.factors.map((factor) => (
                <article
                  key={factor.title}
                  className="rounded-2xl bg-slate-900 p-4"
                >
                  <h3 className="font-semibold text-amber-300">
                    {factor.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {factor.description}
                  </p>
                </article>
              ))}
            </div>
            <p className="text-xs leading-6 text-slate-500">
              此参考由双方实际四柱、日主五行、日支互动和喜用元素比较生成，不是科学测量或婚姻预测。关系发展取决于双方真实沟通、尊重和共同选择。
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
