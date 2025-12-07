"use client";

import { useGraphqlStore } from "@/stores/graphql-store";
import { useMemo } from "react";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { monokai } from "@uiw/codemirror-theme-monokai";
import { buildClientSchema, printSchema } from "graphql";
import { javascript } from "@codemirror/lang-javascript"; 

export default function GraphqlSchemaView() {
  const store = useGraphqlStore();
  const activeTab = store.tabs.find(t => t.id === store.activeTabId);
  const schema = activeTab?.schema;

  const sdl = useMemo(() => {
    if (!schema) return "";
    try {
      console.log(schema.queryType, schema.types?.length, schema.directives);

      const clientSchema = buildClientSchema({ __schema: schema });
     
      return printSchema(clientSchema);
    } catch (e) {
      console.error("Failed to parse schema", e);
      return "# Error generating Schema SDL. The introspection result might be incomplete.";
    }
  }, [schema]);

  if (!schema) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
        <div className="max-w-xs text-sm">
          No Schema available. <br/>
          Enter a URL and click <span className="font-bold text-foreground">Connect</span> to fetch the schema.
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col ">
       <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
         <span>Schema SDL</span>
         <span className="text-[10px] font-normal opacity-70">Read-only</span>
       </div>
       <div className="flex-1 relative overflow-hidden">
         <CodeMirror
            value={sdl}
            height="100%"
            theme={monokai}
            extensions={[javascript(),EditorView.lineWrapping]} 
            editable={false}
            className="h-full text-sm"
            basicSetup={{
                lineNumbers: true,
                foldGutter: true,
                highlightActiveLine: false
            }}
         />
       </div>
    </div>
  );
}