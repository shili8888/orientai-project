"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const elementDescriptions: Record<string,string> = {
  木:"生发、规划、学习、成长",
  火:"表达、行动、影响力、热情",
  土:"稳定、执行、承载、现实感",
  金:"规则、判断、结构、效率",
  水:"变化、信息、流动、适应",
};

function getTenGod(dayMaster:string, target:string) {
  const element: Record<string,string> = {
    甲:"木",乙:"木",丙:"火",丁:"火",戊:"土",己:"土",
    庚:"金",辛:"金",壬:"水",癸:"水"
  };

  const polarity: Record<string,string> = {
    甲:"阳",乙:"阴",丙:"阳",丁:"阴",戊:"阳",己:"阴",
    庚:"阳",辛:"阴",壬:"阳",癸:"阴"
  };

  if (dayMaster === target) {
    return polarity[dayMaster] === polarity[target] ? "比肩" : "劫财";
  }

  const dm = element[dayMaster];
  const tg = element[target];
  const same = polarity[dayMaster] === polarity[target];

  const generates: Record<string,string> = {
    木:"火",火:"土",土:"金",金:"水",水:"木"
  };

  const controls: Record<string,string> = {
    木:"土",火:"金",土:"水",金:"木",水:"火"
  };

  if (generates[dm] === tg) return same ? "食神" : "伤官";
  if (controls[dm] === tg) return same ? "偏财" : "正财";
  if (controls[tg] === dm) return same ? "七杀" : "正官";
  if (generates[tg] === dm) return same ? "偏印" : "正印";

  return "十神";
}

function relation(a:string,b:string) {
  const liuhe = new Set(["子丑","寅亥","卯戌","辰酉","巳申","午未"]);
  const chong = new Set(["子午","丑未","寅申","卯酉","辰戌","巳亥"]);
  if (liuhe.has(a+b) || liuhe.has(b+a)) return "六合";
  if (chong.has(a+b) || chong.has(b+a)) return "相冲";
  return "";
}

