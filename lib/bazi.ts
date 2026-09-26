import { Solar } from "lunar-typescript";

export type Gender = "男" | "女";
export type Strength = "身强" | "身弱";
export type WuXing = "木" | "火" | "土" | "金" | "水";
export const BAZI_CALCULATION_VERSION = 2;

export type HiddenStem = {
  stem: string;
  role: "主气" | "中气" | "余气";
  element: WuXing;
  tenGod: string;
};

export type PillarDetail = {
  name: string;
  stem: string;
  branch: string;
  stemElement: WuXing;
  branchElement: WuXing;
  stemTenGod: string;
  hiddenStems: HiddenStem[];
};

export type BranchRelation = {
  type: string;
  branches: string[];
  description: string;
};

export type DaYunItem = {
  index: number;
  ganZhi: string;
  startYear: number;
  startAge: number;
  endYear: number;
  endAge: number;
  gan: string;
  zhi: string;
  tenGod: string;
  stemElement: WuXing;
  branchElement: WuXing;
  branchRelations: string[];
  analysis: string;
};

export type AnnualFortune = {
  year: number;
  ganZhi: string;
  stemTenGod: string;
  stemElement: WuXing;
  branchElement: WuXing;
  branchRelations: string[];
  theme: string;
};

export type BaziResult = {
  calculationVersion: number;
  birthDate: string;
  birthTime: string;
  gender: Gender;

  yearPillar: string;
  monthPillar: string;
  dayPillar: string;
  hourPillar: string;

  year: PillarDetail;
  month: PillarDetail;
  day: PillarDetail;
  hour: PillarDetail;

  dayMaster: string;
  dayMasterElement: WuXing;
  strength: Strength;

  fiveElements: Record<WuXing, number>;
  elementStrength: Record<WuXing, number>;

  tenGods: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };

  branchRelations: BranchRelation[];

  pattern: string;
  usefulElements: WuXing[];
  avoidElements: WuXing[];

  lunarDate: string;
  zodiac: string;

  yunDirection: "顺行" | "逆行";
  luckStartDate: string;
  luckStartAge: number;
  daYun: DaYunItem[];
  currentDaYun: DaYunItem | null;

  currentYear: number;
  currentYearGanZhi: string;
  annualFortunes: AnnualFortune[];

  interpretation: {
    personality: string[];
    career: string[];
    wealth: string[];
    romance: string[];
  };
};

const ELEMENTS: WuXing[] = ["木", "火", "土", "金", "水"];

const STEM_ELEMENT: Record<string, WuXing> = {
  甲: "木", 乙: "木",
  丙: "火", 丁: "火",
  戊: "土", 己: "土",
  庚: "金", 辛: "金",
  壬: "水", 癸: "水",
};

const STEM_POLARITY: Record<string, "阳" | "阴"> = {
  甲: "阳", 乙: "阴",
  丙: "阳", 丁: "阴",
  戊: "阳", 己: "阴",
  庚: "阳", 辛: "阴",
  壬: "阳", 癸: "阴",
};

