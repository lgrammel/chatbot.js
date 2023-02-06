import { FastifyInstance } from "fastify";
import zod from "zod";
import { createNextId } from "../util/createNextId";

export const ChatPlugin = () =>
  async function plugin(server: FastifyInstance) {
    const logger = server.log;

    const nextId = createNextId();
    const chats = new Map<string, true>();

    server.post("/chat", async function (request, reply) {
      const chatId = nextId();
      chats.set(chatId, true);
      return { id: chatId };
    });

    server.get("/chat/:id", async function (request, reply) {
      const parameterSchema = zod.object({
        id: zod.string(),
      });

      const { id } = parameterSchema.parse(request.params);

      if (!chats.has(id)) {
        reply.code(404);
        return;
      }

      return { id };
    });
  };
