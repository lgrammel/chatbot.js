import { FastifyInstance } from "fastify";
import zod from "zod";
import { OpenAIClient } from "../open-ai/OpenAIClient";
import { createNextId } from "../util/createNextId";
import Handlebars from "handlebars";

Handlebars.registerHelper({
  eq: (v1, v2) => v1 === v2,
  neq: (v1, v2) => v1 !== v2,
  lt: (v1, v2) => v1 < v2,
  gt: (v1, v2) => v1 > v2,
  lte: (v1, v2) => v1 <= v2,
  gte: (v1, v2) => v1 >= v2,
});

export const ChatPlugin = ({
  openAiClient,
  prompt,
}: {
  openAiClient: OpenAIClient;
  prompt: string;
}) =>
  async function plugin(server: FastifyInstance) {
    const logger = server.log;

    const nextId = createNextId();
    const chats = new Map<
      string,
      {
        id: string;
        messages: Array<{
          author: "bot" | "user";
          text: string;
        }>;
      }
    >();

    server.post("/chat", async function (request, reply) {
      const chat = { id: nextId(), messages: [] };
      chats.set(chat.id, chat);
      return chat;
    });

    server.get("/chat/:chatId", async function (request, reply) {
      const parameterSchema = zod.object({
        chatId: zod.string(),
      });

      const { chatId } = parameterSchema.parse(request.params);

      const chat = chats.get(chatId);

      if (chat == undefined) {
        reply.code(404);
        return;
      }

      return chat;
    });

    server.post("/chat/:chatId/message", async function (request, reply) {
      const parameterSchema = zod.object({
        chatId: zod.string(),
      });

      const { chatId } = parameterSchema.parse(request.params);

      const chat = chats.get(chatId);

      if (chat == undefined) {
        reply.code(404);
        return;
      }

      const bodySchema = zod.object({
        message: zod.string(),
      });

      const { message } = bodySchema.parse(request.body);

      chat.messages.push({
        author: "user",
        text: message,
      });

      const expandedPrompt = Handlebars.compile(prompt, {
        noEscape: true,
      })({
        messages: chat.messages,
      });

      console.log(expandedPrompt);

      const completionResult = await openAiClient.generateCompletion({
        prompt: expandedPrompt,
        model: "text-davinci-003",
        maxTokens: 256,
      });

      chat.messages.push({
        author: "bot",
        text: completionResult.completion,
      });

      return chat;
    });
  };
