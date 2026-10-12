import type { Request } from "express";
import type { ParamsDictionary, Query } from "express-serve-static-core";
import type { AuthenticatedUser } from "./auth.js";

export type AuthenticatedRequest<
  Params extends ParamsDictionary = ParamsDictionary,
  ResBody = unknown,
  ReqBody = Request["body"],
  ReqQuery extends Query = Request["query"],
> = Request<Params, ResBody, ReqBody, ReqQuery> & {
  authUser?: AuthenticatedUser;
};
