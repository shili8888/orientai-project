"use client";

import { useMemo, useState } from "react";
import { getCascaderDataWithCode } from "cn-division";
import { calculateBazi } from "../../lib/bazi";

type CalendarType = "solar" | "lunar";
type Gender = "男" | "女";
type TimeType = "exact" | "shi" | "unknown";

const years = Array.from(
  { length: 121 },
  (_, i) => 2025 - i
);

const months = Array.from(
  { length: 12 },
  (_, i) => i + 1
);

const lunarMonthNames = [
  "正月",
  "二月",
  "三月",
  "四月",
  "五月",
  "六月",
  "七月",
  "八月",
  "九月",
  "十月",
  "冬月",
  "腊月",
];

const lunarDayNames = [
  "初一",
  "初二",
  "初三",
  "初四",
  "初五",
  "初六",
  "初七",
  "初八",
  "初九",
  "初十",
  "十一",
  "十二",
  "十三",
  "十四",
  "十五",
  "十六",
  "十七",
  "十八",
  "十九",
  "二十",
  "廿一",
  "廿二",
  "廿三",
  "廿四",
  "廿五",
  "廿六",
  "廿七",
  "廿八",
  "廿九",
  "三十",
];

const shiChenList = [
  ["子", "23:00–01:00"],
  ["丑", "01:00–03:00"],
  ["寅", "03:00–05:00"],
  ["卯", "05:00–07:00"],
  ["辰", "07:00–09:00"],
  ["巳", "09:00–11:00"],
  ["午", "11:00–13:00"],
  ["未", "13:00–15:00"],
  ["申", "15:00–17:00"],
  ["酉", "17:00–19:00"],
  ["戌", "19:00–21:00"],
  ["亥", "21:00–23:00"],
];

function getSolarDays(
  year: number,
  month: number
) {
  return new Date(
    year,
    month,
    0
  ).getDate();
}

/* =========================================================
   出生资料类型
   ========================================================= */

type PersonForm = {
  name: string;
  gender: Gender;

  calendar: CalendarType;

  solarYear: number;
  solarMonth: number;
  solarDay: number;

  lunarYear: number;
  lunarMonth: number;
  lunarDay: number;

  timeType: TimeType;

  birthHour: number;
  birthMinute: number;

  shiChen: string;

  provinceCode: string;
  cityCode: string;
  countyCode: string;
};

/* =========================================================
   默认资料
   ========================================================= */

function createPerson(): PersonForm {
  return {
    name: "",

    gender: "男",

    calendar: "solar",

    solarYear: 2000,
    solarMonth: 1,
    solarDay: 1,

    lunarYear: 2000,
    lunarMonth: 1,
    lunarDay: 1,

    timeType: "exact",

    birthHour: 12,
    birthMinute: 0,

    shiChen: "午",

    provinceCode: "",
    cityCode: "",
    countyCode: "",
  };
}

/* =========================================================
   日期选择组件
   ========================================================= */

