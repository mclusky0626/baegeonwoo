export const dietRestrictions = {
  "비건": [
    // exclude all animal-derived foods
    "돼지", "소", "쇠고기", "소고기", "닭", "치킨", "오리",
    "고등어", "갈치", "참치", "연어", "오징어", "새우", "게", "조개",
    "계란", "달걀", "난", "우유", "치즈", "버터", "요거트", "꿀"
  ],
  "락토오보": [
    // allow eggs and dairy, disallow meat and fish
    "돼지", "소", "쇠고기", "소고기", "닭", "치킨", "오리",
    "고등어", "갈치", "참치", "연어", "오징어", "새우", "게", "조개"
  ],
  "페스코": [
    // allow fish, disallow other meats
    "돼지", "소", "쇠고기", "소고기", "닭", "치킨", "오리"
  ],
  "일반식": [],
  "기타": []
};

export function violatesDiet(name = "", ingredients = [], type = "") {
  const rules = dietRestrictions[type] || [];
  if (rules.length === 0) return false;
  for (const kw of rules) {
    if (name.includes(kw)) return true;
    if (ingredients.some((ing) => ing.includes(kw))) return true;
  }
  return false;
}
