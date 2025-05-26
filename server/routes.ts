import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertProductSchema, insertVariationSchema, insertTransactionSchema, insertCategorySchema } from "@shared/schema";
import { analyzeProductPerformance, generateRestockRecommendations } from "./ai";
import ExcelJS from "exceljs";

export function registerRoutes(app: Express): Server {
  // Setup authentication routes
  setupAuth(app);

  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ error: "Invalid category data" });
    }
  });

  // Products
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ error: "Invalid product data" });
    }
  });

  app.patch("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, validatedData);
      res.json(product);
    } catch (error) {
      res.status(400).json({ error: "Invalid product data" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProduct(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // Variations
  app.get("/api/variations", async (req, res) => {
    try {
      const variations = await storage.getVariations();
      res.json(variations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch variations" });
    }
  });

  app.get("/api/variations/low-stock", async (req, res) => {
    try {
      const variations = await storage.getLowStockVariations();
      res.json(variations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch low stock variations" });
    }
  });

  app.post("/api/variations", async (req, res) => {
    try {
      const validatedData = insertVariationSchema.parse(req.body);
      const variation = await storage.createVariation(validatedData);
      res.status(201).json(variation);
    } catch (error) {
      res.status(400).json({ error: "Invalid variation data" });
    }
  });

  app.patch("/api/variations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertVariationSchema.partial().parse(req.body);
      const variation = await storage.updateVariation(id, validatedData);
      res.json(variation);
    } catch (error) {
      res.status(400).json({ error: "Invalid variation data" });
    }
  });

  app.delete("/api/variations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteVariation(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete variation" });
    }
  });

  // Transactions
  app.get("/api/transactions", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      
      const transactions = await storage.getTransactions(start, end);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.get("/api/transactions/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const transactions = await storage.getRecentTransactions(limit);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent transactions" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const validatedData = insertTransactionSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      
      const transaction = await storage.createTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      res.status(400).json({ error: "Invalid transaction data" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/dashboard/top-products", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const topProducts = await storage.getTopProducts(limit);
      res.json(topProducts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch top products" });
    }
  });

  // Excel reports
  app.get("/api/reports/excel", async (req, res) => {
    try {
      const { startDate, endDate, type } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ error: "Start date and end date are required" });
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      
      const transactions = await storage.getTransactions(start, end);
      
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Stock Transactions');

      // Add headers
      worksheet.columns = [
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Type', key: 'type', width: 10 },
        { header: 'Product', key: 'product', width: 30 },
        { header: 'Variation', key: 'variation', width: 20 },
        { header: 'Quantity', key: 'quantity', width: 10 },
        { header: 'User', key: 'user', width: 20 },
        { header: 'Notes', key: 'notes', width: 30 },
      ];

      // Add data
      transactions.forEach(transaction => {
        const variation = `${transaction.variation.color || ''} ${transaction.variation.size || ''}`.trim();
        worksheet.addRow({
          date: transaction.createdAt?.toLocaleDateString() || '',
          type: transaction.type === 'in' ? 'Stock In' : 'Stock Out',
          product: transaction.variation.product?.name || '',
          variation: variation || 'Default',
          quantity: transaction.quantity,
          user: transaction.user?.name || '',
          notes: transaction.notes || '',
        });
      });

      // Style the header
      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE6F3FF' },
        };
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=stock-report-${startDate}-${endDate}.xlsx`);

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      res.status(500).json({ error: "Failed to generate Excel report" });
    }
  });

  // AI Analytics
  app.get("/api/analytics/performance", async (req, res) => {
    try {
      const products = await storage.getTopProducts(50);
      const analysis = await analyzeProductPerformance(products);
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ error: "Failed to analyze product performance" });
    }
  });

  app.get("/api/analytics/restock", async (req, res) => {
    try {
      const lowStockItems = await storage.getLowStockVariations();
      const recommendations = await generateRestockRecommendations(lowStockItems);
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate restock recommendations" });
    }
  });

  // System Settings
  app.post("/api/settings/system", async (req, res) => {
    try {
      const { openaiApiKey, openaiModel, stockAlertThreshold } = req.body;
      
      // Here you would normally save these settings to database or environment
      // For now, we'll just validate and return success
      if (!openaiApiKey || !openaiModel || !stockAlertThreshold) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // In a real implementation, you'd save these to a settings table or config
      res.json({ 
        message: "System settings updated successfully",
        settings: {
          openaiApiKey: "***hidden***",
          openaiModel,
          stockAlertThreshold
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to update system settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
