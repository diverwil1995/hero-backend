import { Response } from "express";
import { HeroClient, ProfileResponse } from "../clients/hero.client";
import { HeroRequest } from "../middleware/auth.middleware";

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
  
export interface HeroControllerInterface {
    getHeroes(req: HeroRequest, res: Response): any
    getHeroById(): any
}

export class HeroController implements HeroControllerInterface {
    constructor(private heroClient: HeroClient) {}

    async getHeroes(req: HeroRequest, res: Response) {
        const hasPermission = req.locals?.hasPermission;
    
        const heroes = await this.heroClient.getHeroList();
    
        const profilePromises = [];
        let profiles: ProfileResponse[] | undefined;
        if (hasPermission) {
            for (const hero of heroes) {
            const profilePromise = this.heroClient.getProfile(hero.id);
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
        
    }

    async getHeroById() {

    }
}

