import dotenv from 'dotenv';
dotenv.config();

const env = {
    app: {
        env: process.env.NODE_ENV,
        port: Number(process.env.PORT),
        appUrl: process.env.APP_URL,
        isDevelopment: process.env.NODE_ENV === 'development'
    },
    jwtSecret: process.env.JWT_SECRET,
    db: {
        name: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        dialect: process.env.DB_DIALECT
    },
    email: {
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    cryptoSecret: process.env.CRYPTO_SECRET_KEY,
    firebase: {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
    },
    razorpay: {
        keyId: process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY,
        // support older env name RAZORPAY_SECRET as fallback
        keySecret: process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET
    },
    fast2sms: {
        apiKey: process.env.FAST2SMS_API_KEY,
        route: process.env.FAST2SMS_ROUTE || 'q',
        timeoutMs: Number(process.env.FAST2SMS_TIMEOUT_MS || 10000)
    },
    customerAuth: {
        otpExpiryMinutes: Number(process.env.OTP_EXPIRY_MINUTES || 5),
        resendCooldownSeconds: Number(process.env.OTP_RESEND_COOLDOWN_SECONDS || 45),
        maxAttempts: Number(process.env.OTP_MAX_ATTEMPTS || 5),
        maxSendsPerHour: Number(process.env.OTP_MAX_SENDS_PER_HOUR || 5),
        maxSendsPerDay: Number(process.env.OTP_MAX_SENDS_PER_DAY || 15),
        jwtSecret: process.env.CUSTOMER_JWT_SECRET || process.env.JWT_SECRET,
        tokenExpiry: process.env.CUSTOMER_TOKEN_EXPIRY || '12h',
        otpHashSecret: process.env.OTP_HASH_SECRET || process.env.CUSTOMER_JWT_SECRET || process.env.JWT_SECRET
    },
    plans: {
        standaranMonthly: process.env.STANDARD_MONTHLY,
        standardYearly: process.env.STANDARD_YEARLY
    },
    supportEmail: process.env.SUPPORT_EMAIL,
    Cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET
    },
    cors: {
        origins: (process.env.CORS_ORIGINS || process.env.CLIENT_URL || '')
            .split(',')
            .map((origin) => origin.trim())
            .filter(Boolean)
    },
    seedAdmin: {
        enabled: String(process.env.SEED_ADMIN || '').toLowerCase() === 'true',
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        phone: process.env.ADMIN_PHONE || '9999999999',
        firstName: process.env.ADMIN_FIRST_NAME || 'Super',
        lastName: process.env.ADMIN_LAST_NAME || 'Admin'
    },
    notification: {
        publicKey: process.env.WEB_PUSH_PUBLIC_KEY,
        privateKey: process.env.WEB_PUSH_PRIVATE_KEY,
        email: process.env.WEB_PUSH_EMAIL
    }
};

export default env;
