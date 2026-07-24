import { DataTypes } from 'sequelize';
import { TABLES } from '../utils/common.js';

export const NOTIFICATION_STATUS = ['ACTIVE', 'INACTIVE'];
const notificationModel = (sequelize) =>
    sequelize.define(
        TABLES.NOTIFICATION,
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
            title: {
                type: DataTypes.STRING,
                allowNull: false
            },
            message: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            path: {
                type: DataTypes.STRING,
                allowNull: true
            },
            type: {
                type: DataTypes.STRING(50),
                allowNull: false,
                defaultValue: 'UPDATE'
            },
            category: {
                type: DataTypes.STRING(50),
                allowNull: false,
                defaultValue: 'GENERAL'
            },
            entityId: {
                type: DataTypes.STRING,
                allowNull: true
            },
            dedupeKey: {
                type: DataTypes.STRING,
                allowNull: true
            },
            payload: {
                type: DataTypes.JSON,
                allowNull: true
            },
            status: {
                type: DataTypes.ENUM,
                values: NOTIFICATION_STATUS,
                allowNull: false,
                defaultValue: NOTIFICATION_STATUS[0]
            },
            readAt: {
                type: DataTypes.DATE,
                allowNull: true
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

export default notificationModel;
