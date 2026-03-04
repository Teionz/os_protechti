CREATE TABLE `clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320),
	`phone` varchar(20),
	`cnpjCpf` varchar(18),
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
	CONSTRAINT `clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orderItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`type` enum('service','product') NOT NULL,
	`description` varchar(255) NOT NULL,
	`quantity` int DEFAULT 1,
	`unitPrice` decimal(10,2) NOT NULL,
	`total` decimal(12,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderNumber` varchar(50) NOT NULL,
	`clientId` int NOT NULL,
	`entryDate` timestamp DEFAULT (now()),
	`exitDate` timestamp,
	`deliveryDate` timestamp,
	`status` enum('budgeting','awaiting_approval','in_progress','awaiting_pickup','completed') DEFAULT 'in_progress',
	`priority` enum('low','medium','high','urgent') DEFAULT 'medium',
	`channel` varchar(50),
	`seller` varchar(255),
	`technician` varchar(255),
	`equipmentName` varchar(255),
	`equipmentBrand` varchar(100),
	`equipmentModel` varchar(100),
	`equipmentSerial` varchar(100),
	`equipmentCondition` text,
	`reportedDefects` text,
	`accessories` text,
	`proposedSolution` text,
	`technicalReport` text,
	`terms` text,
	`deliveryAddress` text,
	`publicNotes` text,
	`internalNotes` text,
	`total` decimal(12,2) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_orderNumber_unique` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`sku` varchar(100),
	`category` varchar(100),
	`description` text,
	`unit` varchar(20),
	`price` decimal(10,2) NOT NULL,
	`stock` int DEFAULT 0,
	`minStock` int DEFAULT 0,
	`supplier` varchar(255),
	`supplierCode` varchar(100),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_sku_unique` UNIQUE(`sku`)
);
--> statement-breakpoint
CREATE TABLE `quotationItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quotationId` int NOT NULL,
	`type` enum('service','product') NOT NULL,
	`description` varchar(255) NOT NULL,
	`quantity` int DEFAULT 1,
	`unitPrice` decimal(10,2) NOT NULL,
	`total` decimal(12,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quotationItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quotations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quotationNumber` varchar(50) NOT NULL,
	`clientId` int NOT NULL,
	`quotationDate` timestamp DEFAULT (now()),
	`validityDate` timestamp,
	`status` enum('pending','approved','rejected','converted') DEFAULT 'pending',
	`subtotal` decimal(12,2) DEFAULT '0',
	`discount` decimal(12,2) DEFAULT '0',
	`total` decimal(12,2) DEFAULT '0',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quotations_id` PRIMARY KEY(`id`),
	CONSTRAINT `quotations_quotationNumber_unique` UNIQUE(`quotationNumber`)
);
--> statement-breakpoint
CREATE TABLE `saleItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`saleId` int NOT NULL,
	`type` enum('service','product') NOT NULL,
	`description` varchar(255) NOT NULL,
	`quantity` int DEFAULT 1,
	`unitPrice` decimal(10,2) NOT NULL,
	`total` decimal(12,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `saleItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sales` (
	`id` int AUTO_INCREMENT NOT NULL,
	`saleNumber` varchar(50) NOT NULL,
	`clientId` int NOT NULL,
	`saleDate` timestamp DEFAULT (now()),
	`status` enum('pending','completed','cancelled') DEFAULT 'completed',
	`seller` varchar(255),
	`commission` decimal(5,2) DEFAULT '10',
	`subtotal` decimal(12,2) DEFAULT '0',
	`commissionAmount` decimal(12,2) DEFAULT '0',
	`total` decimal(12,2) DEFAULT '0',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sales_id` PRIMARY KEY(`id`),
	CONSTRAINT `sales_saleNumber_unique` UNIQUE(`saleNumber`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` varchar(100),
	`description` text,
	`price` decimal(10,2) NOT NULL,
	`estimatedTime` varchar(50),
	`status` enum('active','inactive') DEFAULT 'active',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `services_id` PRIMARY KEY(`id`)
);
