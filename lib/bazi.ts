import { Solar } from "lunar-typescript";

export type Gender = "男" | "女";
export type Strength = "身强" | "身弱";
export type WuXing = "木" | "火" | "土" | "金" | "水";

export type HiddenStem = {
  stem: string;
  role: "主气" | "中气" | "余气";
  element: WuXing;
  tenGod: string;
};

export type PillarDetail = {
  pillar: string;
  stem: string;
  branch: string;
  stemElement: WuXing;
  branchElement: WuXing;
  hiddenStems: HiddenStem[];
};

export type BranchRelation = {
  type: string;
  from: string;
  to: string;
  detail: string;
};

export type DaYunItem = {
  startAge: number;
  startYear: number;
  ganZhi: string;
  gan: string;
  zhi: string;
};

export type BaziResult = {
  birthDate: string;
  birthTime: string;
  gender: Gender;

  yearPillar: string;
  monthPillar: string;
  dayPillar: string;
  hourPillar: string;

  dayMaster: string;
  dayMasterElement: WuXing;
  strength: Strength;

  fiveElements: Record<WuXing, number>;

  yearDetail: PillarDetail;
  monthDetail: PillarDetail;
  dayDetail: PillarDetail;
  hourDetail: PillarDetail;

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

  daYun: DaYunItem[];
  currentDaYun: DaYunItem | null;
  currentYear: {
    year: number;
    ganZhi: string;
  };

  interpretation: string[];
};

const STEM_ELEMENT: Record<string, WuXing> = {
  甲: "木", 乙: "木",
  丙: "火", 丁: "火",
  戊: "土", 己: "土",
  庚: "金", 辛: "金",
  壬: "水", 癸: "水",
};

