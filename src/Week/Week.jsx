import "./Week.css";

export const Week = ({ className, ...props }) => {
  return (
    <div className={"week " + className}>
      <div className="status-bar">
        <div className="_9-41">9:41 </div>
        <div className="status-icons">
          <img className="signal" src="signal0.svg" />
          <img className="wifi" src="wifi0.svg" />
          <img className="battery" src="battery0.svg" />
        </div>
      </div>
      <div className="header">
        <img className="arrow-left" src="arrow-left0.svg" />
        <div className="div">주간 급식 리포트 </div>
        <img className="download" src="download0.svg" />
      </div>
      <div className="content-container">
        <div className="content">
          <div className="week-period">
            <div className="calendar-icon">
              <img className="calendar-range" src="calendar-range0.svg" />
              <div className="div2">이번 주 급식 요약 </div>
            </div>
            <div className="_5-27-31-5">5월 27일 ~ 31일 (5일간) </div>
          </div>
          <div className="stats-overview">
            <div className="stats-header">
              <img className="pie-chart" src="pie-chart0.svg" />
              <div className="div3">섭취 가능 식단 비율 </div>
            </div>
            <div className="chart-container">
              <div className="chart-visual">
                <div className="chart-center">
                  <div className="_63">63% </div>
                  <div className="div4">섭취 가능 </div>
                </div>
              </div>
              <div className="chart-legend">
                <div className="safe-legend">
                  <div className="frame"></div>
                  <div className="_632">가능 63% </div>
                  <div className="_15">(15개) </div>
                </div>
                <div className="warning-legend">
                  <div className="frame2"></div>
                  <div className="_152">주의 15% </div>
                  <div className="_4">(4개) </div>
                </div>
                <div className="restricted-legend">
                  <div className="frame3"></div>
                  <div className="_22">제외 22% </div>
                  <div className="_5">(5개) </div>
                </div>
              </div>
            </div>
          </div>
          <div className="daily-breakdown">
            <div className="daily-header">
              <img className="calendar-days" src="calendar-days0.svg" />
              <div className="div5">요일별 급식 결과 </div>
            </div>
            <div className="daily-grid">
              <div className="monday">
                <div className="day-info">
                  <div className="div6">월요일 </div>
                  <div className="_5-27">5/27 </div>
                </div>
                <div className="day-results">
                  <div className="frame4">
                    <img className="check" src="check0.svg" />
                  </div>
                  <div className="frame4">
                    <img className="check2" src="check1.svg" />
                  </div>
                  <div className="frame5">
                    <img className="alert-triangle" src="alert-triangle0.svg" />
                  </div>
                  <div className="frame6">
                    <img className="x" src="x0.svg" />
                  </div>
                </div>
              </div>
              <div className="tuesday">
                <div className="day-info">
                  <div className="div6">화요일 </div>
                  <div className="_5-28">5/28 </div>
                </div>
                <div className="day-results">
                  <div className="frame4">
                    <img className="check3" src="check2.svg" />
                  </div>
                  <div className="frame6">
                    <img className="x2" src="x1.svg" />
                  </div>
                  <div className="frame6">
                    <img className="x3" src="x2.svg" />
                  </div>
                  <div className="frame4">
                    <img className="check4" src="check3.svg" />
                  </div>
                </div>
              </div>
              <div className="wednesday">
                <div className="day-info">
                  <div className="div6">수요일 </div>
                  <div className="_5-29">5/29 </div>
                </div>
                <div className="day-results">
                  <div className="frame5">
                    <img
                      className="alert-triangle2"
                      src="alert-triangle1.svg"
                    />
                  </div>
                  <div className="frame4">
                    <img className="check5" src="check4.svg" />
                  </div>
                  <div className="frame4">
                    <img className="check6" src="check5.svg" />
                  </div>
                  <div className="frame4">
                    <img className="check7" src="check6.svg" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="excluded-analysis">
            <div className="excluded-header">
              <img className="x-circle" src="x-circle0.svg" />
              <div className="top-3">제외된 항목 TOP 3 </div>
            </div>
            <div className="excluded-list">
              <div className="excluded-item-1">
                <div className="item-info">
                  <img className="milk" src="milk0.svg" />
                  <div className="div6">우유 </div>
                </div>
                <div className="reason">
                  <div className="div7">알레르기 </div>
                </div>
              </div>
              <div className="excluded-item-2">
                <div className="item-info">
                  <img className="beef" src="beef0.svg" />
                  <div className="div6">미트볼 </div>
                </div>
                <div className="reason">
                  <div className="div7">이슬람 제한 </div>
                </div>
              </div>
              <div className="excluded-item-3">
                <div className="item-info">
                  <img className="salad" src="salad0.svg" />
                  <div className="div6">버섯볶음 </div>
                </div>
                <div className="reason">
                  <div className="div7">약물 간섭 </div>
                </div>
              </div>
            </div>
          </div>
          <div className="feedback-summary">
            <div className="feedback-header">
              <img className="message-square" src="message-square0.svg" />
              <div className="div8">내가 남긴 피드백 </div>
            </div>
            <div className="feedback-items">
              <div className="feedback-item">
                <div className="div9">&quot;김치가 너무 짰어요&quot; </div>
                <div className="count-badge">
                  <div className="_3">3건 </div>
                </div>
              </div>
              <div className="feedback-item-2">
                <div className="div9">&quot;밥이 차가워요&quot; </div>
                <div className="count-badge">
                  <div className="_2">2건 </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="tab-bar">
        <div className="home-tab">
          <img className="home" src="home0.svg" />
          <div className="div10">홈 </div>
        </div>
        <div className="calendar-tab">
          <img className="calendar" src="calendar0.svg" />
          <div className="div11">급식표 </div>
        </div>
        <div className="settings-tab">
          <img className="settings" src="settings0.svg" />
          <div className="div10">설정 </div>
        </div>
        <div className="profile-tab">
          <img className="user" src="user0.svg" />
          <div className="div10">내정보 </div>
        </div>
      </div>
    </div>
  );
};
