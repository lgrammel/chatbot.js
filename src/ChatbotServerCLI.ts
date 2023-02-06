#!/usr/bin/env node

import { Option } from "commander";
import Fastify from "fastify";
import hyperid from "hyperid";
import fs from "node:fs/promises";
import zod from "zod";
import { ChatPlugin } from "./chat/ChatPlugin";
import { OpenAIClient } from "./open-ai/OpenAIClient";
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
    new Option("--open-ai-api-key <string>", "OpenAI API key")
      .env("OPEN_AI_API_KEY")
      .makeOptionMandatory(),
    new Option("--template-folder <string>", "Template folder")
      .env("TEMPLATE_FOLDER")
      .makeOptionMandatory(),
  ],
  configurationSchema: zod.object({
    host: zod.string(),
    port: zod.number(),
    openAiApiKey: zod.string(),
    templateFolder: zod.string(),
  }),
  async initialize({ templateFolder, openAiApiKey, host, port }, logger) {
    const server = Fastify({
      logger,

      // Generate custom request IDs. This is required to distinguish between
      // requests made on different pods in a Kubernetes cluster.
      genReqId: hyperid(),

      // Unified key for the request ID in the logs:
      requestIdLogLabel: "requestId",
    });

    server.register(
      ChatPlugin({
        openAiClient: new OpenAIClient({
          apiKey: openAiApiKey,
          logger,
        }),
        prompt: await fs.readFile(`${templateFolder}/prompt.template`, "utf-8"),
      })
    );

    await server.listen({ host, port });

    return {
      async shutdown() {
        await server.close(); // wait for requests to be finished
      },
    };
  },
});
