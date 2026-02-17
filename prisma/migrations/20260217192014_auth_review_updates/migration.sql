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
