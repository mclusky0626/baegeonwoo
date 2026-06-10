import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import "./SettingsScreen.css";
import { auth, db } from "../firebase";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { NEIS_ALLERGENS } from "../utils/mealUtils";
import { EMPTY_SCHOOL, getSchoolInitials, hasSchool, resolveSchool } from "../utils/school";

const RELIGIONS = ["이슬람", "힌두교", "불교", "기독교", "없음"];
const DIET_TYPES = ["일반식", "비건", "락토오보", "페스코"];

export const SettingsScreen = () => {
  const { t } = useTranslation();
  const [schoolName, setSchoolName] = useState("");
  const [schoolMeta, setSchoolMeta] = useState(EMPTY_SCHOOL);
  const [schoolList, setSchoolList] = useState([]);
  const [schoolSelected, setSchoolSelected] = useState(true);
  const [religion, setReligion] = useState([]);
  const [dietType, setDietType] = useState("일반식");
  const [allergies, setAllergies] = useState([]);
  const [saveMsg, setSaveMsg] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const snap = await getDoc(doc(db, "users", user.uid));
      const data = snap.exists() ? snap.data() : {};
      const resolvedSchool = resolveSchool(data);

      setSchoolName(resolvedSchool.schoolName);
      setSchoolMeta(resolvedSchool);
      setReligion(data.religion || []);
      setDietType(data.dietType || "일반식");
      setAllergies(data.allergies || []);
      setSchoolSelected(Boolean(data.schoolCode));
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchSchools = async () => {
      if (schoolName.trim().length < 2 || schoolSelected) {
        setSchoolList([]);
        return;
      }

      const params = new URLSearchParams({
        Type: "json",
        SCHUL_NM: schoolName.trim()
      });
      if (import.meta.env.VITE_NEIS_API_KEY) {
        params.set("KEY", import.meta.env.VITE_NEIS_API_KEY);
      }

      try {
        const res = await fetch(`https://open.neis.go.kr/hub/schoolInfo?${params.toString()}`);
        const data = await res.json();
        setSchoolList(data?.schoolInfo?.[1]?.row || []);
      } catch {
        setSchoolList([]);
      }
    };

    fetchSchools();
  }, [schoolName, schoolSelected]);

  const handleSelectSchool = (school) => {
    const nextSchool = {
      schoolName: school.SCHUL_NM,
      eduCode: school.ATPT_OFCDC_SC_CODE,
      schoolCode: school.SD_SCHUL_CODE,
      region: school.LCTN_SC_NM,
      kind: school.SCHUL_KND_SC_NM,
      address: school.ORG_RDNMA,
      homepage: school.HMPG_ADRES
    };

    setSchoolName(nextSchool.schoolName);
    setSchoolMeta(nextSchool);
    setSchoolList([]);
    setSchoolSelected(true);
    inputRef.current?.blur();
  };

  const handleReligionChange = (value) => {
    setReligion((prev) => {
      if (value === "없음") return prev.includes("없음") ? [] : ["없음"];
      const withoutNone = prev.filter((item) => item !== "없음");
      return withoutNone.includes(value)
        ? withoutNone.filter((item) => item !== value)
        : [...withoutNone, value];
    });
  };

  const handleToggleAllergy = (value) => {
    setAllergies((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const handleSave = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setSaveMsg(t("login_required"));
        return;
      }

      await setDoc(doc(db, "users", user.uid), {
        schoolName: schoolMeta.schoolName || schoolName,
        eduCode: schoolMeta.eduCode,
        schoolCode: schoolMeta.schoolCode,
        schoolRegion: schoolMeta.region,
        schoolKind: schoolMeta.kind,
        schoolAddress: schoolMeta.address,
        schoolHomepage: schoolMeta.homepage,
        religion,
        dietType,
        allergies,
        updatedAt: serverTimestamp()
      }, { merge: true });

      setSaveMsg(t("save_success"));
      setTimeout(() => setSaveMsg(""), 2200);
    } catch (error) {
      setSaveMsg(`${t("save_failed")}${error.message}`);
    }
  };

  return (
    <main className="settings-screen">
      <header className="settings-header">
        <p>{t("settings_kicker")}</p>
        <h1>{t("settings_title")}</h1>
      </header>

      <section className="settings-section school-section">
        <div className="section-title-row">
          <div className={`school-logo-mark ${hasSchool(schoolMeta) ? "" : "empty"}`}>
            {hasSchool(schoolMeta) ? getSchoolInitials(schoolMeta.schoolName || schoolName) : "학"}
          </div>
          <div>
            <p>{t("select_school")}</p>
            <h2>{schoolMeta.schoolName || schoolName || t("select_school_first")}</h2>
          </div>
        </div>
        <input
          ref={inputRef}
          className="school-input-box"
          type="text"
          placeholder={t("school_input_placeholder")}
          value={schoolName}
          onChange={(event) => {
            setSchoolName(event.target.value);
            setSchoolSelected(false);
          }}
          autoComplete="off"
        />
        {schoolList.length > 0 && (
          <ul className="suggestion-list">
            {schoolList.map((school) => (
              <li key={`${school.ATPT_OFCDC_SC_CODE}-${school.SD_SCHUL_CODE}`}>
                <button type="button" onClick={() => handleSelectSchool(school)}>
                  <strong>{school.SCHUL_NM}</strong>
                  <span>{school.LCTN_SC_NM} · {school.SCHUL_KND_SC_NM}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="settings-section">
        <div className="settings-section-heading">
          <p>{t("religion_multi")}</p>
          <h2>{t("religion_select")}</h2>
        </div>
        <div className="option-grid compact">
          {RELIGIONS.map((item) => (
            <label key={item} className={religion.includes(item) ? "option-chip selected" : "option-chip"}>
              <input
                type="checkbox"
                checked={religion.includes(item)}
                onChange={() => handleReligionChange(item)}
              />
              {t(item)}
            </label>
          ))}
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-section-heading">
          <p>{t("meal_filter")}</p>
          <h2>{t("diet_type")}</h2>
        </div>
        <div className="option-grid compact">
          {DIET_TYPES.map((item) => (
            <label key={item} className={dietType === item ? "option-chip selected" : "option-chip"}>
              <input
                type="radio"
                name="dietType"
                checked={dietType === item}
                onChange={() => setDietType(item)}
              />
              {t(item)}
            </label>
          ))}
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-section-heading">
          <p>{t("allergy_standard")}</p>
          <h2>{t("allergy_check")}</h2>
        </div>
        <div className="option-grid allergens">
          {NEIS_ALLERGENS.map((item) => (
            <label
              key={item.code}
              className={allergies.includes(item.value) ? "option-chip selected" : "option-chip"}
            >
              <input
                type="checkbox"
                checked={allergies.includes(item.value)}
                onChange={() => handleToggleAllergy(item.value)}
              />
              <span>{item.code}</span>
              {t(item.value)}
            </label>
          ))}
        </div>
      </section>

      <div className="bottom-section">
        <button className="save-button" onClick={handleSave}>
          {t("save")}
        </button>
        {saveMsg && <div className="save-message">{saveMsg}</div>}
      </div>
    </main>
  );
};

export default SettingsScreen;
