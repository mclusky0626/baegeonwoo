import "./HomeScreen.css";
import React, { useEffect, useState } from "react";
import { auth, db, googleProvider } from "../firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export const HomeScreen = ({ onNavigate, className, ...props }) => {
  // 급식/학교 관련
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayStr, setTodayStr] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [schoolName, setSchoolName] = useState("학교를 선택하세요");
  const [eduCode, setEduCode] = useState("");
  const [schoolCode, setSchoolCode] = useState("");

  // 유저 관련
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [loginTab, setLoginTab] = useState("login");
  const [allergies, setAllergies] = useState([]);

  // 알레르기 코드 → 이름 매핑
  const allergyMap = {
    1: "난류", 2: "우유", 3: "메밀", 4: "땅콩", 5: "대두", 6: "밀",
    7: "고등어", 8: "게", 9: "새우", 10: "돼지고기", 11: "복숭아",
    12: "토마토", 13: "아황산류", 14: "호두", 15: "닭고기", 16: "쇠고기",
    17: "오징어", 18: "조개류"
  };

  // 날짜 포맷 함수
  function getDateYMD(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}${mm}${dd}`;
  }
  function getDateDisplay(date) {
    const yyyy = date.getFullYear();
    const mm = date.getMonth() + 1;
    const dd = date.getDate();
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    const day = dayNames[date.getDay()];
    return `${yyyy}년 ${mm}월 ${dd}일 (${day})`;
  }

  // 날짜 선택하면 UI에 반영
  useEffect(() => {
    setTodayStr(getDateDisplay(selectedDate));
  }, [selectedDate]);

  // 로그인 감시
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // 유저 정보(학교/알레르기) 불러오기
  useEffect(() => {
    async function fetchUserSettings() {
      if (user) {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const d = snap.data();
          setSchoolName(d.schoolName || "학교를 선택하세요");
          setEduCode(d.eduCode || "");
          setSchoolCode(d.schoolCode || "");
          setAllergies(d.allergies || []);
        }
      } else {
        setSchoolName("학교를 선택하세요");
        setEduCode("");
        setSchoolCode("");
        setAllergies([]);
      }
    }
    fetchUserSettings();
  }, [user]);

  // 급식 데이터 불러오기 (학교/날짜 바뀔 때마다)
  useEffect(() => {
    async function fetchMeals() {
      setLoading(true);
      // 학교 코드 없으면 급식 불러오지 않음
      if (!eduCode || !schoolCode) {
        setMeals([]);
        setLoading(false);
        return;
      }
      const ymd = getDateYMD(selectedDate);
      const url = `https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=a27ba9b1a9144411a928c9358597817e&Type=json&pIndex=1&pSize=10&ATPT_OFCDC_SC_CODE=${eduCode}&SD_SCHUL_CODE=${schoolCode}&MLSV_YMD=${ymd}`;
      try {
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
      } catch {
        setMeals([]);
      }
      setLoading(false);
    }
    fetchMeals();
  }, [selectedDate, eduCode, schoolCode]);

  // 로그인/회원가입/로그아웃
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

  // 구글 로그인 핸들러
  const handleGoogleLogin = async () => {
    setLoginError("");
    try {
      await signInWithPopup(auth, googleProvider);
      setShowLogin(false);
    } catch (err) {
      setLoginError("구글 로그인 실패: " + err.message);
    }
  };

  return (
    <div className={"home-screen " + className}>
      {/* 로그인 버튼/유저 표시 */}
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
              >로그인</button>
              <button
                className={loginTab === "register" ? "active" : ""}
                onClick={() => setLoginTab("register")}
              >회원가입</button>
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
            {/* 구글 로그인 버튼 추가 */}
            <button
              type="button"
              className="google-login-btn"
              onClick={handleGoogleLogin}
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                style={{ width: 18, height: 18, marginRight: 8, verticalAlign: "middle" }}
              />
              구글로 로그인
            </button>
            <button className="login-cancel" onClick={() => setShowLogin(false)}>
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 상단 header */}
      <div className="header">
        <div className="date-row">
          <div className="date-info">
            <img className="calendar" src="calendar0.svg" />
            {/* 달력 */}
            <DatePicker
              selected={selectedDate}
              onChange={(date) => { setSelectedDate(date); setTodayStr(getDateDisplay(date)); }}
              dateFormat="yyyy년 MM월 dd일"
              customInput={
                <span className="_2025-5-28" style={{ cursor: "pointer", fontWeight: 600 }}>
                  {todayStr}
                </span>
              }
              calendarClassName="meal-datepicker"
              popperPlacement="bottom"
              minDate={new Date(2020, 1, 1)}
              maxDate={new Date(2099, 12, 31)}
              showPopperArrow={false}
              locale="ko"
            />
          </div>
          <img className="settings" src="settings0.svg" />
        </div>
        <div className="school-info">
          <img className="school" src="school0.svg" />
          <div className="div">{schoolName}</div>
        </div>
      </div>

      {/* 급식 정보 */}
      <div className="content-container">
        <div className="content">
          <div className="meal-title">
            <img className="utensils" src="utensils0.svg" />
            <div className="div2">
              {getDateDisplay(selectedDate)} 급식
            </div>
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
