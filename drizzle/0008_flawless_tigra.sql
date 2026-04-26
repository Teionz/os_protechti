ALTER TABLE `orderItems` ADD `details` text;--> statement-breakpoint
ALTER TABLE `orderItems` ADD `discount` decimal(5,2) DEFAULT '0';