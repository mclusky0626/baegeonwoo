import { violatesDiet } from "./dietRules";
import { violatesReligion } from "./religionRules";

export const NEIS_ALLERGENS = [
  { code: 1, value: "난류", label: "난류" },
  { code: 2, value: "우유", label: "우유" },
  { code: 3, value: "메밀", label: "메밀" },
  { code: 4, value: "땅콩", label: "땅콩" },
  { code: 5, value: "대두", label: "대두" },
  { code: 6, value: "밀", label: "밀" },
  { code: 7, value: "고등어", label: "고등어" },
  { code: 8, value: "게", label: "게" },
  { code: 9, value: "새우", label: "새우" },
  { code: 10, value: "돼지고기", label: "돼지고기" },
  { code: 11, value: "복숭아", label: "복숭아" },
  { code: 12, value: "토마토", label: "토마토" },
  { code: 13, value: "아황산류", label: "아황산류" },
  { code: 14, value: "호두", label: "호두" },
  { code: 15, value: "닭고기", label: "닭고기" },
  { code: 16, value: "쇠고기", label: "쇠고기" },
  { code: 17, value: "오징어", label: "오징어" },
  { code: 18, value: "조개류", label: "조개류(굴, 전복, 홍합 포함)" },
  { code: 19, value: "잣", label: "잣" }
];

export const allergyMap = NEIS_ALLERGENS.reduce((map, item) => {
  map[item.code] = item.value;
  return map;
}, {});

export const MEAL_ORDER = ["1", "2", "3"];

export function getDateYMD(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

export function getDateDisplay(date, language = "ko") {
  const yyyy = date.getFullYear();
  const mm = date.getMonth() + 1;
  const dd = date.getDate();
  const dayNames = language === "en"
    ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    : ["일", "월", "화", "수", "목", "금", "토"];
  const day = dayNames[date.getDay()];

  return language === "en"
    ? `${yyyy}-${mm}-${dd} (${day})`
    : `${yyyy}년 ${mm}월 ${dd}일 (${day})`;
}

export function buildMealUrl({ eduCode, schoolCode, date, from, to, size = 100 }) {
  const params = new URLSearchParams({
    Type: "json",
    pIndex: "1",
    pSize: String(size),
    ATPT_OFCDC_SC_CODE: eduCode,
    SD_SCHUL_CODE: schoolCode
  });

  const apiKey = import.meta.env.VITE_NEIS_API_KEY;
  if (apiKey) params.set("KEY", apiKey);
  if (date) params.set("MLSV_YMD", getDateYMD(date));
  if (from) params.set("MLSV_FROM_YMD", from);
  if (to) params.set("MLSV_TO_YMD", to);

  return `https://open.neis.go.kr/hub/mealServiceDietInfo?${params.toString()}`;
}

export function parseDishLine(line = "") {
  const normalized = line.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const codeMatches = [...normalized.matchAll(/\(([0-9.\s]+)\)/g)];
  const codes = codeMatches
    .flatMap((match) => match[1].split("."))
    .map((code) => Number(code.trim()))
    .filter((code) => Number.isInteger(code) && allergyMap[code]);
  const uniqueCodes = [...new Set(codes)];
  const ingredients = uniqueCodes.map((code) => allergyMap[code]);
  const name = normalized.replace(/\s*\([0-9.\s]+\)/g, "").trim();

  return {
    name: name || normalized,
    codes: uniqueCodes,
    ingredients
  };
}

export function parseMealRows(rows = []) {
  return rows
    .map((row) => ({
      code: String(row.MMEAL_SC_CODE || ""),
      name: row.MMEAL_SC_NM || "급식",
      date: row.MLSV_YMD,
      calories: row.CAL_INFO || "",
      nutrition: row.NTR_INFO || "",
      origin: row.ORPLC_INFO || "",
      dishes: String(row.DDISH_NM || "")
        .split("<br/>")
        .map(parseDishLine)
        .filter((dish) => dish.name)
    }))
    .sort((a, b) => MEAL_ORDER.indexOf(a.code) - MEAL_ORDER.indexOf(b.code));
}

export function assessDish(dish, { allergies = [], religions = [], dietType = "" } = {}) {
  const allergyHits = dish.ingredients.filter((ingredient) => allergies.includes(ingredient));
  const dietBan = violatesDiet(dish.name, dish.ingredients, dietType);
  const religionBan = violatesReligion(dish.name, religions);

  if (dietBan) {
    return { category: "excluded", labelKey: "diet_violation", hits: [] };
  }

  if (religionBan) {
    return { category: "excluded", labelKey: "religion_violation", hits: [] };
  }

  if (allergyHits.length) {
    return { category: "caution", labelKey: "allergy_warning", hits: allergyHits };
  }

  return { category: "safe", labelKey: "can_eat", hits: [] };
}

export function summarizeDishes(dishes = [], preferences = {}) {
  return dishes.reduce(
    (summary, dish) => {
      const assessment = assessDish(dish, preferences);
      summary[assessment.category] += 1;
      return summary;
    },
    { safe: 0, caution: 0, excluded: 0 }
  );
}
