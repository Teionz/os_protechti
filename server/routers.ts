import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { COOKIE_NAME } from "../shared/const";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Clientes
  clients: router({
    list: publicProcedure.query(() => db.getClients()),
    get: publicProcedure.input(z.number()).query(({ input }) => db.getClientById(input)),
    create: publicProcedure
      .input(z.object({
        name: z.string(),
        email: z.string().optional(),
        phone: z.string().optional(),
        cnpjCpf: z.string().optional(),
        street: z.string().optional(),
        number: z.string().optional(),
        complement: z.string().optional(),
        neighborhood: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        contact: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ input }) => db.createClient(input)),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          name: z.string().optional(),
          email: z.string().optional(),
          phone: z.string().optional(),
          cnpjCpf: z.string().optional(),
          street: z.string().optional(),
          number: z.string().optional(),
          complement: z.string().optional(),
          neighborhood: z.string().optional(),
          city: z.string().optional(),
          state: z.string().optional(),
          zipCode: z.string().optional(),
          contact: z.string().optional(),
          notes: z.string().optional(),
        }),
      }))
      .mutation(({ input }) => db.updateClient(input.id, input.data)),
    delete: publicProcedure.input(z.number()).mutation(({ input }) => db.deleteClient(input)),
  }),

  // Produtos
  products: router({
    list: publicProcedure.query(() => db.getProducts()),
    get: publicProcedure.input(z.number()).query(({ input }) => db.getProductById(input)),
    create: publicProcedure
      .input(z.object({
        name: z.string(),
        sku: z.string().optional(),
        category: z.string().optional(),
        description: z.string().optional(),
        unit: z.string().optional(),
        price: z.string(),
        stock: z.number().optional(),
        minStock: z.number().optional(),
        supplier: z.string().optional(),
        supplierCode: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ input }) => db.createProduct(input)),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          name: z.string().optional(),
          sku: z.string().optional(),
          category: z.string().optional(),
          description: z.string().optional(),
          unit: z.string().optional(),
          price: z.string().optional(),
          stock: z.number().optional(),
          minStock: z.number().optional(),
          supplier: z.string().optional(),
          supplierCode: z.string().optional(),
          notes: z.string().optional(),
        }),
      }))
      .mutation(({ input }) => db.updateProduct(input.id, input.data)),
    delete: publicProcedure.input(z.number()).mutation(({ input }) => db.deleteProduct(input)),
  }),

  // Serviços
  services: router({
    list: publicProcedure.query(() => db.getServices()),
    get: publicProcedure.input(z.number()).query(({ input }) => db.getServiceById(input)),
    create: publicProcedure
      .input(z.object({
        name: z.string(),
        category: z.string().optional(),
        description: z.string().optional(),
        price: z.string(),
        estimatedTime: z.string().optional(),
        status: z.enum(["active", "inactive"]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ input }) => db.createService(input)),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          name: z.string().optional(),
          category: z.string().optional(),
          description: z.string().optional(),
          price: z.string().optional(),
          estimatedTime: z.string().optional(),
          status: z.enum(["active", "inactive"]).optional(),
          notes: z.string().optional(),
        }),
      }))
      .mutation(({ input }) => db.updateService(input.id, input.data)),
    delete: publicProcedure.input(z.number()).mutation(({ input }) => db.deleteService(input)),
  }),

  // Ordens de Serviço
  orders: router({
    list: publicProcedure.query(() => db.getOrdersWithClient()),
    get: publicProcedure.input(z.number()).query(({ input }) => db.getOrderByIdWithClient(input)),
    create: publicProcedure
      .input(z.object({
        orderNumber: z.string(),
        clientId: z.number(),
        status: z.enum(["budgeting", "awaiting_approval", "in_progress", "awaiting_pickup", "completed"]).optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        channel: z.string().optional(),
        seller: z.string().optional(),
        technician: z.string().optional(),
        equipmentName: z.string().optional(),
        equipmentBrand: z.string().optional(),
        equipmentModel: z.string().optional(),
        equipmentSerial: z.string().optional(),
        equipmentTag: z.string().optional(),
        equipmentCondition: z.string().optional(),
        reportedDefects: z.string().optional(),
        accessories: z.string().optional(),
        proposedSolution: z.string().optional(),
        technicalReport: z.string().optional(),
        terms: z.string().optional(),
        deliveryAddress: z.string().optional(),
        publicNotes: z.string().optional(),
        internalNotes: z.string().optional(),
        total: z.string().optional(),
      }))
      .mutation(({ input }) => db.createOrder(input)),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          orderNumber: z.string().optional(),
          clientId: z.number().optional(),
          status: z.enum(["budgeting", "awaiting_approval", "in_progress", "awaiting_pickup", "completed"]).optional(),
          priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
          channel: z.string().optional(),
          seller: z.string().optional(),
          technician: z.string().optional(),
          equipmentName: z.string().optional(),
          equipmentBrand: z.string().optional(),
          equipmentModel: z.string().optional(),
          equipmentSerial: z.string().optional(),
          equipmentTag: z.string().optional(),
          equipmentCondition: z.string().optional(),
          reportedDefects: z.string().optional(),
          accessories: z.string().optional(),
          proposedSolution: z.string().optional(),
          technicalReport: z.string().optional(),
          terms: z.string().optional(),
          deliveryAddress: z.string().optional(),
          publicNotes: z.string().optional(),
          internalNotes: z.string().optional(),
          total: z.string().optional(),
        }),
      }))
      .mutation(({ input }) => db.updateOrder(input.id, input.data)),
    delete: publicProcedure.input(z.number()).mutation(({ input }) => db.deleteOrder(input)),
    listRaw: publicProcedure.query(() => db.getOrders()),
    getRaw: publicProcedure.input(z.number()).query(({ input }) => db.getOrderById(input)),
  }),

  // Orçamentos
  quotations: router({
    list: publicProcedure.query(() => db.getQuotations()),
    get: publicProcedure.input(z.number()).query(({ input }) => db.getQuotationById(input)),
    create: publicProcedure
      .input(z.object({
        quotationNumber: z.string(),
        clientId: z.number(),
        status: z.enum(["pending", "approved", "rejected", "converted"]).optional(),
        subtotal: z.string().optional(),
        discount: z.string().optional(),
        total: z.string().optional(),
        notes: z.string().optional(),
        services: z.array(z.object({
          serviceId: z.number(),
          quantity: z.number(),
          unitPrice: z.number(),
        })).optional(),
        products: z.array(z.object({
          productId: z.number(),
          quantity: z.number(),
          unitPrice: z.number(),
        })).optional(),
      }))
      .mutation(({ input }) => db.createQuotation(input)),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          quotationNumber: z.string().optional(),
          clientId: z.number().optional(),
          status: z.enum(["pending", "approved", "rejected", "converted"]).optional(),
          subtotal: z.string().optional(),
          discount: z.string().optional(),
          total: z.string().optional(),
          notes: z.string().optional(),
        }),
      }))
      .mutation(({ input }) => db.updateQuotation(input.id, input.data)),
    delete: publicProcedure.input(z.number()).mutation(({ input }) => db.deleteQuotation(input)),
  }),

  // Vendas
  sales: router({
    list: publicProcedure.query(() => db.getSales()),
    get: publicProcedure.input(z.number()).query(({ input }) => db.getSaleById(input)),
    create: publicProcedure
      .input(z.object({
        saleNumber: z.string(),
        clientId: z.number(),
        status: z.enum(["pending", "completed", "cancelled"]).optional(),
        seller: z.string().optional(),
        commission: z.string().optional(),
        subtotal: z.string().optional(),
        services: z.array(z.object({
          serviceId: z.number(),
          quantity: z.number(),
          unitPrice: z.number(),
        })).optional(),
        products: z.array(z.object({
          productId: z.number(),
          quantity: z.number(),
          unitPrice: z.number(),
        })).optional(),
        commissionAmount: z.string().optional(),
        total: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ input }) => db.createSale(input)),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          saleNumber: z.string().optional(),
          clientId: z.number().optional(),
          status: z.enum(["pending", "completed", "cancelled"]).optional(),
          seller: z.string().optional(),
          commission: z.string().optional(),
          subtotal: z.string().optional(),
          commissionAmount: z.string().optional(),
          total: z.string().optional(),
          notes: z.string().optional(),
        }),
      }))
      .mutation(({ input }) => db.updateSale(input.id, input.data)),
    delete: publicProcedure.input(z.number()).mutation(({ input }) => db.deleteSale(input)),
  }),

  // Fornecedores
  suppliers: router({
    list: publicProcedure.query(() => db.getSuppliers()),
    get: publicProcedure.input(z.number()).query(({ input }) => db.getSupplierById(input)),
    create: publicProcedure
      .input(z.object({
        name: z.string(),
        cnpjCpf: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        street: z.string().optional(),
        number: z.string().optional(),
        complement: z.string().optional(),
        neighborhood: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        contact: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ input }) => db.createSupplier(input)),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          name: z.string().optional(),
          cnpjCpf: z.string().optional(),
          email: z.string().optional(),
          phone: z.string().optional(),
          street: z.string().optional(),
          number: z.string().optional(),
          complement: z.string().optional(),
          neighborhood: z.string().optional(),
          city: z.string().optional(),
          state: z.string().optional(),
          zipCode: z.string().optional(),
          contact: z.string().optional(),
          notes: z.string().optional(),
        }),
      }))
      .mutation(({ input }) => db.updateSupplier(input.id, input.data)),
    delete: publicProcedure.input(z.number()).mutation(({ input }) => db.deleteSupplier(input)),
  }),

  // Itens de Ordem de Serviço
  orderItems: router({
    getByOrderId: publicProcedure.input(z.number()).query(({ input }) => db.getOrderItems(input)),
    create: publicProcedure
      .input(z.object({
        orderId: z.number(),
        type: z.enum(["service", "product"]),
        description: z.string(),
        quantity: z.number(),
        unitPrice: z.string(),
        total: z.string(),
      }))
      .mutation(({ input }) => db.createOrderItem(input)),
    delete: publicProcedure.input(z.number()).mutation(({ input }) => db.deleteOrderItem(input)),
    deleteByOrderId: publicProcedure.input(z.number()).mutation(({ input }) => db.deleteOrderItemsByOrderId(input)),
  }),

  // Equipamentos
  equipments: router({
    list: publicProcedure.query(() => db.getEquipments()),
    get: publicProcedure.input(z.number()).query(({ input }) => db.getEquipmentById(input)),
    getByClientId: publicProcedure.input(z.number()).query(({ input }) => db.getEquipmentsByClientId(input)),
    create: publicProcedure
      .input(z.object({
        clientId: z.number(),
        name: z.string(),
        brand: z.string().optional(),
        model: z.string().optional(),
        serial: z.string().optional(),
        category: z.string().optional(),
        description: z.string().optional(),
        purchaseDate: z.date().optional(),
        warrantyDate: z.date().optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ input }) => db.createEquipment(input)),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          clientId: z.number().optional(),
          name: z.string().optional(),
          brand: z.string().optional(),
          model: z.string().optional(),
          serial: z.string().optional(),
          category: z.string().optional(),
          description: z.string().optional(),
          purchaseDate: z.date().optional(),
          warrantyDate: z.date().optional(),
          notes: z.string().optional(),
        }),
      }))
      .mutation(({ input }) => db.updateEquipment(input.id, input.data)),
    delete: publicProcedure.input(z.number()).mutation(({ input }) => db.deleteEquipment(input)),
  }),
});

export type AppRouter = typeof appRouter;
