"use client";

import { useMemo } from "react";
import { calculateBazi, type BaziResult } from "../../lib/bazi";

const elementOrder = ["木", "火", "土", "金", "水"] as const;

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
  return animals[index] || "—";
}

function getRelations(result: BaziResult) {
  const branches = [
    result.yearPillar[1],
    result.monthPillar[1],
    result.dayPillar[1],
    result.hourPillar[1],
  ];

  const combine = new Set([
    "子丑",
    "丑子",
    "寅亥",
    "亥寅",
    "卯戌",
    "戌卯",
    "辰酉",
    "酉辰",
    "巳申",
    "申巳",
    "午未",
    "未午",
  ]);

  const clash = new Set([
    "子午",
    "午子",
    "丑未",
    "未丑",
    "寅申",
    "申寅",
    "卯酉",
    "酉卯",
    "辰戌",
    "戌辰",
    "巳亥",
    "亥巳",
  ]);

  const result: string[] = [];

  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      const pair = branches[i] + branches[j];

      if (combine.has(pair)) {
        result.push(`${branches[i]}${branches[j]} 六合`);
      }

      if (clash.has(pair)) {
        result.push(`${branches[i]}${branches[j]} 相冲`);
      }
    }
  }

  return Array.from(new Set(result));
}

function getPersonality(result: BaziResult) {
  const texts: Record<string, string> = {
    木: "戊土日主的传统五行象义偏向稳定、承载与执行。观察这类命盘时，重点不在简单贴标签，而在看稳定能力如何与木、火、金、水形成流通。当前基础算法判定为身弱，因此报告更强调环境、资源与节奏对发挥状态的影响。",
    火: "火象偏向表达、行动和外放。命盘分析会进一步观察火与日主之间的生扶、泄耗关系，以及它在不同柱位所承担的十神意义。",
    土: "土象偏向稳定、承载与现实执行。日主属土时，传统命理阅读通常会进一步观察土的根气、月令以及财官印食伤之间的平衡。",
    金: "金象偏向规则、判断、结构与效率。日主属金时，重点会落在金与木火土水之间的生克关系，以及十神落点。",
    水: "水象偏向流动、信息、变化与适应。日主属水时，传统阅读通常会进一步观察水的来源、去向与岁运变化。",
  };

  return texts[result.dayMasterElement];
}

