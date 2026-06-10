# Dagub

Dagub는 학교 급식 데이터를 개인의 알레르기, 종교, 식생활 기준과 비교해 확인하는 React 기반 웹앱입니다. 현재 구현은 Vite, React Router, Firebase Authentication, Firestore, NEIS 급식 Open API를 사용합니다. Android 배포는 Capacitor 프로젝트가 포함되어 있어 같은 웹 코드를 앱 패키지로 빌드할 수 있습니다.

## 설계 방향

서비스의 핵심 화면은 급식 확인입니다. 사용자는 앱에 들어오자마자 학교, 날짜, 제공 끼니, 섭취 가능 여부를 빠르게 확인할 수 있어야 합니다. UI는 복잡한 설명보다 상태, 숫자, 선택 컨트롤을 우선하며 iOS 스타일의 절제된 색상, 작은 반경, 명확한 간격을 기준으로 구성합니다.

기본 학교는 비어 있습니다. 사용자가 설정에서 학교를 선택하면 해당 학교의 실제 제공 끼니에 따라 조식, 중식, 석식 세그먼트가 표시됩니다. 민족사관고등학교처럼 3끼를 제공하는 학교는 홈 화면에서 세 끼니가 모두 탭으로 나타납니다.

## 주요 기능

- Firebase 이메일/비밀번호 로그인, 회원가입, Google 로그인
- Firestore 사용자 프로필 저장
- 학교 검색 및 사용자별 학교 설정
- NEIS 급식 API 기반 날짜별 급식 조회
- 조식, 중식, 석식 세그먼트 전환
- NEIS 알레르기 코드 19종 기준 알레르기 판정
- 종교 및 식생활 유형 기반 제외 판정
- 주간 급식 리포트
- FCM 서비스워커 기반 푸시 알림 준비

## 데이터 기준

급식 데이터는 NEIS `mealServiceDietInfo` API를 사용합니다. 메뉴명에 포함된 알레르기 번호는 NEIS 문서의 19종 체계를 따릅니다.

- 1 난류
- 2 우유
- 3 메밀
- 4 땅콩
- 5 대두
- 6 밀
- 7 고등어
- 8 게
- 9 새우
- 10 돼지고기
- 11 복숭아
- 12 토마토
- 13 아황산류
- 14 호두
- 15 닭고기
- 16 쇠고기
- 17 오징어
- 18 조개류(굴, 전복, 홍합 포함)
- 19 잣

식품 표시 제도와 학교급식 NEIS 코드 체계가 완전히 동일하지 않을 수 있으므로, 앱의 자동 판정은 NEIS 메뉴 데이터에 포함된 코드와 메뉴명 키워드를 기준으로 합니다.

## 프로젝트 구조

```text
src/
  App.jsx                    라우팅 정의
  firebase.js                Firebase 초기화
  HomeScreen/                오늘의 급식 화면
  SettingsScreen/            학교, 종교, 식생활, 알레르기 설정
  Week/                      주간 급식 리포트
  Frame/                     내 정보 화면
  components/                공통 레이아웃과 탭바
  utils/
    mealUtils.js             NEIS 급식 파싱과 판정 로직
    school.js                학교 표시 유틸과 테스트용 학교 상수
  locales/                   한국어, 영어, 중국어 번역
public/
  firebase-messaging-sw.js   FCM 서비스워커
android/                     Capacitor Android 프로젝트
```

## 개발 환경 설정

의존성을 설치합니다.

```bash
npm install
```

환경변수 예시 파일을 복사해 로컬 설정을 만듭니다.

```bash
cp .env.example .env.local
cp public/firebase-config.example.js public/firebase-config.js
```

`.env.local`에는 Firebase Web App 설정과 필요한 경우 NEIS API 키를 입력합니다. `public/firebase-config.js`는 서비스워커에서 FCM 백그라운드 메시지를 처리할 때 사용합니다. 두 파일은 `.gitignore`에 포함되어야 하며 공개 저장소에 올리지 않습니다.

개발 서버를 실행합니다.

```bash
npm run dev
```

프로덕션 빌드를 확인합니다.

```bash
npm run build
```

## Firebase 설정

필요한 Vite 환경변수는 다음과 같습니다.

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID
VITE_FIREBASE_VAPID_KEY
VITE_NEIS_API_KEY
```

`VITE_FIREBASE_VAPID_KEY`가 비어 있으면 FCM 토큰 발급은 건너뜁니다. 로그인과 Firestore 저장은 나머지 Firebase Web App 설정이 올바르면 동작합니다.

Android 빌드에 필요한 `android/app/google-services.json`도 저장소에 커밋하지 않습니다. 이미 Git에 추적된 상태라면 다음 명령으로 추적을 해제한 뒤 파일은 로컬에만 유지합니다.

```bash
git rm --cached android/app/google-services.json
```

## Android 빌드

웹 빌드를 만든 뒤 Capacitor Android 프로젝트에 동기화합니다.

```bash
npm run build
npx cap sync android
npx cap open android
```

Android Studio에서 Firebase Google Services 파일과 패키지명을 확인한 뒤 빌드합니다.

## 다음 작업 후보

- 학교 로고를 공식 소스 또는 관리자 업로드 방식으로 표시
- 알레르기 고급 설정에 사용자 정의 키워드 추가
- 종교별 세부 규칙을 국가와 교단 차이를 고려해 확장
- 급식 변경 감지와 푸시 알림 스케줄러 구현
- 네이티브 Android 전환 여부 검토
