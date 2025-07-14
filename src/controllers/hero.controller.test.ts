import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import express, { Application } from "express";
import request from "supertest";
import { HeroClient } from "../clients/hero.client";
import { createRouter } from "./hero.controller";



describe('heroController - 測試', () => {
    let app: Application
    const getHeroResponseBody = {
        id: "1",
        name: "Daredevil",
        image:
          "https://i.com/xlarge.jpg",
      }
    const getHeroListResponseBody = [getHeroResponseBody]
    const getHeroProfileResponseBody = {
        str: 2,
        int: 7,
        agi: 9,
        luk: 7,
      };

    beforeAll(() => {
        const axiosInstance = axios.create();
        const baseUrl = "http://test"
        const mockAxios = new MockAdapter(axiosInstance);
        const heroClient = new HeroClient(axiosInstance, baseUrl);
        const heroRouter = createRouter(heroClient);
        
        mockAxios.onGet(`${baseUrl}/heroes/${getHeroResponseBody.id}`).reply(200, getHeroResponseBody)
        mockAxios.onGet(`${baseUrl}/heroes`).reply(200, getHeroListResponseBody)
        mockAxios.onGet(`${baseUrl}/heroes/${getHeroResponseBody.id}/profile`).reply(200, getHeroProfileResponseBody)
        mockAxios.onPost(`${baseUrl}/auth`).reply(200, 'OK')

        app = express();
        app.use("/heroes", heroRouter)
        
    })
    describe('GET /heroes', () => {
        it('接收有授權的回應', async() => {
            const response = await request(app).get('/heroes').set('name', "hahow").set('password', 'rocks')
            
            expect(response.status).toEqual(200)
            expect(response.body).toStrictEqual({
                heroes: getHeroListResponseBody.map((hero) => {
                    return {
                        ...hero,
                        profile: getHeroProfileResponseBody
                    }
                })
            })
        })

        it('接收沒有授權的回應', async() => {
            const response = await request(app).get('/heroes')
            expect(response.status).toEqual(200)
            expect(response.body).toStrictEqual({
                heroes: getHeroListResponseBody
            })
        })
    })
    
    describe('GET /heroes/:heroId', () => {
        it('接收有授權的回應', async() => {
            const response = await request(app).get(`/heroes/${getHeroResponseBody.id}`).set('name', 'hahow').set('password', 'rocks')
            expect(response.status).toEqual(200)
            expect(response.body).toStrictEqual({
                ...getHeroResponseBody,
                profile: getHeroProfileResponseBody
            })
        })

        it('接收沒有授權的回應', async() => {
            const response = await request(app).get(`/heroes/${getHeroResponseBody.id}`)
            expect(response.status).toEqual(200)
            expect(response.body).toStrictEqual(getHeroResponseBody)
        })
    })

})
