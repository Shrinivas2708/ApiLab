import { json } from "@codemirror/lang-json";
import { xml } from "@codemirror/lang-xml";
import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";

export function formatResponse(contentType: string = "", data: any) {
  let formatted = "";
  let extension = null;

  if (!data) return { formatted: "", extension: null };

  const text = typeof data === "string" ? data : JSON.stringify(data);

  if (contentType.includes("application/json")) {
    try {
      formatted = JSON.stringify(
        typeof data === "string" ? JSON.parse(data) : data,
        null,
        2
      );
    } catch {
      formatted = text;
    }
    extension = json();
  }

  else if (
    contentType.includes("application/xml") ||
    contentType.includes("text/xml")
  ) {
    formatted = prettyXML(text);
    extension = xml();
  }

  else if (contentType.includes("text/html")) {
    formatted = prettyHTML(text);
    extension = html();
  }

  else if (contentType.includes("application/javascript")) {
    formatted = text;
    extension = javascript();
  }

  else {
    formatted = text;
    extension = null;
  }

  return { formatted, extension };
}

function prettyXML(input: string) {
  try {
    const P = new DOMParser();
    const xmlDoc = P.parseFromString(input, "application/xml");
    const serializer = new XMLSerializer();
    const xmlStr = serializer.serializeToString(xmlDoc);

    return xmlStr.replace(/(>)(<)(\/*)/g, "$1\n$2$3");
  } catch {
    return input;
  }
}

function prettyHTML(input: string) {
  return input
    .replace(/(>)(<)/g, "$1\n$2")
    .replace(/\n\s*\n/g, "\n");
}
