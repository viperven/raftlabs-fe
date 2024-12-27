import { createClient } from "redis";

export const redisClient = createClient();

redisClient.on("error", (err) => console.error("Redis Client Error", err));

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log("Redis connected successfully!");
  } catch (error) {
    console.error("Redis connection failed:", error);
    process.exit(1);
  }
};
