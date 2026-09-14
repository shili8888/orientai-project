"use client";

import { useMemo, useState } from "react";
import {
  createLunarDate,
  toGregorian,
} from "lunar";
import { getCascaderData } from "cn-division";

type CalendarType = "solar" | "lunar";
type TimeMode = "exact" | "shichen" | "unknown";

type Region = {
  label: string;
  value: string;
  children?: Region[];
};

type Person = {
  name: string;
  gender: "男" | "女";

  calendar: CalendarType;

  solarYear: number;
  solarMonth: number;
  solarDay: number;

  lunarYear: number;
  lunarMonth: number;
  lunarDay: number;
  lunarLeap: boolean;

  timeMode: TimeMode;
  hour: number;
  minute: number;
  shichen: string;

  province: string;
  city: string;
  county: string;
};

const SHICHEN = [
  { name: "子时", start: "23:00", end: "01:00" },
  { name: "丑时", start: "01:00", end: "03:00" },
  { name: "寅时", start: "03:00", end: "05:00" },
  { name: "卯时", start: "05:00", end: "07:00" },
  { name: "辰时", start: "07:00", end: "09:00" },
  { name: "巳时", start: "09:00", end: "11:00" },
  { name: "午时", start: "11:00", end: "13:00" },
  { name: "未时", start: "13:00", end: "15:00" },
  { name: "申时", start: "15:00", end: "17:00" },
  { name: "酉时", start: "17:00", end: "19:00" },
  { name: "戌时", start: "19:00", end: "21:00" },
  { name: "亥时", start: "21:00", end: "23:00" },
];

const LUNAR_MONTHS = [
  { value: 1, label: "正月" },
  { value: 2, label: "二月" },
  { value: 3, label: "三月" },
  { value: 4, label: "四月" },
  { value: 5, label: "五月" },
  { value: 6, label: "六月" },
  { value: 7, label: "七月" },
  { value: 8, label: "八月" },
  { value: 9, label: "九月" },
  { value: 10, label: "十月" },
  { value: 11, label: "冬月" },
  { value: 12, label: "腊月" },
];

const LUNAR_DAYS = Array.from({ length: 30 }, (_, i) => {
  const n = i + 1;

  if (n <= 10) {
    return {
      value: n,
      label: n === 10 ? "初十" : `初${n}`,
    };
  }

  if (n <= 20) {
    return {
      value: n,
      label: n === 20 ? "二十" : `十${n - 10}`,
    };
  }

  if (n <= 29) {
    return {
      value: n,
      label: n === 21 ? "廿一" : n === 22 ? "廿二" : n === 23
        ? "廿三"
        : n === 24
        ? "廿四"
        : n === 25
        ? "廿五"
        : n === 26
        ? "廿六"
        : n === 27
        ? "廿七"
        : n === 28
        ? "廿八"
        : "廿九",
    };
  }

  return {
    value: 30,
    label: "三十",
  };
});

const ZODIAC = [
  "鼠",
  "牛",
  "虎",
  "兔",
  "龙",
  "蛇",
  "马",
  "羊",
  "猴",
  "鸡",
  "狗",
  "猪",
];

const LIUHE: Record<string, string> = {
  鼠: "牛",
  牛: "鼠",
  虎: "猪",
  猪: "虎",
  兔: "狗",
  狗: "兔",
  龙: "鸡",
  鸡: "龙",
  蛇: "猴",
  猴: "蛇",
  马: "羊",
  羊: "马",
};

const CHONG: Record<string, string> = {
  鼠: "马",
  马: "鼠",
  牛: "羊",
  羊: "牛",
  虎: "猴",
  猴: "虎",
  兔: "鸡",
  鸡: "兔",
  龙: "狗",
  狗: "龙",
  蛇: "猪",
  猪: "蛇",
};

const HAI: Record<string, string> = {
  鼠: "羊",
  羊: "鼠",
  牛: "马",
  马: "牛",
  虎: "蛇",
  蛇: "虎",
  兔: "龙",
  龙: "兔",
  猪: "猴",
  猴: "猪",
  狗: "鸡",
  鸡: "狗",
};

const PO: Record<string, string> = {
  鼠: "鸡",
  鸡: "鼠",
  牛: "龙",
  龙: "牛",
  虎: "猪",
  猪: "虎",
  兔: "马",
  马: "兔",
  蛇: "猴",
  猴: "蛇",
  羊: "狗",
  狗: "羊",
};

