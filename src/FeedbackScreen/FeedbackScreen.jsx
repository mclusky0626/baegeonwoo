import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, collection, addDoc, Timestamp, getDocs } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import DatePicker from "react-datepicker";
import Calendar from 'react-calendar';

// 분리된 CSS 파일을 import 합니다.
import "./FeedbackScreen.css"; 
import "react-datepicker/dist/react-datepicker.css";
import 'react-calendar/dist/Calendar.css';

// 하드코딩된 태그들을 상수로 관리하여 유지보수성을 높입니다.
const FEEDBACK_TAGS = ['too_salty', 'too_sweet', 'delicious'];

// Nutritionist view
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
      const allRatings = {}; // { 'menuName': [5, 4, 5], ... }

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
          const ratedReviewsCount = reviews.filter(r => r.rating).length;
          const avgRating = ratedReviewsCount > 0 ? totalRating / ratedReviewsCount : 0;
          const tagCounts = reviews.flatMap(r => r.tags || []).reduce((acc, tag) => {
            acc[tag] = (acc[tag] || 0) + 1;
            return acc;
          }, {});
          const comments = reviews.map(r => r.comment).filter(Boolean);

          aggregatedData[menuName] = {
            avgRating: avgRating.toFixed(1),
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
        {isWeeklyReportLoading ? (
          <p>{t("loading")}</p>
        ) : weeklyReport ? (
          <div className="weekly-report-content">
            <p><strong>{t('best_menu')}:</strong> {weeklyReport.best.menuName} ({weeklyReport.best.avg.toFixed(1)} ★)</p>
            <p><strong>{t('worst_menu')}:</strong> {weeklyReport.worst.menuName} ({weeklyReport.worst.avg.toFixed(1)} ★)</p>
          </div>
        ) : (
          <p>{t('no_weekly_data')}</p>
        )}
      </div>

      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
        locale={i18n.language}
      />
      <div className="feedback-display">
        {loading ? (
          <p>{t("loading")}</p>
        ) : feedbackData && Object.keys(feedbackData).length > 0 ? (
          Object.entries(feedbackData).map(([menuName, data]) => (
            <div key={menuName} className="feedback-summary-item">
              <h4>{menuName} ({data.reviewCount} {t('reviews')})</h4>
              <p>{t('average_rating')}: {data.avgRating} ★</p>
              <div>
                <strong>{t('tag_summary')}:</strong>
                <ul>
                  {Object.entries(data.tagCounts).map(([tag, count]) => (
                    <li key={tag}>{t(tag)}: {count}</li>
                  ))}
                </ul>
              </div>
              <div onClick={() => openModal(menuName, data.comments)} className="comments-link">
                <strong>{t('comments')} ({data.comments.length})</strong>
              </div>
            </div>
          ))
        ) : (
          <p>{t("no_feedback_data")}</p>
        )}
      </div>
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>{modalContent.title} - {t('comments')}</h3>
            <ul className="comment-list">
              {modalContent.comments.length > 0 ? modalContent.comments.map((comment, i) => (
                <li key={i}>{comment}</li>
              )) : <li>{t('no_comments')}</li>}
            </ul>
            <button onClick={closeModal}>{t('close')}</button>
          </div>
        </div>
      )}
    </div>
  );
};

const StarRating = ({ rating, onRatingChange }) => {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= rating ? "star-filled" : "star-empty"}
          onClick={() => onRatingChange(star)}
        >
          ★
        </span>
      ))}
    </div>
  );
};

