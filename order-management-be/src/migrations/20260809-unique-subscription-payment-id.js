export const up = async (queryInterface) => {
    await queryInterface.sequelize.query(`
        UPDATE users AS duplicate_user
        INNER JOIN users AS keeper
            ON duplicate_user.razorpayPaymentId = keeper.razorpayPaymentId
            AND duplicate_user.id > keeper.id
        SET duplicate_user.razorpayPaymentId = NULL
        WHERE duplicate_user.razorpayPaymentId IS NOT NULL
    `);
    await queryInterface.addIndex('users', ['razorpayPaymentId'], {
        name: 'users_razorpay_payment_id_unique',
        unique: true
    });
};
export const down = async (queryInterface) => {
    await queryInterface.removeIndex('users', 'users_razorpay_payment_id_unique');
};
