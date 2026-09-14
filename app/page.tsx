export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f4ee] text-[#29251f]">
      <nav className="border-b border-[#ded8cc] bg-[#f7f4ee]/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div>
            <div className="text-xl font-bold tracking-wide">东方命格 AI</div>
            <div className="text-xs text-[#8b8173]">传统命理 × AI 智能分析</div>
          </div>

          <div className="hidden gap-7 text-sm md:flex">
            <a href="#" className="font-medium">
              首页
            </a>
            <a href="#" className="text-[#6f675d] hover:text-[#29251f]">
              八字排盘
            </a>
            <a href="#" className="text-[#6f675d] hover:text-[#29251f]">
              婚恋合盘
            </a>
            <a href="#" className="text-[#6f675d] hover:text-[#29251f]">
              报告示例
            </a>
            <a href="#" className="text-[#6f675d] hover:text-[#29251f]">
              个人中心
            </a>
          </div>

          <button className="rounded-full border border-[#b8ad9e] px-4 py-2 text-sm hover:bg-white">
            登录
          </button>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-5 pb-16 pt-20 md:pt-28">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex rounded-full border border-[#d4c7b4] bg-[#eee7da] px-4 py-2 text-sm text-[#786b5a]">
            ✦ 东方传统命理 · AI 深度解读
          </div>

          <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            从出生信息，
            <br />
            看见你的<span className="text-[#8c5f3d]">人生脉络</span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-[#70685e] md:text-lg">
            输入出生时间与地点，生成专属八字命盘。
            从身强身弱、五行结构，到事业、财富、婚恋与人生阶段，
            用更清晰的方式理解传统命理。
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <button className="rounded-xl bg-[#2f2a24] px-7 py-4 font-medium text-white shadow-sm hover:bg-[#423a31]">
              开始八字排盘 →
            </button>

            <button className="rounded-xl border border-[#cfc5b7] bg-white px-7 py-4 font-medium hover:bg-[#faf8f4]">
              查看报告示例
            </button>
          </div>
        </div>
      </section>

      <section className="border-y border-[#ded8cc] bg-white/60">
        <div className="mx-auto grid max-w-6xl gap-5 px-5 py-12 md:grid-cols-3">
          <Feature
            number="01"
            title="精准排盘"
            text="结合出生地点与真太阳时，建立完整四柱命盘。"
          />

          <Feature
            number="02"
            title="身强 / 身弱"
            text="从五行、生扶克泄等结构综合判断日主强弱。"
          />

          <Feature
            number="03"
            title="AI 深度报告"
            text="将命盘结构转化为易理解、可阅读的人生分析。"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="rounded-3xl bg-[#29251f] px-7 py-10 text-white md:px-12">
          <div className="max-w-2xl">
            <div className="text-sm text-[#cbbda9]">东方命格 AI</div>

            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              先排一张命盘，
              <br />
              再慢慢看懂自己。
            </h2>

            <p className="mt-5 leading-8 text-[#cfc7bc]">
              免费生成基础命盘与核心分析。
              深度报告按次购买，无需年度会员。
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <span className="rounded-full bg-white/10 px-4 py-2 text-sm">
                ¥9.9 / 1份
              </span>
              <span className="rounded-full bg-white/10 px-4 py-2 text-sm">
                ¥19.9 / 3份
              </span>
              <span className="rounded-full bg-white/10 px-4 py-2 text-sm">
                ¥29.9 / 5份
              </span>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#ded8cc] py-8 text-center text-xs text-[#8b8173]">
        <p>东方命格 AI · 传统文化参考工具</p>
        <p className="mt-2">
          本产品内容仅供传统文化研究、娱乐与个人参考，不构成专业建议。
        </p>
      </footer>
    </main>
  );
}

function Feature({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-[#ded8cc] bg-[#faf8f4] p-6">
      <div className="text-sm text-[#a28b70]">{number}</div>
      <h3 className="mt-3 text-xl font-semibold">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[#746b60]">{text}</p>
    </div>
  );
}