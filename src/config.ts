export type Config = {
    heroApiBaseUrl: string
    port: string
    isProduction: boolean
}

export function newConfigFromEnv(): Config {
    const heroApiBaseUrl = process.env.HERO_API_BASE_URL
    if(!heroApiBaseUrl) {
    throw new Error('HERO_API_BASE_URL environment variable is required')
    }
    
    return {
        heroApiBaseUrl,
        port: process.env.PORT || "3000",
        isProduction: isProduction()
    }
}

export function isProduction(): boolean {
    return process.env.NODE_ENV === "production"
}