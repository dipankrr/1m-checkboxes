import http from "node:http"
import app from "./app.js";
import { createRedisConnection } from "./redis.connection.js";

const server = http.createServer(app)
const redis = createRedisConnection()

export {server, redis}
