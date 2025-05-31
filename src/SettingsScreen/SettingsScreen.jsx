import "./SettingsScreen.css";

export const SettingsScreen = ({ className, ...props }) => {
  return (
    <div className={"settings-screen " + className}>
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
        <div className="div">급식 맞춤 설정 </div>
        <div className="frame"></div>
      </div>
      <div className="scroll-container">
        <div className="content">
          <div className="school-section">
            <div className="div2">학교 선택 </div>
            <div className="school-input">
              <div className="div3">학교를 입력하세요 </div>
              <img className="search" src="search0.svg" />
            </div>
            <div className="_2">예: 인천 ○○중학교 / 2학년 </div>
          </div>
          <div className="religion-section">
            <div className="religion-header">
              <div className="div4">종교 선택 </div>
              <div className="div5">(중복 선택 가능) </div>
            </div>
            <div className="religion-options">
              <div className="islam">
                <div className="div6">이슬람 </div>
              </div>
              <div className="hindu">
                <div className="div7">힌두교 </div>
              </div>
              <div className="buddhism">
                <div className="div8">불교 </div>
              </div>
              <div className="christianity">
                <div className="div9">기독교 </div>
              </div>
              <div className="none">
                <div className="div10">없음 </div>
              </div>
            </div>
            <div className="div11">종교에 따른 식사 조정 </div>
          </div>
          <div className="diet-section">
            <div className="div2">식생활 유형 </div>
            <div className="diet-options">
              <div className="normal">
                <div className="div6">일반식 </div>
              </div>
              <div className="vegan">
                <div className="div10">비건 </div>
              </div>
              <div className="lacto-ovo">
                <div className="div10">락토오보 </div>
              </div>
              <div className="pesco">
                <div className="div10">페스코 </div>
              </div>
              <div className="other">
                <div className="div10">기타 </div>
              </div>
            </div>
            <div className="div11">
              비건은 육류, 유제품 제외. 락토오보는 유제품 포함, 페스코는 생선류
              포함{" "}
            </div>
          </div>
          <div className="allergy-section">
            <div className="div2">알레르기 체크 </div>
            <div className="allergy-input">
              <div className="div3">알레르기 검색 및 추가 </div>
              <img className="plus" src="plus0.svg" />
            </div>
            <div className="selected-allergies">
              <div className="milk-allergy">
                <div className="div12">우유 </div>
                <img className="x" src="x0.svg" />
              </div>
              <div className="egg-allergy">
                <div className="div13">달걀 </div>
                <img className="x2" src="x1.svg" />
              </div>
              <div className="wheat-allergy">
                <div className="div14">밀 </div>
                <img className="x3" src="x2.svg" />
              </div>
            </div>
            <div className="div11">
              알레르기 유발 식품을 자동으로 필터링합니다{" "}
            </div>
          </div>
          <div className="medication-section">
            <div className="div2">복용 중인 약 </div>
            <div className="medication-options">
              <div className="cold-medicine">
                <div className="div10">감기약 </div>
              </div>
              <div className="pain-relief">
                <div className="div10">생리통약 </div>
              </div>
              <div className="antibiotics">
                <div className="div10">항생제 </div>
              </div>
              <div className="no-medicine">
                <div className="div9">없음 </div>
              </div>
            </div>
            <div className="div11">음식-약 간섭 피드백 제공 </div>
          </div>
          <div className="language-section">
            <div className="div2">알림 받을 언어 </div>
            <div className="language-options">
              <div className="korean">
                <div className="div6">한국어 </div>
              </div>
              <div className="english">
                <div className="english2">English </div>
              </div>
              <div className="chinese">
                <div className="div10">中文 </div>
              </div>
              <div className="vietnamese">
                <div className="ti-ng-vi-t">Tiếng Việt </div>
              </div>
            </div>
            <div className="div11">다문화 접근성 향상 </div>
          </div>
        </div>
        <div className="tab-bar">
          <div className="home-tab">
            <img className="home" src="home0.svg" />
            <div className="div15">홈 </div>
          </div>
          <div className="calendar-tab">
            <img className="calendar" src="calendar0.svg" />
            <div className="div15">급식표 </div>
          </div>
          <div className="settings-tab">
            <img className="settings" src="settings0.svg" />
            <div className="div16">설정 </div>
          </div>
          <div className="profile-tab">
            <img className="user" src="user0.svg" />
            <div className="div15">내정보 </div>
          </div>
        </div>
        <div className="bottom-section">
          <div className="save-button">
            <div className="div17">저장하기 </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SettingsScreen;