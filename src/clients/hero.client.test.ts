import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import {
  HeroClient,
  HeroClientError,
  HeroClientNotFoundError,
} from "./hero.client.js";

describe("HeroClient - 測試", () => {
  let heroClient: HeroClient;
  let mockAxios: MockAdapter;
  const baseUrl = "https://test";

  beforeEach(() => {
    const axiosInstance = axios.create();
    mockAxios = new MockAdapter(axiosInstance);
    heroClient = new HeroClient(axiosInstance, baseUrl);
  });

  describe("認證功能測試", () => {
    it("正確帳密應該回傳 true", async () => {
      const correctName = "hahow";
      const correctPassword = "rocks";
      const expectedRequestData = {
        name: correctName,
        password: correctPassword,
      };

      mockAxios.onPost(`${baseUrl}/auth`, expectedRequestData).reply(200, "OK");

      const result = await heroClient.auth(correctName, correctPassword);

      expect(result).toBe(true);

      expect(mockAxios.history.post).toHaveLength(1);
      expect(mockAxios.history.post[0].url).toBe(`${baseUrl}/auth`);
      expect(JSON.parse(mockAxios.history.post[0].data)).toEqual(
        expectedRequestData,
      );
    });

    it("錯誤帳密（401 錯誤）應該回傳 false", async () => {
      const wrongName = "wrong";
      const wrongPassword = "wrong";
      const requestData = { name: wrongName, password: wrongPassword };

      mockAxios
        .onPost(`${baseUrl}/auth`, requestData)
        .reply(401, { error: "Unauthorized" });

      const result = await heroClient.auth(wrongName, wrongPassword);

      expect(result).toBe(false);

      expect(mockAxios.history.post).toHaveLength(1);
      expect(mockAxios.history.post[0].url).toBe(`${baseUrl}/auth`);
    });

    it("上游回傳無效格式應該拋出 HeroClientError", async () => {
      const correctName = "hahow";
      const correctPassword = "rocks";
      const expectedRequestData = {
        name: correctName,
        password: correctPassword,
      };

      mockAxios
        .onPost(`${baseUrl}/auth`, expectedRequestData)
        .reply(200, { code: 1000, message: "Backend Error" });

      await expect(
        heroClient.auth(correctName, correctPassword),
      ).rejects.toThrow(HeroClientError);

      expect(mockAxios.history.post).toHaveLength(1);
      expect(mockAxios.history.post[0].url).toBe(`${baseUrl}/auth`);
    });
  });

  describe("取得 Profile 功能測試", () => {
    it("正確的 heroId 應該回傳 profile 資料", async () => {
      const heroId = "1";
      const expectedProfileData = {
        str: 2,
        int: 7,
        agi: 9,
        luk: 7,
      };

      mockAxios
        .onGet(`${baseUrl}/heroes/${heroId}/profile`)
        .reply(200, expectedProfileData);

      const result = await heroClient.getProfile(heroId);

      expect(result).toEqual(expectedProfileData);

      expect(mockAxios.history.get).toHaveLength(1);
      expect(mockAxios.history.get[0].url).toBe(
        `${baseUrl}/heroes/${heroId}/profile`,
      );
    });

    it("不存在的 heroId 應該拋出 HeroClientNotFoundError (404)", async () => {
      const nonExistentHeroId = "999";

      mockAxios
        .onGet(`${baseUrl}/heroes/${nonExistentHeroId}/profile`)
        .reply(404, { error: "Hero not found" });

      await expect(heroClient.getProfile(nonExistentHeroId)).rejects.toThrow(
        HeroClientNotFoundError,
      );

      expect(mockAxios.history.get).toHaveLength(1);
      expect(mockAxios.history.get[0].url).toBe(
        `${baseUrl}/heroes/${nonExistentHeroId}/profile`,
      );
    });

    it("上游回傳無效格式應該拋出 HeroClientError", async () => {
      const heroId = "1";
      const invalidProfileData = {
        str: undefined,
        int: 7,
        agi: 9,
        luk: 7,
      };

      mockAxios
        .onGet(`${baseUrl}/heroes/${heroId}/profile`)
        .reply(200, invalidProfileData);

      await expect(heroClient.getProfile(heroId)).rejects.toThrow(
        HeroClientError,
      );

      expect(mockAxios.history.get).toHaveLength(1);
      expect(mockAxios.history.get[0].url).toBe(
        `${baseUrl}/heroes/${heroId}/profile`,
      );
    });
  });

  describe("取得單一 Hero 功能測試", () => {
    it("正確的 heroId 應該回傳 hero 資料", async () => {
      const heroId = "1";
      const expectedHeroData = {
        id: "1",
        name: "Daredevil",
        image:
          "https://i.annihil.us/u/prod/marvel/i/mg/6/90/537ba6d49472b/standard_xlarge.jpg",
      };

      mockAxios
        .onGet(`${baseUrl}/heroes/${heroId}`)
        .reply(200, expectedHeroData);

      const result = await heroClient.getHero(heroId);

      expect(result).toEqual(expectedHeroData);

      expect(mockAxios.history.get).toHaveLength(1);
      expect(mockAxios.history.get[0].url).toBe(`${baseUrl}/heroes/${heroId}`);
    });

    it("不存在的 heroId 應該拋出 HeroClientNotFoundError (404)", async () => {
      const nonExistentHeroId = "999";

      mockAxios
        .onGet(`${baseUrl}/heroes/${nonExistentHeroId}`)
        .reply(404, { error: "Hero not found" });

      await expect(heroClient.getHero(nonExistentHeroId)).rejects.toThrow(
        HeroClientNotFoundError,
      );

      expect(mockAxios.history.get).toHaveLength(1);
      expect(mockAxios.history.get[0].url).toBe(
        `${baseUrl}/heroes/${nonExistentHeroId}`,
      );
    });

    it("缺少必要欄位應該拋出 HeroClientError", async () => {
      const heroId = "1";
      const incompleteHeroData = {
        id: "1",
        name: "Daredevil",
      };

      mockAxios
        .onGet(`${baseUrl}/heroes/${heroId}`)
        .reply(200, incompleteHeroData);

      await expect(heroClient.getHero(heroId)).rejects.toThrow(HeroClientError);

      expect(mockAxios.history.get).toHaveLength(1);
      expect(mockAxios.history.get[0].url).toBe(`${baseUrl}/heroes/${heroId}`);
    });
  });

  describe("取得 Hero 列表功能測試", () => {
    it("應該回傳有效的 heroes 陣列", async () => {
      const expectedHeroesData = [
        {
          id: "1",
          name: "Daredevil",
          image:
            "https://i.annihil.us/u/prod/marvel/i/mg/6/90/537ba6d49472b/standard_xlarge.jpg",
        },
        {
          id: "2",
          name: "Thor",
          image:
            "https://i.annihil.us/u/prod/marvel/i/mg/5/a0/537bc7036ab02/standard_xlarge.jpg",
        },
        {
          id: "3",
          name: "Iron Man",
          image:
            "https://i.annihil.us/u/prod/marvel/i/mg/6/a0/55b6a25e654e6/standard_xlarge.jpg",
        },
      ];

      mockAxios.onGet(`${baseUrl}/heroes`).reply(200, expectedHeroesData);

      const result = await heroClient.getHeroList();

      expect(result).toEqual(expectedHeroesData);
      expect(result).toHaveLength(3);

      expect(mockAxios.history.get).toHaveLength(1);
      expect(mockAxios.history.get[0].url).toBe(`${baseUrl}/heroes`);
    });

    it("缺少必要欄位應該拋出 HeroClientError", async () => {
      const incompleteHeroesData = [
        {
          id: "1",
          name: "Daredevil",
          // 缺少 image 欄位
        },
        {
          id: "2",
          name: "Thor",
          image:
            "https://i.annihil.us/u/prod/marvel/i/mg/5/a0/537bc7036ab02/standard_xlarge.jpg",
        },
      ];

      mockAxios.onGet(`${baseUrl}/heroes`).reply(200, incompleteHeroesData);

      await expect(heroClient.getHeroList()).rejects.toThrow(HeroClientError);

      expect(mockAxios.history.get).toHaveLength(1);
      expect(mockAxios.history.get[0].url).toBe(`${baseUrl}/heroes`);
    });

    it("非陣列格式應該拋出 HeroClientError", async () => {
      const invalidFormatData = {
        heroes: [
          {
            id: "1",
            name: "Daredevil",
            image:
              "https://i.annihil.us/u/prod/marvel/i/mg/6/90/537ba6d49472b/standard_xlarge.jpg",
          },
        ],
      };

      mockAxios.onGet(`${baseUrl}/heroes`).reply(200, invalidFormatData);

      await expect(heroClient.getHeroList()).rejects.toThrow(HeroClientError);

      expect(mockAxios.history.get).toHaveLength(1);
      expect(mockAxios.history.get[0].url).toBe(`${baseUrl}/heroes`);
    });
  });
});
