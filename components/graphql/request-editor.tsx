"use client";

import { useGraphqlStore } from "./store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { monokai } from "@uiw/codemirror-theme-monokai";
import { KeyValueTable } from "@/components/key-value-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraphqlUrlBar } from "./url-bar";

export function GraphqlRequestEditor() {
  const store = useGraphqlStore();

  return (
    <div>
       <GraphqlUrlBar/>
    <Tabs defaultValue="query" className="flex flex-col h-full">
      <div className="border-b px-2 bg-muted/5">
        <TabsList className="h-9 bg-transparent p-0">
          <TabsTrigger value="query" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-full px-4 bg-transparent!">Query</TabsTrigger>
          <TabsTrigger value="variables" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-full px-4 bg-transparent!">Variables</TabsTrigger>
          <TabsTrigger value="headers" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-full px-4 bg-transparent!">Headers</TabsTrigger>
          <TabsTrigger value="auth" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-full  px-4 bg-transparent!">Authorization</TabsTrigger>
        </TabsList>
      </div>

      <div className="flex-1 relative overflow-hidden bg-[#272822]">
        <TabsContent value="query" className="m-0 h-full absolute inset-0">
          <CodeMirror
            value={store.query}
            height="100%"
            theme={monokai}
            extensions={[javascript()]}
            onChange={store.setQuery}
            className="h-full text-sm"
          />
        </TabsContent>

        <TabsContent value="variables" className="m-0 h-full absolute inset-0">
          <CodeMirror
            value={store.variables}
            height="100%"
            theme={monokai}
            extensions={[json()]}
            onChange={store.setVariables}
            className="h-full text-sm"
          />
        </TabsContent>

        <TabsContent value="headers" className="m-0 h-full bg-background">
          <KeyValueTable items={store.headers} setItems={store.setHeaders} isHeader />
        </TabsContent>

        <TabsContent value="auth" className="m-0 h-full bg-background p-6">
            <div className="max-w-md space-y-4">
                <div className="space-y-2">
                    <Label>Auth Type</Label>
                    <Select value={store.auth.type} onValueChange={(t: any) => store.setAuth({...store.auth, type: t})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="bearer">Bearer Token</SelectItem>
                            <SelectItem value="basic">Basic Auth</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {store.auth.type === 'bearer' && (
                    <div className="space-y-2">
                        <Label>Token</Label>
                        <Input value={store.auth.token || ''} onChange={(e) => store.setAuth({...store.auth, token: e.target.value})} type="password" />
                    </div>
                )}
                {store.auth.type === 'basic' && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Username</Label>
                            <Input value={store.auth.username || ''} onChange={(e) => store.setAuth({...store.auth, username: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label>Password</Label>
                            <Input value={store.auth.password || ''} onChange={(e) => store.setAuth({...store.auth, password: e.target.value})} type="password" />
                        </div>
                    </div>
                )}
            </div>
        </TabsContent>
      </div>
    </Tabs></div>
  );
}