export default function ReportPage() {
  const result = useMemo(
    () => calculateBazi(new Date(1995, 7, 15), "14:30", "男"),
    []
  );

  const stems = [
    ["年干", result.yearPillar[0], getTenGod(result.dayMaster, result.yearPillar[0])],
    ["月干", result.monthPillar[0], getTenGod(result.dayMaster, result.monthPillar[0])],
    ["日干", result.dayPillar[0], "日主"],
    ["时干", result.hourPillar[0], getTenGod(result.dayMaster, result.hourPillar[0])],
  ];

  const relations = getRelations(result);

  return (
    <main className="min-h-screen bg-[#f7f3ec] text-[#29251f]">
      <div className="mx-auto max-w-6xl px-5 py-10 md:px-8">

        <a href="/" className="text-sm text-[#8b6f47] hover:underline">
          ← 返回首页
        </a>

        <header className="mt-8">
          <p className="text-sm tracking-[0.25em] text-[#9a8060]">
            东方命格 AI
          </p>

          <h1 className="mt-3 text-3xl font-semibold md:text-4xl">
            八字命格报告
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#756b5d]">
            下面是真实调用当前排盘算法生成的完整示例，
            不再使用空白占位文字。
          </p>
        </header>

        <div className="mt-8 space-y-6">

          <section className="rounded-3xl border border-[#e7e0d4] bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-sm text-[#9a8060]">
                  示例人物
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  1995年8月15日 · 男命
                </h2>
                <p className="mt-2 text-sm text-[#756b5d]">
                  出生时间：14:30　｜　生肖：{getZodiac(result.yearPillar)}
                </p>
              </div>

              <span className="rounded-full bg-[#f7f3ec] px-4 py-2 text-xs text-[#756b5d]">
                完整示例报告
              </span>
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
              ["日主", result.dayMaster],
              ["五行", result.dayMasterElement],
              ["状态", result.strength],
              ["生肖", getZodiac(result.yearPillar)],
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
            <h2 className="text-2xl font-semibold">
              一、五行结构
            </h2>

            <p className="mt-2 text-sm leading-7 text-[#756b5d]">
              当前算法按四柱天干与地支主气统计：
            </p>

            <div className="mt-6 grid grid-cols-5 gap-2 md:gap-4">
              {elementOrder.map((element) => (
                <div
                  key={element}
                  className="rounded-2xl bg-[#f7f3ec] p-4 text-center"
                >
                  <div className="text-lg font-semibold">{element}</div>
                  <div className="mt-2 text-3xl font-semibold">
                    {result.fiveElements[element]}
                  </div>
                  <div className="mt-1 text-xs text-[#92897d]">
                    出现次数
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl bg-[#f7f3ec] p-5 text-sm leading-7 text-[#756b5d]">
              本示例中土的基础计数最高，火在当前八个显性计数中为 0。
              这只是命盘结构的第一层观察，不能把“五行数量”直接等同于吉凶或现实结果。
            </div>
          </section>

          <section className="rounded-3xl border border-[#e7e0d4] bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-2xl font-semibold">
              二、十神透干
            </h2>

            <p className="mt-2 text-sm leading-7 text-[#756b5d]">
              十神以日主为中心，通过五行生克和阴阳关系确定。
              本示例日主为「{result.dayMaster}」。
            </p>

            <div className="mt-6 grid gap-3 md:grid-cols-4">
              {stems.map(([label, stem, god]) => (
                <div
                  key={label}
                  className="rounded-2xl bg-[#f7f3ec] p-5 text-center"
                >
                  <div className="text-xs text-[#92897d]">{label}</div>
                  <div className="mt-2 text-2xl font-semibold">
                    {stem}
                  </div>
                  <div className="mt-2 text-sm text-[#756b5d]">
                    {god}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-[#e7e0d4] bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-2xl font-semibold">
              三、日主与性格倾向
            </h2>

            <p className="mt-4 text-sm leading-8 text-[#756b5d]">
              {getPersonality(result)}
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl bg-[#f7f3ec] p-5">
                <h3 className="font-semibold">核心关键词</h3>
                <p className="mt-2 text-sm leading-7 text-[#756b5d]">
                  稳定、承载、执行、现实感
                </p>
              </div>

              <div className="rounded-2xl bg-[#f7f3ec] p-5">
                <h3 className="font-semibold">当前状态</h3>
                <p className="mt-2 text-sm leading-7 text-[#756b5d]">
                  基础算法判定：{result.strength}
                </p>
              </div>

              <div className="rounded-2xl bg-[#f7f3ec] p-5">
                <h3 className="font-semibold">阅读重点</h3>
                <p className="mt-2 text-sm leading-7 text-[#756b5d]">
                  日主、月令、五行流通与十神配置
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-2">
            <article className="rounded-3xl border border-[#e7e0d4] bg-white p-6 shadow-sm md:p-8">
              <h2 className="text-2xl font-semibold">
                四、事业发展
              </h2>

              <p className="mt-4 text-sm leading-8 text-[#756b5d]">
                本命盘显示日主为「{result.dayMaster}」，
                基础状态为「{result.strength}」。
                从传统命理的阅读方式来看，事业不能只根据生肖判断，
                而应继续观察官杀、财星、印星、食伤之间的关系。
              </p>

              <p className="mt-4 text-sm leading-8 text-[#756b5d]">
                这个示例中，十神透干已经可以看到事业、资源、
                责任与输出等不同主题的入口。正式产品可以在这一层继续加入大运和流年。
              </p>
            </article>

            <article className="rounded-3xl border border-[#e7e0d4] bg-white p-6 shadow-sm md:p-8">
              <h2 className="text-2xl font-semibold">
                五、财富结构
              </h2>

              <p className="mt-4 text-sm leading-8 text-[#756b5d]">
                财富主题在传统八字体系中主要观察财星，同时需要判断日主能否承载财星。
                因此不能简单用“财星出现一次”等于财富好坏。
              </p>

              <p className="mt-4 text-sm leading-8 text-[#756b5d]">
                当前报告已经把财星对应的十神列出来，
                后续结合大运后，才能形成更完整的阶段性财富分析。
              </p>
            </article>
          </section>

          <section className="rounded-3xl border border-[#e7e0d4] bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-2xl font-semibold">
              六、婚恋关系
            </h2>

            <p className="mt-4 text-sm leading-8 text-[#756b5d]">
              个人命盘阶段主要观察日主、日支以及相关十神。
              真正进入双方关系判断后，还需要把另一人的四柱放进来，
              比较双方日主关系、五行互补以及合冲关系。
            </p>

            <a
              href="/compatibility"
              className="mt-6 inline-flex rounded-xl bg-[#29251f] px-6 py-3 text-sm font-medium text-white"
            >
              进入婚恋合盘 →
            </a>
          </section>

          <section className="rounded-3xl border border-[#e7e0d4] bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-2xl font-semibold">
              七、四柱关系
            </h2>

            {relations.length ? (
              <div className="mt-5 flex flex-wrap gap-3">
                {relations.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-[#f7f3ec] px-5 py-2 text-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-[#756b5d]">
                当前示例未检测到基础六合或六冲组合。
              </p>
            )}
          </section>

          <section className="rounded-3xl border border-[#e7e0d4] bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-2xl font-semibold">
              八、人生阶段
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-[#f7f3ec] p-5">
                <h3 className="font-semibold">基础阶段</h3>
                <p className="mt-2 text-sm leading-7 text-[#756b5d]">
                  先理解日主、五行与十神，是后续大运分析的基础。
                </p>
              </div>

              <div className="rounded-2xl bg-[#f7f3ec] p-5">
                <h3 className="font-semibold">成长阶段</h3>
                <p className="mt-2 text-sm leading-7 text-[#756b5d]">
                  结合大运后，可以进一步观察事业、财富和关系主题的阶段变化。
                </p>
              </div>

              <div className="rounded-2xl bg-[#f7f3ec] p-5">
                <h3 className="font-semibold">当前产品下一层</h3>
                <p className="mt-2 text-sm leading-7 text-[#756b5d]">
                  大运、流年、起运岁数和更完整的藏干体系将作为高级报告模块。
                </p>
              </div>
            </div>
          </section>

          <a
            href="/pan"
            className="block rounded-2xl bg-[#29251f] p-5 text-center font-medium text-white"
          >
            输入我的出生资料，开始正式排盘 →
          </a>
        </div>

        <p className="mt-8 text-center text-xs leading-6 text-[#aaa095]">
          本页面为传统命理文化示例，仅供文化研究与娱乐参考。
        </p>
      </div>
    </main>
  );
}
