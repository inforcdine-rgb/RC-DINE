export async function up(queryInterface, Sequelize) {
    await queryInterface.addColumn('hotels', 'printerWidth', {
        type: Sequelize.ENUM('58', '80', 'auto'),
        allowNull: false,
        defaultValue: '58'
    });
    await queryInterface.addColumn('hotels', 'receiptFooterMessage', {
        type: Sequelize.STRING(120),
        allowNull: false,
        defaultValue: 'Thank you! Visit again.'
    });
}

export async function down(queryInterface) {
    await queryInterface.removeColumn('hotels', 'receiptFooterMessage');
    await queryInterface.removeColumn('hotels', 'printerWidth');
}
