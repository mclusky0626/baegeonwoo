import React, { useState, useEffect } from "react";
import "./SettingsScreen.css";
import { db, auth } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export const SettingsScreen = () => {
  const [school, setSchool] = useState("");
  const [religion, setReligion] = useState([]);
  const [dietType, setDietType] = useState("");
  const [allergyInput, setAllergyInput] = useState("");
  const [allergies, setAllergies] = useState([]);
  const [saveMsg, setSaveMsg] = useState("");

  // 이미 저장된 정보 불러오기
  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const d = snap.data();
        setSchool(d.school || "");
        setReligion(d.religion || []);
        setDietType(d.dietType || "");
        setAllergies(d.allergies || []);
      }
    };
    fetchData();
  }, []);

  // 종교 옵션
  const religions = ["이슬람", "힌두교", "불교", "기독교", "없음"];
  const dietTypes = ["일반식", "비건", "락토오보", "페스코", "기타"];

  const handleReligionChange = (r) => {
    setReligion((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
    );
  };

  const handleDietChange = (d) => setDietType(d);

  const handleAddAllergy = () => {
    const val = allergyInput.trim();
    if (val && !allergies.includes(val)) {
      setAllergies([...allergies, val]);
      setAllergyInput("");
    }
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
        school,
        religion,
        dietType,
        allergies,
        updatedAt: new Date()
      });
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
        <div className="school-section">
          <div className="div2">학교 선택</div>
          <input
            className="school-input-box"
            type="text"
            placeholder="학교를 입력하세요"
            value={school}
            onChange={e => setSchool(e.target.value)}
          />
        </div>

        <div className="religion-section">
          <div className="div4">종교 선택 (중복 선택 가능)</div>
          <div className="religion-options">
            {religions.map(r => (
              <label key={r} className={"religion-option " + (religion.includes(r) ? "selected" : "")}>
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

        <div className="diet-section">
          <div className="div2">식생활 유형</div>
          <div className="diet-options">
            {dietTypes.map(d => (
              <label key={d} className={"diet-option " + (dietType === d ? "selected" : "")}>
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

        <div className="allergy-section">
          <div className="div2">알레르기 체크</div>
          <div className="allergy-input">
            <input
              className="allergy-input-box"
              type="text"
              placeholder="알레르기 입력"
              value={allergyInput}
              onChange={e => setAllergyInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAddAllergy()}
            />
            <button className="plus-btn" onClick={handleAddAllergy}>추가</button>
          </div>
          <div className="selected-allergies">
            {allergies.map(a => (
              <span className="allergy-badge" key={a}>
                {a}
                <button className="remove-btn" onClick={() => handleRemoveAllergy(a)}>x</button>
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
    </div>
  );
};

export default SettingsScreen;
