import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { ParamsDictionary } from "express-serve-static-core";

type AsyncRequestHandler<P extends ParamsDictionary> = (
  request: Request<P>,
  response: Response,
  next: NextFunction,
) => Promise<unknown>;

export const asyncHandler = <P extends ParamsDictionary = ParamsDictionary>(
  handler: AsyncRequestHandler<P>,
): RequestHandler<P> =>
  (request, response, next) => { void handler(request, response, next).catch(next); };
