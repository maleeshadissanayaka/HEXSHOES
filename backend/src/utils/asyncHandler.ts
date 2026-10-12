import type { NextFunction, RequestHandler, Response } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import type { AuthenticatedRequest } from "../types/request.js";

type AsyncRequestHandler<P extends ParamsDictionary> = (
  request: AuthenticatedRequest<P>,
  response: Response,
  next: NextFunction,
) => Promise<unknown>;

export const asyncHandler = <P extends ParamsDictionary = ParamsDictionary>(
  handler: AsyncRequestHandler<P>,
): RequestHandler<P> =>
  (request, response, next) => { void handler(request, response, next).catch(next); };
