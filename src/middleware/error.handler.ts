import { Request, Response, NextFunction } from 'express';
import { HeroClientError } from '../clients/hero.client';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error(err.stack)
    
    let status = 500
    let message = "Unknown error occurred"

    if(err instanceof HeroClientError) {
        status = 503
        message = "Remote service unavailable"
    }

    res.status(status).json({
        message,
    })
}