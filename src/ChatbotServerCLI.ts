import { Option } from "commander";
import Fastify from "fastify";
import hyperid from "hyperid";
import zod from "zod";
import { ChatPlugin } from "./chat/ChatPlugin";
import { startService } from "./program/startService";

startService({
  name: "Chatbot server",
  configurationOptions: [
    new Option("--port <number>", "port number")
      .env("PORT")
      .argParser((value) => +value)
      .makeOptionMandatory(),
    new Option("--host <string>", "host name")
      .env("HOST")
      .makeOptionMandatory(),
  ],
  configurationSchema: zod.object({ host: zod.string(), port: zod.number() }),
  async initialize(configuration, logger) {
    const server = Fastify({
      logger,

      // Generate custom request IDs. This is required to distinguish between
      // requests made on different pods in a Kubernetes cluster.
      genReqId: hyperid(),

      // Unified key for the request ID in the logs:
      requestIdLogLabel: "requestId",
    });

    server.register(ChatPlugin());

    await server.listen({ host: configuration.host, port: configuration.port });

    return {
      async shutdown() {
        await server.close(); // wait for requests to be finished
      },
    };
  },
});
