function defineAssociations(db) {
    // Defaine all tables
    const {
        users,
        invites,
        hotel,
        hotelUserRelation,
        tables,
        categories,
        menu,
        preferences,
        customer,
        orders,
        openOrders,
        openOrderItems,
        pushSubscriptions,
        notifications,
        paymentGatewayEntities,
        subscriptions,
        diningSessions,
        sessionJoinRequests,
        sessionMembers
    } = db;

    // user and invite associations
    users.hasOne(invites, { foreignKey: 'userId' });
    invites.belongsTo(users, { foreignKey: 'userId' });

    // hotel user relations
    users.hasMany(hotelUserRelation, { foreignKey: 'userId' });
    hotelUserRelation.belongsTo(users, { foreignKey: 'userId' });

    hotel.hasMany(hotelUserRelation, { foreignKey: 'hotelId' });
    hotelUserRelation.belongsTo(hotel, { foreignKey: 'hotelId' });

    // hotel and tables associations
    hotel.hasMany(tables, { foreignKey: 'hotelId' });
    tables.belongsTo(hotel, { foreignKey: 'hotelId' });

    // hotel categories relation
    hotel.hasMany(categories, { foreignKey: 'hotelId' });
    categories.belongsTo(hotel, { foreignKey: 'hotelId' });

    // menu categories relation
    categories.hasMany(menu, { foreignKey: 'categoryId' });
    menu.belongsTo(categories, { foreignKey: 'categoryId' });

    hotel.hasMany(menu, { foreignKey: 'hotelId' });
    menu.belongsTo(hotel, { foreignKey: 'hotelId' });

    // user and preferences relation
    users.hasOne(preferences, { foreignKey: 'userId' });
    preferences.belongsTo(users, { foreignKey: 'userId' });

    // hotel and customer relation
    hotel.hasMany(customer, { foreignKey: 'hotelId' });
    customer.belongsTo(hotel, { foreignKey: 'hotelId' });

    // table and customer relation
    customer.hasOne(tables, { foreignKey: 'customerId' });
    tables.belongsTo(customer, { foreignKey: 'customerId' });

    // order and customer relation
    customer.hasMany(orders, { foreignKey: 'customerId' });
    orders.belongsTo(customer, { foreignKey: 'customerId' });

    // order and menu relation
    menu.hasMany(orders, { foreignKey: 'menuId' });
    orders.belongsTo(menu, { foreignKey: 'menuId' });

    // order and hotel relation
    hotel.hasMany(orders, { foreignKey: 'hotelId' });
    orders.belongsTo(hotel, { foreignKey: 'hotelId' });

    // order and table relation
    tables.hasMany(orders, { foreignKey: 'tableId' });
    orders.belongsTo(tables, { foreignKey: 'tableId' });

    // Manager POS open order header and append-only item relations.
    hotel.hasMany(openOrders, { foreignKey: 'hotelId', as: 'openOrders' });
    openOrders.belongsTo(hotel, { foreignKey: 'hotelId', as: 'hotel' });

    tables.hasMany(openOrders, { foreignKey: 'tableId', as: 'openOrders' });
    openOrders.belongsTo(tables, { foreignKey: 'tableId', as: 'table' });

    users.hasMany(openOrders, { foreignKey: 'createdByUserId', as: 'createdOpenOrders' });
    openOrders.belongsTo(users, { foreignKey: 'createdByUserId', as: 'createdBy' });
    users.hasMany(openOrders, { foreignKey: 'completedByUserId', as: 'completedOpenOrders' });
    openOrders.belongsTo(users, { foreignKey: 'completedByUserId', as: 'completedBy' });

    openOrders.hasMany(openOrderItems, {
        foreignKey: 'openOrderId',
        as: 'items',
        onDelete: 'CASCADE'
    });
    openOrderItems.belongsTo(openOrders, { foreignKey: 'openOrderId', as: 'openOrder' });

    menu.hasMany(openOrderItems, { foreignKey: 'menuId', as: 'openOrderItems' });
    openOrderItems.belongsTo(menu, { foreignKey: 'menuId', as: 'menu' });

    users.hasMany(openOrderItems, { foreignKey: 'addedByUserId', as: 'addedOpenOrderItems' });
    openOrderItems.belongsTo(users, { foreignKey: 'addedByUserId', as: 'addedBy' });

    // RC Session relations
    hotel.hasMany(diningSessions, { foreignKey: 'hotelId' });
    diningSessions.belongsTo(hotel, { foreignKey: 'hotelId' });

    tables.hasMany(diningSessions, { foreignKey: 'tableId' });
    diningSessions.belongsTo(tables, { foreignKey: 'tableId' });

    customer.hasMany(diningSessions, { foreignKey: 'ownerCustomerId' });
    diningSessions.belongsTo(customer, {
        foreignKey: 'ownerCustomerId',
        as: 'ownerCustomer'
    });

    users.hasMany(diningSessions, { foreignKey: 'closedByUserId' });
    diningSessions.belongsTo(users, {
        foreignKey: 'closedByUserId',
        as: 'closedByUser'
    });

    diningSessions.hasMany(sessionMembers, { foreignKey: 'sessionId' });
    sessionMembers.belongsTo(diningSessions, { foreignKey: 'sessionId' });

    customer.hasMany(sessionMembers, { foreignKey: 'customerId' });
    sessionMembers.belongsTo(customer, { foreignKey: 'customerId' });

    diningSessions.hasMany(sessionJoinRequests, { foreignKey: 'sessionId' });
    sessionJoinRequests.belongsTo(diningSessions, { foreignKey: 'sessionId' });

    tables.hasMany(sessionJoinRequests, { foreignKey: 'tableId' });
    sessionJoinRequests.belongsTo(tables, { foreignKey: 'tableId' });

    customer.hasMany(sessionJoinRequests, {
        foreignKey: 'customerId',
        as: 'requestedJoinRequests'
    });
    sessionJoinRequests.belongsTo(customer, {
        foreignKey: 'customerId',
        as: 'requestingCustomer'
    });

    customer.hasMany(sessionJoinRequests, {
        foreignKey: 'respondedByCustomerId',
        as: 'respondedJoinRequests'
    });
    sessionJoinRequests.belongsTo(customer, {
        foreignKey: 'respondedByCustomerId',
        as: 'respondingCustomer'
    });

    diningSessions.hasMany(orders, { foreignKey: 'sessionId' });
    orders.belongsTo(diningSessions, { foreignKey: 'sessionId' });

    users.hasMany(pushSubscriptions, { foreignKey: 'userId' });
    pushSubscriptions.belongsTo(users, { foreignKey: 'userId' });

    customer.hasMany(pushSubscriptions, { foreignKey: 'customerId' });
    pushSubscriptions.belongsTo(customer, { foreignKey: 'customerId' });

    // notification and user relation
    users.hasMany(notifications, { foreignKey: 'userId' });
    notifications.belongsTo(users, { foreignKey: 'userId' });

    customer.hasMany(notifications, { foreignKey: 'customerId' });
    notifications.belongsTo(customer, { foreignKey: 'customerId' });

    // paymentGatewayEntities and user relation
    users.hasOne(paymentGatewayEntities, { foreignKey: 'userId' });
    paymentGatewayEntities.belongsTo(users, { foreignKey: 'userId' });

    // notification and user relation
    hotel.hasOne(subscriptions, { foreignKey: 'hotelId' });
    subscriptions.belongsTo(hotel, { foreignKey: 'hotelId' });
}

export default defineAssociations;
