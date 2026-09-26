import {
  BaziResult,
  getBranchRelation,
  type PillarDetail,
  type WuXing,
} from "@/lib/bazi";
import type { BirthDetails } from "@/lib/birth";

export type CompatibilityFactor = {
  title: string;
  description: string;
};

export type CompatibilityResult = {
  firstName: string;
  secondName: string;
  score: number;
  summary: string;
  factors: CompatibilityFactor[];
  firstBirthDetails: BirthDetails;
  secondBirthDetails: BirthDetails;
  firstChart: CompatibilityChart;
  secondChart: CompatibilityChart;
  calculatedAt: string;
};

export type CompatibilityChart = {
  yearPillar: string;
  monthPillar: string;
  dayPillar: string;
  hourPillar: string;
  dayMaster: string;
  dayMasterElement: WuXing;
  strength: BaziResult["strength"];
  pillars: PillarDetail[];
  usefulElements: WuXing[];
  avoidElements: WuXing[];
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

export function calculateCompatibility(
  first: BaziResult,
  second: BaziResult,
  firstBirthDetails: BirthDetails,
  secondBirthDetails: BirthDetails
): CompatibilityResult {
  let score = 50;
  const factors: CompatibilityFactor[] = [];
  const firstElement = first.dayMasterElement;
  const secondElement = second.dayMasterElement;

  if (firstElement === secondElement) {
    score += 10;
    factors.push({
      title: "日主五行相同",
      description: `${firstElement}与${secondElement}同气，彼此较容易理解相似的表达方式，也要留意共同的盲点。`,
    });
  } else if (
    GENERATES[firstElement] === secondElement ||
    GENERATES[secondElement] === firstElement
  ) {
    score += 15;
    factors.push({
      title: "日主五行相生",
      description: `${firstElement}与${secondElement}形成相生关系，互动上较容易出现支持与互补。`,
    });
  } else if (
    CONTROLS[firstElement] === secondElement ||
    CONTROLS[secondElement] === firstElement
  ) {
    score -= 5;
    factors.push({
      title: "日主五行相制",
      description: `${firstElement}与${secondElement}形成相制关系，分歧时需要主动沟通边界与决策方式。`,
    });
  } else {
    score += 3;
    factors.push({
      title: "日主五行各有侧重",
      description: `${firstElement}与${secondElement}的五行关系较为间接，适合通过共同目标建立默契。`,
    });
  }

  const firstBranches = [
    ["年支", first.year.branch],
    ["月支", first.month.branch],
    ["日支", first.day.branch],
    ["时支", first.hour.branch],
  ] as const;
  const secondBranches = [
    ["年支", second.year.branch],
    ["月支", second.month.branch],
    ["日支", second.day.branch],
    ["时支", second.hour.branch],
  ] as const;
  const branchRelations = firstBranches.flatMap(([firstPillar, firstBranch]) =>
    secondBranches.flatMap(([secondPillar, secondBranch]) => {
      const relation = getBranchRelation(firstBranch, secondBranch);
      return relation
        ? [`甲方${firstPillar}${firstBranch}与乙方${secondPillar}${secondBranch}${relation}`]
        : [];
    })
  );
  const dayBranchesSame = first.day.branch === second.day.branch;
  const dayBranchRelation = getBranchRelation(
    first.day.branch,
    second.day.branch
  );
  if (dayBranchesSame) score += 5;
  if (dayBranchRelation === "六合") score += 10;
  if (dayBranchRelation === "相冲" || dayBranchRelation === "相害") score -= 8;
  factors.push({
    title: "地支互动",
    description: `${first.dayPillar}与${second.dayPillar}为双方日柱。${
      dayBranchesSame
        ? `日支同为${first.day.branch}，生活节奏可能相似。`
        : dayBranchRelation
          ? `双方日支${first.day.branch}、${second.day.branch}呈${dayBranchRelation}。`
          : "双方日支没有直接六合、六冲、相害或相破。"
    }${
      branchRelations.length
        ? `其他柱位互动：${branchRelations.slice(0, 3).join("、")}。`
        : ""
    }`,
  });

  const firstUseful = first.usefulElements.filter((element) =>
    second.usefulElements.includes(element)
  );
  const sharedUseful = firstUseful.length > 0;
  if (sharedUseful) score += Math.min(firstUseful.length * 4, 8);
  factors.push({
    title: "发展侧重点",
    description: `${firstBirthDetails.name}喜用${first.usefulElements.join("、")}、忌用${first.avoidElements.join("、")}；${secondBirthDetails.name}喜用${second.usefulElements.join("、")}、忌用${second.avoidElements.join("、")}。${
      sharedUseful
        ? `双方喜用方向重合于${firstUseful.join("、")}，可结合现实目标互相支持。`
        : "双方取用方向不同，宜尊重彼此的节奏与个人目标。"
    }`,
  });

  score = Math.max(25, Math.min(95, score));
  const summary =
    score >= 78
      ? "传统命理视角下，双方有较多互补或呼应之处；稳定关系仍需依靠真实沟通与共同经营。"
      : score >= 62
        ? "双方存在可发展的互补空间，也需要在节奏和期待上持续磨合；命理结果不决定关系走向。"
        : "命盘呈现出较多差异，建议把差异转化为可沟通的具体议题，而非据此判断关系成败。";

  return {
    firstName: firstBirthDetails.name.trim(),
    secondName: secondBirthDetails.name.trim(),
    score,
    summary,
    factors,
    firstBirthDetails,
    secondBirthDetails,
    firstChart: toCompatibilityChart(first),
    secondChart: toCompatibilityChart(second),
    calculatedAt: new Date().toISOString(),
  };
}

function toCompatibilityChart(result: BaziResult): CompatibilityChart {
  return {
    yearPillar: result.yearPillar,
    monthPillar: result.monthPillar,
    dayPillar: result.dayPillar,
    hourPillar: result.hourPillar,
    dayMaster: result.dayMaster,
    dayMasterElement: result.dayMasterElement,
    strength: result.strength,
    pillars: [result.year, result.month, result.day, result.hour],
    usefulElements: result.usefulElements,
    avoidElements: result.avoidElements,
  };
}
