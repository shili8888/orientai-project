"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CHINESE_DAYS,
  dateForBirth,
  timeUsed,
  type BirthDetails,
} from "@/lib/birth";
import { type BaziResult, type PillarDetail } from "@/lib/bazi";
import { readSavedData, type SavedProfile } from "@/lib/storage";

export default function ReportPage() {
  const [result, setResult] = useState<BaziResult | null>(null);
  const [birthDetails, setBirthDetails] = useState<BirthDetails | null>(null);
  const [profiles, setProfiles] = useState<SavedProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string>("latest");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = readSavedData();
      setResult(saved.latestResult);
      setBirthDetails(saved.latestBirthDetails);
      setProfiles(saved.profiles);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "读取命盘报告失败。");
    } finally {
      setLoading(false);
    }
  }, []);

  function selectProfile(id: string) {
    setSelectedProfile(id);
    if (id === "latest") {
      try {
        const saved = readSavedData();
        setResult(saved.latestResult);
        setBirthDetails(saved.latestBirthDetails);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "读取排盘失败。");
      }
      return;
    }
    const profile = profiles.find((item) => item.id === id);
    if (profile) {
      setResult(profile.result);
      setBirthDetails(profile.birthDetails);
    }
  }

  const dateLabel = birthDetails
    ? dateForBirth(birthDetails).displayDate
    : "";
  const currentLuck = result?.currentDaYun ?? null;

  return (
    <main className="min-h-screen px-5 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/" className="text-sm text-slate-400 hover:text-white">
              ← 东方命格 AI
            </Link>
            <h1 className="mt-4 text-3xl font-bold">个人命格报告</h1>
            <p className="mt-2 text-slate-400">
              报告内容由保存的出生信息和真实八字计算结果生成。
            </p>
          </div>
          <Link
            href="/pan"
            className="rounded-xl border border-white/10 px-4 py-3 text-sm hover:bg-white/5"
          >
            前往排盘
          </Link>
        </div>

        {error && (
          <p role="alert" className="mt-8 rounded-xl bg-rose-500/10 p-4 text-rose-300">
            {error}
          </p>
        )}

        {profiles.length > 0 && (
          <label className="mt-7 block max-w-md space-y-2">
            <span className="text-sm text-slate-400">选择要查看的真实命盘</span>
            <select
              value={selectedProfile}
              onChange={(event) => selectProfile(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3"
            >
              <option value="latest">最近一次排盘</option>
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name} · {profile.result.birthDate}
                </option>
              ))}
            </select>
          </label>
        )}

        {loading && (
          <p className="mt-8 text-slate-400">正在读取已保存的个人排盘…</p>
        )}

        {!loading && !result && !error && (
          <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-8">
            <h2 className="text-xl font-semibold">暂无个人排盘数据</h2>
            <p className="mt-2 text-slate-400">
              这里不会显示示例命盘。请先填写出生资料并完成排盘，真实结果保存后才会生成报告。
            </p>
            <Link
              href="/pan"
              className="mt-5 inline-block rounded-xl bg-amber-500 px-5 py-3 font-semibold text-slate-950"
            >
              填写出生信息并排盘
            </Link>
          </section>
        )}

        {!loading && result && birthDetails && (
          <div className="mt-8 space-y-6">
            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400">
                    {birthDetails.name || "未填写姓名"} · {birthDetails.gender} ·{" "}
                    {dateLabel} · {timeUsed(birthDetails)}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    出生地区：{birthDetails.province || "未记录"}{" "}
                    {birthDetails.city} {birthDetails.district}
                  </p>
                  <h2 className="mt-3 text-2xl font-bold">
                    {result.yearPillar} · {result.monthPillar} ·{" "}
                    {result.dayPillar} · {result.hourPillar}
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-amber-300">
                    {result.dayMaster}日主
                  </p>
                  <p className="text-sm text-slate-400">
                    {result.dayMasterElement} · {result.strength}
                  </p>
                </div>
              </div>
              {birthDetails.timeMode === "时间不确定" && (
                <p className="mt-4 rounded-xl bg-amber-500/10 p-3 text-sm text-amber-200">
                  出生时辰未知，时柱按午时占位计算；时柱、时干十神和相关地支分析均需以准确出生时间复核。
                </p>
              )}
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <h2 className="text-lg font-bold text-amber-300">真实四柱与十神</h2>
                <div className="mt-4 space-y-3">
                  {([
                    ["年柱", result.year],
                    ["月柱", result.month],
                    ["日柱", result.day],
                    ["时柱", result.hour],
                  ] as Array<[string, PillarDetail]>).map(([name, pillar]) => (
                    <div
                      key={name}
                      className="rounded-xl bg-slate-900 p-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">{name}</span>
                        <span className="font-semibold">
                          {pillar.stem}
                          {pillar.branch} · {pillar.stemTenGod}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-slate-400">
                        藏干：
                        {pillar.hiddenStems
                          .map((item) => `${item.stem}（${item.tenGod}）`)
                          .join("、") || "无"}
                      </p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <h2 className="text-lg font-bold text-amber-300">五行与日主强弱</h2>
                <p className="mt-3 text-slate-300">
                  日主 {result.dayMaster} 属{result.dayMasterElement}，综合原局五行力量判为
                  <strong className="mx-1 text-amber-300">{result.strength}</strong>。
                </p>
                <div className="mt-4 grid grid-cols-5 gap-2">
                  {Object.entries(result.fiveElements).map(
                    ([element, count]) => (
                      <div
                        key={element}
                        className="rounded-xl bg-slate-900 p-2 text-center"
                      >
                        <div className="font-bold">{element}</div>
                        <div className="mt-1 text-amber-300">{count}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          力量{result.elementStrength[element as keyof typeof result.elementStrength]}
                        </div>
                      </div>
                    )
                  )}
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-300">
                  格局：{result.pattern}
                  <br />
                  喜用元素：{result.usefulElements.join("、")}
                  <br />
                  忌用元素：{result.avoidElements.join("、")}
                </p>
              </article>

              <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <h2 className="text-lg font-bold text-amber-300">原局地支关系</h2>
                {result.branchRelations.length > 0 ? (
                  <ul className="mt-4 space-y-3">
                    {result.branchRelations.map((relation, index) => (
                      <li
                        key={`${relation.type}-${index}`}
                        className="rounded-xl bg-slate-900 p-3"
                      >
                        <strong className="text-amber-300">
                          {relation.type}
                        </strong>
                        <p className="mt-1 text-sm text-slate-300">
                          {relation.description}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-slate-400">
                    当前真实四柱未检出六合、六冲、相害、相破或半合。
                  </p>
                )}
              </article>

              <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <h2 className="text-lg font-bold text-amber-300">个人解读</h2>
                <div className="mt-4 space-y-4 text-sm leading-7 text-slate-300">
                  {[
                    ["性格与优势", result.interpretation.personality],
                    ["事业方向", result.interpretation.career],
                    ["财富观", result.interpretation.wealth],
                    ["关系与情感", result.interpretation.romance],
                  ].map(([title, items]) => (
                    <div key={title as string}>
                      <h3 className="font-semibold text-white">{title}</h3>
                      <ul className="mt-1 list-inside list-disc">
                        {(items as string[]).map((text, index) => (
                          <li key={index}>{text}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </article>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-xl font-bold">当前大运</h2>
              {currentLuck ? (
                <article className="mt-4 rounded-2xl border border-amber-400/40 bg-amber-500/10 p-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-xl font-bold text-amber-300">
                      {currentLuck.ganZhi}
                    </h3>
                    <span className="text-sm text-slate-300">
                      {currentLuck.startYear}—{currentLuck.endYear}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">
                    {currentLuck.tenGod} · 天干{currentLuck.stemElement} / 地支
                    {currentLuck.branchElement}
                  </p>
                  <p className="mt-3 leading-7 text-slate-300">
                    {currentLuck.analysis}
                  </p>
                </article>
              ) : (
                <p className="mt-3 text-slate-400">
                  当前年份没有对应的大运数据。
                </p>
              )}
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-xl font-bold">当前及未来四年流年</h2>
              <div className="mt-4 space-y-3">
                {result.annualFortunes.map((fortune) => (
                  <article
                    key={fortune.year}
                    className="rounded-2xl bg-slate-900 p-4"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-semibold">
                        {fortune.year} 年 · {fortune.ganZhi}
                      </h3>
                      <span className="text-sm text-amber-300">
                        十神{fortune.stemTenGod} · 天干{fortune.stemElement} / 地支
                        {fortune.branchElement}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {fortune.theme}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <p className="text-xs leading-6 text-slate-500">
              农历出生日期：{birthDetails.calendar === "农历"
                ? `${birthDetails.year}年${birthDetails.isLeapMonth ? "闰" : ""}${birthDetails.month}月${CHINESE_DAYS[birthDetails.day - 1]}`
                : result.lunarDate}
              。本报告内容依据传统历法和命理规则生成，仅供文化研究及自我观察参考。
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
