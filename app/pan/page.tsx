"use client";

import { useMemo, useState } from "react";
import { calculateBazi, type BaziResult } from "../../lib/bazi";

type Gender = "男" | "女";
type TimeMode = "exact" | "shi";

const years = Array.from({ length: 127 }, (_, i) => 2026 - i);
const months = Array.from({ length: 12 }, (_, i) => i + 1);

const shiChenList = [
  ["子", "23:00–01:00"],
  ["丑", "01:00–03:00"],
  ["寅", "03:00–05:00"],
  ["卯", "05:00–07:00"],
  ["辰", "07:00–09:00"],
  ["巳", "09:00–11:00"],
  ["午", "11:00–13:00"],
  ["未", "13:00–15:00"],
  ["申", "15:00–17:00"],
  ["酉", "17:00–19:00"],
  ["戌", "19:00–21:00"],
  ["亥", "21:00–23:00"],
] as const;

const elementOrder = ["木", "火", "土", "金", "水"] as const;

const elementMeaning: Record<string, string> = {
  木: "生发、规划、学习、成长",
  火: "表达、行动、影响力、热情",
  土: "稳定、执行、承载、现实感",
  金: "规则、判断、结构、效率",
  水: "变化、信息、流动、适应",
};

const heavenlyStemYinYang: Record<string, "阳" | "阴"> = {
  甲: "阳",
  乙: "阴",
  丙: "阳",
  丁: "阴",
  戊: "阳",
  己: "阴",
  庚: "阳",
  辛: "阴",
  壬: "阳",
  癸: "阴",
};

const heavenlyStemElement: Record<string, string> = {
  甲: "木",
  乙: "木",
  丙: "火",
  丁: "火",
  戊: "土",
  己: "土",
  庚: "金",
  辛: "金",
  壬: "水",
  癸: "水",
};

function getDays(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function getTenGod(dayMaster: string, target: string) {
  const dmElement = heavenlyStemElement[dayMaster];
  const targetElement = heavenlyStemElement[target];

  const dmIndex = elementOrder.indexOf(
    dmElement as (typeof elementOrder)[number]
  );
  const targetIndex = elementOrder.indexOf(
    targetElement as (typeof elementOrder)[number]
  );

  const sameYinYang =
    heavenlyStemYinYang[dayMaster] === heavenlyStemYinYang[target];

  if (dmElement === targetElement) {
    return sameYinYang ? "比肩" : "劫财";
  }

  if (targetIndex === (dmIndex + 1) % 5) {
    return sameYinYang ? "食神" : "伤官";
  }

  if (targetIndex === (dmIndex + 4) % 5) {
    return sameYinYang ? "偏印" : "正印";
  }

  if (targetIndex === (dmIndex + 2) % 5) {
    return sameYinYang ? "偏财" : "正财";
  }

  return sameYinYang ? "七杀" : "正官";
}

function getZodiac(yearPillar: string) {
  const branches = [
    "子",
    "丑",
    "寅",
    "卯",
    "辰",
    "巳",
    "午",
    "未",
    "申",
    "酉",
    "戌",
    "亥",
  ];

  const animals = [
    "鼠",
    "牛",
    "虎",
    "兔",
    "龙",
    "蛇",
    "马",
    "羊",
    "猴",
    "鸡",
    "狗",
    "猪",
  ];

  const index = branches.indexOf(yearPillar[1]);
  return index >= 0 ? animals[index] : "—";
}

function getBranchRelations(result: BaziResult) {
  const branches = [
    result.yearPillar[1],
    result.monthPillar[1],
    result.dayPillar[1],
    result.hourPillar[1],
  ];

  const relations: string[] = [];

  const sixCombine: Record<string, string> = {
    子丑: "六合",
    丑子: "六合",
    寅亥: "六合",
    亥寅: "六合",
    卯戌: "六合",
    戌卯: "六合",
    辰酉: "六合",
    酉辰: "六合",
    巳申: "六合",
    申巳: "六合",
    午未: "六合",
    未午: "六合",
  };

  const sixClash: Record<string, string> = {
    子午: "相冲",
    午子: "相冲",
    丑未: "相冲",
    未丑: "相冲",
    寅申: "相冲",
    申寅: "相冲",
    卯酉: "相冲",
    酉卯: "相冲",
    辰戌: "相冲",
    戌辰: "相冲",
    巳亥: "相冲",
    亥巳: "相冲",
  };

  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      const pair = branches[i] + branches[j];

      if (sixCombine[pair]) {
        relations.push(`${branches[i]}${branches[j]} ${sixCombine[pair]}`);
      }

      if (sixClash[pair]) {
        relations.push(`${branches[i]}${branches[j]} ${sixClash[pair]}`);
      }
    }
  }

  return Array.from(new Set(relations));
}

