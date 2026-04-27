/*
  Warnings:

  - The primary key for the `ItemAssignee` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `listId` to the `ItemAssignee` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `ItemAssignee` DROP FOREIGN KEY `ItemAssignee_userId_fkey`;

-- AlterTable
ALTER TABLE `ItemAssignee` DROP PRIMARY KEY,
    ADD COLUMN `listId` CHAR(16) NULL,
    ADD PRIMARY KEY (`userId`, `listId`, `itemId`);

UPDATE `ItemAssignee`
    INNER JOIN `Item` ON `ItemAssignee`.`itemId` = `Item`.`id`
    INNER JOIN `ListSection` ON `Item`.`sectionId` = `ListSection`.`id`
SET `ItemAssignee`.`listId` = `ListSection`.`listId`;

ALTER TABLE `ItemAssignee` MODIFY COLUMN `listId` CHAR(16) NOT NULL;

-- AddForeignKey
ALTER TABLE `ItemAssignee` ADD CONSTRAINT `ItemAssignee_userId_listId_fkey` FOREIGN KEY (`userId`, `listId`) REFERENCES `ListMember`(`userId`, `listId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ItemAssignee` ADD CONSTRAINT `ItemAssignee_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
