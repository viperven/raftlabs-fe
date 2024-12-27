import express from "express";
import { graphqlHTTP } from "express-graphql";
import { buildSchema } from "graphql";

const app = express();

// GraphQL schema
const schema = buildSchema(`
  type Query {
    hello: String
  }
`);

// Resolvers
const root = {
  hello: () => {
    return "Hello, World!";
  },
};

// Middleware
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true, // Enable GraphiQL UI for testing
  })
);

// Start the server
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}/graphql`);
});
