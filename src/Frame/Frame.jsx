import "./Frame.css";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { onAuthStateChanged, sendPasswordResetEmail, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  Bell,
  ChevronRight,
  Languages,
  LogOut,
  Pencil,
  Settings,
  ShieldCheck,
  Utensils
} from "lucide-react";
import { auth, db } from "../firebase";
import { assessDish, buildMealUrl, parseMealRows } from "../utils/mealUtils";
import { EMPTY_SCHOOL, hasSchool, resolveSchool } from "../utils/school";
import { SchoolLogo } from "../components/SchoolLogo";

const getCurrentWeekRange = () => {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((day + 6) % 7));
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  const fmt = (date) => date.toISOString().slice(0, 10).replace(/-/g, "");
  return { from: fmt(monday), to: fmt(friday) };
};

export const Frame = ({ className = "" }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [nameInput, setNameInput] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ safe: 0, caution: 0, excluded: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setUserData(null);
        setLoading(false);
        return;
      }

      const snap = await getDoc(doc(db, "users", currentUser.uid));
      const data = snap.exists() ? snap.data() : {};
      setUserData(data);
      setNameInput(data.name || "");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const school = useMemo(() => resolveSchool(userData || {}), [userData]);
  const preferences = useMemo(() => ({
    allergies: userData?.allergies || [],
    religions: userData?.religion || [],
    dietType: userData?.dietType || ""
  }), [userData]);

  useEffect(() => {
    async function fetchStats() {
      if (!hasSchool(school)) {
        setStats({ safe: 0, caution: 0, excluded: 0 });
        setStatsLoading(false);
        return;
      }

      setStatsLoading(true);
      try {
        const { from, to } = getCurrentWeekRange();
        const res = await fetch(buildMealUrl({
          eduCode: school.eduCode,
          schoolCode: school.schoolCode,
          from,
          to,
          size: 100
        }));
        const data = await res.json();
        const meals = parseMealRows(data?.mealServiceDietInfo?.[1]?.row || []);
        const counts = meals
          .flatMap((meal) => meal.dishes)
          .reduce((acc, dish) => {
            acc[assessDish(dish, preferences).category] += 1;
            return acc;
          }, { safe: 0, caution: 0, excluded: 0 });
        setStats(counts);
      } catch (error) {
        console.error(error);
        setStats({ safe: 0, caution: 0, excluded: 0 });
      } finally {
        setStatsLoading(false);
      }
    }

    fetchStats();
  }, [school, preferences]);

  const saveName = async () => {
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid), { name: nameInput });
    setUserData((current) => ({ ...current, name: nameInput }));
    setEditingName(false);
  };

  const logout = async () => {
    await signOut(auth);
    navigate("/", { replace: true });
  };

  const requestPasswordReset = async () => {
    if (!user?.email) return;
    try {
      await sendPasswordResetEmail(auth, user.email);
      setPasswordMessage(t("password_reset_sent"));
    } catch (error) {
      console.error(error);
      setPasswordMessage(t("save_failed"));
    }
  };

  if (loading) return <main className="profile-redesign"><div className="profile-empty">{t("loading")}</div></main>;

  if (!user) {
    return (
      <main className="profile-redesign">
        <section className="profile-empty">
          <strong>{t("login_required")}</strong>
          <span>{t("login_required_detail")}</span>
          <button type="button" onClick={() => navigate("/login")}>{t("login")}</button>
        </section>
      </main>
    );
  }

  const displayName = userData?.name || user.email || t("no_name");
  const total = stats.safe + stats.caution + stats.excluded;
  const safeRate = total ? Math.round((stats.safe / total) * 100) : 0;
  const allergyText = preferences.allergies.length ? preferences.allergies.join(", ") : t("none");
  const religionText = preferences.religions.length ? preferences.religions.join(", ") : t("none");

  return (
    <main className={`profile-redesign ${className}`}>
      <header className="profile-header">
        <div>
          <p>{t("profile")}</p>
          <h1>{displayName}</h1>
        </div>
        <button type="button" className="icon-button" onClick={() => navigate("/settings")} aria-label={t("settings")}>
          <Settings size={20} />
        </button>
      </header>

      <section className="profile-identity-card">
        <SchoolLogo school={school} size="lg" />
        <div className="profile-name-block">
          {editingName ? (
            <div className="profile-edit-row">
              <input value={nameInput} onChange={(event) => setNameInput(event.target.value)} placeholder={t("no_name")} />
              <button type="button" onClick={saveName}>{t("save")}</button>
            </div>
          ) : (
            <button type="button" className="profile-name-button" onClick={() => setEditingName(true)}>
              <span>{displayName}</span>
              <Pencil size={15} />
            </button>
          )}
          <p>{hasSchool(school) ? school.schoolName : t("no_school_selected")}</p>
        </div>
      </section>

      <section className="profile-stat-grid">
        <div>
          <span>{t("possible_meals")}</span>
          <strong>{statsLoading ? "-" : `${safeRate}%`}</strong>
        </div>
        <div>
          <span>{t("caution")}</span>
          <strong>{statsLoading ? "-" : stats.caution}</strong>
        </div>
        <div>
          <span>{t("excluded")}</span>
          <strong>{statsLoading ? "-" : stats.excluded}</strong>
        </div>
      </section>

      <section className="profile-section">
        <div className="profile-section-heading">
          <ShieldCheck size={18} />
          <h2>{t("account_setting")}</h2>
        </div>
        <div className="credential-list">
          <div>
            <span>{t("email")}</span>
            <strong>{user.email || "-"}</strong>
          </div>
          <div>
            <span>{t("password")}</span>
            <strong>••••••••</strong>
            <button type="button" onClick={requestPasswordReset}>{t("reset_password")}</button>
          </div>
        </div>
        {passwordMessage && <p className="profile-message">{passwordMessage}</p>}
      </section>

      <section className="profile-section">
        <div className="profile-section-heading">
          <Utensils size={18} />
          <h2>{t("meal_filter")}</h2>
        </div>
        <div className="profile-filter-list">
          <div><span>{t("dietType")}</span><strong>{userData?.dietType || t("none")}</strong></div>
          <div><span>{t("religion")}</span><strong>{religionText}</strong></div>
          <div><span>{t("allergy")}</span><strong>{allergyText}</strong></div>
        </div>
      </section>

      <section className="profile-section action-list">
        <button type="button" onClick={() => navigate("/week")}>
          <ShieldCheck size={18} />
          <span>{t("weekly_report")}</span>
          <ChevronRight size={18} />
        </button>
        <button type="button" onClick={() => setLanguageOpen((open) => !open)}>
          <Languages size={18} />
          <span>{t("language_setting")}</span>
          <em>{i18n.language === "ko" ? "한국어" : i18n.language === "en" ? "English" : "中文"}</em>
        </button>
        {languageOpen && (
          <div className="language-picker">
            {[
              { code: "ko", label: "한국어" },
              { code: "en", label: "English" },
              { code: "zh", label: "中文" }
            ].map((language) => (
              <button
                key={language.code}
                type="button"
                className={i18n.language === language.code ? "selected" : ""}
                onClick={() => {
                  i18n.changeLanguage(language.code);
                  setLanguageOpen(false);
                }}
              >
                {language.label}
              </button>
            ))}
          </div>
        )}
        <button type="button" onClick={() => setNotificationsOpen((open) => !open)}>
          <Bell size={18} />
          <span>{t("notification_setting")}</span>
          <em>{notificationsOpen ? t("close") : "ON"}</em>
        </button>
        {notificationsOpen && (
          <div className="notification-panel">
            <label>
              <input type="checkbox" defaultChecked />
              {t("meal_change_notification")}
            </label>
            <label>
              <input type="checkbox" defaultChecked />
              {t("feedback_request_notification")}
            </label>
          </div>
        )}
      </section>

      <section className="profile-section account-actions">
        <button type="button" onClick={() => navigate("/privacy")}>{t("privacy_policy")}</button>
        <button type="button" className="danger" onClick={logout}>
          <LogOut size={17} />
          {t("logout")}
        </button>
      </section>
    </main>
  );
};

export default Frame;
