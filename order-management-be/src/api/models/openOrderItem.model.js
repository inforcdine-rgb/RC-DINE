import { DataTypes } from 'sequelize';
import { TABLES } from '../utils/common.js';

const openOrderItemModel = (sequelize) =>
    sequelize.define(
        TABLES.OPEN_ORDER_ITEM,
        {
            id: {
                type: DataTypes.STRING,
                primaryKey: true
            },
            openOrderId: {
                type: DataTypes.STRING,
                allowNull: false,
                references: { model: TABLES.OPEN_ORDER, key: 'id' }
            },
            menuId: {
                type: DataTypes.STRING,
                allowNull: false,
                references: { model: TABLES.MENU, key: 'id' }
            },
            itemName: {
                type: DataTypes.STRING,
                allowNull: false
            },
            unitPrice: {
                type: DataTypes.DECIMAL(12, 2),
                allowNull: false
            },
            quantity: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false
            },
            lineTotal: {
                type: DataTypes.DECIMAL(12, 2),
                allowNull: false
            },
            notes: {
                type: DataTypes.STRING(300),
                allowNull: true
            },
            additionKey: {
                type: DataTypes.STRING(100),
                allowNull: false
            },
            addedByUserId: {
                type: DataTypes.STRING,
                allowNull: false,
                references: { model: TABLES.USERS, key: 'id' }
            },
            addedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            },
            kotPrintedAt: {
                type: DataTypes.DATE,
                allowNull: true
            },
            kotBatchNumber: {
                type: DataTypes.INTEGER.UNSIGNED,
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
                    fields: ['openOrderId', 'additionKey', 'menuId']
                },
                { fields: ['openOrderId', 'kotPrintedAt'] },
                { fields: ['addedByUserId'] }
            ]
        }
    );

export default openOrderItemModel;
