import { DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import { TABLES } from '../utils/common.js';

export const SESSION_MEMBER_ROLE = ['OWNER', 'MEMBER'];
export const SESSION_MEMBER_STATUS = ['ACTIVE', 'LEFT', 'REMOVED'];

const sessionMemberModel = (sequelize) =>
    sequelize.define(
        TABLES.SESSION_MEMBER,
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
            role: {
                type: DataTypes.ENUM,
                values: SESSION_MEMBER_ROLE,
                allowNull: false,
                defaultValue: 'MEMBER'
            },
            status: {
                type: DataTypes.ENUM,
                values: SESSION_MEMBER_STATUS,
                allowNull: false,
                defaultValue: 'ACTIVE'
            },
            joinedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            },
            leftAt: {
                type: DataTypes.DATE,
                allowNull: true
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
                    unique: true,
                    fields: ['sessionId', 'mobileNumber']
                },
                {
                    fields: ['customerId']
                }
            ]
        }
    );

export default sessionMemberModel;
