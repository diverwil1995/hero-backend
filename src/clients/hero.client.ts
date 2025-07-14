import { AxiosError, AxiosInstance } from "axios";
import { array, InferType, number, object, string, ValidationError } from "yup";

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

export class HeroClient implements HeroClientInterface {
  private axiosInstance: AxiosInstance;
  private baseUrl: string;

  constructor(axiosInstance: AxiosInstance, baseUrl: string) {
    this.axiosInstance = axiosInstance;
    this.baseUrl = baseUrl;
  }

  async getHero(heroId: string): Promise<HeroResponse> {
    // TODO: 將 url 寫入 constructor
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
      throw new HeroClientError(error.toString());
    }
  }

  async getHeroList(): Promise<HeroesResponse> {
    try {
      // TODO: 將 url 寫入 constructor
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
      const validatedResponse = await getAuthDataSchema.validate(
        authResponse.data,
      );

      return validatedResponse === "OK";
    } catch (error: any) {
      if (error?.response?.status === 401) {
        return false;
      }
      throw new HeroClientError(error.toString());
    }
  }
}
