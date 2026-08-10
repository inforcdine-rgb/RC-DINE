export const up = async (queryInterface) => {
    await queryInterface.sequelize.query(`
        UPDATE orders AS duplicate_order
        INNER JOIN orders AS keeper
            ON duplicate_order.razorpayPaymentId = keeper.razorpayPaymentId
            AND duplicate_order.id > keeper.id
        SET duplicate_order.razorpayPaymentId = NULL,
            duplicate_order.razorpayOrderId = NULL
        WHERE duplicate_order.razorpayPaymentId IS NOT NULL
    `);
    await queryInterface.addIndex('orders', ['razorpayPaymentId'], {
        name: 'orders_razorpay_payment_id_unique',
        unique: true
    });
};

export const down = async (queryInterface) => {
    await queryInterface.removeIndex('orders', 'orders_razorpay_payment_id_unique');
};
