import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { HeroClient, HeroClientError } from './hero.client';

describe('HeroClient - auth() 方法測試', () => {
  let heroClient: HeroClient;
  let mockAxios: MockAdapter;
  const baseUrl = 'https://hahow-recruit.herokuapp.com';

  beforeEach(() => {
    const axiosInstance = axios.create();
    mockAxios = new MockAdapter(axiosInstance);
    heroClient = new HeroClient(axiosInstance, baseUrl);
  });

  afterEach(() => {
    mockAxios.reset();
  });

  describe('認證功能測試', () => {
    it('正確帳密應該回傳 true', async () => {
      const correctName = 'hahow';
      const correctPassword = 'rocks';
      const expectedRequestData = { name: correctName, password: correctPassword };
      
      mockAxios.onPost(`${baseUrl}/auth`, expectedRequestData).reply(200, 'OK');

      const result = await heroClient.auth(correctName, correctPassword);

      expect(result).toBe(true);

      expect(mockAxios.history.post).toHaveLength(1);
      expect(mockAxios.history.post[0].url).toBe(`${baseUrl}/auth`);
      expect(JSON.parse(mockAxios.history.post[0].data)).toEqual(expectedRequestData);
    });

    it('錯誤帳密（401 錯誤）應該回傳 false', async () => {
      const wrongName = 'wrong';
      const wrongPassword = 'wrong';
      const requestData = { name: wrongName, password: wrongPassword };
      
      mockAxios.onPost(`${baseUrl}/auth`, requestData).reply(401, { error: 'Unauthorized' });

      const result = await heroClient.auth(wrongName, wrongPassword);

      expect(result).toBe(false);
      
      expect(mockAxios.history.post).toHaveLength(1);
      expect(mockAxios.history.post[0].url).toBe(`${baseUrl}/auth`);
    });
    
    it('上游回傳無效格式應該拋出 HeroClientError', async () => {
      const correctName = 'hahow';
      const correctPassword = 'rocks';
      const expectedRequestData = { name: correctName, password: correctPassword };

      mockAxios.onPost(`${baseUrl}/auth`, expectedRequestData).reply(200, { code: 1000, message: "Backend Error"});
      expect(heroClient.auth(correctName, correctPassword)).rejects.toThrow(HeroClientError)

      expect(mockAxios.history.post).toHaveLength(1);
      expect(mockAxios.history.post[0].url).toBe(`${baseUrl}/auth`);
    })
  });

  describe('取得 Profile 功能測試', () => {
    it('正確的 heroId 應該回傳 profile 資料', async () => {
      const heroId = '1';
      const expectedProfileData = {
        str: 2,
        int: 7,
        agi: 9,
        luk: 7
      };
      
      mockAxios.onGet(`${baseUrl}/heroes/${heroId}/profile`).reply(200, expectedProfileData);
  
      const result = await heroClient.getProfile(heroId);
  
      expect(result).toEqual(expectedProfileData);
  
      expect(mockAxios.history.get).toHaveLength(1);
      expect(mockAxios.history.get[0].url).toBe(`${baseUrl}/heroes/${heroId}/profile`);
    });

    it('不存在的 heroId 應該拋出 HeroClientError (404)', async () => {
      const nonExistentHeroId = '999';
      
      mockAxios.onGet(`${baseUrl}/heroes/${nonExistentHeroId}/profile`).reply(404, { error: 'Hero not found' });
  
      await expect(heroClient.getProfile(nonExistentHeroId)).rejects.toThrow(HeroClientError);
  
      expect(mockAxios.history.get).toHaveLength(1);
      expect(mockAxios.history.get[0].url).toBe(`${baseUrl}/heroes/${nonExistentHeroId}/profile`);
    });

    it('上游回傳無效格式應該拋出 HeroClientError', async () => {
      const heroId = '1';
      const invalidProfileData = {
        str: undefined,
        int: 7,
        agi: 9,
        luk: 7
      };
      
      mockAxios.onGet(`${baseUrl}/heroes/${heroId}/profile`).reply(200, invalidProfileData);

      await expect(heroClient.getProfile(heroId)).rejects.toThrow(HeroClientError);

      expect(mockAxios.history.get).toHaveLength(1);
      expect(mockAxios.history.get[0].url).toBe(`${baseUrl}/heroes/${heroId}/profile`);
    });
  })
});