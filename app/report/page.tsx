export default function ReportPage() {
  const pillars = [
    ["年柱", "甲子", "偏官", "水"],
    ["月柱", "丙寅", "偏印", "木"],
    ["日柱", "戊辰", "日主", "土"],
    ["时柱", "庚午", "食神", "火"],
  ];

  const elements: Array<[string, number, string]> = [
    ["木", 2, "生发、行动、规划"],
    ["火", 2, "表达、动力、表现"],
    ["土", 2, "稳定、承载、执行"],
    ["金", 1, "规则、判断、分析"],
    ["水", 1, "流动、思维、资源"],
  ];

  const relations = [
    ["寅午", "半合火", "行动力与表达欲较明显"],
    ["子午", "相冲", "容易形成节奏变化与内在张力"],
    ["辰子", "半合水", "资源、信息与环境变化主题较突出"],
  ];

  return (
    <main className="min-h-screen bg-[#f7f3ec] text-[#29251f]">
      <div className="mx-auto max-w-6xl px-5 py-10 md:px-8">

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

          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold md:text-5xl">
                八字命格报告
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#756b5d]">
                这是东方命格 AI 的完整报告展示示例。
                实际报告将根据用户真实出生资料生成对应命盘。
              </p>
            </div>

            <span className="w-fit rounded-full bg-[#29251f] px-4 py-2 text-xs tracking-[0.15em] text-white">
              示例报告
            </span>
          </div>
        </header>

        <div className="mt-10 space-y-6">

          {/* 基础信息 */}
          <section className="rounded-3xl border border-[#e7e0d4] bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-[#9a8060]">命盘基础</p>
                <h2 className="mt-2 text-2xl font-semibold">
                  个人八字命格
                </h2>
              </div>

              <p className="text-sm text-[#92897d]">
                男命 · 示例出生资料
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl bg-[#f7f3ec] p-5">
                <p className="text-xs text-[#92897d]">姓名</p>
                <p className="mt-2 text-xl font-semibold">示例用户</p>
              </div>

              <div className="rounded-2xl bg-[#f7f3ec] p-5">
                <p className="text-xs text-[#92897d]">出生日期</p>
                <p className="mt-2 text-xl font-semibold">1995-08-15</p>
              </div>

              <div className="rounded-2xl bg-[#f7f3ec] p-5">
                <p className="text-xs text-[#92897d]">出生时间</p>
                <p className="mt-2 text-xl font-semibold">14:30</p>
              </div>

              <div className="rounded-2xl bg-[#f7f3ec] p-5">
                <p className="text-xs text-[#92897d]">生肖</p>
                <p className="mt-2 text-xl font-semibold">猪</p>
              </div>
            </div>
          </section>

          {/* 四柱 */}
          <section className="rounded-3xl border border-[#e7e0d4] bg-white p-6 shadow-sm md:p-8">
            <div>
              <p className="text-sm text-[#9a8060]">核心命盘</p>
              <h2 className="mt-2 text-2xl font-semibold">
                四柱八字
              </h2>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {pillars.map(([name, pillar, tenGod, element]) => (
                <div
                  key={name}
                  className="rounded-2xl border border-[#e7e0d4] bg-[#fcfaf7] p-5 text-center"
                >
                  <p className="text-xs text-[#92897d]">{name}</p>

                  <p className="mt-3 text-3xl font-semibold tracking-[0.12em]">
                    {pillar}
                  </p>

                  <p className="mt-3 text-sm text-[#8b6f47]">
                    {tenGod}
                  </p>

                  <p className="mt-1 text-xs text-[#92897d]">
                    五行：{element}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl bg-[#29251f] p-6 text-white">
              <p className="text-sm text-[#d9cbb8]">日主</p>

              <div className="mt-2 flex flex-wrap items-end gap-3">
                <span className="text-4xl font-semibold">戊</span>
                <span className="pb-1 text-lg text-[#d9cbb8]">土</span>
                <span className="pb-1 text-sm text-[#d9cbb8]">
                  日主状态：身强
                </span>
              </div>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-[#ddd5c8]">
                在传统命理体系中，日主代表命盘分析的核心。
                本示例以戊土作为日主，从五行结构、十神关系以及四柱组合继续展开分析。
              </p>
            </div>
          </section>

          {/* 五行 */}
          <section className="rounded-3xl border border-[#e7e0d4] bg-white p-6 shadow-sm md:p-8">
            <p className="text-sm text-[#9a8060]">五行结构</p>

            <h2 className="mt-2 text-2xl font-semibold">
              五行分布
            </h2>

            <div className="mt-8 space-y-4">
              {elements.map(([element, count, meaning]) => (
                <div key={element}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold">
                        {element}
                      </span>

                      <span className="text-xs text-[#92897d]">
                        {meaning}
                      </span>
                    </div>

                    <span className="text-sm font-semibold">
                      {count}
                    </span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#eee7dc]">
                    <div
                      className="h-full rounded-full bg-[#8b6f47]"
                      style={{ width: `${count * 20}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl bg-[#f7f3ec] p-5">
              <p className="text-sm leading-7 text-[#756b5d]">
                五行分布用于观察命盘整体结构。
                实际分析并非简单地以数量多少判断吉凶，还需要结合月令、
                日主强弱、透干、藏干、十神以及大运流年综合判断。
              </p>
            </div>
          </section>

          {/* 十神 */}
          <section className="rounded-3xl border border-[#e7e0d4] bg-white p-6 shadow-sm md:p-8">
            <p className="text-sm text-[#9a8060]">十神结构</p>

            <h2 className="mt-2 text-2xl font-semibold">
              命盘中的十神主题
            </h2>

            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                ["比劫", "自我、行动、竞争与同辈关系"],
                ["食伤", "表达、创造、技能与输出能力"],
                ["财星", "资源、现实经营与财富主题"],
                ["官杀", "规则、责任、事业压力与组织关系"],
                ["印星", "学习、支持、知识与保护"],
                ["日主", "命盘自身以及个人核心状态"],
              ].map(([title, text]) => (
                <div
                  key={title}
                  className="rounded-2xl bg-[#f7f3ec] p-5"
                >
                  <h3 className="font-semibold">{title}</h3>

                  <p className="mt-3 text-sm leading-7 text-[#756b5d]">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 地支关系 */}
          <section className="rounded-3xl border border-[#e7e0d4] bg-white p-6 shadow-sm md:p-8">
            <p className="text-sm text-[#9a8060]">结构关系</p>

            <h2 className="mt-2 text-2xl font-semibold">
              地支关系
            </h2>

            <div className="mt-8 overflow-hidden rounded-2xl border border-[#e7e0d4]">
              {relations.map(([pair, relation, meaning]) => (
                <div
                  key={pair}
                  className="grid gap-2 border-b border-[#eee7dc] p-5 last:border-b-0 md:grid-cols-[100px_140px_1fr]"
                >
                  <div className="font-semibold">{pair}</div>

                  <div className="text-[#8b6f47]">
                    {relation}
                  </div>

                  <div className="text-sm leading-6 text-[#756b5d]">
                    {meaning}
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-5 text-xs leading-6 text-[#aaa095]">
              关系分析属于传统命理文化解释，不代表现实中的确定事件。
            </p>
          </section>

          {/* 性格 */}
          <section className="rounded-3xl border border-[#e7e0d4] bg-white p-6 shadow-sm md:p-8">
            <p className="text-sm text-[#9a8060]">01 · 性格</p>

            <h2 className="mt-2 text-2xl font-semibold">
              性格倾向
            </h2>

            <div className="mt-6 space-y-4 text-sm leading-8 text-[#756b5d]">
              <p>
                从传统命理角度，戊土通常被用于象征稳定、承载、责任与现实感。
                在命盘结构中，如果日主与其他五行形成较好的配合，
                往往更强调稳定推进、持续执行与承担责任的主题。
              </p>

              <p>
                同时，命盘中的食伤、财星、官杀与印星会进一步改变这种表现。
                因此完整报告不会只根据一个日主判断性格，而会综合整个命局。
              </p>
            </div>
          </section>

          {/* 事业 */}
          <section className="rounded-3xl border border-[#e7e0d4] bg-white p-6 shadow-sm md:p-8">
            <p className="text-sm text-[#9a8060]">02 · 事业</p>

            <h2 className="mt-2 text-2xl font-semibold">
              事业发展
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                ["核心能力", "稳定执行、长期积累、组织与协调"],
                ["发展方式", "先建立基础，再通过经验形成优势"],
                ["分析重点", "十神、格局、大运与流年"],
              ].map(([title, text]) => (
                <div
                  key={title}
                  className="rounded-2xl bg-[#f7f3ec] p-5"
                >
                  <h3 className="font-semibold">{title}</h3>

                  <p className="mt-3 text-sm leading-7 text-[#756b5d]">
                    {text}
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-6 text-sm leading-8 text-[#756b5d]">
              完整事业报告会进一步分析大运周期，
              将个人命盘基础结构与不同人生阶段结合起来，
              形成更完整的传统命理视角。
            </p>
          </section>

          {/* 财富 */}
          <section className="rounded-3xl border border-[#e7e0d4] bg-white p-6 shadow-sm md:p-8">
            <p className="text-sm text-[#9a8060]">03 · 财富</p>

            <h2 className="mt-2 text-2xl font-semibold">
              财富结构
            </h2>

            <div className="mt-6 rounded-2xl bg-[#f7f3ec] p-6">
              <p className="text-sm leading-8 text-[#756b5d]">
                传统命理中的财富主题主要观察财星与日主之间的关系，
                同时结合食伤、官杀、印星以及大运变化。
                因此财富分析重点不是简单判断“有没有财”，
                而是观察资源、能力、机会和阶段之间的关系。
              </p>
            </div>
          </section>

          {/* 婚恋 */}
          <section className="rounded-3xl border border-[#e7e0d4] bg-white p-6 shadow-sm md:p-8">
            <p className="text-sm text-[#9a8060]">04 · 婚恋</p>

            <h2 className="mt-2 text-2xl font-semibold">
              婚恋关系
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-[#f7f3ec] p-6">
                <h3 className="font-semibold">个人婚恋结构</h3>

                <p className="mt-3 text-sm leading-7 text-[#756b5d]">
                  从夫妻宫、日主、十神以及整体五行结构观察个人关系模式。
                </p>
              </div>

              <div className="rounded-2xl bg-[#f7f3ec] p-6">
                <h3 className="font-semibold">双方合盘</h3>

                <p className="mt-3 text-sm leading-7 text-[#756b5d]">
                  如果希望比较两个人的命盘，可以进入婚恋合盘，
                  对比双方四柱、五行、日主以及地支关系。
                </p>
              </div>
            </div>
          </section>

          {/* 人生阶段 */}
          <section className="rounded-3xl border border-[#e7e0d4] bg-white p-6 shadow-sm md:p-8">
            <p className="text-sm text-[#9a8060]">05 · 人生阶段</p>

            <h2 className="mt-2 text-2xl font-semibold">
              大运与人生阶段
            </h2>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                ["早期阶段", "学习基础、建立能力与形成个人方向。"],
                ["发展阶段", "事业、财富、人际与家庭主题逐渐展开。"],
                ["成熟阶段", "结合大运重新观察长期积累与人生选择。"],
              ].map(([title, text]) => (
                <div
                  key={title}
                  className="rounded-2xl border border-[#e7e0d4] p-5"
                >
                  <h3 className="font-semibold">{title}</h3>

                  <p className="mt-3 text-sm leading-7 text-[#756b5d]">
                    {text}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl bg-[#29251f] p-6 text-white">
              <p className="text-sm text-[#d9cbb8]">
                下一步报告能力
              </p>

              <p className="mt-3 text-sm leading-8 text-[#ddd5c8]">
                实际用户报告将在基础命盘之上继续接入十神、
                格局、起运、大运、流年以及阶段性分析，
                最终形成完整的个人命格报告。
              </p>
            </div>
          </section>

          {/* 入口 */}
          <div className="grid gap-3 md:grid-cols-2">
            <a
              href="/pan"
              className="rounded-2xl bg-[#29251f] p-5 text-center font-medium text-white transition hover:opacity-90"
            >
              开始我的八字排盘 →
            </a>

            <a
              href="/compatibility"
              className="rounded-2xl border border-[#ddd5c8] bg-white p-5 text-center font-medium text-[#29251f] transition hover:bg-[#f7f3ec]"
            >
              进入婚恋合盘 →
            </a>
          </div>

        </div>

        <p className="mt-8 text-center text-xs leading-6 text-[#aaa095]">
          本页面为传统文化命理报告展示示例，仅用于文化研究与娱乐参考，
          不构成医学、法律、投资或其他专业建议。
        </p>
      </div>
    </main>
  );
}
