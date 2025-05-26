import { users, products, categories, variations, transactions, systemSettings, type User, type InsertUser, type Product, type InsertProduct, type Category, type InsertCategory, type Variation, type InsertVariation, type Transaction, type InsertTransaction, type SystemSetting, type InsertSystemSetting } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql, asc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Category methods
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Product methods
  getProducts(): Promise<(Product & { category: Category | null })[]>;
  getProduct(id: number): Promise<(Product & { category: Category | null; variations: Variation[] }) | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;

  // Variation methods
  getVariations(): Promise<(Variation & { product: Product })[]>;
  getVariation(id: number): Promise<(Variation & { product: Product }) | undefined>;
  createVariation(variation: InsertVariation): Promise<Variation>;
  updateVariation(id: number, variation: Partial<InsertVariation>): Promise<Variation>;
  deleteVariation(id: number): Promise<void>;
  getLowStockVariations(): Promise<(Variation & { product: Product })[]>;

  // Transaction methods
  getTransactions(startDate?: Date, endDate?: Date): Promise<(Transaction & { variation: Variation & { product: Product }; user: User })[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getRecentTransactions(limit: number): Promise<(Transaction & { variation: Variation & { product: Product }; user: User })[]>;

  // Dashboard stats
  getDashboardStats(): Promise<{
    totalProducts: number;
    lowStockCount: number;
    todayStockIn: number;
    todayStockOut: number;
  }>;

  // Top products
  getTopProducts(limit: number): Promise<{ productId: number; productName: string; category: string; totalSold: number }[]>;

  // System settings
  getSystemSetting(key: string): Promise<SystemSetting | undefined>;
  setSystemSetting(key: string, value: string): Promise<SystemSetting>;
  getSystemSettings(): Promise<SystemSetting[]>;

  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values(category)
      .returning();
    return newCategory;
  }

  async getProducts(): Promise<(Product & { category: Category | null })[]> {
    return await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        categoryId: products.categoryId,
        sku: products.sku,
        createdAt: products.createdAt,
        category: categories,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id));
  }

  async getProduct(id: number): Promise<(Product & { category: Category | null; variations: Variation[] }) | undefined> {
    const [product] = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        categoryId: products.categoryId,
        sku: products.sku,
        createdAt: products.createdAt,
        category: categories,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.id, id));

    if (!product) return undefined;

    const productVariations = await db
      .select()
      .from(variations)
      .where(eq(variations.productId, id));

    return {
      ...product,
      variations: productVariations,
    };
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db
      .insert(products)
      .values(product)
      .returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product> {
    const [updatedProduct] = await db
      .update(products)
      .set(product)
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async getVariations(): Promise<(Variation & { product: Product })[]> {
    return await db
      .select({
        id: variations.id,
        productId: variations.productId,
        color: variations.color,
        size: variations.size,
        stock: variations.stock,
        minStock: variations.minStock,
        price: variations.price,
        sku: variations.sku,
        product: products,
      })
      .from(variations)
      .leftJoin(products, eq(variations.productId, products.id));
  }

  async getVariation(id: number): Promise<(Variation & { product: Product }) | undefined> {
    const [variation] = await db
      .select({
        id: variations.id,
        productId: variations.productId,
        color: variations.color,
        size: variations.size,
        stock: variations.stock,
        minStock: variations.minStock,
        price: variations.price,
        sku: variations.sku,
        product: products,
      })
      .from(variations)
      .leftJoin(products, eq(variations.productId, products.id))
      .where(eq(variations.id, id));

    return variation || undefined;
  }

  async createVariation(variation: InsertVariation): Promise<Variation> {
    const [newVariation] = await db
      .insert(variations)
      .values(variation)
      .returning();
    return newVariation;
  }

  async updateVariation(id: number, variation: Partial<InsertVariation>): Promise<Variation> {
    const [updatedVariation] = await db
      .update(variations)
      .set(variation)
      .where(eq(variations.id, id))
      .returning();
    return updatedVariation;
  }

  async deleteVariation(id: number): Promise<void> {
    await db.delete(variations).where(eq(variations.id, id));
  }

  async getLowStockVariations(): Promise<(Variation & { product: Product })[]> {
    return await db
      .select({
        id: variations.id,
        productId: variations.productId,
        color: variations.color,
        size: variations.size,
        stock: variations.stock,
        minStock: variations.minStock,
        price: variations.price,
        sku: variations.sku,
        product: products,
      })
      .from(variations)
      .leftJoin(products, eq(variations.productId, products.id))
      .where(sql`${variations.stock} <= ${variations.minStock}`)
      .orderBy(asc(variations.stock));
  }

  async getTransactions(startDate?: Date, endDate?: Date): Promise<(Transaction & { variation: Variation & { product: Product }; user: User })[]> {
    let query = db
      .select({
        id: transactions.id,
        variationId: transactions.variationId,
        type: transactions.type,
        quantity: transactions.quantity,
        notes: transactions.notes,
        userId: transactions.userId,
        createdAt: transactions.createdAt,
        variation: {
          id: variations.id,
          productId: variations.productId,
          color: variations.color,
          size: variations.size,
          stock: variations.stock,
          minStock: variations.minStock,
          price: variations.price,
          sku: variations.sku,
          product: products,
        },
        user: users,
      })
      .from(transactions)
      .leftJoin(variations, eq(transactions.variationId, variations.id))
      .leftJoin(products, eq(variations.productId, products.id))
      .leftJoin(users, eq(transactions.userId, users.id));

    if (startDate && endDate) {
      query = query.where(and(
        gte(transactions.createdAt, startDate),
        lte(transactions.createdAt, endDate)
      ));
    }

    return await query.orderBy(desc(transactions.createdAt));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values(transaction)
      .returning();

    // Update variation stock
    const stockChange = transaction.type === "in" ? transaction.quantity : -transaction.quantity;
    await db
      .update(variations)
      .set({
        stock: sql`${variations.stock} + ${stockChange}`,
      })
      .where(eq(variations.id, transaction.variationId));

    return newTransaction;
  }

  async getRecentTransactions(limit: number): Promise<(Transaction & { variation: Variation & { product: Product }; user: User })[]> {
    return await db
      .select({
        id: transactions.id,
        variationId: transactions.variationId,
        type: transactions.type,
        quantity: transactions.quantity,
        notes: transactions.notes,
        userId: transactions.userId,
        createdAt: transactions.createdAt,
        variation: {
          id: variations.id,
          productId: variations.productId,
          color: variations.color,
          size: variations.size,
          stock: variations.stock,
          minStock: variations.minStock,
          price: variations.price,
          sku: variations.sku,
          product: products,
        },
        user: users,
      })
      .from(transactions)
      .leftJoin(variations, eq(transactions.variationId, variations.id))
      .leftJoin(products, eq(variations.productId, products.id))
      .leftJoin(users, eq(transactions.userId, users.id))
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
  }

  async getDashboardStats(): Promise<{
    totalProducts: number;
    lowStockCount: number;
    todayStockIn: number;
    todayStockOut: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalProducts] = await db
      .select({ count: sql<number>`count(*)` })
      .from(products);

    const [lowStockCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(variations)
      .where(sql`${variations.stock} <= ${variations.minStock}`);

    const [todayStockIn] = await db
      .select({ total: sql<number>`coalesce(sum(${transactions.quantity}), 0)` })
      .from(transactions)
      .where(and(
        eq(transactions.type, "in"),
        gte(transactions.createdAt, today),
        lte(transactions.createdAt, tomorrow)
      ));

    const [todayStockOut] = await db
      .select({ total: sql<number>`coalesce(sum(${transactions.quantity}), 0)` })
      .from(transactions)
      .where(and(
        eq(transactions.type, "out"),
        gte(transactions.createdAt, today),
        lte(transactions.createdAt, tomorrow)
      ));

    return {
      totalProducts: totalProducts?.count || 0,
      lowStockCount: lowStockCount?.count || 0,
      todayStockIn: todayStockIn?.total || 0,
      todayStockOut: todayStockOut?.total || 0,
    };
  }

  async getTopProducts(limit: number): Promise<{ productId: number; productName: string; category: string; totalSold: number }[]> {
    return await db
      .select({
        productId: products.id,
        productName: products.name,
        category: sql<string>`coalesce(${categories.name}, 'Uncategorized')`,
        totalSold: sql<number>`coalesce(sum(${transactions.quantity}), 0)`,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(variations, eq(products.id, variations.productId))
      .leftJoin(transactions, and(
        eq(variations.id, transactions.variationId),
        eq(transactions.type, "out")
      ))
      .groupBy(products.id, products.name, categories.name)
      .orderBy(desc(sql`coalesce(sum(${transactions.quantity}), 0)`))
      .limit(limit);
  }

  async getSystemSetting(key: string): Promise<SystemSetting | undefined> {
    const [setting] = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, key))
      .limit(1);
    return setting;
  }

  async setSystemSetting(key: string, value: string): Promise<SystemSetting> {
    const existing = await this.getSystemSetting(key);
    
    if (existing) {
      const [updated] = await db
        .update(systemSettings)
        .set({ value, updatedAt: new Date() })
        .where(eq(systemSettings.key, key))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(systemSettings)
        .values({ key, value })
        .returning();
      return created;
    }
  }

  async getSystemSettings(): Promise<SystemSetting[]> {
    return await db
      .select()
      .from(systemSettings)
      .orderBy(asc(systemSettings.key));
  }
}

export const storage = new DatabaseStorage();
