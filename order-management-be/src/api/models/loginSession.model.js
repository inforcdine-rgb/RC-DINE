import { DataTypes } from 'sequelize';
import { TABLES } from '../utils/common.js';

const loginSessionModel = (sequelize) =>
    sequelize.define(
        TABLES.LOGIN_SESSION,
        {
            id: {
                type: DataTypes.STRING,
                primaryKey: true
            },
            userId: {
                type: DataTypes.STRING,
                allowNull: false,
                references: {
                    model: TABLES.USERS,
                    key: 'id'
                }
            },
            deviceId: {
                type: DataTypes.STRING(128),
                allowNull: true
            },
            deviceName: {
                type: DataTypes.STRING(180),
                allowNull: false
            },
            deviceType: {
                type: DataTypes.STRING(30),
                allowNull: false,
                defaultValue: 'DESKTOP'
            },
            browser: {
                type: DataTypes.STRING(80),
                allowNull: true
            },
            operatingSystem: {
                type: DataTypes.STRING(80),
                allowNull: true
            },
            appMode: {
                type: DataTypes.STRING(30),
                allowNull: false,
                defaultValue: 'BROWSER'
            },
            ipAddress: {
                type: DataTypes.STRING(64),
                allowNull: true
            },
            timezone: {
                type: DataTypes.STRING(80),
                allowNull: true
            },
            userAgent: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            lastActiveAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            },
            expiresAt: {
                type: DataTypes.DATE,
                allowNull: false
            },
            revokedAt: {
                type: DataTypes.DATE,
                allowNull: true
            },
            revokedReason: {
                type: DataTypes.STRING(80),
                allowNull: true
            }
        },
        {
            indexes: [
                { fields: ['userId', 'revokedAt', 'expiresAt'], name: 'login_sessions_user_active' },
                { fields: ['deviceId'], name: 'login_sessions_device' }
            ]
        }
    );

export default loginSessionModel;
