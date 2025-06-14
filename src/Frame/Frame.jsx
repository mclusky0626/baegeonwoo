import "./Frame.css";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
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

export const Frame = ({ onNavigate, className = "" }) => {
  const { t, i18n } = useTranslation();
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [schoolInput, setSchoolInput] = useState("");
  const [gradeInput, setGradeInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [showLangSelect, setShowLangSelect] = useState(false);

  // 유저 데이터 로딩
  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) return setLoading(false);
      const uid = auth.currentUser.uid;
      const ref = doc(db, "users", uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setUserData(data);
        setNameInput(data.name || "");
        setSchoolInput(data.schoolName || t("no_school"));
        setGradeInput(data.grade || "");
      }
      setLoading(false);
    };
    fetchUserData();
    // eslint-disable-next-line
  }, []);

  const handleSave = async () => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const ref = doc(db, "users", uid);
    await updateDoc(ref, {
      name: nameInput,
      schoolName: schoolInput,
      grade: gradeInput,
    });
    setUserData({ ...userData, name: nameInput, schoolName: schoolInput, grade: gradeInput });
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
          <button onClick={() => onNavigate("home")}>{t("go_home")}</button>
          <button onClick={() => window.location.reload()}>{t("login_again")}</button>
        </div>
      </div>
    );
  }

  // DB 구조 기준 변수명
  const name = userData.name || t("no_name");
  const school = userData.schoolName || t("no_school");
  const grade = userData.grade || t("no_grade");
  const religion = (userData.religion && userData.religion.length > 0)
    ? userData.religion.join(", ")
    : t("none");
  const allergy = (userData.allergies && userData.allergies.length > 0)
    ? userData.allergies.join(", ")
    : t("none");
  const dietType = userData.dietType || t("none");

  return (
    <div className={`frame ${className}`}>
      <header className="header">
        <div className="title">{t("profile")}</div>
        <button className="settings-btn" onClick={() => onNavigate("settings")}>
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
                <button className="edit-btn" onClick={() => setEditMode(true)}>
                  <img src={edit} alt={t("edit_school")} />
                </button>
                <span className="divider">|</span>
                <span className="grade">{grade}</span>
                <button className="edit-btn" onClick={() => setEditMode(true)}>
                  <img src={edit} alt={t("edit_grade")} />
                </button>
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
            <button className="edit-btn" onClick={() => onNavigate("settings")}>
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
            <div><img src={ok} alt={t("good")} /> 70%</div>
            <div><img src={warn} alt={t("caution")} /> 10%</div>
            <div><img src={no} alt={t("excluded")} /> 20%</div>
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
            <button className="privacy-btn">{t("privacy_policy")}</button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Frame;