function BirthDateSelector({
  person,
  onChange,
}: {
  person: PersonForm;
  onChange: (
    patch: Partial<PersonForm>
  ) => void;
}) {
  const solarDays = useMemo(
    () =>
      getSolarDays(
        person.solarYear,
        person.solarMonth
      ),
    [
      person.solarYear,
      person.solarMonth,
    ]
  );

  const solarDayList =
    useMemo(
      () =>
        Array.from(
          {
            length:
              solarDays,
          },
          (_, i) =>
            i + 1
        ),
      [solarDays]
    );

  function changeSolarYear(
    year: number
  ) {
    const maxDay =
      getSolarDays(
        year,
        person.solarMonth
      );

    onChange({
      solarYear: year,
      solarDay:
        person.solarDay >
        maxDay
          ? maxDay
          : person.solarDay,
    });
  }

  function changeSolarMonth(
    month: number
  ) {
    const maxDay =
      getSolarDays(
        person.solarYear,
        month
      );

    onChange({
      solarMonth: month,
      solarDay:
        person.solarDay >
        maxDay
          ? maxDay
          : person.solarDay,
    });
  }

  return (
    <div>
      {/* 历法 */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() =>
            onChange({
              calendar:
                "solar",
            })
          }
          className={`h-12 rounded-xl border text-sm transition ${
            person.calendar ===
            "solar"
              ? "border-[#29251f] bg-[#29251f] text-white"
              : "border-[#ddd5c8] bg-white text-[#5f594f]"
          }`}
        >
          公历
        </button>

        <button
          type="button"
          onClick={() =>
            onChange({
              calendar:
                "lunar",
            })
          }
          className={`h-12 rounded-xl border text-sm transition ${
            person.calendar ===
            "lunar"
              ? "border-[#29251f] bg-[#29251f] text-white"
              : "border-[#ddd5c8] bg-white text-[#5f594f]"
          }`}
        >
          农历
        </button>
      </div>

      {/* 公历 */}
      {person.calendar ===
        "solar" && (
        <div>
          <div className="mb-3 text-sm font-medium">
            公历出生日期
          </div>

          <div className="grid grid-cols-3 gap-3">
            <select
              value={
                person.solarYear
              }
              onChange={(e) =>
                changeSolarYear(
                  Number(
                    e.target
                      .value
                  )
                )
              }
              className="h-14 w-full rounded-xl border border-[#ddd5c8] bg-white px-4 text-base outline-none focus:border-[#8b6f47]"
            >
              {years.map(
                (year) => (
                  <option
                    key={year}
                    value={year}
                  >
                    {year}年
                  </option>
                )
              )}
            </select>

            <select
              value={
                person.solarMonth
              }
              onChange={(e) =>
                changeSolarMonth(
                  Number(
                    e.target
                      .value
                  )
                )
              }
              className="h-14 w-full rounded-xl border border-[#ddd5c8] bg-white px-4 text-base outline-none focus:border-[#8b6f47]"
            >
              {months.map(
                (month) => (
                  <option
                    key={month}
                    value={month}
                  >
                    {month}月
                  </option>
                )
              )}
            </select>

            <select
              value={
                person.solarDay
              }
              onChange={(e) =>
                onChange({
                  solarDay:
                    Number(
                      e.target
                        .value
                    ),
                })
              }
              className="h-14 w-full rounded-xl border border-[#ddd5c8] bg-white px-4 text-base outline-none focus:border-[#8b6f47]"
            >
              {solarDayList.map(
                (day) => (
                  <option
                    key={day}
                    value={day}
                  >
                    {day}日
                  </option>
                )
              )}
            </select>
          </div>
        </div>
      )}

      {/* 农历 */}
      {person.calendar ===
        "lunar" && (
        <div>
          <div className="mb-3 text-sm font-medium">
            农历出生日期
          </div>

          <div className="grid grid-cols-3 gap-3">
            <select
              value={
                person.lunarYear
              }
              onChange={(e) =>
                onChange({
                  lunarYear:
                    Number(
                      e.target
                        .value
                    ),
                })
              }
              className="h-14 w-full rounded-xl border border-[#ddd5c8] bg-white px-4 text-base outline-none focus:border-[#8b6f47]"
            >
              {years.map(
                (year) => (
                  <option
                    key={year}
                    value={year}
                  >
                    {year}年
                  </option>
                )
              )}
            </select>

            <select
              value={
                person.lunarMonth
              }
              onChange={(e) =>
                onChange({
                  lunarMonth:
                    Number(
                      e.target
                        .value
                    ),
                })
              }
              className="h-14 w-full rounded-xl border border-[#ddd5c8] bg-white px-4 text-base outline-none focus:border-[#8b6f47]"
            >
              {months.map(
                (month) => (
                  <option
                    key={month}
                    value={month}
                  >
                    {
                      lunarMonthNames[
                        month - 1
                      ]
                    }
                  </option>
                )
              )}
            </select>

            <select
              value={
                person.lunarDay
              }
              onChange={(e) =>
                onChange({
                  lunarDay:
                    Number(
                      e.target
                        .value
                    ),
                })
              }
              className="h-14 w-full rounded-xl border border-[#ddd5c8] bg-white px-4 text-base outline-none focus:border-[#8b6f47]"
            >
              {lunarDayNames.map(
                (
                  day,
                  index
                ) => (
                  <option
                    key={
                      index + 1
                    }
                    value={
                      index + 1
                    }
                  >
                    {day}
                  </option>
                )
              )}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   时间选择组件
   ========================================================= */

function BirthTimeSelector({
  person,
  onChange,
}: {
  person: PersonForm;
  onChange: (
    patch: Partial<PersonForm>
  ) => void;
}) {
  return (
    <div>
      <div className="mb-3 text-sm font-medium">
        出生时间
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() =>
            onChange({
              timeType:
                "exact",
            })
          }
          className={`min-h-12 rounded-xl border px-2 text-sm ${
            person.timeType ===
            "exact"
              ? "border-[#29251f] bg-[#29251f] text-white"
              : "border-[#ddd5c8] bg-white text-[#5f594f]"
          }`}
        >
          精准时间
        </button>

        <button
          type="button"
          onClick={() =>
            onChange({
              timeType:
                "shi",
            })
          }
          className={`min-h-12 rounded-xl border px-2 text-sm ${
            person.timeType ===
            "shi"
              ? "border-[#29251f] bg-[#29251f] text-white"
              : "border-[#ddd5c8] bg-white text-[#5f594f]"
          }`}
        >
          选择时辰
        </button>

        <button
          type="button"
          onClick={() =>
            onChange({
              timeType:
                "unknown",
            })
          }
          className={`min-h-12 rounded-xl border px-2 text-sm ${
            person.timeType ===
            "unknown"
              ? "border-[#29251f] bg-[#29251f] text-white"
              : "border-[#ddd5c8] bg-white text-[#5f594f]"
          }`}
        >
          时间不确定
        </button>
      </div>

      {/* 精准时间 */}
      {person.timeType ===
        "exact" && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <select
            value={
              person.birthHour
            }
            onChange={(e) =>
              onChange({
                birthHour:
                  Number(
                    e.target
                      .value
                  ),
              })
            }
            className="h-14 w-full rounded-xl border border-[#ddd5c8] bg-white px-4 text-base outline-none focus:border-[#8b6f47]"
          >
            {Array.from(
              {
                length: 24,
              },
              (_, hour) => (
                <option
                  key={hour}
                  value={hour}
                >
                  {String(
                    hour
                  ).padStart(
                    2,
                    "0"
                  )}
                  时
                </option>
              )
            )}
          </select>

          <select
            value={
              person.birthMinute
            }
            onChange={(e) =>
              onChange({
                birthMinute:
                  Number(
                    e.target
                      .value
                  ),
              })
            }
            className="h-14 w-full rounded-xl border border-[#ddd5c8] bg-white px-4 text-base outline-none focus:border-[#8b6f47]"
          >
            {Array.from(
              {
                length: 60,
              },
              (_, minute) => (
                <option
                  key={minute}
                  value={minute}
                >
                  {String(
                    minute
                  ).padStart(
                    2,
                    "0"
                  )}
                  分
                </option>
              )
            )}
          </select>
        </div>
      )}

      {/* 时辰 */}
      {person.timeType ===
        "shi" && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {shiChenList.map(
            ([
              shi,
              range,
            ]) => (
              <button
                key={shi}
                type="button"
                onClick={() =>
                  onChange({
                    shiChen:
                      shi,
                  })
                }
                className={`rounded-xl border px-2 py-3 text-sm ${
                  person.shiChen ===
                  shi
                    ? "border-[#29251f] bg-[#29251f] text-white"
                    : "border-[#ddd5c8] bg-white text-[#5f594f]"
                }`}
              >
                <div>
                  {shi}时
                </div>

                <div className="mt-1 text-[10px] opacity-70">
                  {range}
                </div>
              </button>
            )
          )}
        </div>
      )}

      {/* 时间不确定 */}
      {person.timeType ===
        "unknown" && (
        <div className="mt-3 rounded-xl bg-[#f6f1e8] p-4 text-sm leading-6 text-[#756b5d]">
          出生时间不确定时，暂以午时（11:00–13:00）作为参考。
          最终报告会明确说明时柱仅供参考。
        </div>
      )}
    </div>
  );
}

/* =========================================================
   出生地点
   ========================================================= */

function BirthLocationSelector({
  person,
  onChange,
  addressData,
}: {
  person: PersonForm;
  onChange: (
    patch: Partial<PersonForm>
  ) => void;
  addressData: ReturnType<
    typeof getCascaderDataWithCode
  >;
}) {
  const selectedProvince =
    addressData.find(
      (item) =>
        item.value ===
        person.provinceCode
    );

  const cities =
    selectedProvince?.children ??
    [];

  const selectedCity =
    cities.find(
      (item) =>
        item.value ===
        person.cityCode
    );

  const counties =
    selectedCity?.children ??
    [];

  return (
    <div>
      <div className="mb-3 text-sm font-medium">
        出生地点（可选）
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {/* 省 */}
        <select
          value={
            person.provinceCode
          }
          onChange={(e) =>
            onChange({
              provinceCode:
                e.target
                  .value,
              cityCode: "",
              countyCode:
                "",
            })
          }
          className="h-14 w-full rounded-xl border border-[#ddd5c8] bg-white px-4 text-sm outline-none focus:border-[#8b6f47]"
        >
          <option value="">
            请选择省 / 自治区 / 直辖市
          </option>

          {addressData.map(
            (province) => (
              <option
                key={
                  province.value
                }
                value={
                  province.value
                }
              >
                {
                  province.label
                }
              </option>
            )
          )}
        </select>

        {/* 市 */}
        <select
          value={
            person.cityCode
          }
          disabled={
            !person.provinceCode
          }
          onChange={(e) =>
            onChange({
              cityCode:
                e.target
                  .value,
              countyCode:
                "",
            })
          }
          className="h-14 w-full rounded-xl border border-[#ddd5c8] bg-white px-4 text-sm outline-none focus:border-[#8b6f47] disabled:opacity-50"
        >
          <option value="">
            {person.provinceCode
              ? "请选择城市"
              : "请先选择省份"}
          </option>

          {cities.map(
            (city) => (
              <option
                key={
                  city.value
                }
                value={
                  city.value
                }
              >
                {city.label}
              </option>
            )
          )}
        </select>

        {/* 区县 */}
        <select
          value={
            person.countyCode
          }
          disabled={
            !person.cityCode
          }
          onChange={(e) =>
            onChange({
              countyCode:
                e.target
                  .value,
            })
          }
          className="h-14 w-full rounded-xl border border-[#ddd5c8] bg-white px-4 text-sm outline-none focus:border-[#8b6f47] disabled:opacity-50"
        >
          <option value="">
            {person.cityCode
              ? "请选择区 / 县 / 县级市"
              : "请先选择城市"}
          </option>

          {counties.map(
            (county) => (
              <option
                key={
                  county.value
                }
                value={
                  county.value
                }
              >
                {
                  county.label
                }
              </option>
            )
          )}
        </select>
      </div>

      <p className="mt-3 text-xs text-[#92897d]">
        出生地点用于真太阳时等高级计算，可选；可只选择省或省市。
      </p>
    </div>
  );
}

/* =========================================================
   单个人的完整出生信息
   ========================================================= */

function PersonCard({
  title,
  person,
  onChange,
  addressData,
}: {
  title: string;
  person: PersonForm;
  onChange: (
    patch: Partial<PersonForm>
  ) => void;
  addressData: ReturnType<
    typeof getCascaderDataWithCode
  >;
}) {
  return (
    <section className="rounded-3xl border border-[#e7e0d4] bg-white p-5 shadow-sm md:p-7">

      {/* 标题 */}
      <div className="mb-6 flex items-center gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#29251f] text-sm text-white">
          {title ===
          "你的信息"
            ? "你"
            : "TA"}
        </div>

        <div>
          <h2 className="text-xl font-semibold">
            {title}
          </h2>

          <p className="mt-1 text-xs text-[#92897d]">
            请填写真实出生信息
          </p>
        </div>

      </div>

      <div className="space-y-7">

        {/* 姓名 */}
        <div>
          <label className="mb-3 block text-sm font-medium">
            姓名（可选）
          </label>

          <input
            value={
              person.name
            }
            onChange={(e) =>
              onChange({
                name: e.target
                  .value,
              })
            }
            placeholder={
              title ===
              "你的信息"
                ? "请输入你的姓名（可选）"
                : "请输入对方姓名（可选）"
            }
            className="h-14 w-full rounded-xl border border-[#ddd5c8] bg-white px-4 outline-none focus:border-[#8b6f47]"
          />
        </div>

        {/* 性别 */}
        <div>
          <label className="mb-3 block text-sm font-medium">
            性别
          </label>

          <div className="grid grid-cols-2 gap-3">
            {(
              [
                "男",
                "女",
              ] as const
            ).map(
              (gender) => (
                <button
                  key={
                    gender
                  }
                  type="button"
                  onClick={() =>
                    onChange({
                      gender,
                    })
                  }
                  className={`h-14 rounded-xl border text-sm ${
                    person.gender ===
                    gender
                      ? "border-[#29251f] bg-[#29251f] text-white"
                      : "border-[#ddd5c8] bg-white text-[#5f594f]"
                  }`}
                >
                  {gender}
                </button>
              )
            )}
          </div>
        </div>

        {/* 日期 */}
        <BirthDateSelector
          person={person}
          onChange={
            onChange
          }
        />

        {/* 时间 */}
        <BirthTimeSelector
          person={person}
          onChange={
            onChange
          }
        />

        {/* 地点 */}
        <BirthLocationSelector
          person={person}
          onChange={
            onChange
          }
          addressData={
            addressData
          }
        />

      </div>
    </section>
  );
}

/* =========================================================
   合盘关系
   ========================================================= */

const LIUHE: Record<string, string> = {
  "子丑": "六合",
  "丑子": "六合",
  "寅亥": "六合",
  "亥寅": "六合",
  "卯戌": "六合",
  "戌卯": "六合",
  "辰酉": "六合",
  "酉辰": "六合",
  "巳申": "六合",
  "申巳": "六合",
  "午未": "六合",
  "未午": "六合",
};

const CHONG = new Set([
  "子午", "午子", "丑未", "未丑", "寅申", "申寅",
  "卯酉", "酉卯", "辰戌", "戌辰", "巳亥", "亥巳",
]);

const HAI = new Set([
  "子未", "未子", "丑午", "午丑", "寅巳", "巳寅",
  "卯辰", "辰卯", "申亥", "亥申", "酉戌", "戌酉",
]);

const PO = new Set([
  "子酉", "酉子", "丑辰", "辰丑", "寅亥", "亥寅",
  "卯午", "午卯", "巳申", "申巳", "未戌", "戌未",
]);

const SANHE_GROUPS = ["申子辰", "亥卯未", "寅午戌", "巳酉丑"];

function getBranch(bazi: any) {
  // 生肖关系必须使用地支：子丑寅卯辰巳午未申酉戌亥。
  // 年柱例如“甲子”“丙午”，最后一个字就是地支。

  const branches = [
    "子", "丑", "寅", "卯", "辰", "巳",
    "午", "未", "申", "酉", "戌", "亥",
  ];

  const pillar = String(
    bazi?.yearPillar ??
    bazi?.year ??
    ""
  );

  const branchFromPillar = pillar.slice(-1);

  if (branches.includes(branchFromPillar)) {
    return branchFromPillar;
  }

  // 后端如果只有生肖名称，则转换成对应地支。
  const zodiacToBranch: Record<string, string> = {
    鼠: "子",
    牛: "丑",
    虎: "寅",
    兔: "卯",
    龙: "辰",
    蛇: "巳",
    马: "午",
    羊: "未",
    猴: "申",
    鸡: "酉",
    狗: "戌",
    猪: "亥",
  };

  return zodiacToBranch[String(bazi?.zodiac ?? "")] ?? "";
}

const WU_XING = ["木", "火", "土", "金", "水"] as const;

function getFiveElements(bazi: any): Record<string, number> {
  const source = bazi?.fiveElements ?? {};
  return Object.fromEntries(
    WU_XING.map((element) => [element, Number(source[element] ?? 0)])
  );
}

function getFiveElementAnalysis(baziA: any, baziB: any) {
  const a = getFiveElements(baziA);
  const b = getFiveElements(baziB);

  const minA = Math.min(...WU_XING.map((element) => a[element]));
  const minB = Math.min(...WU_XING.map((element) => b[element]));

  const aWeak = WU_XING.filter((element) => a[element] === minA);
  const bWeak = WU_XING.filter((element) => b[element] === minB);

  const aGetsFromB = aWeak.filter((element) => b[element] > 0);
  const bGetsFromA = bWeak.filter((element) => a[element] > 0);

  const complementScore = Math.min(
    100,
    60 + aGetsFromB.length * 10 + bGetsFromA.length * 10
  );

  return {
    a,
    b,
    aWeak,
    bWeak,
    aGetsFromB,
    bGetsFromA,
    complementScore,
  };
}

function getDayMasterRelationship(elementA: string, elementB: string) {
  const generate: Record<string, string> = {
    木: "火",
    火: "土",
    土: "金",
    金: "水",
    水: "木",
  };

  const control: Record<string, string> = {
    木: "土",
    土: "水",
    水: "火",
    火: "金",
    金: "木",
  };

  if (!elementA || !elementB) {
    return {
      type: "资料不足",
      title: "暂无法判断",
      description: "当前日主五行资料不足，暂时无法进行日主关系分析。",
    };
  }

  if (elementA === elementB) {
    return {
      type: "同类",
      title: "同类关系",
      description: "双方日主五行相同，简化参考上更容易体现相似、共鸣与价值取向接近。",
    };
  }

  if (generate[elementA] === elementB) {
    return {
      type: "你生TA",
      title: "你生 TA",
      description: `${elementA}生${elementB}，简化参考上可理解为你更容易对 TA 形成支持、给予与付出。`,
    };
  }

  if (generate[elementB] === elementA) {
    return {
      type: "TA生你",
      title: "TA生你",
      description: `${elementB}生${elementA}，简化参考上可理解为 TA 更容易对你形成支持、滋养与帮助。`,
    };
  }

  if (control[elementA] === elementB) {
    return {
      type: "你克TA",
      title: "你克 TA",
      description: `${elementA}克${elementB}，简化参考上容易体现为你们之间存在推动、要求、边界或压力感。`,
    };
  }

  if (control[elementB] === elementA) {
    return {
      type: "TA克你",
      title: "TA克你",
      description: `${elementB}克${elementA}，简化参考上容易体现为 TA 对你形成推动、要求或压力感。`,
    };
  }

  return {
    type: "其他",
    title: "五行互动",
    description: "双方日主存在五行互动，可结合完整八字进一步判断。",
  };
}



function getRelationshipReading(
  baziA: any,
  baziB: any,
  dayMasterRelationship: { type?: string; title?: string; description?: string },
  compositeAnalysis: any
) {
  const dmA = baziA?.dayMasterElement || "";
  const dmB = baziB?.dayMasterElement || "";
  const dmType = dayMasterRelationship?.type || "";

  let opening = "你们属于需要在现实相处中逐步建立默契的关系。";
  if (dmType === "同类") {
    opening = `你们属于“同类共鸣型”关系。双方日主五行同为${dmA}，简化参考上更容易在关注点、做事方式或价值取向上产生共鸣。`;
  } else if (dmType === "TA生你") {
    opening = `你们属于“支持流动型”关系。TA的${dmB}生你的${dmA}，简化参考上更容易体现支持、给予与被支持的互动。`;
  } else if (dmType === "你生TA") {
    opening = `你们属于“给予互动型”关系。你的${dmA}生TA的${dmB}，简化参考上更容易体现主动给予、照顾或支持。`;
  } else if (dmType === "你克TA") {
    opening = `你们属于“推动磨合型”关系。你的${dmA}克TA的${dmB}，简化参考上容易形成推动、要求、边界与主导感。`;
  } else if (dmType === "TA克你") {
    opening = `你们属于“磨合成长型”关系。TA的${dmB}克你的${dmA}，简化参考上容易形成压力、边界与彼此调整的互动。`;
  }

  let love = "感情相处中，建议把命理上的差异转化为现实中的沟通优势。";
  if (dmType === "同类") {
    love = "恋爱相处中，双方容易因为相似而产生理解感，但也可能因为想法接近而同时坚持自己的判断。";
  } else if (dmType === "TA生你") {
    love = "恋爱相处中，TA更容易表现出支持、照顾或提供帮助；同时也要避免形成单向付出。";
  } else if (dmType === "你生TA") {
    love = "恋爱相处中，你可能更容易承担主动支持、照顾或推动关系的角色，建议保持付出与回应的平衡。";
  } else {
    love = "恋爱相处中，双方需要特别注意表达方式；把要求或批评转换成具体需求，更容易被对方理解。";
  }

  let marriage = "进入长期关系后，稳定沟通和共同目标会比单一命理指标更重要。";
  if (dmType === "同类") {
    marriage = "婚姻与长期相处中，相似性有利于建立稳定感；遇到重大决定时建议明确分工，避免双方都坚持同一个方向。";
  } else if (dmType === "你克TA" || dmType === "TA克你") {
    marriage = "婚姻与长期相处中，最需要经营的是边界和决策方式。适合把“谁说了算”转化为“这件事谁负责、如何共同决定”。";
  } else {
    marriage = "婚姻与长期相处中，可以把彼此不同的角色变成互补，通过明确分工和及时回应减少消耗。";
  }

  let conflict = "发生分歧时，先确认共同目标，再讨论具体解决方案。";
  if (dmType === "同类") {
    conflict = "发生分歧时，双方都可能认为自己的判断更合理。建议先暂停争论，明确共同目标，再决定采用哪种方案。";
  } else if (dmType === "你克TA" || dmType === "TA克你") {
    conflict = "发生冲突时，容易出现一方觉得对方要求太多、另一方觉得对方不够配合。建议减少命令式表达，多使用具体需求和可执行的约定。";
  }

  const suggestion = compositeAnalysis?.score >= 75
    ? "整体来看，这段关系具备继续经营的基础。把优势落实到沟通、信任和分工上，会比追求命理上的“完美组合”更重要。"
    : "整体来看，这段关系更需要通过现实相处建立稳定感。重点放在沟通、边界、信任和共同目标，而不是单纯追求命理评分。";

  return { opening, love, marriage, conflict, suggestion };
}

function getCompositeAnalysis(
  relationships: string[],
  dayMasterRelationship: { type?: string; title?: string; description?: string },
  complementScore: number | null | undefined
) {
  let score = 70;

  // 生肖关系：有明显吉/凶互动时给予适度加减分。
  if (relationships.includes("六合")) score += 10;
  if (relationships.includes("三合")) score += 8;
  if (relationships.includes("相冲")) score -= 12;
  if (relationships.includes("相害")) score -= 8;
  if (relationships.includes("相破")) score -= 6;

  // 日主关系：相生偏支持，同类偏共鸣，相克提示张力。
  switch (dayMasterRelationship?.type) {
    case "TA生你":
    case "你生TA":
      score += 8;
      break;
    case "同类":
      score += 6;
      break;
    case "你克TA":
    case "TA克你":
      score -= 4;
      break;
  }

  // 五行互补作为辅助项，不让它单独决定结果。
  if (typeof complementScore === "number") {
    score += Math.round((complementScore - 60) * 0.2);
  }

  score = Math.max(0, Math.min(100, score));

  let level = "基础互动";
  if (score >= 85) level = "较佳互动";
  else if (score >= 75) level = "良好互动";
  else if (score >= 65) level = "中等互动";
  else level = "需要磨合";

  const advantages: string[] = [];
  const cautions: string[] = [];

  if (
    relationships.includes("六合") ||
    relationships.includes("三合")
  ) {
    advantages.push("生肖关系中存在偏积极的互动，传统文化参考上较容易形成亲近感与合作感。");
  }

  if (
    dayMasterRelationship?.type === "TA生你" ||
    dayMasterRelationship?.type === "你生TA"
  ) {
    advantages.push("双方日主形成相生关系，简化参考上更容易体现支持、给予与互相成就。");
  } else if (dayMasterRelationship?.type === "同类") {
    advantages.push("双方日主五行相同，简化参考上更容易出现相似的关注点与共鸣。");
  }

  if (typeof complementScore === "number" && complementScore >= 70) {
    advantages.push("双方五行结构存在一定互补，部分不足可以从对方八字中得到补充。");
  }

  if (!advantages.length) {
    advantages.push("双方存在明确的五行与日主互动，可以通过现实中的沟通方式进一步建立关系优势。");
  }

  if (
    relationships.includes("相冲") ||
    relationships.includes("相害") ||
    relationships.includes("相破")
  ) {
    const relationText = [
      relationships.includes("相冲") ? "相冲" : "",
      relationships.includes("相害") ? "相害" : "",
      relationships.includes("相破") ? "相破" : "",
    ].filter(Boolean).join("、");
    cautions.push(`生肖关系中存在${relationText}，简化参考上需要更多关注沟通方式、情绪反应与边界。`);
  }

  if (
    dayMasterRelationship?.type === "你克TA" ||
    dayMasterRelationship?.type === "TA克你"
  ) {
    cautions.push("双方日主存在相克关系，简化参考上容易出现要求、边界、主导与压力感，适合避免单方面控制。");
  }

  if (typeof complementScore === "number" && complementScore < 70) {
    cautions.push("五行直接互补程度有限，建议不要把彼此的差异简单理解为谁应该改变谁。");
  }

  if (!cautions.length) {
    cautions.push("当前未发现明显的生肖或日主冲突信号，仍建议以现实中的沟通、信任与相处质量为准。");
  }

  const breakdown = [
    { label: "生肖关系", value: (relationships.includes("六合") ? 10 : 0) + (relationships.includes("三合") ? 8 : 0) - (relationships.includes("相冲") ? 12 : 0) - (relationships.includes("相害") ? 8 : 0) - (relationships.includes("相破") ? 6 : 0), note: relationships.length ? relationships.join("、") : "无明显关系" },
    { label: "日主关系", value: ["TA生你", "你生TA"].includes(dayMasterRelationship?.type || "") ? 8 : dayMasterRelationship?.type === "同类" ? 6 : ["你克TA", "TA克你"].includes(dayMasterRelationship?.type || "") ? -4 : 0, note: dayMasterRelationship?.title || "未判断" },
    { label: "五行互补", value: typeof complementScore === "number" ? Math.round((complementScore - 60) * 0.2) : 0, note: typeof complementScore === "number" ? `互补参考 ${complementScore}/100` : "资料不足" },
  ];

  return { score, level, advantages, cautions, breakdown };
}


function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

async function downloadShareCardImage(result: any) {
  try {
    if (!result) {
      alert("暂无合盘结果，请先完成合盘。");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1350;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("无法创建图片画布");

    const score = result.compositeAnalysis?.score ?? "—";
    const level = result.compositeAnalysis?.level || "综合参考";
    const relation = result.relationships?.length
      ? result.relationships.join(" · ")
      : "无明显生肖关系";
    const dm = result.dayMasterRelationship?.type || "未判断";
    const complement = result.fiveElementAnalysis?.complementScore ?? "—";

    ctx.fillStyle = "#efe6d7";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#fbf8f2";
    drawRoundedRect(ctx, 60, 60, 960, 1230, 42);
    ctx.fill();

    ctx.textAlign = "center";
    ctx.fillStyle = "#8b6f47";
    ctx.font = "28px sans-serif";
    ctx.fillText("东 方 命 格  AI", 540, 135);

    ctx.fillStyle = "#8a8378";
    ctx.font = "24px sans-serif";
    ctx.fillText("婚恋合盘参考", 540, 195);

    ctx.fillStyle = "#5b4630";
    ctx.font = "bold 150px sans-serif";
    ctx.fillText(String(score), 540, 365);

    ctx.fillStyle = "#8a8378";
    ctx.font = "25px sans-serif";
    ctx.fillText(`/ 100 · ${level}`, 540, 415);

    ctx.strokeStyle = "#e7e0d4";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(150, 465);
    ctx.lineTo(930, 465);
    ctx.stroke();

    const drawPerson = (x: number, title: string, bazi: any) => {
      ctx.fillStyle = "#ffffff";
      drawRoundedRect(ctx, x, 510, 360, 190, 24);
      ctx.fill();

      ctx.textAlign = "left";
      ctx.fillStyle = "#9a9185";
      ctx.font = "20px sans-serif";
      ctx.fillText(title, x + 28, 550);

      ctx.fillStyle = "#5b5042";
      ctx.font = "bold 28px sans-serif";
      ctx.fillText(getZodiacDisplay(bazi), x + 28, 605);

      ctx.fillStyle = "#8a8378";
      ctx.font = "22px sans-serif";
      ctx.fillText(
        `${bazi?.dayMaster || "—"} · ${bazi?.dayMasterElement || "—"}`,
        x + 28,
        650
      );
    };

    drawPerson(150, "你", result.baziA);
    drawPerson(570, "TA", result.baziB);

    ctx.textAlign = "center";
    ctx.fillStyle = "#6f5738";
    ctx.font = "bold 25px sans-serif";
    ctx.fillText(relation, 540, 770);

    ctx.font = "22px sans-serif";
    ctx.fillText(dm, 540, 815);
    ctx.fillText(`五行互补 ${complement}/100`, 540, 860);

    ctx.fillStyle = "#efe7d9";
    drawRoundedRect(ctx, 180, 915, 720, 90, 24);
    ctx.fill();

    ctx.fillStyle = "#6f5738";
    ctx.font = "24px sans-serif";
    ctx.fillText("吸引 · 支持 · 成长", 540, 970);

    ctx.fillStyle = "#9a9185";
    ctx.font = "20px sans-serif";
    ctx.fillText("传统命理文化参考 · 仅供娱乐与自我观察", 540, 1135);
    ctx.fillText("东方命格 AI", 540, 1190);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((value) => {
        if (value) resolve(value);
        else reject(new Error("PNG 图片生成失败"));
      }, "image/png");
    });

    const fileName = `东方命格AI-合盘-${score}分.png`;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();

    window.setTimeout(() => {
      link.remove();
      URL.revokeObjectURL(url);
    }, 1000);
  } catch (error) {
    console.error("保存分享卡失败：", error);
    alert("图片保存失败，请再点击一次。");
  }
}

