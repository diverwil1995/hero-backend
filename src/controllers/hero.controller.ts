import express, { Response } from "express";
import { HeroClient, ProfileResponse } from "../clients/hero.client";
import { authMiddleware, HeroRequest } from "../middleware/auth.middleware";

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

export function createRouter(heroClient: HeroClient) {
  const router = express.Router();

  router.get(
    "/",
    authMiddleware(heroClient),
    async (req: HeroRequest, res: Response) => {
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

  router.get(
    "/:heroId",
    authMiddleware(heroClient),
    async (req: HeroRequest, res: Response) => {
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

  return router;
}
