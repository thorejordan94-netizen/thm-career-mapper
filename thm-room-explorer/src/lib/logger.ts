import pino from "pino";

const isPretty = process.env.NODE_ENV !== "production";

export const logger = pino(
  isPretty
    ? {
        transport: {
          target: "pino-pretty",
          options: { colorize: true, translateTime: "SYS:standard" },
        },
      }
    : undefined,
);

