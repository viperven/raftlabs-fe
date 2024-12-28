import bcrypt from "bcrypt";
import { User } from "../models/User";
import { generateToken } from "../utils/auth";
import { redisClient } from "../utils/redis";

export const resolvers = {
  Query: {
    getUsers: async () => {
      const cacheKey = "users";
      const cachedUsers = await redisClient.get(cacheKey);
      if (cachedUsers) return JSON.parse(cachedUsers);

      const users = await User.find();
      await redisClient.set(cacheKey, JSON.stringify(users), { EX: 3600 });
      return users;
    },
  },
  Mutation: {
    register: async (_: any, { name, email, password }: any) => {
      const existingUser = await User.findOne({ email });
      if (existingUser) throw new Error("Email already in use");

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ name, email, password: hashedPassword });
      await newUser.save();

      await redisClient.del("users"); // Invalidate cache
      return newUser;
    },
    login: async (_: any, { email, password }: any) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error("User not found");

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) throw new Error("Invalid credentials");

      return generateToken(user);
    },
  },
};
