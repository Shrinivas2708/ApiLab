"use client";
import { useRequestStore } from "@/stores/request-store";
import CodeMirror from "@uiw/react-codemirror";
import { monokai } from "@uiw/codemirror-theme-monokai";
import { EditorView } from "@codemirror/view";
import { detectResponseType } from "@/utils/detect-type";
import { formatResponse } from "@/utils/format-response";
import { Badge } from "./ui/badge";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Check, Copy, Download, Eraser, Eye } from "lucide-react";
import { handleDownload } from "@/utils/download";
import { EyeOff } from "./icons/eye-off";

const transparentBg = EditorView.theme({
  "&": {
    backgroundColor: "transparent !important"
  },
  ".cm-scroller": {
    backgroundColor: "transparent !important"
  }
});

type ResponseTab = "data" | "raw" | "headers";

export default function ResponsePanel() {
  const store = useRequestStore();
  const [isCopied, setIsCopied] = useState(false);
  const [previewHtml, setPreviewHtml] = useState(false);
  // 1. Add state for the tabs
  const [activeResponseTab, setActiveResponseTab] = useState<ResponseTab>("data");

  // Get Active Tab Data
  const activeTab = store.tabs.find((t) => t.id === store.activeTabId);
  const response = activeTab?.response || null;
  const loading = activeTab?.loading || false;
  const error = activeTab?.error || null;
  const CORSError = activeTab?.CORSError || false;

  const { type, formatted, extension } = useMemo(() => {
    if (!response) return { type: "unknown", formatted: "", extension: null };

    const { isBinary, data, contentType, headers } = response;
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
       <div className="h-full flex flex-col items-center justify-center border-l">
        <p className="text-sm text-muted-foreground">Network Error (CORS)</p>
        <p className="text-sm text-muted-foreground">Switching to proxy</p>
       </div>
    );

  if (!response)
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground border-l text-sm md:text-base">
        <p>Enter a URL and click Send to get a response.</p>
      </div>
    );

  const handleCopy = async () => {
    if (!formatted) return;
    try {
      await navigator.clipboard.writeText(formatted);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  function renderHeaders() {
    if (!response?.headers) return <div className="p-4 text-muted-foreground">No headers found.</div>;
    
    const headerEntries = Object.entries(response.headers);

    return (
      <div className="h-full overflow-auto p-0">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground bg-muted/20 uppercase sticky top-0 backdrop-blur-sm">
            <tr>
              <th className="px-4 py-3 font-medium">Key</th>
              <th className="px-4 py-3 font-medium">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {headerEntries.map(([key, value], index) => (
              <tr key={`${key}-${index}`} className="hover:bg-muted/10">
                <td className="px-4 py-2 font-mono text-muted-foreground whitespace-nowrap align-top">{key}</td>
                <td className="px-4 py-2 break-all text-foreground font-mono">{String(value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function renderContent() {
    if (activeResponseTab === "headers") {
      return renderHeaders();
    }

    if (activeResponseTab === "raw") {
      return (
        <CodeMirror
          value={typeof formatted === 'string' ? formatted : "Binary Data (Cannot view raw text)"}
          theme={monokai}
          height="100%"
          extensions={[EditorView.lineWrapping]}
          editable={false}
          basicSetup={{ lineNumbers: true, highlightActiveLine: false }}
          className="h-full"
          style={{ fontSize: "12px", background: "transparent" }}
        />
      );
    }

    if (["json", "xml", "text"].includes(type)) {
      return (
        <CodeMirror
          value={formatted}
          theme={monokai}
          height="100%"
          extensions={extension ? [extension, EditorView.lineWrapping] : [EditorView.lineWrapping]}
          editable={false}
          basicSetup={{ lineNumbers: true, highlightActiveLine: false, highlightActiveLineGutter: false }}
          className="h-full"
          style={{ fontSize: "12px", background: "transparent" }}
        />
      );
    }
    
    if (type === "html") {
      return previewHtml ? (
        <iframe srcDoc={formatted} frameBorder="0" className="w-full h-full bg-white" title="HTML Preview" />
      ) : (
        <CodeMirror
          value={formatted}
          theme={monokai}
          height="100%"
          extensions={extension ? [extension, EditorView.lineWrapping] : [EditorView.lineWrapping]}
          editable={false}
          basicSetup={{ lineNumbers: true, highlightActiveLine: false, highlightActiveLineGutter: false }}
          className="h-full"
          style={{ fontSize: "12px", background: "transparent" }}
        />
      );
    }
    
    if (type === "image") {
      return (
        <div className="w-full h-full flex items-center justify-center bg-black/20">
          <Image
            alt="Response Preview"
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
        <div className="w-full h-full flex items-center justify-center bg-black">
            <video controls className="max-w-full max-h-full" src={`data:${response.contentType};base64,${response.base64}`} />
        </div>
      );
    }

    if (type === "audio") {
      return (
        <div className="w-full h-full flex items-center justify-center bg-muted/10">
            <audio controls src={`data:${response.contentType};base64,${response.base64}`} className="w-96" />
        </div>
      );
    }

    if (type === "pdf") {
      return <iframe className="w-full h-full" src={`data:${response.contentType};base64,${response.base64}`} />;
    }

    return <div className="p-4 text-muted-foreground">Unsupported Content Type: {response.contentType}</div>;
  }

  function renderOptions() {
    if (activeResponseTab === "headers") return null;

    if (["json", "xml", "text"].includes(type) || activeResponseTab === "raw") {
      return (
        <div className="flex gap-2">
          <Download className="h-4 w-4 hover:text-foreground cursor-pointer" onClick={() => handleDownload(response)} />
          {isCopied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4 hover:text-foreground cursor-pointer" onClick={handleCopy} />
          )}
          <Eraser className="h-4 w-4 hover:text-foreground cursor-pointer" onClick={() => store.setResponse(null)} />
        </div>
      );
    }

    if (type === "html" && activeResponseTab === "data") {
      return (
        <div className="flex gap-2">
          {previewHtml ? (
            <EyeOff className="h-4 w-4 hover:text-foreground cursor-pointer" onClick={() => setPreviewHtml(!previewHtml)} />
          ) : (
            <Eye className="h-4 w-4 hover:text-foreground cursor-pointer" onClick={() => setPreviewHtml(!previewHtml)} />
          )}
          <Download className="h-4 w-4 hover:text-foreground cursor-pointer" onClick={() => handleDownload(response)} />
          <Eraser className="h-4 w-4 hover:text-foreground cursor-pointer" onClick={() => store.setResponse(null)} />
        </div>
      );
    }

    return (
      <div className="flex gap-2">
        <Download className="h-4 w-4 hover:text-foreground cursor-pointer" onClick={() => handleDownload(response)} />
        <Eraser className="h-4 w-4 hover:text-foreground cursor-pointer" onClick={() => store.setResponse(null)} />
      </div>
    );
  }

  const statusColor = response.status >= 200 && response.status < 300 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500";

  return (
    <div className="h-full flex flex-col border-l">
      <div className="flex items-center gap-4 p-3 bg-muted/10 h-12 min-h-12 border-b">
        <Badge variant="outline" className={`${statusColor} border-0`}>
          {response.status} {response.statusText}
        </Badge>
        <div className="text-xs text-muted-foreground">
          Time: <span className={`${statusColor} bg-transparent hover:bg-transparent`}>{response.time}ms</span>
        </div>
        <div className="text-xs text-muted-foreground">
          Size:{" "}
          <span className={`${statusColor} bg-transparent hover:bg-transparent`}>
            {response.size < 1000
              ? `${response.size} B`
              : response.size < 1000000
              ? `${(response.size / 1000).toFixed(2)} KB`
              : response.size < 1000000000
              ? `${(response.size / 1000000).toFixed(2)} MB`
              : `${(response.size / 1000000000).toFixed(2)} GB`}
          </span>
        </div>
      </div>

      <div className="text-sm border-b px-2 text-muted-foreground bg-muted/10">
        <ul className="flex gap-1">
          {(['data', 'raw', 'headers'] as const).map((tab) => (
            <li
              key={tab}
              onClick={() => setActiveResponseTab(tab)}
              data-state={activeResponseTab === tab ? "active" : "inactive"}
              className={`
                cursor-pointer px-4 py-2 border-b-2 border-transparent hover:text-foreground transition-colors
                data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:font-medium
              `}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </li>
          ))}
        </ul>
      </div>

      <div className="border-b text-xs px-2 py-1 bg-muted/10 text-muted-foreground flex justify-between items-center h-8">
        <p>
          {activeResponseTab === 'headers' ? 'Response Headers' : `Response Body (${type})`}
        </p>
        <div>{renderOptions()}</div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 overflow-hidden">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}