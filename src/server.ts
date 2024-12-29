import { ApolloServer } from "apollo-server";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { typeDefs } from "./schema/typeDefs";
import { resolvers } from "./schema/resolvers";
import { connectDB } from "./utils/connectDB";
import { connectRedis } from "./utils/redis";
import http from "http";
import { Server } from "socket.io";
import cors from "cors"; // CORS for handling cross-origin requests

(async () => {
  try {
    // Connect to MongoDB and Redis
    await connectDB();
    await connectRedis();

    // Create schema and Apollo Server
    const schema = makeExecutableSchema({ typeDefs, resolvers });
    const apolloServer = new ApolloServer({ schema });

    // Create an HTTP server
    const app = http.createServer();

    // Initialize Socket.IO with CORS
    const io = new Server(app, {
      cors: {
        origin: "http://localhost:5173", // Your React frontend URL
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    // Socket.IO middleware for JWT authentication
    io.use((socket, next) => {
      const token = socket.handshake.auth.token as string;
      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      try {
        // Replace this logic with your JWT verification
        socket.data.user = { id: "dummy-user" }; // Mock user data
        next();
      } catch (err) {
        return next(new Error("Authentication error: Invalid token"));
      }
    });

    // Handle WebSocket connections
    io.on("connection", (socket) => {
      console.log(`WebSocket connected: ${socket.id}`);

      // Join a room
      socket.on("joinRoom", (room) => {
        socket.join(room);
        io.to(room).emit("message", `User ${socket.id} joined the room`);
      });

      // Send messages
      socket.on("sendMessage", ({ room, message }) => {
        io.to(room).emit("message", message);
      });

      // Handle disconnect
      socket.on("disconnect", () => {
        console.log(`WebSocket disconnected: ${socket.id}`);
      });
    });

    // Start Apollo Server
    apolloServer.listen({ port: 7000 }).then(({ url }) => {
      console.log(`🚀 GraphQL API ready at ${url}`);
      console.log("WebSocket server running on ws://localhost:7000");
    });
  } catch (error) {
    console.error("Error starting the server:", error);
    process.exit(1);
  }
})();
