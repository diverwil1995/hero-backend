import { NextFunction, Request, Response } from "express";
import { HeroClientError } from "../clients/hero.client";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(err.stack);

  let status = 500;
  let message = "Unknown error occurred";

  if (err instanceof HeroClientError) {
    status = 502;
    message = "Remote hero service unavailable";
  }

  res.status(status).json({
    status,
    message,
  });
};
