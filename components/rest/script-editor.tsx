import ReactCodeMirror from "@uiw/react-codemirror";

import { monokai } from "@uiw/codemirror-theme-monokai";
import { javascript } from "@codemirror/lang-javascript";
import { ScrollArea } from "../ui/scroll-area";
export default function ScriptEditor({
  value,
  onChange,
  snippets,
  helpText,
}: {
  value: string;
  onChange: (val: string) => void;
  snippets: { label: string; code: string }[];
  helpText: string;
}) {
  const handleSnippetClick = (code: string) => {
    const newValue = value ? `${value}\n${code}` : code;
    onChange(newValue);
  };

  return (
    <div className="flex h-full w-full">
      <div className="flex-1 border-r border-border/50 flex flex-col min-w-0">
        <ReactCodeMirror
          value={value || ""}
          height="100%"
          extensions={[javascript()]}
          onChange={onChange}
          theme={monokai}
          className="flex-1 text-sm"
          basicSetup={{
            lineNumbers: true,
            highlightActiveLine: true,
            foldGutter: true,
          }}
          style={{ fontSize: "13px", backgroundColor: "transparent" }}
        />
      </div>

      <div className="w-[280px] bg-muted/5 shrink-0 flex flex-col">
        <div className="p-4 border-b border-border/50">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Documentation
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {helpText}
          </p>
        </div>
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="px-4 py-3 pb-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Snippets
            </h3>
          </div>
          <ScrollArea className="flex-1">
            <div className="px-2 pb-4">
              {snippets.map((snippet, i) => (
                <button
                  key={i}
                  onClick={() => handleSnippetClick(snippet.code)}
                  className="w-full text-left px-3 py-2 text-xs text-primary hover:text-primary/80 hover:bg-primary/5 rounded-md transition-colors truncate"
                  title={snippet.label}
                >
                  {snippet.label}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
