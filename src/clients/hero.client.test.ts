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
});