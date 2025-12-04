"use client";

import { useRequestStore } from "@/stores/request-store";
import CodeMirror from "@uiw/react-codemirror";
import { monokai } from "@uiw/codemirror-theme-monokai";
import { EditorView } from "@codemirror/view";
import { detectResponseType } from "@/utils/detect-type";
import { formatResponse } from "@/utils/format-response";
import { Badge } from "./ui/badge";
import Image from "next/image";
import { useMemo } from "react";

export default function ResponsePanel() {
  const { response, loading, error, CORSError ,setReqMode} = useRequestStore();

  const { type, formatted, extension } = useMemo(() => {
    if (!response) return { type: "unknown", formatted: "", extension: null };

    const { isBinary, base64, data, contentType, headers } = response;
    const detectedType = detectResponseType(headers, isBinary, contentType);
    const { formatted: fmt, extension: ext } = formatResponse(
      contentType,
      data
    );

    return { type: detectedType, formatted: fmt, extension: ext };
  }, [response]);

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
  if (CORSError)
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <svg
        width="90"
        height="90"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="stroke-black dark:stroke-white/30"
      >
        <path
          d="M12 33C8.66666 33 4 31.5 4 25.5C4 18.5 11 17 13 17C14 13.5 16 8 24 8C31 8 34 12 35 15.5C35 15.5 44 16.5 44 25C44 31 40 33 36 33"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M29 28L19 38"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M19 28L29 38"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>

      <p className="mt-4 text-sm text-muted-foreground text-center">
        Network connection failed
      </p>
      <p className="text-xs text-muted-foreground">
        Switching network request mode to proxy
      </p>
    </div>
  );

  if (!response)
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground border-l text-sm md:text-base">
        <p>Enter a URL and click Send to get a response.</p>
      </div>
    );

  function renderContent() {
    if (["json", "xml", "html", "text"].includes(type)) {
      return (
        <CodeMirror
          value={formatted}
          theme={monokai}
          height="100%"
          extensions={
            extension
              ? [extension, EditorView.lineWrapping]
              : [EditorView.lineWrapping]
          }
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

    if (type === "image") {
      return (
        <div className="w-full h-full flex items-center justify-center bg-black">
          <Image
            alt="Unable to load"
            className="max-w-full max-h-full object-contain"
            src={`data:${response.contentType};base64,${response.base64}`}
            width={500}
            height={500}
          />
        </div>
      );
    }

    if (type === "video") {
      return (
        <video
          controls
          className="max-w-full max-h-full object-contain"
          src={`data:${response.contentType};base64,${response.base64}`}
        />
      );
    }

    if (type === "audio") {
      return (
        <audio
          controls
          src={`data:${response.contentType};base64,${response.base64}`}
        />
      );
    }

    if (type === "pdf") {
      return (
        <iframe
          className="w-full h-full"
          src={`data:${response.contentType};base64,${response.base64}`}
        />
      );
    }

    return (
      <div className="p-4 text-muted-foreground">
        Unsupported Content Type: {response.contentType}
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
          <span
            className={`${statusColor} bg-transparent hover:bg-transparent`}
          >
            {response.time}ms
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          Size:{" "}
          <span
            className={`${statusColor} bg-transparent hover:bg-transparent`}
          >
            {response.size} B
          </span>
        </div>
      </div>

      <div className="border-b text-xs px-2 py-1 bg-muted/10 text-muted-foreground">
        Response Body ({type})
      </div>

      <div className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 overflow-hidden">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
