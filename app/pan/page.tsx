"use client";

import { useMemo, useState } from "react";

import {
  calculateBazi,
  type BaziResult,
  type Gender,
  type PillarDetail,
  type WuXing,
} from "@/lib/bazi";

const elements: WuXing[] = ["木", "火", "土", "金", "水"];

const pillarTitles = ["年柱", "月柱", "日柱", "时柱"];

const zodiacMap: Record<string, string> = {
  子: "鼠",
  丑: "牛",
  寅: "虎",
  卯: "兔",
  辰: "龙",
  巳: "蛇",
  午: "马",
  未: "羊",
  申: "猴",
  酉: "鸡",
  戌: "狗",
  亥: "猪",
};

function getZodiac(result: BaziResult) {
  const branch = result.yearPillar.slice(1);
  return zodiacMap[branch] ?? "";
}

function getDaYunPillar(item: BaziResult["daYun"][number]) {
  const value = item as unknown as Record<string, unknown>;

  return String(
    value.pillar ??
      value.ganZhi ??
      value.ganzhi ??
      value.ganZhiPillar ??
      value.ganZhiName ??
      "—"
  );
}

function getDaYunStartYear(item: BaziResult["daYun"][number]) {
  const value = item as unknown as Record<string, unknown>;

  const year = Number(
    value.startYear ??
      value.year ??
      value.start ??
      0
  );

  return Number.isFinite(year) ? year : 0;
}

function getDaYunEndYear(item: BaziResult["daYun"][number]) {
  const value = item as unknown as Record<string, unknown>;

  const year = Number(
    value.endYear ??
      value.end ??
      0
  );

  return Number.isFinite(year) ? year : 0;
}

function getCurrentDaYun(
  result: BaziResult,
  item: BaziResult["daYun"][number]
) {
  if (!result.currentDaYun) return false;

  const current = result.currentDaYun as unknown as Record<string, unknown>;
  const currentStart = Number(
    current.startYear ??
      current.year ??
      current.start ??
      0
  );

  const itemStart = getDaYunStartYear(item);

  return currentStart > 0 && itemStart > 0
    ? currentStart === itemStart
    : getDaYunPillar(result.currentDaYun) === getDaYunPillar(item);
}

