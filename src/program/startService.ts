import { Command, Option } from "commander";
import pino from "pino";
import { Schema } from "zod";
import { gracefullyShutdownOnSigTermAndSigInt } from "./gracefullyShutdownOnSigTermAndSigInt";

/**
 * Start a long-running service.
 */
export async function startService<T>({
  name,
  configurationOptions,
  configurationSchema,
  initialize,
}: {
  name: string;
  configurationOptions: Array<Option>;
  configurationSchema: Schema<T>;
  initialize: (
    configuration: T,
    logger: pino.Logger
  ) => Promise<{
    shutdown: () => Promise<void>;
  }>;
}) {
  const command = new Command();

  command.description(name);

  for (const option of configurationOptions) {
    command.addOption(option);
  }

  command.parse(process.argv);

  const configuration = configurationSchema.parse(command.opts());

  const logger = pino({
    level: "info",
    messageKey: "message",
  });

  logger.info({ configuration }, `Starting ${name}.`);

  const { shutdown } = await initialize(configuration, logger);

  logger.info(`${name} started.`);

  // catch uncaught exceptions (to prevent the process from crashing)
  process.on("uncaughtException", (error) => {
    logger.error(error, "Uncaught error.");
  });

  gracefullyShutdownOnSigTermAndSigInt({ logger, shutdown });
}