export default function ReportPage() {
  const [data,setData] = useState<any>(null);

  useEffect(() => {
    const raw = localStorage.getItem("orientai_bazi_result");
    if (raw) setData(JSON.parse(raw));
  }, []);

  if (!data) {
    return (
      <main className="min-h-screen bg-[#f7f4ee] text-[#29251f]">
        <div className="mx-auto max-w-4xl px-5 py-20 text-center">
          <div className="text-sm tracking-[0.2em] text-[#8b6f47]">
            东方命格 AI
          </div>
          <h1 className="mt-4 text-4xl font-semibold">个人命格报告</h1>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-[#716b61]">
            你还没有生成个人命盘。先完成出生资料，系统才能根据你的真实命盘生成报告。
          </p>
          <Link
            href="/pan"
            className="mt-8 inline-flex rounded-2xl bg-[#29251f] px-7 py-4 text-white"
          >
            先去生成个人命盘 →
          </Link>
        </div>
      </main>
    );
  }

  const r = data.result;
  const stems = [
    ["年干",r.yearPillar.slice(0,1)],
    ["月干",r.monthPillar.slice(0,1)],
    ["日干",r.dayPillar.slice(0,1)],
    ["时干",r.hourPillar.slice(0,1)],
  ];

  const branches = [
    r.yearPillar.slice(1,2),
    r.monthPillar.slice(1,2),
    r.dayPillar.slice(1,2),
    r.hourPillar.slice(1,2),
  ];

  const relations = Array.from(new Set(
    branches.flatMap((a:string,i:number) =>
      branches.slice(i+1).map((b:string) => {
        const x = relation(a,b);
        return x ? `${a}${b} ${x}` : "";
      }).filter(Boolean)
    )
  ));

  const elements = Object.entries(r.fiveElements) as [string,number][];
  const max = Math.max(...elements.map(([,v]) => v));
  const strongest = elements.filter(([,v]) => v === max).map(([k]) => k).join("、");
  const zero = elements.filter(([,v]) => v === 0).map(([k]) => k);

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-[#29251f]">
      <div className="mx-auto max-w-5xl px-5 py-10 md:px-8">

        <header className="mb-8">
          <Link href="/pan" className="text-sm text-[#8b6f47]">
            ← 返回我的命盘
          </Link>

          <div className="mt-6 text-sm tracking-[0.2em] text-[#8b6f47]">
            东方命格 AI · 个人命格报告
          </div>

          <h1 className="mt-3 text-4xl font-semibold">
            {data.name}的命格报告
          </h1>

          <p className="mt-3 text-[#716b61]">
            {data.gender}命 · {data.birth.year}年{data.birth.month}月{data.birth.day}日 ·
            {String(data.birth.hour).padStart(2,"0")}:
            {String(data.birth.minute).padStart(2,"0")}
          </p>
        </header>

        <section className="rounded-3xl bg-[#29251f] p-7 text-white md:p-9">
          <div className="text-sm text-[#d8c8b4]">命格核心</div>

          <h2 className="mt-3 text-4xl font-semibold">
            {r.dayMaster} · {r.dayMasterElement} · {r.strength}
          </h2>

          <p className="mt-4 max-w-2xl leading-8 text-[#d8d2c8]">
            你的日主为{r.dayMaster}，五行属{r.dayMasterElement}。
            当前基础算法根据四柱天干与地支主气统计，判断日主处于{r.strength}状态。
            下面进一步把这些结构转换成容易理解的命格主题。
          </p>

          <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              ["年柱",r.yearPillar],
              ["月柱",r.monthPillar],
              ["日柱",r.dayPillar],
              ["时柱",r.hourPillar],
            ].map(([label,value]) => (
              <div key={label} className="rounded-2xl bg-white/10 p-4">
                <div className="text-xs text-[#c8c0b5]">{label}</div>
                <div className="mt-1 text-2xl font-semibold">{value}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-[#e1d9cd] bg-white p-7">
          <div className="text-sm text-[#8b6f47]">01 · 五行结构</div>
          <h2 className="mt-2 text-2xl font-semibold">你的命盘由什么构成？</h2>

          <div className="mt-6 space-y-4">
            {elements.map(([element,count]) => (
              <div key={element}>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{element}</span>
                  <span className="text-[#716b61]">{count}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-[#eee8df]">
                  <div
                    className="h-2 rounded-full bg-[#8b6f47]"
                    style={{width:`${Math.min(100,count*25)}%`}}
                  />
                </div>
                <div className="mt-1 text-xs text-[#8a8379]">
                  {elementDescriptions[element]}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-[#f7f4ee] p-5 text-sm leading-7">
            <strong>结构观察：</strong>
            当前显性统计中，{strongest}较明显。
            {zero.length > 0 && ` ${zero.join("、")}在当前显性统计中未出现。`}
            这不单独等于吉凶，而是用于观察命盘结构。
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-[#e1d9cd] bg-white p-7">
          <div className="text-sm text-[#8b6f47]">02 · 十神结构</div>
          <h2 className="mt-2 text-2xl font-semibold">天干透露出的关系主题</h2>

          <div className="mt-6 grid gap-3 md:grid-cols-4">
            {stems.map(([label,stem]) => (
              <div key={label} className="rounded-2xl bg-[#f7f4ee] p-5">
                <div className="text-xs text-[#8a8379]">{label}</div>
                <div className="mt-2 text-3xl font-semibold">{stem}</div>
                <div className="mt-1 text-sm text-[#6d5233]">
                  {stem === r.dayMaster
                    ? "日主"
                    : getTenGod(r.dayMaster,stem)}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-5">
            {[
              ["比劫","自我、行动、竞争"],
              ["食伤","表达、创造、输出"],
              ["财星","资源、经营、财富"],
              ["官杀","规则、责任、压力"],
              ["印星","学习、知识、支持"],
            ].map(([title,text]) => (
              <div key={title} className="rounded-2xl border border-[#eee8df] p-4">
                <div className="font-semibold">{title}</div>
                <div className="mt-1 text-xs leading-5 text-[#8a8379]">{text}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-[#e1d9cd] bg-white p-7">
            <div className="text-sm text-[#8b6f47]">03 · 性格</div>
            <h2 className="mt-2 text-2xl font-semibold">你的性格倾向</h2>
            <p className="mt-4 leading-8 text-[#655f56]">
              {r.dayMaster}日主在传统命理中常用于观察个人的核心表达方式。
              当前命盘同时呈现{r.strength}与{strongest}较明显的结构，
              因此更值得关注的是“个人状态、学习能力、执行能力与环境压力”
              之间如何相互作用。
            </p>
            <div className="mt-5 rounded-2xl bg-[#f7f4ee] p-4 text-sm leading-7">
              <strong>建议关注：</strong>
              保持稳定的学习与行动节奏，比单纯追求短期结果更重要。
            </div>
          </div>

          <div className="rounded-3xl border border-[#e1d9cd] bg-white p-7">
            <div className="text-sm text-[#8b6f47]">04 · 事业</div>
            <h2 className="mt-2 text-2xl font-semibold">事业发展结构</h2>
            <p className="mt-4 leading-8 text-[#655f56]">
              传统命理中的事业分析通常综合官杀、印星、食伤以及日主强弱。
              当前命盘更适合从“能力建立 → 专业积累 → 承担责任”的路径观察，
              而不是只用一个五行判断职业。
            </p>
            <div className="mt-5 rounded-2xl bg-[#f7f4ee] p-4 text-sm leading-7">
              <strong>分析重点：</strong>
              学习能力、专业技能、责任范围与长期积累。
            </div>
          </div>

          <div className="rounded-3xl border border-[#e1d9cd] bg-white p-7">
            <div className="text-sm text-[#8b6f47]">05 · 财富</div>
            <h2 className="mt-2 text-2xl font-semibold">财富结构</h2>
            <p className="mt-4 leading-8 text-[#655f56]">
              财富主题主要观察财星与日主之间的关系，同时结合食伤、官杀、
              印星以及人生阶段。当前页面不会简单把“某个五行数量”
              等同于财富多少。
            </p>
            <div className="mt-5 rounded-2xl bg-[#f7f4ee] p-4 text-sm leading-7">
              <strong>当前结论：</strong>
              基础命盘完成后，还需要大运与流年才能进行阶段性财富分析。
            </div>
          </div>

          <div className="rounded-3xl border border-[#e1d9cd] bg-white p-7">
            <div className="text-sm text-[#8b6f47]">06 · 婚恋</div>
            <h2 className="mt-2 text-2xl font-semibold">个人婚恋结构</h2>
            <p className="mt-4 leading-8 text-[#655f56]">
              个人命盘主要观察日支、日主以及十神关系。
              但真正比较双方是否互补，需要把两个人的命盘放在一起观察。
            </p>
            <Link
              href="/compatibility"
              className="mt-5 inline-flex rounded-xl bg-[#29251f] px-5 py-3 text-sm text-white"
            >
              ❤️ 开始婚恋合盘 →
            </Link>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-[#e1d9cd] bg-white p-7">
          <div className="text-sm text-[#8b6f47]">07 · 四柱关系</div>
          <h2 className="mt-2 text-2xl font-semibold">命盘内部关系</h2>

          {relations.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-3">
              {relations.map((item:string) => (
                <span
                  key={item}
                  className="rounded-full bg-[#f2eadf] px-4 py-2 text-sm text-[#6d5233]"
                >
                  {item}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-5 text-sm text-[#716b61]">
              当前显性地支之间未检测到六合或六冲。
            </p>
          )}
        </section>

        <section className="mt-6 rounded-3xl border border-[#d8c8b4] bg-[#fbf7f0] p-7">
          <div className="text-sm text-[#8b6f47]">下一步</div>
          <h2 className="mt-2 text-2xl font-semibold">
            继续深入你的命格
          </h2>
          <p className="mt-3 leading-7 text-[#716b61]">
            当前已经完成基础命盘、五行、十神与结构解读。
            下一阶段可以继续加入大运、流年以及更细的阶段性分析。
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <Link
              href="/compatibility"
              className="rounded-2xl bg-[#29251f] p-5 text-white"
            >
              <div className="text-lg font-semibold">
                ❤️ 婚恋合盘 →
              </div>
              <div className="mt-1 text-sm text-[#d8d2c8]">
                分析双方五行、日主与地支关系
              </div>
            </Link>

            <div className="rounded-2xl border border-[#d8c8b4] bg-white p-5">
              <div className="text-lg font-semibold">
                📅 大运流年
              </div>
              <div className="mt-1 text-sm text-[#716b61]">
                下一阶段开发：起运、大运、流年与人生阶段
              </div>
            </div>
          </div>
        </section>

        <div className="py-8 text-center text-xs leading-6 text-[#918a80]">
          本报告用于传统文化参考与产品体验，不构成对现实人生事件的确定性预测。
        </div>
      </div>
    </main>
  );
}
