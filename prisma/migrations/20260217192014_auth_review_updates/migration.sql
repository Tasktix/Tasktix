/*
  Warnings:

  - The primary key for the `ListMember` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ItemAssignee` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE `ListMember` DROP FOREIGN KEY `ListMember_userId_fkey`;

-- AlterTable
ALTER TABLE `ListMember` DROP PRIMARY KEY,
    MODIFY `userId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`userId`, `listId`);

-- AddForeignKey
ALTER TABLE `ListMember` ADD CONSTRAINT `ListMember_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE `ItemAssignee` DROP FOREIGN KEY `ItemAssignee_userId_fkey`;

-- AlterTable
ALTER TABLE `ItemAssignee` DROP PRIMARY KEY,
    MODIFY `userId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`userId`, `itemId`);

-- AddForeignKey
ALTER TABLE `ItemAssignee` ADD CONSTRAINT `ItemAssignee_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE `Item` DROP FOREIGN KEY `Item_parentId_fkey`;

-- DropForeignKey
ALTER TABLE `Item` DROP FOREIGN KEY `Item_sectionId_fkey`;

-- DropForeignKey
ALTER TABLE `ItemAssignee` DROP FOREIGN KEY `ItemAssignee_itemId_fkey`;

-- DropForeignKey
ALTER TABLE `ListMember` DROP FOREIGN KEY `ListMember_listId_fkey`;

-- DropForeignKey
ALTER TABLE `ListSection` DROP FOREIGN KEY `ListSection_listId_fkey`;

-- DropForeignKey
ALTER TABLE `Tag` DROP FOREIGN KEY `Tag_listId_fkey`;

-- AlterTable
ALTER TABLE `Item` MODIFY `parentId` VARCHAR(191) NULL,
    MODIFY `sectionId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `ItemAssignee` DROP PRIMARY KEY,
    MODIFY `itemId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`userId`, `itemId`);

-- AlterTable
ALTER TABLE `ListMember` DROP PRIMARY KEY,
    MODIFY `listId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`userId`, `listId`);

-- AlterTable
ALTER TABLE `ListSection` MODIFY `listId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Tag` MODIFY `listId` VARCHAR(191) NOT NULL;

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
ALTER TABLE `ItemAssignee` ADD CONSTRAINT `ItemAssignee_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Item`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
