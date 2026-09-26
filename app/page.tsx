import Link from "next/link";

const tools = [
  {
    href: "/pan",
    title: "八字排盘",
    description: "计算四柱、十神、藏干、五行结构、大运与近年流年。",
    icon: "☯",
  },
  {
    href: "/calendar",
    title: "农历转公历",
    description: "支持常用农历日期与闰月日期换算。",
    icon: "月",
  },
  {
    href: "/report",
    title: "个人报告",
    description: "查看已保存的个人命盘解读和运势周期。",
    icon: "命",
  },
  {
    href: "/compatibility",
    title: "合婚参考",
    description: "对照双方命盘五行与地支互动，提供沟通参考。",
    icon: "合",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen px-5 py-16 text-white">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm tracking-[0.3em] text-amber-400">
          ORIENTAI · 东方命理工具
        </p>
        <h1 className="mt-5 text-4xl font-bold sm:text-6xl">
          以传统历法为尺，
          <br />
          认识自己的节奏。
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
          基于出生时间计算四柱与运程，支持个人档案、本地报告和农历换算。
          所有命理分析仅供传统文化研究与自我观察参考。
        </p>
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group rounded-3xl border border-white/10 bg-white/[0.04] p-7 transition hover:border-amber-400/40 hover:bg-white/[0.07]"
            >
              <div className="flex items-center gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-500/15 text-xl font-bold text-amber-300">
                  {tool.icon}
                </span>
                <h2 className="text-xl font-bold group-hover:text-amber-300">
                  {tool.title}
                </h2>
              </div>
              <p className="mt-4 leading-7 text-slate-400">
                {tool.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
