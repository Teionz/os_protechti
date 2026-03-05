CREATE TABLE `suppliers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`cnpjCpf` varchar(18),
	`email` varchar(320),
	`phone` varchar(20),
	`street` varchar(255),
	`number` varchar(20),
	`complement` varchar(255),
	`neighborhood` varchar(255),
	`city` varchar(255),
	`state` varchar(2),
	`zipCode` varchar(10),
	`contact` varchar(255),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `suppliers_id` PRIMARY KEY(`id`)
);
