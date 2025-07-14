import axios from "axios";
import cors from "cors";
import express, { Application } from "express";
import helmet from "helmet";
import { HeroClient } from "./clients/hero.client";
import { Config } from "./config";
import { createRouter } from "./controllers/hero.controller";
import { errorHandler } from "./middleware/error.handler";

export function createApp(config: Config): Application {
  const app = express();
  const heroClient = new HeroClient(axios.create(), config.heroApiBaseUrl);
  const heroRouter = createRouter(heroClient);

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.get("/health", (req, res) => {
    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
    });
  });

  app.use("/heroes", heroRouter);

  app.use((req, res) => {
    res.status(404).json({
      error: "Route not found",
      path: req.originalUrl,
    });
  });

  app.use(errorHandler);

  return app;
}
