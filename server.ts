import { NestFactory } from "@nestjs/core";
import { AppModule } from "./src/backend/app.module.ts";
import path from "path";
import { createServer as createViteServer } from "vite";
import express from "express";
import { SpaExceptionFilter } from "./src/backend/filters/spa.filter.ts";

async function startServer() {
  const PORT = 3000;

  // Initialize NestJS
  const app = await NestFactory.create(AppModule);

  const server = app.getHttpAdapter().getInstance();

  let vite: any = null;
  if (process.env.NODE_ENV !== "production") {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    server.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    server.use(express.static(distPath));
  }

  // Register the SPA filter to delegate non-API 404s to the frontend
  app.useGlobalFilters(new SpaExceptionFilter(vite));

  await app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
