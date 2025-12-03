export function detectResponseType(headers: any, isBinary: boolean, contentType: string) {
  if (!headers) return "unknown";

  if (!contentType) contentType = headers["content-type"] || "";

  if (contentType.includes("application/json")) return "json";
  if (contentType.includes("text/html")) return "html";
  if (contentType.includes("text/xml") || contentType.includes("application/xml"))
    return "xml";
  if (contentType.startsWith("text/")) return "text";

  if (contentType.startsWith("image/")) return "image";
  if (contentType.startsWith("video/")) return "video";
  if (contentType.startsWith("audio/")) return "audio";

  if (contentType.includes("pdf")) return "pdf";
  if (contentType.includes("octet-stream")) return "binary";

  return isBinary ? "binary" : "text";
}
