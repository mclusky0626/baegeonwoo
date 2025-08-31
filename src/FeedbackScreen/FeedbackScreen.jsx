import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, collection, addDoc, Timestamp, getDocs } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import "./FeedbackScreen.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

// Nutritionist view (No changes here)
const NutritionistView = () => {
  const { t, i18n } = useTranslation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [feedbackData, setFeedbackData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', comments: [] });
  const [weeklyReport, setWeeklyReport] = useState(null);
  const [isWeeklyReportLoading, setIsWeeklyReportLoading] = useState(true);

  const openModal = (title, comments) => {
    setModalContent({ title, comments });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const fetchWeeklyReport = async () => {
      setIsWeeklyReportLoading(true);
      const allRatings = {};
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const menusRef = collection(db, `feedback/${dateStr}/menus`);
        const menusSnapshot = await getDocs(menusRef);
        for (const menuDoc of menusSnapshot.docs) {
          const menuName = menuDoc.id;
          const reviewsRef = collection(db, `feedback/${dateStr}/menus/${menuName}/reviews`);
          const reviewsSnapshot = await getDocs(reviewsRef);
          reviewsSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.rating) {
              if (!allRatings[menuName]) {
                allRatings[menuName] = [];
              }
              allRatings[menuName].push(data.rating);
            }
          });
        }
      }
      const avgRatings = Object.entries(allRatings).map(([menuName, ratings]) => ({
        menuName,
        avg: ratings.reduce((a, b) => a + b, 0) / ratings.length,
        count: ratings.length
      }));
      if (avgRatings.length > 0) {
        avgRatings.sort((a, b) => b.avg - a.avg);
        const best = avgRatings[0];
        const worst = avgRatings[avgRatings.length - 1];
        setWeeklyReport({ best, worst });
      }
      setIsWeeklyReportLoading(false);
    };
    fetchWeeklyReport();
  }, []);

  useEffect(() => {
    const fetchFeedback = async () => {
      setLoading(true);
      const dateStr = selectedDate.toISOString().split('T')[0];
      const menusRef = collection(db, `feedback/${dateStr}/menus`);
      const menusSnapshot = await getDocs(menusRef);
      const aggregatedData = {};
      for (const menuDoc of menusSnapshot.docs) {
        const menuName = menuDoc.id;
        const reviewsRef = collection(db, `feedback/${dateStr}/menus/${menuName}/reviews`);
        const reviewsSnapshot = await getDocs(reviewsRef);
        const reviews = [];
        reviewsSnapshot.forEach(doc => {
          reviews.push(doc.data());
        });
        if (reviews.length > 0) {
          const totalRating = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
          const avgRating = totalRating / reviews.filter(r => r.rating).length;
          const tagCounts = reviews.flatMap(r => r.tags || []).reduce((acc, tag) => {
            acc[tag] = (acc[tag] || 0) + 1;
            return acc;
          }, {});
          const comments = reviews.map(r => r.comment).filter(Boolean);
          aggregatedData[menuName] = {
            avgRating: isNaN(avgRating) ? 0 : avgRating.toFixed(1),
            tagCounts,
            comments,
            reviewCount: reviews.length
          };
        }
      }
      setFeedbackData(aggregatedData);
      setLoading(false);
    };
    fetchFeedback();
  }, [selectedDate]);

  return (
    <div className="nutritionist-view">
      <h2>{t("nutritionist_dashboard_title")}</h2>
      <div className="weekly-report-section">
        <h3>{t('weekly_report')}</h3>
        {isWeeklyReportLoading ? <p>{t("loading")}</p> : weeklyReport ? (
          <div className="weekly-report-content">
            <p><strong>{t('best_menu')}:</strong> {weeklyReport.best.menuName} ({weeklyReport.best.avg.toFixed(1)} ★)</p>
            <p><strong>{t('worst_menu')}:</strong> {weeklyReport.worst.menuName} ({weeklyReport.worst.avg.toFixed(1)} ★)</p>
          </div>
        ) : <p>{t('no_weekly_data')}</p>}
      </div>
      <Calendar onChange={setSelectedDate} value={selectedDate} locale={i18n.language} />
      <div className="feedback-display">
        {loading ? <p>{t("loading")}</p> : feedbackData && Object.keys(feedbackData).length > 0 ? (
          Object.entries(feedbackData).map(([menuName, data]) => (
            <div key={menuName} className="feedback-summary-item">
              <h4>{menuName} ({data.reviewCount} {t('reviews')})</h4>
              <p>{t('average_rating')}: {data.avgRating} ★</p>
              <div><strong>{t('tag_summary')}:</strong><ul>{Object.entries(data.tagCounts).map(([tag, count]) => <li key={tag}>{t(tag)}: {count}</li>)}</ul></div>
              <div onClick={() => openModal(menuName, data.comments)} style={{cursor: 'pointer'}}><strong>{t('comments')} ({data.comments.length})</strong></div>
            </div>
          ))
        ) : <p>{t("no_feedback_data")}</p>}
      </div>
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}><div className="modal-content" onClick={e => e.stopPropagation()}><h3>{modalContent.title} - {t('comments')}</h3><ul className="comment-list">{modalContent.comments.length > 0 ? modalContent.comments.map((comment, i) => <li key={i}>{comment}</li>) : <li>{t('no_comments')}</li>}</ul><button onClick={closeModal}>{t('close')}</button></div></div>
      )}
    </div>
  );
};

const StarRating = ({ rating, onRatingChange }) => (
  <div className="star-rating">{[1, 2, 3, 4, 5].map(star => <span key={star} className={star <= rating ? "star-filled" : "star-empty"} onClick={() => onRatingChange(star)} style={{ cursor: 'pointer', fontSize: '24px' }}>★</span>)}</div>
);

