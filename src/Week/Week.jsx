import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Week.css";
import calander from "../imgs/CCC.png";
import chart from "../imgs/chart.png";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { Layout } from "../components/Layout";

// 알레르기 코드 매핑
const allergyMap = {
  1: "난류", 2: "우유", 3: "메밀", 4: "땅콩", 5: "대두", 6: "밀",
  7: "고등어", 8: "게", 9: "새우", 10: "돼지고기", 11: "복숭아",
  12: "토마토", 13: "아황산류", 14: "호두", 15: "닭고기", 16: "쇠고기",
  17: "오징어", 18: "조개류"
};

// 요일(월~금) 텍스트
const DAY_LABELS = ["월", "화", "수", "목", "금"];

// 해당 날짜 기준으로 '그 주 월요일~금요일 날짜 리스트' 반환
function getWeekDates(date) {
  // date가 undefined면 오늘 날짜로
  const ref = date ? new Date(date) : new Date();
  const day = ref.getDay();
  // 일요일: 0, 월요일: 1 ... 금요일: 5, 토요일: 6
  // 월요일로 맞추기
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

export const Week = ({ onNavigate, className, ...props }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekData, setWeekData] = useState([]);
  const [summary, setSummary] = useState({ 가능: 0, 주의: 0, 제외: 0 });
  const [daily, setDaily] = useState({});
  const [topExclude, setTopExclude] = useState([]);
  const [allergies, setAllergies] = useState([]);

  const weekDates = getWeekDates(selectedDate);

  // 사용자 알레르기 정보 로딩
  useEffect(() => {
    const fetchUserAllergy = async () => {
      const user = auth.currentUser;
      if (user) {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setAllergies(snap.data().allergies || []);
        }
      }
    };
    fetchUserAllergy();
  }, []);

  // 급식 데이터 주간 로딩 + 분석
  useEffect(() => {
    const fetchMeals = async () => {
      const from = weekDates[0].key;
      const to = weekDates[4].key;
      // 아래 2개는 학교코드, 교육청코드 (이 부분은 props나 context로 추후 개선 가능)
      const url = `https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=a27ba9b1a9144411a928c9358597817e&Type=json&pIndex=1&pSize=100&ATPT_OFCDC_SC_CODE=E10&SD_SCHUL_CODE=7361255&MLSV_FROM_YMD=${from}&MLSV_TO_YMD=${to}`;
      const res = await fetch(url);
      const data = await res.json();
      const rows = data?.mealServiceDietInfo?.[1]?.row || [];
      setWeekData(rows);

      let sum = { 가능: 0, 주의: 0, 제외: 0 };
      let perDay = {};
      let excludeCount = {};
      weekDates.forEach(({ key }) => { perDay[key] = { 가능: 0, 주의: 0, 제외: 0 }; });

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
          if (ingredients.length && allergies.length) {
            const overlap = ingredients.filter((i) => allergies.includes(i));
            if (overlap.length) {
              category = "주의";
              overlap.forEach((a) => { excludeCount[a] = (excludeCount[a] || 0) + 1; });
            }
          }
          sum[category]++;
          perDay[date][category]++;
        }
      }

      setSummary(sum);
      setDaily(perDay);
      // 제외 top3
      const top = Object.entries(excludeCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, cnt]) => ({ name, count: cnt }));
      setTopExclude(top);
    };
    if (allergies.length > 0) fetchMeals();
  }, [allergies, selectedDate]); // 날짜 바뀔 때마다 재요청

  // PieChart용
  const pieData = [
    { label: "가능", value: summary.가능, color: "#4CAF50" },
    { label: "주의", value: summary.주의, color: "#FFC107" },
    { label: "제외", value: summary.제외, color: "#F44336" },
  ];

  return (
    
    <div className={"week " + className}>
      <div className="header">
        <div className="div">주간 급식 리포트</div>
      </div>
      <div className="content-container">
        <div className="content">
          {/* 달력: 주간 선택 */}
          <div style={{ margin: "12px 0", display: "flex", gap: 16, alignItems: "center" }}>
            <span style={{ fontSize: 16 }}>조회할 주 선택: </span>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="yyyy-MM-dd"
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              placeholderText="주 선택"
              customInput={<button className="custom-datepicker-btn">{selectedDate ? selectedDate.toLocaleDateString() : "주 선택"}</button>}
            />
            <span style={{ fontSize: 13, color: "#888" }}>(월요일~금요일 급식)</span>
          </div>
          {/* 주간 요약 */}
          <div className="week-period">
            <div className="calendar-icon">
              <img className="calendar-range" src={calander} />
              <div className="div2">급식 요약</div>
            </div>
            <div className="_5-27-31-5">
              {weekDates[0].label} ~ {weekDates[4].label} (5일간)
            </div>
          </div>
          <div className="stats-overview">
            <div className="stats-header">
              <img className="pie-chart" src={chart} />
              <div className="div3">섭취 가능 식단 비율</div>
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
                    <span style={{ fontWeight: "bold", color: item.color }}>{item.label} {item.value}개</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* 요일별 breakdown */}
          <div className="daily-breakdown">
            <div className="daily-header">
              <img className="calendar-days" src={calander} />
              <div className="div5">요일별 급식 결과</div>
            </div>
            <div className="daily-grid">
              {weekDates.map((d, idx) => (
                <div className="day-column" key={d.key}>
                  <div className="day-info">
                    <div className="div6">{DAY_LABELS[idx]}요일</div>
                    <div className="_5-27">{d.label}</div>
                  </div>
                  <div className="day-results">
                    {["가능", "주의", "제외"].map((cat, i) =>
                      Array.from({ length: (daily[d.key]?.[cat] || 0) }).map((_, j) => (
                        <div className={"frame" + (cat === "가능" ? "4" : cat === "주의" ? "5" : "6")} key={cat + j}>
                          <img
                            className={cat === "가능" ? "check" : cat === "주의" ? "alert-triangle" : "x"}
                            src={cat === "가능" ? "check0.svg" : cat === "주의" ? "alert-triangle0.svg" : "x0.svg"}
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
              <img className="x-circle" src="x-circle0.svg" />
              <div className="top-3">제외된 항목 TOP 3</div>
            </div>
            <div className="excluded-list">
              {topExclude.length === 0 ? (
                <div style={{ color: "#666" }}>이번 주 제외 항목이 없습니다.</div>
              ) : (
                topExclude.map((item, idx) => (
                  <div className={`excluded-item-${idx + 1}`} key={item.name}>
                    <div className="item-info">
                      <div className="div6">{item.name}</div>
                    </div>
                    <div className="reason">
                      <div className="div7">알레르기 {item.count}회</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          {/* 기타 피드백 등 나머지 UI... */}
        </div>
      </div>
           </div>
    
      
  );
};

export default Week;
