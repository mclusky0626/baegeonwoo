import "./Frame.css";
import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import black from "../imgs/black.png";
import edit from "../imgs/edit.svg";
import knife from "../imgs/knifeandafork.svg";
import Vector from "../imgs/Vector.png";
import ok from "../imgs/ok.png";
import no from "../imgs/no.png";
import warn from "../imgs/warn.png";
import lock from "../imgs/lock.png";
import lang from "../imgs/lang.png";
import bell from "../imgs/bell.png";
import { signOut } from "firebase/auth";


import check from "../imgs/checkmate.svg";

export const Frame = ({ onNavigate, className = "" }) => {
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [schoolInput, setSchoolInput] = useState("");
  const [gradeInput, setGradeInput] = useState("");
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("로그아웃 되었습니다.");
      window.location.reload(); // 혹은 onNavigate("home") 등으로 이동 처리
    } catch (error) {
      console.error("로그아웃 실패:", error);
      alert("로그아웃 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) return setLoading(false);
      const uid = auth.currentUser.uid;
      const ref = doc(db, "users", uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setUserData(data);
        setNameInput(data.name || "");
        setSchoolInput(data.school || "");
        setGradeInput(data.grade || "");
      }

      setLoading(false);
    };
    fetchUserData();
  }, []);

  const handleSave = async () => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const ref = doc(db, "users", uid);
    await updateDoc(ref, {
      name: nameInput,
      school: schoolInput,
      grade: gradeInput,
    });
    setUserData({
      ...userData,
      name: nameInput,
      school: schoolInput,
      grade: gradeInput,
    });
    setEditMode(false);
  };
  const handleImageChange = async (e) => {
  const file = e.target.files[0];
  if (!file || !auth.currentUser) return;

  const uid = auth.currentUser.uid;
  const storageRef = ref(storage, `profileImages/${uid}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  await updateDoc(doc(db, "users", uid), {
    photoURL: url,
  });

  setProfileImage(url);
};
  
  if (loading) return <div className="frame">로딩 중...</div>;
  if (!userData) {
    return (
      <div className="frame" style={{ padding: "40px", textAlign: "center" }}>
        <h2>로그인이 필요합니다</h2>
        <p style={{ marginBottom: "20px", color: "#555" }}>
          이 기능을 사용하려면 먼저 로그인하세요.
        </p>
        <button
          onClick={() => onNavigate("home")}
          style={{
            padding: "10px 16px",
            backgroundColor: "#007aff",
            color: "white",
            border: "none",
            borderRadius: "8px",
            marginBottom: "10px",
            fontSize: "15px",
            cursor: "pointer",
          }}
        >
          홈으로 돌아가기
        </button>
        <br />
        <button
          onClick={() => window.location.reload()} // 로그인 모달을 사용하는 구조일 경우 조정 필요
          style={{
            padding: "10px 16px",
            backgroundColor: "#f1f1f1",
            color: "#222",
            border: "1px solid #ccc",
            borderRadius: "8px",
            fontSize: "15px",
            cursor: "pointer",
          }}
        >
          다시 로그인 시도
        </button>
      </div>
    );
  }


  const name = userData.name || "이름없음";
  const school = userData.school || "학교없음";
  const grade = userData.grade || "학년없음";
  const religion = (userData.religion && userData.religion.join(", ")) || "없음";
  const allergy = (userData.allergy && userData.allergy.join(", ")) || "없음";
  const medicine = userData.medicine || "없음";

  return (
    <div className={"frame " + className}>
      <div className="body">
        <div className="div">
          <div className="main">
            <div className="section">
              <img className="img" src={black} alt="프로필" />
              <div className="div2">
                <div className="div3">
                  {!editMode ? (
                    <>
                      <div className="div4">{name}</div>
                      <div className="button" onClick={() => setEditMode(true)} title="이름 수정">
                        <div className="i">
                          <div className="svg">
                            <img className="frame2" src={edit} alt="edit" style={{ width: "200%", height: "200%" }} />
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <input className="div4" value={nameInput} onChange={e => setNameInput(e.target.value)} style={{ fontSize: 16, width: 80 }} />
                      <button className="button" style={{ background: "#4d8cfb", color: "#fff" }} onClick={handleSave}>저장</button>
                    </>
                  )}
                </div>
                <div className="div5">
                  {!editMode ? (
                    <>
                      <div className="div6">{school}</div>
                      <div className="button2" onClick={() => setEditMode(true)}>
                        <div className="i2">
                          <div className="svg2"><img className="frame3" src={edit} alt="edit" style={{ width: "170%", height: "170%" }} /></div>
                        </div>
                      </div>
                      <div className="div7">| </div>
                      <div className="_3">{grade}</div>
                      <div className="button3" onClick={() => setEditMode(true)}>
                        <div className="i2">
                          <div className="svg2"><img className="frame4" src={edit} alt="edit" style={{ width: "170%", height: "170%" }} /></div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <input className="div6" value={schoolInput} onChange={e => setSchoolInput(e.target.value)} style={{ fontSize: 12, width: 100 }} />
                      <div className="div7">| </div>
                      <input className="_3" value={gradeInput} onChange={e => setGradeInput(e.target.value)} style={{ fontSize: 12, width: 40 }} />
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 급식 필터 기준 */}
            <div className="section2">
              <div className="div8">
                <div className="frame5"><img className="frame6" src={knife} alt="" /></div>
                <div className="div9">급식 필터 기준 </div>
                <div className="button4" onClick={() => onNavigate("settings")}>
                  <div className="i3">
                    <div className="svg3"><img className="frame7" src={knife} alt="" /></div>
                  </div>
                  <div className="div10">편집 </div>
                </div>
              </div>
              <div className="div11">
                <div className="div12"><div className="div13">종교 : </div><div className="div14">{religion}</div></div>
                <div className="div15"><div className="div16">알러지 : </div><div className="div17">{allergy}</div></div>
                <div className="div18"><div className="div19">약 복용 : </div><div className="div20">{medicine}</div></div>
              </div>
            </div>

            {/* 급식 통계 */}
            <div className="section3">
              <div className="div8">
                <div className="frame8"><img className="frame9" src={Vector} alt="" /></div>
                <div className="div21">나의 급식 통계 </div>
              </div>
              <div className="div22">
                <div className="_70">70%</div>
                <div className="frame10"><img className="frame11" src={ok} alt="" /></div>
                <div className="_10">10%</div>
                <div className="frame12"><img className="frame13" src={warn} alt="" /></div>
                <div className="_20">20%</div>
                <div className="frame14"><img className="frame15" src={no} alt="" /></div>
              </div>
              <div className="button5"><div className="div23">자세히 보기 </div></div>
            </div>

            {/* 언어 설정 */}
            <div className="section4">
              <div className="div24">
                <div className="frame16"><img className="frame17" src={lang} alt="" /></div>
                <div className="div25">언어 설정 </div>
                <div className="span"><div className="div26">한국어 </div></div>
              </div>
              <div className="button6"><div className="div27">변경 </div></div>
            </div>

            {/* 알림 설정 */}
            <div className="section5">
              <div className="div8">
                <div className="frame5"><img className="frame18" src={bell} alt="" /></div>
                <div className="div28">알림 설정 </div>
                <div className="span2"><div className="on">ON </div></div>
              </div>
              <div className="div29">
                <div className="label"><div className="div30">급식 변경 시 알림 받기 </div><div className="input"><div className="svg4"><img className="frame19" src={check} alt="" /></div></div></div>
                <div className="label2"><div className="div31">피드백 요청 알림 </div><div className="input"><div className="svg4"><img className="frame20" src={check} alt="" /></div></div></div>
              </div>
            </div>

            {/* 계정 설정 */}
            <div className="section6">
              <div className="div8"><div className="frame16"><img className="frame21" src={lock} alt="" /></div><div className="div25">계정 설정 </div></div>
              <div className="div32">
                <div className="button7" onClick={handleLogout}><div className="div33">로그아웃 </div></div>
                <div className="button8"><div className="div34">개인정보 처리방침 </div></div>
              </div>
            </div>
          </div>

          {/* 푸터 및 탭 바 */}
          <div className="footer"><div className="_2024-school-meal-service">© 2024 School Meal Service </div></div>
          <div className="header"><div className="div35"><div className="div36">내 정보 </div></div><div className="button9"><div className="i4"><div className="svg5"><img className="frame22" src="frame22.svg" alt="" /></div></div></div></div>
          <div className="tab-bar">
            <div className="home-tab" onClick={() => onNavigate("home")}><img className="home" src="home0.svg" alt="" /><div className="div15">홈</div></div>
            <div className="calendar-tab" onClick={() => onNavigate("week")}><img className="calendar" src="calendar0.svg" alt="" /><div className="div15">급식표</div></div>
            <div className="settings-tab" onClick={() => onNavigate("settings")}><img className="settings" src="settings0.svg" alt="" /><div className="div16">설정</div></div>
            <div className="profile-tab" onClick={() => onNavigate("frame")}><img className="user" src="user0.svg" alt="" /><div className="div15">내정보</div></div>
          </div>
          <div className="divider"></div>
        </div>
      </div>
    </div>
  );
};