const STEM_YINYANG: Record<string, "阳" | "阴"> = {
  甲: "阳", 乙: "阴",
  丙: "阳", 丁: "阴",
  戊: "阳", 己: "阴",
  庚: "阳", 辛: "阴",
  壬: "阳", 癸: "阴",
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

const HIDDEN_ROLES: Record<string, ("主气" | "中气" | "余气")[]> = {
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

function tenGod(dayMaster: string, target: string) {
  const dm = STEM_ELEMENT[dayMaster];
  const tg = STEM_ELEMENT[target];

  const samePolarity =
    STEM_YINYANG[dayMaster] === STEM_YINYANG[target];

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
  pillar: string,
  dayMaster: string
): PillarDetail {
  const stem = pillar[0];
  const branch = pillar[1];

  const hidden = HIDDEN_STEMS[branch] || [];
  const roles = HIDDEN_ROLES[branch] || [];

  return {
    pillar,
    stem,
    branch,
    stemElement: STEM_ELEMENT[stem],
    branchElement: BRANCH_ELEMENT[branch],
    hiddenStems: hidden.map((s, i) => ({
      stem: s,
      role: roles[i] || "余气",
      element: STEM_ELEMENT[s],
      tenGod: tenGod(dayMaster, s),
    })),
  };
}

function visibleElementCount(
  pillars: string[]
): Record<WuXing, number> {
  const result: Record<WuXing, number> = {
    木: 0,
    火: 0,
    土: 0,
    金: 0,
    水: 0,
  };

  for (const pillar of pillars) {
    const stem = pillar[0];
    const branch = pillar[1];

    result[STEM_ELEMENT[stem]] += 1;
    result[BRANCH_ELEMENT[branch]] += 1;
  }

  return result;
}

function weightedElementStrength(
  details: PillarDetail[],
  monthBranch: string
) {
  const score: Record<WuXing, number> = {
    木: 0,
    火: 0,
    土: 0,
    金: 0,
    水: 0,
  };

  for (const detail of details) {
    score[detail.stemElement] += 1;
    score[detail.branchElement] += 1;

    for (const hidden of detail.hiddenStems) {
      if (hidden.role === "主气") {
        score[hidden.element] += 2;
      } else if (hidden.role === "中气") {
        score[hidden.element] += 1;
      } else {
        score[hidden.element] += 0.5;
      }
    }
  }

  score[BRANCH_ELEMENT[monthBranch]] += 2;

  return score;
}

function determineStrength(
  dayMasterElement: WuXing,
  score: Record<WuXing, number>
): Strength {
  const support =
    score[dayMasterElement] +
    score[SUPPORTS[dayMasterElement]] * 0.7;

  const total =
    Object.values(score).reduce((a, b) => a + b, 0);

  return support / total >= 0.46 ? "身强" : "身弱";
}

function relationBetween(
  a: string,
  b: string
): BranchRelation | null {
  const pair = [a, b].sort().join("");

  const liuHe: Record<string, string> = {
    丑子: "子丑六合",
    亥寅: "寅亥六合",
    戌卯: "卯戌六合",
    酉辰: "辰酉六合",
    申巳: "巳申六合",
    午未: "午未六合",
  };

  const liuChong: Record<string, string> = {
    午子: "子午相冲",
    未丑: "丑未相冲",
    申寅: "寅申相冲",
    酉卯: "卯酉相冲",
    辰戌: "辰戌相冲",
    亥巳: "巳亥相冲",
  };

  const liuHai: Record<string, string> = {
    子未: "子未相害",
    丑午: "丑午相害",
    寅巳: "寅巳相害",
    卯辰: "卯辰相害",
    申亥: "申亥相害",
    酉戌: "酉戌相害",
  };

  const liuPo: Record<string, string> = {
    子酉: "子酉相破",
    丑辰: "丑辰相破",
    寅亥: "寅亥相破",
    卯午: "卯午相破",
    申巳: "巳申相破",
    未戌: "未戌相破",
  };

  if (liuHe[pair]) {
    return {
      type: "六合",
      from: a,
      to: b,
      detail: liuHe[pair],
    };
  }

  if (liuChong[pair]) {
    return {
      type: "相冲",
      from: a,
      to: b,
      detail: liuChong[pair],
    };
  }

  if (liuHai[pair]) {
    return {
      type: "相害",
      from: a,
      to: b,
      detail: liuHai[pair],
    };
  }

  if (liuPo[pair]) {
    return {
      type: "相破",
      from: a,
      to: b,
      detail: liuPo[pair],
    };
  }

  return null;
}

function branchRelations(branches: string[]): BranchRelation[] {
  const result: BranchRelation[] = [];

  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      const relation = relationBetween(branches[i], branches[j]);

      if (relation) {
        result.push(relation);
      }
    }
  }

  const combinations = [
    ["申", "子", "辰"],
    ["亥", "卯", "未"],
    ["寅", "午", "戌"],
    ["巳", "酉", "丑"],
  ];

  for (const combo of combinations) {
    const present = combo.filter((b) => branches.includes(b));

    if (present.length === 3) {
      result.push({
        type: "三合",
        from: present[0],
        to: present[1],
        detail: `${present.join("")}三合`,
      });
    } else if (present.length === 2) {
      result.push({
        type: "半合",
        from: present[0],
        to: present[1],
        detail: `${present.join("")}半合`,
      });
    }
  }

  return result;
}

function determinePattern(
  monthDetail: PillarDetail
): string {
  const mainHidden = monthDetail.hiddenStems[0];

  if (!mainHidden) {
    return "月令格局";
  }

  return `${mainHidden.tenGod}格`;
}

function usefulAndAvoid(
  dayMasterElement: WuXing,
  strength: Strength
): {
  usefulElements: WuXing[];
  avoidElements: WuXing[];
} {
  const generated = GENERATES[dayMasterElement];
  const controlled = CONTROLS[dayMasterElement];
  const supported = SUPPORTS[dayMasterElement];

  if (strength === "身弱") {
    return {
      usefulElements: [dayMasterElement, supported],
      avoidElements: [generated, controlled],
    };
  }

  return {
    usefulElements: [generated, controlled],
    avoidElements: [dayMasterElement, supported],
  };
}

function currentYearPillar(year: number) {
  const gan = [
    "甲", "乙", "丙", "丁", "戊",
    "己", "庚", "辛", "壬", "癸",
  ];

  const zhi = [
    "子", "丑", "寅", "卯", "辰", "巳",
    "午", "未", "申", "酉", "戌", "亥",
  ];

  return (
    gan[(year - 4) % 10] +
    zhi[(year - 4) % 12]
  );
}

