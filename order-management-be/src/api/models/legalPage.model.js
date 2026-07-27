import { DataTypes } from 'sequelize';

const legalPageModel = (sequelize) =>
    sequelize.define(
        'legalPage',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            slug: {
                type: DataTypes.ENUM('privacy', 'terms'),
                allowNull: false,
                unique: true
            },
            title: {
                type: DataTypes.STRING(180),
                allowNull: false
            },
            content: {
                type: DataTypes.TEXT('long'),
                allowNull: false
            },
            lastUpdatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            },
            isPublished: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            metaTitle: {
                type: DataTypes.STRING(180),
                allowNull: true
            },
            metaDescription: {
                type: DataTypes.STRING(320),
                allowNull: true
            }
        },
        {
            tableName: 'legalPages',
            timestamps: true
        }
    );

export default legalPageModel;
