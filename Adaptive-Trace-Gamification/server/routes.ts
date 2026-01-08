
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post(api.attempts.create.path, async (req, res) => {
    try {
      const input = api.attempts.create.input.parse(req.body);
      const attempt = await storage.createAttempt(input);
      res.status(201).json(attempt);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.get(api.attempts.list.path, async (req, res) => {
    const attempts = await storage.getAttempts();
    res.json(attempts);
  });

  return httpServer;
}

async function seedDatabase() {
  const existing = await storage.getAttempts();
  if (existing.length === 0) {
    // Seed some initial data if needed, or leave empty as this is a logging app
    console.log("Database seeded with initial empty state");
  }
}
