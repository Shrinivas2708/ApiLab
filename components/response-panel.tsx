"use client";

import { useRequestStore } from "@/stores/request-store";
import CodeMirror from "@uiw/react-codemirror";
import { monokai } from "@uiw/codemirror-theme-monokai";
import { EditorView } from "@codemirror/view";
import { detectResponseType } from "@/utils/detect-type";
import { formatResponse } from "@/utils/format-response";
import { Badge } from "./ui/badge";
import Image from "next/image"
export default function ResponsePanel() {
  const { response, loading, error } = useRequestStore();

  /* ----------------------------------------------------
   * LOADING / ERROR STATES
   * ---------------------------------------------------- */
  if (loading)
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground animate-pulse">
        Sending Request...
      </div>
    );

  if (error)
    return (
      <div className="h-full p-4 text-destructive border-l">
        <h3 className="font-bold">Error</h3>
        <p className="font-mono text-sm">{error}</p>
      </div>
    );

  if (!response)
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground border-l text-sm md:text-base">
        <p>Enter a URL and click Send to get a response.</p>
      </div>
    );
  const { isBinary, base64, data, contentType } = response;
  const type = detectResponseType(response.headers, isBinary, contentType);
  const { formatted, extension } = formatResponse(contentType, data);
  function renderContent() {
    if (["json", "xml", "html", "text"].includes(type)) {
      return (
        <CodeMirror
          value={formatted}
          theme={monokai}
          height="100%"
          extensions={ extension ? [extension, EditorView.lineWrapping] : [EditorView.lineWrapping] }
          editable={false}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLine: false,
            highlightActiveLineGutter: false,
          }}
          className="h-full"
          style={{
            fontSize: "12px",
            background: "transparent",
          }}
        />
      );
    }

    // IMAGE
    if (type === "image") {
      return (
        <div className="w-full h-full flex items-center justify-center bg-black">
          <Image
          alt="Unable to load "
            className="max-w-full max-h-full object-contain"
            src={`data:${contentType};base64,${base64}`}
          />
        </div>
      );
    }

    if (type === "video") {
      return (
        <video
          controls
          className="max-w-full max-h-full object-contain"
          src={`data:${contentType};base64,${base64}`}
        />
      );
    }

    if (type === "audio") {
      return <audio controls src={`data:${contentType};base64,${base64}`} />;
    }

    if (type === "pdf") {
      return (
        <iframe
          className="w-full h-full"
          src={`data:${contentType};base64,${base64}`}
        />
      );
    }

    return (
      <div className="p-4 text-muted-foreground">
        Unsupported Content Type: {contentType}
      </div>
    );
  }

  const statusColor =
    response.status >= 200 && response.status < 300
      ? "bg-green-500/10 text-green-500"
      : "bg-red-500/10 text-red-500";
  return (
    <div className="h-full flex flex-col border-l">
      <div className="flex items-center gap-4 p-3 border-b bg-muted/10 h-12 min-h-12">
        <Badge variant="outline" className={`${statusColor} border-0`}>
          {response.status} {response.statusText}
        </Badge>
        <div className="text-xs text-muted-foreground">
          Time:{" "}
          <span className={`${statusColor} bg-transparent hover:bg-transparent`}>
            {response.time}ms
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          Size:{" "}
          <span className={`${statusColor} bg-transparent hover:bg-transparent`}>
            {response.size} B
          </span>
        </div>
      </div>

      <div className="border-b text-xs px-2 py-1 bg-muted/10 text-muted-foreground">
        Response Body ({type})
      </div>

      <div className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 overflow-hidden">{renderContent()}</div>
      </div>
    </div>
  );
}
