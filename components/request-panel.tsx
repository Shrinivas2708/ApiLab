"use client";

import React, { useRef } from "react";
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
import { Play, Save, X, Globe, Server } from "lucide-react"; // NEW ICONS
import { KeyValueTable } from "./key-value-table";
import { Textarea } from "./ui/textarea";
import axios from "axios";

// ... keep HTTP_METHODS array ...
const HTTP_METHODS = [
  { type: "GET", color: "text-green-500 bg-green-500/10" },
  { type: "POST", color: "text-blue-500 bg-blue-500/10" },
  { type: "PUT", color: "text-yellow-500 bg-yellow-500/10" },
  { type: "PATCH", color: "text-purple-500 bg-purple-500/10" },
  { type: "DELETE", color: "text-red-500 bg-red-500/10" },
  { type: "HEAD", color: "text-gray-500 bg-gray-500/10" },
  { type: "OPTIONS", color: "text-indigo-500 bg-indigo-500/10" },
];

function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function RequestPanel() {
  const {
    url,
    method,
    reqMode,
    queryParams,
    headers,
    body,
    loading,
    setUrl,
    setMethod,
    setReqMode,
    setQueryParams,
    setHeaders,
    setBody,
    setLoading,
    setResponse,
    setError,
  } = useRequestStore();

  const abortRef = useRef<AbortController | null>(null);

  const handleSend = async () => {
    setLoading(true);
    setError(null);
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

      let responseData;

      if (reqMode === "proxy") {
        const res = await axios.post(
          "/api/proxy",
          {
            url,
            method,
            headers: headerObj,
            params: paramObj,
            body,
          },
          { signal: abortRef.current.signal }
        );
        responseData = res.data;
      } // ----- BROWSER MODE (FAST) -----
      if (reqMode === "browser") {
        // Build full URL with query params
        const full = new URL(url);
        Object.entries(paramObj).forEach(([k, v]) => {
          full.searchParams.set(k, v);
        });

        const res = await fetch(full.toString(), {
          method,
          headers: headerObj,
          body: body ? JSON.stringify(JSON.parse(body)) : undefined,
          signal: abortRef.current.signal,
        });

        const contentType = res.headers.get("content-type") || "";
        const isBinary =
          contentType.startsWith("image/") ||
          contentType.includes("video/") ||
          contentType.includes("application/pdf");

        let data: any = null;
        let base64 = "";

        if (isBinary) {
          // No arraybuffer → use Blob directly (much faster)
          const blob = await res.blob();
          base64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const result = (reader.result as string).split(",")[1];
              resolve(result);
            };
            reader.readAsDataURL(blob);
          });
        } else {
          const text = await res.text();
          try {
            data = JSON.parse(text);
          } catch {
            data = text;
          }
        }

        return setResponse({
          status: res.status,
          statusText: res.statusText,
          headers: Object.fromEntries(res.headers.entries()),
          isBinary,
          base64,
          data,
          contentType,
          size: base64 ? base64.length : data?.length || 0,
          time: Math.round(performance.now() - startTime),
        });
      }
    } catch (err: any) {
      if (axios.isCancel(err)) return;
      if (reqMode === "browser" && err.message === "Network Error") {
        setError(
          "CORS Error: This API blocks browser requests. Switch to Proxy Mode."
        );
      } else {
        setError(err.message || "Request Failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const currentMethodColor =
    HTTP_METHODS.find((m) => m.type === method)?.color || "";

  return (
    <div className="flex flex-col h-full min-h-0 bg-background">
      <div className="block md:flex gap-2 space-y-2 md:space-y-0 p-4 border-b items-center flex-col md:flex-row border ">
        <div className="flex gap-2 md:w-[90%]">
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger
              className={`w-[100px] font-bold ${currentMethodColor}`}
            >
              <SelectValue placeholder="Method" />
            </SelectTrigger>
            <SelectContent>
              {HTTP_METHODS.map((m) => (
                <SelectItem
                  key={m.type}
                  value={m.type}
                  className={`font-bold ${m.color}`}
                >
                  {m.type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            className="flex-1 font-mono "
            placeholder="Enter URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Select value={reqMode} onValueChange={(v: any) => setReqMode(v)}>
            <SelectTrigger className="w-[110px] text-xs font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="proxy">
                <div className="flex items-center gap-2">
                  <Server size={14} />
                  <span>Proxy</span>
                </div>
              </SelectItem>
              <SelectItem value="browser">
                <div className="flex items-center gap-2">
                  <Globe size={14} />
                  <span>Browser</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {loading ? (
            <Button
              onClick={() => abortRef.current?.abort()}
              variant="destructive"
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          ) : (
            <Button onClick={handleSend}>
              <Play className="h-4 w-4 mr-1" />
              Send
            </Button>
          )}
          <Button variant="outline" size="icon">
            <Save className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="params" className="flex-1 flex flex-col min-h-0">
        <div className="px-4 border-b">
          <TabsList className="w-full justify-start bg-transparent h-10 p-0 rounded-full">
            <TabsTrigger
              value="params"
              className="rounded-full data-[state=active]:border-primary tab-underline-transition"
            >
              Parameters
            </TabsTrigger>
            <TabsTrigger
              value="headers"
              className="rounded-full data-[state=active]:border-primary tab-underline-transition"
            >
              Headers
            </TabsTrigger>
            <TabsTrigger
              value="body"
              className="rounded-full data-[state=active]:border-primary tab-underline-transition"
            >
              Body
            </TabsTrigger>
            <TabsTrigger
              value="auth"
              className="rounded-full data-[state=active]:border-primary tab-underline-transition"
            >
              Auth
            </TabsTrigger>
          </TabsList>
        </div>
        <div className="flex-1 min-h-0">
          <TabsContent value="params" className="mt-0 h-full tab-fade">
            <KeyValueTable items={queryParams} setItems={setQueryParams} />
          </TabsContent>
          <TabsContent value="headers" className="mt-0 h-full tab-fade">
            <KeyValueTable items={headers} setItems={setHeaders} />
          </TabsContent>
          <TabsContent
            value="body"
            className="mt-0 h-full p-4 flex flex-col gap-2 tab-fade"
          >
            <Textarea
              className="flex-1 font-mono text-sm resize-none bg-muted/30"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </TabsContent>
          <TabsContent
            value="auth"
            className="mt-0 h-full p-10 flex items-center justify-center text-muted-foreground"
          >
            Auth coming soon...
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

export default RequestPanel;
