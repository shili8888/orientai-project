import { Solar } from "lunar-typescript";

export type Gender = "男" | "女";

export type WuXing = "木" | "火" | "土" | "金" | "水";

export type PillarDetail = {
  pillar: string;
  stem: string;
  branch: string;
  hiddenStems: string[];
  tenGodStem: string;
  tenGodBranch: string;
};

export type DaYunItem = {
  index: number;
  pillar: string;
  startYear: number;
  endYear: number;
  startAge: number;
  endAge: number;
  isCurrent: boolean;
};

export type BaziResult = {
  solarDate: string;
  solarTime: string;
  lunarDate: string;
  zodiac: string;

  yearPillar: string;
  monthPillar: string;
  dayPillar: string;
  hourPillar: string;

  yearDetail: PillarDetail;
  monthDetail: PillarDetail;
  dayDetail: PillarDetail;
  hourDetail: PillarDetail;

  dayMaster: string;
  dayMasterElement: WuXing;
  strength: "身强" | "身弱" | "中和";

  pattern: string;

  fiveElements: Record<WuXing, number>;

  usefulElements: WuXing[];
  avoidElements: WuXing[];

  branchRelations: {
    from: string;
    to: string;
    type: string;
    detail: string;
  }[];

  forward: boolean;
  startAge: number;
  startDate: string;

  daYun: DaYunItem[];
  currentDaYun: DaYunItem | null;

  currentYear: {
    year: number;
    ganZhi: string;
    stem: string;
    branch: string;
  };

  interpretation: string[];
};

const ELEMENTS: WuXing[] = ["木", "火", "土", "金", "水"];

const STEM_ELEMENT: Record<string, WuXing> = {
  甲: "木", 乙: "木",
  丙: "火", 丁: "火",
  戊: "土", 己: "土",
  庚: "金", 辛: "金",
  壬: "水", 癸: "水",
};

const BRANCH_ELEMENT: Record<string, WuXing> = {
  子: "水",
  丑: "土",
  寅: "木",
  卯: "木",
  辰: "土",
  巳: "火",
  午: "火",
  未: "土",
  申: "金",
  酉: "金",
  戌: "土",
  亥: "水",
};

const HIDDEN_STEMS: Record<string, string[]> = {
  子: ["癸"],
  丑: ["己", "癸", "辛"],
  寅: ["甲", "丙", "戊"],
  卯: ["乙"],
  辰: ["戊", "乙", "癸"],
  巳: ["丙", "戊", "庚"],
  午: ["丁", "己"],
  未: ["己", "丁", "乙"],
  申: ["庚", "壬", "戊"],
  酉: ["辛"],
  戌: ["戊", "辛", "丁"],
  亥: ["壬", "甲"],
};

const YIN_YANG: Record<string, "阳" | "阴"> = {
  甲: "阳", 乙: "阴",
  丙: "阳", 丁: "阴",
  戊: "阳", 己: "阴",
  庚: "阳", 辛: "阴",
  壬: "阳", 癸: "阴",
};

const GENERATING: Record<WuXing, WuXing> = {
  木: "火",
  火: "土",
  土: "金",
  金: "水",
  水: "木",
};

const GENERATED_BY: Record<WuXing, WuXing> = {
  木: "水",
  火: "木",
  土: "火",
  金: "土",
  水: "金",
};

const CONTROLLED_BY: Record<WuXing, WuXing> = {
  木: "金",
  火: "水",
  土: "木",
  金: "火",
  水: "土",
};

const CONTROLS: Record<WuXing, WuXing> = {
  木: "土",
  火: "金",
  土: "水",
  金: "木",
  水: "火",
};

function stemElement(stem: string): WuXing {
  return STEM_ELEMENT[stem] ?? "土";
}

function branchElement(branch: string): WuXing {
  return BRANCH_ELEMENT[branch] ?? "土";
}

function tenGod(dayStem: string, targetStem: string): string {
  const a = stemElement(dayStem);
  const b = stemElement(targetStem);

  const samePolarity = YIN_YANG[dayStem] === YIN_YANG[targetStem];

  if (a === b) return samePolarity ? "比肩" : "劫财";

  if (GENERATING[a] === b) return samePolarity ? "食神" : "伤官";

  if (GENERATED_BY[a] === b) return samePolarity ? "偏印" : "正印";

  if (CONTROLS[a] === b) return samePolarity ? "偏财" : "正财";

  if (CONTROLLED_BY[a] === b) return samePolarity ? "七杀" : "正官";

  return "日主";
}

