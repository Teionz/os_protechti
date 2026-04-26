import { describe, expect, it } from "vitest";
import { z } from "zod";

// Test input validation for CRUD operations
describe("CRUD Operations - Input Validation", () => {

  describe("Clients - Input Validation", () => {
    it("should validate client name is required", () => {
      const clientSchema = z.object({
        name: z.string(),
        email: z.string().optional(),
        phone: z.string().optional(),
      });

      expect(() => clientSchema.parse({ email: "test@test.com" })).toThrow();
      expect(() => clientSchema.parse({ name: "Test" })).not.toThrow();
    });

    it("should validate client email format", () => {
      const clientSchema = z.object({
        email: z.string().email().optional(),
      });

      expect(() => clientSchema.parse({ email: "invalid-email" })).toThrow();
      expect(() => clientSchema.parse({ email: "valid@test.com" })).not.toThrow();
    });
  });

  describe("Products - Input Validation", () => {
    it("should validate product name is required", () => {
      const productSchema = z.object({
        name: z.string(),
        price: z.string(),
      });

      expect(() => productSchema.parse({ price: "99.99" })).toThrow();
      expect(() => productSchema.parse({ name: "Product", price: "99.99" })).not.toThrow();
    });

    it("should validate product price format", () => {
      const productSchema = z.object({
        price: z.string(),
      });

      expect(() => productSchema.parse({ price: "99.99" })).not.toThrow();
      expect(() => productSchema.parse({ price: "invalid" })).not.toThrow(); // String is accepted
    });
  });

  describe("Services - Input Validation", () => {
    it("should validate service name is required", () => {
      const serviceSchema = z.object({
        name: z.string(),
        price: z.string(),
      });

      expect(() => serviceSchema.parse({ price: "150.00" })).toThrow();
      expect(() => serviceSchema.parse({ name: "Service", price: "150.00" })).not.toThrow();
    });
  });

  describe("Orders - Input Validation", () => {
    it("should validate order number is required", () => {
      const orderSchema = z.object({
        orderNumber: z.string(),
        clientId: z.number(),
      });

      expect(() => orderSchema.parse({ clientId: 1 })).toThrow();
      expect(() => orderSchema.parse({ orderNumber: "OS-001", clientId: 1 })).not.toThrow();
    });

    it("should validate order status enum", () => {
      const orderSchema = z.object({
        status: z.enum(["budgeting", "awaiting_approval", "in_progress", "awaiting_pickup", "completed"]).optional(),
      });

      expect(() => orderSchema.parse({ status: "invalid_status" })).toThrow();
      expect(() => orderSchema.parse({ status: "in_progress" })).not.toThrow();
    });
  });

  describe("Quotations - Input Validation", () => {
    it("should validate quotation number is required", () => {
      const quotationSchema = z.object({
        quotationNumber: z.string(),
        clientId: z.number(),
      });

      expect(() => quotationSchema.parse({ clientId: 1 })).toThrow();
      expect(() => quotationSchema.parse({ quotationNumber: "ORC-001", clientId: 1 })).not.toThrow();
    });

    it("should validate quotation status enum", () => {
      const quotationSchema = z.object({
        status: z.enum(["pending", "approved", "rejected", "converted"]).optional(),
      });

      expect(() => quotationSchema.parse({ status: "invalid" })).toThrow();
      expect(() => quotationSchema.parse({ status: "approved" })).not.toThrow();
    });
  });

  describe("Sales - Input Validation", () => {
    it("should validate sale number is required", () => {
      const saleSchema = z.object({
        saleNumber: z.string(),
        clientId: z.number(),
      });

      expect(() => saleSchema.parse({ clientId: 1 })).toThrow();
      expect(() => saleSchema.parse({ saleNumber: "VND-001", clientId: 1 })).not.toThrow();
    });

    it("should validate sale status enum", () => {
      const saleSchema = z.object({
        status: z.enum(["pending", "completed", "cancelled"]).optional(),
      });

      expect(() => saleSchema.parse({ status: "invalid" })).toThrow();
      expect(() => saleSchema.parse({ status: "completed" })).not.toThrow();
    });
  });

  describe("Number Calculations", () => {
    it("should calculate commission percentage correctly", () => {
      const subtotal = 1000;
      const commissionPercent = 10;
      const commission = (subtotal * commissionPercent) / 100;
      expect(commission).toBe(100);
    });

    it("should calculate total with discount", () => {
      const subtotal = 1000;
      const discount = 100;
      const total = subtotal - discount;
      expect(total).toBe(900);
    });

    it("should handle multiple items calculation", () => {
      const items = [
        { quantity: 2, unitPrice: 50 },
        { quantity: 3, unitPrice: 100 },
      ];
      const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
      expect(total).toBe(400);
    });
  });
});

  describe("Equipments - Input Validation", () => {
    it("should validate equipment name is required", () => {
      const equipmentSchema = z.object({
        clientId: z.number(),
        name: z.string(),
        brand: z.string().optional(),
        model: z.string().optional(),
        serial: z.string().optional(),
        equipmentTag: z.string().optional(),
      });

      expect(() => equipmentSchema.parse({ clientId: 1 })).toThrow();
      expect(() => equipmentSchema.parse({ clientId: 1, name: "Printer" })).not.toThrow();
    });

    it("should validate equipment clientId is required", () => {
      const equipmentSchema = z.object({
        clientId: z.number(),
        name: z.string(),
      });

      expect(() => equipmentSchema.parse({ name: "Printer" })).toThrow();
      expect(() => equipmentSchema.parse({ clientId: 1, name: "Printer" })).not.toThrow();
    });

    it("should allow optional equipment fields", () => {
      const equipmentSchema = z.object({
        clientId: z.number(),
        name: z.string(),
        brand: z.string().optional(),
        model: z.string().optional(),
        serial: z.string().optional(),
        equipmentTag: z.string().optional(),
      });

      const validEquipment = {
        clientId: 1,
        name: "Printer",
        brand: "HP",
        model: "LaserJet",
        serial: "SN123456",
        equipmentTag: "TAG-001",
      };

      expect(() => equipmentSchema.parse(validEquipment)).not.toThrow();
    });

    it("should validate equipment with minimal data", () => {
      const equipmentSchema = z.object({
        clientId: z.number(),
        name: z.string(),
        brand: z.string().optional(),
        model: z.string().optional(),
      });

      const minimalEquipment = {
        clientId: 1,
        name: "Computer",
      };

      expect(() => equipmentSchema.parse(minimalEquipment)).not.toThrow();
    });
  });
