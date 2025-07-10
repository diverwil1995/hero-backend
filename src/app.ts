import express, { response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import axios from 'axios';
import { errorHandler } from './middleware/error.middleware';

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

type SingleHeroResponse = {
    id: string,
    name: string,
    image: string
}

app.get('/heroes/:heroId', async (req, res) => {
    
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
    if(data.id) {}

    if("id" in data) {}

    if(typeof data.id === "string") {}
    
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

app.get('/heroes', async (req, res) => {
    const url: string = `https://hahow-recruit.herokuapp.com/heroes`

    const response = await axiosInstance.get(url, {
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        }
    })
    const data = response.data
    console.log(data)

    res.json("it works")
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