const BRANCH_ELEMENT: Record<string, WuXing> = {
  子: "水", 丑: "土", 寅: "木", 卯: "木",
  辰: "土", 巳: "火", 午: "火", 未: "土",
  申: "金", 酉: "金", 戌: "土", 亥: "水",
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

const HIDDEN_ROLE: Record<string, ("主气" | "中气" | "余气")[]> = {
  子: ["主气"],
  丑: ["主气", "中气", "余气"],
  寅: ["主气", "中气", "余气"],
  卯: ["主气"],
  辰: ["主气", "中气", "余气"],
  巳: ["主气", "中气", "余气"],
  午: ["主气", "中气"],
  未: ["主气", "中气", "余气"],
  申: ["主气", "中气", "余气"],
  酉: ["主气"],
  戌: ["主气", "中气", "余气"],
  亥: ["主气", "中气"],
};

const GENERATES: Record<WuXing, WuXing> = {
  木: "火",
  火: "土",
  土: "金",
  金: "水",
  水: "木",
};

const CONTROLS: Record<WuXing, WuXing> = {
  木: "土",
  火: "金",
  土: "水",
  金: "木",
  水: "火",
};

const SUPPORTS: Record<WuXing, WuXing> = {
  木: "水",
  火: "木",
  土: "火",
  金: "土",
  水: "金",
};

const SHENGXIAO: Record<string, string> = {
  子: "鼠", 丑: "牛", 寅: "虎", 卯: "兔",
  辰: "龙", 巳: "蛇", 午: "马", 未: "羊",
  申: "猴", 酉: "鸡", 戌: "狗", 亥: "猪",
};

function tenGod(dayMaster: string, target: string): string {
  if (target === dayMaster) return "日主";

  const dm = STEM_ELEMENT[dayMaster];
  const tg = STEM_ELEMENT[target];
  const samePolarity = STEM_POLARITY[dayMaster] === STEM_POLARITY[target];

  if (dm === tg) {
    return samePolarity ? "比肩" : "劫财";
  }

  if (GENERATES[dm] === tg) {
    return samePolarity ? "食神" : "伤官";
  }

  if (CONTROLS[dm] === tg) {
    return samePolarity ? "偏财" : "正财";
  }

  if (CONTROLS[tg] === dm) {
    return samePolarity ? "七杀" : "正官";
  }

  if (GENERATES[tg] === dm) {
    return samePolarity ? "偏印" : "正印";
  }

  return "十神";
}

function buildPillar(
  name: string,
  stem: string,
  branch: string,
  dayMaster: string
): PillarDetail {
  const hidden = HIDDEN_STEMS[branch] ?? [];
  const roles = HIDDEN_ROLE[branch] ?? [];

  return {
    name,
    stem,
    branch,
    stemElement: STEM_ELEMENT[stem],
    branchElement: BRANCH_ELEMENT[branch],
    stemTenGod: tenGod(dayMaster, stem),
    hiddenStems: hidden.map((s, i) => ({
      stem: s,
      role: roles[i],
      element: STEM_ELEMENT[s],
      tenGod: tenGod(dayMaster, s),
    })),
  };
}

function visibleElementCount(
  pillars: string[]
): Record<WuXing, number> {
  const result: Record<WuXing, number> = {
    木: 0, 火: 0, 土: 0, 金: 0, 水: 0,
  };

  for (const pillar of pillars) {
    for (const char of pillar) {
      if (STEM_ELEMENT[char]) {
        result[STEM_ELEMENT[char]] += 1;
      } else if (BRANCH_ELEMENT[char]) {
        result[BRANCH_ELEMENT[char]] += 1;
      }
    }
  }

  return result;
}

function calculateElementStrength(
  pillars: PillarDetail[],
  dayMasterElement: WuXing
): Record<WuXing, number> {
  const score: Record<WuXing, number> = {
    木: 0, 火: 0, 土: 0, 金: 0, 水: 0,
  };

  for (const pillar of pillars) {
    score[pillar.stemElement] += 1;

    const hidden = pillar.hiddenStems;

    if (hidden[0]) score[hidden[0].element] += 1;
    if (hidden[1]) score[hidden[1].element] += 0.5;
    if (hidden[2]) score[hidden[2].element] += 0.25;
  }

  // 月令权重
  const monthElement = pillars[1].branchElement;
  score[monthElement] += 2;

  // 日主得到同类和生扶的力量
  score[dayMasterElement] += 0.5;
  score[SUPPORTS[dayMasterElement]] += 0.5;

  return score;
}

function determineStrength(
  score: Record<WuXing, number>,
  dayMasterElement: WuXing
): Strength {
  const total = ELEMENTS.reduce((sum, e) => sum + score[e], 0);
  const supportive =
    score[dayMasterElement] + score[SUPPORTS[dayMasterElement]];

  return supportive / total >= 0.46 ? "身强" : "身弱";
}

function relationBetween(a: string, b: string): string | null {
  const pair = `${a}${b}`;

  const liuHe = ["子丑", "寅亥", "卯戌", "辰酉", "巳申", "午未"];
  const liuChong = ["子午", "丑未", "寅申", "卯酉", "辰戌", "巳亥"];
  const liuHai = ["子未", "丑午", "寅巳", "卯辰", "申亥", "酉戌"];
  const liuPo = ["子酉", "丑辰", "寅亥", "卯午", "申巳", "戌未"];

  if (liuHe.some((x) => x === pair || x === `${b}${a}`)) return "六合";
  if (liuChong.some((x) => x === pair || x === `${b}${a}`)) return "相冲";
  if (liuHai.some((x) => x === pair || x === `${b}${a}`)) return "相害";
  if (liuPo.some((x) => x === pair || x === `${b}${a}`)) return "相破";

  return null;
}

export function getBranchRelation(a: string, b: string): string | null {
  return relationBetween(a, b);
}

function branchRelations(branches: string[]): BranchRelation[] {
  const result: BranchRelation[] = [];

  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      const relation = relationBetween(branches[i], branches[j]);

      if (relation) {
        result.push({
          type: relation,
          branches: [branches[i], branches[j]],
          description: `${branches[i]}${branches[j]} ${relation}`,
        });
      }
    }
  }

  const triples: Array<[string[], string]> = [
    [["申", "子", "辰"], "三合水局"],
    [["亥", "卯", "未"], "三合木局"],
    [["寅", "午", "戌"], "三合火局"],
    [["巳", "酉", "丑"], "三合金局"],
  ];

  for (const [group, name] of triples) {
    const found = group.filter((x) => branches.includes(x));

    if (found.length === 3) {
      result.push({
        type: "三合",
        branches: found,
        description: `${found.join("")} ${name}`,
      });
    } else if (found.length === 2) {
      result.push({
        type: "半合",
        branches: found,
        description: `${found.join("")} 半合`,
      });
    }
  }

  return result;
}

