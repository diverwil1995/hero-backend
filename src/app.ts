import express, { response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import axios from 'axios';
import { errorHandler } from './middleware/error.handler';
import { authMiddleware, HeroRequest } from './middleware/auth.middleware';

const app = express();
const axiosInstance = axios.create();

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

app.get('/heroes', async (req, res) => {
    const url: string = `https://hahow-recruit.herokuapp.com/heroes`

    const response = await axiosInstance.get(url, {
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        }
    })
    const data = response.data
    if(typeof data[0].id === "string" && data[0].id.trim()) {
        const listHeroesResponse: ListHeroesResponse = {
            heroes:[data]
        }
        res.json(listHeroesResponse)
    } else {
        res.status(404).json({
            error: 'Not found',
            code: data.code,
            message: data.message
        })
    }
})

type SingleHeroResponse = HeroInfo

app.get('/heroessss/:heroId', async (req, res) => {
    
    const heroId: string = req.params.heroId

    const url: string = `https://hahow-recruit.herokuapp.com/heroes/${heroId}`
    const response = await axiosInstance.get(url, {
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        }
    })

    const data = response.data
    // 捕捉回傳內容，已知兩種情形，一種是正常回傳資訊，另一種是回傳 status: 200 卻有帶 message: backend error
    // null, undefind, "", 0, false, NaN 會被判定為 false
    if(data.id) {}

    // 只要 id 屬性存在就會 true，不論值符不符合需求都是
    if("id" in data) {}

    // 只有當 id 屬性為 string 時才會 true，但無法避免 "  "
    if(typeof data.id === "string") {}
    
    // 確保 id 屬性是字串且是有效字串
    if(typeof data.id === "string" && data.id.trim()) {
        const singleHeroResponse: SingleHeroResponse = {
            id: data.id,
            name: data.name,
            image: data.image
        }
        res.json(singleHeroResponse)
    } else {
        res.status(404).json({
            error: 'Not found',
            code: data.code,
            message: data.message
        })
    }
})

type ListHeroesAuthorizedResponse = {
    heroes: SingleHeroAuthorizedResponse[]
}

app.get('/me/heroes', async (req, res) => {
    let heroId: string = ""
    const authUrl: string = `https://hahow-recruit.herokuapp.com/auth`
    const heroUrl: string = `https://hahow-recruit.herokuapp.com/heroes`
    const profileUrl: string = `https://hahow-recruit.herokuapp.com/heroes/${heroId}/profile`

    const authData = {
        name: req.headers.name,
        password: req.headers.password
    }

    const authResponse = await axiosInstance.post(authUrl, authData, {
        headers: {
            "Content-Type": "application/json"
        }
    })
    const authResult = authResponse.data



})

type SingleHeroAuthorizedResponse = SingleHeroResponse & {
    profile: HeroProfile
}

// curl -H "Accept: application/json" -H "Content-Type: application/json" -H "Name: hahow" -H "Password: rocks" -X GET http://localhost:3000/me/heroes/1
app.get('/heroes/:heroId', authMiddleware(axiosInstance), async (req: HeroRequest, res) => {
    const heroId: string = req.params.heroId
    const heroUrl: string = `https://hahow-recruit.herokuapp.com/heroes/${heroId}`
    const profileUrl: string = `https://hahow-recruit.herokuapp.com/heroes/${heroId}/profile`

    // const authData = {
    //     name: req.headers.name,
    //     password: req.headers.password
    // }

    // let hasPermission: boolean = false
    // if(authData.name && authData.password) {
    //     const authUrl: string = `https://hahow-recruit.herokuapp.com/auth`
    //     const authResponse = await axiosInstance.post(authUrl, authData, {
    //         headers: {
    //             "Content-Type": "application/json"
    //         }
    //     })
    //     const authResult = authResponse.data
    //     hasPermission = authResult.trim() === "OK"
    // }

    const hasPermission = !!req.locals?.hasPermission

    const heroResponse = await axiosInstance.get(heroUrl, {
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        }
    })
    const heroData = heroResponse.data
    // TODO: vaild heroData
    
    let profileData
    if(hasPermission){
        const profileResponse = await axiosInstance.get(profileUrl, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            }
        })
        profileData = profileResponse.data
    }
    // TODO: vaild profileData

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