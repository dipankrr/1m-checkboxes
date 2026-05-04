import Redis from "ioredis";

export function createRedisConnection() {
  return process.env.REDIS_URL
    ? new Redis(process.env.REDIS_URL)
    : new Redis({ host: "localhost", port: 6379 });
}

// export const redis = new createRedisConnection();
// export const publisher = new newRedisConnection();
// export const subscriber = new newRedisConnection();

