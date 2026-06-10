import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Week.css";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import {
  assessDish,
  buildMealUrl,
  getDateDisplay,
  parseMealRows
} from "../utils/mealUtils";
import { EMPTY_SCHOOL, hasSchool, resolveSchool } from "../utils/school";

const WEEKDAY_KO = ["월", "화", "수", "목", "금"];
const WEEKDAY_EN = ["Mon", "Tue", "Wed", "Thu", "Fri"];

function toYMD(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

function getWeekDates(date) {
  const ref = new Date(date || new Date());
  const day = ref.getDay();
  const monday = new Date(ref);
  monday.setDate(ref.getDate() - ((day + 6) % 7));

  return Array.from({ length: 5 }, (_, index) => {
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + index);
    return {
      key: toYMD(dayDate),
      label: `${dayDate.getMonth() + 1}/${dayDate.getDate()}`,
      date: dayDate
    };
  });
}

const emptyCounts = () => ({ safe: 0, caution: 0, excluded: 0 });

export const Week = ({ className = "" }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [school, setSchool] = useState(EMPTY_SCHOOL);
  const [preferences, setPreferences] = useState({
    allergies: [],
    religions: [],
    dietType: ""
  });
  const [days, setDays] = useState([]);
  const [selectedDayKey, setSelectedDayKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);
  const dayLabels = i18n.language === "en" ? WEEKDAY_EN : WEEKDAY_KO;

  useEffect(() => {
    async function fetchUserSettings() {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
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
  }, []);

  useEffect(() => {
    async function fetchWeekMeals() {
      if (!hasSchool(school)) {
        setDays(weekDates.map((day, index) => ({
          ...day,
          weekday: dayLabels[index],
          counts: emptyCounts(),
          meals: [],
          dishes: []
        })));
        setSelectedDayKey(weekDates[0]?.key || "");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const url = buildMealUrl({
          eduCode: school.eduCode,
          schoolCode: school.schoolCode,
          from: weekDates[0].key,
          to: weekDates[4].key,
          size: 100
        });
        const res = await fetch(url);
        const data = await res.json();
        const rows = parseMealRows(data?.mealServiceDietInfo?.[1]?.row || []);

        const nextDays = weekDates.map((day, index) => {
          const meals = rows.filter((meal) => meal.date === day.key);
          const dishes = meals.flatMap((meal) =>
            meal.dishes.map((dish) => ({
              ...dish,
              mealName: meal.name,
              assessment: assessDish(dish, preferences)
            }))
          );
          const counts = dishes.reduce((acc, dish) => {
            acc[dish.assessment.category] += 1;
            return acc;
          }, emptyCounts());

          return {
            ...day,
            weekday: dayLabels[index],
            counts,
            meals,
            dishes
          };
        });

        setDays(nextDays);
        setSelectedDayKey((current) => current || nextDays[0]?.key || "");
      } catch (fetchError) {
        console.error("주간 급식 데이터를 불러오는 중 오류 발생:", fetchError);
        setError(t("meal_load_failed"));
        setDays([]);
      } finally {
        setLoading(false);
      }
    }

    fetchWeekMeals();
  }, [school, preferences, weekDates, dayLabels, t]);

  const totals = useMemo(() => {
    return days.reduce((acc, day) => {
      acc.safe += day.counts.safe;
      acc.caution += day.counts.caution;
      acc.excluded += day.counts.excluded;
      return acc;
    }, emptyCounts());
  }, [days]);

  const totalCount = totals.safe + totals.caution + totals.excluded;
  const possibleRate = totalCount ? Math.round((totals.safe / totalCount) * 100) : 0;
  const selectedDay = days.find((day) => day.key === selectedDayKey) || days[0];
  const riskItems = useMemo(() => {
    const counts = {};
    days.forEach((day) => {
      day.dishes.forEach((dish) => {
        if (dish.assessment.category === "safe") return;
        const key = dish.assessment.hits[0] || dish.name;
        counts[key] = (counts[key] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));
  }, [days]);

  const pieData = [
    { name: t("possible"), value: totals.safe, color: "#34c759" },
    { name: t("caution"), value: totals.caution, color: "#ff9f0a" },
    { name: t("excluded"), value: totals.excluded, color: "#ff3b30" }
  ];

  const barData = days.map((day) => ({
    name: day.weekday,
    safe: day.counts.safe,
    caution: day.counts.caution,
    excluded: day.counts.excluded
  }));

  return (
    <main className={`week-report ${className}`}>
      <header className="week-report-header">
        <div>
          <p>{school.schoolName || t("no_school_selected")}</p>
          <h1>{t("weekly_report")}</h1>
        </div>
        <DatePicker
          selected={selectedDate}
          onChange={(date) => date && setSelectedDate(date)}
          dateFormat="yyyy-MM-dd"
          customInput={<button className="week-date-button" type="button">{t("change")}</button>}
          showPopperArrow={false}
        />
      </header>

      {!hasSchool(school) ? (
        <section className="week-empty">
          <strong>{t("school_setup_needed")}</strong>
          <span>{t("school_setup_hint")}</span>
          <button type="button" onClick={() => navigate("/settings")}>{t("go_settings")}</button>
        </section>
      ) : (
        <>
          <section className="week-summary-grid">
            <div className="week-summary-card main">
              <span>{weekDates[0]?.label} - {weekDates[4]?.label}</span>
              <strong>{possibleRate}%</strong>
              <p>{t("possible_meals")}</p>
            </div>
            <div className="week-summary-card">
              <span>{t("possible")}</span>
              <strong>{totals.safe}</strong>
            </div>
            <div className="week-summary-card">
              <span>{t("caution")}</span>
              <strong>{totals.caution}</strong>
            </div>
            <div className="week-summary-card">
              <span>{t("excluded")}</span>
              <strong>{totals.excluded}</strong>
            </div>
          </section>

          <section className="week-chart-grid">
            <div className="week-chart-card">
              <div className="week-card-heading">
                <p>{t("weekday_results")}</p>
                <h2>{t("meal_summary")}</h2>
              </div>
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={barData} margin={{ top: 12, right: 4, left: -28, bottom: 0 }}>
                  <CartesianGrid stroke="#eceef2" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="safe" stackId="a" fill="#34c759" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="caution" stackId="a" fill="#ff9f0a" />
                  <Bar dataKey="excluded" stackId="a" fill="#ff3b30" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="week-chart-card compact">
              <div className="week-card-heading">
                <p>{t("possible_meals")}</p>
                <h2>{possibleRate}%</h2>
              </div>
              <ResponsiveContainer width="100%" height={210}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" innerRadius={56} outerRadius={82} paddingAngle={3}>
                    {pieData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="week-legend">
                {pieData.map((item) => (
                  <span key={item.name}><i style={{ background: item.color }} />{item.name} {item.value}</span>
                ))}
              </div>
            </div>
          </section>

          <section className="day-tabs-section">
            <div className="week-card-heading">
              <p>{t("mon_fri_meal")}</p>
              <h2>{t("weekday_results")}</h2>
            </div>
            <div className="day-tabs">
              {days.map((day) => {
                const riskCount = day.counts.caution + day.counts.excluded;
                return (
                  <button
                    key={day.key}
                    type="button"
                    className={selectedDay?.key === day.key ? "active" : ""}
                    onClick={() => setSelectedDayKey(day.key)}
                  >
                    <strong>{day.weekday}</strong>
                    <span>{day.label}</span>
                    <em>{day.dishes.length}{t("count_unit")} · {riskCount}{t("risk_count_unit")}</em>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="day-detail-card">
            <div className="week-card-heading">
              <p>{selectedDay ? getDateDisplay(selectedDay.date, i18n.language) : ""}</p>
              <h2>{t("selected_day_detail")}</h2>
            </div>
            {loading ? (
              <div className="week-placeholder">{t("loading")}</div>
            ) : error ? (
              <div className="week-placeholder">{error}</div>
            ) : !selectedDay?.dishes.length ? (
              <div className="week-placeholder">{t("no_meal_data")}</div>
            ) : (
              <div className="day-dish-list">
                {selectedDay.dishes.map((dish) => (
                  <button
                    key={`${dish.mealName}-${dish.name}`}
                    type="button"
                    className={`day-dish ${dish.assessment.category}`}
                  >
                    <span>{dish.mealName}</span>
                    <strong>{dish.name}</strong>
                    <em>
                      {t(dish.assessment.labelKey)}
                      {dish.assessment.hits.length ? ` · ${dish.assessment.hits.map((hit) => t(hit)).join(", ")}` : ""}
                    </em>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="risk-card">
            <div className="week-card-heading">
              <p>{t("excluded_top3")}</p>
              <h2>{t("risk_summary")}</h2>
            </div>
            {riskItems.length ? (
              <div className="risk-list">
                {riskItems.map((item) => (
                  <div key={item.name}>
                    <strong>{t(item.name)}</strong>
                    <span>{item.count}{t("count_unit")}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="week-placeholder small">{t("no_excluded")}</div>
            )}
          </section>
        </>
      )}
    </main>
  );
};

export default Week;
