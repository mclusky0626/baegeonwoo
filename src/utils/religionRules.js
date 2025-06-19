export const religionRestrictions = {
  "이슬람": [
    "돼지",
    "돈",
    "햄",
    "베이컨",
    "소세지"
  ],
  "힌두교": [
    "쇠고기",
    "소고기",
    "불고기",
    "스테이크"
  ],
  "불교": [
    "돼지",
    "돈",
    "햄",
    "베이컨",
    "소세지",
    "쇠고기",
    "소고기",
    "불고기",
    "스테이크",
    "닭",
    "치킨",
    "고등어",
    "갈치",
    "참치",
    "오징어",
    "새우",
    "게",
    "조개"
  ],
  "기독교": [],
  "없음": []
};

export function violatesReligion(name, selected = []) {
  for (const r of selected) {
    const keywords = religionRestrictions[r] || [];
    for (const kw of keywords) {
      if (name.includes(kw)) return true;
    }
  }
  return false;
}
