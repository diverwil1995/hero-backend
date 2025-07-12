import express, { response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import axios from 'axios';
import { errorHandler } from './middleware/error.handler';
import { authMiddleware, HeroRequest } from './middleware/auth.middleware';
import { HeroClient } from './clients/hero.client';

const app = express();
const heroClient = new HeroClient(axios.create())

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});

type HeroInfo = {
    id: string,
    name: string,
    image: string
}

type HeroProfile = {
    str: number
    int: number
    agi: number
    luk: number
}

type ListHeroesResponse = {
    heroes: HeroInfo[]
}

type SingleHeroResponse = HeroInfo

type ListHeroesAuthorizedResponse = {
    heroes: SingleHeroAuthorizedResponse[]
}

app.get('/heroes', authMiddleware(heroClient), async (req: HeroRequest, res) => {
    const hasPermission = req.locals?.hasPermission
    
    const heroListData = await heroClient.getHeroList()
    
    const heroProfilePromises = []
    let heroProfileList = []
    if(hasPermission) {
        for(const hero of heroListData) {
            const profilePromise = heroClient.getProfile(hero.id)
            heroProfilePromises.push(profilePromise)
        }
        heroProfileList = await Promise.all(heroProfilePromises)
    }
    
    const heroList = []   
    if(hasPermission) {
        for(let i=0; i< heroListData.length; i++){
            const hero = heroListData[i]
            const singleHeroAuthed: SingleHeroAuthorizedResponse = {
                id: hero.id,
                name: hero.name,
                image: hero.image,
                profile: heroProfileList[i]
            }
            heroList.push(singleHeroAuthed)
        }
    } else {
        for(const hero of heroListData) {
            const singleHero: SingleHeroResponse = {
                id: hero.id,
                name: hero.name,
                image: hero.image
            }
            heroList.push(singleHero)
        }
    }
    res.json({
        heroes: heroList
    })
})

type SingleHeroAuthorizedResponse = SingleHeroResponse & {
    profile: HeroProfile
}

// curl -H "Accept: application/json" -H "Content-Type: application/json" -H "Name: hahow" -H "Password: rocks" -X GET http://localhost:3000/me/heroes/1
app.get('/heroes/:heroId', authMiddleware(heroClient), async (req: HeroRequest, res) => {
    const heroId: string = req.params.heroId
    
    const hasPermission = req.locals?.hasPermission

    const heroData = await heroClient.getHero(heroId)
    
    let profileData
    if(hasPermission){
        profileData = await heroClient.getProfile(heroId)
    }

    if(hasPermission) {
        const singleHeroAuthedResponse: SingleHeroAuthorizedResponse = {
            id: heroData.id,
            name: heroData.name,
            image: heroData.image,
            profile: profileData
        }
        res.json(singleHeroAuthedResponse)
    } else {
        const singleHeroResponse: SingleHeroResponse = {
            id: heroData.id,
            name: heroData.name,
            image: heroData.image
        }
        res.json(singleHeroResponse)
    }
})

app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl
    })
})

app.use(errorHandler)

console.log('App configured successfully')

export default app