function getZodiacDisplay(bazi: any) {
  const pillar = String(
    bazi?.yearPillar ??
    bazi?.year ??
    ""
  );

  const branch = pillar.slice(-1);

  const branchToZodiac: Record<string, string> = {
    子: "鼠",
    丑: "牛",
    寅: "虎",
    卯: "兔",
    辰: "龙",
    巳: "蛇",
    午: "马",
    未: "羊",
    申: "猴",
    酉: "鸡",
    戌: "狗",
    亥: "猪",
  };

  const zodiac = branchToZodiac[branch];

  if (zodiac && branch) {
    return `${zodiac}（${branch}）`;
  }

  return "—";
}
function getBirthDate(person: PersonForm) {
  if (person.calendar === "solar") {
    return new Date(person.solarYear, person.solarMonth - 1, person.solarDay);
  }

  // 当前计算层以 Date 作为统一输入；农历页面先保留用户填写的年月日作为参考日期。
  // 后续接入完整农历转换层时，只需替换这里，不影响原页面 UI。
  return new Date(person.lunarYear, person.lunarMonth - 1, person.lunarDay);
}

function getBirthTime(person: PersonForm) {
  if (person.timeType === "exact") {
    return { hour: person.birthHour, minute: person.birthMinute };
  }

  if (person.timeType === "shi") {
    const index = shiChenList.findIndex(([name]) => name === person.shiChen);
    const hour = index >= 0 ? (index * 2 + 23) % 24 : 12;
    return { hour, minute: 0 };
  }

  // 时间不确定：按产品约定使用午时作为参考时间。
  return { hour: 12, minute: 0 };
}