function getElementAnalysis(result: BaziResult) {
  const values = elementOrder.map((element) => ({
    element,
    value: result.fiveElements[element],
  }));

  const max = Math.max(...values.map((item) => item.value));
  const min = Math.min(...values.map((item) => item.value));

  const strongest = values
    .filter((item) => item.value === max)
    .map((item) => item.element);

  const weakest = values
    .filter((item) => item.value === min)
    .map((item) => item.element);

  return {
    strongest,
    weakest,
    missing: values.filter((item) => item.value === 0).map((item) => item.element),
  };
}

function getPersonalityText(result: BaziResult) {
  const element = result.dayMasterElement;

  const texts: Record<string, string> = {
    木: "日主属木，传统五行象义偏向生发与成长。命盘解读时通常会关注规划、学习、持续成长以及环境变化对个人状态的影响。",
    火: "日主属火，传统五行象义偏向表达与行动。命盘解读时通常会关注表达能力、执行速度、热情以及对外影响力。",
    土: "日主属土，传统五行象义偏向稳定与承载。命盘解读时通常会关注责任感、执行力、稳定性以及现实层面的组织能力。",
    金: "日主属金，传统五行象义偏向规则与判断。命盘解读时通常会关注原则、效率、判断力以及结构化能力。",
    水: "日主属水，传统五行象义偏向流动与适应。命盘解读时通常会关注信息、变化、沟通以及环境适应能力。",
  };

  return texts[element];
}

function getCareerText(result: BaziResult) {
  if (result.strength === "身强") {
    return `当前基础算法判断日主为${result.strength}。传统命理阅读中，这类结构通常会进一步观察日主能够承担哪些财官食伤主题，再结合月令与岁运判断事业节奏。当前命盘的重点应放在「${result.dayMasterElement}」所代表的稳定能力，以及五行之间的流通关系。`;
  }

  return `当前基础算法判断日主为${result.strength}。传统命理阅读中，这类结构通常更重视扶助日主以及整体五行是否能够形成顺畅流通。事业层面不宜只看一个十神，而应结合月令、四柱位置以及后续大运综合判断。`;
}

function getWealthText(result: BaziResult) {
  return `以${result.dayMaster}为日主，财富主题在传统命理中主要对应「财星」。本命盘可以先观察财星是否出现、日主能否承财，再结合大运判断阶段性变化。这里展示的是基础命盘结构，不直接把某个五行数量等同于财富多少。`;
}

function getLoveText(result: BaziResult) {
  return `婚恋分析不能只看生肖。个人命盘阶段先观察日主、日支以及相关十神；进入双方合盘后，再比较两个人的日主关系、五行互补、六合、相冲等结构。当前可以继续进入「婚恋合盘」查看双方关系。`;
}

