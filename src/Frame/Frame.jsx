import "./Frame.css";

export const Frame = ({ className, ...props }) => {
  return (
    <div className={"frame " + className}>
      <div className="body">
        <div className="div">
          <div className="main">
            <div className="section">
              <img className="img" src="img0.png" />
              <div className="div2">
                <div className="div3">
                  <div className="div4">김건우 </div>
                  <div className="button">
                    <div className="i">
                      <div className="svg">
                        <img className="frame2" src="frame0.svg" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="div5">
                  <div className="div6">인천 ○○중학교 </div>
                  <div className="button2">
                    <div className="i2">
                      <div className="svg2">
                        <img className="frame3" src="frame1.svg" />
                      </div>
                    </div>
                  </div>
                  <div className="div7">| </div>
                  <div className="_3">중3 </div>
                  <div className="button3">
                    <div className="i2">
                      <div className="svg2">
                        <img className="frame4" src="frame2.svg" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="section2">
              <div className="div8">
                <div className="frame5">
                  <img className="frame6" src="frame4.svg" />
                </div>
                <div className="div9">급식 필터 기준 </div>
                <div className="button4">
                  <div className="i3">
                    <div className="svg3">
                      <img className="frame7" src="frame5.svg" />
                    </div>
                  </div>
                  <div className="div10">편집 </div>
                </div>
              </div>
              <div className="div11">
                <div className="div12">
                  <div className="div13">종교 : </div>
                  <div className="div14">이슬람 </div>
                </div>
                <div className="div15">
                  <div className="div16">알러지 : </div>
                  <div className="div17">우유, 견과류 </div>
                </div>
                <div className="div18">
                  <div className="div19">약 복용 : </div>
                  <div className="div20">감기약 </div>
                </div>
              </div>
            </div>
            <div className="section3">
              <div className="div8">
                <div className="frame8">
                  <img className="frame9" src="frame7.svg" />
                </div>
                <div className="div21">나의 급식 통계 </div>
              </div>
              <div className="div22">
                <div className="_70">70% </div>
                <div className="frame10">
                  <img className="frame11" src="frame9.svg" />
                </div>
                <div className="_10">10% </div>
                <div className="frame12">
                  <img className="frame13" src="frame11.svg" />
                </div>
                <div className="_20">20% </div>
                <div className="frame14">
                  <img className="frame15" src="frame13.svg" />
                </div>
              </div>
              <div className="button5">
                <div className="div23">자세히 보기 </div>
              </div>
            </div>
            <div className="section4">
              <div className="div24">
                <div className="frame16">
                  <img className="frame17" src="frame15.svg" />
                </div>
                <div className="div25">언어 설정 </div>
                <div className="span">
                  <div className="div26">한국어 </div>
                </div>
              </div>
              <div className="button6">
                <div className="div27">변경 </div>
              </div>
            </div>
            <div className="section5">
              <div className="div8">
                <div className="frame5">
                  <img className="frame18" src="frame17.svg" />
                </div>
                <div className="div28">알림 설정 </div>
                <div className="span2">
                  <div className="on">ON </div>
                </div>
              </div>
              <div className="div29">
                <div className="label">
                  <div className="div30">급식 변경 시 알림 받기 </div>
                  <div className="input">
                    <div className="svg4">
                      <img className="frame19" src="frame18.svg" />
                    </div>
                  </div>
                </div>
                <div className="label2">
                  <div className="div31">피드백 요청 알림 </div>
                  <div className="input">
                    <div className="svg4">
                      <img className="frame20" src="frame19.svg" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="section6">
              <div className="div8">
                <div className="frame16">
                  <img className="frame21" src="frame21.svg" />
                </div>
                <div className="div25">계정 설정 </div>
              </div>
              <div className="div32">
                <div className="button7">
                  <div className="div33">로그아웃 </div>
                </div>
                <div className="button8">
                  <div className="div34">개인정보 처리방침 </div>
                </div>
              </div>
            </div>
          </div>
          <div className="footer">
            <div className="_2024-school-meal-service">
              © 2024 School Meal Service{" "}
            </div>
          </div>
          <div className="header">
            <div className="div35">
              <div className="div36">내 정보 </div>
            </div>
            <div className="button9">
              <div className="i4">
                <div className="svg5">
                  <img className="frame22" src="frame22.svg" />
                </div>
              </div>
            </div>
          </div>
          <div className="tab-bar">
            <div className="home-tab">
              <img className="home" src="home0.svg" />
              <div className="div37">홈 </div>
            </div>
            <div className="calendar-tab">
              <img className="calendar" src="calendar0.svg" />
              <div className="div37">급식표 </div>
            </div>
            <div className="settings-tab">
              <img className="settings" src="settings0.svg" />
              <div className="div38">설정 </div>
            </div>
            <div className="profile-tab">
              <img className="user" src="user0.svg" />
              <div className="div39">내정보 </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