function getRelationship(branchA: string, branchB: string) {
  const pair = `${branchA}${branchB}`;
  const relations: string[] = [];

  const liuhePairs = new Set([
    "子丑", "丑子",
    "寅亥", "亥寅",
    "卯戌", "戌卯",
    "辰酉", "酉辰",
    "巳申", "申巳",
    "午未", "未午",
  ]);

  const chongPairs = new Set([
    "子午", "午子",
    "丑未", "未丑",
    "寅申", "申寅",
    "卯酉", "酉卯",
    "辰戌", "戌辰",
    "巳亥", "亥巳",
  ]);

  const haiPairs = new Set([
    "子未", "未子",
    "丑午", "午丑",
    "寅巳", "巳寅",
    "卯辰", "辰卯",
    "申亥", "亥申",
    "酉戌", "戌酉",
  ]);

  const poPairs = new Set([
    "子酉", "酉子",
    "丑辰", "辰丑",
    "寅亥", "亥寅",
    "卯午", "午卯",
    "巳申", "申巳",
    "未戌", "戌未",
  ]);

  const sanheGroups = [
    "申子辰",
    "亥卯未",
    "寅午戌",
    "巳酉丑",
  ];

  if (liuhePairs.has(pair)) relations.push("六合");
  if (chongPairs.has(pair)) relations.push("相冲");
  if (haiPairs.has(pair)) relations.push("相害");
  if (poPairs.has(pair)) relations.push("相破");

  const sanhe = sanheGroups.find(
    (group) =>
      group.includes(branchA) &&
      group.includes(branchB) &&
      branchA !== branchB
  );

  if (sanhe) relations.push("三合");

  return Array.from(new Set(relations));
}

