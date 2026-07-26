import { DataTypes } from 'sequelize';

const subscriptionPlanModel = (sequelize) =>
    sequelize.define(
        'subscriptionPlans',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            code: {
                type: DataTypes.STRING(40),
                allowNull: false,
                unique: true
            },
            name: {
                type: DataTypes.STRING(80),
                allowNull: false
            },
            subtitle: {
                type: DataTypes.STRING(120),
                allowNull: true
            },
            amount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false
            },
            days: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            features: {
                type: DataTypes.JSON,
                allowNull: false,
                defaultValue: []
            },
            isPopular: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            displayOrder: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            buttonText: {
                type: DataTypes.STRING(80),
                allowNull: true
            }
        },
        {
            tableName: 'subscriptionPlans',
            timestamps: true
        }
    );

export default subscriptionPlanModel;
