import { NextFunction, Request, Response } from "express";
import { HeroClient } from "../clients/hero.client";

export type HeroRequest = Request & {
  locals?: {
    hasPermission?: boolean;
  };
};

export const authMiddleware = (heroClient: HeroClient) => {
  return async (req: HeroRequest, res: Response, next: NextFunction) => {
    const name = req.headers.name;
    const password = req.headers.password;

    let hasPermission: boolean = false;
    if (typeof name === "string" && typeof password === "string") {
      hasPermission = await heroClient.auth(name, password);
    }
    if (req.locals === undefined) {
      req.locals = {};
    }
    // req.locals ??= {}
    req.locals.hasPermission = hasPermission;
    next();
  };
};