/* =========================================================
   婚恋合盘页面
   ========================================================= */

export default function CompatibilityPage() {
  const [personA, setPersonA] =
    useState<PersonForm>(
      createPerson()
    );

  const [personB, setPersonB] =
    useState<PersonForm>(
      createPerson()
    );

  const [message, setMessage] =
    useState("");

  const [result, setResult] = useState<any>(null);
  const [shareStatus, setShareStatus] = useState("");
  const [showShareCard, setShowShareCard] = useState(false);

  const addressData = useMemo(
    () =>
      getCascaderDataWithCode(),
    []
  );

  function updateA(
    patch: Partial<PersonForm>
  ) {
    setPersonA(
      (current) => ({
        ...current,
        ...patch,
      })
    );
  }

  function updateB(
    patch: Partial<PersonForm>
  ) {
    setPersonB(
      (current) => ({
        ...current,
        ...patch,
      })
    );
  }

  function validatePerson(
    person: PersonForm
  ) {
    // 姓名、出生地点均为可选。
    // 只有出生日期是排盘必须资料。

    if (person.calendar === "solar") {
      if (!person.solarYear || !person.solarMonth || !person.solarDay) {
        return "请填写完整的公历出生日期";
      }
    } else {
      if (!person.lunarYear || !person.lunarMonth || !person.lunarDay) {
        return "请填写完整的农历出生日期";
      }
    }

    return "";
  }

  function handleSubmit() {
    setMessage("");
    setResult(null);

    const errorA =
      validatePerson(
        personA
      );

    if (errorA) {
      setMessage(
        `你的信息：${errorA}`
      );
      return;
    }

    const errorB =
      validatePerson(
        personB
      );

    if (errorB) {
      setMessage(
        `TA的信息：${errorB}`
      );
      return;
    }

    try {
      const timeA = getBirthTime(personA);
      const timeB = getBirthTime(personB);

      // 兼容当前 lib/bazi.ts 可能使用的不同出生时间参数格式。
      // 页面 UI 不变，只在计算层做适配，避免因为时间参数类型不一致导致整个合盘失败。
      const runBazi = (person: PersonForm, time: { hour: number; minute: number }) => {
        const calc = calculateBazi as any;
        const date = getBirthDate(person);
        const timeText = `${String(time.hour).padStart(2, "0")}:${String(time.minute).padStart(2, "0")}`;

        try {
          return calc(date, time, person.gender);
        } catch (firstError) {
          try {
            return calc(date, timeText, person.gender);
          } catch (secondError) {
            try {
              return calc(date, time.hour, person.gender);
            } catch {
              throw firstError;
            }
          }
        }
      };

      const baziA = runBazi(personA, timeA) as any;
      const baziB = runBazi(personB, timeB) as any;

      const branchA = getBranch(baziA);
      const branchB = getBranch(baziB);
      const relationships = getRelationship(branchA, branchB);
      const fiveElementAnalysis = getFiveElementAnalysis(baziA, baziB);
      const dayMasterRelationship = getDayMasterRelationship(
        baziA?.dayMasterElement,
        baziB?.dayMasterElement
      );

      const compositeAnalysis = getCompositeAnalysis(
        relationships,
        dayMasterRelationship,
        fiveElementAnalysis?.complementScore
      );

      const relationshipReading = getRelationshipReading(
        baziA,
        baziB,
        dayMasterRelationship,
        compositeAnalysis
      );

      setResult({
        baziA,
        baziB,
        branchA,
        branchB,
        relationships,
        fiveElementAnalysis,
        dayMasterRelationship,
        compositeAnalysis,
        relationshipReading,
      });

      setMessage("合盘完成");

      setTimeout(() => {
        document.getElementById("compatibility-result")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 50);
    } catch (error) {
      console.error("婚恋合盘计算失败：", error);
      const detail = error instanceof Error ? error.message : "计算层返回异常";
      setMessage(`合盘计算失败：${detail}`);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-[#29251f]">

      <div className="mx-auto max-w-6xl px-5 py-10 md:px-8">

        {/* =================================================
            页面标题
            ================================================= */}

        <header className="mb-10">

          <div className="mb-3 text-sm tracking-[0.2em] text-[#8b6f47]">
            东方命格 AI
          </div>

          <h1 className="text-3xl font-semibold md:text-4xl">
            婚恋合盘
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#756f66]">
            分别填写你和 TA 的出生信息，系统将从生肖关系、八字五行及婚恋互动等维度进行综合分析。
          </p>

        </header>

        {/* =================================================
            两个人
            ================================================= */}

        <div className="grid gap-6 lg:grid-cols-2">

          <PersonCard
            title="你的信息"
            person={personA}
            onChange={updateA}
            addressData={
              addressData
            }
          />

          <PersonCard
            title="TA的信息"
            person={personB}
            onChange={updateB}
            addressData={
              addressData
            }
          />

        </div>

        {/* =================================================
            合盘按钮
            ================================================= */}

        <section className="mt-6 rounded-3xl border border-[#e7e0d4] bg-white p-5 shadow-sm md:p-7">

          <button
            type="button"
            onClick={
              handleSubmit
            }
            className="w-full rounded-2xl bg-[#29251f] px-6 py-4 text-base font-medium text-white transition hover:bg-[#40392f]"
          >
            开始婚恋合盘
          </button>

          {message && (
            <div className="mt-4 rounded-xl bg-[#f6f1e8] p-4 text-sm leading-6 text-[#665d51]">
              {message}
            </div>
          )}

        </section>

        {result && (
          <section
            id="compatibility-result"
            className="mt-6 scroll-mt-6 rounded-3xl border border-[#e7e0d4] bg-white p-5 shadow-sm md:p-7"
          >
            <div className="mb-6">
              <div className="text-sm tracking-[0.16em] text-[#8b6f47]">合盘结果</div>
              <h2 className="mt-2 text-2xl font-semibold">婚恋关系总览</h2>
              <p className="mt-2 text-sm leading-6 text-[#756f66]">
                以下结果根据当前填写的出生资料生成，属于传统命理文化参考。
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {[
                { title: personA.name || "你", bazi: result.baziA },
                { title: personB.name || "TA", bazi: result.baziB },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl bg-[#f7f4ee] p-5">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <div className="mt-4 space-y-2 text-sm text-[#5f594f]">
                    <div>四柱：{[item.bazi?.yearPillar, item.bazi?.monthPillar, item.bazi?.dayPillar, item.bazi?.hourPillar].filter(Boolean).join(" · ") || "—"}</div>
                    <div>生肖： {getZodiacDisplay(item.bazi)}</div>
                    <div>日主：{item.bazi?.dayMaster || "—"}</div>
                    <div>日主五行：{item.bazi?.dayMasterElement || "—"}</div>
                    <div>日主状态：{item.bazi?.strength || "—"}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-[#e7e0d4] p-5">
              <h3 className="text-lg font-semibold">生肖关系</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {result.relationships.length > 0 ? (
                  result.relationships.map((relation: string) => (
                    <span
                      key={relation}
                      className="rounded-full bg-[#29251f] px-4 py-2 text-sm text-white"
                    >
                      {relation}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-[#756f66]">当前生肖组合未检测到六合、三合、相冲、相害或相破。</span>
                )}
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-[#e7e0d4] p-5">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-semibold">日主关系分析</h3>
                <span className="rounded-full bg-[#f6f1e8] px-3 py-1 text-sm text-[#756b5d]">
                  {result.dayMasterRelationship?.type ?? "—"}
                </span>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-[#f7f4ee] p-4">
                  <div className="text-sm text-[#756f66]">{personA.name || "你"}的日主</div>
                  <div className="mt-2 text-xl font-semibold">
                    {result.baziA?.dayMaster || "—"}
                    <span className="ml-2 text-base font-normal text-[#756f66]">
                      {result.baziA?.dayMasterElement || "—"}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl bg-[#f7f4ee] p-4">
                  <div className="text-sm text-[#756f66]">{personB.name || "TA"}的日主</div>
                  <div className="mt-2 text-xl font-semibold">
                    {result.baziB?.dayMaster || "—"}
                    <span className="ml-2 text-base font-normal text-[#756f66]">
                      {result.baziB?.dayMasterElement || "—"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-[#e7e0d4] p-4">
                <div className="text-base font-semibold">
                  {result.dayMasterRelationship?.title || "暂无法判断"}
                </div>
                <p className="mt-2 text-sm leading-6 text-[#756f66]">
                  {result.dayMasterRelationship?.description || "暂无法生成日主关系说明。"}
                </p>
              </div>

              <p className="mt-4 text-xs leading-5 text-[#8a8378]">
                日主关系仅依据双方日主五行做简化参考，不等同于完整八字中的喜忌、格局与婚恋判断。
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-[#e7e0d4] p-5">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-semibold">五行互补分析</h3>
                <span className="rounded-full bg-[#f6f1e8] px-3 py-1 text-sm text-[#756b5d]">
                  参考分：{result.fiveElementAnalysis?.complementScore ?? "—"} / 100
                </span>
              </div>

              <p className="mt-2 text-sm leading-6 text-[#756f66]">
                根据双方八字五行数量做基础互补参考；不代表传统命理中的完整喜忌判断。
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {[
                  { title: personA.name || "你", values: result.fiveElementAnalysis?.a },
                  { title: personB.name || "TA", values: result.fiveElementAnalysis?.b },
                ].map((item) => (
                  <div key={item.title} className="rounded-xl bg-[#f7f4ee] p-4">
                    <div className="text-sm font-medium">{item.title}五行</div>
                    <div className="mt-3 space-y-2">
                      {WU_XING.map((element) => {
                        const value = Number(item.values?.[element] ?? 0);
                        return (
                          <div key={element} className="flex items-center gap-3 text-sm">
                            <span className="w-5 shrink-0">{element}</span>
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#e7e0d4]">
                              <div
                                className="h-full rounded-full bg-[#8b6f47]"
                                style={{ width: `${Math.max(4, Math.min(100, value * 12))}%` }}
                              />
                            </div>
                            <span className="w-5 text-right text-[#756f66]">{value}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-[#e7e0d4] p-4">
                  <div className="text-sm font-medium">{personA.name || "你"}得到的五行补充</div>
                  <p className="mt-2 text-sm leading-6 text-[#756f66]">
                    {result.fiveElementAnalysis?.aGetsFromB?.length
                      ? `对方拥有：${result.fiveElementAnalysis.aGetsFromB.join("、")}`
                      : "暂未发现明显的直接五行补充。"}
                  </p>
                </div>

                <div className="rounded-xl border border-[#e7e0d4] p-4">
                  <div className="text-sm font-medium">{personB.name || "TA"}得到的五行补充</div>
                  <p className="mt-2 text-sm leading-6 text-[#756f66]">
                    {result.fiveElementAnalysis?.bGetsFromA?.length
                      ? `对方拥有：${result.fiveElementAnalysis.bGetsFromA.join("、")}`
                      : "暂未发现明显的直接五行补充。"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-[#e7e0d4] bg-[#fbf8f2] p-5">
              <div className="mt-6 overflow-hidden rounded-3xl border border-[#e5dccd] bg-gradient-to-br from-[#fffaf1] via-white to-[#f4eee4] p-6 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="text-sm tracking-[0.25em] text-[#8b6f47]">东方命格 AI · 合盘结果</div>
                <div className="mt-4 flex h-32 w-32 items-center justify-center rounded-full border-[10px] border-[#d8c19c] bg-white shadow-inner">
                  <div><div className="text-4xl font-bold text-[#6f5738]">{result.compositeAnalysis?.score ?? "—"}</div><div className="text-xs text-[#8a8378]">/ 100</div></div>
                </div>
                <div className="mt-4 text-xl font-semibold text-[#4e453a]">{result.compositeAnalysis?.level || "综合参考"}</div>
                <div className="mt-2 text-sm text-[#756f66]">{getZodiacDisplay(result.baziA)} · {result.baziA?.dayMasterElement || ""} × {getZodiacDisplay(result.baziB)} · {result.baziB?.dayMasterElement || ""}</div>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {(result.relationships?.length ? result.relationships : ["无明显生肖关系"]).map((r: string) => <span key={r} className="rounded-full bg-white px-3 py-1 text-xs text-[#75634a] shadow-sm">{r}</span>)}
                  <span className="rounded-full bg-white px-3 py-1 text-xs text-[#75634a] shadow-sm">{result.dayMasterRelationship?.type || "五行互动"}</span>
                </div>
                <div className="mt-5 grid w-full gap-3 sm:grid-cols-3">
                  {[
                    ["生肖关系", result.relationships?.[0] || "无"],
                    ["日主关系", result.dayMasterRelationship?.type || "—"],
                    ["五行互补", `${result.fiveElementAnalysis?.complementScore ?? "—"}/100`],
                  ].map(([label, value]) => <div key={label} className="rounded-2xl bg-white/80 p-3"><div className="text-xs text-[#9a9185]">{label}</div><div className="mt-1 text-sm font-semibold text-[#5b5042]">{value}</div></div>)}
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setShowShareCard((v) => !v)}
                    className="rounded-full bg-[#6f5738] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#5d482f]"
                  >
                    {showShareCard ? "收起分享卡" : "生成分享卡"}
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      const score = result.compositeAnalysis?.score ?? "—";
                      const level = result.compositeAnalysis?.level || "综合参考";
                      const relation = result.relationships?.length ? result.relationships.join("、") : "无明显生肖关系";
                      const dm = result.dayMasterRelationship?.type || "未判断";
                      const text = `东方命格 AI\n❤️ 婚恋参考 ${score}/100 · ${level}\n生肖关系：${relation}\n日主关系：${dm}\n五行互补：${result.fiveElementAnalysis?.complementScore ?? "—"}/100`;
                      try {
                        if (navigator.share) {
                          await navigator.share({ title: "东方命格 AI 合盘结果", text });
                        } else {
                          await navigator.clipboard.writeText(text);
                          setShareStatus("分享文案已复制");
                          setTimeout(() => setShareStatus(""), 2000);
                        }
                      } catch {}
                    }}
                    className="rounded-full border border-[#d9cdbc] bg-white px-6 py-3 text-sm font-medium text-[#6f5738] transition hover:bg-[#fbf8f2]"
                  >
                    直接分享
                  </button>
                </div>

                {showShareCard && (
                  <div className="mt-5 overflow-hidden rounded-[28px] border border-[#d8cbb8] bg-[#efe6d7] p-3 shadow-sm">
                    <div className="rounded-[22px] bg-[#fbf8f2] px-6 py-7 text-center">
                      <div className="text-xs tracking-[0.28em] text-[#8b6f47]">东方命格 AI</div>
                      <div className="mt-5 text-sm text-[#8a8378]">婚恋合盘参考</div>
                      <div className="mt-1 text-6xl font-semibold tracking-tight text-[#5b4630]">
                        {result.compositeAnalysis?.score ?? "—"}
                      </div>
                      <div className="mt-1 text-sm text-[#8a8378]">/ 100 · {result.compositeAnalysis?.level || "综合参考"}</div>

                      <div className="mt-6 grid grid-cols-2 gap-2 text-left">
                        <div className="rounded-xl bg-white p-3">
                          <div className="text-[11px] text-[#9a9185]">你</div>
                          <div className="mt-1 text-sm font-semibold text-[#5b5042]">
                            {getZodiacDisplay(result.baziA)}
                          </div>
                          <div className="mt-1 text-xs text-[#8a8378]">
                            {result.baziA?.dayMaster || "—"} · {result.baziA?.dayMasterElement || "—"}
                          </div>
                        </div>
                        <div className="rounded-xl bg-white p-3 text-left">
                          <div className="text-[11px] text-[#9a9185]">TA</div>
                          <div className="mt-1 text-sm font-semibold text-[#5b5042]">
                            {getZodiacDisplay(result.baziB)}
                          </div>
                          <div className="mt-1 text-xs text-[#8a8378]">
                            {result.baziB?.dayMaster || "—"} · {result.baziB?.dayMasterElement || "—"}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        {(result.relationships?.length ? result.relationships : ["无明显生肖关系"]).map((item: string) => (
                          <span key={item} className="rounded-full bg-[#efe7d9] px-3 py-1 text-xs text-[#6f5738]">
                            {item}
                          </span>
                        ))}
                        {result.dayMasterRelationship?.type && (
                          <span className="rounded-full bg-[#efe7d9] px-3 py-1 text-xs text-[#6f5738]">
                            {result.dayMasterRelationship.type}
                          </span>
                        )}
                        <span className="rounded-full bg-[#efe7d9] px-3 py-1 text-xs text-[#6f5738]">
                          五行互补 {result.fiveElementAnalysis?.complementScore ?? "—"}
                        </span>
                      </div>

                      <div className="mt-6 border-t border-[#e7e0d4] pt-4 text-xs leading-5 text-[#9a9185]">
                        传统命理文化参考 · 仅供娱乐与自我观察
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => downloadShareCardImage(result)}
                      className="mt-3 w-full rounded-full bg-[#6f5738] px-5 py-3 text-sm font-medium text-white"
                    >
                      📸 保存分享卡图片
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        const score = result.compositeAnalysis?.score ?? "—";
                        const level = result.compositeAnalysis?.level || "综合参考";
                        const relation = result.relationships?.length ? result.relationships.join("、") : "无明显生肖关系";
                        const dm = result.dayMasterRelationship?.type || "未判断";
                        const text = `东方命格 AI\n❤️ 婚恋参考 ${score}/100 · ${level}\n生肖关系：${relation}\n日主关系：${dm}\n五行互补：${result.fiveElementAnalysis?.complementScore ?? "—"}/100`;
                        try {
                          await navigator.clipboard.writeText(text);
                          setShareStatus("分享文案已复制");
                          setTimeout(() => setShareStatus(""), 2000);
                        } catch {
                          setShareStatus("请使用上方“直接分享”按钮");
                        }
                      }}
                      className="mt-3 w-full rounded-full bg-white px-5 py-3 text-sm font-medium text-[#6f5738]"
                    >
                      复制分享文案
                    </button>
                  </div>
                )}

                {shareStatus && <div className="mt-2 text-xs text-[#8b6f47]">{shareStatus}</div>}
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-semibold">AI 婚恋关系解读</h3>
                <span className="rounded-full bg-white px-3 py-1 text-sm text-[#756b5d]">
                  智能解读
                </span>
              </div>

              <p className="mt-4 text-base font-medium leading-7 text-[#3f3a33]">
                {result.relationshipReading?.opening}
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-white p-4">
                  <div className="font-semibold">恋爱相处</div>
                  <p className="mt-2 text-sm leading-6 text-[#756f66]">
                    {result.relationshipReading?.love}
                  </p>
                </div>

                <div className="rounded-xl bg-white p-4">
                  <div className="font-semibold">婚姻相处</div>
                  <p className="mt-2 text-sm leading-6 text-[#756f66]">
                    {result.relationshipReading?.marriage}
                  </p>
                </div>

                <div className="rounded-xl bg-white p-4">
                  <div className="font-semibold">冲突模式</div>
                  <p className="mt-2 text-sm leading-6 text-[#756f66]">
                    {result.relationshipReading?.conflict}
                  </p>
                </div>

                <div className="rounded-xl bg-white p-4">
                  <div className="font-semibold">相处建议</div>
                  <p className="mt-2 text-sm leading-6 text-[#756f66]">
                    {result.relationshipReading?.suggestion}
                  </p>
                </div>
              </div>

              <p className="mt-5 text-xs leading-5 text-[#8a8378]">
                AI 解读根据当前合盘结构生成，仅作为传统命理文化参考；实际关系仍应以双方真实沟通、选择与相处为准。
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-[#e7e0d4] p-5">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-semibold">婚恋综合参考</h3>
                <span className="rounded-full bg-[#f6f1e8] px-3 py-1 text-sm text-[#756b5d]">
                  {result.compositeAnalysis?.level || "综合参考"}
                </span>
              </div>

              <div className="mt-5 flex items-end gap-3">
                <div className="text-4xl font-semibold">
                  {result.compositeAnalysis?.score ?? "—"}
                </div>
                <div className="pb-1 text-sm text-[#756f66]">/ 100 参考分</div>
              </div>

              <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#e7e0d4]">
                <div
                  className="h-full rounded-full bg-[#8b6f47]"
                  style={{
                    width: `${Math.max(
                      0,
                      Math.min(100, Number(result.compositeAnalysis?.score ?? 0))
                    )}%`,
                  }}
                />
              </div>

              <p className="mt-3 text-sm leading-6 text-[#756f66]">
                综合参考分由生肖关系、日主关系与五行互补进行简化汇总，用于产品内的传统命理文化参考。
              </p>

              <div className="mt-5 rounded-2xl bg-[#fbf8f2] p-4">
                <div className="font-semibold text-[#5b5042]">这个分数是怎么来的？</div>
                <div className="mt-3 space-y-3">
                  {(result.compositeAnalysis?.breakdown || []).map((item: any) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between text-sm"><span className="font-medium">{item.label}</span><span className={item.value >= 0 ? "text-[#6f5738]" : "text-[#9b5b4f]"}>{item.value >= 0 ? `+${item.value}` : item.value}</span></div>
                      <div className="mt-1 text-xs text-[#8a8378]">{item.note}</div>
                    </div>
                  ))}
                  <div className="border-t border-[#e7e0d4] pt-3 text-xs leading-5 text-[#8a8378]">
                    计算逻辑：基础参考分 70 + 生肖关系项 + 日主关系项 + 五行互补项 = 最终参考分。
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-[#e7e0d4] p-4">
                  <div className="text-base font-semibold">优势</div>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-[#756f66]">
                    {(result.compositeAnalysis?.advantages || []).map(
                      (item: string, index: number) => (
                        <li key={index} className="flex gap-2">
                          <span className="mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>

                <div className="rounded-xl border border-[#e7e0d4] p-4">
                  <div className="text-base font-semibold">注意事项</div>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-[#756f66]">
                    {(result.compositeAnalysis?.cautions || []).map(
                      (item: string, index: number) => (
                        <li key={index} className="flex gap-2">
                          <span className="mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>

              <p className="mt-5 text-xs leading-5 text-[#8a8378]">
                综合评分为产品算法生成的文化参考指标，不代表传统命理中的完整婚恋判断，也不应替代现实中的沟通与关系决策。
              </p>

              <div className="mt-6 flex flex-wrap gap-3 border-t border-[#e7e0d4] pt-5">
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="rounded-full border border-[#d9cdbc] bg-white px-5 py-3 text-sm font-medium text-[#6f5738]"
                >
                  重新填写
                </button>
                <button
                  type="button"
                  onClick={() => setShowShareCard(true)}
                  className="rounded-full bg-[#6f5738] px-5 py-3 text-sm font-medium text-white"
                >
                  生成分享卡
                </button>
              </div>
            </div>
          </section>
        )}

      </div>
    </main>
  );
}