function determinePattern(month: PillarDetail, dayMaster: string): string {
  const mainHidden = month.hiddenStems[0];

  if (!mainHidden) return "月令格局待定";

  return `${mainHidden.tenGod}格`;
}

function usefulAndAvoid(
  strength: Strength,
  dayMasterElement: WuXing
): { useful: WuXing[]; avoid: WuXing[] } {
  if (strength === "身弱") {
    return {
      useful: [
        dayMasterElement,
        SUPPORTS[dayMasterElement],
      ],
      avoid: [
        GENERATES[dayMasterElement],
        CONTROLS[dayMasterElement],
      ],
    };
  }

  return {
    useful: [
      GENERATES[dayMasterElement],
      CONTROLS[dayMasterElement],
    ],
    avoid: [
      dayMasterElement,
      SUPPORTS[dayMasterElement],
    ],
  };
}

function interpretation(
  result: {
    dayMaster: string;
    dayMasterElement: WuXing;
    strength: Strength;
    pattern: string;
    tenGods: string[];
    relations: BranchRelation[];
    dayBranch: string;
    useful: WuXing[];
    avoid: WuXing[];
  }
): BaziResult["interpretation"] {
  const {
    dayMaster,
    dayMasterElement,
    strength,
    pattern,
    tenGods,
    relations,
    dayBranch,
    useful,
    avoid,
  } = result;

  const personality: string[] = [
    `日主为${dayMaster}，五行属${dayMasterElement}，当前判定为${strength}。`,
    `月令形成${pattern}，因此性格分析首先以日主与月令的关系为核心。`,
  ];

  if (strength === "身弱") {
    personality.push(
      `命局扶身力量相对不足，通常更需要稳定环境、明确边界和持续积累，不宜长期处在高消耗状态。`
    );
  } else {
    personality.push(
      `命局自身力量较足，行动主动性与承压能力相对突出，但也要避免过度坚持和力量使用过猛。`
    );
  }

  if (tenGods.includes("正官") || tenGods.includes("七杀")) {
    personality.push("官杀进入命局，责任、规则、竞争与目标压力是人生重要主题。");
  }

  if (
    tenGods.includes("正印") ||
    tenGods.includes("偏印")
  ) {
    personality.push("印星进入命局，学习、知识、资格、方法论与贵人支持具有实际作用。");
  }

  if (
    tenGods.includes("正财") ||
    tenGods.includes("偏财")
  ) {
    personality.push("财星进入命局，资源配置、现实收益与经营能力是重要议题。");
  }

  const career: string[] = [
    `当前用神方向偏${useful.join("、")}，职业选择宜优先寻找能够增强这些元素象征特质的环境。`,
    `命局的核心职业矛盾不是“能不能工作”，而是如何把${dayMaster}${strength === "身弱" ? "的稳定性" : "的主动性"}转化为长期产出。`,
  ];

  if (tenGods.includes("正官") || tenGods.includes("七杀")) {
    career.push("适合有明确规则、目标、责任边界或竞争机制的工作体系。");
  }

  if (tenGods.includes("食神") || tenGods.includes("伤官")) {
    career.push("表达、技术输出、内容生产、专业能力变现会成为重要突破口。");
  }

  const wealth: string[] = [
    `财星为${STEM_ELEMENT[dayMaster] === "木" ? "土" : CONTROLS[dayMasterElement]}，实际判断需要结合财星出现位置及强弱，而不是单独用“有财/没财”下结论。`,
    `当前命局建议把${useful.join("、")}作为资源配置方向，避免长期堆积${avoid.join("、")}对应的过度消耗。`,
  ];

  if (tenGods.includes("正财") || tenGods.includes("偏财")) {
    wealth.push("命局已有财星参与结构，财富主题应重点看收入模式、资源整合和持续经营，而不是单纯追求短期投机。");
  } else {
    wealth.push("原局财星不突出时，更应该依靠专业能力、职业路径和后天运势把财富主题逐步引出来。");
  }

  const dayBranchRelations = relations.filter((item) =>
    item.branches.includes(dayBranch)
  );
  const romance: string[] = [
    `日支为${dayBranch}，原局对宫互动以${dayBranchRelations.length ? dayBranchRelations.map((item) => item.description).join("、") : "未见直接合冲害破或半合"}为据；关系建议结合现实相处细节观察。`,
  ];

  if (tenGods.includes("正财") || tenGods.includes("偏财")) {
    romance.push("财星明显时，现实稳定、责任分配与实际投入容易成为关系中的重要标准。");
  }

  if (tenGods.includes("正官") || tenGods.includes("七杀")) {
    romance.push("官杀明显时，对伴侣的责任感、规则感、执行力或社会角色期待会更加突出。");
  }

  return { personality, career, wealth, romance };
}

