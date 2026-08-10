export const up = async (queryInterface, Sequelize) => {
    await queryInterface.createTable('appSettings', {
        id: { type: Sequelize.INTEGER, primaryKey: true, allowNull: false },
        razorpayKeyId: { type: Sequelize.STRING(255), allowNull: true },
        razorpayKeySecret: { type: Sequelize.TEXT, allowNull: true },
        activeQrTemplateIds: { type: Sequelize.JSON, allowNull: false, defaultValue: [] },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false }
    });
};

export const down = async (queryInterface) => {
    await queryInterface.dropTable('appSettings');
};
