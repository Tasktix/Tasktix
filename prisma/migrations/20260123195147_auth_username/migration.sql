-- AlterTable
ALTER TABLE `User` ADD COLUMN `displayUsername` VARCHAR(32) UNIQUE NULL,
    ADD COLUMN `username` VARCHAR(32) UNIQUE NULL;

UPDATE `User`
SET `username` = `name`, `displayUsername` = `name`;

-- RedefineIndex
CREATE UNIQUE INDEX `User_displayUsername_key` ON `User`(`displayUsername`);
DROP INDEX `displayUsername` ON `User`;

-- RedefineIndex
CREATE UNIQUE INDEX `User_username_key` ON `User`(`username`);
DROP INDEX `username` ON `User`;
