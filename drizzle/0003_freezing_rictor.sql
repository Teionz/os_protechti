CREATE TABLE `equipments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`brand` varchar(100),
	`model` varchar(100),
	`serial` varchar(100),
	`category` varchar(100),
	`description` text,
	`purchaseDate` timestamp,
	`warrantyDate` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `equipments_id` PRIMARY KEY(`id`),
	CONSTRAINT `equipments_serial_unique` UNIQUE(`serial`)
);
