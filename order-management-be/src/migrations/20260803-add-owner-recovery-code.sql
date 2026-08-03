-- OWNER recovery-code password reset support.
-- recoveryCodeHash is nullable so existing owners can log in and complete
-- mandatory recovery-code setup after authentication.
ALTER TABLE `users`
    ADD COLUMN IF NOT EXISTS `recoveryCodeHash` VARCHAR(255) NULL,
    ADD COLUMN IF NOT EXISTS `recoveryCodeFailedAttempts` INT UNSIGNED NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS `recoveryCodeLockedUntil` DATETIME NULL,
    ADD COLUMN IF NOT EXISTS `passwordChangedAt` DATETIME NULL,
    ADD COLUMN IF NOT EXISTS `tokenVersion` INT UNSIGNED NOT NULL DEFAULT 0;
