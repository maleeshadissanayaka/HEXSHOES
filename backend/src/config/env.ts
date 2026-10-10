import "dotenv/config";

export type NodeEnvironment = "development" | "test" | "production";
export type ProductDataSource = "fixture" | "firestore";

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

const frontendOrigin = parseOrigin(process.env.FRONTEND_ORIGIN);
const developmentOrigins = new Set([
  frontendOrigin,
  "http://127.0.0.1:5173",
  "http://localhost:5173",
]);

const parseProductDataSource = (value: string | undefined): ProductDataSource => {
  if (value === undefined || value === "fixture") return "fixture";
  if (value === "firestore") return "firestore";
  throw new Error('PRODUCT_DATA_SOURCE must be either "fixture" or "firestore"');
};

export const env = Object.freeze({
  port: parsePort(process.env.PORT),
  nodeEnv: parseNodeEnvironment(process.env.NODE_ENV),
  frontendOrigin,
  allowedFrontendOrigins: Object.freeze(
    parseNodeEnvironment(process.env.NODE_ENV) === "production"
      ? [frontendOrigin]
      : [...developmentOrigins],
  ),
  productDataSource:
    process.env.VITEST === "true"
      ? "fixture"
      : parseProductDataSource(process.env.PRODUCT_DATA_SOURCE),
  firebase: Object.freeze({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
  }),
});