const SANHE: Record<string, string[]> = {
  鼠: ["龙", "猴"],
  龙: ["鼠", "猴"],
  猴: ["鼠", "龙"],

  牛: ["蛇", "鸡"],
  蛇: ["牛", "鸡"],
  鸡: ["牛", "蛇"],

  虎: ["马", "狗"],
  马: ["虎", "狗"],
  狗: ["虎", "马"],

  兔: ["猪", "羊"],
  猪: ["兔", "羊"],
  羊: ["兔", "猪"],
};

function createDefaultPerson(name: string): Person {
  return {
    name,
    gender: name === "本人" ? "男" : "女",

    calendar: "solar",

    solarYear: 1995,
    solarMonth: 8,
    solarDay: 15,

    lunarYear: 1995,
    lunarMonth: 6,
    lunarDay: 20,
    lunarLeap: false,

    timeMode: "exact",
    hour: 14,
    minute: 30,
    shichen: "未时",

    province: "",
    city: "",
    county: "",
  };
}

function getZodiac(year: number) {
  return ZODIAC[(year - 4) % 12];
}

function getLunarMonthDays(year: number, month: number, isLeapMonth: boolean) {
  try {
    createLunarDate({
      year,
      month,
      day: 30,
      isLeapMonth,
    });

    return 30;
  } catch {
    return 29;
  }
}

function getLeapMonth(year: number): number | null {
  for (let month = 1; month <= 12; month++) {
    try {
      const date = createLunarDate({
        year,
        month,
        day: 1,
        isLeapMonth: true,
      });

      toGregorian(date);

      return month;
    } catch {
      // 当前月份不是闰月
    }
  }

  return null;
}

