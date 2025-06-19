import "./Frame.css";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { signOut, onAuthStateChanged } from "firebase/auth";
import black from "../imgs/black.png";
import edit from "../imgs/edit.svg";
import knife from "../imgs/knifeandafork.svg";
import Vector from "../imgs/Vector.png";
import ok from "../imgs/ok.png";
import no from "../imgs/no.png";
import warn from "../imgs/warn.png";
import lock from "../imgs/lock.png";
import lang from "../imgs/lang.png";
import bell from "../imgs/bell.png";
import check from "../imgs/checkmate.svg";
import 'i18next'

const allergyMap = {
  1: "난류", 2: "우유", 3: "메밀", 4: "땅콩", 5: "대두", 6: "밀",
  7: "고등어", 8: "게", 9: "새우", 10: "돼지고기", 11: "복숭아",
  12: "토마토", 13: "아황산류", 14: "호두", 15: "닭고기", 16: "쇠고기",
  17: "오징어", 18: "조개류"
};

const getCurrentWeekRange = () => {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((day + 6) % 7));
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  const fmt = (d) => d.toISOString().slice(0, 10).replace(/-/g, "");
  return { from: fmt(monday), to: fmt(friday) };
};

export const Frame = ({ className = "" }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [showLangSelect, setShowLangSelect] = useState(false);
  const [stats, setStats] = useState({ good: 0, caution: 0, excluded: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  // 유저 데이터 로딩
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUserData(null);
        setLoading(false);
        return;
      }
      const ref = doc(db, "users", u.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setUserData(data);
        setNameInput(data.name || "");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      if (!userData) return;
      const { eduCode, schoolCode, allergies = [] } = userData;
      if (!eduCode || !schoolCode) { setStatsLoading(false); return; }
      setStatsLoading(true);
      try {
        const { from, to } = getCurrentWeekRange();
        const url = `https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=a27ba9b1a9144411a928c9358597817e&Type=json&pIndex=1&pSize=100&ATPT_OFCDC_SC_CODE=${eduCode}&SD_SCHUL_CODE=${schoolCode}&MLSV_FROM_YMD=${from}&MLSV_TO_YMD=${to}`;
        const res = await fetch(url);
        const data = await res.json();
        const rows = data?.mealServiceDietInfo?.[1]?.row || [];
        let count = { good: 0, caution: 0, excluded: 0 };
        for (const meal of rows) {
          const dishes = meal.DDISH_NM.split("<br/>");
          for (const dish of dishes) {
            const match = dish.match(/\(([^)]+)\)/);
            const codes = match ? match[1].split(".").map(Number) : [];
            const ingredients = codes.map((c) => allergyMap[c]).filter(Boolean);
            if (ingredients.length && allergies.length) {
              const overlap = ingredients.filter((i) => allergies.includes(i));
              if (overlap.length) { count.caution++; continue; }
            }
            count.good++;
          }
        }
        setStats(count);
      } catch (e) {
        console.error(e);
        setStats({ good: 0, caution: 0, excluded: 0 });
      }
      setStatsLoading(false);
    };
    fetchStats();
  }, [userData]);

  const handleSave = async () => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const ref = doc(db, "users", uid);
    await updateDoc(ref, {
      name: nameInput,
    });
    setUserData({ ...userData, name: nameInput });
    setEditMode(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert(t("logout_success"));
      window.location.reload();
    } catch (error) {
      console.error("로그아웃 실패:", error);
      alert(t("logout_failed"));
    }
  };

  if (loading) return <div className="frame">{t("loading")}</div>;
  if (!userData) {
    return (
      <div className="frame login-required">
        <h2>{t("login_required")}</h2>
        <p>{t("login_required_detail")}</p>
        <div className="btn-group">
          <button onClick={() => navigate("/")}>{t("go_home")}</button>
          <button onClick={() => window.location.reload()}>{t("login_again")}</button>
        </div>
      </div>
    );
  }

  // DB 구조 기준 변수명
  const name = userData.name || t("no_name");
  const school = userData.schoolName || t("no_school");
  const religion = (userData.religion && userData.religion.length > 0)
    ? userData.religion.join(", ")
    : t("none");
  const allergy = (userData.allergies && userData.allergies.length > 0)
    ? userData.allergies.join(", ")
    : t("none");
  const dietType = userData.dietType || t("none");

  const total = stats.good + stats.caution + stats.excluded;
  const goodPct = total ? Math.round((stats.good / total) * 100) : 0;
  const cautionPct = total ? Math.round((stats.caution / total) * 100) : 0;
  const excludePct = total ? Math.round((stats.excluded / total) * 100) : 0;

  return (
    <div className={`frame ${className}`}>
      <header className="header">
        <div className="title">{t("profile")}</div>
        <button className="settings-btn" onClick={() => navigate("/settings")}>
          <img src="settings0.svg" alt={t("settings")} />
        </button>
      </header>

      <div className="body">
        {/* 프로필 카드 */}
        <section className="card profile-card">
          <div className="profile-row">
            <img className="avatar" src={black} alt={t("profile")} />
            <div className="info">
              <div className="row name-row">
                {!editMode ? (
                  <>
                    <h3 className="name">{name}</h3>
                    <button className="edit-btn" onClick={() => setEditMode(true)}>
                      <img src={edit} alt={t("edit_name")} />
                    </button>
                  </>
                ) : (
                  <>
                    <input value={nameInput} onChange={(e) => setNameInput(e.target.value)} />
                    <button className="save-btn" onClick={handleSave}>
                      {t("save")}
                    </button>
                  </>
                )}
              </div>
              <div className="row school-row">
                <span className="school">{school}</span>
              </div>
            </div>
          </div>
        </section>

        {/* 급식 필터 기준 */}
        <section className="card filter-card">
          <div className="card-header">
            <div className="row">
              <img src={knife} alt="" />
              <h4>{t("meal_filter")}</h4>
            </div>
            <button className="edit-btn" onClick={() => navigate("/settings")}>
              {t("edit")}
            </button>
          </div>
          <ul className="filter-list">
            <li>{t("religion")}: {religion}</li>
            <li>{t("dietType")}: {dietType}</li>
            <li>{t("allergy")}: {allergy}</li>
          </ul>
        </section>

        {/* 통계 카드 */}
        <section className="card stats-card">
          <div className="card-header">
            <img src={Vector} alt="" />
            <h4>{t("my_meal_stats")}</h4>
          </div>
          <div className="stats-row">
            {statsLoading ? (
              <div>{t("loading")}</div>
            ) : (
              <>
                <div><img src={ok} alt={t("good")} /> {goodPct}%</div>
                <div><img src={warn} alt={t("caution")} /> {cautionPct}%</div>
                <div><img src={no} alt={t("excluded")} /> {excludePct}%</div>
              </>
            )}
          </div>
          <button className="detail-btn">{t("see_details")}</button>
        </section>

        {/* 언어 설정 */}
        <section className="card simple-card">
          <div className="row" style={{ position: "relative" }}>
            <img src={lang} alt={t("language")} />
            <span>{t("language_setting")}</span>
            <span className="value">
              {i18n.language === "ko" ? "한국어" : i18n.language === "en" ? "English" : i18n.language}
            </span>
            <button
              className="edit-btn"
              onClick={() => setShowLangSelect((v) => !v)}
              style={{ minWidth: 48 }}
            >
              {t("change")}
            </button>

            {/* 드롭다운 언어 선택 메뉴 */}
            {showLangSelect && (
              <div style={{
                position: "absolute", top: 36, right: 0, background: "#fff", border: "1px solid #ddd",
                borderRadius: 8, zIndex: 20, boxShadow: "0 4px 12px #0002"
              }}>
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  <li>
                    <button style={{ width: "100%", padding: "10px 20px", background: "none", border: "none", textAlign: "left" }}
                      onClick={() => { i18n.changeLanguage("ko"); setShowLangSelect(false); }}>
                      한국어
                    </button>
                  </li>
                  <li>
                    <button style={{ width: "100%", padding: "10px 20px", background: "none", border: "none", textAlign: "left" }}
                      onClick={() => { i18n.changeLanguage("en"); setShowLangSelect(false); }}>
                      English
                    </button>
                  </li>
                  <li>
                    <button style={{ width: "100%", padding: "10px 20px", background: "none", border: "none", textAlign: "left" }}
                      onClick={() => { i18n.changeLanguage("zh"); setShowLangSelect(false); }}>
                      中文
                    </button>
                  </li>
                </ul>
              </div>
            )}

          </div>
        </section>

        {/* 알림 설정 */}
        <section className="card simple-card">
          <div className="row">
            <img src={bell} alt={t("notification")} />
            <span>{t("notification_setting")}</span>
            <span className="value on">ON</span>
          </div>
          <ul className="notif-list">
            <li>
              <label>
                <input type="checkbox" defaultChecked /> {t("meal_change_notification")}
              </label>
            </li>
            <li>
              <label>
                <input type="checkbox" defaultChecked /> {t("feedback_request_notification")}
              </label>
            </li>
          </ul>
        </section>

        {/* 계정 설정 */}
        <section className="card simple-card">
          <div className="row">
            <img src={lock} alt={t("account")} />
            <span>{t("account_setting")}</span>
          </div>
          <div className="btn-group">
            <button className="logout-btn" onClick={handleLogout}>{t("logout")}</button>
            <button className="privacy-btn" onClick={() => navigate("/privacy")}>{t("privacy_policy")}</button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Frame;
