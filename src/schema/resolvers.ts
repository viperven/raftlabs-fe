import bcrypt from "bcrypt";
import { User } from "../models/User";
import { generateToken } from "../utils/auth";

export const resolvers = {
  Query: {
    getUsers: async () => {
      return await User.find();
    },
  },
  Mutation: {
    register: async (_: any, { name, email, password }: any) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ name, email, password: hashedPassword });
      await user.save();
      return user;
    },
    login: async (_: any, { email, password }: any) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error("User not found");
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        throw new Error("Incorrect password");
      }

      return generateToken(user);
    },
  },
};
