const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize app only if not already initialized
try {admin.app();} catch {admin.initializeApp();}

exports.sendLoginNotification = functions.https.onCall(async (data, context) => {
  const token = data && data.token;
  if (!token) {
    throw new functions.https.HttpsError('invalid-argument', 'No token provided');
  }
  const message = {
    notification: {
      title: '로그인 성공',
      body: '앱에 로그인 되었습니다',
    },
    token,
  };
  await admin.messaging().send(message);
  return { success: true };
});
