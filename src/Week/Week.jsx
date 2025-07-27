import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Week.css";
import calander from "../imgs/CCC.png";
import chart from "../imgs/chart.png";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { Layout } from "../components/Layout";
import { violatesReligion } from "../utils/religionRules";
import { violatesDiet } from "../utils/dietRules";

// 알레르기 코드 매핑(항상 한글로!)
const allergyMap = {
  1: "난류", 2: "우유", 3: "메밀", 4: "땅콩", 5: "대두", 6: "밀",
  7: "고등어", 8: "게", 9: "새우", 10: "돼지고기", 11: "복숭아",
  12: "토마토", 13: "아황산류", 14: "호두", 15: "닭고기", 16: "쇠고기",
  17: "오징어", 18: "조개류"
};

// 요일(월~금) 텍스트
const DAY_LABELS_KO = ["월", "화", "수", "목", "금"];
const DAY_LABELS_EN = ["Mon", "Tue", "Wed", "Thu", "Fri"];

function getWeekDates(date) {
  const ref = date ? new Date(date) : new Date();
  const day = ref.getDay();
  const monday = new Date(ref.setDate(ref.getDate() - ((day + 6) % 7)));
  const dates = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push({
      key: d.toISOString().slice(0, 10).replace(/-/g, ""),
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      dateObj: new Date(d)
    });
  }
  return dates;
}

function getDateDisplay(date, i18n) {
  const yyyy = date.getFullYear();
  const mm = date.getMonth() + 1;
  const dd = date.getDate();
  const dayNames = i18n.language === "en"
    ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    : ["일", "월", "화", "수", "목", "금", "토"];
  const day = dayNames[date.getDay()];
  return i18n.language === "en"
    ? `${yyyy}-${mm}-${dd} (${day})`
    : `${yyyy}년 ${mm}월 ${dd}일 (${day})`;
}

