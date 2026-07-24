const env = {
    baseUrl: process.env.REACT_APP_BASE_URL,
    cryptoSecret: process.env.REACT_APP_CRYPTO_SECRET_KEY,
    appUrl: process.env.REACT_APP_URL,
    notificationKey: process.env.REACT_APP_NOTIFICATION_KEY,
    firebase: {
        apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
        authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
        storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.REACT_APP_FIREBASE_APP_ID,
        vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY
    },
    razorpay: {
        id: process.env.REACT_APP_RAZORPAY_KEY_ID
    }
};

export default env;
