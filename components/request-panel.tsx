"use client";
import { useRef } from "react";
import { useRequestStore } from "@/stores/request-store";
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
import { Play, Save, X, Globe, Server } from "lucide-react";
import { KeyValueTable } from "./key-value-table";
import { TabBar } from "./tabs/tab-bar";
import ReqBody from "./req-body";
import AuthPanel from "./auth-panel";

const HTTP_METHODS = [
  { type: "GET", color: "text-green-500 " },
  { type: "POST", color: "text-blue-500 " },
  { type: "PUT", color: "text-yellow-500 " },
  { type: "PATCH", color: "text-purple-500 " },
  { type: "DELETE", color: "text-red-500 " },
  { type: "HEAD", color: "text-gray-500 " },
  { type: "OPTIONS", color: "text-indigo-500 " },
];

function RequestPanel() {
  const store = useRequestStore();
  const activeTab = store.tabs.find((t) => t.id === store.activeTabId);
  const url = activeTab?.url || "";
  const method = activeTab?.method || "GET";
  const reqMode = activeTab?.reqMode || "browser";
  const queryParams = activeTab?.queryParams || [];
  const headers = activeTab?.headers || [];
  const loading = activeTab?.loading || false;

  const abortRef = useRef<AbortController | null>(null);

  const handleSend = async () => {
    if (!activeTab) return;
    store.setLoading(true);
    store.setError(null);
    store.setCORSError(false);
    const controller = new AbortController();
    abortRef.current = controller;
    const startTime = performance.now();

    try {
      const headerObj = headers.reduce((acc, curr) => {
        if (curr.enabled && curr.key) acc[curr.key] = curr.value;
        return acc;
      }, {} as Record<string, string>);

      const paramObj = queryParams.reduce((acc, curr) => {
        if (curr.enabled && curr.key) acc[curr.key] = curr.value;
        return acc;
      }, {} as Record<string, string>);

      const auth = activeTab.auth || { type: 'none' };
      
      if ((auth.type === 'bearer' || auth.type === 'oauth2' || auth.type === 'jwt') && auth.token) {
        headerObj['Authorization'] = `Bearer ${auth.token}`;
      } 
      else if (auth.type === 'basic' && auth.username) {
        const credentials = btoa(`${auth.username}:${auth.password || ''}`);
        headerObj['Authorization'] = `Basic ${credentials}`;
      } 
      else if (auth.type === 'apikey' && auth.key && auth.value) {
        if (auth.addTo === 'query') {
          paramObj[auth.key] = auth.value;
        } else {
          headerObj[auth.key] = auth.value;
        }
      }
      else if (auth.type === 'aws') {
        console.warn("AWS Signature v4 calculation requires external library.");
      }

      // 4. Handle Body
      let finalBody: any = undefined;
      const bodyType = activeTab.bodyType || 'none'; 
      
      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        if (bodyType === 'json') {
          finalBody = activeTab.body; 
        } 
        else if (bodyType === 'xml') {
          finalBody = activeTab.body;
        }
        else if (bodyType === 'text') {
          finalBody = activeTab.body;
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
               if(p.enabled && p.key) formData.append(p.key, p.value);
             });
             finalBody = formData;
          } else {
             finalBody = JSON.stringify(activeTab.bodyParams || []); 
          }
        }
        else if (bodyType === 'x-www-form-urlencoded') {
          const params = new URLSearchParams();
          (activeTab.bodyParams || []).forEach(p => {
            if(p.enabled && p.key) params.append(p.key, p.value);
          });
          finalBody = params.toString();
        }
      }

      
      if (reqMode === "proxy") {
        const proxyBody = (bodyType === 'json' || bodyType === 'text' || bodyType === 'xml') 
          ? activeTab.body 
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
        const responseData = await res.json();
        store.setResponse({
          ...responseData,
          time: responseData.time || Math.round(performance.now() - startTime)
        });
      } 
      
      if (reqMode === "browser") {
        const full = new URL(url);
        Object.entries(paramObj).forEach(([k, v]) => full.searchParams.set(k, v));
        console.log(Object.keys(headerObj).length ? headerObj : undefined);
        
        const res = await fetch(full.toString(), {
          method,
          headers: Object.keys(headerObj).length ? headerObj : undefined,
          body: finalBody,
          signal: abortRef.current.signal
        });
        
        const endTime = performance.now();
        const networkTime = Math.round(endTime - startTime);
        const contentType = res.headers.get("content-type") || "";
        const isBinary = contentType.includes("image/") || contentType.includes("video/") || contentType.includes("pdf");

        let data: any = null;
        let base64 = "";

        if (isBinary) {
          const blob = await res.blob();
          base64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
            reader.readAsDataURL(blob);
          });
        } else {
          const text = await res.text();
          try {
             if (contentType.includes("application/json")) {
                data = JSON.parse(text);
             } else {
                data = text;
             }
          } catch {
            data = text;
          }
        }

        return store.setResponse({
          status: res.status,
          statusText: res.statusText,
          headers: Object.fromEntries(res.headers.entries()),
          isBinary,
          base64,
          data,
          contentType,
          size: base64 ? base64.length : (typeof data === 'string' ? data.length : JSON.stringify(data || "").length),
          time: networkTime,
        });
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
            value={url}
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
          <Button variant="outline" size="icon">
            <Save className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="params" className="flex-1 flex flex-col min-h-0">
        <div className="px-4 border-b">
          <TabsList className="w-full justify-start bg-transparent h-9 p-0 rounded-full">
            <TabsTrigger value="params" className="rounded-full data-[state=active]:border-primary tab-underline-transition">Parameters</TabsTrigger>
            <TabsTrigger value="body" className="rounded-full data-[state=active]:border-primary tab-underline-transition">Body</TabsTrigger>
            <TabsTrigger value="headers" className="rounded-full data-[state=active]:border-primary tab-underline-transition">Headers</TabsTrigger>
            <TabsTrigger value="auth" className="rounded-full data-[state=active]:border-primary tab-underline-transition">Authorization</TabsTrigger>
            <TabsTrigger value="prereq" className="rounded-full data-[state=active]:border-primary tab-underline-transition">Pre-request Script</TabsTrigger>
            <TabsTrigger value="postreq" className="rounded-full data-[state=active]:border-primary tab-underline-transition">Post-request Script</TabsTrigger>
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
        </div>
      </Tabs>
    </div>
  );
}

export default RequestPanel;
