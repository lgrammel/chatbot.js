import axios from "axios";
import { Logger } from "pino";
import { Schema } from "zod";
import { OpenAICompletionSchema } from "./OpenAICompletion";

export class OpenAIClient {
  private readonly apiKey: string;
  private readonly logger: Logger;

  constructor({ apiKey, logger }: { apiKey: string; logger: Logger }) {
    this.apiKey = apiKey;
    this.logger = logger;
  }

  private async postToApi<T>({
    path,
    content,
    schema,
    user,
    requestId,
    debug,
  }: {
    path: string;
    content: unknown;
    schema: Schema<T>;
    user: string | undefined;
    requestId: string | undefined;
    debug: boolean | undefined;
  }): Promise<T> {
    try {
      this.logger.info(
        {
          path,
          user,
          requestId,
        },
        "OpenAIClient.postToApi started"
      );

      if (debug === true) {
        this.logger.debug(
          {
            path,
            content,
            user,
            requestId,
          },
          "OpenAIClient.postToApi started"
        );
      }

      const startMilliseconds = Date.now();

      const response = await axios.post(
        `https://api.openai.com${path}`,
        content,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      const durationInMilliseconds = Date.now() - startMilliseconds;

      this.logger.info(
        {
          path,
          user,
          requestId,
          durationInMilliseconds,
        },
        "OpenAIClient.postToApi finished"
      );

      const result = response.data;

      if (debug === true) {
        this.logger.debug(
          {
            path,
            user,
            requestId,
            response: result,
            durationInMilliseconds,
          },
          "OpenAIClient.postToApi finished"
        );
      }

      return schema.parse(result);
    } catch (error) {
      this.logger.error({ error }, "OpenAI API call failed");
      throw error;
    }
  }

  async generateCompletion({
    model,
    prompt,
    maxTokens,
    temperature = 0,
    stop = undefined,
    user = undefined,
    requestId = undefined,
    debug,
  }: {
    model: string;
    prompt: string;
    maxTokens: number;
    temperature?: number;
    stop?: string[] | undefined;
    user?: string | undefined;
    requestId?: string | undefined;
    debug?: boolean | undefined;
  }): Promise<{
    completion: string;
    usage: {
      model: string;
      totalTokens: number;
      promptTokens: number;
      completionTokens: number;
    };
  }> {
    const result = await this.postToApi({
      path: "/v1/completions",
      content: {
        model,
        prompt,
        max_tokens: maxTokens,
        temperature,
        // top_p is excluded because temperature is set
        best_of: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        stop,
        user,
      },
      schema: OpenAICompletionSchema,
      user,
      requestId,
      debug,
    });

    return {
      completion: result.choices[0].text,
      usage: {
        model: result.model,
        totalTokens: result.usage.total_tokens,
        promptTokens: result.usage.prompt_tokens,
        completionTokens: result.usage.completion_tokens,
      },
    };
  }
}
