import { DataTypes } from 'sequelize';
import { TABLES } from '../utils/common.js';

export const ADMIN_OTP_PURPOSES = ['LOGIN', 'EMAIL_CHANGE', 'PASSWORD_CHANGE'];
export const ADMIN_OTP_STAGES = ['LOGIN', 'CURRENT_EMAIL', 'NEW_EMAIL', 'PASSWORD'];

const adminOtpChallengeModel = (sequelize) =>
    sequelize.define(
        TABLES.ADMIN_OTP_CHALLENGE,
        {
            id: {
                type: DataTypes.STRING,
                primaryKey: true
            },
            adminId: {
                type: DataTypes.STRING,
                allowNull: false
            },
            purpose: {
                type: DataTypes.ENUM,
                values: ADMIN_OTP_PURPOSES,
                allowNull: false
            },
            stage: {
                type: DataTypes.ENUM,
                values: ADMIN_OTP_STAGES,
                allowNull: false
            },
            targetEmail: {
                type: DataTypes.STRING,
                allowNull: false
            },
            pendingValue: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            otpHash: {
                type: DataTypes.STRING(64),
                allowNull: false
            },
            expiresAt: {
                type: DataTypes.DATE,
                allowNull: false
            },
            lastSentAt: {
                type: DataTypes.DATE,
                allowNull: false
            },
            attempts: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                defaultValue: 0
            },
            sendCount: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                defaultValue: 1
            },
            consumedAt: {
                type: DataTypes.DATE,
                allowNull: true
            },
            ipAddress: {
                type: DataTypes.STRING(64),
                allowNull: true
            },
            userAgent: {
                type: DataTypes.STRING(255),
                allowNull: true
            }
        },
        {
            tableName: TABLES.ADMIN_OTP_CHALLENGE,
            indexes: [{ fields: ['adminId', 'purpose'] }, { fields: ['expiresAt'] }, { fields: ['consumedAt'] }]
        }
    );

export default adminOtpChallengeModel;