function PillarCard({
  title,
  detail,
}: {
  title: string;
  detail: PillarDetail;
}) {
  return (
    <div className="rounded-2xl border border-[#e6d7c2] bg-[#fffaf2] p-5 text-center">
      <div className="text-sm text-[#92795d]">{title}</div>

      <div className="mt-4">
        <div className="text-3xl font-semibold tracking-widest text-[#563825]">
          {detail.stem}
          {detail.branch}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-xl bg-[#f3e9db] px-2 py-2 text-[#806950]">
          天干 · {detail.stemElement}
        </div>

        <div className="rounded-xl bg-[#f3e9db] px-2 py-2 text-[#806950]">
          地支 · {detail.branchElement}
        </div>
      </div>

      <div className="mt-4 border-t border-[#eadfce] pt-4">
        <div className="text-xs text-[#967b5d]">藏干 / 十神</div>

        <div className="mt-3 space-y-2">
          {detail.hiddenStems.map((item, index) => (
            <div
              key={`${item.stem}-${index}`}
              className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-xs"
            >
              <span className="font-medium text-[#5f432f]">
                {item.stem}
              </span>

              <span className="text-[#806950]">
                {item.role}
              </span>

              <span className="text-[#967b5d]">
                {item.tenGod}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function calculateFromInputs(
  date: string,
  time: string,
  gender: Gender
): BaziResult | null {
  if (!date || !time) return null;

  const dateParts = date.split("-").map(Number);
  const timeParts = time.split(":").map(Number);

  const year = dateParts[0];
  const month = dateParts[1];
  const day = dateParts[2];

  const hour = timeParts[0];
  const minute = timeParts[1];

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    !Number.isInteger(hour) ||
    !Number.isInteger(minute)
  ) {
    return null;
  }

  try {
    return calculateBazi(
      new Date(year, month - 1, day),
      `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
      gender
    );
  } catch {
    return null;
  }
}

export default function PanPage() {
  const [date, setDate] = useState("2006-06-07");
  const [time, setTime] = useState("08:00");
  const [gender, setGender] = useState<Gender>("男");
  const [result, setResult] = useState<BaziResult | null>(null);
  const [error, setError] = useState("");

  const preview = useMemo(
    () => calculateFromInputs(date, time, gender),
    [date, time, gender]
  );

  const active = result ?? preview;

  function handleCalculate() {
    setError("");

    const calculated = calculateFromInputs(date, time, gender);

    if (!calculated) {
      setResult(null);
      setError("排盘失败，请检查出生日期和时间。");
      return;
    }

    setResult(calculated);
  }

  return (
    <main className="min-h-screen bg-[#f7f1e7] text-[#4d3929]">
      <section className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">

        <header className="mb-10">
          <div className="text-sm tracking-[0.3em] text-[#987d5f]">
            东方命格 AI
          </div>

          <h1 className="mt-3 text-3xl font-semibold text-[#503322] md:text-4xl">
            个人八字排盘
          </h1>

          <p className="mt-3 text-sm leading-7 text-[#806b55] md:text-base">
            根据出生时间计算四柱、日主、五行、十神、地支关系与大运。
          </p>
        </header>

        <div className="grid gap-7 lg:grid-cols-[350px_1fr]">

          <aside className="h-fit rounded-3xl border border-[#e5d7c3] bg-[#fffaf3] p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#583a27]">
              出生信息
            </h2>

            <div className="mt-6 space-y-5">

              <label className="block">
                <span className="mb-2 block text-sm text-[#765d45]">
                  出生日期
                </span>

                <input
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setResult(null);
                  }}
                  className="w-full rounded-xl border border-[#d8c8b2] bg-white px-4 py-3 text-[#523827] outline-none focus:border-[#8e6a49]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-[#765d45]">
                  出生时间
                </span>

                <input
                  type="time"
                  value={time}
                  onChange={(e) => {
                    setTime(e.target.value);
                    setResult(null);
                  }}
                  className="w-full rounded-xl border border-[#d8c8b2] bg-white px-4 py-3 text-[#523827] outline-none focus:border-[#8e6a49]"
                />
              </label>

              <div>
                <div className="mb-2 text-sm text-[#765d45]">
                  性别
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {(["男", "女"] as Gender[]).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setGender(item);
                        setResult(null);
                      }}
                      className={`rounded-xl border px-4 py-3 text-sm ${
                        gender === item
                          ? "border-[#765238] bg-[#765238] text-white"
                          : "border-[#d8c8b2] bg-white text-[#765d45]"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleCalculate}
                className="w-full rounded-xl bg-[#62432d] px-5 py-3.5 text-sm font-medium text-white hover:bg-[#4f3422]"
              >
                开始排盘
              </button>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

            </div>
          </aside>

          <div className="space-y-7">

            {!active && (
              <div className="flex min-h-[400px] items-center justify-center rounded-3xl border border-dashed border-[#d9c9b3] bg-[#fffaf3] text-sm text-[#967b5d]">
                输入出生信息后开始排盘
              </div>
            )}

            {active && (
              <>

                <section className="rounded-3xl border border-[#e5d7c3] bg-[#fffaf3] p-6 shadow-sm md:p-7">

                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
                    <div>
                      <div className="text-sm text-[#967b5d]">
                        {active.birthDate} · {active.birthTime} · {active.gender}
                      </div>

                      <h2 className="mt-2 text-2xl font-semibold text-[#583a27]">
                        四柱命盘
                      </h2>
                    </div>

                    <div className="text-sm text-[#806b55]">
                      日主：
                      <span className="ml-1 font-semibold text-[#583a27]">
                        {active.dayMaster}
                      </span>

                      <span className="ml-2">
                        {active.dayMasterElement}
                      </span>
                    </div>
                  </div>

                  <div className="mt-7 grid grid-cols-2 gap-4 md:grid-cols-4">

                    <PillarCard
                      title="年柱"
                      detail={active.yearDetail}
                    />

                    <PillarCard
                      title="月柱"
                      detail={active.monthDetail}
                    />

                    <PillarCard
                      title="日柱"
                      detail={active.dayDetail}
                    />

                    <PillarCard
                      title="时柱"
                      detail={active.hourDetail}
                    />

                  </div>
                </section>

                <div className="grid gap-7 md:grid-cols-2">

                  <section className="rounded-3xl border border-[#e5d7c3] bg-[#fffaf3] p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-[#583a27]">
                      命局核心
                    </h2>

                    <div className="mt-5 grid grid-cols-2 gap-3">

                      <div className="rounded-2xl bg-[#f3e9db] p-4">
                        <div className="text-xs text-[#967b5d]">
                          日主
                        </div>

                        <div className="mt-2 text-xl font-semibold text-[#583a27]">
                          {active.dayMaster}
                        </div>

                        <div className="mt-1 text-sm text-[#806b55]">
                          {active.dayMasterElement}
                        </div>
                      </div>

                      <div className="rounded-2xl bg-[#f3e9db] p-4">
                        <div className="text-xs text-[#967b5d]">
                          身强身弱
                        </div>

                        <div className="mt-2 text-xl font-semibold text-[#583a27]">
                          {active.strength}
                        </div>
                      </div>

                      <div className="rounded-2xl bg-[#f3e9db] p-4">
                        <div className="text-xs text-[#967b5d]">
                          格局
                        </div>

                        <div className="mt-2 text-lg font-semibold text-[#583a27]">
                          {active.pattern}
                        </div>
                      </div>

                      <div className="rounded-2xl bg-[#f3e9db] p-4">
                        <div className="text-xs text-[#967b5d]">
                          生肖
                        </div>

                        <div className="mt-2 text-xl font-semibold text-[#583a27]">
                          {getZodiac(active)}
                        </div>
                      </div>

                    </div>

                    <div className="mt-5 rounded-2xl border border-[#eadfce] bg-white p-4">
                      <div className="text-xs text-[#967b5d]">
                        喜用 / 忌
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">

                        {active.usefulElements.map((item) => (
                          <span
                            key={`use-${item}`}
                            className="rounded-full bg-[#eee1cf] px-3 py-1.5 text-sm text-[#63432c]"
                          >
                            喜 {item}
                          </span>
                        ))}

                        {active.avoidElements.map((item) => (
                          <span
                            key={`avoid-${item}`}
                            className="rounded-full bg-[#f1e5df] px-3 py-1.5 text-sm text-[#8b5041]"
                          >
                            忌 {item}
                          </span>
                        ))}

                      </div>
                    </div>
                  </section>

                  <section className="rounded-3xl border border-[#e5d7c3] bg-[#fffaf3] p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-[#583a27]">
                      五行分布
                    </h2>

                    <div className="mt-5 space-y-4">

                      {elements.map((element) => {
                        const count = active.fiveElements[element];

                        return (
                          <div key={element}>

                            <div className="mb-1.5 flex justify-between text-sm">
                              <span>{element}</span>

                              <span className="text-[#8b7355]">
                                {count}
                              </span>
                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-[#eee4d6]">
                              <div
                                className="h-full rounded-full bg-[#9a7651]"
                                style={{
                                  width: `${Math.min(100, count * 20)}%`,
                                }}
                              />
                            </div>

                          </div>
                        );
                      })}

                    </div>

                    <div className="mt-6 grid grid-cols-5 gap-2">

                      {elements.map((element) => (
                        <div
                          key={element}
                          className="rounded-xl bg-[#f3e9db] px-2 py-3 text-center"
                        >
                          <div className="text-sm">
                            {element}
                          </div>

                          <div className="mt-1 font-semibold text-[#583a27]">
                            {active.fiveElements[element]}
                          </div>
                        </div>
                      ))}

                    </div>
                  </section>

                </div>

                <section className="rounded-3xl border border-[#e5d7c3] bg-[#fffaf3] p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-[#583a27]">
                    十神结构
                  </h2>

                  <div className="mt-5 grid gap-3 md:grid-cols-4">

                    {pillarTitles.map((title, index) => {
                      const stems = [
                        active.yearDetail.stem,
                        active.monthDetail.stem,
                        active.dayDetail.stem,
                        active.hourDetail.stem,
                      ];

                      const gods = [
                        active.tenGods.year,
                        active.tenGods.month,
                        active.tenGods.day,
                        active.tenGods.hour,
                      ];

                      return (
                        <div
                          key={`${title}-${stems[index]}`}
                          className="rounded-2xl border border-[#eadfce] bg-white p-4"
                        >
                          <div className="text-xs text-[#967b5d]">
                            {title}
                          </div>

                          <div className="mt-2 text-lg font-semibold text-[#583a27]">
                            {stems[index]}
                          </div>

                          <div className="mt-2 text-sm text-[#806b55]">
                            {gods[index]}
                          </div>
                        </div>
                      );
                    })}

                  </div>
                </section>

                <section className="rounded-3xl border border-[#e5d7c3] bg-[#fffaf3] p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-[#583a27]">
                    地支关系
                  </h2>

                  {active.branchRelations.length === 0 ? (
                    <div className="mt-4 text-sm text-[#967b5d]">
                      当前四柱未检测到已定义的地支关系。
                    </div>
                  ) : (
                    <div className="mt-5 flex flex-wrap gap-3">

                      {active.branchRelations.map((relation, index) => (
                        <div
                          key={`${relation.type}-${relation.from}-${relation.to}-${index}`}
                          className="rounded-2xl border border-[#eadfce] bg-white px-4 py-3"
                        >
                          <div className="text-sm font-semibold text-[#583a27]">
                            {relation.from}
                            {relation.to}
                          </div>

                          <div className="mt-1 text-xs text-[#967b5d]">
                            {relation.type}
                          </div>

                          {relation.detail && (
                            <div className="mt-1 text-xs text-[#806b55]">
                              {relation.detail}
                            </div>
                          )}
                        </div>
                      ))}

                    </div>
                  )}
                </section>

                <section className="rounded-3xl border border-[#e5d7c3] bg-[#fffaf3] p-6 shadow-sm">

                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold text-[#583a27]">
                      大运
                    </h2>

                    {active.currentDaYun && (
                      <div className="rounded-full bg-[#eadbc5] px-3 py-1.5 text-xs font-medium text-[#63432c]">
                        当前：{getDaYunPillar(active.currentDaYun)}
                      </div>
                    )}
                  </div>

                  <div className="mt-5 overflow-x-auto">
                    <div className="min-w-[650px]">

                      <div className="grid grid-cols-4 gap-3 text-xs text-[#967b5d]">
                        <div>大运</div>
                        <div>起始年份</div>
                        <div>结束年份</div>
                        <div>状态</div>
                      </div>

                      <div className="mt-3 space-y-2">

                        {active.daYun.map((item, index) => {
                          const current = getCurrentDaYun(active, item);
                          const startYear = getDaYunStartYear(item);
                          const endYear = getDaYunEndYear(item);

                          return (
                            <div
                              key={`${startYear}-${getDaYunPillar(item)}-${index}`}
                              className={`grid grid-cols-4 gap-3 rounded-xl px-4 py-3 text-sm ${
                                current
                                  ? "bg-[#eadbc5] text-[#583a27]"
                                  : "bg-white text-[#765d45]"
                              }`}
                            >
                              <div className="font-semibold">
                                {getDaYunPillar(item)}
                              </div>

                              <div>
                                {startYear || "—"}
                              </div>

                              <div>
                                {endYear || "—"}
                              </div>

                              <div>
                                {current ? "当前大运" : ""}
                              </div>
                            </div>
                          );
                        })}

                      </div>
                    </div>
                  </div>
                </section>

                <section className="rounded-3xl border border-[#e5d7c3] bg-[#fffaf3] p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-[#583a27]">
                    当前流年
                  </h2>

                  <div className="mt-5 grid grid-cols-2 gap-3">

                    <div className="rounded-2xl bg-[#f3e9db] p-4">
                      <div className="text-xs text-[#967b5d]">
                        年份
                      </div>

                      <div className="mt-2 text-2xl font-semibold text-[#583a27]">
                        {active.currentYear.year}
                      </div>
                    </div>

                    <div className="rounded-2xl bg-[#f3e9db] p-4">
                      <div className="text-xs text-[#967b5d]">
                        干支
                      </div>

                      <div className="mt-2 text-2xl font-semibold text-[#583a27]">
                        {active.currentYear.ganZhi}
                      </div>
                    </div>

                  </div>
                </section>

                <section className="rounded-3xl border border-[#e5d7c3] bg-[#fffaf3] p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-[#583a27]">
                    命局分析
                  </h2>

                  <div className="mt-5 space-y-3">

                    {active.interpretation.map((paragraph, index) => (
                      <p
                        key={index}
                        className="text-sm leading-8 text-[#705a45]"
                      >
                        {paragraph}
                      </p>
                    ))}

                  </div>
                </section>

              </>
            )}

          </div>
        </div>
      </section>
    </main>
  );
}