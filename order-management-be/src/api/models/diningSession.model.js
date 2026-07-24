import { DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import { TABLES } from '../utils/common.js';

export const DINING_SESSION_STATUS = [
    'ACTIVE',
    'PAYMENT_PENDING',
    'CLOSED',
    'CANCELLED'
];

const diningSessionModel = (sequelize) =>
    sequelize.define(
        TABLES.DINING_SESSION,
        {
            id: {
                type: DataTypes.STRING,
                primaryKey: true,
                defaultValue: () => uuidv4()
            },
            sessionCode: {
                type: DataTypes.STRING(12),
                allowNull: false,
                unique: true
            },
            hotelId: {
                type: DataTypes.STRING,
                allowNull: false,
                references: {
                    model: TABLES.HOTEL,
                    key: 'id'
                }
            },
            tableId: {
                type: DataTypes.STRING,
                allowNull: false,
                references: {
                    model: TABLES.TABLE,
                    key: 'id'
                }
            },
            ownerCustomerId: {
                type: DataTypes.STRING,
                allowNull: true,
                references: {
                    model: TABLES.CUSTOMER,
                    key: 'id'
                }
            },
            ownerMobile: {
                type: DataTypes.STRING(20),
                allowNull: false
            },
            status: {
                type: DataTypes.ENUM,
                values: DINING_SESSION_STATUS,
                allowNull: false,
                defaultValue: 'ACTIVE'
            },
            startedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            },
            paymentCompletedAt: {
                type: DataTypes.DATE,
                allowNull: true
            },
            closedAt: {
                type: DataTypes.DATE,
                allowNull: true
            },
            closedByUserId: {
                type: DataTypes.STRING,
                allowNull: true,
                references: {
                    model: TABLES.USERS,
                    key: 'id'
                }
            },
            deletedAt: {
                type: DataTypes.DATE,
                allowNull: true
            }
        },
        {
            paranoid: true,
            indexes: [
                {
                    fields: ['hotelId', 'tableId', 'status']
                },
                {
                    fields: ['ownerMobile']
                }
            ]
        }
    );

export default diningSessionModel;
