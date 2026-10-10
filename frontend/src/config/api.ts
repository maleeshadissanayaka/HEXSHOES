const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const apiConfig = Object.freeze({
  baseUrl:
    typeof configuredBaseUrl === "string" && configuredBaseUrl.trim() !== ""
      ? configuredBaseUrl.replace(/\/$/, "")
      : "http://localhost:5000/api",
});
