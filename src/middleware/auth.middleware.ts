import { Axios, AxiosInstance } from "axios"
import { NextFunction, Request, Response } from "express"

export type HeroRequest = Request & {
    locals?: {
        hasPermission?: boolean
    }
}

export const authMiddleware = (axiosInstance: AxiosInstance) => {
    return async (
        req: HeroRequest,
        res: Response,
        next: NextFunction
) => {
    const authData = {
        name: req.headers.name,
        password: req.headers.password
    }

    let hasPermission: boolean = false
    if(authData.name && authData.password) {
        // TODO: url params
        const authUrl: string = `https://hahow-recruit.herokuapp.com/auth`
        const authResponse = await axiosInstance.post(authUrl, authData, {
            headers: {
                "Content-Type": "application/json"
            }
        })
        const authResult = authResponse.data
        hasPermission = authResult.trim() === "OK"
    }
    if(req.locals === undefined) {
        req.locals = {}
    }
    // req.locals ??= {}
    req.locals.hasPermission = hasPermission
    next()
}
}