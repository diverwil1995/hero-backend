import axios from "axios";
import cors from "cors";
import 'dotenv/config';
import express from "express";
import helmet from "helmet";
import { HeroClient } from "./clients/hero.client";
import { HeroController, HeroControllerInterface } from "./controllers/hero.controller";
import { authMiddleware } from "./middleware/auth.middleware";
import { errorHandler } from "./middleware/error.handler";

const app = express();
const heroBaseUrl = process.env.HERO_API_BASE_URL
if(!heroBaseUrl) {
  throw new Error('HERO_API_BASE_URL environment variable is required')
}
const heroClient = new HeroClient(axios.create(), heroBaseUrl);
const heroController: HeroControllerInterface = new HeroController(heroClient);

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

app.get(
  "/heroes",
  authMiddleware(heroClient),
  (req, res) => heroController.getHeroes(req, res)
);

// // curl -H "Accept: application/json" -H "Content-Type: application/json" -H "Name: hahow" -H "Password: rocks" -X GET http://localhost:3000/heroes/1
app.get(
  "/heroes/:heroId",
  authMiddleware(heroClient),
  (req, res) => heroController.getHeroById(req, res),
);

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
});

app.use(errorHandler);

console.log("App configured successfully");

export default app;