/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[paymentId]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `paymentId` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `transaction` ADD COLUMN `paymentId` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `Payment` (
    `id` VARCHAR(191) NOT NULL,
    `paymentMethod` VARCHAR(191) NOT NULL,
    `paymentStatus` ENUM('PENDING', 'SUCCESS', 'FAIL') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Product_name_key` ON `Product`(`name`);

-- CreateIndex
CREATE UNIQUE INDEX `Transaction_paymentId_key` ON `Transaction`(`paymentId`);

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `Payment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
