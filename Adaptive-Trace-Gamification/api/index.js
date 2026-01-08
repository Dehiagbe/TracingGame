// This is a serverless function wrapper for Vercel deployment
// It imports and initializes the Express app without starting the HTTP server

import express from "express";
import { registerRoutes } from "../server/routes.js";
import { createServer } from "http";

// Create Express app instance
const app = express();
const httpServer = createServer(app);

// Configure middleware
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

// Logging function
function log(message, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

// Initialize routes and app (runs once at cold start)
let appInitialized = false;

async function initializeApp() {
  if (!appInitialized) {
    await registerRoutes(httpServer, app);

    // Error handling middleware
    app.use((err, _req, res, _next) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      console.error(err);
    });

    appInitialized = true;
  }
  return app;
}

// Export for Vercel serverless
export default async function handler(req, res) {
  const app = await initializeApp();
  return app(req, res);
}
