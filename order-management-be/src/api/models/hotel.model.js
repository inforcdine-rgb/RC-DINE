import { DataTypes } from 'sequelize';
import { TABLES } from '../utils/common.js';

const hotelModel = (sequelize) =>
    sequelize.define(
        TABLES.HOTEL,
        {
            id: {
                type: DataTypes.STRING,
                primaryKey: true
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            openTime: {
                type: DataTypes.STRING,
                allowNull: true
            },
            closeTime: {
                type: DataTypes.STRING,
                allowNull: true
            },
            address: {
                type: DataTypes.STRING,
                allowNull: false
            },
            careNumber: {
                type: DataTypes.STRING,
                allowNull: false
            },
            rating: {
                type: DataTypes.DECIMAL,
                allowNull: true
            },
            razorpayKeyId: {
                type: DataTypes.STRING,
                allowNull: true
            },
            razorpayKeySecret: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            razorpayMerchantName: {
                type: DataTypes.STRING,
                allowNull: true
            },
            razorpayMerchantEmail: {
                type: DataTypes.STRING,
                allowNull: true
            },
            razorpayMerchantPhone: {
                type: DataTypes.STRING,
                allowNull: true
            },
            paymentEnabled: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
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

export default hotelModel;
