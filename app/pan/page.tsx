"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BirthDetailsForm from "@/components/BirthDetailsForm";
import {
  calculateBirthChart,
  defaultBirthDetails,
  dateForBirth,
  timeUsed,
  type BirthDetails,
} from "@/lib/birth";
import { type BaziResult } from "@/lib/bazi";
import {
  deleteProfile,
  readSavedData,
  saveLatestResult,
  saveProfile,
  type SavedProfile,
} from "@/lib/storage";

export default function PanPage() {
  const [birthDetails, setBirthDetails] = useState<BirthDetails>(
    defaultBirthDetails()
  );
  const [result, setResult] = useState<BaziResult | null>(null);
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([]);
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    try {
      const savedData = readSavedData();
      setSavedProfiles(savedData.profiles);
      if (savedData.latestResult) setResult(savedData.latestResult);
      if (savedData.latestBirthDetails) {
        setBirthDetails(savedData.latestBirthDetails);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "读取本地档案失败。");
    }
  }, []);

  function calculate() {
    try {
      setError("");
      setSavedMessage("");
      const data = calculateBirthChart(birthDetails);
      saveLatestResult(birthDetails, data);
      setResult(data);
      setSavedMessage("排盘结果和出生信息已保存，可在个人报告中查看。");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "排盘失败，请检查输入。");
    }
  }

  function handleSaveProfile() {
    if (!result) return;
    try {
      setError("");
      const profile = saveProfile(birthDetails, result);
      setSavedProfiles((profiles) => [
        profile,
        ...profiles.filter((item) => item.id !== profile.id),
      ]);
      setSavedMessage(`已将${birthDetails.name}的命盘保存为个人档案。`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "保存档案失败。");
    }
  }

  function handleDeleteProfile(id: string) {
    try {
      setError("");
      deleteProfile(id);
      setSavedProfiles((profiles) =>
        profiles.filter((profile) => profile.id !== id)
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "删除档案失败。");
    }
  }

  function loadProfile(profile: SavedProfile) {
    setBirthDetails(profile.birthDetails);
    setResult(profile.result);
    setError("");
    setSavedMessage(`已载入${profile.name}的出生信息与命盘。`);
  }

  function updateBirthDetails(nextDetails: BirthDetails) {
    setBirthDetails(nextDetails);
    setResult(null);
    setError("");
    setSavedMessage("");
  }

  const currentLuck = result?.currentDaYun ?? null;

  return (
    <main className="min-h-screen px-5 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/" className="text-sm text-slate-400 hover:text-white">
              ← 东方命格 AI
            </Link>
            <h1 className="mt-3 text-3xl font-bold">八字排盘</h1>
            <p className="mt-2 text-slate-400">
              公历或农历出生信息将送入真实八字引擎计算四柱与运程。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/report"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
            >
              个人报告
            </Link>
            <Link
              href="/compatibility"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
            >
              合婚参考
            </Link>
          </div>
        </div>

        {savedProfiles.length > 0 && (
          <section className="mb-5 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <h2 className="font-semibold">本地个人档案</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {savedProfiles.map((profile) => (
                <div
                  key={profile.id}
                  className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm"
                >
                  <button
                    type="button"
                    onClick={() => loadProfile(profile)}
                    className="hover:text-amber-300"
                  >
                    {profile.name}
                  </button>
                  <button
                    type="button"
                    aria-label={`删除${profile.name}档案`}
                    onClick={() => handleDeleteProfile(profile.id)}
                    className="text-slate-500 hover:text-rose-300"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        <BirthDetailsForm
          value={birthDetails}
          onChange={updateBirthDetails}
          heading="个人出生信息"
        />

        <button
          type="button"
          onClick={calculate}
          className="mt-5 w-full rounded-2xl bg-amber-500 py-4 font-bold text-slate-950 hover:bg-amber-400"
        >
          开始排盘并保存
        </button>
        {error && (
          <p role="alert" className="mt-4 text-sm text-rose-300">
            {error}
          </p>
        )}
        {savedMessage && (
          <p role="status" className="mt-4 text-sm text-emerald-300">
            {savedMessage}
          </p>
        )}

        {result && (
          <div className="mt-8 space-y-6">
            <section className="flex flex-wrap items-end justify-between gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <div>
                <h2 className="text-xl font-bold">{birthDetails.name}的四柱命盘</h2>
                <p className="mt-2 text-sm text-slate-400">
                  {dateForBirth(birthDetails).displayDate} · {timeUsed(birthDetails)} ·{" "}
                  {birthDetails.gender} ·{" "}
                  {birthDetails.province} {birthDetails.city} {birthDetails.district}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  {birthDetails.timeMode === "时间不确定"
                    ? "时柱为午时占位，时柱和相关分析不可视为准确出生时辰结果。"
                    : "排盘根据所选出生信息使用 lunar-typescript 历法计算。"}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-amber-400">
                  {result.dayMaster}
                </div>
                <div className="text-sm text-slate-400">
                  {result.dayMasterElement} · {result.strength}
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <div className="grid grid-cols-4 gap-2 sm:gap-4">
                {[
                  { title: "年柱", pillar: result.year },
                  { title: "月柱", pillar: result.month },
                  { title: "日柱", pillar: result.day },
                  { title: "时柱", pillar: result.hour },
                ].map(({ title, pillar }) => (
                  <article
                    key={title}
                    className="rounded-2xl bg-slate-900 p-3 text-center sm:p-4"
                  >
                    <div className="text-xs text-slate-500">{title}</div>
                    <div className="mt-2 text-xl font-bold sm:text-2xl">
                      {pillar.stem}
                      {pillar.branch}
                    </div>
                    <div className="mt-2 text-xs text-amber-400">
                      {pillar.stemTenGod}
                    </div>
                    <div className="mt-3 text-xs text-slate-500">藏干 / 十神</div>
                    <div className="mt-1 text-xs leading-5 sm:text-sm">
                      {pillar.hiddenStems
                        .map((hidden) => `${hidden.stem}·${hidden.tenGod}`)
                        .join(" / ") || "—"}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="grid gap-6 md:grid-cols-2">
              <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <h2 className="text-xl font-bold">五行结构与取用</h2>
                <div className="mt-5 grid grid-cols-5 gap-2">
                  {Object.entries(result.fiveElements).map(
                    ([element, count]) => (
                      <div
                        key={element}
                        className="rounded-xl bg-slate-900 p-3 text-center"
                      >
                        <div className="font-bold">{element}</div>
                        <div className="mt-1 text-amber-400">{count}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          力量 {result.elementStrength[element as keyof typeof result.elementStrength]}
                        </div>
                      </div>
                    )
                  )}
                </div>
                <p className="mt-5 text-sm text-slate-300">
                  喜用：{result.usefulElements.join("、")}　·　忌用：
                  {result.avoidElements.join("、")}
                </p>
                <p className="mt-3 text-sm text-slate-400">
                  日主：{result.dayMaster}（{result.dayMasterElement}）·{" "}
                  {result.strength} · 格局：{result.pattern}
                </p>
              </article>

              <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <h2 className="text-xl font-bold">十神与地支关系</h2>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  {[
                    ["年干", result.year.stem, result.tenGods.year],
                    ["月干", result.month.stem, result.tenGods.month],
                    ["日干", result.day.stem, "日主"],
                    ["时干", result.hour.stem, result.tenGods.hour],
                  ].map(([label, stem, god]) => (
                    <div
                      key={label}
                      className="rounded-xl bg-slate-900 p-3"
                    >
                      {label} {stem} · {god}
                    </div>
                  ))}
                </div>
                <h3 className="mt-5 font-semibold text-slate-300">原局关系</h3>
                {result.branchRelations.length > 0 ? (
                  <ul className="mt-2 space-y-2 text-sm text-slate-400">
                    {result.branchRelations.map((item, index) => (
                      <li key={`${item.type}-${index}`}>
                        {item.description}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">
                    四支未见直接六合、六冲、相害、相破或半合。
                  </p>
                )}
              </article>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-xl font-bold">当前大运</h2>
              {currentLuck ? (
                <div className="mt-4 rounded-2xl border border-amber-400/40 bg-amber-500/10 p-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-sm text-slate-300">
                      {currentLuck.startYear}—{currentLuck.endYear}
                    </span>
                    <span className="text-2xl font-bold text-amber-300">
                      {currentLuck.ganZhi}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">
                    {currentLuck.tenGod} · {currentLuck.stemElement}/
                    {currentLuck.branchElement}
                  </p>
                  <p className="mt-3 leading-7 text-slate-300">
                    {currentLuck.analysis}
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-slate-400">
                  当前年份不在排出的十年大运范围内。
                </p>
              )}
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-xl font-bold">当前及未来四年流年</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {result.annualFortunes.map((fortune) => (
                  <article
                    key={fortune.year}
                    className={`rounded-2xl p-4 ${
                      fortune.year === result.currentYear
                        ? "border border-amber-400/50 bg-amber-500/10"
                        : "bg-slate-900"
                    }`}
                  >
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm text-slate-400">
                        {fortune.year} 年
                      </span>
                      <span className="text-lg font-bold text-amber-300">
                        {fortune.ganZhi}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-400">
                      {fortune.stemTenGod} · 天干{fortune.stemElement} / 地支
                      {fortune.branchElement}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      {fortune.theme}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <button
              type="button"
              onClick={handleSaveProfile}
              className="w-full rounded-2xl border border-amber-400/40 py-4 font-semibold text-amber-300 hover:bg-amber-500/10"
            >
              保存为个人档案
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
