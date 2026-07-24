import mysql2 from 'mysql2';
import { Sequelize } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import defineAssociations from '../api/models/associations.js';
import categoryModel from '../api/models/category.model.js';
import customerModel from '../api/models/customer.modal.js';
import customerOtpModel from '../api/models/customerOtp.model.js';
import diningSessionModel from '../api/models/diningSession.model.js';
import sessionJoinRequestModel from '../api/models/sessionJoinRequest.model.js';
import sessionMemberModel from '../api/models/sessionMember.model.js';
import hotelModel from '../api/models/hotel.model.js';
import hotelUserRelationModel from '../api/models/hotelUserRelation.model.js';
import inviteModel from '../api/models/invite.model.js';
import menuModel from '../api/models/menu.model.js';
import notificationModel from '../api/models/notification.model.js';
import openOrderItemModel from '../api/models/openOrderItem.model.js';
import openOrderModel from '../api/models/openOrder.model.js';
import orderModel from '../api/models/order.model.js';
import paymentGatewayEntitiesModel from '../api/models/paymentGatewayEntities.js';
import preferencesModel from '../api/models/preferences.model.js';
import pushSubscriptionsModel from '../api/models/pushSubscriptions.model.js';
import subscriptionModel from '../api/models/subscriptions.js';
import tableModel from '../api/models/table.model.js';
import userModel from '../api/models/user.model.js';
import { CustomError } from '../api/utils/common.js';
import { hashPassword } from '../api/utils/password.js';
import env from './env.js';
import logger from './logger.js';

