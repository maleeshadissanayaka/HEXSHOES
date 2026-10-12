import type { AuthenticatedUser } from "./auth.js";

declare module "express-serve-static-core" {
  interface Request {
    authUser?: AuthenticatedUser;
  }
}

export {};
