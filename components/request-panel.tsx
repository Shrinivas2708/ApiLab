"use client";
import { useRef, useState } from "react";
import { useRequestStore, KeyValue } from "@/stores/request-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Save, X, Globe, Server, ChevronDown } from "lucide-react";
import { KeyValueTable } from "./key-value-table";
import { TabBar } from "./tabs/tab-bar";
import ReqBody from "./req-body";
import AuthPanel from "./auth-panel";
import { replaceVariables } from "@/utils/variable-replacer";
import { useSession } from "next-auth/react";
import { SaveRequestDialog } from "./save-request-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import ScriptEditor from "./script-editor"
const HTTP_METHODS = [
  { type: "GET", color: "text-green-500 " },
  { type: "POST", color: "text-blue-500 " },
  { type: "PUT", color: "text-yellow-500 " },
  { type: "PATCH", color: "text-purple-500 " },
  { type: "DELETE", color: "text-red-500 " },
  { type: "HEAD", color: "text-gray-500 " },
  { type: "OPTIONS", color: "text-indigo-500 " },
];

const PRE_REQ_SNIPPETS = [
    { label: "Set an environment variable", code: `apilab.variables.set("variable_key", "variable_value");` },
    { label: "Get an environment variable", code: `const value = apilab.variables.get("variable_key");` },
    { label: "Clear a variable", code: `apilab.variables.set("variable_key", "");` },
    { label: "Log to console", code: `console.log("Request starting...");` },
];

const POST_REQ_SNIPPETS = [
    { label: "Status code is 200", code: `if (apilab.response.status === 200) {\n  console.log("Success: Status is 200");\n} else {\n  console.log("Fail: Status is " + apilab.response.status);\n}` },
    { label: "Get response body", code: `const body = apilab.response.body;\nconsole.log(body);` },
    { label: "Get response header", code: `const contentType = apilab.response.headers["content-type"];` },
    { label: "Check response time < 200ms", code: `if (apilab.response.time < 200) {\n  console.log("Response was fast!");\n}` },
];




