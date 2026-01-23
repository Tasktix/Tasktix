-- AlterTable
ALTER TABLE `User` ADD COLUMN `displayUsername` VARCHAR(32) UNIQUE NULL,
    ADD COLUMN `username` VARCHAR(32) UNIQUE NULL;

UPDATE `User`
SET `username` = `name`, `displayUsername` = `name`;