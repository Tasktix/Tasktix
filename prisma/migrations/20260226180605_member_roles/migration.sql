/*
  Warnings:

  - You are about to drop the column `canAdd` on the `ListMember` table. All the data in the column will be lost.
  - You are about to drop the column `canAssign` on the `ListMember` table. All the data in the column will be lost.
  - You are about to drop the column `canComplete` on the `ListMember` table. All the data in the column will be lost.
  - You are about to drop the column `canRemove` on the `ListMember` table. All the data in the column will be lost.
  - Added the required column `roleId` to the `ListMember` table without a default value. This is not possible if the table is not empty.

*/

-- CreateTable
CREATE TABLE `MemberRole` (
    `id` CHAR(16) NOT NULL,
    `name` VARCHAR(32) NOT NULL,
    `description` VARCHAR(64) NOT NULL,
    `canAddItems` BOOLEAN NOT NULL,
    `canUpdateItems` BOOLEAN NOT NULL,
    `canManageItems` BOOLEAN NOT NULL,
    `canManageTags` BOOLEAN NOT NULL,
    `canManageAssignees` BOOLEAN NOT NULL,
    `canManageMembers` BOOLEAN NOT NULL,
    `canUpdateList` BOOLEAN NOT NULL,
    `canManageList` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add role to default current members to
INSERT INTO `MemberRole` (
    `id`,
    `name`,
    `description`,
    `canAddItems`,
    `canUpdateItems`,
    `canManageItems`,
    `canManageTags`,
    `canManageAssignees`,
    `canManageMembers`,
    `canUpdateList`,
    `canManageList`
) VALUES (
    'yZW3BwhhtgSQ7zhb',
    'Admin',
    'Full access, including destructive actions',
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    TRUE
);

-- AlterTable
ALTER TABLE `ListMember` DROP COLUMN `canAdd`,
    DROP COLUMN `canAssign`,
    DROP COLUMN `canComplete`,
    DROP COLUMN `canRemove`,
    ADD COLUMN `roleId` CHAR(16) NOT NULL DEFAULT 'yZW3BwhhtgSQ7zhb',
    ALTER COLUMN `roleId` DROP DEFAULT;

-- AddForeignKey
ALTER TABLE `ListMember` ADD CONSTRAINT `ListMember_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `MemberRole`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
