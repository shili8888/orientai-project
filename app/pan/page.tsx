"use client";

import { useMemo, useState } from "react";
import { Solar } from "lunar-typescript";
import {
  calculateBazi,
  type Gender,
  type BaziResult,
} from "../../lib/bazi";

const YEARS = Array.from({ length: 101 }, (_, i) => 1950 + i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

const elements = ["木", "火", "土", "金", "水"] as const;

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function SelectBox({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-14 w-full rounded-xl border border-[#ddd5c8] bg-white px-4 text-center text-sm text-[#5f594f] outline-none focus:border-[#29251f]"
    >
      {children}
    </select>
  );
}

function DetailCard({
  title,
  detail,
}: {
  title: string;
  detail: BaziResult["yearDetail"];
}) {
  return (
    <div className="rounded-2xl border border-[#eadfce] bg-white p-4">
      <div className="text-xs text-[#967b5d]">{title}</div>
      <div className="mt-2 text-2xl font-semibold text-[#583a27]">
        {detail.pillar}
      </div>
      <div className="mt-2 text-sm text-[#806b55]">
        天干：{detail.stem} · {detail.tenGodStem}
      </div>
      <div className="mt-1 text-sm text-[#806b55]">
        地支：{detail.branch} · {detail.tenGodBranch}
      </div>
      <div className="mt-2 text-xs leading-6 text-[#967b5d]">
        藏干：{detail.hiddenStems.join("、") || "—"}
      </div>
    </div>
  );
}

export default function PanPage() {
  const [year, setYear] = useState("2000");
  const [month, setMonth] = useState("2");
  const [day, setDay] = useState("6");
  const [hour, setHour] = useState("6");
  const [minute, setMinute] = useState("59");
  const [gender, setGender] = useState<Gender>("女");

  const [calculated, setCalculated] = useState<BaziResult | null>(null);

  const maxDay = daysInMonth(Number(year), Number(month));

  const safeDay = Math.min(Number(day), maxDay);

  const liveLunarDate = useMemo(() => {
    try {
      const solar = Solar.fromYmdHms(
        Number(year),
        Number(month),
        safeDay,
        Number(hour),
        Number(minute),
        0,
      );

      const lunar = solar.getLunar();

      return `${lunar.getYearInChinese()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`;
    } catch {
      return "";
    }
  }, [year, month, safeDay, hour, minute]);

  const days = Array.from(
    { length: maxDay },
    (_, i) => i + 1,
  );

  const handleMonth = (value: string) => {
    setMonth(value);
    const max = daysInMonth(Number(year), Number(value));
    if (Number(day) > max) {
      setDay(String(max));
    }
  };

  const handleYear = (value: string) => {
    setYear(value);
    const max = daysInMonth(Number(value), Number(month));
    if (Number(day) > max) {
      setDay(String(max));
    }
  };

  const runCalculation = () => {
    const date = new Date(
      Number(year),
      Number(month) - 1,
      safeDay,
    );

    const result = calculateBazi(
      date,
      `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
      gender,
    );

    setCalculated(result);
  };

  const currentPillarText = useMemo(() => {
    if (!calculated) return "等待排盘";
    return `${calculated.yearPillar} · ${calculated.monthPillar} · ${calculated.dayPillar} · ${calculated.hourPillar}`;
  }, [calculated]);

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-[#29251f]">
      <div className="mx-auto max-w-6xl px-5 py-10 md:px-8">
        <header className="mb-10">
          <div className="mb-3 text-sm tracking-[0.2em] text-[#8b6f47]">
            东方命格 AI
          </div>

          <h1 className="text-3xl font-semibold md:text-4xl">
            个人八字排盘
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#756f66]">
            输入出生年月日、出生时刻与性别，生成四柱、农历、五行、十神、大运与流年分析。
          </p>
        </header>
        <section className="rounded-3xl border border-[#e7e0d4] bg-white p-5 shadow-sm md:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#29251f] text-sm text-white">
              命
            </div>

            <div>
              <h2 className="text-xl font-semibold">
                出生信息
              </h2>

              <p className="mt-1 text-xs text-[#92897d]">
                请填写真实出生信息
              </p>
            </div>
          </div>

          <div className="space-y-7">

            <div>
              <div className="mb-3 text-sm font-medium text-[#5f594f]">
                出生日期
              </div>

              <div className="grid grid-cols-3 gap-2">

                <SelectBox
                  value={year}
                  onChange={handleYear}
                >
                  {YEARS.map((item) => (
                    <option key={item} value={item}>
                      {item} 年
                    </option>
                  ))}
                </SelectBox>

                <SelectBox
                  value={month}
                  onChange={handleMonth}
                >
                  {MONTHS.map((item) => (
                    <option key={item} value={item}>
                      {item} 月
                    </option>
                  ))}
                </SelectBox>

                <SelectBox
                  value={String(safeDay)}
                  onChange={setDay}
                >
                  {days.map((item) => (
                    <option key={item} value={item}>
                      {item} 日
                    </option>
                  ))}
                </SelectBox>

              </div>
            </div>

            <div>
              <div className="mb-3 text-sm font-medium text-[#5f594f]">
                出生时间
              </div>

              <div className="grid grid-cols-2 gap-2">

                <SelectBox
                  value={hour}
                  onChange={setHour}
                >
                  {HOURS.map((item) => (
                    <option key={item} value={item}>
                      {String(item).padStart(2, "0")} 时
                    </option>
                  ))}
                </SelectBox>

                <SelectBox
                  value={minute}
                  onChange={setMinute}
                >
                  {MINUTES.map((item) => (
                    <option key={item} value={item}>
                      {String(item).padStart(2, "0")} 分
                    </option>
                  ))}
                </SelectBox>

              </div>
            </div>

            <div>
              <div className="mb-3 text-sm font-medium text-[#5f594f]">
                性别
              </div>

              <div className="grid grid-cols-2 gap-3">

                {(["男", "女"] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setGender(item)}
                    className={`h-14 rounded-xl border text-sm transition ${
                      gender === item
                        ? "border-[#29251f] bg-[#29251f] text-white"
                        : "border-[#ddd5c8] bg-white text-[#5f594f]"
                    }`}
                  >
                    {item}
                  </button>
                ))}

              </div>
            </div>

            <div className="rounded-2xl bg-[#f5f1ea] p-4">
              <div className="text-xs text-[#92897d]">
                农历日期
              </div>

              <div className="mt-2 text-base font-semibold text-[#29251f]">
                {liveLunarDate || "请选择出生信息"}
              </div>
            </div>

            <button
              onClick={runCalculation}
              className="w-full rounded-xl bg-[#29251f] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#403a33]"
            >
              开始排盘
            </button>

          </div>
        </section>
        {calculated && (
          <div className="mt-6 space-y-6">
            <section className="rounded-3xl border border-[#e5d7c3] bg-[#fffaf3] p-6 shadow-sm md:p-8">
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="text-xs text-[#967b5d]">
                    四柱命盘
                  </div>

                  <h2 className="mt-2 text-3xl font-semibold">
                    {currentPillarText}
                  </h2>
                </div>

                <div className="text-sm text-[#806b55]">
                  {calculated.solarDate} · {calculated.solarTime} ·{" "}
                  {gender}
                                  <div className="mt-1 text-sm text-[#967b5d]">
                    农历：{calculated.lunarDate}
                  </div></div>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-4">
                <DetailCard
                  title="年柱"
                  detail={calculated.yearDetail}
                />

                <DetailCard
                  title="月柱"
                  detail={calculated.monthDetail}
                />

                <DetailCard
                  title="日柱"
                  detail={calculated.dayDetail}
                />

                <DetailCard
                  title="时柱"
                  detail={calculated.hourDetail}
                />
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-4">
              {[
                ["日主", calculated.dayMaster, calculated.dayMasterElement],
                ["旺衰", calculated.strength, "命局综合"],
                ["格局", calculated.pattern, "月令结构"],
                ["生肖", calculated.zodiac, "年支生肖"],
              ].map(([title, value, sub]) => (
                <div
                  key={title}
                  className="rounded-3xl border border-[#e5d7c3] bg-white p-5 shadow-sm"
                >
                  <div className="text-xs text-[#967b5d]">
                    {title}
                  </div>

                  <div className="mt-2 text-2xl font-semibold">
                    {value}
                  </div>

                  <div className="mt-1 text-sm text-[#806b55]">
                    {sub}
                  </div>
                </div>
              ))}
            </section>

            <section className="rounded-3xl border border-[#e5d7c3] bg-[#fffaf3] p-6 shadow-sm md:p-8">
              <h2 className="text-xl font-semibold">
                喜用 / 忌
              </h2>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl bg-[#eadbc5] p-4">
                  <div className="text-xs text-[#967b5d]">
                    当前喜用方向
                  </div>

                  <div className="mt-2 text-lg font-semibold">
                    {calculated.usefulElements.join(" · ")}
                  </div>
                </div>

                <div className="rounded-2xl bg-[#f1e5d6] p-4">
                  <div className="text-xs text-[#967b5d]">
                    当前忌讳方向
                  </div>

                  <div className="mt-2 text-lg font-semibold">
                    {calculated.avoidElements.join(" · ")}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-[#e5d7c3] bg-[#fffaf3] p-6 shadow-sm md:p-8">
              <h2 className="text-xl font-semibold">
                五行分布
              </h2>

              <div className="mt-5 space-y-4">
                {elements.map((element) => {
                  const count =
                    calculated.fiveElements[element];

                  return (
                    <div key={element}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span>{element}</span>
                        <span className="text-[#8b7355]">
                          {count}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-[#eee4d6]">
                        <div
                          className="h-full rounded-full bg-[#9a7651]"
                          style={{
                            width: `${Math.min(100, count * 15)}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-3xl border border-[#e5d7c3] bg-[#fffaf3] p-6 shadow-sm">
              <h2 className="text-xl font-semibold">
                十神结构
              </h2>

              <div className="mt-5 grid gap-3 md:grid-cols-4">

                <div className="rounded-2xl border border-[#eadfce] bg-white p-4">
                  <div className="text-xs text-[#967b5d]">
                    年柱
                  </div>

                  <div className="mt-2 text-xl font-semibold text-[#583a27]">
                    {calculated.yearDetail.stem}
                  </div>

                  <div className="mt-2 text-sm text-[#806b55]">
                    {calculated.yearDetail.tenGodStem}
                  </div>

                  <div className="mt-2 text-xs text-[#967b5d]">
                    地支十神：{calculated.yearDetail.hiddenStems.join("、")}
                  </div>
                </div>

                <div className="rounded-2xl border border-[#eadfce] bg-white p-4">
                  <div className="text-xs text-[#967b5d]">
                    月柱
                  </div>

                  <div className="mt-2 text-xl font-semibold text-[#583a27]">
                    {calculated.monthDetail.stem}
                  </div>

                  <div className="mt-2 text-sm text-[#806b55]">
                    {calculated.monthDetail.tenGodStem}
                  </div>

                  <div className="mt-2 text-xs text-[#967b5d]">
                    地支十神：{calculated.monthDetail.hiddenStems.join("、")}
                  </div>
                </div>

                <div className="rounded-2xl border border-[#eadfce] bg-white p-4">
                  <div className="text-xs text-[#967b5d]">
                    日柱
                  </div>

                  <div className="mt-2 text-xl font-semibold text-[#583a27]">
                    {calculated.dayDetail.stem}
                  </div>

                  <div className="mt-2 text-sm text-[#806b55]">
                    {calculated.dayDetail.tenGodStem}
                  </div>

                  <div className="mt-2 text-xs text-[#967b5d]">
                    地支十神：{calculated.dayDetail.hiddenStems.join("、")}
                  </div>
                </div>

                <div className="rounded-2xl border border-[#eadfce] bg-white p-4">
                  <div className="text-xs text-[#967b5d]">
                    时柱
                  </div>

                  <div className="mt-2 text-xl font-semibold text-[#583a27]">
                    {calculated.hourDetail.stem}
                  </div>

                  <div className="mt-2 text-sm text-[#806b55]">
                    {calculated.hourDetail.tenGodStem}
                  </div>

                  <div className="mt-2 text-xs text-[#967b5d]">
                    地支十神：{calculated.hourDetail.hiddenStems.join("、")}
                  </div>
                </div>

              </div>
            </section>
            <section className="rounded-3xl border border-[#e5d7c3] bg-[#fffaf3] p-6 shadow-sm">
              <h2 className="text-xl font-semibold">
                地支关系
              </h2>

              <div className="mt-5 flex flex-wrap gap-3">
                {calculated.branchRelations.length === 0 ? (
                  <div className="text-sm text-[#967b5d]">
                    当前四柱没有检测到主要合、冲、害、刑关系。
                  </div>
                ) : (
                  calculated.branchRelations.map(
                    (relation, index) => (
                      <div
                        key={`${relation.detail}-${index}`}
                        className="rounded-2xl border border-[#eadfce] bg-white px-4 py-3"
                      >
                        <div className="font-semibold">
                          {relation.from}
                          {relation.to}
                        </div>

                        <div className="mt-1 text-xs text-[#967b5d]">
                          {relation.type}
                        </div>
                      </div>
                    ),
                  )
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-[#e5d7c3] bg-[#fffaf3] p-6 shadow-sm">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <h2 className="text-xl font-semibold">
                  大运
                </h2>

                <div className="text-sm text-[#806b55]">
                  {calculated.forward ? "顺排" : "逆排"}
                  {" · "}
                  起运约 {calculated.startAge} 岁
                  {" · "}
                  {calculated.startDate}
                </div>
              </div>

              {calculated.daYun.length === 0 ? (
                <div className="mt-5 rounded-2xl bg-white p-5 text-sm text-[#967b5d]">
                  当前出生信息没有返回可显示的大运数据。
                </div>
              ) : (
                <div className="mt-5 overflow-x-auto">
                  <div className="min-w-[720px]">
                    <div className="grid grid-cols-5 gap-3 px-4 text-xs text-[#967b5d]">
                      <div>大运</div>
                      <div>起始年份</div>
                      <div>结束年份</div>
                      <div>年龄</div>
                      <div>状态</div>
                    </div>

                    <div className="mt-3 space-y-2">
                      {calculated.daYun.map((item) => (
                        <div
                          key={`${item.index}-${item.pillar}`}
                          className={`grid grid-cols-5 gap-3 rounded-xl px-4 py-3 text-sm ${
                            item.isCurrent
                              ? "bg-[#eadbc5] text-[#583a27]"
                              : "bg-white text-[#765d45]"
                          }`}
                        >
                          <div className="font-semibold">
                            {item.pillar}
                          </div>

                          <div>{item.startYear}</div>
                          <div>{item.endYear}</div>

                          <div>
                            {item.startAge}～{item.endAge}岁
                          </div>

                          <div>
                            {item.isCurrent
                              ? "当前大运"
                              : ""}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-[#e5d7c3] bg-[#fffaf3] p-6 shadow-sm">
              <h2 className="text-xl font-semibold">
                当前流年
              </h2>

              <div className="mt-5 grid gap-3 md:grid-cols-4">
                <div className="rounded-2xl bg-[#f3e9db] p-4">
                  <div className="text-xs text-[#967b5d]">
                    年份
                  </div>

                  <div className="mt-2 text-2xl font-semibold">
                    {calculated.currentYear.year}
                  </div>
                </div>

                <div className="rounded-2xl bg-[#f3e9db] p-4">
                  <div className="text-xs text-[#967b5d]">
                    干支
                  </div>

                  <div className="mt-2 text-2xl font-semibold">
                    {calculated.currentYear.ganZhi}
                  </div>
                </div>

                <div className="rounded-2xl bg-[#eadbc5] p-4">
                  <div className="text-xs text-[#967b5d]">
                    当前大运
                  </div>

                  <div className="mt-2 text-2xl font-semibold">
                    {calculated.currentDaYun?.pillar || "—"}
                  </div>
                </div>

                <div className="rounded-2xl bg-white p-4">
                  <div className="text-xs text-[#967b5d]">
                    流年十神
                  </div>

                  <div className="mt-2 text-xl font-semibold">
                    {calculated.currentYear.stem}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-[#e5d7c3] bg-[#fffaf3] p-6 shadow-sm md:p-8">
              <h2 className="text-xl font-semibold">
                命局分析
              </h2>

              <div className="mt-5 space-y-4">
                {calculated.interpretation.map(
                  (paragraph, index) => (
                    <div
                      key={index}
                      className="rounded-2xl bg-white p-5"
                    >
                      <p className="text-sm leading-8 text-[#705a45]">
                        {paragraph}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </section>
          </div>
        )}

        <p className="mt-8 text-center text-xs leading-6 text-[#aaa095]">
          本产品内容用于传统文化研究与娱乐参考，不构成医学、法律、投资或其他专业建议。
        </p>
      </div>
    </main>
  );
}