export default function BaziPanPage() {
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender>("男");

  const [year, setYear] = useState(2000);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);

  const [timeMode, setTimeMode] = useState<TimeMode>("exact");
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [shiChen, setShiChen] = useState("午");

  const [result, setResult] = useState<BaziResult | null>(null);

  const days = useMemo(() => getDays(year, month), [year, month]);

  function handleYearChange(value: number) {
    setYear(value);

    const max = getDays(value, month);
    if (day > max) {
      setDay(max);
    }
  }

  function handleMonthChange(value: number) {
    setMonth(value);

    const max = getDays(year, value);
    if (day > max) {
      setDay(max);
    }
  }

  function handleCalculate() {
    const birthDate = new Date(year, month - 1, day);

    const birthTime =
      timeMode === "shi"
        ? shiChen
        : `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

    setResult(calculateBazi(birthDate, birthTime, gender));
  }

  const elementAnalysis = result ? getElementAnalysis(result) : null;

  const tenGods = result
    ? [
        ["年干", result.yearPillar[0], getTenGod(result.dayMaster, result.yearPillar[0])],
        ["月干", result.monthPillar[0], getTenGod(result.dayMaster, result.monthPillar[0])],
        ["日干", result.dayPillar[0], "日主"],
        ["时干", result.hourPillar[0], getTenGod(result.dayMaster, result.hourPillar[0])],
      ]
    : [];

  return (
    <main className="min-h-screen bg-[#f7f3ec] text-[#29251f]">
      <div className="mx-auto max-w-6xl px-5 py-10 md:px-8">

        <a href="/" className="text-sm text-[#8b6f47] hover:underline">
          ← 返回首页
        </a>

        <header className="mt-7">
          <p className="text-sm tracking-[0.25em] text-[#9a8060]">
            东方命格 AI
          </p>

          <h1 className="mt-3 text-3xl font-semibold md:text-4xl">
            八字排盘
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#756b5d]">
            输入出生资料，生成个人四柱、五行、十神与基础命格报告。
          </p>
        </header>

        <section className="mt-8 rounded-3xl border border-[#e7e0d4] bg-white p-6 shadow-sm md:p-8">
          <div className="grid gap-7 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-medium">
                姓名（可选）
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="请输入姓名"
                className="h-14 w-full rounded-xl border border-[#ddd5c8] bg-white px-4 outline-none focus:border-[#8b6f47]"
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
              <label className="mb-3 block text-sm font-medium">
                公历出生日期
              </label>

              <div className="grid grid-cols-3 gap-3">
                <select
                  value={year}
                  onChange={(e) => handleYearChange(Number(e.target.value))}
                  className="h-14 rounded-xl border border-[#ddd5c8] bg-white px-3 text-base outline-none focus:border-[#8b6f47]"
                >
                  {years.map((item) => (
                    <option key={item} value={item}>
                      {item}年
                    </option>
                  ))}
                </select>

                <select
                  value={month}
                  onChange={(e) => handleMonthChange(Number(e.target.value))}
                  className="h-14 rounded-xl border border-[#ddd5c8] bg-white px-3 text-base outline-none focus:border-[#8b6f47]"
                >
                  {months.map((item) => (
                    <option key={item} value={item}>
                      {item}月
                    </option>
                  ))}
                </select>

                <select
                  value={day}
                  onChange={(e) => setDay(Number(e.target.value))}
                  className="h-14 rounded-xl border border-[#ddd5c8] bg-white px-3 text-base outline-none focus:border-[#8b6f47]"
                >
                  {Array.from({ length: days }, (_, i) => i + 1).map((item) => (
                    <option key={item} value={item}>
                      {item}日
                    </option>
                  ))}
                </select>
              </div>

              <p className="mt-2 text-xs text-[#92897d]">
                年、月、日分别选择；手机端可直接上下滚动选择。
              </p>
            </div>

            <div>
              <label className="mb-3 block text-sm font-medium">
                出生时间
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTimeMode("exact")}
                  className={`h-12 rounded-xl border text-sm ${
                    timeMode === "exact"
                      ? "border-[#29251f] bg-[#29251f] text-white"
                      : "border-[#ddd5c8] bg-white text-[#5f594f]"
                  }`}
                >
                  精准时间
                </button>

                <button
                  type="button"
                  onClick={() => setTimeMode("shi")}
                  className={`h-12 rounded-xl border text-sm ${
                    timeMode === "shi"
                      ? "border-[#29251f] bg-[#29251f] text-white"
                      : "border-[#ddd5c8] bg-white text-[#5f594f]"
                  }`}
                >
                  传统时辰
                </button>
              </div>

              {timeMode === "exact" ? (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <select
                    value={hour}
                    onChange={(e) => setHour(Number(e.target.value))}
                    className="h-14 rounded-xl border border-[#ddd5c8] bg-white px-4 text-base outline-none focus:border-[#8b6f47]"
                  >
                    {Array.from({ length: 24 }, (_, i) => i).map((item) => (
                      <option key={item} value={item}>
                        {String(item).padStart(2, "0")} 时
                      </option>
                    ))}
                  </select>

                  <select
                    value={minute}
                    onChange={(e) => setMinute(Number(e.target.value))}
                    className="h-14 rounded-xl border border-[#ddd5c8] bg-white px-4 text-base outline-none focus:border-[#8b6f47]"
                  >
                    {Array.from({ length: 60 }, (_, i) => i).map((item) => (
                      <option key={item} value={item}>
                        {String(item).padStart(2, "0")} 分
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {shiChenList.map(([shi, range]) => (
                    <button
                      key={shi}
                      type="button"
                      onClick={() => setShiChen(shi)}
                      className={`rounded-xl border px-2 py-3 text-sm ${
                        shiChen === shi
                          ? "border-[#29251f] bg-[#29251f] text-white"
                          : "border-[#ddd5c8] bg-white text-[#5f594f]"
                      }`}
                    >
                      <div>{shi}时</div>
                      <div className="mt-1 text-[10px] opacity-70">
                        {range}
                      </div>
                    </button>
                  ))}
                </div>
              )}
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
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                  <p className="text-sm text-[#9a8060]">
                    {name || "个人命盘"}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    四柱八字
                  </h2>
                </div>

                <div className="text-sm text-[#756b5d] md:text-right">
                  <div>{gender}命</div>
                  <div>
                    {year}年{month}月{day}日{" "}
                    {timeMode === "shi"
                      ? `${shiChen}时`
                      : `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`}
                  </div>
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

            <section className="grid gap-4 md:grid-cols-4">
              {[
                ["生肖", getZodiac(result.yearPillar)],
                ["日主", result.dayMaster],
                ["日主五行", result.dayMasterElement],
                ["日主状态", result.strength],
              ].map(([title, value]) => (
                <div
                  key={title}
                  className="rounded-3xl border border-[#e7e0d4] bg-white p-6 shadow-sm"
                >
                  <p className="text-sm text-[#92897d]">{title}</p>
                  <p className="mt-3 text-2xl font-semibold">{value}</p>
                </div>
              ))}
            </section>

            <section className="rounded-3xl border border-[#e7e0d4] bg-white p-6 shadow-sm md:p-8">
              <div className="flex flex-col justify-between gap-2 md:flex-row md:items-end">
                <div>
                  <h2 className="text-2xl font-semibold">
                    五行结构
                  </h2>
                  <p className="mt-2 text-sm text-[#756b5d]">
                    当前基础算法按四柱天干与地支主气统计。
                  </p>
                </div>

                {elementAnalysis && (
                  <div className="text-sm text-[#756b5d]">
                    强项：{elementAnalysis.strongest.join("、")}
                    {"　"}
                    弱项：{elementAnalysis.weakest.join("、")}
                  </div>
                )}
              </div>

              <div className="mt-7 space-y-4">
                {elementOrder.map((element) => {
                  const value = result.fiveElements[element];
                  const width = `${Math.max(value * 12, value === 0 ? 2 : 10)}%`;

                  return (
                    <div key={element}>
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="font-medium">{element}</span>
                        <span className="text-[#756b5d]">
                          {value}　{elementMeaning[element]}
                        </span>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-[#eee8de]">
                        <div
                          className="h-full rounded-full bg-[#8b6f47]"
                          style={{ width }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {elementAnalysis?.missing.length ? (
                <div className="mt-6 rounded-2xl bg-[#f7f3ec] p-5 text-sm leading-7 text-[#756b5d]">
                  当前统计中未出现：{" "}
                  <strong className="text-[#29251f]">
                    {elementAnalysis.missing.join("、")}
                  </strong>
                  。这只代表基础统计中没有该五行的显性计数，
                  不能单独据此判断吉凶。
                </div>
              ) : null}
            </section>

            <section className="rounded-3xl border border-[#e7e0d4] bg-white p-6 shadow-sm md:p-8">
              <h2 className="text-2xl font-semibold">
                十神透干
              </h2>

              <p className="mt-2 text-sm leading-7 text-[#756b5d]">
                以日干为中心，将其他天干按五行生克与阴阳关系转换为十神。
              </p>

              <div className="mt-6 grid gap-3 md:grid-cols-4">
                {tenGods.map(([label, stem, god]) => (
                  <div
                    key={label}
                    className="rounded-2xl bg-[#f7f3ec] p-5 text-center"
                  >
                    <div className="text-xs text-[#92897d]">{label}</div>
                    <div className="mt-2 text-2xl font-semibold">{stem}</div>
                    <div className="mt-2 text-sm text-[#756b5d]">{god}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-[#e7e0d4] bg-white p-6 shadow-sm md:p-8">
              <h2 className="text-2xl font-semibold">
                四柱关系
              </h2>

              <div className="mt-5 flex flex-wrap gap-3">
                {getBranchRelations(result).length ? (
                  getBranchRelations(result).map((relation) => (
                    <span
                      key={relation}
                      className="rounded-full bg-[#f7f3ec] px-4 py-2 text-sm"
                    >
                      {relation}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-[#92897d]">
                    当前四支未检测到基础六合或六冲组合。
                  </span>
                )}
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

              <div className="mt-6 space-y-4">
                <article className="rounded-2xl bg-[#f7f3ec] p-5">
                  <h3 className="font-semibold">性格与日主</h3>
                  <p className="mt-2 text-sm leading-7 text-[#756b5d]">
                    {getPersonalityText(result)}
                  </p>
                </article>

                <article className="rounded-2xl bg-[#f7f3ec] p-5">
                  <h3 className="font-semibold">事业方向</h3>
                  <p className="mt-2 text-sm leading-7 text-[#756b5d]">
                    {getCareerText(result)}
                  </p>
                </article>

                <article className="rounded-2xl bg-[#f7f3ec] p-5">
                  <h3 className="font-semibold">财富结构</h3>
                  <p className="mt-2 text-sm leading-7 text-[#756b5d]">
                    {getWealthText(result)}
                  </p>
                </article>

                <article className="rounded-2xl bg-[#f7f3ec] p-5">
                  <h3 className="font-semibold">婚恋关系</h3>
                  <p className="mt-2 text-sm leading-7 text-[#756b5d]">
                    {getLoveText(result)}
                  </p>
                </article>
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
