ALTER TABLE `orders` ADD `origin` enum('advertisement','client','referral','bni','new_client');--> statement-breakpoint
ALTER TABLE `orders` ADD `missingKeyboard` enum('yes','no');--> statement-breakpoint
ALTER TABLE `orders` ADD `crackedScreen` enum('yes','no');--> statement-breakpoint
ALTER TABLE `orders` ADD `missingCharger` enum('yes','no');--> statement-breakpoint
ALTER TABLE `orders` ADD `missingBag` enum('yes','no');--> statement-breakpoint
ALTER TABLE `orders` ADD `poweringOn` enum('yes','no');--> statement-breakpoint
ALTER TABLE `orders` ADD `missingPowerCable` enum('yes','no');--> statement-breakpoint
ALTER TABLE `orders` ADD `password` varchar(255);--> statement-breakpoint
ALTER TABLE `orders` ADD `laborCost` decimal(12,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `orders` ADD `partsCost` decimal(12,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `orders` ADD `shippingCost` decimal(12,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `orders` ADD `otherCosts` decimal(12,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `orders` ADD `discount` decimal(12,2) DEFAULT '0';