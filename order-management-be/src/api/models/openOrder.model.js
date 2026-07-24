import { DataTypes } from 'sequelize';
import { TABLES } from '../utils/common.js';

export const OPEN_ORDER_STATUS = ['OPEN', 'BILLED', 'COMPLETED', 'CANCELLED'];
export const OPEN_ORDER_TYPES = ['DINE_IN', 'WALK_IN', 'PARCEL', 'TAKE_AWAY'];

const openOrderModel = (sequelize) =>
    sequelize.define(
        TABLES.OPEN_ORDER,
        {
            id: {
                type: DataTypes.STRING,
                primaryKey: true
            },
            hotelId: {
                type: DataTypes.STRING,
                allowNull: false,
                references: { model: TABLES.HOTEL, key: 'id' }
            },
            tableId: {
                type: DataTypes.STRING,
                allowNull: true,
                references: { model: TABLES.TABLE, key: 'id' }
            },
            orderNumber: {
                type: DataTypes.STRING(32),
                allowNull: false,
                unique: true
            },
            orderType: {
                type: DataTypes.ENUM,
                values: OPEN_ORDER_TYPES,
                allowNull: false,
                defaultValue: 'WALK_IN'
            },
            customerName: {
                type: DataTypes.STRING(120),
                allowNull: true
            },
            customerPhone: {
                type: DataTypes.STRING(20),
                allowNull: true
            },
            notes: {
                type: DataTypes.STRING(500),
                allowNull: true
            },
            status: {
                type: DataTypes.ENUM,
                values: OPEN_ORDER_STATUS,
                allowNull: false,
                defaultValue: 'OPEN'
            },
            subtotalAmount: {
                type: DataTypes.DECIMAL(12, 2),
                allowNull: false,
                defaultValue: 0
            },
            discountType: {
                type: DataTypes.ENUM('PERCENT', 'FLAT'),
                allowNull: true
            },
            discountValue: {
                type: DataTypes.DECIMAL(12, 2),
                allowNull: false,
                defaultValue: 0
            },
            discountAmount: {
                type: DataTypes.DECIMAL(12, 2),
                allowNull: false,
                defaultValue: 0
            },
            gstPercent: {
                type: DataTypes.DECIMAL(5, 2),
                allowNull: false,
                defaultValue: 0
            },
            cgstAmount: {
                type: DataTypes.DECIMAL(12, 2),
                allowNull: false,
                defaultValue: 0
            },
            sgstAmount: {
                type: DataTypes.DECIMAL(12, 2),
                allowNull: false,
                defaultValue: 0
            },
            tipAmount: {
                type: DataTypes.DECIMAL(12, 2),
                allowNull: false,
                defaultValue: 0
            },
            finalAmount: {
                type: DataTypes.DECIMAL(12, 2),
                allowNull: false,
                defaultValue: 0
            },
            paymentStatus: {
                type: DataTypes.ENUM('UNPAID', 'PAID'),
                allowNull: false,
                defaultValue: 'UNPAID'
            },
            paymentMethod: {
                type: DataTypes.ENUM('CASH', 'UPI', 'CARD'),
                allowNull: true
            },
            cashReceived: {
                type: DataTypes.DECIMAL(12, 2),
                allowNull: false,
                defaultValue: 0
            },
            changeAmount: {
                type: DataTypes.DECIMAL(12, 2),
                allowNull: false,
                defaultValue: 0
            },
            createdByUserId: {
                type: DataTypes.STRING,
                allowNull: false,
                references: { model: TABLES.USERS, key: 'id' }
            },
            completedByUserId: {
                type: DataTypes.STRING,
                allowNull: true,
                references: { model: TABLES.USERS, key: 'id' }
            },
            createIdempotencyKey: {
                type: DataTypes.STRING(100),
                allowNull: false,
                unique: true
            },
            paymentIdempotencyKey: {
                type: DataTypes.STRING(100),
                allowNull: true
            },
            revision: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            billGeneratedAt: {
                type: DataTypes.DATE,
                allowNull: true
            },
            paidAt: {
                type: DataTypes.DATE,
                allowNull: true
            },
            closedAt: {
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
                { fields: ['hotelId', 'status', 'updatedAt'] },
                { fields: ['hotelId', 'tableId', 'status'] },
                { fields: ['createdByUserId'] }
            ]
        }
    );

export default openOrderModel;
