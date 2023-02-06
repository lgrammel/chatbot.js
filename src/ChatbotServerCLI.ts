import zod from "zod";
import { startService } from "./program/startService";

startService({
  name: "Chatbot server",
  configurationOptions: [],
  configurationSchema: zod.object({}),
  async initialize(configuration, logger) {
    logger.info("Hello world!");

    return {
      async shutdown() {},
    };
  },
});
