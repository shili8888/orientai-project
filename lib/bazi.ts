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
      ? relations.map((x) => `${x.from}${x.to}${x.type}`).join("、")
      : "四柱之间未检测到六合、六冲、相害、相刑等主要关系";

  const daYunText = currentDaYun
    ? `当前大运为${currentDaYun.pillar}，从${currentDaYun.startYear}年进入，约${currentDaYun.startAge}岁起运。`
    : "当前年龄尚未进入已列出的大运阶段。";

  const yearElement = stemElement(currentYear.stem);
  const branchElementNow = branchElement(currentYear.branch);

  return [
    `日主为${dayMaster}${dayElement}。${strength}的判断来自月令、同类五行与生扶力量的综合比较，而不是单看五行数量。当前命局以${pattern}作为主要结构观察点。`,
    `从五行作用看，${dayElement}的生扶来自${support}，自身又向${output}泄秀，并受${authority}制约、克制${wealth}。结合当前命局强弱，较适合优先观察${useful.join("、")}的调节作用；${avoid.join("、")}则需要避免继续形成失衡。五行统计为木${counts.木}、火${counts.火}、土${counts.土}、金${counts.金}、水${counts.水}。`,
    `命局地支实际结构为：${relationText}。这些关系用于判断事件主题的牵动方式，合多时重点看合作、黏合与资源汇聚，冲害出现时则重点看变化、摩擦、环境转换或关系调整。`,
    daYunText,
    currentDaYun
      ? `当前大运${currentDaYun.pillar}与日主${dayElement}的关系，需要结合其天干十神与地支五行判断。当前流年为${currentYear.year}年${currentYear.ganZhi}，流年天干对应${yearGod}，流年五行分别为${yearElement}与${branchElementNow}，因此今年的重点不是固定的“好”或“坏”，而是看流年如何叠加当前大运与原局。`
      : `当前流年为${currentYear.year}年${currentYear.ganZhi}，流年天干对应${yearGod}，流年五行分别为${yearElement}与${branchElementNow}，应结合进入大运的具体年龄阶段继续判断。`,
    `事业层面重点观察官杀、食伤与印星之间的配合；财运重点观察财星是否得到日主承载以及是否受到过度克制；关系层面则同时参考财星、官杀与夫妻宫（日支）的实际结构。因此后续解读应随着出生时间、当前大运和流年的变化而变化，而不是使用固定模板。`,
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

    forward: true,
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
