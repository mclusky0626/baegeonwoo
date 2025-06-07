import "./HomeScreen.css";
import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export const HomeScreen = ({ onNavigate, className, ...props }) => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayStr, setTodayStr] = useState("");
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [loginTab, setLoginTab] = useState("login");
  const [allergies, setAllergies] = useState([]);

  const API_KEY = "a27ba9b1a9144411a928c9358597817e";
  const EDU_CODE = "E10";
  const SCHOOL_CODE = "7361255";

  const allergyMap = {
    1: "난류", 2: "우유", 3: "메밀", 4: "땅콩", 5: "대두", 6: "밀",
    7: "고등어", 8: "게", 9: "새우", 10: "돼지고기", 11: "복숭아",
    12: "토마토", 13: "아황산류", 14: "호두", 15: "닭고기", 16: "쇠고기",
    17: "오징어", 18: "조개류"
  };

  useEffect(() => {
    setTodayStr(getTodayDisplay());
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchAllergies = async () => {
      if (user) {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const d = snap.data();
          setAllergies(d.allergies || []);
        }
      }
    };
    fetchAllergies();
  }, [user]);

  useEffect(() => {
    async function fetchMeals() {
      setLoading(true);
      const todayStr = getToday();
      const url = `https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=${API_KEY}&Type=json&pIndex=1&pSize=10&ATPT_OFCDC_SC_CODE=${EDU_CODE}&SD_SCHUL_CODE=${SCHOOL_CODE}&MLSV_YMD=${todayStr}`;
      const res = await fetch(url);
      const data = await res.json();
      const rows = data?.mealServiceDietInfo?.[1]?.row;
      if (rows && rows[0]?.DDISH_NM) {
        const dishList = rows[0].DDISH_NM.split("<br/>").map((txt) => {
          const name = txt.replace(/\s*\([^)]+\)/, "").trim();
          const match = txt.match(/\(([^)]+)\)/);
          const codes = match ? match[1].split(".").map(Number) : [];
          const ingredients = codes.map((code) => allergyMap[code]).filter(Boolean);
          return { name, ingredients };
        });
        setMeals(dishList);
      } else {
        setMeals([]);
      }
      setLoading(false);
    }
    fetchMeals();
  }, []);

  function getTodayDisplay() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = today.getMonth() + 1;
    const dd = today.getDate();
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    const day = dayNames[today.getDay()];
    return `${yyyy}년 ${mm}월 ${dd}일 (${day})`;
  }

  function getToday() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}${mm}${dd}`;
  }

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

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setShowLogin(false);
    } catch (err) {
      setLoginError("회원가입 실패: " + err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className={"home-screen " + className}>
      {/* 로그인 UI */}
      <div style={{ position: "absolute", right: 20, top: 10, zIndex: 10 }}>
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

      {showLogin && (
  <div className="login-modal-bg">
    <div className="login-modal">
      <div className="login-tabs">
        <button
          className={loginTab === "login" ? "active" : ""}
          onClick={() => setLoginTab("login")}
        >
          로그인
        </button>
        <button
          className={loginTab === "register" ? "active" : ""}
          onClick={() => setLoginTab("register")}
        >
          회원가입
        </button>
      </div>
      <form
        onSubmit={loginTab === "login" ? handleLogin : handleRegister}
        className="login-form"
      >
        <input
          type="email"
          value={email}
          required
          placeholder="이메일"
          onChange={e => setEmail(e.target.value)}
          className="login-input"
        />
        <input
          type="password"
          value={password}
          required
          placeholder="비밀번호"
          onChange={e => setPassword(e.target.value)}
          className="login-input"
        />
        <button type="submit" className="login-btn">
          {loginTab === "login" ? "로그인" : "회원가입"}
        </button>
        {loginError && <div className="login-error">{loginError}</div>}
      </form>
      <button className="login-cancel" onClick={() => setShowLogin(false)}>
        닫기
      </button>
    </div>
  </div>
)}


      {/* UI 시작 */}
      

      <div className="header">
        <div className="date-row">
          <div className="date-info">
            <img className="calendar" src="calendar0.svg" />
            <div className="_2025-5-28">{todayStr}</div>
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
            <div className="div2">오늘의 급식</div>
          </div>
          <div className="meal-items">
            {loading ? (
              <div>로딩 중...</div>
            ) : meals.length === 0 ? (
              <div>급식 데이터가 없습니다.</div>
            ) : (
              meals.map((menu, idx) => {
                const hasAllergy = menu.ingredients.some(i => allergies.includes(i));
                const className = hasAllergy ? "simple-meal-item warning" : "simple-meal-item";
                const icon = hasAllergy ? "⚠️" : "✅";
                const label = hasAllergy
                  ? `알레르기 주의: ${menu.ingredients.join(", ")}`
                  : "먹을 수 있어요";

                return (
                  <div key={idx} className={className}>
                    <span className="meal-name">{icon} {menu.name}</span>
                    <div style={{ fontSize: 13, marginTop: 4 }}>
                      {label}
                    </div>
                  </div>
                );
              })
            )}
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

export default HomeScreen;
