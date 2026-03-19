"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./loadEnv");
const http_1 = __importDefault(require("http"));
const server_1 = __importDefault(require("./server"));
const db_1 = require("./lib/db");
const port = process.env.PORT || 5000;
async function start() {
    await (0, db_1.connectDB)();
    const server = http_1.default.createServer(server_1.default);
    server.listen(port, () => console.log(`API listening on ${port}`));
}
start().catch((err) => {
    console.error("Startup error", err);
    process.exit(1);
});
