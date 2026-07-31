CREATE TABLE IF NOT EXISTS `sessionJoinRequests` (
    `id` VARCHAR(255) NOT NULL,
    `sessionId` VARCHAR(255) NOT NULL,
    `tableId` VARCHAR(255) NOT NULL,
    `customerId` VARCHAR(255) NULL,
    `mobileNumber` VARCHAR(20) NOT NULL,
    `status` ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `requestedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `expiresAt` DATETIME NOT NULL,
    `respondedAt` DATETIME NULL,
    `respondedByCustomerId` VARCHAR(255) NULL,
    `createdAt` DATETIME NOT NULL,
    `updatedAt` DATETIME NOT NULL,
    `deletedAt` DATETIME NULL,
    PRIMARY KEY (`id`),
    INDEX `idx_session_join_status_expiry` (`sessionId`, `status`, `expiresAt`),
    INDEX `idx_table_mobile_status` (`tableId`, `mobileNumber`, `status`),
    CONSTRAINT `fk_join_request_session`
        FOREIGN KEY (`sessionId`) REFERENCES `diningSessions` (`id`)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT `fk_join_request_table`
        FOREIGN KEY (`tableId`) REFERENCES `tables` (`id`)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT `fk_join_request_customer`
        FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT `fk_join_request_responder`
        FOREIGN KEY (`respondedByCustomerId`) REFERENCES `customers` (`id`)
        ON UPDATE CASCADE ON DELETE SET NULL
);
