import "./FeedbackScreen.css";

export const FeedbackScreen = ({ className, ...props }) => {
  return (
    <div className={"feedback-screen " + className}>
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
        <div className="div">급식 피드백 </div>
        <div className="frame"></div>
      </div>
      <div className="content">
        <div className="meal-summary">
          <div className="meal-header">
            <img className="utensils" src="utensils0.svg" />
            <div className="div2">오늘 급식 </div>
          </div>
          <div className="div3">김치볶음밥 / 계란찜 / 깍두기 / 우유 </div>
        </div>
        <div className="feedback-question">
          <div className="question-header">
            <img className="message-circle" src="message-circle0.svg" />
            <div className="div4">오늘 급식 어땠나요? </div>
          </div>
          <div className="rating-buttons">
            <div className="thumbs-up">
              <div className="thumb-icon">
                <img className="thumbs-up2" src="thumbs-up1.svg" />
              </div>
              <div className="div5">좋았어요 </div>
            </div>
            <div className="thumbs-down">
              <div className="thumb-icon2">
                <img className="thumbs-down2" src="thumbs-down1.svg" />
              </div>
              <div className="div6">별로였어요 </div>
            </div>
          </div>
        </div>
        <div className="comment-section">
          <div className="comment-header">
            <img className="edit-3" src="edit-30.svg" />
            <div className="div2">건의사항 </div>
            <div className="div7">(선택사항) </div>
          </div>
          <div className="text-input">
            <div className="div8">건의사항이 있다면 자유롭게 적어주세요 </div>
            <div className="div9">
              예: 너무 짰어요, 맛있었어요, 양이 적어요 등{" "}
            </div>
          </div>
          <div className="character-count">
            <div className="_0-200">0 / 200자 </div>
          </div>
        </div>
        <div className="submit-button">
          <img className="send" src="send0.svg" />
          <div className="div10">제출하기 </div>
        </div>
        <div className="info-text">
          <img className="info" src="info0.svg" />
          <div className="div11">
            피드백은 익명으로 처리되며, 급식 개선에 활용됩니다.{" "}
          </div>
        </div>
      </div>
      <div className="tab-bar">
        <div className="home-tab">
          <img className="home" src="home0.svg" />
          <div className="div12">홈 </div>
        </div>
        <div className="calendar-tab">
          <img className="calendar" src="calendar0.svg" />
          <div className="div12">급식표 </div>
        </div>
        <div className="settings-tab">
          <img className="settings" src="settings0.svg" />
          <div className="div12">설정 </div>
        </div>
        <div className="profile-tab">
          <img className="user" src="user0.svg" />
          <div className="div12">내정보 </div>
        </div>
      </div>
    </div>
  );
};
export default FeedbackScreen;