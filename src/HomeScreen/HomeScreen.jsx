import "./HomeScreen.css";
import React, { useEffect, useState } from "react";

export const HomeScreen = ({onNavigate, className, ...props }) => {
    const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_KEY = "a27ba9b1a9144411a928c9358597817e"; // <- 직접 입력
  const EDU_CODE = "E10"; // 인천교육청
  const SCHOOL_CODE = "7361255"; // 인천초은중학교
  const NEXT_MONDAY = "20250529"; // 예시: 2024년 6월 3일 월요일


  useEffect(() => {
    async function fetchMeals() {
      setLoading(true);
      const url = `https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=${API_KEY}&Type=json&pIndex=1&pSize=10&ATPT_OFCDC_SC_CODE=${EDU_CODE}&SD_SCHUL_CODE=${SCHOOL_CODE}&MLSV_YMD=${NEXT_MONDAY}`;
      const res = await fetch(url);
      const data = await res.json();
      const rows = data?.mealServiceDietInfo?.[1]?.row;
      if (rows && rows[0]?.DDISH_NM) {
        // 메뉴 파싱 (<br/> 기준)
        setMeals(rows[0].DDISH_NM.split("<br/>").map((txt) => txt.replace(/\([^)]+\)/g, "").trim()));
      } else {
        setMeals([]);
      }
      setLoading(false);
    }
    fetchMeals();

  }, []);
  return (
    
    <div className={"home-screen " + className}>
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
            <div className="div2">{"2024년 6월 3일 (월) 급식"}</div>
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
