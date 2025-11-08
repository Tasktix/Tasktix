-- CreateTable
CREATE TABLE `User` (
    `id` CHAR(16) NOT NULL,
    `username` VARCHAR(32) NOT NULL,
    `email` VARCHAR(128) NOT NULL,
    `password` CHAR(205) NOT NULL,
    `color` ENUM('Pink', 'Red', 'Orange', 'Amber', 'Yellow', 'Lime', 'Green', 'Emerald', 'Cyan', 'Blue', 'Violet') NOT NULL,
    `dateCreated` DATETIME(0) NOT NULL,
    `dateSignedIn` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` CHAR(128) NOT NULL,
    `user_id` CHAR(16) NOT NULL,
    `dateExpire` DATETIME(0) NOT NULL,

    INDEX `Session_user_id_idx`(`user_id`),
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
    `list_id` CHAR(16) NOT NULL,
    `name` VARCHAR(64) NOT NULL,

    INDEX `ListSection_list_id_idx`(`list_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Item` (
    `id` CHAR(16) NOT NULL,
    `name` VARCHAR(128) NOT NULL,
    `status` ENUM('Unstarted', 'In Progress', 'Paused', 'Completed') NOT NULL DEFAULT 'Unstarted',
    `priority` ENUM('High', 'Medium', 'Low') NOT NULL DEFAULT 'Low',
    `isUnclear` BOOLEAN NOT NULL DEFAULT false,
    `expectedMs` INTEGER NULL,
    `elapsedMs` INTEGER NOT NULL DEFAULT 0,
    `parent_id` CHAR(16) NULL,
    `section_id` CHAR(16) NOT NULL,
    `sectionIndex` INTEGER NOT NULL DEFAULT 0,
    `dateCreated` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `dateDue` DATETIME(0) NULL,
    `dateStarted` DATETIME(0) NULL,
    `dateCompleted` DATETIME(0) NULL,

    INDEX `Item_section_id_idx`(`section_id`),
    INDEX `Item_parent_id_idx`(`parent_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tag` (
    `id` CHAR(16) NOT NULL,
    `name` VARCHAR(32) NOT NULL,
    `color` ENUM('Pink', 'Red', 'Orange', 'Amber', 'Yellow', 'Lime', 'Green', 'Emerald', 'Cyan', 'Blue', 'Violet') NOT NULL,
    `list_id` CHAR(16) NOT NULL,

    INDEX `Tag_list_id_idx`(`list_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ListMember` (
    `user_id` CHAR(16) NOT NULL,
    `list_id` CHAR(16) NOT NULL,
    `canAdd` BOOLEAN NOT NULL DEFAULT false,
    `canRemove` BOOLEAN NOT NULL DEFAULT false,
    `canComplete` BOOLEAN NOT NULL DEFAULT false,
    `canAssign` BOOLEAN NOT NULL DEFAULT false,

    INDEX `ListMember_list_id_idx`(`list_id`),
    PRIMARY KEY (`user_id`, `list_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ItemAssignee` (
    `user_id` CHAR(16) NOT NULL,
    `item_id` CHAR(16) NOT NULL,
    `ia_role` VARCHAR(64) NOT NULL,

    INDEX `ItemAssignee_item_id_idx`(`item_id`),
    PRIMARY KEY (`user_id`, `item_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ItemToTag` (
    `A` CHAR(16) NOT NULL,
    `B` CHAR(16) NOT NULL,

    UNIQUE INDEX `_ItemToTag_AB_unique`(`A`, `B`),
    INDEX `_ItemToTag_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ListSection` ADD CONSTRAINT `ListSection_list_id_fkey` FOREIGN KEY (`list_id`) REFERENCES `List`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item` ADD CONSTRAINT `Item_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `Item`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item` ADD CONSTRAINT `Item_section_id_fkey` FOREIGN KEY (`section_id`) REFERENCES `ListSection`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tag` ADD CONSTRAINT `Tag_list_id_fkey` FOREIGN KEY (`list_id`) REFERENCES `List`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ListMember` ADD CONSTRAINT `ListMember_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ListMember` ADD CONSTRAINT `ListMember_list_id_fkey` FOREIGN KEY (`list_id`) REFERENCES `List`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ItemAssignee` ADD CONSTRAINT `ItemAssignee_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ItemAssignee` ADD CONSTRAINT `ItemAssignee_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `Item`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ItemToTag` ADD CONSTRAINT `_ItemToTag_A_fkey` FOREIGN KEY (`A`) REFERENCES `Item`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ItemToTag` ADD CONSTRAINT `_ItemToTag_B_fkey` FOREIGN KEY (`B`) REFERENCES `Tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
