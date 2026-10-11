import { Router } from "express";
import multer from "multer";
import { env } from "../config/env.js";
import { searchImage, searchMultimodal, searchText } from "../controllers/visualSearch.controller.js";

const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: env.aiService.maxImageBytes, files: 1 }, fileFilter: (_request, file, callback) => {
  if (allowed.has(file.mimetype)) callback(null, true);
  else callback(new Error("INVALID_IMAGE_TYPE"));
} });
const uploadStatus = (error: unknown) => error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
export const visualSearchRouter = Router();
visualSearchRouter.post("/", (request, response, next) => upload.single("image")(request, response, (error) => {
  if (!error) { next(); return; }
  const message = error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE" ? "Image exceeds the 5 MB limit" : error instanceof multer.MulterError && error.code === "LIMIT_UNEXPECTED_FILE" ? "Exactly one image file is required" : "Only JPEG, PNG, and WebP images are supported";
  response.status(uploadStatus(error)).json({ success: false, error: { message } });
}), searchImage);
visualSearchRouter.post("/text", searchText);
visualSearchRouter.post("/multimodal", (request, response, next) => upload.single("image")(request, response, (error) => {
  if (!error) { next(); return; }
  const message = error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE" ? "Image exceeds the 5 MB limit" : error instanceof multer.MulterError && error.code === "LIMIT_UNEXPECTED_FILE" ? "Exactly one image file is allowed" : "Only JPEG, PNG, and WebP images are supported";
  response.status(uploadStatus(error)).json({ success: false, error: { message } });
}), searchMultimodal);
