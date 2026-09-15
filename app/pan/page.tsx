"use client";

import { useMemo, useState } from "react";
import {
  calculateBazi,
  type BaziResult,
  type Gender,
} from "../../lib/bazi";

const elements = ["木", "火", "土", "金", "水"] as const;

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

const years = Array.from(
  { length: 101 },
  (_, index) => 1950 + index
);

const months = Array.from(
  { length: 12 },
  (_, index) => index + 1
);

const hours = Array.from(
  { length: 24 },
  (_, index) => index
);

const minutes = Array.from(
  { length: 60 },
  (_, index) => index
);

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function formatNumber(value: number) {
  return String(value).padStart(2, "0");
}

function WheelSelect({
  value,
  onChange,
  children,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div>
      <div className="mb-2 text-xs text-[#967b5d]">{label}</div>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-14 w-full appearance-none rounded-2xl border border-[#dfd1be] bg-[#fffaf3] px-4 text-center text-lg font-semibold text-[#583a27] outline-none focus:border-[#8b6f47]"
      >
        {children}
      </select>
    </div>
  );
}

function getZodiac(result: BaziResult) {
  return zodiacMap[result.yearPillar[1]] || "—";
}

function DetailCard({
  title,
  detail,
}: {
  title: string;
  detail: BaziResult["yearDetail"];
}) {
  return (
    <div className="rounded-3xl border border-[#e5d7c3] bg-white p-5 shadow-sm">
      <div className="text-xs tracking-[0.2em] text-[#967b5d]">
        {title}
      </div>

      <div className="mt-3 text-3xl font-semibold text-[#583a27]">
        {detail.pillar}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-xl bg-[#f5ecdf] p-3">
          <div className="text-xs text-[#967b5d]">天干</div>
          <div className="mt-1 font-semibold">
            {detail.stem} · {detail.stemElement}
          </div>
        </div>

        <div className="rounded-xl bg-[#f5ecdf] p-3">
          <div className="text-xs text-[#967b5d]">地支</div>
          <div className="mt-1 font-semibold">
            {detail.branch} · {detail.branchElement}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-xs text-[#967b5d]">
          藏干 / 十神
        </div>

        <div className="mt-2 space-y-2">
          {detail.hiddenStems.map((item) => (
            <div
              key={`${item.stem}-${item.role}`}
              className="flex items-center justify-between rounded-xl bg-[#faf6ef] px-3 py-2 text-sm"
            >
              <span>
                <strong>{item.stem}</strong>
                <span className="ml-2 text-[#967b5d]">
                  {item.role}
                </span>
              </span>

              <span className="text-[#806b55]">
                {item.tenGod}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BaziPanPage() {
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender>("女");

  const [year, setYear] = useState(2000);
  const [month, setMonth] = useState(2);
  const [day, setDay] = useState(6);

  const [hour, setHour] = useState(6);
  const [minute, setMinute] = useState(59);

  const [result, setResult] = useState<BaziResult | null>(null);

  const maxDay = daysInMonth(year, month);

  const safeDay = Math.min(day, maxDay);

  const dateText =
    `${year}-${formatNumber(month)}-${formatNumber(safeDay)}`;

  const timeText =
    `${formatNumber(hour)}:${formatNumber(minute)}`;

  const calculated = useMemo(() => {
    if (!result) return null;

    return result;
  }, [result]);

  function calculate() {
    const birthDate = new Date(
      year,
      month - 1,
      safeDay
    );

    setResult(
      calculateBazi(
        birthDate,
        timeText,
        gender
      )
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f1e8] text-[#30271f]">
      <div className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-12">

        <div className="mb-8">
          <a
            href="/"
            className="text-sm text-[#8b6f47] hover:underline"
          >
            ← 返回首页
          </a>

          <p className="mt-6 text-sm tracking-[0.25em] text-[#9a8060]">
            东方命格 AI
          </p>

          <h1 className="mt-3 text-3xl font-semibold md:text-4xl">
            八字排盘
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#756b5d]">
            输入真实出生资料，系统自动换算农历、四柱、藏干、十神、大运与流年。
          </p>
        </div>

        <section className="rounded-3xl border border-[#e5d7c3] bg-white p-6 shadow-sm md:p-8">

          <div className="grid gap-6 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-medium">
                姓名
              </label>

              <input
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="请输入姓名（可选）"
                className="h-14 w-full rounded-2xl border border-[#dfd1be] px-4 outline-none focus:border-[#8b6f47]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                性别
              </label>

              <div className="grid grid-cols-2 gap-3">
                {(["男", "女"] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setGender(item)}
                    className={`h-14 rounded-2xl border ${
                      gender === item
                        ? "border-[#583a27] bg-[#583a27] text-white"
                        : "border-[#dfd1be] bg-white text-[#765d45]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

          </div>

          <div className="mt-8">
            <div className="mb-3">
              <div className="text-sm font-semibold">
                出生日期
              </div>

              <div className="mt-1 text-xs text-[#967b5d]">
                滚动 / 点击选择公历年月日
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">

              <WheelSelect
                label="年份"
                value={String(year)}
                onChange={(value) => {
                  const next = Number(value);
                  setYear(next);
                  setDay(
                    Math.min(
                      day,
                      daysInMonth(next, month)
                    )
                  );
                }}
              >
                {years.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}年
                  </option>
                ))}
              </WheelSelect>

              <WheelSelect
                label="月份"
                value={String(month)}
                onChange={(value) => {
                  const next = Number(value);
                  setMonth(next);
                  setDay(
                    Math.min(
                      day,
                      daysInMonth(year, next)
                    )
                  );
                }}
              >
                {months.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}月
                  </option>
                ))}
              </WheelSelect>

              <WheelSelect
                label="日期"
                value={String(safeDay)}
                onChange={(value) =>
                  setDay(Number(value))
                }
              >
                {Array.from(
                  { length: maxDay },
                  (_, index) => index + 1
                ).map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}日
                  </option>
                ))}
              </WheelSelect>

            </div>
          </div>

          <div className="mt-8">
            <div className="mb-3">
              <div className="text-sm font-semibold">
                出生时间
              </div>

              <div className="mt-1 text-xs text-[#967b5d]">
                滚动 / 点击选择时、分
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">

              <WheelSelect
                label="小时"
                value={String(hour)}
                onChange={(value) =>
                  setHour(Number(value))
                }
              >
                {hours.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {formatNumber(item)} 时
                  </option>
                ))}
              </WheelSelect>

              <WheelSelect
                label="分钟"
                value={String(minute)}
                onChange={(value) =>
                  setMinute(Number(value))
                }
              >
                {minutes.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {formatNumber(item)} 分
                  </option>
                ))}
              </WheelSelect>

            </div>
          </div>

          <button
            type="button"
            onClick={calculate}
            className="mt-8 h-14 w-full rounded-2xl bg-[#583a27] font-medium text-white transition hover:bg-[#6d4931]"
          >
            开始正式排盘 →
          </button>

        </section>

        {calculated && (
          <div className="mt-8 space-y-6">

            <section className="rounded-3xl border border-[#e5d7c3] bg-[#fffaf3] p-6 shadow-sm md:p-8">

              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

                <div>
                  <div className="text-sm text-[#967b5d]">
                    {name || "个人命盘"}
                  </div>

                  <h2 className="mt-2 text-2xl font-semibold text-[#583a27]">
                    {dateText} · {timeText} · {gender}
                  </h2>

                  <div className="mt-3 text-sm text-[#806b55]">
                    农历：{calculated.lunarDate}
                  </div>

                  <div className="mt-1 text-sm text-[#806b55]">
                    生肖：{getZodiac(calculated)}
                  </div>
                </div>

                <div className="rounded-2xl bg-[#eadbc5] px-5 py-4 text-sm text-[#63432c]">
                  <div>
                    农历 {calculated.lunarYear} 年
                  </div>
                  <div className="mt-1">
                    {calculated.lunarMonthName}
                    {calculated.lunarDayName}
                  </div>
                </div>

              </div>

            </section>

            <section className="rounded-3xl border border-[#e5d7c3] bg-[#fffaf3] p-6 shadow-sm md:p-8">

              <h2 className="text-xl font-semibold text-[#583a27]">
                四柱命盘
              </h2>

              <div className="mt-5 grid gap-4 md:grid-cols-4">
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

              <div className="rounded-3xl border border-[#e5d7c3] bg-white p-5 shadow-sm">
                <div className="text-xs text-[#967b5d]">
                  日主
                </div>
                <div className="mt-2 text-3xl font-semibold text-[#583a27]">
                  {calculated.dayMaster}
                </div>
                <div className="mt-1 text-sm text-[#806b55]">
                  {calculated.dayMasterElement}
                </div>
              </div>

              <div className="rounded-3xl border border-[#e5d7c3] bg-white p-5 shadow-sm">
                <div className="text-xs text-[#967b5d]">
                  旺衰
                </div>
                <div className="mt-2 text-2xl font-semibold text-[#583a27]">
                  {calculated.strength}
                </div>
              </div>

              <div className="rounded-3xl border border-[#e5d7c3] bg-white p-5 shadow-sm">
                <div className="text-xs text-[#967b5d]">
                  格局
                </div>
                <div className="mt-2 text-2xl font-semibold text-[#583a27]">
                  {calculated.pattern}
                </div>
              </div>

              <div className="rounded-3xl border border-[#e5d7c3] bg-white p-5 shadow-sm">
                <div className="text-xs text-[#967b5d]">
                  生肖
                </div>
                <div className="mt-2 text-2xl font-semibold text-[#583a27]">
                  {getZodiac(calculated)}
                </div>
              </div>

            </section>

            <section className="rounded-3xl border border-[#e5d7c3] bg-[#fffaf3] p-6 shadow-sm md:p-8">

              <h2 className="text-xl font-semibold text-[#583a27]">
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

              <h2 className="text-xl font-semibold text-[#583a27]">
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
                            width: `${Math.min(
                              100,
                              count * 20
                            )}%`,
                          }}
                        />
                      </div>

                    </div>
                  );
                })}
              </div>

            </section>

            <section className="rounded-3xl border border-[#e5d7c3] bg-[#fffaf3] p-6 shadow-sm">

              <h2 className="text-xl font-semibold text-[#583a27]">
                十神结构
              </h2>

              <div className="mt-5 grid gap-3 md:grid-cols-4">

                {[
                  ["年柱", calculated.yearDetail.stem, calculated.tenGods.year],
                  ["月柱", calculated.monthDetail.stem, calculated.tenGods.month],
                  ["日柱", calculated.dayDetail.stem, calculated.tenGods.day],
                  ["时柱", calculated.hourDetail.stem, calculated.tenGods.hour],
                ].map(([title, stem, god]) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-[#eadfce] bg-white p-4"
                  >
                    <div className="text-xs text-[#967b5d]">
                      {title}
                    </div>

                    <div className="mt-2 text-xl font-semibold text-[#583a27]">
                      {stem}
                    </div>

                    <div className="mt-2 text-sm text-[#806b55]">
                      {god}
                    </div>
                  </div>
                ))}

              </div>

            </section>

            <section className="rounded-3xl border border-[#e5d7c3] bg-[#fffaf3] p-6 shadow-sm">

              <h2 className="text-xl font-semibold text-[#583a27]">
                地支关系
              </h2>

              <div className="mt-5 flex flex-wrap gap-3">

                {calculated.branchRelations.length === 0 ? (
                  <div className="text-sm text-[#967b5d]">
                    当前四柱没有检测到已定义的合、冲、害、破、半合或三合。
                  </div>
                ) : (
                  calculated.branchRelations.map(
                    (relation, index) => (
                      <div
                        key={`${relation.detail}-${index}`}
                        className="rounded-2xl border border-[#eadfce] bg-white px-4 py-3"
                      >
                        <div className="font-semibold text-[#583a27]">
                          {relation.from}
                          {relation.to}
                        </div>

                        <div className="mt-1 text-xs text-[#967b5d]">
                          {relation.type}
                        </div>
                      </div>
                    )
                  )
                )}

              </div>

            </section>

            <section className="rounded-3xl border border-[#e5d7c3] bg-[#fffaf3] p-6 shadow-sm">

              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">

                <h2 className="text-xl font-semibold text-[#583a27]">
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

            </section>

            <section className="rounded-3xl border border-[#e5d7c3] bg-[#fffaf3] p-6 shadow-sm">

              <h2 className="text-xl font-semibold text-[#583a27]">
                当前流年
              </h2>

              <div className="mt-5 grid gap-3 md:grid-cols-3">

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

              </div>

            </section>

            <section className="rounded-3xl border border-[#e5d7c3] bg-[#fffaf3] p-6 shadow-sm md:p-8">

              <h2 className="text-xl font-semibold text-[#583a27]">
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
                  )
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