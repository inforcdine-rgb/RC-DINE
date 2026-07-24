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
            logo: {
                type: DataTypes.STRING,
                allowNull: true,
                defaultValue: null
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
            gstNumber: {
                type: DataTypes.STRING,
                allowNull: true
            },
            gstEnabled: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            gstPercent: {
                type: DataTypes.DECIMAL(5, 2),
                allowNull: false,
                defaultValue: 0
            },
            discountEnabled: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
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
            printerWidth: {
                type: DataTypes.ENUM('58', '80', 'auto'),
                allowNull: false,
                defaultValue: '58'
            },
            receiptShowLogo: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            receiptFooterMessage: {
                type: DataTypes.STRING(120),
                allowNull: false,
                defaultValue: 'Thank you! Visit again.'
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
