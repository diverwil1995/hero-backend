import express from 'express';
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

    // curl -H "Accept: application/json" -H "Content-Type: application/json" -X GET https://hahow-recruit.herokuapp.com/heroes/1
    const url: string = `https://hahow-recruit.herokuapp.com/heroes/${heroId}`
    const response = await axiosInstance.get(url, {
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        }
    })
    const data = response.data
    if(data.id) {}

    if("id" in data) {}

    if(typeof data.id === "string") {}
    
    if(data.id) {
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

app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl
    })
})

app.use(errorHandler)

console.log('App configured successfully')

export default app