function RequestPanel() {
  const { data: session } = useSession();
  const store = useRequestStore();
  const activeTab = store.tabs.find((t) => t.id === store.activeTabId);
  const method = activeTab?.method || "GET";
  const reqMode = activeTab?.reqMode || "browser";
  const queryParams = activeTab?.queryParams || [];
  const headers = activeTab?.headers || [];
  const loading = activeTab?.loading || false;
  const variables = activeTab?.variables || [];
  const abortRef = useRef<AbortController | null>(null);
  
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
const activeEnv = store.environments.find(e => e._id === store.activeEnvId);
  
  const getMergedVariables = (currentTabVars: KeyValue[]) => {
      const map = new Map<string, string>();
      store.globalVariables.forEach(v => { if(v.enabled && v.key) map.set(v.key, v.value); });
      if(activeEnv) {
          activeEnv.variables.forEach(v => { if(v.enabled && v.key) map.set(v.key, v.value); });
      }
      currentTabVars.forEach(v => { if(v.enabled && v.key) map.set(v.key, v.value); });
      return Object.fromEntries(map);
  };
  const runScript = (script: string, context: any) => {
    try {
        if (!script || script.trim() === "") return;
        const func = new Function('apilab', script);
        func(context);
    } catch (err: any) {
        console.error("Script execution failed:", err);
    }
  };

  const handleSend = async () => {
    if (!activeTab) return;
    store.setLoading(true);
    store.setError(null);
    store.setCORSError(false);
    
   const currentTabVars = [...activeTab.variables];
    const createSandbox = (vars: KeyValue[], response: any = null) => ({
        variables: {
            get: (key: string) => vars.find(v => v.key === key && v.enabled)?.value,
            set: (key: string, value: string) => {
                const idx = vars.findIndex(v => v.key === key);
                if (idx > -1) {
                    vars[idx] = { ...vars[idx], value, enabled: true };
                } else {
                    vars.push({ id: crypto.randomUUID(), key, value, enabled: true });
                }
            }
        },
        response: response
    });

    if (activeTab.preRequestScript) {
        runScript(activeTab.preRequestScript, createSandbox(currentTabVars));
        store.setVariables(currentTabVars);
    }

   const variableMap = getMergedVariables(currentTabVars);
    const url = replaceVariables(activeTab.url, variableMap);
    const headers = activeTab.headers || [];
    const queryParams = activeTab.queryParams || [];

    const controller = new AbortController();
    abortRef.current = controller;
    const startTime = performance.now();

    try {
      const headerObj = headers.reduce((acc, curr) => {
        if (curr.enabled && curr.key) {
            acc[replaceVariables(curr.key, variableMap)] = replaceVariables(curr.value, variableMap);
        }
        return acc;
      }, {} as Record<string, string>);

      const paramObj = queryParams.reduce((acc, curr) => {
        if (curr.enabled && curr.key) {
            acc[replaceVariables(curr.key, variableMap)] = replaceVariables(curr.value, variableMap);
        }
        return acc;
      }, {} as Record<string, string>);

    
      const auth = activeTab.auth || { type: 'none' };
      if ((auth.type === 'bearer' || auth.type === 'oauth2' || auth.type === 'jwt') && auth.token) {
        headerObj['Authorization'] = `Bearer ${replaceVariables(auth.token, variableMap)}`;
      } 
      else if (auth.type === 'basic' && auth.username) {
        const u = replaceVariables(auth.username, variableMap);
        const p = replaceVariables(auth.password || '', variableMap);
        headerObj['Authorization'] = `Basic ${btoa(`${u}:${p}`)}`;
      } 
      else if (auth.type === 'apikey' && auth.key && auth.value) {
        const k = replaceVariables(auth.key, variableMap);
        const v = replaceVariables(auth.value, variableMap);
        if (auth.addTo === 'query') paramObj[k] = v;
        else headerObj[k] = v;
      }

      let finalBody: any = undefined;
      const bodyType = activeTab.bodyType || 'none'; 
      
      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        if (bodyType === 'json' || bodyType === 'xml' || bodyType === 'text') {
          finalBody = replaceVariables(activeTab.body, variableMap); 
        } 
        else if (bodyType === 'binary' && activeTab.binaryFile) {
          if (reqMode === 'browser') {
            const base64Data = activeTab.binaryFile.split(',')[1];
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            finalBody = new Blob([bytes], { type: 'application/octet-stream' });
          } else {
            finalBody = activeTab.binaryFile; 
          }
        }
        else if (bodyType === 'form-data') {
          if(reqMode === 'browser') {
             delete headerObj['Content-Type']; 
             const formData = new FormData();
             (activeTab.bodyParams || []).forEach(p => {
               if(p.enabled && p.key) {
                   formData.append(
                       replaceVariables(p.key, variableMap), 
                       replaceVariables(p.value, variableMap)
                   );
               }
             });
             finalBody = formData;
          } else {
             finalBody = JSON.stringify(activeTab.bodyParams || []); 
          }
        }
        else if (bodyType === 'x-www-form-urlencoded') {
          const params = new URLSearchParams();
          (activeTab.bodyParams || []).forEach(p => {
            if(p.enabled && p.key) {
                params.append(
                    replaceVariables(p.key, variableMap), 
                    replaceVariables(p.value, variableMap)
                );
            }
          });
          finalBody = params.toString();
        }
      }

      let resData: any = null;
      let resStatus = 0;
      let resStatusText = "";
      let resHeaders = {};
      let resTime = 0;
      let resContentType = "";
      let resIsBinary = false;
      let resBase64 = "";

      if (reqMode === "proxy") {
        const proxyBody = (bodyType === 'json' || bodyType === 'text' || bodyType === 'xml') 
          ? finalBody 
          : finalBody; 

        const res = await fetch("/api/proxy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url,
            method,
            headers: headerObj,
            params: paramObj,
            body: proxyBody, 
          }),
          signal: abortRef.current.signal,
          keepalive: true, 
        });

        if (!res.ok) {
           const errData = await res.json();
           throw new Error(errData.error || "Proxy request failed");
        }
        const data = await res.json();
        resData = data.data;
        resStatus = data.status;
        resStatusText = data.statusText;
        resHeaders = data.headers;
        resTime = data.time || Math.round(performance.now() - startTime);
        resContentType = data.contentType;
        resIsBinary = data.isBinary;
        resBase64 = data.base64;

      } else {
        const full = new URL(url);
        Object.entries(paramObj).forEach(([k, v]) => full.searchParams.set(k, v as string));
        
        const res = await fetch(full.toString(), {
          method,
          headers: Object.keys(headerObj).length ? headerObj : undefined,
          body: finalBody,
          signal: abortRef.current.signal
        });
        
        const endTime = performance.now();
        resTime = Math.round(endTime - startTime);
        resStatus = res.status;
        resStatusText = res.statusText;
        resHeaders = Object.fromEntries(res.headers.entries());
        resContentType = res.headers.get("content-type") || "";
        resIsBinary = resContentType.includes("image/") || resContentType.includes("video/") || resContentType.includes("pdf");

        if (resIsBinary) {
          const blob = await res.blob();
          resBase64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
            reader.readAsDataURL(blob);
          });
        } else {
          const text = await res.text();
          try {
             if (resContentType.includes("application/json")) {
                resData = JSON.parse(text);
             } else {
                resData = text;
             }
          } catch {
            resData = text;
          }
        }
      }

    if (activeTab.postRequestScript) {
          const scriptResponse = { status: resStatus, statusText: resStatusText, headers: resHeaders, body: resData, time: resTime };
          runScript(activeTab.postRequestScript, createSandbox(currentTabVars, scriptResponse));
          store.setVariables(currentTabVars);
      }

      store.setResponse({
          status: resStatus,
          statusText: resStatusText,
          headers: resHeaders,
          isBinary: resIsBinary,
          base64: resBase64,
          data: resData,
          contentType: resContentType,
          size: resBase64 ? resBase64.length : (typeof resData === 'string' ? resData.length : JSON.stringify(resData || "").length),
          time: resTime,
      });

      if (session) {
        await fetch("/api/history", {
            method: "POST",
            body: JSON.stringify({ method, url, status: resStatus, duration: resTime })
        });
      } else {
        const newItem = {
            method, url, status: resStatus, duration: resTime, date: new Date().toISOString()
        };
        const existing = JSON.parse(localStorage.getItem("apilab_history") || "[]");
        const updated = [newItem, ...existing].slice(0, 50);
        localStorage.setItem("apilab_history", JSON.stringify(updated));
      }

    } catch (err: any) {
      if (err.name === "AbortError") return;
      if (reqMode === "browser" && (err.message === "Failed to fetch" || err.message === "Network Error")) {
        store.setCORSError(true)
        store.setReqMode("proxy")
      } else {
        store.setCORSError(false)
        store.setError(err.message || "Request Failed");
      }
    } finally {
      store.setLoading(false);
    }
  };

  const handleSave = async () => {
    if(!activeTab) return;

    if (activeTab.savedId && activeTab.collectionId) {
        setIsSaving(true);
        try {
            const res = await fetch("/api/collections", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    collectionId: activeTab.collectionId,
                    requestId: activeTab.savedId,
                    request: {
                        name: activeTab.name,
                        method: activeTab.method,
                        url: activeTab.url,
                        headers: activeTab.headers,
                        body: activeTab.body,
                        bodyType: activeTab.bodyType,
                        auth: activeTab.auth,
                        params: activeTab.queryParams,
                        preRequestScript: activeTab.preRequestScript,
                        postRequestScript: activeTab.postRequestScript,
                        variables: activeTab.variables
                    }
                })
            });
            if(res.ok) {
                store.markAsSaved(activeTab.savedId, activeTab.collectionId, activeTab.name);
            } else {
                console.error("Save failed");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    } else {
        setSaveDialogOpen(true);
    }
  };

  const currentMethodColor = HTTP_METHODS.find((m) => m.type === method)?.color || "";

  if (!activeTab) return <div className="p-4">No Active Tab</div>;
  return (
    <div className="flex flex-col h-full min-h-0 bg-background">
      <TabBar />

      <div className="block md:flex gap-2 space-y-2 md:space-y-0 p-2  items-center flex-col md:flex-row">
        <div className="flex gap-2 md:w-[90%]">
          <Select value={method} onValueChange={store.setMethod}>
            <SelectTrigger className={`w-[100px] font-bold ${currentMethodColor}`}>
              <SelectValue placeholder="Method" />
            </SelectTrigger>
            <SelectContent>
              {HTTP_METHODS.map((m) => (
                <SelectItem key={m.type} value={m.type} className={`font-bold ${m.color}`}>
                  {m.type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            className="flex-1 font-mono "
            placeholder="Enter URL"
            value={replaceVariables(activeTab.url, activeTab.variables.reduce((acc, curr) => {
                if(curr.enabled) acc[curr.key] = curr.value;
                return acc;
            }, {} as Record<string, string>))}
            onChange={(e) => store.setUrl(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Select value={reqMode} onValueChange={(v: any) => store.setReqMode(v)}>
            <SelectTrigger className="w-[110px] text-xs font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="proxy">
                <div className="flex items-center gap-2">
                  <Server size={14} /> <span>Proxy</span>
                </div>
              </SelectItem>
              <SelectItem value="browser">
                <div className="flex items-center gap-2">
                  <Globe size={14} /> <span>Browser</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {loading ? (
            <Button onClick={() => abortRef.current?.abort()} variant="destructive">
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
          ) : (
            <Button onClick={handleSend}>
              <Play className="h-4 w-4 mr-1" /> Send
            </Button>
          )}
         
         <div className="flex">
            <Button 
                variant="outline" 
                className="rounded-r-none border-r-0 px-3"
                onClick={handleSave}
                disabled={isSaving}
            >
                <Save className="h-4 w-4 mr-1" /> Save
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="rounded-l-none px-2">
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSaveDialogOpen(true)}>
                        Save As...
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
         </div>

         <SaveRequestDialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen} />
        </div>
      </div>

      <Tabs defaultValue="params" className="flex-1 flex flex-col min-h-0">
        <div className="px-4 border-b">
          <TabsList className="w-full justify-start bg-transparent h-9 p-0 rounded-full">
            <TabsTrigger value="params" className="rounded-full data-[state=active]:border-primary tab-underline-transition">Parameters</TabsTrigger>
            <TabsTrigger value="body" className="rounded-full data-[state=active]:border-primary tab-underline-transition">Body</TabsTrigger>
            <TabsTrigger value="headers" className="rounded-full data-[state=active]:border-primary tab-underline-transition">Headers</TabsTrigger>
            <TabsTrigger value="auth" className="rounded-full data-[state=active]:border-primary tab-underline-transition">Authorization</TabsTrigger>
            <TabsTrigger value="vars" className="rounded-full data-[state=active]:border-primary tab-underline-transition">Variables</TabsTrigger>
            <TabsTrigger value="prereq" className="rounded-full data-[state=active]:border-primary tab-underline-transition">Pre-request</TabsTrigger>
            <TabsTrigger value="postreq" className="rounded-full data-[state=active]:border-primary tab-underline-transition">Post-request</TabsTrigger>
          </TabsList>
        </div>
        <div className="flex-1 min-h-0">
          <TabsContent value="params" className="mt-0 h-full tab-fade">
            <KeyValueTable items={queryParams} setItems={store.setQueryParams} />
          </TabsContent>
          <TabsContent value="headers" className="mt-0 h-full tab-fade">
            <KeyValueTable items={headers} setItems={store.setHeaders} isHeader={true} />
          </TabsContent>
          <TabsContent value="body" className="mt-0 h-full flex flex-col gap-2 tab-fade">
            <ReqBody />
          </TabsContent>
          <TabsContent value="auth" className="mt-0 h-full tab-fade">
            <AuthPanel />
          </TabsContent>
          
          <TabsContent value="vars" className="mt-0 h-full tab-fade">
             <div className="p-2 h-full flex flex-col">
                <p className="text-xs text-muted-foreground p-2">Request variables (Local to this request). Use in URL/Headers as <code className="bg-muted px-1 rounded">{"{{key}}"}</code></p>
                <div className="flex-1 min-h-0">
                   <KeyValueTable items={variables} setItems={store.setVariables} />
                </div>
             </div>
          </TabsContent>

          <TabsContent value="prereq" className="mt-0 h-full tab-fade">
             <ScriptEditor 
                value={activeTab.preRequestScript || ""}
                onChange={(val) => store.setPreRequestScript(val)}
                snippets={PRE_REQ_SNIPPETS}
                helpText="Pre-request scripts are written in JavaScript and run before the request is sent. Use them to set variables, generate timestamps, or signatures."
             />
          </TabsContent>

          <TabsContent value="postreq" className="mt-0 h-full tab-fade">
             <ScriptEditor 
                value={activeTab.postRequestScript || ""}
                onChange={(val) => store.setPostRequestScript(val)}
                snippets={POST_REQ_SNIPPETS}
                helpText="Post-request scripts run after the response is received. Use them to validate status codes, check response bodies, or save tokens."
             />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

export default RequestPanel;