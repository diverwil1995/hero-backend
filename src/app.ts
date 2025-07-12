import axios from "axios";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { HeroClient, ProfileResponse } from "./clients/hero.client";
import { authMiddleware, HeroRequest } from "./middleware/auth.middleware";
import { errorHandler } from "./middleware/error.handler";

const app = express();
const heroClient = new HeroClient(axios.create());

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

// TODO 打包成 Router 並放在 controller
// 測試
app.get(
  "/heroes",
  authMiddleware(heroClient),
  async (req: HeroRequest, res) => {
    const hasPermission = req.locals?.hasPermission;

    const heroes = await heroClient.getHeroList();

    const profilePromises = [];
    let profiles: ProfileResponse[] | undefined;
    if (hasPermission) {
      for (const hero of heroes) {
        const profilePromise = heroClient.getProfile(hero.id);
        profilePromises.push(profilePromise);
      }
      profiles = await Promise.all(profilePromises);
    }

    const heroResult = [];
    if (profiles) {
      for (let i = 0; i < heroes.length; i++) {
        const hero = heroes[i];
        const heroWithProfile: AuthorizedHero = {
          id: hero.id,
          name: hero.name,
          image: hero.image,
          profile: profiles[i],
        };
        heroResult.push(heroWithProfile);
      }
    } else {
      for (const hero of heroes) {
        const basicHero: HeroInfo = {
          id: hero.id,
          name: hero.name,
          image: hero.image,
        };
        heroResult.push(basicHero);
      }
    }
    res.json({
      heroes: heroResult,
    });
  },
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