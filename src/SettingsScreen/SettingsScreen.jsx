import React, { useState, useEffect,useRef } from "react";
import "./SettingsScreen.css";
import { db, auth } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import {Layout} from "../components/Layout";
export const SettingsScreen = ({ onNavigate }) => {
  // 학교 관련
  const [schoolName, setSchoolName] = useState("");        // 사용자가 입력하는 학교명
  const [schoolList, setSchoolList] = useState([]);        // 추천 학교 리스트
  const [eduCode, setEduCode] = useState("");              // 시도교육청코드
  const [schoolCode, setSchoolCode] = useState("");        // 행정표준코드

  // 기타 설정
  const [religion, setReligion] = useState([]);
  const [dietType, setDietType] = useState("");
  const [allergyInput, setAllergyInput] = useState("");
  const [allergies, setAllergies] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [saveMsg, setSaveMsg] = useState("");
  const inputRef = useRef(null);
  const allergyList = [
    "난류", "우유", "메밀", "땅콩", "대두", "밀", "고등어", "게", "새우",
    "돼지고기", "복숭아", "토마토", "아황산류", "호두", "닭고기", "쇠고기", "오징어", "조개류"
  ];

  // 학교명 입력시 네이스 학교정보 검색 API 호출 (2글자 이상일 때만)
  useEffect(() => {
    const fetchSchools = async () => {
      if (schoolName.length < 2) { setSchoolList([]); return; }
      const url = `https://open.neis.go.kr/hub/schoolInfo?KEY=7730a6275172463a8ab608807131a22c&Type=json&SCHUL_NM=${encodeURIComponent(schoolName)}`;
      try {
        const res = await fetch(url);
        const data = await res.json();
        const rows = data?.schoolInfo?.[1]?.row || [];
        setSchoolList(rows);
      } catch {
        setSchoolList([]);
      }
    };
    fetchSchools();
  }, [schoolName]);

  // 학교 선택 시
  const handleSelectSchool = (school) => {
    setSchoolName(school.SCHUL_NM);
    setEduCode(school.ATPT_OFCDC_SC_CODE);
    setSchoolCode(school.SD_SCHUL_CODE);
    setSchoolList([]);
    if (inputRef.current) inputRef.current.blur();
  };

  // Firestore에서 사용자 정보 불러오기
  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const d = snap.data();
        setSchoolName(d.schoolName || "");
        setEduCode(d.eduCode || "");
        setSchoolCode(d.schoolCode || "");
        setReligion(d.religion || []);
        setDietType(d.dietType || "");
        setAllergies(d.allergies || []);
      }
    };
    fetchData();
  }, []);

  const religions = ["이슬람", "힌두교", "불교", "기독교", "없음"];
  const dietTypes = ["일반식", "비건", "락토오보", "페스코", "기타"];

  // 종교 변경
  const handleReligionChange = (r) => {
    setReligion((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
    );
  };

  // 식생활유형 변경
  const handleDietChange = (d) => setDietType(d);

  // 알러지 입력 (자동완성)
  const handleAllergyInputChange = (e) => {
    const value = e.target.value;
    setAllergyInput(value);
    if (value) {
      const suggestions = allergyList.filter(
        (item) => item.includes(value) && !allergies.includes(item)
      );
      setFilteredSuggestions(suggestions);
    } else {
      setFilteredSuggestions([]);
    }
  };

  const handleSelectSuggestion = (item) => {
    setAllergies([...allergies, item]);
    setAllergyInput("");
    setFilteredSuggestions([]);
  };

  const handleRemoveAllergy = (val) => {
    setAllergies(allergies.filter((a) => a !== val));
  };

  // 저장
  const handleSave = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setSaveMsg("로그인이 필요합니다");
        return;
      }
      await setDoc(doc(db, "users", user.uid), {
        schoolName, eduCode, schoolCode,
        religion,
        dietType,
        allergies,
        updatedAt: new Date()
      }, { merge: true });
      setSaveMsg("✅ 저장 완료!");
      setTimeout(() => setSaveMsg(""), 2000);
    } catch (e) {
      setSaveMsg("저장 실패: " + e.message);
    }
  };

  return (
    
    <div className="settings-screen">
      <div className="header">
        <div className="div">급식 맞춤 설정</div>
      </div>
      <div className="content">
        {/* 학교 검색/선택 */}
        <div className="school-section">
          <div className="div2">학교 선택</div>
          <input
            ref={inputRef}
            className="school-input-box"
            type="text"
            placeholder="학교명을 입력하세요"
            value={schoolName}
            onChange={e => setSchoolName(e.target.value)}
            autoComplete="off"
          />
          {/* 추천학교 목록 */}
          {schoolList.length > 0 &&
            <ul className="suggestion-list">
              {schoolList.map((s, idx) => (
                <li key={idx} className="suggestion-item"
                  onClick={() => handleSelectSchool(s)}
                  style={{ cursor: "pointer", padding: "5px 8px", borderBottom: "1px solid #eee" }}
                >
                  {s.SCHUL_NM} ({s.LCTN_SC_NM}) {s.SCHUL_KND_SC_NM}
                </li>
              ))}
            </ul>
          }
        </div>

        {/* 종교 선택 */}
        <div className="religion-section">
          <div className="div4">종교 선택 (중복 선택 가능)</div>
          <div className="religion-options">
            {religions.map((r) => (
              <label
                key={r}
                className={"religion-option " + (religion.includes(r) ? "selected" : "")}
              >
                <input
                  type="checkbox"
                  checked={religion.includes(r)}
                  onChange={() => handleReligionChange(r)}
                  style={{ display: "none" }}
                />
                {r}
              </label>
            ))}
          </div>
        </div>

        {/* 식생활유형 */}
        <div className="diet-section">
          <div className="div2">식생활 유형</div>
          <div className="diet-options">
            {dietTypes.map((d) => (
              <label
                key={d}
                className={"diet-option " + (dietType === d ? "selected" : "")}
              >
                <input
                  type="radio"
                  name="dietType"
                  checked={dietType === d}
                  onChange={() => handleDietChange(d)}
                  style={{ display: "none" }}
                />
                {d}
              </label>
            ))}
          </div>
        </div>

        {/* 알러지 */}
        <div className="allergy-section">
          <div className="div2">알레르기 체크</div>
          <div className="allergy-input">
            <input
              className="allergy-input-box"
              type="text"
              placeholder="예: 우유, 밀, 땅콩 등"
              value={allergyInput}
              onChange={handleAllergyInputChange}
            />
          </div>

          {filteredSuggestions.length > 0 && (
            <ul className="suggestion-list">
              {filteredSuggestions.map((item) => (
                <li
                  key={item}
                  className="suggestion-item"
                  onClick={() => handleSelectSuggestion(item)}
                >
                  {item}
                </li>
              ))}
            </ul>
          )}

          <div className="selected-allergies">
            {allergies.map((a) => (
              <span className="allergy-badge" key={a}>
                {a}
                <button className="remove-btn" onClick={() => handleRemoveAllergy(a)}>
                  x
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bottom-section">
        <button className="save-button" onClick={handleSave}>
          저장하기
        </button>
        {saveMsg && <div style={{ marginTop: 8, color: "#28a745" }}>{saveMsg}</div>}
      </div>

      {/* 하단 탭바 (그대로) */}
      
      
    </div>
    
  );
};

export default SettingsScreen;
