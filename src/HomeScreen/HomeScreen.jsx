import "./HomeScreen.css";
import React, { useEffect, useState } from "react";
import { auth } from "../firebase"; // firebase.js에서 export한 auth
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
} from "firebase/auth";

export const HomeScreen = ({ onNavigate, className, ...props }) => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  // 로그인/회원가입 UI
  const [showLogin, setShowLogin] = useState(false);
  const [loginTab, setLoginTab] = useState("login"); // login | register
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [user, setUser] = useState(null);

  // 급식 API
  const API_KEY = "a27ba9b1a9144411a928c9358597817e";
  const EDU_CODE = "E10";
  const SCHOOL_CODE = "7361255";
  const NEXT_MONDAY = "20250529"; // 2025년 5월 29일

  useEffect(() => {
    async function fetchMeals() {
      setLoading(true);
      const url = `https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=${API_KEY}&Type=json&pIndex=1&pSize=10&ATPT_OFCDC_SC_CODE=${EDU_CODE}&SD_SCHUL_CODE=${SCHOOL_CODE}&MLSV_YMD=${NEXT_MONDAY}`;
      const res = await fetch(url);
      const data = await res.json();
      const rows = data?.mealServiceDietInfo?.[1]?.row;
      if (rows && rows[0]?.DDISH_NM) {
        setMeals(rows[0].DDISH_NM.split("<br/>").map((txt) => txt.replace(/\([^)]+\)/g, "").trim()));
      } else {
        setMeals([]);
      }
      setLoading(false);
    }
    fetchMeals();
  }, []);

  // 파이어베이스 로그인 감지
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  // 로그인
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setShowLogin(false);
    } catch (err) {
      setLoginError("로그인 실패! 이메일/비밀번호를 확인하세요.");
    }
  };

  // 회원가입
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setShowLogin(false);
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setLoginError("이미 사용중인 이메일입니다.");
      } else if (err.code === "auth/weak-password") {
        setLoginError("비밀번호는 6자 이상이어야 합니다.");
      } else if (err.code === "auth/invalid-email") {
        setLoginError("유효하지 않은 이메일입니다.");
      } else {
        setLoginError("회원가입 실패: " + err.message);
      }
    }
  };

  // 로그아웃
  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className={"home-screen " + className}>
      {/* 로그인/로그아웃/회원가입 버튼 (상단 우측) */}
      <div style={{
        position: "absolute", right: 20, top: 10, zIndex: 10,
      }}>
        {user ? (
          <span style={{ fontSize: 13 }}>
            {user.email}
            <button onClick={handleLogout} style={{ marginLeft: 10, fontSize: 13 }}>
              로그아웃
            </button>
          </span>
        ) : (
          <button onClick={() => setShowLogin(true)} style={{ fontSize: 13 }}>
            로그인/회원가입
          </button>
        )}
      </div>

      {/* 로그인/회원가입 모달 */}
      {showLogin && (
        <div style={{
          position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.25)", zIndex: 99,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            background: "white", borderRadius: 12, boxShadow: "0 2px 16px #0001", padding: 24, minWidth: 280,
            display: "flex", flexDirection: "column", gap: 12,
          }}>
            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <button
                style={{
                  flex: 1, fontWeight: loginTab === "login" ? "bold" : "normal",
                  background: loginTab === "login" ? "#eee" : "transparent",
                  border: "none", borderBottom: loginTab === "login" ? "2px solid #007aff" : "1px solid #eee", padding: 10, cursor: "pointer",
                  borderRadius: 8,
                }}
                onClick={() => { setLoginTab("login"); setLoginError(""); }}
              >로그인</button>
              <button
                style={{
                  flex: 1, fontWeight: loginTab === "register" ? "bold" : "normal",
                  background: loginTab === "register" ? "#eee" : "transparent",
                  border: "none", borderBottom: loginTab === "register" ? "2px solid #007aff" : "1px solid #eee", padding: 10, cursor: "pointer",
                  borderRadius: 8,
                }}
                onClick={() => { setLoginTab("register"); setLoginError(""); }}
              >회원가입</button>
            </div>
            <form onSubmit={loginTab === "login" ? handleLogin : handleRegister} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <input
                type="email" value={email} required
                placeholder="이메일" autoFocus
                onChange={e => setEmail(e.target.value)}
                style={{ padding: 8, borderRadius: 6, border: "1px solid #eee" }}
              />
              <input
                type="password" value={password} required
                placeholder="비밀번호"
                onChange={e => setPassword(e.target.value)}
                style={{ padding: 8, borderRadius: 6, border: "1px solid #eee" }}
              />
              <button type="submit" style={{
                padding: 10, background: "#007aff", color: "white", border: "none", borderRadius: 8, marginTop: 8
              }}>
                {loginTab === "login" ? "로그인" : "회원가입"}
              </button>
              <button type="button" style={{
                padding: 10, background: "#eee", color: "#222", border: "none", borderRadius: 8
              }} onClick={() => setShowLogin(false)}>
                닫기
              </button>
              {loginError && <span style={{ color: "red", fontSize: 13 }}>{loginError}</span>}
            </form>
          </div>
        </div>
      )}

      {/* 이하 급식, 하단 바 등 기존 UI 그대로 */}
      <div className="status-bar">
        <div className="_9-41">9:41 </div>
        <div className="status-icons">
          <img className="signal" src="signal0.svg" />
          <img className="wifi" src="wifi0.svg" />
          <img className="battery" src="battery0.svg" />
        </div>
      </div>
      <div className="header">
        <div className="date-row">
          <div className="date-info">
            <img className="calendar" src="calendar0.svg" />
            <div className="_2025-5-28">2025년 5월 28일 (수) </div>
          </div>
          <img className="settings" src="settings0.svg" />
        </div>
        <div className="school-info">
          <img className="school" src="school0.svg" />
          <div className="div">인천 초은중학교 </div>
        </div>
      </div>
      <div className="content-container">
        <div className="content">
          <div className="meal-title">
            <img className="utensils" src="utensils0.svg" />
          </div>
          <div className="meal-items">
            {loading ? (
              <div>로딩 중...</div>
            ) : meals.length === 0 ? (
              <div>급식 데이터가 없습니다.</div>
            ) : (
              meals.map((menu, idx) => (
                <div key={idx} className="simple-meal-item">
                  <span className="meal-name">{menu}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <div className="summary-card">
        <div className="summary-title">
          <img className="bar-chart-3" src="bar-chart-30.svg" />
          <div className="div7">오늘의 급식 요약 </div>
        </div>
        <div className="summary-stats">
          <div className="safe-count">
            <img className="check-circle" src="check-circle0.svg" />
            <div className="_3">먹을 수 있는 항목: 3개 </div>
          </div>
          <div className="warning-count">
            <img className="alert-circle" src="alert-circle0.svg" />
            <div className="_1">주의 항목: 1개 </div>
          </div>
          <div className="restricted-count">
            <img className="x-circle" src="x-circle0.svg" />
            <div className="_12">제외된 항목: 1개 </div>
          </div>
        </div>
      </div>
      <div className="feedback-button">
        <img className="message-square" src="message-square0.svg" />
        <div className="div8">피드백 남기기 </div>
      </div>
      <div className="tab-bar">
        <div className="home-tab" onClick={() => onNavigate("home")}>
          <img className="home" src="home0.svg" />
          <div className="div9">홈</div>
        </div>
        <div className="calendar-tab" onClick={() => onNavigate("week")}>
          <img className="calendar2" src="calendar1.svg" />
          <div className="div10">급식표</div>
        </div>
        <div className="settings-tab" onClick={() => onNavigate("settings")}>
          <img className="settings2" src="settings1.svg" />
          <div className="div10">설정</div>
        </div>
        <div className="profile-tab" onClick={() => onNavigate("frame")}>
          <img className="user" src="user0.svg" />
          <div className="div10">내정보</div>
        </div>
      </div>
    </div>
  );
};
