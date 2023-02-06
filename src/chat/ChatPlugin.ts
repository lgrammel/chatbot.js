import { FastifyInstance } from "fastify";
import zod from "zod";
import { createNextId } from "../util/createNextId";

export const ChatPlugin = () =>
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

      chat.messages.push({
        author: "bot",
        text: `${message.split("").reverse().join("")} ${chat.messages.length}`,
      });

      return chat;
    });
  };