const config = {
    host: env.db.host,
    dialect: env.db.dialect,
    dialectModule: mysql2,
    port: env.db.port,
    username: env.db.user,
    password: env.db.password,
    pool: {
        max: 3,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};

let sequelizeInstance = null;

export const db = {};

const createDatabase = async () => {
    try {
        logger('info', '🚀 Connecting to the database...');

        const createDbInstance = new Sequelize({
            ...config,
            logging: false
        });

        await createDbInstance.authenticate();

        logger(
            'info',
            '✅ Database connection authenticated successfully.'
        );

        logger('info', '🏗️ Creating database if not exists...');

        await createDbInstance.query(
            `CREATE DATABASE IF NOT EXISTS \`${env.db.name}\`;`
        );

        logger('info', '🏢 Database created successfully.');

        await createDbInstance.close();

        sequelizeInstance = new Sequelize({
            ...config,
            database: env.db.name,
            logging: false
        });

        return sequelizeInstance;
    } catch (error) {
        logger('error', `❌ Error creating database: ${error.message}`);

        throw CustomError(
            error.code || 500,
            error.message || 'Database connection failed'
        );
    }
};

const getSequelizeInstance = async () => {
    if (!sequelizeInstance) {
        sequelizeInstance = await createDatabase();
    }

    return sequelizeInstance;
};

const ensureAdminUser = async () => {
    if (!env.seedAdmin?.enabled) {
        logger(
            'info',
            'ℹ️ Admin seeding skipped. Set SEED_ADMIN=true only for first-time setup.'
        );

        return;
    }

    const adminEmail = env.seedAdmin.email;
    const adminPassword = env.seedAdmin.password;
    const adminPhone = env.seedAdmin.phone;

    if (!adminEmail || !adminPassword || adminPassword.length < 10) {
        logger(
            'warn',
            'Admin seeding skipped. ADMIN_EMAIL and a strong ADMIN_PASSWORD are required.'
        );

        return;
    }

    const existingAdmin = await db.users.findOne({
        where: {
            email: adminEmail
        }
    });

    if (existingAdmin) {
        logger(
            'info',
            'ℹ️ Seed admin already exists. Password was not reset automatically.'
        );

        return;
    }

    let phoneNumber = adminPhone;

    if (phoneNumber) {
        const existingPhone = await db.users.findOne({
            where: {
                phoneNumber
            }
        });

        if (existingPhone) {
            phoneNumber = `9${Date.now().toString().slice(-9)}`;
        }
    } else {
        phoneNumber = `9${Date.now().toString().slice(-9)}`;
    }

    try {
        await db.users.create({
            id: uuidv4(),
            firstName: env.seedAdmin.firstName || 'System',
            lastName: env.seedAdmin.lastName || 'Admin',
            email: adminEmail,
            phoneNumber,
            password: await hashPassword(adminPassword),
            status: 'ACTIVE',
            role: 'ADMIN'
        });

        logger('info', `✅ Seed admin user created: ${adminEmail}`);
    } catch (error) {
        logger(
            'error',
            `❌ Failed to create seed admin user: ${error.message}`
        );
    }
};

const defineModels = (sequelize) => {
    db.Sequelize = Sequelize;
    db.users = userModel(sequelize);
    db.invites = inviteModel(sequelize);
    db.hotel = hotelModel(sequelize);
    db.hotelUserRelation = hotelUserRelationModel(sequelize);
    db.tables = tableModel(sequelize);
    db.categories = categoryModel(sequelize);
    db.menu = menuModel(sequelize);
    db.preferences = preferencesModel(sequelize);
    db.customer = customerModel(sequelize);
    db.customerOtps = customerOtpModel(sequelize);
    db.diningSessions = diningSessionModel(sequelize);
    db.sessionMembers = sessionMemberModel(sequelize);
    db.sessionJoinRequests = sessionJoinRequestModel(sequelize);
    db.orders = orderModel(sequelize);
    db.openOrders = openOrderModel(sequelize);
    db.openOrderItems = openOrderItemModel(sequelize);
    db.pushSubscriptions = pushSubscriptionsModel(sequelize);
    db.notifications = notificationModel(sequelize);
    db.paymentGatewayEntities = paymentGatewayEntitiesModel(sequelize);
    db.subscriptions = subscriptionModel(sequelize);
};

const addOrModifyColumn = async ({
    sequelize,
    tableName,
    columnName,
    columnType
}) => {
    try {
        await sequelize.query(
            `ALTER TABLE \`${tableName}\`
             ADD COLUMN \`${columnName}\` ${columnType};`
        );

        logger(
            'info',
            `✅ Column ${columnName} added to ${tableName} table`
        );
    } catch (addError) {
        try {
            await sequelize.query(
                `ALTER TABLE \`${tableName}\`
                 MODIFY COLUMN \`${columnName}\` ${columnType};`
            );

            logger(
                'info',
                `✅ Column ${columnName} modified/exists in ${tableName} table`
            );
        } catch (modifyError) {
            logger(
                'error',
                `❌ Error preparing ${tableName}.${columnName}: ${modifyError.message}`
            );
        }
    }
};

const initDb = async () => {
    try {
        logger('info', '🚀 Initializing database...');

        const sequelize = await getSequelizeInstance();

        logger('info', '🛠️ Defining database models...');

        defineModels(sequelize);
        defineAssociations(db);

        logger('info', '🔄 Syncing models with database...');

        await sequelize.sync({
            force: false
        });

        const userColumns = [
            {
                name: 'trialStartAt',
                type: 'DATETIME NULL'
            },
            {
                name: 'trialEndAt',
                type: 'DATETIME NULL'
            },
            {
                name: 'subscriptionStartAt',
                type: 'DATETIME NULL'
            },
            {
                name: 'subscriptionEndAt',
                type: 'DATETIME NULL'
            },
            {
                name: 'subscriptionStatus',
                type: "VARCHAR(20) NOT NULL DEFAULT 'TRIAL'"
            },
            {
                name: 'subscriptionPlan',
                type: 'VARCHAR(50) NULL'
            },
            {
                name: 'razorpayOrderId',
                type: 'VARCHAR(255) NULL'
            },
            {
                name: 'razorpayPaymentId',
                type: 'VARCHAR(255) NULL'
            },
            {
                name: 'isBlocked',
                type: 'TINYINT(1) NOT NULL DEFAULT 0'
            }
        ];

        for (const column of userColumns) {
            await addOrModifyColumn({
                sequelize,
                tableName: 'users',
                columnName: column.name,
                columnType: column.type
            });
        }

        const hotelColumns = [
            {
                name: 'razorpayKeyId',
                type: 'VARCHAR(255) NULL'
            },
            {
                name: 'razorpayKeySecret',
                type: 'TEXT NULL'
            },
            {
                name: 'razorpayMerchantName',
                type: 'VARCHAR(255) NULL'
            },
            {
                name: 'razorpayMerchantEmail',
                type: 'VARCHAR(255) NULL'
            },
            {
                name: 'razorpayMerchantPhone',
                type: 'VARCHAR(50) NULL'
            },
            {
                name: 'paymentEnabled',
                type: 'TINYINT(1) NOT NULL DEFAULT 0'
            },
            {
                name: 'gstNumber',
                type: 'VARCHAR(30) NULL'
            }
        ];

        for (const column of hotelColumns) {
            await addOrModifyColumn({
                sequelize,
                tableName: 'hotels',
                columnName: column.name,
                columnType: column.type
            });
        }

        const orderBaseColumns = [
            {
                name: 'hotelId',
                type: 'VARCHAR(255) NULL'
            },
            {
                name: 'tableId',
                type: 'VARCHAR(255) NULL'
            },
            {
                name: 'subtotalAmount',
                type: 'DECIMAL(10, 2) NULL'
            },
            {
                name: 'cgstAmount',
                type: 'DECIMAL(10, 2) NULL'
            },
            {
                name: 'sgstAmount',
                type: 'DECIMAL(10, 2) NULL'
            },
            {
                name: 'tipAmount',
                type: 'DECIMAL(10, 2) NULL DEFAULT 0'
            },
            {
                name: 'finalAmount',
                type: 'DECIMAL(10, 2) NULL'
            },
            {
                name: 'orderNumber',
                type: 'VARCHAR(100) NULL'
            },
            {
                name: 'paymentMethod',
                type: "ENUM('CASH','UPI','CARD') NULL"
            },
            {
                name: 'cashReceived',
                type: 'DECIMAL(10, 2) NOT NULL DEFAULT 0'
            },
            {
                name: 'changeAmount',
                type: 'DECIMAL(10, 2) NOT NULL DEFAULT 0'
            },
            {
                name: 'paymentStatus',
                type: "ENUM('PAID','UNPAID') NOT NULL DEFAULT 'UNPAID'"
            }
        ];

        for (const column of orderBaseColumns) {
            await addOrModifyColumn({
                sequelize,
                tableName: 'orders',
                columnName: column.name,
                columnType: column.type
            });
        }

        const decimalOrderColumns = [
            {
                name: 'price',
                definition: 'DECIMAL(10, 2) NOT NULL'
            },
            {
                name: 'subtotalAmount',
                definition: 'DECIMAL(10, 2) NULL'
            },
            {
                name: 'cgstAmount',
                definition: 'DECIMAL(10, 2) NULL'
            },
            {
                name: 'sgstAmount',
                definition: 'DECIMAL(10, 2) NULL'
            },
            {
                name: 'tipAmount',
                definition: 'DECIMAL(10, 2) NULL DEFAULT 0'
            },
            {
                name: 'finalAmount',
                definition: 'DECIMAL(10, 2) NULL'
            },
            {
                name: 'cashReceived',
                definition: 'DECIMAL(10, 2) NOT NULL DEFAULT 0'
            },
            {
                name: 'changeAmount',
                definition: 'DECIMAL(10, 2) NOT NULL DEFAULT 0'
            }
        ];

        for (const column of decimalOrderColumns) {
            try {
                await sequelize.query(
                    `ALTER TABLE \`orders\`
                     MODIFY COLUMN \`${column.name}\`
                     ${column.definition};`
                );

                logger(
                    'info',
                    `✅ Column orders.${column.name} converted to ${column.definition}`
                );
            } catch (error) {
                logger(
                    'error',
                    `❌ Error converting orders.${column.name}: ${error.message}`
                );
            }
        }

        await addOrModifyColumn({
            sequelize,
            tableName: 'tables',
            columnName: 'tableName',
            columnType: 'VARCHAR(100) NULL'
        });

        try {
            await sequelize.query(
                `ALTER TABLE \`users\`
                 MODIFY COLUMN \`role\`
                 ENUM('OWNER','MANAGER','ADMIN') NOT NULL;`
            );

            logger(
                'info',
                '✅ User role ENUM updated to include ADMIN'
            );
        } catch (error) {
            logger(
                'error',
                `❌ Error updating user role enum: ${error.message}`
            );
        }

        try {
            await sequelize.query(
                `ALTER TABLE \`orders\`
                 DROP INDEX \`orderNumber\`;`
            );

            logger(
                'info',
                '✅ Removed unique index from orders.orderNumber'
            );
        } catch (error) {
            logger(
                'info',
                'ℹ️ orders.orderNumber unique index does not exist or was already removed'
            );
        }

        await addOrModifyColumn({
            sequelize,
            tableName: 'menus',
            columnName: 'image',
            columnType: 'VARCHAR(500) NULL'
        });

        await addOrModifyColumn({
            sequelize,
            tableName: 'menus',
            columnName: 'categoryId',
            columnType: 'VARCHAR(255) NULL'
        });

        await addOrModifyColumn({
            sequelize,
            tableName: 'menus',
            columnName: 'isCombo',
            columnType: 'TINYINT(1) NOT NULL DEFAULT 0'
        });

        await addOrModifyColumn({
            sequelize,
            tableName: 'menus',
            columnName: 'comboItems',
            columnType: 'JSON NULL'
        });

        const pushSubscriptionColumns = [
            { name: 'phoneNumber', type: 'VARCHAR(20) NULL' },
            { name: 'deviceId', type: 'VARCHAR(255) NULL' },
            { name: 'endpointHash', type: 'VARCHAR(64) NULL' },
            { name: 'platform', type: 'VARCHAR(50) NULL' },
            { name: 'lastSeenAt', type: 'DATETIME NULL' }
        ];

        for (const column of pushSubscriptionColumns) {
            await addOrModifyColumn({
                sequelize,
                tableName: 'pushSubscriptions',
                columnName: column.name,
                columnType: column.type
            });
        }

        try {
            await sequelize.query(`
                UPDATE \`pushSubscriptions\`
                SET
                    \`endpointHash\` = COALESCE(\`endpointHash\`, SHA2(\`endpoint\`, 256)),
                    \`deviceId\` = COALESCE(\`deviceId\`, LEFT(SHA2(\`endpoint\`, 256), 32)),
                    \`lastSeenAt\` = COALESCE(\`lastSeenAt\`, \`updatedAt\`, NOW());
            `);
            await sequelize.query(`
                ALTER TABLE \`pushSubscriptions\`
                MODIFY COLUMN \`endpointHash\` VARCHAR(64) NOT NULL,
                MODIFY COLUMN \`deviceId\` VARCHAR(255) NOT NULL,
                MODIFY COLUMN \`lastSeenAt\` DATETIME NOT NULL;
            `);
        } catch (error) {
            logger('error', `âŒ Error normalizing push subscriptions: ${error.message}`);
        }

        try {
            await sequelize.query(
                'CREATE UNIQUE INDEX `push_subscriptions_endpoint_hash` ON `pushSubscriptions` (`endpointHash`);'
            );
        } catch (_error) {
            logger('info', 'â„¹ï¸ Push subscription endpoint index already exists');
        }

        const pushSubscriptionIndexes = [
            'CREATE INDEX `push_subscriptions_user` ON `pushSubscriptions` (`userId`)',
            'CREATE INDEX `push_subscriptions_customer` ON `pushSubscriptions` (`customerId`)',
            'CREATE INDEX `push_subscriptions_phone` ON `pushSubscriptions` (`phoneNumber`)',
            'CREATE INDEX `push_subscriptions_device` ON `pushSubscriptions` (`deviceId`)'
        ];

        for (const statement of pushSubscriptionIndexes) {
            try {
                await sequelize.query(`${statement};`);
            } catch (_error) {
                // Index already exists on an initialized database.
            }
        }

        const notificationColumns = [
            { name: 'customerId', type: 'VARCHAR(255) NULL' },
            { name: 'phoneNumber', type: 'VARCHAR(20) NULL' },
            { name: 'type', type: "VARCHAR(50) NOT NULL DEFAULT 'UPDATE'" },
            { name: 'category', type: "VARCHAR(50) NOT NULL DEFAULT 'GENERAL'" },
            { name: 'entityId', type: 'VARCHAR(255) NULL' },
            { name: 'dedupeKey', type: 'VARCHAR(255) NULL' },
            { name: 'payload', type: 'JSON NULL' },
            { name: 'readAt', type: 'DATETIME NULL' }
        ];

        for (const column of notificationColumns) {
            await addOrModifyColumn({
                sequelize,
                tableName: 'notifications',
                columnName: column.name,
                columnType: column.type
            });
        }

        await addOrModifyColumn({
            sequelize,
            tableName: 'notifications',
            columnName: 'userId',
            columnType: 'VARCHAR(255) NULL'
        });

        const notificationIndexes = [
            'CREATE INDEX `notifications_user_status_created` ON `notifications` (`userId`, `status`, `createdAt`)',
            'CREATE INDEX `notifications_customer_status_created` ON `notifications` (`customerId`, `status`, `createdAt`)',
            'CREATE INDEX `notifications_phone_status_created` ON `notifications` (`phoneNumber`, `status`, `createdAt`)',
            'CREATE INDEX `notifications_dedupe_key` ON `notifications` (`dedupeKey`)'
        ];

        for (const statement of notificationIndexes) {
            try {
                await sequelize.query(`${statement};`);
            } catch (_error) {
                // Index already exists on an initialized database.
            }
        }

        await ensureAdminUser();

        try {
            await sequelize.query(`
                UPDATE \`orders\`
                SET
                    \`subtotalAmount\` = COALESCE(
                        \`subtotalAmount\`,
                        \`price\`
                    ),
                    \`cgstAmount\` = COALESCE(
                        \`cgstAmount\`,
                        ROUND(\`price\` * 0.025, 2)
                    ),
                    \`sgstAmount\` = COALESCE(
                        \`sgstAmount\`,
                        ROUND(\`price\` * 0.025, 2)
                    ),
                    \`tipAmount\` = COALESCE(
                        \`tipAmount\`,
                        0
                    ),
                    \`finalAmount\` = COALESCE(
                        \`finalAmount\`,
                        ROUND(
                            \`price\`
                            + ROUND(\`price\` * 0.025, 2)
                            + ROUND(\`price\` * 0.025, 2),
                            2
                        )
                    )
                WHERE
                    \`subtotalAmount\` IS NULL
                    OR \`cgstAmount\` IS NULL
                    OR \`sgstAmount\` IS NULL
                    OR \`finalAmount\` IS NULL;
            `);

            logger(
                'info',
                '✅ Existing orders populated with subtotal and GST amounts'
            );
        } catch (error) {
            logger(
                'error',
                `❌ Error populating existing orders with GST: ${error.message}`
            );
        }

        try {
            await sequelize.query(`
                UPDATE \`orders\`
                SET
                    \`paymentStatus\` = CASE
                        WHEN UPPER(COALESCE(\`status\`, '')) = 'COMPLETED'
                            THEN 'PAID'
                        ELSE COALESCE(\`paymentStatus\`, 'UNPAID')
                    END,
                    \`cashReceived\` = COALESCE(\`cashReceived\`, 0),
                    \`changeAmount\` = COALESCE(\`changeAmount\`, 0);
            `);

            logger(
                'info',
                '✅ Existing order payment values normalized'
            );
        } catch (error) {
            logger(
                'error',
                `❌ Error normalizing payment values: ${error.message}`
            );
        }

        logger(
            'info',
            '🎉 Database initialization completed successfully.'
        );
    } catch (error) {
        logger(
            'error',
            `❌ Error initializing database: ${error.message}`
        );

        throw CustomError(
            error.code || 500,
            error.message || 'Database initialization failed'
        );
    }
};

export default initDb;
