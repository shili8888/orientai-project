export type Gender = "男" | "女";
export type Strength = "身强" | "身弱";
export type WuXing = "木" | "火" | "土" | "金" | "水";

export type BaziResult = {
  yearPillar: string;
  monthPillar: string;
  dayPillar: string;
  hourPillar: string;
  dayMaster: string;
  dayMasterElement: WuXing;
  strength: Strength;
  fiveElements: Record<WuXing, number>;
  zodiac?: string;
};

const stems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

const stemElement: Record<string, WuXing> = {
  甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土",
  己: "土", 庚: "金", 辛: "金", 壬: "水", 癸: "水",
};

const branchElement: Record<string, WuXing> = {
  子: "水", 丑: "土", 寅: "木", 卯: "木", 辰: "土", 巳: "火",
  午: "火", 未: "土", 申: "金", 酉: "金", 戌: "土", 亥: "水",
};

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

/**
 * 年柱：
 * 八字以立春为岁首。这里采用 2 月 4 日作为简化立春边界；
 * 页面没有精确到节气时刻时，这比直接按公历 1 月 1 日切换更合理。
 */
function getBaziYear(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return month < 2 || (month === 2 && day < 4) ? year - 1 : year;
}

function getYearPillar(year: number) {
  const index = mod(year - 4, 60);
  return stems[index % 10] + branches[index % 12];
}

/**
 * 月支按八字节气月：
 * 寅月约从立春开始，卯月约从惊蛰开始……子月约从大雪开始。
 * 当前页面没有节气时刻参数，因此按公历月做稳定边界近似：
 * 1月=丑，2月=寅，3月=卯，……11月=亥，12月=子。
 */
function getMonthPillar(year: number, month: number) {
  const branchIndex = mod(month, 12);

  // 五虎遁：甲己年丙寅起；乙庚年戊寅起；
  // 丙辛年庚寅起；丁壬年壬寅起；戊癸年甲寅起。
  const yearStemIndex = mod(year - 4, 10);
  const startStem = [2, 4, 6, 8, 0][yearStemIndex % 5];

  // branchIndex=2 是寅月；寅月的天干为 startStem。
  const monthOffset = mod(branchIndex - 2, 12);
  const stemIndex = mod(startStem + monthOffset, 10);

  return stems[stemIndex] + branches[branchIndex];
}

/**
 * 以 2000-01-07 = 甲子日为基准。
 * 这个基准用于标准干支日序列，保证日期连续推进。
 */
function getDayPillar(date: Date) {
  const base = new Date(2000, 0, 7);
  const current = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const diff = Math.round(
    (current.getTime() - base.getTime()) / 86400000
  );

  const index = mod(diff, 60);
  return stems[index % 10] + branches[index % 12];
}

function getHourBranch(hour: string) {
  const known: Record<string, string> = {
    子: "子", 丑: "丑", 寅: "寅", 卯: "卯",
    辰: "辰", 巳: "巳", 午: "午", 未: "未",
    申: "申", 酉: "酉", 戌: "戌", 亥: "亥",
  };

  if (known[hour]) return hour;

  const match = String(hour).match(/^\s*(\d{1,2})/);
  const h = match ? Number(match[1]) : 12;

  // 子时：23:00-00:59；丑时：01:00-02:59……
  const index = Math.floor(((h + 1) % 24) / 2);
  return branches[index];
}

function getHourPillar(dayStem: string, hour: string) {
  const branch = getHourBranch(hour);
  const branchIndex = branches.indexOf(branch);
  const dayStemIndex = stems.indexOf(dayStem);

  // 五鼠遁：甲己日起甲子；乙庚日起丙子；
  // 丙辛日起戊子；丁壬日起庚子；戊癸日起壬子。
  const startStem = [0, 2, 4, 6, 8][dayStemIndex % 5];
  const stemIndex = mod(startStem + branchIndex, 10);

  return stems[stemIndex] + branch;
}

export function calculateBazi(
  birthDate: Date,
  birthTime: string,
  gender: Gender
): BaziResult {
  void gender;

  const date = new Date(birthDate);

  // 子初 23:00 属于次日，八字日柱随之换日。
  const timeText = String(birthTime);
  if (
    timeText === "子" ||
    timeText === "23:00" ||
    timeText.startsWith("23:")
  ) {
    date.setDate(date.getDate() + 1);
  }

  const baziYear = getBaziYear(date);
  const month = date.getMonth() + 1;

  const yearPillar = getYearPillar(baziYear);
  const monthPillar = getMonthPillar(baziYear, month);
  const dayPillar = getDayPillar(date);
  const dayMaster = dayPillar.charAt(0);
  const hourPillar = getHourPillar(dayMaster, timeText);

  const fiveElements: Record<WuXing, number> = {
    木: 0,
    火: 0,
    土: 0,
    金: 0,
    水: 0,
  };

  [yearPillar, monthPillar, dayPillar, hourPillar].forEach((pillar) => {
    const stem = pillar.charAt(0);
    const branch = pillar.charAt(1);

    if (stemElement[stem]) {
      fiveElements[stemElement[stem]]++;
    }

    if (branchElement[branch]) {
      fiveElements[branchElement[branch]]++;
    }
  });

  const dayMasterElement = stemElement[dayMaster];
  const sameElement = fiveElements[dayMasterElement];

  const total = Object.values(fiveElements).reduce(
    (sum, value) => sum + value,
    0
  );

  const ratio = total > 0 ? sameElement / total : 0;
  const strength: Strength = ratio >= 0.5 ? "身强" : "身弱";

  const zodiac = branches[mod(baziYear - 4, 12)];

  return {
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,
    dayMaster,
    dayMasterElement,
    strength,
    fiveElements,
    zodiac,
  };
}
