import { DataTypes } from 'sequelize';

const contactEnquiryModel = (sequelize) =>
    sequelize.define(
        'contactEnquiries',
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            name: { type: DataTypes.STRING(100), allowNull: false },
            mobile: { type: DataTypes.STRING(20), allowNull: false },
            email: { type: DataTypes.STRING(160), allowNull: true },
            restaurantName: { type: DataTypes.STRING(160), allowNull: true },
            message: { type: DataTypes.TEXT, allowNull: false },
            status: {
                type: DataTypes.ENUM('NEW', 'CONTACTED', 'CONVERTED', 'CLOSED'),
                allowNull: false,
                defaultValue: 'NEW'
            },
            adminNotes: { type: DataTypes.TEXT, allowNull: true }
        },
        { tableName: 'contactEnquiries', timestamps: true }
    );

export default contactEnquiryModel;
