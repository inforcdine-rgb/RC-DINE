import { DataTypes } from 'sequelize';

const subscriptionPaymentModel = (sequelize) =>
    sequelize.define(
        'subscriptionPayments',
        {
            id: { type: DataTypes.STRING, primaryKey: true },
            userId: { type: DataTypes.STRING, allowNull: false },
            planCode: { type: DataTypes.STRING(40), allowNull: false },
            amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
            days: { type: DataTypes.INTEGER, allowNull: false },
            subscriptionStartAt: { type: DataTypes.DATE, allowNull: false },
            subscriptionEndAt: { type: DataTypes.DATE, allowNull: false },
            razorpayOrderId: { type: DataTypes.STRING, allowNull: false },
            razorpayPaymentId: { type: DataTypes.STRING, allowNull: false, unique: true }
        },
        { tableName: 'subscriptionPayments', timestamps: true }
    );

export default subscriptionPaymentModel;