export function calculateBazi(
  birthDate: Date,
  birthTime: string,
  gender: Gender
): BaziResult {
  if (Number.isNaN(birthDate.getTime())) {
    throw new Error("出生日期无效。");
  }
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(birthTime)) {
    throw new Error("出生时间必须使用 24 小时制 HH:mm 格式。");
  }
  if (gender !== "男" && gender !== "女") {
    throw new Error("性别选项无效。");
  }

  const year = birthDate.getFullYear();
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();

  const [hourText, minuteText] = birthTime.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);

  const solar = Solar.fromYmdHms(
    year,
    month,
    day,
    hour,
    minute,
    0
  );

  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();

  const yearPillar = eightChar.getYear();
  const monthPillar = eightChar.getMonth();
  const dayPillar = eightChar.getDay();
  const hourPillar = eightChar.getTime();

  const dayMaster = eightChar.getDayGan();
  const dayMasterElement = STEM_ELEMENT[dayMaster];

  const yearDetail = buildPillar(
    "年柱",
    eightChar.getYearGan(),
    eightChar.getYearZhi(),
    dayMaster
  );

  const monthDetail = buildPillar(
    "月柱",
    eightChar.getMonthGan(),
    eightChar.getMonthZhi(),
    dayMaster
  );

  const dayDetail = buildPillar(
    "日柱",
    eightChar.getDayGan(),
    eightChar.getDayZhi(),
    dayMaster
  );

  const hourDetail = buildPillar(
    "时柱",
    eightChar.getTimeGan(),
    eightChar.getTimeZhi(),
    dayMaster
  );

  const pillars = [
    yearDetail,
    monthDetail,
    dayDetail,
    hourDetail,
  ];

  const visibleCounts = visibleElementCount([
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,
  ]);

  const strengthScore = calculateElementStrength(
    pillars,
    dayMasterElement
  );

  const strength = determineStrength(
    strengthScore,
    dayMasterElement
  );

  const relationList = branchRelations([
    eightChar.getYearZhi(),
    eightChar.getMonthZhi(),
    eightChar.getDayZhi(),
    eightChar.getTimeZhi(),
  ]);

  const pattern = determinePattern(monthDetail, dayMaster);

  const usefulResult = usefulAndAvoid(
    strength,
    dayMasterElement
  );

  const tenGodList = [
    yearDetail.stemTenGod,
    monthDetail.stemTenGod,
    dayDetail.stemTenGod,
    hourDetail.stemTenGod,
  ];

  const yun = eightChar.getYun(gender === "男" ? 1 : 0);
  const daYunRaw = yun.getDaYun(11);

  const daYun: DaYunItem[] = daYunRaw
    .filter((item: any) => item.getIndex() > 0)
    .map((item: any) => {
      const ganZhi = item.getGanZhi();
      const gan = ganZhi.slice(0, 1);
      const zhi = ganZhi.slice(1, 2);
      const tenGodValue = tenGod(dayMaster, gan);
      const relations = [
        ["年支", eightChar.getYearZhi()],
        ["月支", eightChar.getMonthZhi()],
        ["日支", eightChar.getDayZhi()],
        ["时支", eightChar.getTimeZhi()],
      ].flatMap(([name, branch]) => {
        const relation = relationBetween(branch, zhi);
        return relation ? [`${name}${branch}与大运${zhi}${relation}`] : [];
      });
      const elementSupport = usefulResult.useful.includes(STEM_ELEMENT[gan]);
      return {
        index: item.getIndex(),
        ganZhi,
        startYear: item.getStartYear(),
        startAge: item.getStartAge(),
        endYear: item.getStartYear() + 9,
        endAge: item.getStartAge() + 9,
        gan,
        zhi,
        tenGod: tenGodValue,
        stemElement: STEM_ELEMENT[gan],
        branchElement: BRANCH_ELEMENT[zhi],
        branchRelations: relations,
        analysis: `${tenGodValue}透干，干支五行为${STEM_ELEMENT[gan]}、${BRANCH_ELEMENT[zhi]}；天干五行${
          elementSupport ? "与命局喜用方向相合" : "与命局喜用方向不同"
        }。${
          relations.length
            ? `与原局地支有${relations.join("、")}。`
            : "与原局地支未见直接六合、六冲、相害或相破。"
        }`,
      };
    });

  const currentYear = new Date().getFullYear();

  const currentSolar = Solar.fromYmdHms(
    currentYear,
    6,
    1,
    12,
    0,
    0
  );

  const currentYearPillar = currentSolar
    .getLunar()
    .getEightChar()
    .getYear();

  const useful = usefulResult.useful;
  const avoid = usefulResult.avoid;
  const natalBranches = [
    ["年支", yearDetail.branch],
    ["月支", monthDetail.branch],
    ["日支", dayDetail.branch],
    ["时支", hourDetail.branch],
  ] as const;
  const annualFortunes: AnnualFortune[] = Array.from(
    { length: 5 },
    (_, index) => currentYear + index
  ).map((fortuneYear) => {
    const fortuneSolar = Solar.fromYmdHms(
      fortuneYear,
      6,
      1,
      12,
      0,
      0
    );
    const fortunePillar = fortuneSolar
      .getLunar()
      .getEightChar()
      .getYear();
    const fortuneStem = fortunePillar.slice(0, 1);
    const fortuneBranch = fortunePillar.slice(1, 2);
    const fortuneTenGod = tenGod(dayMaster, fortuneStem);
    const relations = natalBranches.flatMap(([name, branch]) => {
      const relation = relationBetween(branch, fortuneBranch);
      return relation
        ? [`${name}${branch}与流年${fortuneBranch}${relation}`]
        : [];
    });
    const supportive = useful.includes(STEM_ELEMENT[fortuneStem]);
    const branchElement = BRANCH_ELEMENT[fortuneBranch];
    const themeByTenGod: Record<string, string> = {
      比肩: "同辈协作与自主推进",
      劫财: "资源共享与边界管理",
      食神: "稳定输出与技能积累",
      伤官: "表达创新与规则磨合",
      偏财: "机会拓展与风险控制",
      正财: "务实经营与长期规划",
      七杀: "目标压力与执行突破",
      正官: "责任承担与秩序建立",
      偏印: "探索学习与节奏调整",
      正印: "知识沉淀与支持系统",
    };

    return {
      year: fortuneYear,
      ganZhi: fortunePillar,
      stemTenGod: fortuneTenGod,
      stemElement: STEM_ELEMENT[fortuneStem],
      branchElement,
      branchRelations: relations,
      theme: `${themeByTenGod[fortuneTenGod] ?? "综合调整"}；流年天干五行${
        supportive ? "偏向命局取用方向" : "与命局取用方向存在侧重差异"
      }，地支五行属${branchElement}。${
        relations.length ? `与原局关系：${relations.join("、")}。` : "与原局四支未见直接六合、六冲、相害或相破。"
      }此为传统命理视角的年度主题提示，不代表确定事件。`,
    };
  });

  const luckStartSolar = yun.getStartSolar();
  const luckStartDate = luckStartSolar.toYmd();

  const birthTimestamp = new Date(
    year,
    month - 1,
    day,
    hour,
    minute
  ).getTime();

  const currentDaYun =
    daYun.find(
      (item) =>
        currentYear >= item.startYear &&
        currentYear <= item.endYear
    ) ?? null;

  const interpreted = interpretation({
    dayMaster,
    dayMasterElement,
    strength,
    pattern,
    tenGods: tenGodList,
    relations: relationList,
    dayBranch: dayDetail.branch,
    useful,
    avoid,
  });

  const result: BaziResult = {
    calculationVersion: BAZI_CALCULATION_VERSION,
    birthDate: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    birthTime,
    gender,

    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,

    year: yearDetail,
    month: monthDetail,
    day: dayDetail,
    hour: hourDetail,

    dayMaster,
    dayMasterElement,
    strength,

    fiveElements: visibleCounts,
    elementStrength: strengthScore,

    tenGods: {
      year: yearDetail.stemTenGod,
      month: monthDetail.stemTenGod,
      day: "日主",
      hour: hourDetail.stemTenGod,
    },

    branchRelations: relationList,

    pattern,
    usefulElements: useful,
    avoidElements: avoid,

    lunarDate: lunar.toString(),
    zodiac: SHENGXIAO[eightChar.getYearZhi()],

    yunDirection: yun.isForward() ? "顺行" : "逆行",
    luckStartDate,
    luckStartAge:
      Math.round(
        (new Date(luckStartDate).getTime() - birthTimestamp) /
          (365.2425 * 24 * 60 * 60 * 1000) *
          10
      ) / 10,

    daYun,
    currentDaYun,

    currentYear,
    currentYearGanZhi: currentYearPillar,
    annualFortunes,

    interpretation: interpreted,
  };

  return result;
}