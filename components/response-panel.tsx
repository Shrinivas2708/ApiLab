"use client";

import { useRequestStore } from "@/stores/request-store";
import React from "react";
import { Badge } from "./ui/badge";
import CodeMirror from "@uiw/react-codemirror";
import { monokai } from "@uiw/codemirror-theme-monokai";
import { formatResponse } from "@/utils/format-response";
import { EditorView } from "@codemirror/view";

function ResponsePanel() {
  const { response, loading, error } = useRequestStore();

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground animate-pulse">
        Sending Request...
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full p-4 text-destructive border-l">
        <h3 className="font-bold">Error</h3>
        <p className="font-mono text-sm">{error}</p>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground border-l">
        <p>Enter a URL and click Send to get a response.</p>
      </div>
    );
  }

  const statusColor =
    response.status >= 200 && response.status < 300
      ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
      : "bg-red-500/10 text-red-500 hover:bg-red-500/20";
  const contentType = response.headers?.["content-type"] || "";
  const { formatted, extension } = formatResponse(contentType, response.data);

  return (
    <div className="h-full flex flex-col border-l">
      <div className="flex items-center gap-4 p-3 border-b bg-muted/10 h-12 min-h-12">
        <Badge variant="outline" className={`${statusColor} border-0`}>
          {response.status} {response.statusText}
        </Badge>
        <div className="text-xs text-muted-foreground">
          Time:{" "}
          <span className={`${statusColor} bg-transparent`}>
            {response.time}ms
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          Size:{" "}
          <span className={`${statusColor} bg-transparent`}>
            {response.size} B
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 p-0 overflow-hidden">
          {/* <SyntaxHighlighter
            language="html"
            style={oneDark}
            wrapLongLines={true}
            customStyle={{
              background: "transparent",
              fontSize: "12px",
              margin: 0,
              padding: 0,
              whiteSpace: "pre-wrap",
              overflowX: "hidden",
              wordBreak: "break-word",
            }}
            codeTagProps={{
              style: { whiteSpace: "pre-wrap", wordBreak: "break-word" },
            }}
          >
            {JSON.stringify(response.data, null, 2)}
          </SyntaxHighlighter> */}
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
            className="!h-full"
            style={{
              fontSize: "12px",
              background: "transparent",
              height: "100%",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default ResponsePanel;
