import "./HomeScreen.css";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { auth, db, googleProvider, functions } from "../firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore"; // Added updateDoc, arrayUnion
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Layout } from "../components/Layout"; // Assuming this is used elsewhere
import { violatesReligion } from "../utils/religionRules"; // Assuming these are correctly imported
import { violatesDiet } from "../utils/dietRules"; // Assuming these are correctly imported
import { showLocalNotification, getCurrentToken, requestNotificationPermission, retrieveToken } from "../messaging";
import { httpsCallable } from "firebase/functions";

export const HomeScreen = ({ onNavigate, className, ...props }) => {
  const { t, i18n } = useTranslation();
  const sendLoginNotification = httpsCallable(functions, 'sendLoginNotification');

  // 급식/학교 관련
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayStr, setTodayStr] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [schoolName, setSchoolName] = useState(t("select_school"));
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
  const [religions, setReligions] = useState([]);
  const [dietType, setDietType] = useState("");
  const [detailMenu, setDetailMenu] = useState(null);

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
    // 언어에 따라 요일명
    const dayNames = i18n.language === "en"
      ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      : ["일", "월", "화", "수", "목", "금", "토"];
    const day = dayNames[date.getDay()];
    return i18n.language === "en"
      ? `${yyyy}-${mm}-${dd} (${day})`
      : `${yyyy}년 ${mm}월 ${dd}일 (${day})`;
  }

  // 날짜 선택하면 UI에 반영
  useEffect(() => {
    setTodayStr(getDateDisplay(selectedDate));
    // eslint-disable-next-line
  }, [selectedDate, i18n.language]);

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
          setSchoolName(d.schoolName || t("select_school"));
          setEduCode(d.eduCode || "");
          setSchoolCode(d.schoolCode || "");
          setAllergies(d.allergies || []);
          setReligions(d.religion || []);
          setDietType(d.dietType || "");
        }
      } else {
        setSchoolName(t("select_school"));
        setEduCode("");
        setSchoolCode("");
        setAllergies([]);
        setReligions([]);
        setDietType("");
      }
    }
    fetchUserSettings();
    // eslint-disable-next-line
  }, [user, i18n.language]);

  // --- FCM 토큰 관리 및 Firestore 저장 로직 추가 ---
  useEffect(() => {
    async function handleNotificationToken() {
      if (user) {
        try {
          // 사용자에게 알림 권한을 요청합니다.
          // 사용자가 이미 권한을 부여했거나 거부했다면 다시 묻지 않습니다.
          await requestNotificationPermission();
          // 서비스 워커가 등록되어 있다면 토큰을 가져옵니다.
          const token = await retrieveToken(window.swRegistration);
          if (token) {
            console.log('FCM Token:', token);
            // 사용자 문서에 토큰을 저장합니다.
            // 여러 기기에서 로그인할 수 있으므로 배열 형태로 저장하는 것이 좋습니다.
            // setDoc 대신 updateDoc과 arrayUnion을 사용하여 기존 배열에 추가합니다.
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
              fcmTokens: arrayUnion(token)
            }, { merge: true }); // merge: true를 사용하여 기존 필드를 덮어쓰지 않고 병합
            console.log('FCM Token saved/updated in Firestore for user:', user.uid);
          }
        } catch (e) {
          console.error("알림 토큰 설정 중 오류 발생:", e);
          // 사용자가 알림 권한을 거부했거나 다른 오류가 발생했을 때 처리
        }
      }
    }
    handleNotificationToken();
  }, [user]); // user 객체가 변경될 때마다 이 Effect를 실행 (로그인/로그아웃 시)
  // --- FCM 토큰 관리 로직 끝 ---

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
            const ingredients = codes.map((code) => allergyMap[code] || code).filter(Boolean);
            return { name, ingredients };
          });
          setMeals(dishList);
        } else {
          setMeals([]);
        }
      } catch (error) { // Changed generic catch to catch specific error for logging
        console.error("급식 데이터를 불러오는 중 오류 발생:", error);
        setMeals([]);
      }
      setLoading(false);
    }
    fetchMeals();
    // eslint-disable-next-line
  }, [selectedDate, eduCode, schoolCode, i18n.language]);

  // 로그인/회원가입/로그아웃
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setShowLogin(false);
      // 로컬 알림을 먼저 띄워 사용자에게 즉각적인 피드백을 제공합니다.
      showLocalNotification(t('login_success'), { icon: '/temp/icon-192.png' });
      console.log('로컬 로그인 성공 알림 표시.');

      // FCM 푸시 알림을 보내기 위해 토큰을 확인하고 시도합니다.
      let token = getCurrentToken(); // 현재 저장된 토큰이 있는지 확인
      if (!token && window.swRegistration) {
        console.log('현재 토큰이 없거나 유효하지 않습니다. 권한을 요청하고 새로 발급을 시도합니다.');
        try {
          await requestNotificationPermission(); // 알림 권한 요청 (브라우저 팝업)
          token = await retrieveToken(window.swRegistration); // 토큰 발급/갱신
        } catch (permissionError) {
          console.warn('알림 권한 요청 또는 토큰 발급 실패 (사용자 거부 또는 오류):', permissionError);
        }
      }

      if (token) {
        console.log('FCM 토큰이 있습니다. 로그인 알림을 보냅니다.');
        try {
          await sendLoginNotification({ token });
          console.log('Firebase Cloud Function을 통해 로그인 알림 전송 성공.');
        } catch (sendError) {
          console.error('Firebase Cloud Function을 통한 로그인 알림 전송 실패:', sendError);
        }
      } else {
        console.log('FCM 토큰이 없어 로그인 푸시 알림을 보낼 수 없습니다.');
      }
    } catch (err) {
      setLoginError(t("login_failed"));
      console.error('로그인 중 오류 발생:', err);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setShowLogin(false);
      showLocalNotification(t('login_success'), { icon: '/temp/icon-192.png' });
      console.log('로컬 회원가입 성공 알림 표시.');

      let token = getCurrentToken();
      if (!token && window.swRegistration) {
        console.log('현재 토큰이 없거나 유효하지 않습니다. 권한을 요청하고 새로 발급을 시도합니다.');
        try {
          await requestNotificationPermission();
          token = await retrieveToken(window.swRegistration);
        } catch (permissionError) {
          console.warn('알림 권한 요청 또는 토큰 발급 실패 (사용자 거부 또는 오류):', permissionError);
        }
      }

      if (token) {
        console.log('FCM 토큰이 있습니다. 회원가입 알림을 보냅니다.');
        try {
          await sendLoginNotification({ token }); // sendLoginNotification 대신 sendRegisterNotification 같은 함수를 따로 만들 수도 있습니다.
          console.log('Firebase Cloud Function을 통해 회원가입 알림 전송 성공.');
        } catch (sendError) {
          console.error('Firebase Cloud Function을 통한 회원가입 알림 전송 실패:', sendError);
        }
      } else {
        console.log('FCM 토큰이 없어 회원가입 푸시 알림을 보낼 수 없습니다.');
      }
    } catch (err) {
      setLoginError(t("register_failed") + err.message);
      console.error('회원가입 중 오류 발생:', err);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    console.log('사용자 로그아웃 완료.');
    // 로그아웃 시 Fcm 토큰을 Firestore에서 제거할 수도 있습니다.
    // 이는 특정 기기에서만 알림을 받게 하거나, 더 이상 사용하지 않는 토큰을 정리하는 데 유용합니다.
    // 예: const userRef = doc(db, "users", user.uid); await updateDoc(userRef, { fcmTokens: arrayRemove(token) });
  };

  // 구글 로그인 핸들러
  const handleGoogleLogin = async () => {
    setLoginError("");
    try {
      await signInWithPopup(auth, googleProvider);
      setShowLogin(false);
      showLocalNotification(t('login_success'), { icon: '/temp/icon-192.png' });
      console.log('로컬 구글 로그인 성공 알림 표시.');

      let token = getCurrentToken();
      if (!token && window.swRegistration) {
        console.log('현재 토큰이 없거나 유효하지 않습니다. 권한을 요청하고 새로 발급을 시도합니다.');
        try {
          await requestNotificationPermission();
          token = await retrieveToken(window.swRegistration);
        } catch (permissionError) {
          console.warn('알림 권한 요청 또는 토큰 발급 실패 (사용자 거부 또는 오류):', permissionError);
        }
      }

      if (token) {
        console.log('FCM 토큰이 있습니다. 구글 로그인 알림을 보냅니다.');
        try {
          await sendLoginNotification({ token });
          console.log('Firebase Cloud Function을 통해 구글 로그인 알림 전송 성공.');
        } catch (sendError) {
          console.error('Firebase Cloud Function을 통한 구글 로그인 알림 전송 실패:', sendError);
        }
      } else {
        console.log('FCM 토큰이 없어 구글 로그인 푸시 알림을 보낼 수 없습니다.');
      }
    } catch (err) {
      setLoginError(t("google_login") + ": " + err.message);
      console.error('구글 로그인 중 오류 발생:', err);
    }
  };

  return (
    <div className={"home-screen " + className}>
      {showLogin && (
        <div className="login-modal-bg">
          <div className="login-modal">
            <div className="login-tabs">
              <button
                className={loginTab === "login" ? "active" : ""}
                onClick={() => setLoginTab("login")}
              >{t("login")}</button>
              <button
                className={loginTab === "register" ? "active" : ""}
                onClick={() => setLoginTab("register")}
              >{t("register")}</button>
            </div>
            <form
              onSubmit={loginTab === "login" ? handleLogin : handleRegister}
              className="login-form"
            >
              <input
                type="email"
                value={email}
                required
                placeholder={t("email")}
                onChange={e => setEmail(e.target.value)}
                className="login-input"
              />
              <input
                type="password"
                value={password}
                required
                placeholder={t("password")}
                onChange={e => setPassword(e.target.value)}
                className="login-input"
              />
              <button type="submit" className="login-btn">
                {loginTab === "login" ? t("login") : t("register")}
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
              {t("google_login")}
            </button>
            <button className="login-cancel" onClick={() => setShowLogin(false)}>
              {t("close")}
            </button>
          </div>
        </div>
      )}
      {detailMenu && (
        <div className="meal-detail-bg" onClick={() => setDetailMenu(null)}>
          <div className="meal-detail" onClick={e => e.stopPropagation()}>
            <div className="meal-detail-title">{detailMenu.name}</div>
            <div className="meal-detail-ingredients">
              {detailMenu.ingredients.map((x, i) => (
                <span key={x} className={allergies.includes(x) ? 'highlight-allergy' : ''}>
                  {t(x)}{i < detailMenu.ingredients.length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>
            <button className="meal-detail-close" onClick={() => setDetailMenu(null)}>
              {t('close')}
            </button>
          </div>
        </div>
      )}

      {/* 상단 header */}
      <div className="header">
        <div className="date-row">
          <div className="date-info">
            <img className="calendar" src="calendar0.svg" alt="calendar icon" /> {/* Added alt text */}
            {/* 달력 */}
            <DatePicker
              selected={selectedDate}
              onChange={(date) => { setSelectedDate(date); setTodayStr(getDateDisplay(date)); }}
              dateFormat={i18n.language === "en" ? "yyyy-MM-dd" : "yyyy년 MM월 dd일"}
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
              locale={i18n.language}
            />
          </div>
          <div className="user-info">
            {user ? (
              <>
                <span className="user-email">{user.email}</span>
                <button onClick={handleLogout} className="header-logout">
                  {t("logout")}
                </button>
              </>
            ) : (
              <button onClick={() => setShowLogin(true)} className="header-login">
                {t("login")}/{t("register")}
              </button>
            )}
          </div>
        </div>
        <div className="school-info">
          <img className="school" src="school0.svg" alt="school icon" /> {/* Added alt text */}
          <div className="div">{schoolName}</div>
        </div>
      </div>

      {/* 급식 정보 */}
      <div className="content-container">
        <div className="content">
          <div className="meal-title">
            <img className="utensils" src="utensils0.svg" alt="utensils icon" /> {/* Added alt text */}
            <div className="div2">
              {getDateDisplay(selectedDate)} {t("meal")}
            </div>
          </div>
          <div className="meal-items">
            {loading ? (
              <div>{t("loading")}</div>
            ) : meals.length === 0 ? (
              <div>{t("no_meal_data")}</div>
            ) : (
              meals.map((menu, idx) => {
                const hasAllergy = menu.ingredients.some((i) => allergies.includes(i));
                const religionBan = violatesReligion(menu.name, religions);
                const dietBan = violatesDiet(menu.name, menu.ingredients, dietType);
                let className = "simple-meal-item";
                let icon = "✅";
                let label = t("can_eat");
                if (dietBan) {
                  className += " exclude";
                  icon = "❌";
                  label = t("diet_violation");
                } else if (religionBan) {
                  className += " exclude";
                  icon = "❌";
                  label = t("religion_violation");
                } else if (hasAllergy) {
                  className += " warning";
                  icon = "⚠️";
                  label = t("allergy_warning");
                }
                return (
                  <div
                    key={idx}
                    className={className}
                    onClick={() => setDetailMenu(menu)}
                  >
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

    </div>
  );
};

export default HomeScreen;