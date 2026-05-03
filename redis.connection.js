import Redis from "ioredis";

export function createRedisConnection() {
  return process.env.REDIS_URL
    ? new Redis(process.env.REDIS_URL)
    : new Redis("redis://default:ZbNOIsamIdLjIcUP2wZdNx85S2YILHH3@redis-15809.c264.ap-south-1-1.ec2.cloud.redislabs.com:15809")
    // : new Redis({ host: "localhost", port: 6379 });
}

// export const redis = new createRedisConnection();
// export const publisher = new newRedisConnection();
// export const subscriber = new newRedisConnection();

