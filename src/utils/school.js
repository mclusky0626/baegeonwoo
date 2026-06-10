export const EMPTY_SCHOOL = {
  schoolName: "",
  eduCode: "",
  schoolCode: "",
  region: "",
  kind: "",
  address: "",
  homepage: ""
};

export const KMLA_SCHOOL = {
  schoolName: "민족사관고등학교",
  eduCode: "K10",
  schoolCode: "7801132",
  region: "강원특별자치도",
  kind: "고등학교",
  address: "강원특별자치도 횡성군 안흥면 봉화로 800",
  homepage: "http://www.minjok.hs.kr"
};

export function resolveSchool(data = {}) {
  return {
    schoolName: data.schoolName || "",
    eduCode: data.eduCode || "",
    schoolCode: data.schoolCode || "",
    region: data.schoolRegion || data.region || "",
    kind: data.schoolKind || data.kind || "",
    address: data.schoolAddress || data.address || "",
    homepage: data.schoolHomepage || data.homepage || ""
  };
}

export function hasSchool(school = {}) {
  return Boolean(school.eduCode && school.schoolCode);
}

export function getSchoolInitials(name = "") {
  const compact = name
    .replace(/고등학교|중학교|초등학교|학교/g, "")
    .replace(/\s+/g, "")
    .trim();

  return (compact || name || "학").slice(0, 2);
}
