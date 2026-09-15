"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { calculateBazi } from "@/lib/bazi";

type Gender = "男" | "女";

const stems = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const branches = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];

const elementDescriptions: Record<string, string> = {
  木: "生发、规划、学习、成长",
  火: "表达、行动、影响力、热情",
  土: "稳定、执行、承载、现实感",
  金: "规则、判断、结构、效率",
  水: "变化、信息、流动、适应",
};

const zodiacMap: Record<string, string> = {
  子:"鼠", 丑:"牛", 寅:"虎", 卯:"兔", 辰:"龙", 巳:"蛇",
  午:"马", 未:"羊", 申:"猴", 酉:"鸡", 戌:"狗", 亥:"猪"
};

function tenGod(dayMaster: string, target: string) {
  const element: Record<string,string> = {
    甲:"木",乙:"木",丙:"火",丁:"火",戊:"土",己:"土",
    庚:"金",辛:"金",壬:"水",癸:"水"
  };

  const yinYang: Record<string,string> = {
    甲:"阳",乙:"阴",丙:"阳",丁:"阴",戊:"阳",己:"阴",
    庚:"阳",辛:"阴",壬:"阳",癸:"阴"
  };

  const generates: Record<string,string> = {
    木:"火",
    火:"土",
    土:"金",
    金:"水",
    水:"木"
  };

  const controls: Record<string,string> = {
    木:"土",
    火:"金",
    土:"水",
    金:"木",
    水:"火"
  };

  if (dayMaster === target) {
    return "比肩";
  }

  const dm = element[dayMaster];
  const tg = element[target];
  const samePolarity = yinYang[dayMaster] === yinYang[target];

  if (dm === tg) {
    return samePolarity ? "比肩" : "劫财";
  }

  if (generates[dm] === tg) {
    return samePolarity ? "食神" : "伤官";
  }

  if (controls[dm] === tg) {
    return samePolarity ? "偏财" : "正财";
  }

  if (controls[tg] === dm) {
    return samePolarity ? "七杀" : "正官";
  }

  if (generates[tg] === dm) {
    return samePolarity ? "偏印" : "正印";
  }

  return "十神";
}
function relationBetween(a: string, b: string) {
  const pair = a + b;
  const reverse = b + a;
  const liuhe = new Set(["子丑","寅亥","卯戌","辰酉","巳申","午未"]);
  const chong = new Set(["子午","丑未","寅申","卯酉","辰戌","巳亥"]);

  if (liuhe.has(pair) || liuhe.has(reverse)) return "六合";
  if (chong.has(pair) || chong.has(reverse)) return "相冲";
  return "";
}

