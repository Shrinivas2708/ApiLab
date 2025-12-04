
export type ResponseLike = {
  isBinary?: boolean;
  base64?: string | null;
  data?: any;
  contentType?: string | null;
  filename?: string | null;
};

// --- Mime Map ---
const MIME_TO_EXT: Record<string, string> = {
  "application/json": "json",
  "application/pdf": "pdf",
  "text/plain": "txt",
  "text/html": "html",
  "text/csv": "csv",
  "text/javascript": "js",
  "application/javascript": "js",
  "application/xml": "xml",
  "text/xml": "xml",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/x-matroska": "mkv",
  "video/quicktime": "mov",
  "video/x-msvideo": "avi",
  "audio/mpeg": "mp3",
  "audio/wav": "wav",
  "application/zip": "zip",
};

// --- Helpers ---

function sanitizeFilename(name: string) {
  return name.replace(/[\/\\?%*:|"<>]/g, "-");
}

function extFromMime(mime?: string | null): string {
  if (!mime) return "txt"; 
  const normalized = mime.split(";")[0].trim().toLowerCase();
  
  if (MIME_TO_EXT[normalized]) return MIME_TO_EXT[normalized];

  const parts = normalized.split("/");
  if (parts.length === 2) {
    const subtype = parts[1].split("+")[0]; 
    return subtype.replace("x-", ""); 
  }
  
  return "bin";
}

function base64ToBlob(base64: string, contentType = "application/octet-stream"): Blob {
  const byteCharacters = atob(base64);
  const byteLength = byteCharacters.length;
  const slices: BlobPart[] = [];
  const sliceSize = 1024 * 32; 

  for (let offset = 0; offset < byteLength; offset += sliceSize) {
    const end = Math.min(offset + sliceSize, byteLength);
    const slice = new Uint8Array(end - offset);
    for (let i = offset; i < end; i++) {
      slice[i - offset] = byteCharacters.charCodeAt(i);
    }
    slices.push(slice);
  }

  return new Blob(slices, { type: contentType });
}


export async function handleDownload(
  response: ResponseLike | null | undefined, 
  suggestedFilename?: string
) {
  if (!response) return;

  const { isBinary, base64, data, contentType, filename } = response;
  const finalFilenameBase = sanitizeFilename(suggestedFilename || filename || "response");
  const mime = (contentType && contentType.trim()) || "application/octet-stream";

  try {
    let blob: Blob | null = null;
    let extension = extFromMime(mime);

    if (isBinary && base64) {
      blob = base64ToBlob(base64, mime);
    } 
    else if (data instanceof Blob) {
      blob = data;
      if (blob.type) extension = extFromMime(blob.type);
    } 
    else if (typeof data === "object" && data !== null) {
      const jsonText = JSON.stringify(data, null, 2);
      blob = new Blob([jsonText], { type: "application/json" });
      extension = "json";
    } 
    else if (typeof data === "string") {
      blob = new Blob([data], { type: mime.includes("text") ? mime : "text/plain" });
    } 
    else {
      blob = new Blob([""], { type: mime });
    }

    if (!blob) throw new Error("Failed to create download blob");

    const finalName = `${finalFilenameBase}.${extension}`;
    const url = URL.createObjectURL(blob);
    
    
    const link = document.createElement("a");
    
    link.href = url;
    link.download = finalName;
    link.style.display = "none"; 
    console.log(link);
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);

  } catch (err) {
    console.error("Download failed:", err);
  }
}