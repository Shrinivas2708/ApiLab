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
import { Cross, Play, Save, X } from "lucide-react";
import { KeyValueTable } from "./key-value-table";
import { Textarea } from "./ui/textarea"; 
import axios from "axios";

// const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];
const HTTP_METHODS = [
  {
    type: "GET",
    color: "text-green-500 bg-green-500/10",

  },
  {    type: "POST",
    color: "text-blue-500 bg-blue-500/10",
  },
  {    type: "PUT",
    color: "text-yellow-500 bg-yellow-500/10",
  },
  {    type: "PATCH",
    color: "text-purple-500 bg-purple-500/10",
  },
  {    type: "DELETE",
    color: "text-red-500 bg-red-500/10",
  },  {    type: "HEAD",
    color: "text-gray-500 bg-gray-500/10",
  },
  {    type: "OPTIONS",
    color: "text-indigo-500 bg-indigo-500/10",  
  }
]
function RequestPanel() {
  const {
    url,
    method,
    queryParams,
    headers,
    body,
    loading,
    setUrl,
    setMethod,
    setQueryParams,
    setHeaders,
    setBody,
    setLoading,
    setResponse,
    setError,
  } = useRequestStore();
  const abortRef = useRef<AbortController | null>(null)
  const handleSend = async () => {
    setLoading(true);
    setError(null);
    try {
      const headerObj = headers.reduce((acc, curr) => {
        if (curr.enabled && curr.key) acc[curr.key] = curr.value;
        return acc;
      }, {} as Record<string, string>);

      const paramObj = queryParams.reduce((acc, curr) => {
        if (curr.enabled && curr.key) acc[curr.key] = curr.value;
        return acc;
      }, {} as Record<string, string>);
      
    const controller = new AbortController();
    abortRef.current = controller
    const startTime = performance.now();
      const res = await axios.post("/api/proxy", {
        url,
        method,
        headers: headerObj,
        params: paramObj,
        body,
      },{
        signal: abortRef.current.signal
      });

      const endTime = performance.now();
      setResponse({ ...res.data, time: Math.round(endTime - startTime) });
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  
const currentMethodColor =
  HTTP_METHODS.find((m) => m.type === method)?.color || "";

  return (
    <div className="flex flex-col h-full bg-background">
   
      <div className="flex gap-2 p-4 border-b">
        <Select value={method} onValueChange={setMethod}>
          <SelectTrigger className={` font-bold ${currentMethodColor}`}>
            <SelectValue placeholder="Method" />
          </SelectTrigger>
          <SelectContent>
            {HTTP_METHODS.map((m) => (
              <SelectItem key={m.type} value={m.type} className={`font-bold ${m.color} bg-transparent hover:bg-muted/50`}>
                {m.type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          className="flex-1 font-mono"
          placeholder="Enter URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        {
          loading ? 
          <Button onClick={async ()=> await abortRef.current?.abort()} className="bg-primary text-primary-foreground font-bold">
          <X fill="currentColor" className=" h-4 w-4 " /> Cancel
        </Button>
        :
        <Button onClick={handleSend} className="bg-primary text-primary-foreground font-bold">
          <Play fill="currentColor" className=" h-4 w-4 " /> Send
        </Button>
        }
        <Button variant="outline" size="icon">
          <Save className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="params" className="flex-1 flex flex-col">
        <div className="px-4 border-b">
          <TabsList className="w-full justify-start bg-transparent h-10 p-0 rounded-full">
            <TabsTrigger
              value="params"
              className="rounded-full border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent tab-underline-transition"
            >
              Parameters
            </TabsTrigger>
            <TabsTrigger
              value="headers"
              className="rounded-full border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent tab-underline-transition"
            >
              Headers
            </TabsTrigger>
            <TabsTrigger
              value="body"
              className="rounded-full border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent tab-underline-transition"
            >
              Body
            </TabsTrigger>
            <TabsTrigger
                value="auth"
                className="rounded-full border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent tab-underline-transition"
              >
                Auth
              </TabsTrigger>
              <TabsTrigger
                value="scripts"
                className="rounded-full border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Scripts
              </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-auto">
          <TabsContent value="params" className="mt-0 h-full  tab-fade">
            <KeyValueTable items={queryParams} setItems={setQueryParams} />
          </TabsContent>
          
          <TabsContent value="headers" className="mt-0 h-full  tab-fade">
            <KeyValueTable items={headers} setItems={setHeaders} />
          </TabsContent>

          <TabsContent value="body" className="mt-0 h-full p-4 flex flex-col gap-2  tab-fade">
            <div className="text-xs text-muted-foreground mb-2 flex justify-between">
                <span>Raw JSON</span>
                <Button variant="ghost" size="sm" className="h-6 text-xs">Prettify</Button>
            </div>
            <Textarea
              className="flex-1 font-mono text-sm resize-none bg-muted/30"
              placeholder="{ 'key': 'value' }"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </TabsContent>
           <TabsContent value="auth" className="mt-0 h-full p-10 flex items-center justify-center text-muted-foreground  tab-fade">
             Auth implementations coming next...
          </TabsContent>
           <TabsContent value="scripts" className="mt-0 h-full p-10 flex items-center justify-center text-muted-foreground  tab-fade">
             Pre/Post scripts coming next...
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

export default RequestPanel;