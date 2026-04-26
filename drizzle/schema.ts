import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Clientes
export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  cnpjCpf: varchar("cnpjCpf", { length: 18 }),
  street: varchar("street", { length: 255 }),
  number: varchar("number", { length: 20 }),
  complement: varchar("complement", { length: 255 }),
  neighborhood: varchar("neighborhood", { length: 255 }),
  city: varchar("city", { length: 255 }),
  state: varchar("state", { length: 2 }),
  zipCode: varchar("zipCode", { length: 10 }),
  contact: varchar("contact", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

// Produtos
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  sku: varchar("sku", { length: 100 }).unique(),
  category: varchar("category", { length: 100 }),
  description: text("description"),
  unit: varchar("unit", { length: 20 }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stock: int("stock").default(0),
  minStock: int("minStock").default(0),
  supplier: varchar("supplier", { length: 255 }),
  supplierCode: varchar("supplierCode", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// Serviços
export const services = mysqlTable("services", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  estimatedTime: varchar("estimatedTime", { length: 50 }),
  status: mysqlEnum("status", ["active", "inactive"]).default("active"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;

// Fornecedores
export const suppliers = mysqlTable("suppliers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  cnpjCpf: varchar("cnpjCpf", { length: 18 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  street: varchar("street", { length: 255 }),
  number: varchar("number", { length: 20 }),
  complement: varchar("complement", { length: 255 }),
  neighborhood: varchar("neighborhood", { length: 255 }),
  city: varchar("city", { length: 255 }),
  state: varchar("state", { length: 2 }),
  zipCode: varchar("zipCode", { length: 10 }),
  contact: varchar("contact", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = typeof suppliers.$inferInsert;

// Ordens de Serviço
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("orderNumber", { length: 50 }).unique().notNull(),
  clientId: int("clientId").notNull(),
  entryDate: timestamp("entryDate").defaultNow(),
  exitDate: timestamp("exitDate"),
  deliveryDate: timestamp("deliveryDate"),
  status: mysqlEnum("status", ["budgeting", "awaiting_approval", "in_progress", "awaiting_pickup", "completed"]).default("in_progress"),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium"),
  channel: varchar("channel", { length: 50 }),
  seller: varchar("seller", { length: 255 }),
  technician: varchar("technician", { length: 255 }),
  equipmentName: varchar("equipmentName", { length: 255 }),
  equipmentBrand: varchar("equipmentBrand", { length: 100 }),
  equipmentModel: varchar("equipmentModel", { length: 100 }),
  equipmentSerial: varchar("equipmentSerial", { length: 100 }),
  equipmentCondition: text("equipmentCondition"),
  reportedDefects: text("reportedDefects"),
  accessories: text("accessories"),
  proposedSolution: text("proposedSolution"),
  technicalReport: text("technicalReport"),
  terms: text("terms"),
  deliveryAddress: text("deliveryAddress"),
  publicNotes: text("publicNotes"),
  internalNotes: text("internalNotes"),
  total: decimal("total", { precision: 12, scale: 2 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// Itens de Ordem de Serviço
export const orderItems = mysqlTable("orderItems", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  type: mysqlEnum("type", ["service", "product"]).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  quantity: int("quantity").default(1),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

// Orçamentos
export const quotations = mysqlTable("quotations", {
  id: int("id").autoincrement().primaryKey(),
  quotationNumber: varchar("quotationNumber", { length: 50 }).unique().notNull(),
  clientId: int("clientId").notNull(),
  quotationDate: timestamp("quotationDate").defaultNow(),
  validityDate: timestamp("validityDate"),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "converted"]).default("pending"),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).default("0"),
  discount: decimal("discount", { precision: 12, scale: 2 }).default("0"),
  total: decimal("total", { precision: 12, scale: 2 }).default("0"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Quotation = typeof quotations.$inferSelect;
export type InsertQuotation = typeof quotations.$inferInsert;

// Itens de Orçamento
export const quotationItems = mysqlTable("quotationItems", {
  id: int("id").autoincrement().primaryKey(),
  quotationId: int("quotationId").notNull(),
  type: mysqlEnum("type", ["service", "product"]).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  quantity: int("quantity").default(1),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type QuotationItem = typeof quotationItems.$inferSelect;
export type InsertQuotationItem = typeof quotationItems.$inferInsert;

// Vendas
export const sales = mysqlTable("sales", {
  id: int("id").autoincrement().primaryKey(),
  saleNumber: varchar("saleNumber", { length: 50 }).unique().notNull(),
  clientId: int("clientId").notNull(),
  saleDate: timestamp("saleDate").defaultNow(),
  status: mysqlEnum("status", ["pending", "completed", "cancelled"]).default("completed"),
  seller: varchar("seller", { length: 255 }),
  commission: decimal("commission", { precision: 5, scale: 2 }).default("10"),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).default("0"),
  commissionAmount: decimal("commissionAmount", { precision: 12, scale: 2 }).default("0"),
  total: decimal("total", { precision: 12, scale: 2 }).default("0"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Sale = typeof sales.$inferSelect;
export type InsertSale = typeof sales.$inferInsert;

// Itens de Venda
export const saleItems = mysqlTable("saleItems", {
  id: int("id").autoincrement().primaryKey(),
  saleId: int("saleId").notNull(),
  type: mysqlEnum("type", ["service", "product"]).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  quantity: int("quantity").default(1),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SaleItem = typeof saleItems.$inferSelect;
export type InsertSaleItem = typeof saleItems.$inferInsert;

// Equipamentos do Cliente
export const equipments = mysqlTable("equipments", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  brand: varchar("brand", { length: 100 }),
  model: varchar("model", { length: 100 }),
  serial: varchar("serial", { length: 100 }),
  category: varchar("category", { length: 100 }),
  description: text("description"),
  purchaseDate: timestamp("purchaseDate"),
  warrantyDate: timestamp("warrantyDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Equipment = typeof equipments.$inferSelect;
export type InsertEquipment = typeof equipments.$inferInsert;
