import axios from "axios";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { HeroClient, ProfileResponse } from "./clients/hero.client";
import { HeroController, HeroControllerInterface } from "./controllers/hero.controller";
import { authMiddleware, HeroRequest } from "./middleware/auth.middleware";
import { errorHandler } from "./middleware/error.handler";

const app = express();
const heroClient = new HeroClient(axios.create());
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

type HeroInfo = {
  id: string;
  name: string;
  image: string;
};

type HeroProfile = {
  str: number;
  int: number;
  agi: number;
  luk: number;
};

type AuthorizedHero = HeroInfo & {
  profile: HeroProfile;
};

app.get(
  "/heroes",
  authMiddleware(heroClient),
  (req, res) => heroController.getHeroes(req, res)
);

// TODO 打包成 Router 並放在 controller
// // curl -H "Accept: application/json" -H "Content-Type: application/json" -H "Name: hahow" -H "Password: rocks" -X GET http://localhost:3000/me/heroes/1
app.get(
  "/heroes/:heroId",
  authMiddleware(heroClient),
  async (req: HeroRequest, res) => {
    const heroId: string = req.params.heroId;

    const hasPermission = req.locals?.hasPermission;

    const hero = await heroClient.getHero(heroId);

    let profile: ProfileResponse | undefined;
    if (hasPermission) {
      profile = await heroClient.getProfile(heroId);
    }

    if (profile) {
      const heroResult: AuthorizedHero = {
        id: hero.id,
        name: hero.name,
        image: hero.image,
        profile: profile,
      };
      res.json(heroResult);
    } else {
      const heroResult: HeroInfo = {
        id: hero.id,
        name: hero.name,
        image: hero.image,
      };
      res.json(heroResult);
    }
  },
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