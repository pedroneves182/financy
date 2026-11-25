import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { expressMiddleware } from "@as-integrations/express5";
import cors from "cors";
import express from "express";
import http from "node:http";
import { getUserIdFromAuthorization } from "./auth.js";
import { corsOrigins, env } from "./env.js";
import { prisma } from "./db.js";
import { resolvers, typeDefs, type GraphQLContext } from "./schema.js";

const app = express();
const httpServer = http.createServer(app);
const apollo = new ApolloServer<GraphQLContext>({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await apollo.start();

app.get("/health", (_request, response) => response.json({ status: "ok" }));
app.use(
  "/graphql",
  cors<cors.CorsRequest>({ origin: corsOrigins, credentials: true }),
  express.json(),
  expressMiddleware(apollo, {
    context: async ({ req }): Promise<GraphQLContext> => ({
      userId: getUserIdFromAuthorization(req.headers.authorization),
    }),
  }),
);

httpServer.listen(env.PORT, () => {
  console.log(`Financy API ready at http://localhost:${env.PORT}/graphql`);
});

async function shutdown(): Promise<void> {
  await apollo.stop();
  await prisma.$disconnect();
}

process.once("SIGINT", () => void shutdown().finally(() => process.exit(0)));
process.once("SIGTERM", () => void shutdown().finally(() => process.exit(0)));