const StudentView = ({ userData }) => {
  const { t, i18n } = useTranslation();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({});
  const [submitStatus, setSubmitStatus] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleSubmit = async () => {
    setSubmitStatus("submitting");
    const dateStr = selectedDate.toISOString().split('T')[0];
    try {
      for (const mealName in feedback) {
        if (Object.hasOwnProperty.call(feedback, mealName)) {
          const mealFeedback = feedback[mealName];
          if (mealFeedback.rating || mealFeedback.comment || mealFeedback.tags?.length > 0) {
            const reviewsColRef = collection(db, `feedback/${dateStr}/menus/${mealName}/reviews`);
            await addDoc(reviewsColRef, { userId: auth.currentUser.uid, rating: mealFeedback.rating || null, comment: mealFeedback.comment || "", tags: mealFeedback.tags || [], createdAt: Timestamp.now() });
          }
        }
      }
      setSubmitStatus("success");
      setFeedback({});
      setTimeout(() => setSubmitStatus(""), 3000);
    } catch (error) {
      console.error("Error submitting feedback: ", error);
      setSubmitStatus("error");
      setTimeout(() => setSubmitStatus(""), 3000);
    }
  };

  const handleFeedbackChange = (mealName, field, value) => setFeedback(prev => ({ ...prev, [mealName]: { ...prev[mealName], [field]: value } }));

  const getDateYMD = date => date.getFullYear() + String(date.getMonth() + 1).padStart(2, "0") + String(date.getDate()).padStart(2, "0");

  useEffect(() => {
    const fetchMeals = async () => {
      setLoading(true);
      setMeals([]);
      setFeedback({});
      if (!userData?.eduCode || !userData?.schoolCode) {
        setLoading(false);
        return;
      }
      const ymd = getDateYMD(selectedDate);
      const url = `https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=a27ba9b1a9144411a928c9358597817e&Type=json&pIndex=1&pSize=10&ATPT_OFCDC_SC_CODE=${userData.eduCode}&SD_SCHUL_CODE=${userData.schoolCode}&MLSV_YMD=${ymd}`;
      try {
        const res = await fetch(url);
        const data = await res.json();
        const rows = data?.mealServiceDietInfo?.[1]?.row;
        const dishList = rows?.[0]?.DDISH_NM.split("<br/>").map(txt => ({ name: txt.replace(/\s*\([^)]+\)/, "").trim() })) || [];
        setMeals(dishList);
      } catch (error) {
        console.error("Error fetching meal data:", error);
        setMeals([]);
      }
      setLoading(false);
    };
    fetchMeals();
  }, [userData, selectedDate]);

  return (
    <div className="student-view-content">
      <div className="date-selector">
        <DatePicker selected={selectedDate} onChange={date => setSelectedDate(date)} dateFormat={i18n.language === "en" ? "yyyy-MM-dd" : "yyyy년 MM월 dd일"} customInput={<button className="date-select-btn">날짜 변경</button>} locale={i18n.language} popperPlacement="bottom-end" />
        <h3>{selectedDate.toLocaleDateString(i18n.language, { year: 'numeric', month: 'long', day: 'numeric' })}</h3>
      </div>
      {loading ? <p>{t("loading")}</p> : meals.length > 0 ? (
        <>
          <div className="meal-feedback-list">
            {meals.map(meal => (
              <div key={meal.name} className="meal-feedback-item">
                <h4>{meal.name}</h4>
                <StarRating rating={feedback[meal.name]?.rating || 0} onRatingChange={rating => handleFeedbackChange(meal.name, 'rating', rating)} />
                <textarea className="comment-textarea" placeholder={t("comment_placeholder")} value={feedback[meal.name]?.comment || ''} onChange={e => handleFeedbackChange(meal.name, 'comment', e.target.value)} maxLength={200} />
                <div className="tags-container">
                  {['너무 짜요', '너무 달아요', '맛있어요'].map(tag => (
                    <button key={tag} className={`tag-button ${feedback[meal.name]?.tags?.includes(tag) ? 'selected' : ''}`} onClick={() => {
                      const currentTags = feedback[meal.name]?.tags || [];
                      const newTags = currentTags.includes(tag) ? currentTags.filter(t => t !== tag) : [...currentTags, tag];
                      handleFeedbackChange(meal.name, 'tags', newTags);
                    }}>{t(tag)}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="submit-button" onClick={handleSubmit}><div className="div10">{t('submit_feedback')}</div></div>
          {submitStatus === "submitting" && <p>{t("submitting")}</p>}
          {submitStatus === "success" && <p style={{ color: 'green' }}>{t("submit_success_message")}</p>}
          {submitStatus === "error" && <p style={{ color: 'red' }}>{t("submit_error_message")}</p>}
          <div className="info-text"><div className="div11">피드백은 익명으로 처리되며, 급식 개선에 활용됩니다.</div></div>
        </>
      ) : <p>{t("no_meal_data")}</p>}
    </div>
  );
};

export const FeedbackScreen = ({ className, ...props }) => {
  const { t } = useTranslation();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserData(userSnap.data());
        }
      }
      setLoading(false);
    };
    fetchUserData();
  }, [user]);

  return (
    <div className={"feedback-screen " + className}>
      <div className="header"><div className="div">{t("feedback_title")}</div></div>
      <div className="content">
        {loading ? <div>{t("loading")}</div> : userData?.role === 'nutritionist' ? <NutritionistView /> : <StudentView userData={userData} />}
      </div>
    </div>
  );
};

export default FeedbackScreen;