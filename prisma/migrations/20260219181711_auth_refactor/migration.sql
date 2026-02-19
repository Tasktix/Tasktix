/*
  Warnings:

  - The primary key for the `ItemAssignee` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ListMember` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Session` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `dateExpire` on the `Session` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `dateCreated` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `dateSignedIn` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[token]` on the table `Session` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[displayUsername]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `expiresAt` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `token` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Item` DROP FOREIGN KEY `Item_parentId_fkey`;

-- DropForeignKey
ALTER TABLE `Item` DROP FOREIGN KEY `Item_sectionId_fkey`;

-- DropForeignKey
ALTER TABLE `ItemAssignee` DROP FOREIGN KEY `ItemAssignee_itemId_fkey`;

-- DropForeignKey
ALTER TABLE `ItemAssignee` DROP FOREIGN KEY `ItemAssignee_userId_fkey`;

-- DropForeignKey
ALTER TABLE `ListMember` DROP FOREIGN KEY `ListMember_listId_fkey`;

-- DropForeignKey
ALTER TABLE `ListMember` DROP FOREIGN KEY `ListMember_userId_fkey`;

-- DropForeignKey
ALTER TABLE `ListSection` DROP FOREIGN KEY `ListSection_listId_fkey`;

-- DropForeignKey
ALTER TABLE `Session` DROP FOREIGN KEY `Session_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Tag` DROP FOREIGN KEY `Tag_listId_fkey`;

-- AlterTable
ALTER TABLE `Item` MODIFY `parentId` VARCHAR(191) NULL,
    MODIFY `sectionId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `ItemAssignee` DROP PRIMARY KEY,
    MODIFY `userId` VARCHAR(191) NOT NULL,
    MODIFY `itemId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`userId`, `itemId`);

-- AlterTable
ALTER TABLE `ListMember` DROP PRIMARY KEY,
    MODIFY `userId` VARCHAR(191) NOT NULL,
    MODIFY `listId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`userId`, `listId`);

-- AlterTable
ALTER TABLE `ListSection` MODIFY `listId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Session` DROP PRIMARY KEY,
    DROP COLUMN `dateExpire`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `expiresAt` DATETIME(3) NOT NULL,
    ADD COLUMN `ipAddress` TEXT NULL,
    ADD COLUMN `token` VARCHAR(191) NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `userAgent` TEXT NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `userId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Tag` MODIFY `listId` VARCHAR(191) NOT NULL;

-- Need To Rename Column Before User Table Alterations to persist name change
ALTER TABLE `User`
RENAME COLUMN `password` TO `legacyPassword`;

-- AlterTable
ALTER TABLE `User` DROP PRIMARY KEY,
    DROP COLUMN `dateCreated`,
    DROP COLUMN `dateSignedIn`,
    ADD COLUMN `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `displayUsername` VARCHAR(32) NULL,
    ADD COLUMN `emailVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `image` TEXT NULL,
    ADD COLUMN `name` VARCHAR(32) NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY COLUMN `legacyPassword` CHAR(205) NULL DEFAULT NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `username` VARCHAR(32) NULL,
    ADD PRIMARY KEY (`id`);

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

    INDEX `Account_userId_idx`(`userId`),
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

-- CreateIndex
CREATE UNIQUE INDEX `Session_token_key` ON `Session`(`token`);

-- CreateIndex
CREATE UNIQUE INDEX `User_name_key` ON `User`(`name`);

-- CreateIndex
CREATE UNIQUE INDEX `User_displayUsername_key` ON `User`(`displayUsername`);

-- AddForeignKey
ALTER TABLE `ListSection` ADD CONSTRAINT `ListSection_listId_fkey` FOREIGN KEY (`listId`) REFERENCES `List`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item` ADD CONSTRAINT `Item_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `Item`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item` ADD CONSTRAINT `Item_sectionId_fkey` FOREIGN KEY (`sectionId`) REFERENCES `ListSection`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tag` ADD CONSTRAINT `Tag_listId_fkey` FOREIGN KEY (`listId`) REFERENCES `List`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ListMember` ADD CONSTRAINT `ListMember_listId_fkey` FOREIGN KEY (`listId`) REFERENCES `List`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ListMember` ADD CONSTRAINT `ListMember_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ItemAssignee` ADD CONSTRAINT `ItemAssignee_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Item`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ItemAssignee` ADD CONSTRAINT `ItemAssignee_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Account` ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
