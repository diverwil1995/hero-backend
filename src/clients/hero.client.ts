import { AxiosInstance } from "axios"
import { error } from "console";
import { object, array, number, string, InferType } from 'yup';

const getHeroSchema = object ({
    id: string().required(),
    name: string().required(),
    image: string().url().required()
}).exact()

export type HeroResponse = InferType<typeof getHeroSchema>

const getHeroesSchema = array().of(getHeroSchema).min(1).required()

export type HeroesResponse = InferType<typeof getHeroesSchema>

const getProfileSchema = object({
    str: number().positive().integer().required(),
    int: number().positive().integer().required(),
    agi: number().positive().integer().required(),
    luk: number().positive().integer().required()
}).exact()

export type ProfileResponse = InferType<typeof getProfileSchema>

export interface HeroClientInterface {
    getHero(heroId: string): Promise<HeroResponse>
    getHeroList(): Promise<HeroesResponse>
    getProfile(heroId: string): Promise<ProfileResponse>
    auth(name: string, password: string): Promise<boolean>
}
export class HeroClientError extends Error {}

export class HeroClient implements HeroClientInterface {
    private axiosInstance: AxiosInstance

    constructor(axiosInstance: AxiosInstance) {
        this.axiosInstance=axiosInstance
    }
    
    async getHero(heroId: string): Promise<HeroResponse> {
        const heroUrl: string = `https://hahow-recruit.herokuapp.com/heroes/${heroId}`
        try{
            const heroResponse = await this.axiosInstance.get(heroUrl, {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                }
            })
            const validatedResponse = await getHeroSchema.validate(heroResponse.data)
            return validatedResponse
        } catch(error: any) {
            throw new HeroClientError(error.toString())
        }
    }

    async getHeroList(): Promise<HeroesResponse> {
        try{    
            const heroUrl: string = `https://hahow-recruit.herokuapp.com/heroes`
            const heroesResponse = await this.axiosInstance.get(heroUrl, {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                }
            })
            const validatedResponse = await getHeroesSchema.validate(heroesResponse.data)
            return validatedResponse
        } catch(error: any) {
            throw new HeroClientError(error.toString())
        }
    }

    async getProfile(heroId: string): Promise<ProfileResponse> {
        const profileUrl: string = `https://hahow-recruit.herokuapp.com/heroes/${heroId}/profile`
            try{
            const profileResponse = await this.axiosInstance.get(profileUrl, {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                }
            })
            const validatedResponse = await getProfileSchema.validate(profileResponse.data)
            return validatedResponse
        } catch(error: any) {
            throw new HeroClientError(error.toString())
        }
    }

    async auth(name: string, password: string): Promise<boolean> {
        const authData = {name, password}
        const authUrl = `https://hahow-recruit.herokuapp.com/auth`
        try{
            const authResponse = await this.axiosInstance.post(authUrl, authData, {
                headers: {
                    "Content-Type": "application/json"
                }
            })
            const authResult = authResponse.data
            return authResult.trim() === "OK"
        } catch {
            return false
        }
    }
}