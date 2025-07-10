import { startServer } from './server.js';
import app from './app.js';

const PORT = process.env.PORT || 3000;

// 啟動服務器
startServer(app, PORT);