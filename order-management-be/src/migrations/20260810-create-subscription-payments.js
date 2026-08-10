export const up = async (queryInterface, Sequelize) => {
    await queryInterface.createTable('subscriptionPayments', {
        id: { type: Sequelize.STRING, primaryKey: true, allowNull: false },
        userId: {
            type: Sequelize.STRING,
            allowNull: false,
            references: { model: 'users', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        planCode: { type: Sequelize.STRING(40), allowNull: false },
        amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
        days: { type: Sequelize.INTEGER, allowNull: false },
        subscriptionStartAt: { type: Sequelize.DATE, allowNull: false },
        subscriptionEndAt: { type: Sequelize.DATE, allowNull: false },
        razorpayOrderId: { type: Sequelize.STRING, allowNull: false },
        razorpayPaymentId: { type: Sequelize.STRING, allowNull: false, unique: true },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false }
    });
};

export const down = async (queryInterface) => {
    await queryInterface.dropTable('subscriptionPayments');
};
