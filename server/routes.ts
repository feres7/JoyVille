import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertUserSchema,
  insertProductSchema,
  insertCategorySchema,
  insertCartItemSchema,
  insertOrderSchema,
  insertOrderItemSchema,
} from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcrypt";
import session from "express-session";
import { WebSocketServer, WebSocket } from "ws";

// Extend session type to include user
declare module "express-session" {
  interface SessionData {
    user?: {
      id: number;
      username: string;
      role: string;
    };
  }
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const signupSchema = z.object({
  email: z.string().email(),
  username: z.string().min(1),
  password: z.string().min(6),
});

// WebSocket connections for real-time updates
const wsConnections = new Set<WebSocket>();

function broadcastToClients(message: string) {
  wsConnections.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws) => {
    console.log("WebSocket client connected");
    wsConnections.add(ws);

    ws.on("close", () => {
      console.log("WebSocket client disconnected");
      wsConnections.delete(ws);
    });
  });

  // Session configuration
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "joyville-secret-key",
      resave: false,
      saveUninitialized: true, // Allow sessions for anonymous users (cart functionality)
      cookie: {
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    }),
  );

  // Initialize database with default data
  await initializeDatabase();

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session?.user || req.session.user.role !== "superadmin") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Customer auth middleware (allows any authenticated user)
  const requireCustomerAuth = (req: any, res: any, next: any) => {
    if (!req.session?.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.user = {
        id: user.id,
        username: user.username,
        role: user.role,
      };
      res.json({
        user: { id: user.id, username: user.username, role: user.role },
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, username, password } = signupSchema.parse(req.body);

      // Check if user already exists
      const existingUserByEmail = await storage.getUserByEmail(email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const existingUserByUsername = await storage.getUserByUsername(username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const newUser = await storage.createUser({
        email,
        username,
        password: hashedPassword,
        role: "customer",
      });

      // Set session
      req.session.user = {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
      };
      res
        .status(201)
        .json({
          user: {
            id: newUser.id,
            username: newUser.username,
            role: newUser.role,
          },
        });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (req.session?.user) {
      res.json({ user: req.session.user });
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // Profile routes
  app.get("/api/auth/profile", requireCustomerAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return user profile without password
      const { password, ...userProfile } = user;
      res.json(userProfile);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.put("/api/auth/profile", requireCustomerAuth, async (req, res) => {
    try {
      const { username } = req.body;

      if (!username) {
        return res.status(400).json({ message: "Username is required" });
      }

      // Check if username is already taken by another user
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser && existingUser.id !== req.session.user.id) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const updatedUser = await storage.updateUser(req.session.user.id, {
        username,
      });
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update session with new username
      req.session.user.username = updatedUser.username;

      // Return updated profile without password
      const { password, ...userProfile } = updatedUser;
      res.json(userProfile);
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.put("/api/auth/password", requireCustomerAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res
          .status(400)
          .json({ message: "Current password and new password are required" });
      }

      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ message: "New password must be at least 6 characters" });
      }

      const user = await storage.getUser(req.session.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(
        currentPassword,
        user.password,
      );
      if (!isValidPassword) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      const updatedUser = await storage.updateUser(req.session.user.id, {
        password: hashedNewPassword,
      });
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Password update error:", error);
      res.status(500).json({ message: "Failed to update password" });
    }
  });

  // Remove old admin route - redirect to login
  app.get("/api/auth/admin", (req, res) => {
    res
      .status(404)
      .json({
        message: "Route not found. Please use /api/auth/login instead.",
      });
  });

  // Categories routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", requireAuth, async (req, res) => {
    try {
      const category = insertCategorySchema.parse(req.body);
      const newCategory = await storage.createCategory(category);
      res.status(201).json(newCategory);
    } catch (error) {
      res.status(400).json({ message: "Invalid category data" });
    }
  });

  // Products routes
  app.get("/api/products", async (req, res) => {
    try {
      const section = req.query.section as string;
      const category = req.query.category as string;
      const search = req.query.search as string;

      let products;
      if (search) {
        products = await storage.searchProducts(search, section);
      } else if (category) {
        products = await storage.getProductsByCategory(
          parseInt(category),
          section,
        );
      } else {
        products = await storage.getProducts(section);
      }

      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", requireAuth, async (req, res) => {
    try {
      const product = insertProductSchema.parse(req.body);
      const newProduct = await storage.createProduct(product);
      res.status(201).json(newProduct);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data" });
    }
  });

  app.put("/api/products/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertProductSchema.partial().parse(req.body);
      const updatedProduct = await storage.updateProduct(id, updates);
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(updatedProduct);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data" });
    }
  });

  app.delete("/api/products/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProduct(id);
      if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Cart routes
  app.get("/api/cart", async (req, res) => {
    try {
      const sessionId = req.sessionID;
      const cartItems = await storage.getCartItems(sessionId);
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart items" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const sessionId = req.sessionID;
      const cartItem = insertCartItemSchema.parse({
        ...req.body,
        sessionId,
      });
      const newItem = await storage.addToCart(cartItem);
      res.status(201).json(newItem);
    } catch (error) {
      res.status(400).json({ message: "Invalid cart item data" });
    }
  });

  app.put("/api/cart/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { quantity } = z
        .object({ quantity: z.number().min(1) })
        .parse(req.body);
      const updatedItem = await storage.updateCartItem(id, quantity);
      if (!updatedItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      res.json(updatedItem);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.removeFromCart(id);
      if (!deleted) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove item from cart" });
    }
  });

  app.delete("/api/cart", async (req, res) => {
    try {
      const sessionId = req.sessionID;
      await storage.clearCart(sessionId);
      res.json({ message: "Cart cleared" });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // Order routes
  app.post("/api/orders", requireCustomerAuth, async (req, res) => {
    try {
      const sessionId = req.sessionID;
      const userId = req.session?.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Get cart items to create order items
      const cartItems = await storage.getCartItems(sessionId);
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      // Calculate total
      const totalAmount = cartItems.reduce((total, item) => {
        return (
          total + parseFloat(item.product?.price || "0") * (item.quantity || 0)
        );
      }, 0);

      // Create order
      const orderData = insertOrderSchema.parse({
        ...req.body,
        userId,
        sessionId,
        totalAmount: totalAmount.toString(),
      });

      const newOrder = await storage.createOrder(orderData);

      // Create order items
      for (const cartItem of cartItems) {
        if (cartItem.product) {
          await storage.createOrderItem({
            orderId: newOrder.id,
            productId: cartItem.productId!,
            quantity: cartItem.quantity || 1,
            price: cartItem.product.price,
          });
        }
      }

      // Clear cart after successful order
      await storage.clearCart(sessionId);

      // Broadcast order update to all connected clients
      broadcastToClients(
        JSON.stringify({
          type: "order_created",
          order: newOrder,
          userId: userId,
        }),
      );

      res.status(201).json(newOrder);
    } catch (error) {
      console.error("Order creation error:", error);
      res.status(400).json({ message: "Failed to create order" });
    }
  });

  app.get("/api/orders", requireCustomerAuth, async (req, res) => {
    try {
      const userId = req.session?.user?.id;
      const userRole = req.session?.user?.role;

      // Admins see all orders, customers see only their own
      const orders =
        userRole === "superadmin"
          ? await storage.getOrders()
          : await storage.getOrdersByUser(userId!);

      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", requireCustomerAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.patch("/api/orders/:id/status", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;

      console.log(`Updating order ${id} status to ${status}`);
      console.log(`Request body:`, req.body);
      console.log(`User session:`, req.session?.user);

      if (
        !status ||
        !["pending", "confirmed", "shipped", "delivered", "cancelled"].includes(
          status,
        )
      ) {
        console.error(`Invalid status provided: ${status}`);
        return res.status(400).json({ message: "Invalid status" });
      }

      const updatedOrder = await storage.updateOrderStatus(id, status);
      if (!updatedOrder) {
        console.error(`Order not found: ${id}`);
        return res.status(404).json({ message: "Order not found" });
      }

      console.log(`Order ${id} status updated successfully to ${status}`);

      // Broadcast status update to all connected clients
      broadcastToClients(
        JSON.stringify({
          type: "order_status_updated",
          order: updatedOrder,
        }),
      );

      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order status:", error);
      console.error(
        "Error stack:",
        error instanceof Error ? error.stack : error,
      );
      res
        .status(500)
        .json({
          message: "Failed to update order status",
          error: error instanceof Error ? error.message : String(error),
        });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  return httpServer;
}

async function initializeDatabase() {
  try {
    // Create default superadmin user
    const existingAdmin = await storage.getUserByUsername("admin");
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await storage.createUser({
        email: "admin@joyville.com",
        username: "admin",
        password: hashedPassword,
        role: "superadmin",
      });
    }

    // Create default categories
    const existingCategories = await storage.getCategories();
    if (existingCategories.length === 0) {
      const defaultCategories = [
        {
          name: "Plush Toys",
          description: "Soft and cuddly companions",
          icon: "fas fa-baby",
          color: "mint",
        },
        {
          name: "Building Blocks",
          description: "Creative construction sets",
          icon: "fas fa-cubes",
          color: "sky",
        },
        {
          name: "Dolls",
          description: "Imaginative play companions",
          icon: "fas fa-female",
          color: "sunny",
        },
        {
          name: "Educational",
          description: "Learning through play",
          icon: "fas fa-graduation-cap",
          color: "lavender",
        },
        {
          name: "Vehicles",
          description: "Cars, trucks, and more",
          icon: "fas fa-car",
          color: "coral",
        },
        {
          name: "Puzzles",
          description: "Brain-teasing challenges",
          icon: "fas fa-puzzle-piece",
          color: "turquoise",
        },
      ];

      for (const category of defaultCategories) {
        await storage.createCategory(category);
      }
    }
  } catch (error) {
    console.error("Database initialization error:", error);
  }
}
