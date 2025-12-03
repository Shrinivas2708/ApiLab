import { json } from "@codemirror/lang-json";
import { html } from "@codemirror/lang-html";
import { xml } from "@codemirror/lang-xml";
import { javascript } from "@codemirror/lang-javascript";

export function formatResponse(contentType: string, data: any) {
  let formatted = "";
  let extension = null;

  if (!data) return { formatted: "", extension: null };

  const text = typeof data === "string" ? data : JSON.stringify(data);

  if (contentType.includes("json")) {
    extension = json();
    formatted = JSON.stringify(data, null, 2);
  } else if (contentType.includes("html")) {
    extension = html();
    formatted = text.replace(/></g, ">\n<");
  } else if (contentType.includes("xml")) {
    extension = xml();
    formatted = text.replace(/></g, ">\n<");
  } else if (contentType.includes("javascript")) {
    extension = javascript();
    formatted = text;
  } else {
    formatted = text;
  }

  return { formatted, extension };
}
