import "./Frame.css";
import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";

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
import check from "../imgs/checkmate.svg";

export const Frame = ({ onNavigate, className = "" }) => {
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [schoolInput, setSchoolInput] = useState("");
  const [gradeInput, setGradeInput] = useState("");
  const [loading, setLoading] = useState(true);

  // 유저 데이터 로딩
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
        setSchoolInput(data.schoolName || "학교없음");
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
      schoolName: schoolInput,
      grade: gradeInput,
    });
    setUserData({ ...userData, name: nameInput, schoolName: schoolInput, grade: gradeInput });
    setEditMode(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("로그아웃 되었습니다.");
      window.location.reload();
    } catch (error) {
      console.error("로그아웃 실패:", error);
      alert("로그아웃 중 오류가 발생했습니다.");
    }
  };

  if (loading) return <div className="frame">로딩 중...</div>;
  if (!userData) {
    return (
      <div className="frame login-required">
        <h2>로그인이 필요합니다</h2>
        <p>이 기능을 사용하려면 먼저 로그인하세요.</p>
        <div className="btn-group">
          <button onClick={() => onNavigate("home")}>홈으로 돌아가기</button>
          <button onClick={() => window.location.reload()}>다시 로그인</button>
        </div>
      </div>
    );
  }

  // DB 구조 기준 변수명
  const name = userData.name || "이름없음";
  const school = userData.schoolName || "학교없음";
  const grade = userData.grade || "학년없음";
  const religion = (userData.religion && userData.religion.length > 0)
    ? userData.religion.join(", ")
    : "없음";
  const allergy = (userData.allergies && userData.allergies.length > 0)
    ? userData.allergies.join(", ")
    : "없음";
  const dietType = userData.dietType || "없음";

  return (
    <div className={`frame ${className}`}>
      <header className="header">
        <div className="title">내 정보</div>
        <button className="settings-btn" onClick={() => onNavigate("settings")}>
          <img src="settings0.svg" alt="설정" />
        </button>
      </header>

      <div className="body">
        {/* 프로필 카드 */}
        <section className="card profile-card">
          <div className="profile-row">
            <img className="avatar" src={black} alt="프로필" />
            <div className="info">
              <div className="row name-row">
                {!editMode ? (
                  <>
                    <h3 className="name">{name}</h3>
                    <button className="edit-btn" onClick={() => setEditMode(true)}>
                      <img src={edit} alt="이름 수정" />
                    </button>
                  </>
                ) : (
                  <>
                    <input value={nameInput} onChange={(e) => setNameInput(e.target.value)} />
                    <button className="save-btn" onClick={handleSave}>
                      저장
                    </button>
                  </>
                )}
              </div>
              <div className="row school-row">
                <span className="school">{school}</span>
                <button className="edit-btn" onClick={() => setEditMode(true)}>
                  <img src={edit} alt="학교 수정" />
                </button>
                <span className="divider">|</span>
                <span className="grade">{grade}</span>
                <button className="edit-btn" onClick={() => setEditMode(true)}>
                  <img src={edit} alt="학년 수정" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 급식 필터 기준 */}
        <section className="card filter-card">
          <div className="card-header">
            <div className="row">
              <img src={knife} alt="" />
              <h4>급식 필터 기준</h4>
            </div>
            <button className="edit-btn" onClick={() => onNavigate("settings")}>
              편집
            </button>
          </div>
          <ul className="filter-list">
            <li>종교: {religion}</li>
            <li>식생활유형: {dietType}</li>
            <li>알러지: {allergy}</li>
          </ul>
        </section>

        {/* 통계 카드 */}
        <section className="card stats-card">
          <div className="card-header">
            <img src={Vector} alt="" />
            <h4>나의 급식 통계</h4>
          </div>
          <div className="stats-row">
            <div><img src={ok} alt="좋음" /> 70%</div>
            <div><img src={warn} alt="주의" /> 10%</div>
            <div><img src={no} alt="제외" /> 20%</div>
          </div>
          <button className="detail-btn">자세히 보기</button>
        </section>

        {/* 언어 설정 */}
        <section className="card simple-card">
          <div className="row">
            <img src={lang} alt="언어" />
            <span>언어 설정</span>
            <span className="value">한국어</span>
            <button className="edit-btn">변경</button>
          </div>
        </section>

        {/* 알림 설정 */}
        <section className="card simple-card">
          <div className="row">
            <img src={bell} alt="알림" />
            <span>알림 설정</span>
            <span className="value on">ON</span>
          </div>
          <ul className="notif-list">
            <li>
              <label>
                <input type="checkbox" defaultChecked /> 급식 변경 시 알림 받기
              </label>
            </li>
            <li>
              <label>
                <input type="checkbox" defaultChecked /> 피드백 요청 알림
              </label>
            </li>
          </ul>
        </section>

        {/* 계정 설정 */}
        <section className="card simple-card">
          <div className="row">
            <img src={lock} alt="계정" />
            <span>계정 설정</span>
          </div>
          <div className="btn-group">
            <button className="logout-btn" onClick={handleLogout}>로그아웃</button>
            <button className="privacy-btn">개인정보 처리방침</button>
          </div>
        </section>
      </div>

      <nav className="tab-bar">
        <button onClick={() => onNavigate("home")}><img src="home0.svg" /><span>홈</span></button>
        <button onClick={() => onNavigate("week")}><img src="calendar0.svg" /><span>급식표</span></button>
        <button onClick={() => onNavigate("settings")}><img src="settings1.svg" /><span>설정</span></button>
        <button onClick={() => onNavigate("frame")}><img src="user0.svg" /><span>내정보</span></button>
      </nav>
    </div>
  );
};

export default Frame;
// Note: The above code assumes that the necessary Firebase setup and CSS styles are already in place.
// The code is structured to provide a user profile interface with options to edit personal information, view dietary preferences, and manage account settings.         
// The navigation bar at the bottom allows users to switch between different sections of the app.
// The component uses React hooks for state management and side effects, and Firebase Firestore for data storage and retrieval. 
// The design is responsive and user-friendly, with clear buttons for editing and saving changes.
// I dont like eating raw fish but I love sushi, so I eat it anyway.
// The code is modular and can be easily extended with additional features or styles as needed.
// My favorite game is League of Legends, and I play it every day.
// I also enjoy playing other games like Valorant and Minecraft, but League of Legends remains my top choice.
// I often play with friends, and we have a lot of fun strategizing and competing together.
// I also like to watch esports tournaments and follow my favorite teams and players.
//My favorite progamer is Faker, and I admire his skills and dedication to the game.
// I also enjoy watching other games like Dota 2 and CS:GO, but League of Legends is my main focus.