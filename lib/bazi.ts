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
  stemTenGod: string;
  hiddenStems: HiddenStem[];
};

export type BranchRelation = {
  from: string;
  to: string;
  type: string;
  detail: string;
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
  birthDate: string;
  birthTime: string;
  gender: Gender;

  lunarDate: string;
  lunarYear: number;
  lunarMonth: number;
  lunarDay: number;
  lunarMonthName: string;
  lunarDayName: string;

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

  startAge: number;
  startDate: string;
  forward: boolean;

  daYun: DaYunItem[];
  currentDaYun: DaYunItem | null;

  currentYear: {
    year: number;
    ganZhi: string;
  };

  interpretation: string[];
};

const ELEMENTS: Record<string, WuXing> = {
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

const BRANCH_ELEMENTS: Record<string, WuXing> = {
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

const HIDDEN_ROLES = ["主气", "中气", "余气"] as const;

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

const POLARITY: Record<string, "阳" | "阴"> = {
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

function tenGod(dayMaster: string, target: string) {
  if (dayMaster === target) return "比肩";

  const dm = ELEMENTS[dayMaster];
  const tg = ELEMENTS[target];
  const same = POLARITY[dayMaster] === POLARITY[target];

  if (dm === tg) return same ? "比肩" : "劫财";
  if (GENERATES[dm] === tg) return same ? "食神" : "伤官";
  if (CONTROLS[dm] === tg) return same ? "偏财" : "正财";
  if (CONTROLS[tg] === dm) return same ? "七杀" : "正官";
  if (GENERATES[tg] === dm) return same ? "偏印" : "正印";

  return "十神";
}

function getPillarDetail(
  pillar: string,
  dayMaster: string,
  stemTenGod: string
): PillarDetail {
  const stem = pillar[0];
  const branch = pillar[1];
  const hidden = HIDDEN_STEMS[branch] || [];

  return {
    pillar,
    stem,
    branch,
    stemElement: ELEMENTS[stem],
    branchElement: BRANCH_ELEMENTS[branch],
    stemTenGod,
    hiddenStems: hidden.map((s, index) => ({
      stem: s,
      role: HIDDEN_ROLES[index] || "余气",
      element: ELEMENTS[s],
      tenGod: tenGod(dayMaster, s),
    })),
  };
}

function relationType(a: string, b: string): string | null {
  const pair = `${a}${b}`;

  const he = new Set([
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

  const chong = new Set([
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

  const hai = new Set([
    "子未",
    "未子",
    "丑午",
    "午丑",
    "寅巳",
    "巳寅",
    "卯辰",
    "辰卯",
    "申亥",
    "亥申",
    "酉戌",
    "戌酉",
  ]);

  const po = new Set([
    "子酉",
    "酉子",
    "寅亥",
    "亥寅",
    "卯午",
    "午卯",
    "辰丑",
    "丑辰",
    "巳申",
    "申巳",
    "未戌",
    "戌未",
  ]);

  if (he.has(pair)) return "六合";
  if (chong.has(pair)) return "相冲";
  if (hai.has(pair)) return "相害";
  if (po.has(pair)) return "相破";

  return null;
}

function getBranchRelations(branches: string[]): BranchRelation[] {
  const result: BranchRelation[] = [];

  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      const a = branches[i];
      const b = branches[j];
      const type = relationType(a, b);

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

  const combos = [
    ["申", "子", "辰"],
    ["亥", "卯", "未"],
    ["寅", "午", "戌"],
    ["巳", "酉", "丑"],
  ];

  for (const combo of combos) {
    const found = combo.filter((x) => branches.includes(x));

    if (found.length === 3) {
      result.push({
        from: found.join(""),
        to: "",
        type: "三合",
        detail: `${found.join("")}三合`,
      });
    } else if (found.length === 2) {
      result.push({
        from: found.join(""),
        to: "",
        type: "半合",
        detail: `${found.join("")}半合`,
      });
    }
  }

  return result;
}

function calculateStrength(
  dayMaster: string,
  monthBranch: string,
  five: Record<WuXing, number>
): Strength {
  const dm = ELEMENTS[dayMaster];

  let score = five[dm] * 1.0;

  if (BRANCH_ELEMENTS[monthBranch] === dm) score += 2.5;
  if (BRANCH_ELEMENTS[monthBranch] === SUPPORTS[dm]) score += 1.5;

  score += five[SUPPORTS[dm]] * 0.5;
  score -= five[GENERATES[dm]] * 0.2;
  score -= five[CONTROLS[dm]] * 0.2;

  return score >= 4 ? "身强" : "身弱";
}

function determinePattern(monthBranch: string, dayMaster: string): string {
  const mainQi = HIDDEN_STEMS[monthBranch]?.[0];

  if (!mainQi) return "普通格";

  const god = tenGod(dayMaster, mainQi);

  const map: Record<string, string> = {
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

  return map[god] || "普通格";
}

function currentYearPillar(year: number): string {
  const gan = "甲乙丙丁戊己庚辛壬癸";
  const zhi = "子丑寅卯辰巳午未申酉戌亥";

  const index = ((year - 4) % 60 + 60) % 60;

  return gan[index % 10] + zhi[index % 12];
}

function buildInterpretation(
  dayMaster: string,
  element: WuXing,
  strength: Strength,
  pattern: string,
  five: Record<WuXing, number>,
  useful: WuXing[],
  avoid: WuXing[],
  relations: BranchRelation[],
  tenGods: string[],
  monthPillar: string,
  yearPillar: string,
  dayPillar: string,
  hourPillar: string,
  currentDaYun: DaYunItem | null,
  currentYear: { year: number; ganZhi: string }
): string[] {
  const maxElement = (Object.entries(five) as [WuXing, number][])
    .sort((a, b) => b[1] - a[1])[0]?.[0] || element;

  const relationText =
    relations.length > 0
      ? relations.map((x) => x.detail).join("、")
      : "四柱之间未见当前定义的明显合冲害破";

  const godSet = Array.from(new Set(tenGods));

  const result: string[] = [];

  result.push(
    `一、日主与月令：日主为${dayMaster}木，生于${monthPillar}月令。当前命局判定为${strength}，因此分析重点首先放在日主是否得令、得地、得生扶，而不是单凭生肖或单个天干判断。`
  );

  result.push(
    `二、五行气势：当前五行统计为木${five.木}、火${five.火}、土${five.土}、金${five.金}、水${five.水}。其中${maxElement}的显性数量最高，说明命局的主要气势集中在${maxElement}。但五行数量只是基础统计，实际判断仍需要结合月令、藏干以及生克制化。`
  );

  result.push(
    `三、格局结构：月令${monthPillar}的月支参与取格，当前基础格局判定为${pattern}。四柱分别为${yearPillar}、${monthPillar}、${dayPillar}、${hourPillar}，天干十神出现${godSet.join("、")}等结构，因此不能把命局简单归结成单一性格标签。`
  );

  result.push(
    `四、喜用方向：按照当前身强身弱的基础模型，优先考虑${useful.join("、")}方向进行泄耗、制化或辅助；相对需要控制的是${avoid.join("、")}。这属于基础取用判断，正式高级报告还应进一步加入调候、透干、根气和大运作用。`
  );

  result.push(
    `五、地支关系：当前四柱检测到${relationText}。这些关系是命局内部的结构变化点，应结合对应地支所处的年、月、日、时位置解释，而不能单独把“合”定义为吉、“冲”定义为凶。`
  );

  if (currentDaYun) {
    result.push(
      `六、当前阶段：目前处于${currentDaYun.pillar}大运，大致覆盖${currentDaYun.startYear}年至${currentDaYun.endYear}年，起运约${currentDaYun.startAge}岁。当前流年为${currentYear.year}年${currentYear.ganZhi}，因此现实阶段的分析应以“大运为主、流年为辅”，观察其与原局五行及十神之间的作用。`
    );
  } else {
    result.push(
      `六、当前阶段：当前流年为${currentYear.year}年${currentYear.ganZhi}，但本次出生资料尚未取得有效的大运阶段，因此不能假装生成大运结论。`
    );
  }

  return result;
}

export function calculateBazi(
  birthDate: Date,
  birthTime: string,
  gender: Gender
): BaziResult {
  const year = birthDate.getFullYear();
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();

  const [hourString, minuteString] = birthTime.split(":");
  const hour = Number(hourString || 0);
  const minute = Number(minuteString || 0);

  const solar = Solar.fromYmdHms(
    year,
    month,
    day,
    hour,
    minute,
    0
  );

  const lunar = solar.getLunar();
  const eight = lunar.getEightChar();

  eight.setSect(1);

  const yearPillar = eight.getYear();
  const monthPillar = eight.getMonth();
  const dayPillar = eight.getDay();
  const hourPillar = eight.getTime();

  const dayMaster = eight.getDayGan();
  const dayMasterElement = ELEMENTS[dayMaster];

  const pillars = [
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,
  ];

  const fiveElements: Record<WuXing, number> = {
    木: 0,
    火: 0,
    土: 0,
    金: 0,
    水: 0,
  };

  for (const pillar of pillars) {
    fiveElements[ELEMENTS[pillar[0]]]++;
    fiveElements[BRANCH_ELEMENTS[pillar[1]]]++;
  }

  const strength = calculateStrength(
    dayMaster,
    monthPillar[1],
    fiveElements
  );

  const yearGod = eight.getYearShiShenGan();
  const monthGod = eight.getMonthShiShenGan();
  const dayGod = eight.getDayShiShenGan();
  const hourGod = eight.getTimeShiShenGan();

  const yearDetail = getPillarDetail(
    yearPillar,
    dayMaster,
    yearGod
  );

  const monthDetail = getPillarDetail(
    monthPillar,
    dayMaster,
    monthGod
  );

  const dayDetail = getPillarDetail(
    dayPillar,
    dayMaster,
    dayGod
  );

  const hourDetail = getPillarDetail(
    hourPillar,
    dayMaster,
    hourGod
  );

  const branchRelations = getBranchRelations(
    pillars.map((x) => x[1])
  );

  const pattern = determinePattern(
    monthPillar[1],
    dayMaster
  );

  const usefulElements: WuXing[] =
    strength === "身强"
      ? [GENERATES[dayMasterElement], CONTROLS[dayMasterElement]]
      : [dayMasterElement, SUPPORTS[dayMasterElement]];

  const avoidElements: WuXing[] =
    strength === "身强"
      ? [dayMasterElement, SUPPORTS[dayMasterElement]]
      : [GENERATES[dayMasterElement], CONTROLS[dayMasterElement]];

  const yun = eight.getYun(gender === "男" ? 1 : 0, 1);
  const rawDaYun = yun.getDaYun();

  const startDate = yun.getStartSolar().toYmd();

  const startAge = Number(yun.getStartYear());

  const forward = Boolean(
    (yun as unknown as { isForward?: () => boolean }).isForward?.()
  );

  const daYun: DaYunItem[] = rawDaYun
    .slice(1)
    .map((item: any, index: number) => {
      const itemStartYear = Number(item.getStartYear());
      const itemStartAge = Number(item.getStartAge());

      return {
        index: index + 1,
        pillar: String(item.getGanZhi()),
        startYear: itemStartYear,
        endYear: itemStartYear + 9,
        startAge: itemStartAge,
        endAge: itemStartAge + 9,
        isCurrent: false,
      };
    });

  const currentYear = new Date().getFullYear();

  const currentDaYun =
    daYun.find(
      (item) =>
        item.startYear <= currentYear &&
        currentYear <= item.endYear
    ) || null;

  if (currentDaYun) {
    currentDaYun.isCurrent = true;
  }

  const interpretation = buildInterpretation(
    dayMaster,
    dayMasterElement,
    strength,
    pattern,
    fiveElements,
    usefulElements,
    avoidElements,
    branchRelations,
    [yearGod, monthGod, dayGod, hourGod],
    monthPillar,
    yearPillar,
    dayPillar,
    hourPillar,
    currentDaYun,
    {
      year: currentYear,
      ganZhi: currentYearPillar(currentYear),
    }
  );

  const lunarDate =
    `${lunar.getYearInChinese()}年` +
    `${lunar.getMonthInChinese()}` +
    `${lunar.getDayInChinese()}`;

  return {
    birthDate:
      `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,

    birthTime:
      `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,

    gender,

    lunarDate,
    lunarYear: lunar.getYear(),
    lunarMonth: lunar.getMonth(),
    lunarDay: lunar.getDay(),
    lunarMonthName: lunar.getMonthInChinese(),
    lunarDayName: lunar.getDayInChinese(),

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

    tenGods: {
      year: yearGod,
      month: monthGod,
      day: dayGod,
      hour: hourGod,
    },

    branchRelations,

    pattern,
    usefulElements,
    avoidElements,

    startAge,
    startDate,
    forward,

    daYun,
    currentDaYun,

    currentYear: {
      year: currentYear,
      ganZhi: currentYearPillar(currentYear),
    },

    interpretation,
  };
}