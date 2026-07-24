import { DataTypes } from 'sequelize';
import { TABLES } from '../utils/common.js';

const customerOtpModel = (sequelize) =>
    sequelize.define(
        TABLES.CUSTOMER_OTP,
        {
            id: {
                type: DataTypes.STRING,
                primaryKey: true
            },
            phoneNumber: {
                type: DataTypes.STRING(10),
                allowNull: false,
                unique: true
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
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            hourlySendCount: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1
            },
            hourlyWindowStartedAt: {
                type: DataTypes.DATE,
                allowNull: false
            },
            dailySendCount: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1
            },
            dailyWindowStartedAt: {
                type: DataTypes.DATE,
                allowNull: false
            },
            verifiedAt: {
                type: DataTypes.DATE,
                allowNull: true
            }
        },
        {
            tableName: TABLES.CUSTOMER_OTP,
            indexes: [{ fields: ['phoneNumber'], unique: true }]
        }
    );

export default customerOtpModel;
