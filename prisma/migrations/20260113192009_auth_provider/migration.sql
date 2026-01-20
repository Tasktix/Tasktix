/*
  Warnings:

  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - NOTE: This is safe to do so, as removing all stored session data will only force users to relogin, and 
    will not lose functionality
*/
-- DropForeignKey
ALTER TABLE `ItemAssignee` DROP FOREIGN KEY `ItemAssignee_userId_fkey`;

-- DropForeignKey
ALTER TABLE `ListMember` DROP FOREIGN KEY `ListMember_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Session` DROP FOREIGN KEY `Session_userId_fkey`;

-- DropTable
DROP TABLE `Session`;

-- Alteration to User Table
ALTER TABLE `User` 
RENAME COLUMN `username` TO `name`;

ALTER TABLE `User`
RENAME COLUMN `password` TO `legacyPassword`;

ALTER TABLE `User`
ADD `image` TEXT NULL;

ALTER TABLE `User`
ADD `emailVerified` BOOLEAN NOT NULL DEFAULT false; 

ALTER TABLE `User`
MODIFY COLUMN `legacyPassword` CHAR(205) NULL DEFAULT NULL;

ALTER TABLE `User`
ADD `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

ALTER TABLE `User`
DROP COLUMN `dateCreated`;

ALTER TABLE `User`
ADD `updatedAt` DATETIME(3) NOT NULL;

ALTER TABLE `User`
DROP COLUMN `dateSignedIn`;

ALTER TABLE `User` 
RENAME INDEX `User_username_key` TO `User_name_key`;


-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `ipAddress` TEXT NULL,
    `userAgent` TEXT NULL,
    `userId` VARCHAR(191) NOT NULL,

    INDEX `Session_userId_idx`(`userId`(191)),
    UNIQUE INDEX `Session_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Account` (
    `id` VARCHAR(191) NOT NULL,
    `accountId` TEXT NOT NULL,
    `providerId` TEXT NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `accessToken` TEXT NULL,
    `refreshToken` TEXT NULL,
    `idToken` TEXT NULL,
    `accessTokenExpiresAt` DATETIME(3) NULL,
    `refreshTokenExpiresAt` DATETIME(3) NULL,
    `scope` TEXT NULL,
    `password` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Account_userId_idx`(`userId`(191)),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Verification` (
    `id` VARCHAR(191) NOT NULL,
    `identifier` TEXT NOT NULL,
    `value` TEXT NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Verification_identifier_idx`(`identifier`(191)),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ListMember` ADD CONSTRAINT `ListMember_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ItemAssignee` ADD CONSTRAINT `ItemAssignee_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Account` ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