export default function PanPage() {
  const now = new Date();
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender>("男");
  const [year, setYear] = useState(2006);
  const [month, setMonth] = useState(6);
  const [day, setDay] = useState(7);
  const [hour, setHour] = useState(8);
  const [minute, setMinute] = useState(0);
  const [result, setResult] = useState<any>(null);

  const daysInMonth = useMemo(
    () => new Date(year, month, 0).getDate(),
    [year, month]
  );

  const safeDay = Math.min(day, daysInMonth);

  function calculate() {
    const date = new Date(year, month - 1, safeDay, hour, minute);
    const data = calculateBazi(
      date,
      `${String(hour).padStart(2,"0")}:${String(minute).padStart(2,"0")}`,
      gender
    );

    const payload = {
      name: name || "命主",
      gender,
      birth: {
        year,
        month,
        day: safeDay,
        hour,
        minute,
      },
      result: data,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("orientai_bazi_result", JSON.stringify(payload));
    setResult(payload);

    setTimeout(() => {
      document.getElementById("bazi-result")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  }

  const zodiac = result
    ? zodiacMap[result.result.yearPillar.slice(1,2)] || "—"
    : "";

  const elementEntries = result
    ? (Object.entries(result.result.fiveElements) as [string, number][])
    : [];

  const maxElement = elementEntries.length
    ? Math.max(...elementEntries.map(([, value]) => value))
    : 0;

  const strongest = elementEntries
    .filter(([, value]) => value === maxElement)
    .map(([key]) => key)
    .join("、");

  const weakest = elementEntries
    .filter(([, value]) => value === Math.min(...elementEntries.map(([,v]) => v)))
    .map(([key]) => key)
    .join("、");

  const branches = result
    ? [
        result.result.yearPillar.slice(1,2),
        result.result.monthPillar.slice(1,2),
        result.result.dayPillar.slice(1,2),
        result.result.hourPillar.slice(1,2),
      ]
    : [];

  const relationships = result
    ? Array.from(new Set(
        branches.flatMap((a: string, i: number) =>
          branches.slice(i + 1).map((b: string) => {
            const relation = relationBetween(a,b);
            return relation ? `${a}${b} ${relation}` : "";
          })
        ).filter(Boolean)
      ))
    : [];

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-[#29251f]">
      <div className="mx-auto max-w-5xl px-5 py-10 md:px-8">

        <header className="mb-10">
          <div className="mb-3 text-sm tracking-[0.2em] text-[#8b6f47]">
            东方命格 AI
          </div>
          <h1 className="text-4xl font-semibold tracking-tight">
            个人命盘
          </h1>
          <p className="mt-3 text-[#716b61]">
            输入出生资料，生成你的四柱、五行与基础命格分析。
          </p>
        </header>

        <section className="rounded-3xl border border-[#e1d9cd] bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-xl font-semibold">出生资料</h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="text-sm text-[#716b61]">姓名</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="请输入姓名"
                className="mt-2 h-12 w-full rounded-xl border border-[#ddd5c8] px-4 outline-none focus:border-[#8b6f47]"
              />
            </label>

            <div>
              <span className="text-sm text-[#716b61]">性别</span>
              <div className="mt-2 grid grid-cols-2 gap-3">
                {(["男","女"] as Gender[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setGender(item)}
                    className={`h-12 rounded-xl border ${
                      gender === item
                        ? "border-[#29251f] bg-[#29251f] text-white"
                        : "border-[#ddd5c8] bg-white text-[#5f594f]"
                    }`}
                  >
                    {item}命
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-7">
            <div className="mb-3 text-sm text-[#716b61]">出生日期</div>
            <div className="grid grid-cols-3 gap-3">
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="h-14 rounded-xl border border-[#ddd5c8] bg-white px-3"
              >
                {Array.from({length: 127}, (_,i) => 1900+i).map((y) => (
                  <option key={y} value={y}>{y} 年</option>
                ))}
              </select>

              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="h-14 rounded-xl border border-[#ddd5c8] bg-white px-3"
              >
                {Array.from({length:12}, (_,i) => i+1).map((m) => (
                  <option key={m} value={m}>{m} 月</option>
                ))}
              </select>

              <select
                value={safeDay}
                onChange={(e) => setDay(Number(e.target.value))}
                className="h-14 rounded-xl border border-[#ddd5c8] bg-white px-3"
              >
                {Array.from({length:daysInMonth}, (_,i) => i+1).map((d) => (
                  <option key={d} value={d}>{d} 日</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-7">
            <div className="mb-3 text-sm text-[#716b61]">出生时间</div>

            <div className="grid grid-cols-2 gap-3">
              <select
                value={hour}
                onChange={(e) => setHour(Number(e.target.value))}
                className="h-14 rounded-xl border border-[#ddd5c8] bg-white px-3"
              >
                {Array.from({length:24}, (_,i) => i).map((h) => (
                  <option key={h} value={h}>
                    {String(h).padStart(2,"0")} 时
                  </option>
                ))}
              </select>

              <select
                value={minute}
                onChange={(e) => setMinute(Number(e.target.value))}
                className="h-14 rounded-xl border border-[#ddd5c8] bg-white px-3"
              >
                {Array.from({length:60}, (_,i) => i).map((m) => (
                  <option key={m} value={m}>
                    {String(m).padStart(2,"0")} 分
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {[
                ["子时",0],["丑时",2],["寅时",4],["卯时",6],
                ["辰时",8],["巳时",10],["午时",12],["未时",14],
                ["申时",16],["酉时",18],["戌时",20],["亥时",22],
              ].map(([label,h]) => (
                <button
                  key={String(label)}
                  type="button"
                  onClick={() => setHour(Number(h))}
                  className={`rounded-full border px-3 py-1.5 text-xs ${
                    Math.floor(hour / 2) === Math.floor(Number(h) / 2)
                      ? "border-[#8b6f47] bg-[#f2eadf] text-[#6d5233]"
                      : "border-[#e1d9cd] text-[#716b61]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={calculate}
            className="mt-8 h-14 w-full rounded-2xl bg-[#29251f] text-base font-medium text-white transition hover:bg-[#403a32]"
          >
            生成我的个人命盘
          </button>
        </section>

        {result && (
          <section id="bazi-result" className="mt-8 space-y-6">

            <div className="rounded-3xl bg-[#29251f] p-7 text-white">
              <div className="text-sm text-[#d8c8b4]">你的命格核心</div>
              <div className="mt-3 text-3xl font-semibold">
                {result.result.dayMaster}火日主
              </div>
              <div className="mt-2 text-[#d8d2c8]">
                {result.gender}命 · 生肖{zodiac} · {result.result.strength}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  ["年柱", result.result.yearPillar],
                  ["月柱", result.result.monthPillar],
                  ["日柱", result.result.dayPillar],
                  ["时柱", result.result.hourPillar],
                ].map(([label,value]) => (
                  <div key={label} className="rounded-2xl bg-white/10 p-4">
                    <div className="text-xs text-[#c8c0b5]">{label}</div>
                    <div className="mt-1 text-2xl font-semibold">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-[#e1d9cd] bg-white p-6">
              <h2 className="text-xl font-semibold">五行结构</h2>

              <div className="mt-5 space-y-4">
                {elementEntries.map(([element,count]) => (
                  <div key={element}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{element}</span>
                      <span className="text-[#716b61]">{count}</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#eee8df]">
                      <div
                        className="h-full rounded-full bg-[#8b6f47]"
                        style={{ width: `${Math.min(100, count * 25)}%` }}
                      />
                    </div>
                    <div className="mt-1 text-xs text-[#8a8379]">
                      {elementDescriptions[element]}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl bg-[#f7f4ee] p-4 text-sm leading-7 text-[#5f594f]">
                <div>强项：<strong>{strongest}</strong></div>
                <div>弱项：<strong>{weakest}</strong></div>
                <div className="mt-1 text-xs text-[#8a8379]">
                  当前为基础显性统计，不单独以数量判断吉凶。
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[#e1d9cd] bg-white p-6">
              <h2 className="text-xl font-semibold">十神透干</h2>

              <div className="mt-5 grid gap-3 md:grid-cols-4">
                {[
                  ["年干", result.result.yearPillar.slice(0,1)],
                  ["月干", result.result.monthPillar.slice(0,1)],
                  ["日干", result.result.dayPillar.slice(0,1)],
                  ["时干", result.result.hourPillar.slice(0,1)],
                ].map(([label,stem]) => (
                  <div key={label} className="rounded-2xl border border-[#eee8df] p-4">
                    <div className="text-xs text-[#8a8379]">{label}</div>
                    <div className="mt-2 text-2xl font-semibold">{stem}</div>
                    <div className="mt-1 text-sm text-[#6d5233]">
                      {stem === result.result.dayMaster
                        ? "日主"
                        : tenGod(result.result.dayMaster, stem)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-[#e1d9cd] bg-white p-6">
              <h2 className="text-xl font-semibold">四柱关系</h2>

              {relationships.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-3">
                  {relationships.map((item: string) => (
                    <div
                      key={item}
                      className="rounded-full bg-[#f2eadf] px-4 py-2 text-sm text-[#6d5233]"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-[#716b61]">
                  当前显性地支之间未检测到六合或六冲。
                </p>
              )}
            </div>

            <div className="rounded-3xl border border-[#e1d9cd] bg-white p-6">
              <div className="text-sm text-[#8b6f47]">命格基础解读</div>
              <h2 className="mt-2 text-2xl font-semibold">
                先看结构，再看人生主题
              </h2>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-[#f7f4ee] p-5">
                  <h3 className="font-semibold">性格与天赋</h3>
                  <p className="mt-2 text-sm leading-7 text-[#655f56]">
                    {result.result.dayMaster}火日主在传统命理中常被用于象征表达、
                    感受、行动与影响力。结合当前五行结构，可以进一步观察学习、
                    执行、表达与压力之间的平衡。
                  </p>
                </div>

                <div className="rounded-2xl bg-[#f7f4ee] p-5">
                  <h3 className="font-semibold">事业方向</h3>
                  <p className="mt-2 text-sm leading-7 text-[#655f56]">
                    当前命盘显示为{result.result.strength}。
                    事业分析不能只看一个五行数量，更应该结合十神、
                    月令、四柱位置以及后续大运。
                  </p>
                </div>

                <div className="rounded-2xl bg-[#f7f4ee] p-5">
                  <h3 className="font-semibold">财富结构</h3>
                  <p className="mt-2 text-sm leading-7 text-[#655f56]">
                    财富主题主要观察财星、日主承载能力以及食伤、官杀、
                    印星之间的关系。当前页面先展示基础结构，不把五行数量
                    直接等同于财富多少。
                  </p>
                </div>

                <div className="rounded-2xl bg-[#f7f4ee] p-5">
                  <h3 className="font-semibold">婚恋关系</h3>
                  <p className="mt-2 text-sm leading-7 text-[#655f56]">
                    个人命盘主要观察日主、日支与十神结构。
                    如果要判断双方互动，应进入婚恋合盘进行比较。
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[#d8c8b4] bg-[#fbf7f0] p-7">
              <div className="text-sm text-[#8b6f47]">下一步</div>
              <h2 className="mt-2 text-2xl font-semibold">
                你的基础命盘已经完成
              </h2>
              <p className="mt-2 text-sm leading-7 text-[#716b61]">
                继续生成完整命格报告，或者分析你与另一半的关系结构。
              </p>

              <div className="mt-6 grid gap-3 md:grid-cols-2">
                <Link
                  href="/report"
                  className="rounded-2xl bg-[#29251f] p-5 text-white"
                >
                  <div className="text-lg font-semibold">
                    ✨ 查看完整命格报告 →
                  </div>
                  <div className="mt-1 text-sm text-[#d8d2c8]">
                    性格 · 事业 · 财富 · 婚恋 · 人生阶段
                  </div>
                </Link>

                <Link
                  href="/compatibility"
                  className="rounded-2xl border border-[#d8c8b4] bg-white p-5"
                >
                  <div className="text-lg font-semibold">
                    ❤️ 婚恋合盘 →
                  </div>
                  <div className="mt-1 text-sm text-[#716b61]">
                    比较双方命盘与关系结构
                  </div>
                </Link>
              </div>
            </div>

            <div className="pb-8 text-center text-xs leading-6 text-[#918a80]">
              本页面内容用于传统文化参考与产品体验，不构成对现实人生事件的确定性预测。
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
