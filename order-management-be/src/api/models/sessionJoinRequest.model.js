import { DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import { TABLES } from '../utils/common.js';

export const SESSION_JOIN_REQUEST_STATUS = [
    'PENDING',
    'ACCEPTED',
    'REJECTED',
    'EXPIRED',
    'CANCELLED'
];

const sessionJoinRequestModel = (sequelize) =>
    sequelize.define(
        TABLES.SESSION_JOIN_REQUEST,
        {
            id: {
                type: DataTypes.STRING,
                primaryKey: true,
                defaultValue: () => uuidv4()
            },
            sessionId: {
                type: DataTypes.STRING,
                allowNull: false,
                references: {
                    model: TABLES.DINING_SESSION,
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
            customerId: {
                type: DataTypes.STRING,
                allowNull: true,
                references: {
                    model: TABLES.CUSTOMER,
                    key: 'id'
                }
            },
            mobileNumber: {
                type: DataTypes.STRING(20),
                allowNull: false
            },
            status: {
                type: DataTypes.ENUM,
                values: SESSION_JOIN_REQUEST_STATUS,
                allowNull: false,
                defaultValue: 'PENDING'
            },
            requestedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            },
            expiresAt: {
                type: DataTypes.DATE,
                allowNull: false
            },
            respondedAt: {
                type: DataTypes.DATE,
                allowNull: true
            },
            respondedByCustomerId: {
                type: DataTypes.STRING,
                allowNull: true,
                references: {
                    model: TABLES.CUSTOMER,
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
                    fields: ['sessionId', 'status', 'expiresAt']
                },
                {
                    fields: ['tableId', 'mobileNumber', 'status']
                }
            ]
        }
    );

export default sessionJoinRequestModel;
