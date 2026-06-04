/*
  Warnings:

  - A unique constraint covering the columns `[id,listId]` on the table `Item` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,listId]` on the table `ListSection` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `listId` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Item` DROP FOREIGN KEY `Item_sectionId_fkey`;

-- DropForeignKey
ALTER TABLE `ItemAssignee` DROP FOREIGN KEY `ItemAssignee_itemId_fkey`;

-- AlterTable
ALTER TABLE `Item` ADD COLUMN `listId` CHAR(16) NULL;

UPDATE `Item`
    INNER JOIN `ListSection` ON `Item`.`sectionId` = `ListSection`.`id`
SET `Item`.`listId` = `ListSection`.`listId`;

ALTER TABLE `Item` MODIFY COLUMN `listId` CHAR(16) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Item_id_listId_key` ON `Item`(`id`, `listId`);

-- CreateIndex
CREATE UNIQUE INDEX `ListSection_id_listId_key` ON `ListSection`(`id`, `listId`);

-- AddForeignKey
ALTER TABLE `Item` ADD CONSTRAINT `Item_sectionId_listId_fkey` FOREIGN KEY (`sectionId`, `listId`) REFERENCES `ListSection`(`id`, `listId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ItemAssignee` ADD CONSTRAINT `ItemAssignee_itemId_listId_fkey` FOREIGN KEY (`itemId`, `listId`) REFERENCES `Item`(`id`, `listId`) ON DELETE CASCADE ON UPDATE CASCADE;
