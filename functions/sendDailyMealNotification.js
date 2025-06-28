// Cloud Function to send daily meal notification at 8 AM
// Deploy to Firebase Functions and schedule with pubsub.

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.sendMealNotification = functions.pubsub
  .schedule('0 8 * * *') // every day at 8 AM
  .timeZone('Asia/Seoul')
  .onRun(async () => {
    const messaging = admin.messaging();
    // TODO: Fetch today's meal information from your data source
    const message = {
      notification: {
        title: '오늘의 급식',
        body: '오늘의 급식은 ~ 입니다',
      },
      topic: 'meal',
    };
    await messaging.send(message);
    return null;
  });
