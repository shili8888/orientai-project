"use client";

import { useState } from "react";
import { calculateBazi } from "../../lib/bazi";

type Gender = "男" | "女";

type Result = ReturnType<typeof calculateBazi>;

export default function BaziPanPage() {
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender>("男");
  const [date, setDate] = useState("2000-01-01");
  const [time, setTime] = useState("12:00");
  const [result, setResult] = useState<Result | null>(null);

  function handleCalculate() {
    const birthDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(birthDate.getTime())) {
      return;
    }

    const calculated = calculateBazi(
      birthDate,
      time,
      gender
    );

    setResult(calculated);
  }

  const elements = result
    ? [
        ["木", result.fiveElements["木"]],
        ["火", result.fiveElements["火"]],
        ["土", result.fiveElements["土"]],
        ["金", result.fiveElements["金"]],
        ["水", result.fiveElements["水"]],
      ]
    : [];

  return (
    <main className="min-h-screen bg-[#f7f3ec] text-[#29251f]">
      <div className="mx-auto max-w-5xl px-5 py-10 md:px-8">

        <div className="mb-8">
          <a
            href="/"
            className="text-sm text-[#8b6f47] hover:underline"
          >
            ← 返回首页
          </a>

          <div className="mt-6">
            <p className="text-sm tracking-[0.25em] text-[#9a8060]">
              东方命格 AI
            </p>

            <h1 className="mt-3 text-3xl font-semibold md:text-4xl">
              八字排盘
            </h1>

            <p className="mt-3 text-sm leading-7 text-[#756b5d]">
              输入出生资料，生成个人四柱八字与基础命盘。
            </p>
          </div>
        </div>

        <section className="rounded-3xl border border-[#e7e0d4] bg-white p-6 shadow-sm md:p-8">
          <div className="grid gap-6 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-medium">
                姓名（可选）
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="请输入姓名"
                className="h-14 w-full rounded-xl border border-[#ddd5c8] px-4 outline-none focus:border-[#8b6f47]"
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
                    className={`h-14 rounded-xl border ${
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

            <div>
              <label className="mb-2 block text-sm font-medium">
                公历出生日期
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-14 w-full rounded-xl border border-[#ddd5c8] px-4 outline-none focus:border-[#8b6f47]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                出生时间
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="h-14 w-full rounded-xl border border-[#ddd5c8] px-4 outline-none focus:border-[#8b6f47]"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleCalculate}
            className="mt-8 h-14 w-full rounded-xl bg-[#29251f] text-base font-medium text-white transition hover:bg-[#403a32]"
          >
            开始八字排盘 →
          </button>
        </section>

        {result && (
          <div className="mt-8 space-y-6">

            <section className="rounded-3xl border border-[#e7e0d4] bg-white p-6 shadow-sm md:p-8">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm text-[#9a8060]">
                    {name || "个人命盘"}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    四柱八字
                  </h2>
                </div>

                <div className="text-right text-sm text-[#756b5d]">
                  <div>{gender}命</div>
                  <div>{date} {time}</div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-4 gap-2 md:gap-4">
                {[
                  ["年柱", result.yearPillar],
                  ["月柱", result.monthPillar],
                  ["日柱", result.dayPillar],
                  ["时柱", result.hourPillar],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl bg-[#f7f3ec] p-4 text-center"
                  >
                    <div className="text-xs text-[#92897d]">
                      {label}
                    </div>
                    <div className="mt-3 text-2xl font-semibold md:text-3xl">
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">

              <div className="rounded-3xl border border-[#e7e0d4] bg-white p-6 shadow-sm">
                <p className="text-sm text-[#92897d]">生肖</p>
                <p className="mt-3 text-2xl font-semibold">
                  {getZodiac(result.yearPillar)}
                </p>
              </div>

              <div className="rounded-3xl border border-[#e7e0d4] bg-white p-6 shadow-sm">
                <p className="text-sm text-[#92897d]">日主</p>
                <p className="mt-3 text-2xl font-semibold">
                  {result.dayMaster}
                </p>
                <p className="mt-1 text-sm text-[#756b5d]">
                  {result.dayMasterElement}
                </p>
              </div>

              <div className="rounded-3xl border border-[#e7e0d4] bg-white p-6 shadow-sm">
                <p className="text-sm text-[#92897d]">日主状态</p>
                <p className="mt-3 text-2xl font-semibold">
                  {result.strength}
                </p>
              </div>

            </section>

            <section className="rounded-3xl border border-[#e7e0d4] bg-white p-6 shadow-sm md:p-8">
              <h2 className="text-2xl font-semibold">
                五行分布
              </h2>

              <div className="mt-6 grid grid-cols-5 gap-2 md:gap-4">
                {elements.map(([element, value]) => (
                  <div
                    key={element}
                    className="rounded-2xl bg-[#f7f3ec] p-4 text-center"
                  >
                    <div className="text-lg font-semibold">
                      {element}
                    </div>
                    <div className="mt-2 text-2xl">
                      {value}
                    </div>
                    <div className="mt-1 text-xs text-[#92897d]">
                      出现次数
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-[#e7e0d4] bg-white p-6 shadow-sm md:p-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">
                  命盘基础解读
                </h2>
                <span className="text-xs text-[#9a8060]">
                  传统文化参考
                </span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-[#f7f3ec] p-5">
                  <h3 className="font-semibold">日主</h3>
                  <p className="mt-2 text-sm leading-7 text-[#756b5d]">
                    你的日主为「{result.dayMaster}」，
                    五行属性为「{result.dayMasterElement}」。
                  </p>
                </div>

                <div className="rounded-2xl bg-[#f7f3ec] p-5">
                  <h3 className="font-semibold">身强身弱</h3>
                  <p className="mt-2 text-sm leading-7 text-[#756b5d]">
                    当前基础算法判断为「{result.strength}」。
                  </p>
                </div>

                <div className="rounded-2xl bg-[#f7f3ec] p-5">
                  <h3 className="font-semibold">事业方向</h3>
                  <p className="mt-2 text-sm leading-7 text-[#756b5d]">
                    完整事业分析将在命盘基础数据之上，
                    进一步结合十神、格局与大运进行。
                  </p>
                </div>

                <div className="rounded-2xl bg-[#f7f3ec] p-5">
                  <h3 className="font-semibold">婚恋方向</h3>
                  <p className="mt-2 text-sm leading-7 text-[#756b5d]">
                    婚恋分析可进一步进入婚恋合盘，
                    对比双方四柱与五行关系。
                  </p>
                </div>
              </div>
            </section>

            <div className="grid gap-3 md:grid-cols-2">
              <a
                href="/compatibility"
                className="rounded-2xl bg-[#29251f] p-5 text-center font-medium text-white"
              >
                进入婚恋合盘 →
              </a>

              <a
                href="/report"
                className="rounded-2xl border border-[#ddd5c8] bg-white p-5 text-center font-medium text-[#29251f]"
              >
                查看完整报告示例 →
              </a>
            </div>

          </div>
        )}

        <p className="mt-8 text-center text-xs leading-6 text-[#aaa095]">
          本产品内容用于传统文化研究与娱乐参考，不构成医学、法律、投资或其他专业建议。
        </p>
      </div>
    </main>
  );
}

function getZodiac(yearPillar: string) {
  const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
  const animals = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];

  const branch = yearPillar[1];
  const index = branches.indexOf(branch);

  return index >= 0 ? animals[index] : "—";
}
