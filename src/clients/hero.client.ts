import { AxiosInstance } from "axios";
import { array, InferType, number, object, string } from "yup";

const getHeroSchema = object({
  id: string().required(),
  name: string().required(),
  image: string().url().required(),
}).exact();

export type HeroResponse = InferType<typeof getHeroSchema>;

const getHeroesSchema = array().of(getHeroSchema).min(1).required();

export type HeroesResponse = InferType<typeof getHeroesSchema>;

const getProfileSchema = object({
  str: number().positive().integer().required(),
  int: number().positive().integer().required(),
  agi: number().positive().integer().required(),
  luk: number().positive().integer().required(),
}).exact();

export type ProfileResponse = InferType<typeof getProfileSchema>;

const getAuthDataSchema = string().required();

export type authResponse = InferType<typeof getAuthDataSchema>;

export interface HeroClientInterface {
  getHero(heroId: string): Promise<HeroResponse>;
  getHeroList(): Promise<HeroesResponse>;
  getProfile(heroId: string): Promise<ProfileResponse>;
  auth(name: string, password: string): Promise<boolean>;
}
export class HeroClientError extends Error {}

export class HeroClientNotFoundError extends Error {}

export class HeroClient implements HeroClientInterface {
  private axiosInstance: AxiosInstance;
  private baseUrl: string;

  constructor(axiosInstance: AxiosInstance, baseUrl: string) {
    this.axiosInstance = axiosInstance;
    this.baseUrl = baseUrl;
  }

  async getHero(heroId: string): Promise<HeroResponse> {
    const heroUrl: string = `${this.baseUrl}/heroes/${heroId}`;
    try {
      const heroResponse = await this.axiosInstance.get(heroUrl, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      const validatedResponse = await getHeroSchema.validate(heroResponse.data);
      return validatedResponse;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        throw new HeroClientNotFoundError(error.toString());
      }
      throw new HeroClientError(error.toString());
    }
  }

  async getHeroList(): Promise<HeroesResponse> {
    try {
      const heroUrl: string = `${this.baseUrl}/heroes`;
      const heroesResponse = await this.axiosInstance.get(heroUrl, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      const validatedResponse = await getHeroesSchema.validate(
        heroesResponse.data,
      );
      return validatedResponse;
    } catch (error: any) {
      throw new HeroClientError(error.toString());
    }
  }

  async getProfile(heroId: string): Promise<ProfileResponse> {
    const profileUrl: string = `${this.baseUrl}/heroes/${heroId}/profile`;
    try {
      const profileResponse = await this.axiosInstance.get(profileUrl, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      const validatedResponse = await getProfileSchema.validate(
        profileResponse.data,
      );
      return validatedResponse;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        throw new HeroClientNotFoundError(error.toString());
      }
      throw new HeroClientError(error.toString());
    }
  }

  async auth(name: string, password: string): Promise<boolean> {
    const authData = { name, password };
    const authUrl = `${this.baseUrl}/auth`;
    try {
      const authResponse = await this.axiosInstance.post(authUrl, authData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      // 上游 API 有時會返回 HTTP 200 但內容為錯誤訊息 {code: 1000, message: "Backend Error"}
      // 因此需要透過 schema validation 來檢查回應資料結構的正確性
      // 如果資料結構不符預期，將拋出 ValidationError 進入 catch 區塊處理
      const validatedResponse = await getAuthDataSchema.validate(
        authResponse.data,
      );

      return validatedResponse === "OK";
    } catch (error: any) {
      // 區分真正的 401 認證失敗與偽裝成 200 的後端錯誤
      if (error?.response?.status === 401) {
        return false;
      }
      throw new HeroClientError(error.toString());
    }
  }
}
