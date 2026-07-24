import { DataTypes } from 'sequelize';
import { TABLES } from '../utils/common.js';

export const ORDER_STATUS = ['PENDING', 'SERVED', 'CANCELLED', 'COMPLETED', 'PREPARING', 'READY'];
const orderModel = (sequelize) =>
    sequelize.define(
        TABLES.ORDER,
        {
            id: {
                type: DataTypes.STRING,
                primaryKey: true
            },
            menuId: {
                type: DataTypes.STRING,
                allowNull: false,
                references: {
                    model: TABLES.MENU,
                    key: 'id'
                }
            },
            customerId: {
                type: DataTypes.STRING,
                allowNull: false,
                references: {
                    model: TABLES.CUSTOMER,
                    key: 'id'
                }
            },
            hotelId: {
                type: DataTypes.STRING,
                allowNull: true,
                references: {
                    model: TABLES.HOTEL,
                    key: 'id'
                }
            },
            sessionId: {
                type: DataTypes.STRING,
                allowNull: true,
                references: {
                    model: TABLES.DINING_SESSION,
                    key: 'id'
                }
            },
            tableId: {
                type: DataTypes.STRING,
                allowNull: true,
                references: {
                    model: TABLES.TABLE,
                    key: 'id'
                }
            },
            price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false
            },
            quantity: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            status: {
                type: DataTypes.ENUM,
                allowNull: false,
                values: ORDER_STATUS,
                defaultValue: ORDER_STATUS[0]
            },
            description: {
                type: DataTypes.STRING,
                allowNull: true
            },
            edited: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            orderNumber: {
                type: DataTypes.STRING,
                allowNull: true
            },
            razorpayOrderId: {
                type: DataTypes.STRING,
                allowNull: true
            },
            razorpayPaymentId: {
                type: DataTypes.STRING,
                allowNull: true
            },
            subtotalAmount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: true
            },
            cgstAmount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: true
            },
            sgstAmount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: true
            },
            tipAmount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: 0
            },
            finalAmount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: true
            },
            discountType: {
                type: DataTypes.ENUM('PERCENT', 'FLAT'),
                allowNull: true
            },
            discountValue: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0
            },
            discountAmount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0
            },
            paymentMethod: {
                type: DataTypes.ENUM('CASH', 'UPI', 'CARD'),
                allowNull: true
            },
            cashReceived: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0
            },
            changeAmount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0
            },
            paymentStatus: {
                type: DataTypes.ENUM('PAID', 'UNPAID'),
                allowNull: false,
                defaultValue: 'UNPAID'
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

export default orderModel;
