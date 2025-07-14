import dotenv from 'dotenv';
import { createApp } from "./app.js";
import { isProduction, newConfigFromEnv } from "./config.js";
import { startServer } from "./server.js";

if(!isProduction()) {
    dotenv.config()
}
const config = newConfigFromEnv()
const app = createApp(config)

// 啟動服務器
startServer(app, config.port);
