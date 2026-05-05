ALTER TABLE `orderItems` MODIFY COLUMN `discount` decimal(12,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `orderItems` ADD `discountType` enum('fixed','percent') DEFAULT 'percent';