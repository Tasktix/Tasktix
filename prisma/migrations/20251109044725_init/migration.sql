-- CreateTable
CREATE TABLE `User` (
    `id` CHAR(16) NOT NULL,
    `username` VARCHAR(32) NOT NULL,
    `email` VARCHAR(128) NOT NULL,
    `password` CHAR(205) NOT NULL,
    `color` ENUM('Pink', 'Red', 'Orange', 'Amber', 'Yellow', 'Lime', 'Green', 'Emerald', 'Cyan', 'Blue', 'Violet') NOT NULL,
    `dateCreated` DATETIME(0) NOT NULL,
    `dateSignedIn` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `User_username_key`(`username`),
    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` CHAR(128) NOT NULL,
    `userId` CHAR(16) NOT NULL,
    `dateExpire` DATETIME(0) NOT NULL,

    INDEX `Session_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `List` (
    `id` CHAR(16) NOT NULL,
    `name` VARCHAR(64) NOT NULL,
    `color` ENUM('Pink', 'Red', 'Orange', 'Amber', 'Yellow', 'Lime', 'Green', 'Emerald', 'Cyan', 'Blue', 'Violet') NOT NULL,
    `description` TEXT NULL,
    `hasTimeTracking` BOOLEAN NOT NULL DEFAULT true,
    `hasDueDates` BOOLEAN NOT NULL DEFAULT true,
    `isAutoOrdered` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ListSection` (
    `id` CHAR(16) NOT NULL,
    `listId` CHAR(16) NOT NULL,
    `name` VARCHAR(64) NOT NULL,

    INDEX `ListSection_listId_idx`(`listId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Item` (
    `id` CHAR(16) NOT NULL,
    `name` VARCHAR(128) NOT NULL,
    `status` ENUM('Unstarted', 'In_Progress', 'Paused', 'Completed') NOT NULL DEFAULT 'Unstarted',
    `priority` ENUM('High', 'Medium', 'Low') NOT NULL DEFAULT 'Low',
    `isUnclear` BOOLEAN NOT NULL DEFAULT false,
    `expectedMs` INTEGER NULL,
    `elapsedMs` INTEGER NOT NULL DEFAULT 0,
    `parentId` CHAR(16) NULL,
    `sectionId` CHAR(16) NOT NULL,
    `sectionIndex` INTEGER NOT NULL DEFAULT 0,
    `dateCreated` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `dateDue` DATETIME(0) NULL,
    `dateStarted` DATETIME(0) NULL,
    `dateCompleted` DATETIME(0) NULL,

    INDEX `Item_sectionId_idx`(`sectionId`),
    INDEX `Item_parentId_idx`(`parentId`),
    UNIQUE INDEX `Item_sectionId_parentId_sectionIndex_key`(`sectionId`, `parentId`, `sectionIndex`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tag` (
    `id` CHAR(16) NOT NULL,
    `name` VARCHAR(32) NOT NULL,
    `color` ENUM('Pink', 'Red', 'Orange', 'Amber', 'Yellow', 'Lime', 'Green', 'Emerald', 'Cyan', 'Blue', 'Violet') NOT NULL,
    `listId` CHAR(16) NOT NULL,

    INDEX `Tag_listId_idx`(`listId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ListMember` (
    `userId` CHAR(16) NOT NULL,
    `listId` CHAR(16) NOT NULL,
    `canAdd` BOOLEAN NOT NULL DEFAULT false,
    `canRemove` BOOLEAN NOT NULL DEFAULT false,
    `canComplete` BOOLEAN NOT NULL DEFAULT false,
    `canAssign` BOOLEAN NOT NULL DEFAULT false,

    INDEX `ListMember_listId_idx`(`listId`),
    PRIMARY KEY (`userId`, `listId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ItemAssignee` (
    `userId` CHAR(16) NOT NULL,
    `itemId` CHAR(16) NOT NULL,
    `role` VARCHAR(64) NOT NULL,

    INDEX `ItemAssignee_itemId_idx`(`itemId`),
    PRIMARY KEY (`userId`, `itemId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ItemToTag` (
    `A` CHAR(16) NOT NULL,
    `B` CHAR(16) NOT NULL,

    UNIQUE INDEX `_ItemToTag_AB_unique`(`A`, `B`),
    INDEX `_ItemToTag_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ListSection` ADD CONSTRAINT `ListSection_listId_fkey` FOREIGN KEY (`listId`) REFERENCES `List`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item` ADD CONSTRAINT `Item_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `Item`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item` ADD CONSTRAINT `Item_sectionId_fkey` FOREIGN KEY (`sectionId`) REFERENCES `ListSection`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tag` ADD CONSTRAINT `Tag_listId_fkey` FOREIGN KEY (`listId`) REFERENCES `List`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ListMember` ADD CONSTRAINT `ListMember_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ListMember` ADD CONSTRAINT `ListMember_listId_fkey` FOREIGN KEY (`listId`) REFERENCES `List`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ItemAssignee` ADD CONSTRAINT `ItemAssignee_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ItemAssignee` ADD CONSTRAINT `ItemAssignee_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Item`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ItemToTag` ADD CONSTRAINT `_ItemToTag_A_fkey` FOREIGN KEY (`A`) REFERENCES `Item`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ItemToTag` ADD CONSTRAINT `_ItemToTag_B_fkey` FOREIGN KEY (`B`) REFERENCES `Tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
