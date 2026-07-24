import { DataTypes } from 'sequelize';
import { TABLES } from '../utils/common.js';

const pushSubscriptionsModel = (sequelize) =>
    sequelize.define(
        TABLES.PUSH_SUBSCRIPTION,
        {
            id: {
                type: DataTypes.STRING,
                primaryKey: true
            },
            userId: {
                type: DataTypes.STRING,
                allowNull: true,
                references: {
                    model: TABLES.USERS,
                    key: 'id'
                }
            },
            customerId: {
                type: DataTypes.STRING,
                allowNull: true,
                references: {
                    model: TABLES.CUSTOMER,
                    key: 'id'
                }
            },
            phoneNumber: {
                type: DataTypes.STRING(20),
                allowNull: true
            },
            deviceId: {
                type: DataTypes.STRING,
                allowNull: false
            },
            endpoint: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            endpointHash: {
                type: DataTypes.STRING(64),
                allowNull: false
            },
            expiration: {
                type: DataTypes.DATE,
                allowNull: true
            },
            p256dh: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            auth: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            platform: {
                type: DataTypes.STRING(50),
                allowNull: true
            },
            lastSeenAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            },
            deletedAt: {
                type: DataTypes.DATE,
                allowNull: true
            }
        },
        {
            paranoid: true
        }
    );

export default pushSubscriptionsModel;
