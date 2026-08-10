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
    tableQrSecret: process.env.TABLE_QR_SECRET || process.env.CUSTOMER_JWT_SECRET || process.env.JWT_SECRET,
    trialDays: Number(process.env.TRIAL_DAYS || 3),
    db: {
        name: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        dialect: process.env.DB_DIALECT
    },
    email: {
        provider: String(process.env.EMAIL_PROVIDER || (process.env.RESEND_API_KEY ? 'resend' : 'smtp')).toLowerCase(),
        from: process.env.EMAIL_FROM,
        replyTo: process.env.EMAIL_REPLY_TO || process.env.SUPPORT_EMAIL,
        resendApiKey: process.env.RESEND_API_KEY,
        resendApiUrl: process.env.RESEND_API_URL || 'https://api.resend.com/emails',
        timeoutMs: Number(process.env.EMAIL_TIMEOUT_MS || 15000),
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    cryptoSecret: process.env.CRYPTO_SECRET_KEY,
    // Server-only: never expose this through a REACT_APP_* variable.
    serverEncryptionKey: process.env.SERVER_ENCRYPTION_KEY,
    firebase: {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
    },
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID
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
    adminAuth: {
        otpExpiryMinutes: Number(process.env.ADMIN_OTP_EXPIRY_MINUTES || 5),
        resendCooldownSeconds: Number(process.env.ADMIN_OTP_RESEND_COOLDOWN_SECONDS || 45),
        maxAttempts: Number(process.env.ADMIN_OTP_MAX_ATTEMPTS || 5),
        maxSends: Number(process.env.ADMIN_OTP_MAX_SENDS || 5),
        tokenExpiry: process.env.ADMIN_TOKEN_EXPIRY || '4h',
        otpHashSecret: process.env.ADMIN_OTP_HASH_SECRET || process.env.OTP_HASH_SECRET || process.env.JWT_SECRET
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

export const validateEnvironment = () => {
    const errors = [];
    const requireValue = (name, value) => {
        if (!String(value || '').trim()) errors.push(`${name} is required`);
    };

    requireValue('JWT_SECRET', env.jwtSecret);
    requireValue('CUSTOMER_JWT_SECRET', env.customerAuth.jwtSecret);
    requireValue('OTP_HASH_SECRET', env.customerAuth.otpHashSecret);
    requireValue('TABLE_QR_SECRET', env.tableQrSecret);
    requireValue('DB_NAME', env.db.name);
    requireValue('DB_HOST', env.db.host);
    requireValue('DB_USER', env.db.user);
    requireValue('DB_DIALECT', env.db.dialect);

    if (!Number.isInteger(env.trialDays) || env.trialDays < 1 || env.trialDays > 90) {
        errors.push('TRIAL_DAYS must be an integer between 1 and 90');
    }

    if (env.app.env === 'production') {
        requireValue('APP_URL', env.app.appUrl);
        requireValue('CRYPTO_SECRET_KEY', env.cryptoSecret);
        requireValue('SERVER_ENCRYPTION_KEY', env.serverEncryptionKey);
        requireValue('CUSTOMER_JWT_SECRET', process.env.CUSTOMER_JWT_SECRET);
        requireValue('OTP_HASH_SECRET', process.env.OTP_HASH_SECRET);
        requireValue('TABLE_QR_SECRET', process.env.TABLE_QR_SECRET);
        requireValue('ADMIN_OTP_HASH_SECRET', process.env.ADMIN_OTP_HASH_SECRET);
        requireValue('RAZORPAY_KEY_ID', env.razorpay.keyId);
        requireValue('RAZORPAY_KEY_SECRET', env.razorpay.keySecret);
        if (!env.cors.origins.length) errors.push('CORS_ORIGINS must contain at least one production origin');

        const productionSecrets = [
            ['JWT_SECRET', env.jwtSecret],
            ['CUSTOMER_JWT_SECRET', process.env.CUSTOMER_JWT_SECRET],
            ['OTP_HASH_SECRET', process.env.OTP_HASH_SECRET],
            ['TABLE_QR_SECRET', process.env.TABLE_QR_SECRET],
            ['ADMIN_OTP_HASH_SECRET', process.env.ADMIN_OTP_HASH_SECRET],
            ['SERVER_ENCRYPTION_KEY', env.serverEncryptionKey]
        ];
        productionSecrets.forEach(([name, value]) => {
            if (String(value || '').length < 32) errors.push(`${name} must contain at least 32 characters`);
        });
        const populatedSecrets = productionSecrets.map(([, value]) => value).filter(Boolean);
        if (new Set(populatedSecrets).size !== populatedSecrets.length) {
            errors.push('Production authentication and encryption secrets must all be different');
        }
    }

    if (errors.length) {
        throw new Error(`Invalid environment configuration: ${errors.join('; ')}`);
    }
};

export default env;
