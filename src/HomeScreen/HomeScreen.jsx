import "./HomeScreen.css";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { auth, db, googleProvider, functions } from "../firebase";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut
} from "firebase/auth";
import { arrayUnion, doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { BarChart3, ShieldCheck, Utensils } from "lucide-react";
import {
  assessDish,
  buildMealUrl,
  getDateDisplay,
  parseMealRows,
  summarizeDishes
} from "../utils/mealUtils";
import { EMPTY_SCHOOL, hasSchool, resolveSchool } from "../utils/school";
import { SchoolLogo } from "../components/SchoolLogo";
import {
  getCurrentToken,
  requestNotificationPermission,
  retrieveToken,
  showLocalNotification
} from "../messaging";
import {
  isNativePushAvailable,
  registerNativePushNotifications
} from "../nativeNotifications";

const DEFAULT_PREFERENCES = {
  allergies: [],
  religions: [],
  dietType: ""
};

const ONBOARDING_KEY = "dagub:onboarding:v3";

export const HomeScreen = ({ className = "", forceLogin = false }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const sendLoginNotification = httpsCallable(functions, "sendLoginNotification");

  const [user, setUser] = useState(null);
  const [school, setSchool] = useState(EMPTY_SCHOOL);
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mealGroups, setMealGroups] = useState([]);
  const [selectedMealCode, setSelectedMealCode] = useState("2");
  const [loading, setLoading] = useState(true);
  const [mealError, setMealError] = useState("");
  const [detailMenu, setDetailMenu] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showLogin, setShowLogin] = useState(forceLogin);
  const [loginTab, setLoginTab] = useState("login");
  const nativeTokenUserRef = useRef("");
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (forceLogin || typeof window === "undefined") return false;
    return window.localStorage.getItem(ONBOARDING_KEY) !== "seen";
  });

  const closeOnboarding = () => {
    window.localStorage.setItem(ONBOARDING_KEY, "seen");
    setShowOnboarding(false);
  };

  const openLoginFromOnboarding = () => {
    closeOnboarding();
    setShowLogin(true);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (forceLogin && !user) setShowLogin(true);
  }, [forceLogin, user]);

  useEffect(() => {
    async function fetchUserSettings() {
      if (!user) {
        setSchool(EMPTY_SCHOOL);
        setPreferences(DEFAULT_PREFERENCES);
        return;
      }

      const snap = await getDoc(doc(db, "users", user.uid));
      const data = snap.exists() ? snap.data() : {};
      setSchool(resolveSchool(data));
      setPreferences({
        allergies: data.allergies || [],
        religions: data.religion || [],
        dietType: data.dietType || ""
      });
    }

    fetchUserSettings();
  }, [user]);

  useEffect(() => {
    if (!user || !isNativePushAvailable() || nativeTokenUserRef.current === user.uid) return;
    nativeTokenUserRef.current = user.uid;
    saveNotificationToken(user, false);
  }, [user?.uid]);

  useEffect(() => {
    async function fetchMeals() {
      if (!hasSchool(school)) {
        setMealGroups([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setMealError("");

      try {
        const res = await fetch(buildMealUrl({
          eduCode: school.eduCode,
          schoolCode: school.schoolCode,
          date: selectedDate,
          size: 10
        }));
        const data = await res.json();
        const rows = data?.mealServiceDietInfo?.[1]?.row || [];
        const parsedRows = parseMealRows(rows);

        setMealGroups(parsedRows);
        setSelectedMealCode((current) => {
          if (!parsedRows.length || parsedRows.some((meal) => meal.code === current)) return current;
          return parsedRows.find((meal) => meal.code === "2")?.code || parsedRows[0].code;
        });
      } catch (error) {
        console.error("급식 데이터를 불러오는 중 오류 발생:", error);
        setMealGroups([]);
        setMealError(t("meal_load_failed"));
      } finally {
        setLoading(false);
      }
    }

    fetchMeals();
  }, [school.eduCode, school.schoolCode, selectedDate, t]);

  const activeMeal = useMemo(() => {
    return mealGroups.find((meal) => meal.code === selectedMealCode) || mealGroups[0] || null;
  }, [mealGroups, selectedMealCode]);

  const activeSummary = useMemo(() => {
    return summarizeDishes(activeMeal?.dishes || [], preferences);
  }, [activeMeal, preferences]);

  const availableMealNames = mealGroups.map((meal) => meal.name).join(" · ");

  async function saveNotificationToken(currentUser, notifyLogin = true) {
    if (!currentUser) return;

    try {
      if (isNativePushAvailable()) {
        const token = await registerNativePushNotifications(currentUser);
        if (!token) return;

        if (notifyLogin) {
          try {
            await sendLoginNotification({ token });
          } catch (sendError) {
            console.warn("네이티브 로그인 푸시 알림 전송 실패:", sendError);
          }
        }
        return;
      }

      if (!("Notification" in window)) return;

      let token = getCurrentToken();
      if (!token && window.swRegistration) {
        await requestNotificationPermission();
        token = await retrieveToken(window.swRegistration);
      }

      if (!token) return;

      await setDoc(doc(db, "users", currentUser.uid), {
        fcmTokens: arrayUnion(token),
        updatedAt: serverTimestamp()
      }, { merge: true });

      if (notifyLogin) {
        try {
          await sendLoginNotification({ token });
        } catch (sendError) {
          console.warn("로그인 푸시 알림 전송 실패:", sendError);
        }
      }
    } catch (error) {
      console.warn("알림 토큰 설정을 건너뜁니다:", error);
    }
  }

  async function completeLogin(currentUser, isNewUser = false) {
    const baseProfile = {
      email: currentUser.email,
      role: "student",
      lastLoginAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    if (isNewUser) {
      Object.assign(baseProfile, {
        dietType: "일반식",
        allergies: [],
        religion: [],
        createdAt: serverTimestamp()
      });
    }

    await setDoc(doc(db, "users", currentUser.uid), baseProfile, { merge: true });
    setShowLogin(false);
    setPassword("");
    showLocalNotification(t("login_success"), { icon: "/icon.png" });
    await saveNotificationToken(currentUser);
    navigate("/", { replace: true });
  }

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoginError("");

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      await completeLogin(credential.user, false);
    } catch (error) {
      console.error("로그인 중 오류 발생:", error);
      setLoginError(t("login_failed"));
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setLoginError("");

    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await completeLogin(credential.user, true);
    } catch (error) {
      console.error("회원가입 중 오류 발생:", error);
      setLoginError(`${t("register_failed")}${error.message}`);
    }
  };

  const handleGoogleLogin = async () => {
    setLoginError("");

    try {
      const credential = await signInWithPopup(auth, googleProvider);
      const snap = await getDoc(doc(db, "users", credential.user.uid));
      await completeLogin(credential.user, !snap.exists());
    } catch (error) {
      console.error("구글 로그인 중 오류 발생:", error);
      setLoginError(`${t("google_login")}: ${error.message}`);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/", { replace: true });
  };

  const schoolReady = hasSchool(school);

  return (
    <main className={`home-screen ${className}`}>
      {showOnboarding && (
        <section className="onboarding-screen" aria-label={t("onboarding_title")}>
          <div className="onboarding-panel">
            <div className="onboarding-brand-row">
              <div className="onboarding-mark">
                <Utensils size={28} strokeWidth={1.8} />
              </div>
              <div>
                <p>{t("onboarding_kicker")}</p>
                <strong>Dagub</strong>
              </div>
            </div>
            <h1>{t("onboarding_title")}</h1>
            <div className="onboarding-points">
              <div>
                <Utensils size={18} strokeWidth={1.8} />
                <strong>{t("onboarding_point_meal")}</strong>
                <span>{t("onboarding_point_meal_desc")}</span>
              </div>
              <div>
                <ShieldCheck size={18} strokeWidth={1.8} />
                <strong>{t("onboarding_point_filter")}</strong>
                <span>{t("onboarding_point_filter_desc")}</span>
              </div>
              <div>
                <BarChart3 size={18} strokeWidth={1.8} />
                <strong>{t("onboarding_point_report")}</strong>
                <span>{t("onboarding_point_report_desc")}</span>
              </div>
            </div>
            <div className="onboarding-actions">
              <button type="button" className="onboarding-primary" onClick={openLoginFromOnboarding}>
                {t("login")}
              </button>
              <button type="button" className="onboarding-secondary" onClick={closeOnboarding}>
                {t("continue_without_login")}
              </button>
            </div>
          </div>
        </section>
      )}

      {showLogin && (
        <div className="login-modal-bg" role="dialog" aria-modal="true">
          <div className="login-modal">
            <div className="login-heading">
              <p>{t("login_kicker")}</p>
              <h1>{t("login_title")}</h1>
            </div>
            <div className="login-tabs" role="tablist">
              <button
                type="button"
                className={loginTab === "login" ? "active" : ""}
                onClick={() => setLoginTab("login")}
              >
                {t("login")}
              </button>
              <button
                type="button"
                className={loginTab === "register" ? "active" : ""}
                onClick={() => setLoginTab("register")}
              >
                {t("register")}
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
                placeholder={t("email")}
                onChange={(event) => setEmail(event.target.value)}
                className="login-input"
              />
              <input
                type="password"
                value={password}
                required
                placeholder={t("password")}
                onChange={(event) => setPassword(event.target.value)}
                className="login-input"
              />
              <button type="submit" className="login-btn">
                {loginTab === "login" ? t("login") : t("register")}
              </button>
              {loginError && <div className="login-error">{loginError}</div>}
            </form>
            <button type="button" className="google-login-btn" onClick={handleGoogleLogin}>
              <img
                className="google-mark"
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt=""
              />
              {t("google_login")}
            </button>
            <button className="login-cancel" type="button" onClick={() => setShowLogin(false)}>
              {t("close")}
            </button>
          </div>
        </div>
      )}

      {detailMenu && (
        <div className="meal-detail-bg" onClick={() => setDetailMenu(null)}>
          <div className="meal-detail" onClick={(event) => event.stopPropagation()}>
            <div className="meal-detail-header">
              <span className={`meal-status-dot ${detailMenu.assessment.category}`} />
              <div>
                <p>{t(detailMenu.assessment.labelKey)}</p>
                <h2>{detailMenu.name}</h2>
              </div>
            </div>
            <div className="meal-detail-ingredients">
              {detailMenu.ingredients.length ? detailMenu.ingredients.map((ingredient) => (
                <span
                  key={ingredient}
                  className={preferences.allergies.includes(ingredient) ? "highlight-allergy" : ""}
                >
                  {t(ingredient)}
                </span>
              )) : (
                <span>{t("no_allergy_codes")}</span>
              )}
            </div>
            <button className="meal-detail-close" onClick={() => setDetailMenu(null)}>
              {t("close")}
            </button>
          </div>
        </div>
      )}

      <section className="home-hero">
        <div className="hero-topbar">
          <div className="school-lockup">
            <SchoolLogo school={school} />
            <div>
              <p>{schoolReady ? [school.region, school.kind].filter(Boolean).join(" · ") : t("school_not_selected")}</p>
              <h1>{schoolReady ? school.schoolName : t("select_school_first")}</h1>
            </div>
          </div>
          {user ? (
            <button className="ghost-button" onClick={handleLogout}>
              {t("logout")}
            </button>
          ) : (
            <button className="primary-small-button" onClick={() => setShowLogin(true)}>
              {t("login")}
            </button>
          )}
        </div>

        <div className="date-panel">
          <div>
            <span>{t("today_meal")}</span>
            <strong>{getDateDisplay(selectedDate, i18n.language)}</strong>
          </div>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => date && setSelectedDate(date)}
            dateFormat={i18n.language === "en" ? "yyyy-MM-dd" : "yyyy년 MM월 dd일"}
            customInput={
              <button className="date-select-btn" type="button">
                {t("change")}
              </button>
            }
            calendarClassName="meal-datepicker"
            popperPlacement="bottom-end"
            minDate={new Date(2020, 0, 1)}
            maxDate={new Date(2099, 11, 31)}
            showPopperArrow={false}
          />
        </div>
      </section>

      <section className="meal-shell">
        <div className="meal-shell-header">
          <div>
            <p>{t("meal_available")}</p>
            <h2>{schoolReady ? (availableMealNames || t("no_meal_data")) : t("no_school_selected")}</h2>
          </div>
          {activeMeal?.calories && <span className="calorie-pill">{activeMeal.calories}</span>}
        </div>

        {schoolReady && mealGroups.length > 0 && (
          <div className="meal-segment" role="tablist" aria-label={t("meal")}>
            {mealGroups.map((meal) => {
            const summary = summarizeDishes(meal.dishes, preferences);
            return (
              <button
                type="button"
                role="tab"
                aria-selected={selectedMealCode === meal.code}
                key={meal.code}
                className={selectedMealCode === meal.code ? "active" : ""}
                onClick={() => setSelectedMealCode(meal.code)}
              >
                <span>{meal.name}</span>
                <strong>{summary.safe}/{meal.dishes.length}</strong>
              </button>
            );
            })}
          </div>
        )}

        <div className="summary-strip">
          <div>
            <span className="summary-dot safe" />
            <p>{t("possible")}</p>
            <strong>{activeSummary.safe}</strong>
          </div>
          <div>
            <span className="summary-dot caution" />
            <p>{t("caution")}</p>
            <strong>{activeSummary.caution}</strong>
          </div>
          <div>
            <span className="summary-dot excluded" />
            <p>{t("excluded")}</p>
            <strong>{activeSummary.excluded}</strong>
          </div>
        </div>

        <div className="meal-items">
          {!schoolReady ? (
            <div className="empty-state action-state">
              <strong>{t("school_setup_needed")}</strong>
              <span>{user ? t("school_setup_hint") : t("login_to_select_school")}</span>
              <button type="button" onClick={() => user ? navigate("/settings") : setShowLogin(true)}>
                {user ? t("go_settings") : t("login")}
              </button>
            </div>
          ) : loading ? (
            <div className="empty-state">{t("loading")}</div>
          ) : mealError ? (
            <div className="empty-state">{mealError}</div>
          ) : !activeMeal?.dishes?.length ? (
            <div className="empty-state">{t("no_meal_data")}</div>
          ) : (
            activeMeal.dishes.map((menu) => {
              const assessment = assessDish(menu, preferences);
              return (
                <button
                  type="button"
                  key={`${activeMeal.code}-${menu.name}`}
                  className={`simple-meal-item ${assessment.category}`}
                  onClick={() => setDetailMenu({ ...menu, assessment })}
                >
                  <span className={`meal-status-dot ${assessment.category}`} aria-hidden="true" />
                  <span className="meal-item-copy">
                    <strong>{menu.name}</strong>
                    <small>
                      {t(assessment.labelKey)}
                      {assessment.hits.length ? ` · ${assessment.hits.map((hit) => t(hit)).join(", ")}` : ""}
                    </small>
                  </span>
                </button>
              );
            })
          )}
        </div>

        {activeMeal?.nutrition && (
          <details className="nutrition-panel">
            <summary>{t("nutrition_info")}</summary>
            <p>{activeMeal.nutrition.replaceAll("<br/>", " · ")}</p>
          </details>
        )}
      </section>
    </main>
  );
};

export default HomeScreen;
