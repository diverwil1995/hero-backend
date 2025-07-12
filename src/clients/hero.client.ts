import { AxiosInstance } from "axios"

export interface HeroClientInterface {
    getHero(heroId: string): Promise<any>
    getHeroList(): Promise<any[]>
    getProfile(heroId: string): Promise<any>
    auth(name: string, password: string): Promise<boolean>
}

export class HeroClient implements HeroClientInterface {
    private axiosInstance: AxiosInstance

    constructor(axiosInstance: AxiosInstance) {
        this.axiosInstance=axiosInstance
    }
    
    // TODO: vaild heroData
    async getHero(heroId: string): Promise<any> {
        const heroUrl: string = `https://hahow-recruit.herokuapp.com/heroes/${heroId}`
        const heroResponse = await this.axiosInstance.get(heroUrl, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            }
        })
        return heroResponse.data
    }

    // TODO: vaild heroListData
    async getHeroList(): Promise<any[]> {
        const heroUrl: string = `https://hahow-recruit.herokuapp.com/heroes`
        const heroResponse = await this.axiosInstance.get(heroUrl, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            }
        })
        return heroResponse.data
    }

    async getProfile(heroId: string): Promise<any> {
        const profileUrl: string = `https://hahow-recruit.herokuapp.com/heroes/${heroId}/profile`
        const profileResponse = await this.axiosInstance.get(profileUrl, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            }
        })
        return profileResponse.data
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