function currentYearGanZhi(year: number) {
  const stems = "甲乙丙丁戊己庚辛壬癸";
  const branches = "子丑寅卯辰巳午未申酉戌亥";
  const stem = stems[(year - 4) % 10];
  const branch = branches[(year - 4) % 12];

  return {
    year,
    ganZhi: `${stem}${branch}`,
    stem,
    branch,
  };
}

function buildRelations(branches: string[]) {
  const result: BaziResult["branchRelations"] = [];

  const pairMap: Record<string, [string, string]> = {};

  const addPair = (a: string, b: string, type: string) => {
    pairMap[`${a}${b}`] = [a, b];
    pairMap[`${b}${a}`] = [a, b];
  };

  [
    ["子", "丑"],
    ["寅", "亥"],
    ["卯", "戌"],
    ["辰", "酉"],
    ["巳", "申"],
    ["午", "未"],
  ].forEach(([a, b]) => addPair(a, b, "六合"));

  [
    ["子", "午"],
    ["丑", "未"],
    ["寅", "申"],
    ["卯", "酉"],
    ["辰", "戌"],
    ["巳", "亥"],
  ].forEach(([a, b]) => addPair(a, b, "六冲"));

  const types: Record<string, string> = {
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

    子午: "六冲",
    午子: "六冲",
    丑未: "六冲",
    未丑: "六冲",
    寅申: "六冲",
    申寅: "六冲",
    卯酉: "六冲",
    酉卯: "六冲",
    辰戌: "六冲",
    戌辰: "六冲",
    巳亥: "六冲",
    亥巳: "六冲",

    子卯: "相刑",
    卯子: "相刑",
    寅巳: "相刑",
    巳寅: "相刑",
    丑戌: "相刑",
    戌丑: "相刑",
    未戌: "相刑",
    戌未: "相刑",

    子未: "相害",
    未子: "相害",
    丑午: "相害",
    午丑: "相害",
    卯辰: "相害",
    辰卯: "相害",
    申亥: "相害",
    亥申: "相害",
    酉戌: "相害",
    戌酉: "相害",
  };

  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      const a = branches[i];
      const b = branches[j];
      const type = types[`${a}${b}`];

      if (type) {
        result.push({
          from: a,
          to: b,
          type,
          detail: `${a}${b}${type}`,
        });
      }
    }
  }

  return result;
}

