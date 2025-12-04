"use client";

import { useRequestStore } from "@/stores/request-store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { xml } from "@codemirror/lang-xml";
import { monokai } from "@uiw/codemirror-theme-monokai";
import { KeyValueTable } from "./key-value-table";
import { Layers, FileUp, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export default function ReqBody() {
  const store = useRequestStore();
  const activeTab = store.tabs.find((t) => t.id === store.activeTabId);

  if (!activeTab) return null;

  const handleTypeChange = (val: string) => {
    // This store action now automatically updates the Headers in the store too
    store.setBodyType(val as any);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        store.setBinaryFile(result); 
      };
      reader.readAsDataURL(file);
    }
  };

  const clearFile = () => {
    store.setBinaryFile(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 ">
        <span className="text-xs font-medium text-muted-foreground">Content Type:</span>
        <Select value={activeTab.bodyType} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-[220px] h-8 text-xs ">
            <SelectValue placeholder="Select Body Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="json">application/json</SelectItem>
            <SelectItem value="xml">application/xml</SelectItem>
            <SelectItem value="text">text/plain</SelectItem>
            <SelectItem value="form-data">multipart/form-data</SelectItem>
            <SelectItem value="x-www-form-urlencoded">x-www-form-urlencoded</SelectItem>
            <SelectItem value="binary">application/octet-stream</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-hidden relative p-1">
        {activeTab.bodyType === "none" && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
            <Layers size={48} className="mb-4 stroke-1" />
            <p>This request does not have a body</p>
          </div>
        )}

        {["json", "xml", "text"].includes(activeTab.bodyType) && (
          <CodeMirror
            value={activeTab.body}
            height="100%"
            theme={monokai}
            extensions={
              activeTab.bodyType === "json" ? [json()] : 
              activeTab.bodyType === "xml" ? [xml()] : []
            }
            onChange={(val) => store.setBody(val)}
            className="h-full text-sm bg-muted-foreground/5!"
            style={{ backgroundColor: 'red'  }}
          />
        )}

        {["form-data", "x-www-form-urlencoded"].includes(activeTab.bodyType) && (
          <KeyValueTable 
            items={activeTab.bodyParams} 
            setItems={store.setBodyParams} 
          />
        )}

        {activeTab.bodyType === "binary" && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            {!activeTab.binaryFile ? (
              <div className="flex flex-col items-center gap-4 border-2 border-dashed border-muted-foreground/20 rounded-lg p-10 hover:bg-muted/5 transition-colors">
                <FileUp size={48} className="text-muted-foreground" />
                <div className="text-center space-y-1">
                  <p className="text-sm font-medium">Select a file to upload</p>
                  <p className="text-xs text-muted-foreground">Any file type supported</p>
                </div>
                <Input 
                  type="file" 
                  className="max-w-[250px] cursor-pointer" 
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 bg-muted/10 p-8 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/10 rounded flex items-center justify-center">
                    <FileUp size={20} className="text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">File Selected</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {activeTab.binaryFile.substring(0, 30)}...
                    </p>
                  </div>
                </div>
                <Button variant="destructive" size="sm" onClick={clearFile} className="gap-2">
                  <Trash2 size={14} /> Remove File
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}