const StudentView = ({ userData }) => {
  const { t, i18n } = useTranslation();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({});
  const [submitStatus, setSubmitStatus] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleFeedbackChange = (mealName, field, value) => {
    setFeedback(prev => ({
      ...prev,
      [mealName]: {
        ...prev[mealName],
        [field]: value
      }
    }));
  };
  
  const handleTagClick = (mealName, tag) => {
    const currentTags = feedback[mealName]?.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    handleFeedbackChange(mealName, 'tags', newTags);
  };
  
  const handleSubmit = async () => {
    setSubmitStatus("submitting");
    const dateStr = selectedDate.toISOString().split('T')[0];

    try {
      const feedbackPromises = Object.entries(feedback).map(([mealName, mealFeedback]) => {
        if (mealFeedback.rating || mealFeedback.comment || mealFeedback.tags?.length > 0) {
          const reviewsColRef = collection(db, `feedback/${dateStr}/menus/${mealName}/reviews`);
          return addDoc(reviewsColRef, {
            userId: auth.currentUser.uid,
            rating: mealFeedback.rating || null,
            comment: mealFeedback.comment || "",
            tags: mealFeedback.tags || [],
            createdAt: Timestamp.now()
          });
        }
        return null;
      }).filter(Boolean);

      await Promise.all(feedbackPromises);

      setSubmitStatus("success");
      setFeedback({}); // Clear feedback form
      setTimeout(() => setSubmitStatus(""), 3000);
    } catch (error) {
      console.error("Error submitting feedback: ", error);
      setSubmitStatus("error");
      setTimeout(() => setSubmitStatus(""), 3000);
    }
  };

  useEffect(() => {
    const fetchMeals = async () => {
      if (!userData || !userData.eduCode || !userData.schoolCode) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const ymd = selectedDate.toISOString().slice(0, 10).replace(/-/g, "");
      
      // **중요**: API 키를 코드에서 분리하여 환경변수로 관리합니다.
      const apiKey = process.env.REACT_APP_NEIS_API_KEY;
      const url = `https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=${apiKey}&Type=json&pIndex=1&pSize=10&ATPT_OFCDC_SC_CODE=${userData.eduCode}&SD_SCHUL_CODE=${userData.schoolCode}&MLSV_YMD=${ymd}`;
      
      try {
        const res = await fetch(url);
        const data = await res.json();
        const rows = data?.mealServiceDietInfo?.[1]?.row;
        if (rows && rows[0]?.DDISH_NM) {
          const dishList = rows[0].DDISH_NM.split("<br/>").map((txt) => ({
            name: txt.replace(/\s*\([^)]+\)/, "").trim()
          }));
          setMeals(dishList);
        } else {
          setMeals([]);
        }
      } catch (error) {
        console.error("Error fetching meal data:", error);
        setMeals([]);
      }
      setLoading(false);
    };

    fetchMeals();
  }, [userData, selectedDate]);

  return (
    <div className="student-view">
      <div className="date-selector">
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          dateFormat={i18n.language === "en" ? "yyyy-MM-dd" : "yyyy년 MM월 dd일"}
          customInput={<button className="date-select-btn">{t("change_date")}</button>}
          locale={i18n.language}
          popperPlacement="bottom-end"
        />
        <h3>{selectedDate.toLocaleDateString(i18n.language, { year: 'numeric', month: 'long', day: 'numeric' })}</h3>
      </div>

      {loading ? (
        <p>{t("loading")}</p>
      ) : meals.length > 0 ? (
        <>
          <div className="meal-feedback-list">
            {meals.map((meal) => (
              <div key={meal.name} className="meal-feedback-item">
                <h4>{meal.name}</h4>
                <StarRating
                  rating={feedback[meal.name]?.rating || 0}
                  onRatingChange={(rating) => handleFeedbackChange(meal.name, 'rating', rating)}
                />
                <textarea
                  className="comment-textarea"
                  placeholder={t("comment_placeholder")}
                  value={feedback[meal.name]?.comment || ''}
                  onChange={(e) => handleFeedbackChange(meal.name, 'comment', e.target.value)}
                  maxLength={200}
                />
                <div className="tags-container">
                  {FEEDBACK_TAGS.map(tag => (
                    <button
                      key={tag}
                      className={`tag-button ${feedback[meal.name]?.tags?.includes(tag) ? 'selected' : ''}`}
                      onClick={() => handleTagClick(meal.name, tag)}
                    >
                      {t(tag)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button className="submit-button" onClick={handleSubmit} disabled={submitStatus === "submitting"}>
            {submitStatus === "submitting" ? t("submitting") : t('submit_feedback')}
          </button>
          <div className="submit-status-message">
            {submitStatus === "success" && <p className="success">{t("submit_success_message")}</p>}
            {submitStatus === "error" && <p className="error">{t("submit_error_message")}</p>}
          </div>
          <div className="info-text">
            <p>{t('feedback_anonymous_info')}</p>
          </div>
        </>
      ) : (
        <p>{t("no_meal_data")}</p>
      )}
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
    <div className={"feedback-screen " + (className || "")}>
      <div className="header">
        <h1>{t("feedback_title")}</h1>
      </div>
      <div className="content">
        {loading ? (
          <div>{t("loading")}</div>
        ) : userData?.role === 'nutritionist' ? (
          <NutritionistView />
        ) : (
          <StudentView userData={userData} />
        )}
      </div>
    </div>
  );
};

export default FeedbackScreen;