function buildInterpretation(
  dayMaster: string,
  dayMasterElement: WuXing,
  strength: Strength,
  pattern: string,
  useful: WuXing[],
  avoid: WuXing[],
  relations: BranchRelation[],
  tenGods: string[]
): string[] {
  const result: string[] = [];

  result.push(
    `日主为${dayMaster}${dayMasterElement}，当前判定为${strength}。`
  );

  result.push(
    `月令形成${pattern}，因此分析重点不是泛泛谈性格，而是结合日主强弱与月令结构判断。`
  );

  result.push(
    `当前取用方向偏向${useful.join("、")}，需要控制的五行方向为${avoid.join("、")}。`
  );

  const importantGods = tenGods.filter(
    (x) => x !== "日主"
  );

  if (importantGods.length) {
    result.push(
      `天干十神结构出现${importantGods.join("、")}，对应现实层面主要落在资源、输出、财富、规则与竞争等主题。`
    );
  }

  if (relations.length) {
    result.push(
      `地支实际检测到：${relations
        .map((r) => r.detail)
        .join("、")}。这些关系属于命盘内部真实结构。`
    );
  } else {
    result.push(
      "四支之间未检测到六合、六冲、三合、半合、相害或相破。"
    );
  }

  return result;
}

export function calculateBazi(
  birthDate: Date,
  birthTime: string,
  gender: Gender
): BaziResult {
  const [hourString, minuteString] = birthTime.split(":");
  const hour = Number(hourString);
  const minute = Number(minuteString || 0);

  const solar = Solar.fromYmdHms(
    birthDate.getFullYear(),
    birthDate.getMonth() + 1,
    birthDate.getDate(),
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

  const yearDetail = buildPillar(yearPillar, dayMaster);
  const monthDetail = buildPillar(monthPillar, dayMaster);
  const dayDetail = buildPillar(dayPillar, dayMaster);
  const hourDetail = buildPillar(hourPillar, dayMaster);

  const details = [
    yearDetail,
    monthDetail,
    dayDetail,
    hourDetail,
  ];

  const fiveElements = visibleElementCount([
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,
  ]);

  const strengthScore = weightedElementStrength(
    details,
    monthPillar[1]
  );

  const strength = determineStrength(
    dayMasterElement,
    strengthScore
  );

  const tenGods = {
    year: tenGod(dayMaster, yearPillar[0]),
    month: tenGod(dayMaster, monthPillar[0]),
    day: "日主",
    hour: tenGod(dayMaster, hourPillar[0]),
  };

  const branches = [
    yearPillar[1],
    monthPillar[1],
    dayPillar[1],
    hourPillar[1],
  ];

  const relations = branchRelations(branches);

  const pattern = determinePattern(monthDetail);

  const { usefulElements, avoidElements } =
    usefulAndAvoid(dayMasterElement, strength);

  const currentYear = new Date().getFullYear();

  let daYun: DaYunItem[] = [];

  try {
    const yun = eightChar.getYun(gender === "男" ? 1 : 0);
    const raw = yun.getDaYun() || [];

    daYun = raw
      .slice(1)
      .map((item: any) => ({
        startAge: Number(item.getStartAge()),
        startYear: Number(item.getStartYear()),
        ganZhi: item.getGanZhi(),
        gan: item.getGan(),
        zhi: item.getZhi(),
      }))
      .filter((item: DaYunItem) =>
        Number.isFinite(item.startYear)
      );
  } catch {
    daYun = [];
  }

  const currentDaYun =
    daYun
      .filter((item) => item.startYear <= currentYear)
      .sort((a, b) => b.startYear - a.startYear)[0] || null;

  const interpretation = buildInterpretation(
    dayMaster,
    dayMasterElement,
    strength,
    pattern,
    usefulElements,
    avoidElements,
    relations,
    Object.values(tenGods)
  );

  return {
    birthDate: `${birthDate.getFullYear()}-${String(
      birthDate.getMonth() + 1
    ).padStart(2, "0")}-${String(
      birthDate.getDate()
    ).padStart(2, "0")}`,

    birthTime,
    gender,

    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,

    dayMaster,
    dayMasterElement,
    strength,

    fiveElements,

    yearDetail,
    monthDetail,
    dayDetail,
    hourDetail,

    tenGods,

    branchRelations: relations,

    pattern,
    usefulElements,
    avoidElements,

    daYun,
    currentDaYun,

    currentYear: {
      year: currentYear,
      ganZhi: currentYearPillar(currentYear),
    },

    interpretation,
  };
}