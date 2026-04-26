import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, clients, InsertClient, products, InsertProduct, services, InsertService, orders, InsertOrder, quotations, InsertQuotation, sales, InsertSale, suppliers, InsertSupplier, equipments, InsertEquipment, orderItems, InsertOrderItem } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Clientes
export async function getClients() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clients);
}

export async function getClientById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  return result[0];
}

export async function createClient(data: InsertClient) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(clients).values(data);
  const id = (result as any).insertId;
  return { id, ...data };
}

export async function updateClient(id: number, data: Partial<InsertClient>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(clients).set(data).where(eq(clients.id, id));
}

export async function deleteClient(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(clients).where(eq(clients.id, id));
}

// Produtos
export async function getProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products);
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0];
}

export async function createProduct(data: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(products).values(data);
  const id = (result as any).insertId;
  return { id, ...data };
}

export async function updateProduct(id: number, data: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(products).where(eq(products.id, id));
}

// Serviços
export async function getServices() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(services);
}

export async function getServiceById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(services).where(eq(services.id, id)).limit(1);
  return result[0];
}

export async function createService(data: InsertService) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(services).values(data);
  const id = (result as any).insertId;
  return { id, ...data };
}

export async function updateService(id: number, data: Partial<InsertService>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(services).set(data).where(eq(services.id, id));
}

export async function deleteService(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(services).where(eq(services.id, id));
}

// Ordens de Serviço
export async function getOrders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders);
}

export async function getOrdersWithClient() {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .select({
      order: orders,
      client: clients,
    })
    .from(orders)
    .leftJoin(clients, eq(orders.clientId, clients.id));
  
  return result.map((row) => ({
    ...row.order,
    client: row.client || null,
  }));
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result[0];
}

export async function getOrderByIdWithClient(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select({
      order: orders,
      client: clients,
    })
    .from(orders)
    .leftJoin(clients, eq(orders.clientId, clients.id))
    .where(eq(orders.id, id))
    .limit(1);
  
  if (!result[0]) return undefined;
  return {
    ...result[0].order,
    client: result[0].client || null,
  };
}

export async function createOrder(data: InsertOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(orders).values(data);
  let id = (result as any).insertId;
  
  // Se insertId não existir, tentar obter via lastInsertId
  if (!id) {
    const lastInsertResult = await db.execute("SELECT LAST_INSERT_ID() as id");
    id = (lastInsertResult as any)?.[0]?.[0]?.id;
  }
  
  if (!id) {
    throw new Error("Falha ao obter ID da ordem inserida");
  }
  
  return { id, ...data };
}

export async function updateOrder(id: number, data: Partial<InsertOrder>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(orders).set(data).where(eq(orders.id, id));
}

export async function deleteOrder(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(orders).where(eq(orders.id, id));
}

// Orçamentos
export async function getQuotations() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(quotations);
}

export async function getQuotationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(quotations).where(eq(quotations.id, id)).limit(1);
  return result[0];
}

export async function createQuotation(data: InsertQuotation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(quotations).values(data);
  const id = (result as any).insertId;
  return { id, ...data };
}

export async function updateQuotation(id: number, data: Partial<InsertQuotation>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(quotations).set(data).where(eq(quotations.id, id));
}

export async function deleteQuotation(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(quotations).where(eq(quotations.id, id));
}

// Vendas
export async function getSales() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sales);
}

export async function getSaleById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(sales).where(eq(sales.id, id)).limit(1);
  return result[0];
}

export async function createSale(data: InsertSale) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(sales).values(data);
  const id = (result as any).insertId;
  return { id, ...data };
}

export async function updateSale(id: number, data: Partial<InsertSale>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(sales).set(data).where(eq(sales.id, id));
}

export async function deleteSale(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(sales).where(eq(sales.id, id));
}

// Fornecedores
export async function getSuppliers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(suppliers);
}

export async function getSupplierById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(suppliers).where(eq(suppliers.id, id)).limit(1);
  return result[0];
}

export async function createSupplier(data: InsertSupplier) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(suppliers).values(data);
  const id = (result as any).insertId;
  return { id, ...data };
}

export async function updateSupplier(id: number, data: Partial<InsertSupplier>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(suppliers).set(data).where(eq(suppliers.id, id));
}

export async function deleteSupplier(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(suppliers).where(eq(suppliers.id, id));
}

// Equipamentos
export async function getEquipments() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(equipments);
}

export async function getEquipmentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(equipments).where(eq(equipments.id, id)).limit(1);
  return result[0];
}

export async function getEquipmentsByClientId(clientId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(equipments).where(eq(equipments.clientId, clientId));
}

export async function createEquipment(data: InsertEquipment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const result = await db.insert(equipments).values(data);
    // Drizzle MySQL retorna o resultado como um array [insertId, affectedRows]
    const id = (result as any)?.[0] || (result as any).insertId;
    if (!id) {
      throw new Error('Falha ao obter ID do equipamento inserido');
    }
    return { id, ...data };
  } catch (error) {
    console.error('[createEquipment] Erro:', error, { data });
    throw error;
  }
}

export async function updateEquipment(id: number, data: Partial<InsertEquipment>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(equipments).set(data).where(eq(equipments.id, id));
}

export async function deleteEquipment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(equipments).where(eq(equipments.id, id));
}

export async function deleteAllEquipments() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(equipments);
}

// Itens de Ordem de Serviço
export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function createOrderItem(data: InsertOrderItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(orderItems).values(data);
  const id = (result as any).insertId;
  return { id, ...data };
}

export async function deleteOrderItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(orderItems).where(eq(orderItems.id, id));
}

export async function deleteOrderItemsByOrderId(orderId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(orderItems).where(eq(orderItems.orderId, orderId));
}
