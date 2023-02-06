import { FastifyInstance } from "fastify";

export const ChatPlugin = () =>
  async function plugin(server: FastifyInstance) {
    const logger = server.log;

    server.post("/chat", async function (request, reply) {
      logger.info("CREATE CHAT");
    });
  };
