ALTER TABLE `equipments` ADD `equipmentTag` varchar(100);--> statement-breakpoint
ALTER TABLE `equipments` ADD CONSTRAINT `equipments_equipmentTag_unique` UNIQUE(`equipmentTag`);