function convertLunarToSolar(person: Person) {
  const lunarDate = createLunarDate({
    year: Number(person.lunarYear),
    month: Number(person.lunarMonth),
    day: Number(person.lunarDay),
    isLeapMonth: person.lunarLeap,
  });

  const result = toGregorian(lunarDate);
  const date = result.date;

  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

function getTimeText(person: Person) {
  if (person.timeMode === "unknown") {
    return "午时（参考）";
  }

  if (person.timeMode === "shichen") {
    return person.shichen;
  }

  return `${String(person.hour).padStart(2, "0")}:${String(
    person.minute
  ).padStart(2, "0")}`;
}

export default function CompatibilityPage() {
  const [personA, setPersonA] = useState<Person>(
    createDefaultPerson("本人")
  );

  const [personB, setPersonB] = useState<Person>(
    createDefaultPerson("TA")
  );

  const [showResult, setShowResult] = useState(false);

  const regions = useMemo(() => {
    return getCascaderData() as Region[];
  }, []);

  const provinceA = regions.find(
    (item) => item.value === personA.province
  );

  const provinceB = regions.find(
    (item) => item.value === personB.province
  );

  const citiesA = provinceA?.children ?? [];
  const citiesB = provinceB?.children ?? [];

  const cityA = citiesA.find((item) => item.value === personA.city);
  const cityB = citiesB.find((item) => item.value === personB.city);

  const countiesA = cityA?.children ?? [];
  const countiesB = cityB?.children ?? [];

  const leapMonthA = getLeapMonth(personA.lunarYear);
  const leapMonthB = getLeapMonth(personB.lunarYear);

  function updatePersonA<K extends keyof Person>(
    key: K,
    value: Person[K]
  ) {
    setPersonA((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function updatePersonB<K extends keyof Person>(
    key: K,
    value: Person[K]
  ) {
    setPersonB((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function changeProvince(
    person: "A" | "B",
    province: string
  ) {
    if (person === "A") {
      setPersonA((prev) => ({
        ...prev,
        province,
        city: "",
        county: "",
      }));
    } else {
      setPersonB((prev) => ({
        ...prev,
        province,
        city: "",
        county: "",
      }));
    }
  }

  function changeCity(
    person: "A" | "B",
    city: string
  ) {
    if (person === "A") {
      setPersonA((prev) => ({
        ...prev,
        city,
        county: "",
      }));
    } else {
      setPersonB((prev) => ({
        ...prev,
        city,
        county: "",
      }));
    }
  }

  function calculate() {
    let solarA = {
      year: personA.solarYear,
      month: personA.solarMonth,
      day: personA.solarDay,
    };

    let solarB = {
      year: personB.solarYear,
      month: personB.solarMonth,
      day: personB.solarDay,
    };

    try {
      if (personA.calendar === "lunar") {
        solarA = convertLunarToSolar(personA);
      }

      if (personB.calendar === "lunar") {
        solarB = convertLunarToSolar(personB);
      }
    } catch (error) {
      console.error(error);
      alert("农历日期转换失败，请检查日期是否有效。");
      return;
    }

    console.log("本人标准日期", solarA);
    console.log("TA标准日期", solarB);

    setShowResult(true);
  }

  function renderPersonCard(
    person: Person,
    update: <K extends keyof Person>(
      key: K,
      value: Person[K]
    ) => void,
    type: "A" | "B"
  ) {
    const leapMonth = type === "A" ? leapMonthA : leapMonthB;
    const cities = type === "A" ? citiesA : citiesB;
    const counties = type === "A" ? countiesA : countiesB;

    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-slate-900">
              {type === "A" ? "本人信息" : "TA的信息"}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              用于婚恋合盘计算
            </div>
          </div>

          <div className="rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-700">
            {person.gender}
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              称呼
            </label>

            <input
              value={person.name}
              onChange={(e) =>
                update("name", e.target.value)
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400"
              placeholder="例如：本人、TA"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              性别
            </label>

            <div className="grid grid-cols-2 gap-3">
              {(["男", "女"] as const).map((gender) => (
                <button
                  key={gender}
                  type="button"
                  onClick={() => update("gender", gender)}
                  className={`rounded-xl border px-4 py-3 text-sm ${
                    person.gender === gender
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  {gender}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              出生历法
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => update("calendar", "solar")}
                className={`rounded-xl border px-4 py-3 text-sm ${
                  person.calendar === "solar"
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 text-slate-700"
                }`}
              >
                公历
              </button>

              <button
                type="button"
                onClick={() => update("calendar", "lunar")}
                className={`rounded-xl border px-4 py-3 text-sm ${
                  person.calendar === "lunar"
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 text-slate-700"
                }`}
              >
                农历
              </button>
            </div>
          </div>

          {person.calendar === "solar" ? (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                出生日期
              </label>

              <div className="grid grid-cols-3 gap-2">
                <select
                  value={person.solarYear}
                  onChange={(e) =>
                    update("solarYear", Number(e.target.value))
                  }
                  className="rounded-xl border border-slate-200 bg-white px-3 py-3"
                >
                  {Array.from(
                    { length: 111 },
                    (_, i) => 2100 - i
                  ).map((year) => (
                    <option key={year} value={year}>
                      {year}年
                    </option>
                  ))}
                </select>

                <select
                  value={person.solarMonth}
                  onChange={(e) =>
                    update("solarMonth", Number(e.target.value))
                  }
                  className="rounded-xl border border-slate-200 bg-white px-3 py-3"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(
                    (month) => (
                      <option key={month} value={month}>
                        {month}月
                      </option>
                    )
                  )}
                </select>

                <select
                  value={person.solarDay}
                  onChange={(e) =>
                    update("solarDay", Number(e.target.value))
                  }
                  className="rounded-xl border border-slate-200 bg-white px-3 py-3"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(
                    (day) => (
                      <option key={day} value={day}>
                        {day}日
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>
          ) : (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                农历出生日期
              </label>

              <div className="grid grid-cols-3 gap-2">
                <select
                  value={person.lunarYear}
                  onChange={(e) =>
                    update("lunarYear", Number(e.target.value))
                  }
                  className="rounded-xl border border-slate-200 bg-white px-3 py-3"
                >
                  {Array.from(
                    { length: 211 },
                    (_, i) => 2100 - i
                  ).map((year) => (
                    <option key={year} value={year}>
                      {year}年
                    </option>
                  ))}
                </select>

                <select
                  value={person.lunarMonth}
                  onChange={(e) => {
                    const month = Number(e.target.value);

                    update("lunarMonth", month);
                    update("lunarDay", 1);
                    update("lunarLeap", false);
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-3"
                >
                  {LUNAR_MONTHS.map((month) => (
                    <option
                      key={month.value}
                      value={month.value}
                    >
                      {month.label}
                    </option>
                  ))}
                </select>

                <select
                  value={person.lunarDay}
                  onChange={(e) =>
                    update("lunarDay", Number(e.target.value))
                  }
                  className="rounded-xl border border-slate-200 bg-white px-3 py-3"
                >
                  {LUNAR_DAYS
                    .filter(
                      (day) =>
                        day.value <=
                        getLunarMonthDays(
                          person.lunarYear,
                          person.lunarMonth,
                          person.lunarLeap
                        )
                    )
                    .map((day) => (
                      <option
                        key={day.value}
                        value={day.value}
                      >
                        {day.label}
                      </option>
                    ))}
                </select>
              </div>

              {leapMonth === person.lunarMonth && (
                <button
                  type="button"
                  onClick={() =>
                    update(
                      "lunarLeap",
                      !person.lunarLeap
                    )
                  }
                  className={`mt-3 rounded-xl border px-4 py-2 text-sm ${
                    person.lunarLeap
                      ? "border-amber-500 bg-amber-50 text-amber-700"
                      : "border-slate-200 text-slate-600"
                  }`}
                >
                  {person.lunarLeap
                    ? "闰月已选择"
                    : "这是闰月，点击选择"}
                </button>
              )}

              <div className="mt-2 text-xs text-slate-400">
                支持正月、冬月、腊月及闰月
              </div>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              出生时间
            </label>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() =>
                  update("timeMode", "exact")
                }
                className={`w-full rounded-xl border px-4 py-3 text-left text-sm ${
                  person.timeMode === "exact"
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 text-slate-700"
                }`}
              >
                精准时间
              </button>

              {person.timeMode === "exact" && (
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={person.hour}
                    onChange={(e) =>
                      update(
                        "hour",
                        Number(e.target.value)
                      )
                    }
                    className="rounded-xl border border-slate-200 bg-white px-3 py-3"
                  >
                    {Array.from(
                      { length: 24 },
                      (_, i) => i
                    ).map((hour) => (
                      <option key={hour} value={hour}>
                        {String(hour).padStart(2, "0")}时
                      </option>
                    ))}
                  </select>

                  <select
                    value={person.minute}
                    onChange={(e) =>
                      update(
                        "minute",
                        Number(e.target.value)
                      )
                    }
                    className="rounded-xl border border-slate-200 bg-white px-3 py-3"
                  >
                    {Array.from(
                      { length: 60 },
                      (_, i) => i
                    ).map((minute) => (
                      <option key={minute} value={minute}>
                        {String(minute).padStart(2, "0")}分
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="button"
                onClick={() =>
                  update("timeMode", "shichen")
                }
                className={`w-full rounded-xl border px-4 py-3 text-left text-sm ${
                  person.timeMode === "shichen"
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 text-slate-700"
                }`}
              >
                选择时辰
              </button>

              {person.timeMode === "shichen" && (
                <select
                  value={person.shichen}
                  onChange={(e) =>
                    update(
                      "shichen",
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3"
                >
                  {SHICHEN.map((item) => (
                    <option
                      key={item.name}
                      value={item.name}
                    >
                      {item.name}（{item.start}–{item.end}）
                    </option>
                  ))}
                </select>
              )}

              <button
                type="button"
                onClick={() =>
                  update("timeMode", "unknown")
                }
                className={`w-full rounded-xl border px-4 py-3 text-left text-sm ${
                  person.timeMode === "unknown"
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 text-slate-700"
                }`}
              >
                时间不确定
              </button>

              {person.timeMode === "unknown" && (
                <div className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-700">
                  时间不确定时，系统暂以午时（11:00–13:00）作为参考。
                  <br />
                  最终时柱仅作参考，不视为精准出生时刻。
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              出生地点
            </label>

            <div className="space-y-2">
              <select
                value={person.province}
                onChange={(e) =>
                  changeProvince(
                    type,
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3"
              >
                <option value="">
                  请选择省 / 自治区 / 直辖市
                </option>

                {regions.map((province) => (
                  <option
                    key={province.value}
                    value={province.value}
                  >
                    {province.label}
                  </option>
                ))}
              </select>

              <select
                value={person.city}
                onChange={(e) =>
                  changeCity(
                    type,
                    e.target.value
                  )
                }
                disabled={!person.province}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 disabled:bg-slate-50"
              >
                <option value="">
                  请选择城市
                </option>

                {cities.map((city) => (
                  <option
                    key={city.value}
                    value={city.value}
                  >
                    {city.label}
                  </option>
                ))}
              </select>

              <select
                value={person.county}
                onChange={(e) =>
                  update(
                    "county",
                    e.target.value
                  )
                }
                disabled={!person.city}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 disabled:bg-slate-50"
              >
                <option value="">
                  请选择区 / 县 / 县级市
                </option>

                {counties.map((county) => (
                  <option
                    key={county.value}
                    value={county.value}
                  >
                    {county.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-2 text-xs text-slate-400">
              出生地点将用于后续真太阳时计算。
            </div>
          </div>
        </div>
      </div>
    );
  }

  const solarA =
    personA.calendar === "lunar"
      ? (() => {
          try {
            return convertLunarToSolar(personA);
          } catch {
            return null;
          }
        })()
      : {
          year: personA.solarYear,
          month: personA.solarMonth,
          day: personA.solarDay,
        };

  const solarB =
    personB.calendar === "lunar"
      ? (() => {
          try {
            return convertLunarToSolar(personB);
          } catch {
            return null;
          }
        })()
      : {
          year: personB.solarYear,
          month: personB.solarMonth,
          day: personB.solarDay,
        };

  const zodiacA = solarA
    ? getZodiac(solarA.year)
    : "—";

  const zodiacB = solarB
    ? getZodiac(solarB.year)
    : "—";

  const zodiacResult =
    zodiacA === zodiacB
      ? {
          title: "生肖相同",
          text: "生肖相同，传统文化中通常会认为双方有较强的共同节奏，但实际关系仍需要结合完整八字。",
        }
      : LIUHE[zodiacA] === zodiacB
      ? {
          title: "六合",
          text: "双方生肖形成六合关系，传统命理中通常视为较有默契的一组组合。",
        }
      : SANHE[zodiacA]?.includes(zodiacB)
      ? {
          title: "三合",
          text: "双方生肖属于三合关系，传统命理中通常认为彼此容易形成互补与支持。",
        }
      : CHONG[zodiacA] === zodiacB
      ? {
          title: "相冲",
          text: "双方生肖存在相冲关系，传统命理中通常提示双方节奏、观念或相处方式容易出现明显差异。",
        }
      : HAI[zodiacA] === zodiacB
      ? {
          title: "相害",
          text: "双方生肖存在相害关系，传统命理中通常提示相处时需要更多理解和沟通。",
        }
      : PO[zodiacA] === zodiacB
      ? {
          title: "相破",
          text: "双方生肖存在相破关系，传统命理中通常提示关系中容易出现细节摩擦。",
        }
      : {
          title: "生肖关系平稳",
          text: "双方生肖没有形成主要六合、三合、相冲、相害或相破关系。",
        };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="mb-2 text-sm font-medium text-amber-600">
            东方命格 AI
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            婚恋合盘
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            输入双方出生信息，系统将按照统一的历法与出生时间规则进行合盘分析。
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {renderPersonCard(
            personA,
            updatePersonA,
            "A"
          )}

          {renderPersonCard(
            personB,
            updatePersonB,
            "B"
          )}
        </div>

        <div className="mt-8">
          <button
            type="button"
            onClick={calculate}
            className="w-full rounded-2xl bg-slate-900 px-6 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            开始婚恋合盘
          </button>

          <p className="mt-3 text-center text-xs text-slate-400">
            当前版本先完成历法转换与生肖关系基础计算，后续接入完整四柱合盘。
          </p>
        </div>

        {showResult && (
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <div className="text-sm font-medium text-amber-600">
                合盘基础结果
              </div>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                {personA.name} × {personB.name}
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="text-sm text-slate-500">
                  {personA.name}生肖
                </div>

                <div className="mt-2 text-3xl font-bold text-slate-900">
                  {zodiacA}
                </div>

                <div className="mt-2 text-xs text-slate-400">
                  {solarA
                    ? `${solarA.year}年${solarA.month}月${solarA.day}日`
                    : "日期转换失败"}
                </div>

                <div className="mt-2 text-xs text-slate-400">
                  出生时间：{getTimeText(personA)}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="text-sm text-slate-500">
                  {personB.name}生肖
                </div>

                <div className="mt-2 text-3xl font-bold text-slate-900">
                  {zodiacB}
                </div>

                <div className="mt-2 text-xs text-slate-400">
                  {solarB
                    ? `${solarB.year}年${solarB.month}月${solarB.day}日`
                    : "日期转换失败"}
                </div>

                <div className="mt-2 text-xs text-slate-400">
                  出生时间：{getTimeText(personB)}
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50 p-5">
              <div className="text-sm text-amber-700">
                生肖关系
              </div>

              <div className="mt-1 text-2xl font-bold text-slate-900">
                {zodiacResult.title}
              </div>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {zodiacResult.text}
              </p>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-5">
              <div className="font-semibold text-slate-900">
                下一层分析
              </div>

              <div className="mt-2 text-sm leading-6 text-slate-500">
                完整版本将在这里继续接入双方四柱、五行、十神、日主强弱、
                六合、三合、相冲、相害、相破，以及婚恋互动结构。
              </div>
            </div>
          </section>
        )}

        <div className="mt-8 pb-8 text-center text-xs leading-5 text-slate-400">
          本产品内容属于传统文化研究与娱乐参考，不构成医疗、法律、投资或其他专业建议。
        </div>
      </div>
    </main>
  );
}