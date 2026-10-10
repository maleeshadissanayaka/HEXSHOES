import "dotenv/config";

export type NodeEnvironment = "development" | "test" | "production";

const parseNodeEnvironment = (value: string | undefined): NodeEnvironment =>
  value === "production" || value === "test" || value === "development" ? value : "development";

const parsePort = (value: string | undefined): number => {
  const port = Number(value ?? 5000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }
  return port;
};

const parseOrigin = (value: string | undefined): string => {
  try {
    return new URL(value ?? "http://127.0.0.1:5173").origin;
  } catch {
    throw new Error("FRONTEND_ORIGIN must be a valid URL");
  }
};

export const env = Object.freeze({
  port: parsePort(process.env.PORT),
  nodeEnv: parseNodeEnvironment(process.env.NODE_ENV),
  frontendOrigin: parseOrigin(process.env.FRONTEND_ORIGIN),
});
