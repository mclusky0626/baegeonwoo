# 급식/프로필 관리 앱

본 프로젝트는 React와 Vite를 기반으로 한 급식 및 개인 설정 관리 웹 애플리케이션입니다. Firebase를 통한 인증과 Firestore 데이터베이스, 그리고 교육청 NEIS 급식 API를 사용하여 사용자에게 학교 급식 정보를 제공합니다.

## 주요 폴더 구조
- `src/index.jsx` – 앱의 진입점이며 전역 스타일을 불러옵니다.
- `src/App.jsx` – React Router를 사용하여 각 페이지로 이동합니다.
- `src/HomeScreen/` – 홈 화면 및 학교 급식 호출 로직.
- `src/SettingsScreen/` – 사용자 설정을 관리합니다.
- `src/Week/` – 주간 급식표를 보여주는 화면입니다.
- `src/FeedbackScreen/` – 피드백 전송 화면입니다.
- `src/Frame/` – 프로필 관련 페이지입니다.
- `src/components/` – 공통 레이아웃 등 공유 컴포넌트가 위치합니다.
- `src/firebase.js` – Firebase 초기화 및 인증/DB 객체 제공.
- `src/i18n.js` – i18next 설정과 다국어 번역 로딩 (한국어, 영어, 중국어).
- `src/locales/` – 번역 JSON 파일.

## 중요한 내용
- **Firebase 인증/Firestore**: 사용자 로그인, 등록, 알레르기 및 종교 정보 저장 등에 사용됩니다.
- **NEIS 급식 API**: `HomeScreen`과 `Week`에서 학교 급식 데이터를 받아옵니다.
- **i18next**: 한국어, 영어, 중국어를 지원하며 기본 언어는 한국어입니다.
- **레이아웃과 스타일**: Figma에서 생성된 CSS가 `src` 내 각 폴더에 위치하며, 전역 스타일은 `src/styles.css`에서 관리됩니다.
- **탭 내비게이션**: `Layout` 컴포넌트로 구현되어 모든 페이지 하단에 표시됩니다.

## 개발 방법
1. 의존성 설치
   ```bash
   npm install
   ```
2. 개발 서버 실행
   ```bash
   npm run dev
   ```
3. 빌드
   ```bash
   npm run build
   ```
4. PWA 설치
   - 배포 후 브라우저에서 '홈 화면에 추가'를 선택하면 안드로이드 앱처럼 동작합니다.

## Firebase 알림 설정
서비스 워커(`public/firebase-messaging-sw.js`)가 FCM 푸시 알림을 처리합니다.
알림 권한을 승인하면 매일 오전 8시에 오늘의 급식 정보를 전달하도록 서버에서 메시지를 전송할 수 있습니다.

예시 Cloud Function(`functions/sendDailyMealNotification.js`)을 사용하면 매일 아침 8시에 `meal` 토픽으로 메시지를 보낼 수 있습니다.

## 다음으로 배워야 할 것
- React Hooks (`useState`, `useEffect` 등) 활용
- Firebase 인증 흐름과 Firestore 쿼리
- i18next를 통한 번역 관리 방법
- Figma 기반 CSS 수정 및 전역 스타일 구조
- NEIS API 호출 및 오류 처리

---