export const Week = ({ onNavigate, className, ...props }) => {
  const { t, i18n } = useTranslation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekData, setWeekData] = useState([]);
  const [summary, setSummary] = useState({ 가능: 0, 주의: 0, 제외: 0 });
  const [daily, setDaily] = useState({});
  const [dailyMenus, setDailyMenus] = useState({});
  const [topExclude, setTopExclude] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [religions, setReligions] = useState([]);
  const [dietType, setDietType] = useState("");
  const [dayMenus, setDayMenus] = useState(null);
  const [detailMenu, setDetailMenu] = useState(null);

  const weekDates = getWeekDates(selectedDate);
  const DAY_LABELS = i18n.language === "en" ? DAY_LABELS_EN : DAY_LABELS_KO;

  // 사용자 알레르기/종교 정보 로딩
  useEffect(() => {
    const fetchUserSettings = async () => {
      const user = auth.currentUser;
      if (user) {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setAllergies(data.allergies || []);
          setReligions(data.religion || []);
          setDietType(data.dietType || "");
        }
      }
    };
    fetchUserSettings();
  }, []);

  // 급식 데이터 주간 로딩 + 분석
  useEffect(() => {
    const fetchMeals = async () => {
      const from = weekDates[0].key;
      const to = weekDates[4].key;
      // 학교코드/교육청코드는 필요시 props로 교체
      const url = `https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=a27ba9b1a9144411a928c9358597817e&Type=json&pIndex=1&pSize=100&ATPT_OFCDC_SC_CODE=E10&SD_SCHUL_CODE=7361255&MLSV_FROM_YMD=${from}&MLSV_TO_YMD=${to}`;
      const res = await fetch(url);
      const data = await res.json();
      const rows = data?.mealServiceDietInfo?.[1]?.row || [];
      setWeekData(rows);

      let sum = { 가능: 0, 주의: 0, 제외: 0 };
      let perDay = {};
      let perDayMenus = {};
      let excludeCount = {};
      weekDates.forEach(({ key }) => {
        perDay[key] = { 가능: 0, 주의: 0, 제외: 0 };
        perDayMenus[key] = [];
      });

      for (const meal of rows) {
        const date = meal.MLSV_YMD;
        const dishes = meal.DDISH_NM.split("<br/>");
        for (const dish of dishes) {
          const name = dish.replace(/\s*\([^)]+\)/, "").trim();
          const match = dish.match(/\(([^)]+)\)/);
          const codes = match ? match[1].split(".").map(Number) : [];
          const ingredients = codes.map((c) => allergyMap[c]).filter(Boolean);
          // 분류
          let category = "가능";
          if (violatesDiet(name, ingredients, dietType)) {
            category = "제외";
            excludeCount[name] = (excludeCount[name] || 0) + 1;
          } else if (violatesReligion(name, religions)) {
            category = "제외";
            excludeCount[name] = (excludeCount[name] || 0) + 1;
          } else if (ingredients.length && allergies.length) {
            const overlap = ingredients.filter((i) => allergies.includes(i));
            if (overlap.length) {
              category = "주의";
              overlap.forEach((a) => { excludeCount[a] = (excludeCount[a] || 0) + 1; });
            }
          }
          sum[category]++;
          perDay[date][category]++;
          perDayMenus[date].push({ name, ingredients, category });
        }
      }

      setSummary(sum);
      setDaily(perDay);
      setDailyMenus(perDayMenus);
      // 제외 top3
      const top = Object.entries(excludeCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, cnt]) => ({ name, count: cnt }));
      setTopExclude(top);
    };
    // fetch meal data even when the user has no allergies selected
    // to ensure the weekly chart is always populated
    fetchMeals();
    // eslint-disable-next-line
  }, [allergies, selectedDate, dietType, religions]);

  // PieChart용 데이터(라벨 번역)
  const pieData = [
    { label: t("possible"), value: summary.가능, color: "#4CAF50" },
    { label: t("caution"), value: summary.주의, color: "#FFC107" },
    { label: t("excluded"), value: summary.제외, color: "#F44336" },
  ];

  return (
    <>
      {dayMenus && (
        <div className="meal-detail-bg" onClick={() => setDayMenus(null)}>
          <div className="meal-detail" onClick={(e) => e.stopPropagation()}>
            <div className="meal-detail-title">
              {getDateDisplay(dayMenus.date, i18n)} {t('meal')}
            </div>
            <div className="meal-items">
              {dayMenus.menus.map((menu, idx) => {
                const hasAllergy = menu.ingredients.some((i) => allergies.includes(i));
                const religionBan = violatesReligion(menu.name, religions);
                const dietBan = violatesDiet(menu.name, menu.ingredients, dietType);
                let className = 'simple-meal-item';
                let icon = '✅';
                let label = t('can_eat');
                if (dietBan) {
                  className += ' exclude';
                  icon = '❌';
                  label = t('diet_violation');
                } else if (religionBan) {
                  className += ' exclude';
                  icon = '❌';
                  label = t('religion_violation');
                } else if (hasAllergy) {
                  className += ' warning';
                  icon = '⚠️';
                  label = t('allergy_warning');
                }
                return (
                  <div key={idx} className={className} onClick={() => setDetailMenu(menu)}>
                    <span className="meal-name">{icon} {menu.name}</span>
                    <div style={{ fontSize: 13, marginTop: 4 }}>{label}</div>
                  </div>
                );
              })}
            </div>
            <button className="meal-detail-close" onClick={() => setDayMenus(null)}>
              {t('close')}
            </button>
          </div>
        </div>
      )}
      {detailMenu && (
        <div className="meal-detail-bg" onClick={() => setDetailMenu(null)}>
          <div className="meal-detail" onClick={(e) => e.stopPropagation()}>
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
      <div className={"week " + className}>
      <div className="header">
        <div className="div">{t("weekly_report")}</div>
      </div>
      <div className="content-container">
        <div className="content">
          {/* 달력: 주간 선택 */}
          <div style={{ margin: "12px 0", display: "flex", gap: 16, alignItems: "center" }}>
            <span style={{ fontSize: 16 }}>{t("select_week")}</span>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat={i18n.language === "en" ? "yyyy-MM-dd" : "yyyy-MM-dd"}
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              placeholderText={t("select_week")}
              customInput={
                <button className="custom-datepicker-btn">
                  {selectedDate ? selectedDate.toLocaleDateString() : t("select_week")}
                </button>
              }
            />
            <span style={{ fontSize: 13, color: "#888" }}>{t("mon_fri_meal")}</span>
          </div>
          {/* 주간 요약 */}
          <div className="week-period">
            <div className="calendar-icon">
              <img className="calendar-range" src={calander} alt="calendar" />
              <div className="div2">{t("meal_summary")}</div>
            </div>
            <div className="_5-27-31-5">
              {weekDates[0].label} ~ {weekDates[4].label} {t("days_period")}
            </div>
          </div>
          <div className="stats-overview">
            <div className="stats-header">
              <img className="pie-chart" src={chart} alt="chart" />
              <div className="div3">{t("possible_meals")}</div>
            </div>
            <div className="chart-container" style={{ display: "flex", gap: "24px", alignItems: "center" }}>
              {/* 차트 */}
              <PieChart width={250} height={200}>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  dataKey="value"
                  labelLine={false}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
              {/* 오른쪽 텍스트 */}
              <div className="chart-legend" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {pieData.map((item, index) => (
                  <div key={index} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div
                      style={{
                        width: "12px", height: "12px", borderRadius: "50%", backgroundColor: item.color,
                      }}
                    />
                    <span style={{ fontWeight: "bold", color: item.color }}>
                      {item.label} {item.value}{t("count_unit")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* 요일별 breakdown */}
          <div className="daily-breakdown">
            <div className="daily-header">
              <img className="calendar-days" src={calander} alt="calendar-days" />
              <div className="div5">{t("weekday_results")}</div>
            </div>
            <div className="daily-grid">
              {weekDates.map((d, idx) => (
                <div
                  className="day-column"
                  key={d.key}
                  onClick={() =>
                    setDayMenus({ date: d.dateObj, menus: dailyMenus[d.key] || [] })
                  }
                >
                  <div className="day-info">
                    <div className="div6">{DAY_LABELS[idx]}{t("day_of_week")}</div>
                    <div className="_5-27">{d.label}</div>
                  </div>
                  <div className="day-results">
                    {["가능", "주의", "제외"].map((cat, i) =>
                      Array.from({ length: (daily[d.key]?.[cat] || 0) }).map((_, j) => (
                        <div className={"frame" + (cat === "가능" ? "4" : cat === "주의" ? "5" : "6")} key={cat + j}>
                          <img
                            className={cat === "가능" ? "check" : cat === "주의" ? "alert-triangle" : "x"}
                            src={cat === "가능" ? "check0.svg" : cat === "주의" ? "alert-triangle0.svg" : "x0.svg"}
                            alt={cat}
                          />  
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* 제외 TOP3 */}
          <div className="excluded-analysis">
            <div className="excluded-header">
              <img className="x-circle" src="x-circle0.svg" alt="x-circle"/>
              <div className="top-3">{t("excluded_top3")}</div>
            </div>
            <div className="excluded-list">
              {topExclude.length === 0 ? (
                <div style={{ color: "#666" }}>{t("no_excluded")}</div>
              ) : (
                topExclude.map((item, idx) => (
                  <div className={`excluded-item-${idx + 1}`} key={item.name}>
                    <div className="item-info">
                      <div className="div6">{t(item.name)}</div>
                    </div>
                    <div className="reason">
                      <div className="div7">{t("allergy_count", { count: item.count })}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
      </div>
    </div>
    </div>
    </>
  );
};

export default Week;
