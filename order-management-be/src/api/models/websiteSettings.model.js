import { DataTypes } from 'sequelize';

const websiteSettingsModel = (sequelize) =>
    sequelize.define(
        'websiteSettings',
        {
            id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            logoUrl: { type: DataTypes.TEXT, allowNull: true },
            logoPublicId: { type: DataTypes.STRING(255), allowNull: true },
            heroVideoUrl: { type: DataTypes.TEXT, allowNull: true },
            heroVideoPublicId: { type: DataTypes.STRING(255), allowNull: true },
            heroTitle: {
                type: DataTypes.STRING(180),
                allowNull: false,
                defaultValue: 'Restaurant Management Reimagined with AI'
            },
            heroDescription: {
                type: DataTypes.TEXT,
                allowNull: false,
                defaultValue:
                    'Run orders, billing, kitchen operations, analytics and subscriptions from one intelligent platform.'
            },
            primaryButtonText: { type: DataTypes.STRING(80), allowNull: false, defaultValue: 'Start Free Trial →' },
            secondaryButtonText: { type: DataTypes.STRING(80), allowNull: false, defaultValue: '▶ Watch Demo' },
            videoEnabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
            isPublished: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
        },
        { tableName: 'websiteSettings', timestamps: true }
    );

export default websiteSettingsModel;
