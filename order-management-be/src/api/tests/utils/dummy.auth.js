import CryptoJS from 'crypto-js';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import { USER_STATUS } from '../../models/user.model.js';
import { STATUS_CODE } from '../../utils/common.js';

const encrypt = (password) => CryptoJS.AES.encrypt(password, 'test-secret').toString();

export const register = {
    invalidEmailData: {
        body: {
            firstName: 'test',
            lastName: 'test',
            phoneNumber: '1234567890',
            email: 'test$test.vi', // invalid email
            password: encrypt('Test@1234'),
            recoveryCode: '482901',
            confirmRecoveryCode: '482901'
        },
        res: {
            code: STATUS_CODE.BAD_REQUEST,
            data: { message: '"email" must be a valid email' }
        }
    },
    invalidPasswordData: {
        body: {
            firstName: 'test',
            lastName: 'test',
            phoneNumber: '1234567890',
            email: 'test@test.com',
            password: encrypt('Test1234'), // invalid password Test1234
            recoveryCode: '482901',
            confirmRecoveryCode: '482901'
        },
        res: {
            code: STATUS_CODE.BAD_REQUEST,
            data: {
                message:
                    'Password must contain at least 8 characters, one letter, one number, and one special character.'
            }
        }
    },
    invalidPhoneData: {
        body: {
            firstName: 'test',
            lastName: 'test',
            phoneNumber: '123456789', // invalid phone with 9 digits
            email: 'test@test.com',
            password: encrypt('Test@1234'),
            recoveryCode: '482901',
            confirmRecoveryCode: '482901'
        },
        res: {
            code: STATUS_CODE.BAD_REQUEST,
            data: {
                message: '"phoneNumber" must be a 10 digit number'
            }
        }
    },
    invalidData: {
        body: {
            phoneNumber: '1234567890',
            email: 'test@test.com',
            password: encrypt('Test@1234'),
            recoveryCode: '482901',
            confirmRecoveryCode: '482901'
        },
        res: {
            code: STATUS_CODE.BAD_REQUEST,
            data: { message: '"firstName" is required' }
        }
    },
    user: {
        body: {
            firstName: 'test',
            lastName: 'test',
            phoneNumber: '1234567890',
            email: 'test@test.com',
            password: encrypt('Test@1234'),
            recoveryCode: '482901',
            confirmRecoveryCode: '482901'
        },
        db: {
            id: '60c688d6-5442-4569-9c8c-3f973b3ba554',
            firstName: 'test',
            lastName: 'test',
            phoneNumber: '1234567890',
            email: 'test@test.com',
            role: 'OWNER',
            status: 'INACTIVE'
        },
        res: {
            code: STATUS_CODE.CREATED
        }
    }
};

export const login = {
    unregisteredEmailData: {
        body: {
            email: 'unregistered-email@test.com',
            password: encrypt('Test@1234'), // Test@1234
            role: 'OWNER'
        },
        res: {
            code: STATUS_CODE.UNAUTHORIZED,
            data: { message: 'Invalid email, password, or role' }
        }
    },
    incorrectPasswordData: {
        body: {
            email: 'valid-email@test.com',
            password: encrypt('Test@1234'), // Test@1234
            role: 'OWNER'
        },
        db: {
            email: 'valid-email@test.com',
            password: encrypt('Test@1237'), // Test@1237
            role: 'OWNER'
        },
        res: {
            code: STATUS_CODE.UNAUTHORIZED,
            data: { message: 'Invalid email, password, or role' }
        }
    },
    inActiveData: {
        body: {
            email: 'valid-email@test.com',
            password: encrypt('Test@1234'), // Test@1234
            role: 'OWNER'
        },
        db: {
            email: 'valid-email@test.com',
            password: encrypt('Test@1234'), // Test@1234
            status: USER_STATUS[1],
            role: 'OWNER'
        },
        res: {
            code: STATUS_CODE.FORBIDDEN,
            data: { message: 'Email is not verified' }
        }
    },
    successLoginData: {
        body: {
            email: 'valid-email@test.com',
            password: encrypt('Test@1234'), // Test@1234
            role: 'OWNER'
        },
        db: {
            email: 'valid-email@test.com',
            password: encrypt('Test@1234'), // Test@1234
            status: USER_STATUS[0],
            role: 'OWNER',
            tokenVersion: 0
        },
        res: {
            code: STATUS_CODE.OK,
            data: { message: 'Email not verified' }
        }
    }
};

export const verify = {
    userAlreadyVerifiedData: {
        body: {
            email: 'valid-test@test.com'
        },
        db: {
            status: USER_STATUS[0]
        },
        res: {
            code: STATUS_CODE.BAD_REQUEST,
            data: { message: 'User already verified Please try login' }
        }
    },
    linkExpiredData: {
        body: {
            email: 'valid-test@test.com',
            expires: moment().subtract(1, 'hour').valueOf()
        },
        db: {
            status: USER_STATUS[1]
        },
        res: {
            code: STATUS_CODE.GONE,
            data: {
                message: `Sorry, the link has expired. We've sent a new one to your email. Please check and try again.`
            }
        }
    },
    verifyEmailData: {
        body: {
            email: 'valid-test@test.com',
            expires: moment().add(1, 'hour').valueOf()
        },
        db: {
            status: USER_STATUS[1]
        },
        res: {
            code: STATUS_CODE.OK,
            data: { status: USER_STATUS[0] }
        }
    }
};

export const forget = {
    unverifiedData: {
        body: {
            email: 'valid-email@test.com'
        },
        db: {
            status: USER_STATUS[1]
        },
        res: {
            code: STATUS_CODE.FORBIDDEN,
            data: { message: 'User has not verified email' }
        }
    },
    forgotPasswordData: {
        body: {
            email: 'valid-email@test.com'
        },
        db: {
            id: 'forgot-user',
            email: 'valid-email@test.com',
            role: 'OWNER',
            tokenVersion: 0,
            status: USER_STATUS[0]
        },
        res: {
            code: STATUS_CODE.OK,
            data: { message: 'If an account exists for this email, a recovery link has been sent.' }
        }
    }
};

export const reset = {
    resetPasswordData: {
        body: {
            token: jwt.sign(
                { sub: 'reset-user', purpose: 'PASSWORD_RESET', tokenVersion: 0 },
                'test-jwt-secret',
                { expiresIn: '1h' }
            ),
            newPassword: encrypt('Test@1237') // Test@1237
        },
        db: {
            id: 'reset-user',
            tokenVersion: 0,
            password: ''
        },
        res: {
            code: STATUS_CODE.OK,
            data: { message: 'Password reset successfully. Please login with your new password.' }
        }
    }
};
