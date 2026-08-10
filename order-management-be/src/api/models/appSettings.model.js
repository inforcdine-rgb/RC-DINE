import { DataTypes } from 'sequelize';

const appSettingsModel = (sequelize) =>
    sequelize.define(
        'appSettings',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true
            },
            razorpayKeyId: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            razorpayKeySecret: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            activeQrTemplateIds: {
                type: DataTypes.JSON,
                allowNull: false,
                defaultValue: []
            }
        },
        {
            tableName: 'appSettings',
            timestamps: true
        }
    );

export default appSettingsModel;
