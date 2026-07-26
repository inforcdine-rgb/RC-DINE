CREATE TABLE IF NOT EXISTS `subscriptionPlans` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(40) NOT NULL,
    `name` VARCHAR(80) NOT NULL,
    `subtitle` VARCHAR(120) NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `days` INT NOT NULL,
    `features` JSON NOT NULL,
    `isPopular` TINYINT(1) NOT NULL DEFAULT 0,
    `isActive` TINYINT(1) NOT NULL DEFAULT 1,
    `displayOrder` INT NOT NULL DEFAULT 0,
    `buttonText` VARCHAR(80) NULL,
    `createdAt` DATETIME NOT NULL,
    `updatedAt` DATETIME NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `subscription_plans_code_unique` (`code`)
);

INSERT INTO `subscriptionPlans`
(`code`, `name`, `subtitle`, `amount`, `days`, `features`, `isPopular`, `isActive`, `displayOrder`, `buttonText`, `createdAt`, `updatedAt`)
VALUES
('MONTHLY', 'Basic', 'Monthly', 1000, 30, JSON_ARRAY('Online menu ordering','Live order notifications','Business statistics dashboard','Customer feedback','Online payment integration','E-Invoice for orders'), 0, 1, 1, 'Choose Basic', NOW(), NOW()),
('HALF_YEARLY', 'Pro', '6 Months', 5500, 180, JSON_ARRAY('Online menu ordering','Live order notifications','Business statistics dashboard','Customer feedback','Online payment integration','E-Invoice for orders'), 1, 1, 2, 'Choose Pro', NOW(), NOW()),
('YEARLY', 'Premium', 'Yearly', 11000, 365, JSON_ARRAY('Online menu ordering','Live order notifications','Business statistics dashboard','Customer feedback','Online payment integration','E-Invoice for orders'), 0, 1, 3, 'Choose Premium', NOW(), NOW())
ON DUPLICATE KEY UPDATE `updatedAt` = VALUES(`updatedAt`);
