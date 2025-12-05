"use client";
import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Code2, Copy, Check } from "lucide-react";
import { useRequestStore } from "@/stores/request-store";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";

export function CodeGenerator() {
  const { tabs, activeTabId } = useRequestStore();
  const activeTab = tabs.find(t => t.id === activeTabId);
  const [lang, setLang] = useState("curl");
  const [copied, setCopied] = useState(false);

  const generateCode = () => {
    if(!activeTab) return "";
    const url = activeTab.url;
    const method = activeTab.method;
    
    // Very basic generation logic (expand this using a library like httpsnippet)
    if(lang === "curl") {
        return `curl --request ${method} \\
  --url ${url} \\
  --header 'Content-Type: application/json'`;
    }
    if(lang === "javascript") {
        return `const options = {method: '${method}'};

fetch('${url}', options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));`;
    }
    return "";
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Generate Code">
            <Code2 size={18} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate Code Snippet</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <Select value={lang} onValueChange={setLang}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="curl">Shell - cURL</SelectItem>
                        <SelectItem value="javascript">JavaScript - Fetch</SelectItem>
                        <SelectItem value="python">Python - Requests</SelectItem>
                    </SelectContent>
                </Select>
                <Button size="sm" variant="outline" onClick={handleCopy}>
                    {copied ? <Check size={14} className="mr-2"/> : <Copy size={14} className="mr-2"/>}
                    {copied ? "Copied" : "Copy Code"}
                </Button>
            </div>

            <div className="border rounded-md overflow-hidden bg-[#282c34]">
                <CodeMirror 
                    value={generateCode()} 
                    height="300px" 
                    extensions={[javascript()]}
                    theme="dark"
                    editable={false}
                />
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}