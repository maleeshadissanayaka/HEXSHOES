import type { RequestHandler } from "express";

export const notFound: RequestHandler = (_request, response) => {
  response.status(404).json({ success: false, error: { message: "Route not found" } });
};
