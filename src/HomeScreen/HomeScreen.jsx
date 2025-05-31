import "./HomeScreen.css";

export const HomeScreen = ({onNavigate, className, ...props }) => {
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
            <div className="div2">오늘의 급식 </div>
          </div>
          <div className="meal-items">
            <div className="safe-item">
              <div className="status-icon">
                <img className="check" src="check0.svg" />
              </div>
              <div className="item-info">
                <div className="div3">김치볶음밥 </div>
                <div className="div4">먹을 수 있어요 </div>
              </div>
              <img className="rice-bowl" src="rice-bowl0.svg" />
            </div>
            <div className="warning-item">  
              <div className="status-icon2">
                <img className="alert-triangle" src="alert-triangle0.svg" />
              </div>
              <div className="item-info">
                <div className="div3">우유 </div>
                <div className="div5">알레르기 주의: 유당불내증 </div>
              </div>
              <img className="milk" src="milk0.svg" />
            </div>
            <div className="restricted-item">
              <div className="status-icon3">
                <img className="x" src="x0.svg" />
              </div>
              <div className="item-info">
                <div className="div3">미트볼 </div>
                <div className="div6">돼지고기 - 이슬람 제한 </div>
              </div>
              <img className="beef" src="beef0.svg" />
            </div>
            <div className="safe-item-2">
              <div className="status-icon">
                <img className="check2" src="check1.svg" />
              </div>
              <div className="item-info">
                <div className="div3">계란찜 </div>
                <div className="div4">먹을 수 있어요 </div>
              </div>
              <img className="egg" src="egg0.svg" />
            </div>
            <div className="safe-item-3">
              <div className="status-icon">
                <img className="check3" src="check2.svg" />
              </div>
              <div className="item-info">
                <div className="div3">깍두기 </div>
                <div className="div4">먹을 수 있어요 </div>
              </div>
              <img className="carrot" src="carrot0.svg" />
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
        </div>
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