function buildInterpretation(
  dayMaster: string,
  dayElement: WuXing,
  strength: BaziResult["strength"],
  pattern: string,
  counts: Record<WuXing, number>,
  useful: WuXing[],
  avoid: WuXing[],
  relations: BaziResult["branchRelations"],
  currentDaYun: DaYunItem | null,
  currentYear: BaziResult["currentYear"],
  yearGod: string,
) {
  const support = GENERATED_BY[dayElement];
  const output = GENERATING[dayElement];
  const wealth = CONTROLS[dayElement];
  const authority = CONTROLLED_BY[dayElement];

  const relationText =
    relations.length > 0
      ? relations
          .map((item) => `${item.from}${item.to}${item.type}`)
          .join("、")
      : "四柱之间暂未检测到主要六合、六冲、相害、相刑关系";

  const maxElement = ELEMENTS.reduce((best, item) =>
    counts[item] > counts[best] ? item : best
  );

  const minElement = ELEMENTS.reduce((best, item) =>
    counts[item] < counts[best] ? item : best
  );

  const daYunText = currentDaYun
    ? `当前大运为${currentDaYun.pillar}，对应${currentDaYun.startYear}—${currentDaYun.endYear}年。`
    : "当前年份尚未落入已经列出的十年大运区间。";

  const currentYearElement = stemElement(currentYear.stem);
  const currentYearBranchElement = branchElement(currentYear.branch);

  const strengthText =
    strength === "身强"
      ? `日主${dayMaster}属${dayElement}，目前属于身强结构。命局中的扶身力量相对明显，因此分析重点不是继续增加同类力量，而是观察泄耗、克制与现实事务之间是否形成平衡。`
      : strength === "身弱"
        ? `日主${dayMaster}属${dayElement}，目前属于身弱结构。命局承载力相对有限，因此首先要看生扶日主的力量是否能够形成稳定支撑，再判断财官食伤等力量是否过重。`
        : `日主${dayMaster}属${dayElement}，整体处于中和状态。命局不宜简单归入极强或极弱，更适合观察不同五行进入之后产生的动态变化。`;

  const usefulText =
    useful.length > 0
      ? useful.join("、")
      : "暂未形成明确单一取用方向";

  const avoidText =
    avoid.length > 0
      ? avoid.join("、")
      : "暂未形成明确忌避方向";

  const careerText =
    strength === "身强"
      ? `事业层面宜把力量放在${usefulText}所代表的调节方向上，尤其要避免把竞争、执行和自我投入无限放大。`
      : strength === "身弱"
        ? `事业层面首先重视${usefulText}所代表的支撑力量，再考虑财星、官杀等现实压力。基础稳定后，承担更高目标会更有持续性。`
        : `事业层面适合根据具体流年与大运调整节奏，不宜仅凭日主强弱做单一判断。`;

  const relationshipText =
    counts[wealth] > counts[dayElement]
      ? `关系与现实资源层面，${wealth}的力量较为明显，容易把现实责任、资源配置或伴侣议题带入命局核心，需要注意投入与承载之间的比例。`
      : `关系与现实资源层面，${wealth}并非命局中最突出的力量，因此更需要结合日支以及后续大运、流年来观察具体阶段变化。`;

  const yearText = currentDaYun
    ? `${currentYear.year}年为${currentYear.ganZhi}，流年天干${currentYear.stem}对应日主的${yearGod}。流年天干五行为${currentYearElement}，地支五行为${currentYearBranchElement}，同时处于${currentDaYun.pillar}大运阶段。因此今年不能脱离大运单独判断，重点应观察流年力量与大运、原局之间是形成扶助、泄耗还是冲动。`
    : `${currentYear.year}年为${currentYear.ganZhi}，流年天干${currentYear.stem}对应日主的${yearGod}。流年天干五行为${currentYearElement}，地支五行为${currentYearBranchElement}，应结合出生原局及未来进入的大运阶段继续判断。`;

  return [
    strengthText,
    `命局五行统计中，${maxElement}当前数量最高，${minElement}当前数量最低。日主得到${support}的生扶，同时向${output}方向泄秀，并受到${authority}的制约、对${wealth}形成克制。因此判断喜用时不能只看某一个五行出现次数，而要综合月令、日主强弱以及五行之间的生克关系。当前取用方向偏向${usefulText}，需要控制的方向偏向${avoidText}。`,
    `四柱地支关系目前检测到：${relationText}。其中合通常体现连接、合作、资源汇聚，冲则更容易表现为变化、移动、矛盾或环境转换，害与刑则更偏向隐性摩擦和结构性牵制。真正解释事件时，还需要观察这些关系有没有被当前大运或流年再次触发。`,
    daYunText,
    yearText,
    careerText,
    relationshipText,
    `综合来看，这张命盘不适合用固定的“好命/坏命”标签概括。真正有价值的是把原局结构作为底盘，再把大运作为十年周期、流年作为年度触发因素叠加观察。当前五行最需要关注的是${usefulText}的调节作用，以及${avoidText}是否出现过度。`,
  ];
}
export function calculateBazi(
  birthDate: Date,
  birthTime: string,
  gender: Gender,
): BaziResult {
  const year = birthDate.getFullYear();
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();

  const [hour, minute] = birthTime.split(":").map(Number);

  const solar = Solar.fromYmdHms(
    year,
    month,
    day,
    hour || 0,
    minute || 0,
    0,
  );

  const lunar = solar.getLunar();
  const eight = lunar.getEightChar();

  const yearPillar = eight.getYear();
  const monthPillar = eight.getMonth();
  const dayPillar = eight.getDay();
  const hourPillar = eight.getTime();

  const dayMaster = eight.getDayGan();
  const dayElement = stemElement(dayMaster);

  const makeDetail = (
    pillar: string,
    stem: string,
    branch: string,
    stemGod: string,
    branchGod: string,
  ): PillarDetail => ({
    pillar,
    stem,
    branch,
    hiddenStems: HIDDEN_STEMS[branch] ?? [],
    tenGodStem: stemGod,
    tenGodBranch: branchGod,
  });

  const yearDetail = makeDetail(
    yearPillar,
    eight.getYearGan(),
    eight.getYearZhi(),
    eight.getYearShiShenGan(),
    eight.getYearShiShenZhi().join("、"),
  );

  const monthDetail = makeDetail(
    monthPillar,
    eight.getMonthGan(),
    eight.getMonthZhi(),
    eight.getMonthShiShenGan(),
    eight.getMonthShiShenZhi().join("、"),
  );

  const dayDetail = makeDetail(
    dayPillar,
    eight.getDayGan(),
    eight.getDayZhi(),
    "日主",
    eight.getDayShiShenZhi().join("、"),
  );

  const hourDetail = makeDetail(
    hourPillar,
    eight.getTimeGan(),
    eight.getTimeZhi(),
    eight.getTimeShiShenGan(),
    eight.getTimeShiShenZhi().join("、"),
  );

  const stems = [
    eight.getYearGan(),
    eight.getMonthGan(),
    eight.getDayGan(),
    eight.getTimeGan(),
  ];

  const branches = [
    eight.getYearZhi(),
    eight.getMonthZhi(),
    eight.getDayZhi(),
    eight.getTimeZhi(),
  ];

  const counts: Record<WuXing, number> = {
    木: 0,
    火: 0,
    土: 0,
    金: 0,
    水: 0,
  };

  stems.forEach((stem) => {
    counts[stemElement(stem)] += 1;
  });

  branches.forEach((branch) => {
    counts[branchElement(branch)] += 1;
  });

  const same =
    counts[dayElement] +
    counts[GENERATED_BY[dayElement]] * 0.5;

  const opposite =
    counts[CONTROLLED_BY[dayElement]] +
    counts[CONTROLS[dayElement]] +
    counts[GENERATING[dayElement]] * 0.5;

  const strength: BaziResult["strength"] =
    same - opposite >= 1.5
      ? "身强"
      : same - opposite <= -1.5
        ? "身弱"
        : "中和";

  const monthStem = eight.getMonthGan();
  const monthGod = tenGod(dayMaster, monthStem);

  const patternMap: Record<string, string> = {
    比肩: "比肩格",
    劫财: "劫财格",
    食神: "食神格",
    伤官: "伤官格",
    偏财: "偏财格",
    正财: "正财格",
    七杀: "七杀格",
    正官: "正官格",
    偏印: "偏印格",
    正印: "正印格",
  };

  const pattern = patternMap[monthGod] ?? `${monthGod}格`;

  const useful: WuXing[] =
    strength === "身强"
      ? [GENERATING[dayElement], CONTROLS[dayElement]]
      : strength === "身弱"
        ? [GENERATED_BY[dayElement], dayElement]
        : [GENERATING[dayElement]];

  const avoid: WuXing[] =
    strength === "身强"
      ? [dayElement, GENERATED_BY[dayElement]]
      : strength === "身弱"
        ? [CONTROLLED_BY[dayElement], CONTROLS[dayElement]]
        : [CONTROLLED_BY[dayElement]];

  const relations = buildRelations(branches);

  const currentYear = currentYearGanZhi(new Date().getFullYear());
  const yearGod = tenGod(dayMaster, currentYear.stem);

  const yun = eight.getYun(gender === "男" ? 1 : 0);
  const startYear = yun.getStartYear();
  const startAge = yun.getStartYear() - year;

  const startSolar = yun.getStartSolar();

  const startDate =
    startSolar && typeof startSolar.toYmd === "function"
      ? startSolar.toYmd()
      : `${startYear}年`;

  const rawDaYun = yun.getDaYun();

  const daYun: DaYunItem[] = [];

  rawDaYun.forEach((item: any, index: number) => {
    if (index === 0) return;

    const sy = item.getStartYear();

    if (!sy) return;

    const age = item.getStartAge();
    const pillar = item.getGanZhi();

    daYun.push({
      index,
      pillar,
      startYear: sy,
      endYear: sy + 9,
      startAge: Math.round(age),
      endAge: Math.round(age + 9),
      isCurrent:
        new Date().getFullYear() >= sy &&
        new Date().getFullYear() <= sy + 9,
    });
  });

  const currentDaYun =
    daYun.find((item) => item.isCurrent) ?? null;

  const lunarDate =
    typeof lunar.toFullString === "function"
      ? lunar.toFullString()
      : `${lunar.getYearInChinese()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}日`;

  return {
    solarDate: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    solarTime: `${String(hour || 0).padStart(2, "0")}:${String(minute || 0).padStart(2, "0")}`,
    lunarDate,
    zodiac: lunar.getYearShengXiao(),

    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,

    yearDetail,
    monthDetail,
    dayDetail,
    hourDetail,

    dayMaster,
    dayMasterElement: dayElement,
    strength,
    pattern,

    fiveElements: counts,

    usefulElements: useful,
    avoidElements: avoid,

    branchRelations: relations,

    forward: (() => {
      const yearGan = eight.getYearGan();
      const yangGan = ["甲", "丙", "戊", "庚", "壬"];
      const isYangYear = yangGan.includes(yearGan);
      const isMale = gender === "男";
      return isMale === isYangYear;
    })(),
    startAge: Math.max(0, startAge),
    startDate,

    daYun,
    currentDaYun,

    currentYear,

    interpretation: buildInterpretation(
      dayMaster,
      dayElement,
      strength,
      pattern,
      counts,
      useful,
      avoid,
      relations,
      currentDaYun,
      currentYear,
      yearGod,
    ),
  };
}
