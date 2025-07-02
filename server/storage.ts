import { 
  users, categories, products, cartItems, orders, orderItems,
  type User, type InsertUser, type Category, type InsertCategory,
  type Product, type InsertProduct, type ProductWithCategory,
  type CartItem, type InsertCartItem, type CartItemWithProduct,
  type Order, type InsertOrder, type OrderWithItems
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Product operations
  getProducts(section?: string): Promise<ProductWithCategory[]>;
  getProduct(id: number): Promise<ProductWithCategory | undefined>;
  getProductsByCategory(categoryId: number, section?: string): Promise<ProductWithCategory[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  searchProducts(query: string, section?: string): Promise<ProductWithCategory[]>;
  
  // Cart operations
  getCartItems(sessionId: string): Promise<CartItemWithProduct[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: number): Promise<boolean>;
  clearCart(sessionId: string): Promise<void>;
  
  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  getOrders(): Promise<OrderWithItems[]>;
  getOrder(id: number): Promise<OrderWithItems | undefined>;
  
  // Dashboard stats
  getDashboardStats(): Promise<{
    retailItems: number;
    wholesaleItems: number;
    totalOrders: number;
    revenue: string;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(asc(categories.name));
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async getProducts(section?: string): Promise<ProductWithCategory[]> {
    const query = db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        imageUrl: products.imageUrl,
        categoryId: products.categoryId,
        inventory: products.inventory,
        section: products.section,
        isNew: products.isNew,
        isBestseller: products.isBestseller,
        isActive: products.isActive,
        createdAt: products.createdAt,
        category: {
          id: categories.id,
          name: categories.name,
          description: categories.description,
          icon: categories.icon,
          color: categories.color,
        },
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(
        eq(products.isActive, true),
        section ? eq(products.section, section) : undefined
      ))
      .orderBy(desc(products.createdAt));

    return await query as ProductWithCategory[];
  }

  async getProduct(id: number): Promise<ProductWithCategory | undefined> {
    const [product] = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        imageUrl: products.imageUrl,
        categoryId: products.categoryId,
        inventory: products.inventory,
        section: products.section,
        isNew: products.isNew,
        isBestseller: products.isBestseller,
        isActive: products.isActive,
        createdAt: products.createdAt,
        category: {
          id: categories.id,
          name: categories.name,
          description: categories.description,
          icon: categories.icon,
          color: categories.color,
        },
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.id, id));

    return product as ProductWithCategory || undefined;
  }

  async getProductsByCategory(categoryId: number, section?: string): Promise<ProductWithCategory[]> {
    const query = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        imageUrl: products.imageUrl,
        categoryId: products.categoryId,
        inventory: products.inventory,
        section: products.section,
        isNew: products.isNew,
        isBestseller: products.isBestseller,
        isActive: products.isActive,
        createdAt: products.createdAt,
        category: {
          id: categories.id,
          name: categories.name,
          description: categories.description,
          icon: categories.icon,
          color: categories.color,
        },
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(
        eq(products.categoryId, categoryId),
        eq(products.isActive, true),
        section ? eq(products.section, section) : undefined
      ))
      .orderBy(desc(products.createdAt));
    
    return query as ProductWithCategory[];
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set(product)
      .where(eq(products.id, id))
      .returning();
    return updatedProduct || undefined;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const [deletedProduct] = await db
      .update(products)
      .set({ isActive: false })
      .where(eq(products.id, id))
      .returning();
    return !!deletedProduct;
  }

  async searchProducts(query: string, section?: string): Promise<ProductWithCategory[]> {
    return await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        imageUrl: products.imageUrl,
        categoryId: products.categoryId,
        inventory: products.inventory,
        section: products.section,
        isNew: products.isNew,
        isBestseller: products.isBestseller,
        isActive: products.isActive,
        createdAt: products.createdAt,
        category: {
          id: categories.id,
          name: categories.name,
          description: categories.description,
          icon: categories.icon,
          color: categories.color,
        },
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(
        eq(products.isActive, true),
        sql`${products.name} ILIKE ${`%${query}%`} OR ${products.description} ILIKE ${`%${query}%`}`,
        section ? eq(products.section, section) : undefined
      ))
      .orderBy(desc(products.createdAt));
  }

  async getCartItems(sessionId: string): Promise<CartItemWithProduct[]> {
    const query = await db
      .select({
        id: cartItems.id,
        sessionId: cartItems.sessionId,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        createdAt: cartItems.createdAt,
        product: {
          id: products.id,
          name: products.name,
          description: products.description,
          price: products.price,
          imageUrl: products.imageUrl,
          categoryId: products.categoryId,
          inventory: products.inventory,
          section: products.section,
          isNew: products.isNew,
          isBestseller: products.isBestseller,
          isActive: products.isActive,
          createdAt: products.createdAt,
          category: {
            id: categories.id,
            name: categories.name,
            description: categories.description,
            icon: categories.icon,
            color: categories.color,
          },
        },
      })
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(cartItems.sessionId, sessionId));
    
    return query as CartItemWithProduct[];
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(and(
        eq(cartItems.sessionId, item.sessionId),
        eq(cartItems.productId, item.productId!)
      ));

    if (existingItem) {
      // Update quantity
      const [updatedItem] = await db
        .update(cartItems)
        .set({ quantity: (existingItem.quantity || 0) + (item.quantity || 0) })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    } else {
      // Add new item
      const [newItem] = await db.insert(cartItems).values(item).returning();
      return newItem;
    }
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updatedItem || undefined;
  }

  async removeFromCart(id: number): Promise<boolean> {
    const [deletedItem] = await db
      .delete(cartItems)
      .where(eq(cartItems.id, id))
      .returning();
    return !!deletedItem;
  }

  async clearCart(sessionId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.sessionId, sessionId));
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async getOrders(): Promise<OrderWithItems[]> {
    return await db
      .select({
        id: orders.id,
        sessionId: orders.sessionId,
        totalAmount: orders.totalAmount,
        status: orders.status,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .orderBy(desc(orders.createdAt));
  }

  async getOrder(id: number): Promise<OrderWithItems | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async getDashboardStats(): Promise<{
    retailItems: number;
    wholesaleItems: number;
    totalOrders: number;
    revenue: string;
  }> {
    const [retailCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(and(eq(products.section, "retail"), eq(products.isActive, true)));

    const [wholesaleCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(and(eq(products.section, "wholesale"), eq(products.isActive, true)));

    const [orderCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders);

    const [revenueSum] = await db
      .select({ sum: sql<string>`COALESCE(sum(total_amount), 0)` })
      .from(orders)
      .where(eq(orders.status, "confirmed"));

    return {
      retailItems: retailCount?.count || 0,
      wholesaleItems: wholesaleCount?.count || 0,
      totalOrders: orderCount?.count || 0,
      revenue: revenueSum?.sum || "0",
    };
  }
}

export const storage = new DatabaseStorage();
