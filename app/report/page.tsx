export default function ReportPage() {
  return (
    <main className="min-h-screen bg-[#f7f3ec] text-[#29251f]">
      <div className="mx-auto max-w-5xl px-5 py-10 md:px-8">

        <a
          href="/"
          className="text-sm text-[#8b6f47] hover:underline"
        >
          ← 返回首页
        </a>

        <header className="mt-8">
          <p className="text-sm tracking-[0.25em] text-[#9a8060]">
            东方命格 AI
          </p>

          <h1 className="mt-3 text-3xl font-semibold md:text-4xl">
            八字报告示例
          </h1>

          <p className="mt-3 text-sm leading-7 text-[#756b5d]">
            这里展示完整报告未来的呈现方式。
          </p>
        </header>

        <div className="mt-8 space-y-6">

          <section className="rounded-3xl border border-[#e7e0d4] bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm text-[#9a8060]">示例命盘</p>
                <h2 className="mt-2 text-2xl font-semibold">
                  个人八字命格报告
                </h2>
              </div>

              <span className="rounded-full bg-[#f7f3ec] px-3 py-1 text-xs text-[#756b5d]">
                示例
              </span>
            </div>

            <div className="mt-8 grid grid-cols-4 gap-2 md:gap-4">
              {[
                ["年柱", "甲子"],
                ["月柱", "丙寅"],
                ["日柱", "戊辰"],
                ["时柱", "庚午"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl bg-[#f7f3ec] p-4 text-center"
                >
                  <div className="text-xs text-[#92897d]">{label}</div>
                  <div className="mt-3 text-2xl font-semibold">
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            {[
              ["日主", "戊土"],
              ["日主状态", "身强"],
              ["五行重点", "木 · 火 · 土 · 金 · 水"],
            ].map(([title, value]) => (
              <div
                key={title}
                className="rounded-3xl border border-[#e7e0d4] bg-white p-6 shadow-sm"
              >
                <p className="text-sm text-[#92897d]">{title}</p>
                <p className="mt-3 text-xl font-semibold">{value}</p>
              </div>
            ))}
          </section>

          {[
            ["一、命格基础", "从日主、五行结构与四柱关系进入整体命格分析。"],
            ["二、性格倾向", "结合日主、五行与十神结构，形成传统命理视角下的性格画像。"],
            ["三、事业发展", "进一步结合十神、格局与大运，分析事业阶段与发展方向。"],
            ["四、财富结构", "从财星、日主强弱以及大运变化等角度观察财富主题。"],
            ["五、婚恋关系", "结合夫妻宫、日主与十神，并可进入双方合盘进行进一步比较。"],
            ["六、人生阶段", "结合大运与流年，形成阶段性的传统命理参考。"],
          ].map(([title, text]) => (
            <section
              key={title}
              className="rounded-3xl border border-[#e7e0d4] bg-white p-6 shadow-sm md:p-8"
            >
              <h2 className="text-xl font-semibold">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-[#756b5d]">
                {text}
              </p>
            </section>
          ))}

          <a
            href="/pan"
            className="block rounded-2xl bg-[#29251f] p-5 text-center font-medium text-white"
          >
            开始我的八字排盘 →
          </a>

        </div>

        <p className="mt-8 text-center text-xs leading-6 text-[#aaa095]">
          本页面为报告展示示例，内容用于传统文化研究与娱乐参考。
        </p>
      </div>
    </main>
  );
}
