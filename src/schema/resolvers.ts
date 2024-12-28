import bcrypt from "bcrypt";
import { User } from "../models/User";
import { generateToken } from "../utils/auth";
import { redisClient } from "../utils/redis";

export const resolvers = {
  Query: {
    getUsers: async () => {
      const cacheKey = "users";

      // Check if users are cached
      const cachedUsers = await redisClient.get(cacheKey);
      if (cachedUsers) {
        console.log("Serving users from cache");
        return JSON.parse(cachedUsers);
      }

      // If not cached, fetch from MongoDB
      const users = await User.find();
      await redisClient.set(cacheKey, JSON.stringify(users), {
        EX: 3600, // Cache expires in 1 hour
      });

      console.log("Serving users from database");
      return users;
    },
  },
  Mutation: {
    register: async (_: any, { name, email, password }: any) => {
      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error("Email already in use");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Save new user to the database
      const user = new User({ name, email, password: hashedPassword });
      await user.save();

      // Clear cached users
      await redisClient.del("users");

      return user;
    },
    login: async (_: any, { email, password }: any) => {
      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error("User not found");
      }

      // Compare passwords
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        throw new Error("Invalid credentials");
      }

      // Generate JWT token
      return generateToken(user);
    },
  },
};
