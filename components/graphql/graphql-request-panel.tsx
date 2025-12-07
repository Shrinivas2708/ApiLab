"use client";

import { useGraphqlStore } from "@/stores/graphql-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { monokai } from "@uiw/codemirror-theme-monokai";
import { KeyValueTable } from "@/components/key-value-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
const transparentBg = EditorView.theme({
  "&": {
    backgroundColor: "transparent !important"
  },
  ".cm-scroller": {
    backgroundColor: "transparent !important"
  }
});
export function GraphqlRequestPanel() {
  const store = useGraphqlStore();
  const activeTab = store.tabs.find(t => t.id === store.activeTabId);

  if (!activeTab) return <div className="p-4 text-muted-foreground">No active tab</div>;

  return (
    <Tabs defaultValue="query" className="flex flex-col h-full">
      <div className="border-b px-2 bg-muted/5">
        <TabsList className="h-9 bg-transparent p-0 w-full justify-start">
          <TabsTrigger value="query" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-full px-4 bg-transparent! h-full">Query</TabsTrigger>
          <TabsTrigger value="variables" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-full px-4 bg-transparent! h-full">Variables</TabsTrigger>
          <TabsTrigger value="headers" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-full px-4 bg-transparent! h-full">Headers</TabsTrigger>
          <TabsTrigger value="auth" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-full px-4 bg-transparent! h-full">Authorization</TabsTrigger>
        </TabsList>
      </div>

      <div className="flex-1 relative overflow-hidden ">
        <TabsContent value="query" className="m-0 h-full absolute inset-0">
          <CodeMirror
            value={activeTab.query}
            height="100%"
            theme={monokai}
            extensions={[transparentBg,javascript(),EditorView.lineWrapping]}
            onChange={(val) => store.updateActiveTab({ query: val })}
            className="h-full text-sm"
            basicSetup={{ lineNumbers: true, foldGutter: true }}
            style={{ backgroundColor: 'transparent !important' }}
          />
        </TabsContent>

        <TabsContent value="variables" className="m-0 h-full absolute inset-0">
          <CodeMirror
            value={activeTab.variables}
            height="100%"
            theme={monokai}
            extensions={[transparentBg,json(),EditorView.lineWrapping]}
            onChange={(val) => store.updateActiveTab({ variables: val })}
            className="h-full text-sm"
            style={{ background: 'transparent' }}
          />
        </TabsContent>

        <TabsContent value="headers" className="m-0 h-full bg-background">
          <KeyValueTable 
            items={activeTab.headers} 
            setItems={(headers) => store.updateActiveTab({ headers })} 
            isHeader 
          />
        </TabsContent>

        <TabsContent value="auth" className="m-0 h-full bg-background p-6">
            <div className="max-w-md space-y-4">
                <div className="space-y-2">
                    <Label>Auth Type</Label>
                    <Select 
                        value={activeTab.auth.type} 
                        onValueChange={(t: any) => store.updateActiveTab({ auth: { ...activeTab.auth, type: t } })}
                    >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="bearer">Bearer Token</SelectItem>
                            <SelectItem value="basic">Basic Auth</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {activeTab.auth.type === 'bearer' && (
                    <div className="space-y-2">
                        <Label>Token</Label>
                        <Input 
                            value={activeTab.auth.token || ''} 
                            onChange={(e) => store.updateActiveTab({ auth: { ...activeTab.auth, token: e.target.value } })} 
                            type="password" 
                            placeholder="Bearer Token"
                        />
                    </div>
                )}
                {activeTab.auth.type === 'basic' && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Username</Label>
                            <Input 
                                value={activeTab.auth.username || ''} 
                                onChange={(e) => store.updateActiveTab({ auth: { ...activeTab.auth, username: e.target.value } })} 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Password</Label>
                            <Input 
                                value={activeTab.auth.password || ''} 
                                onChange={(e) => store.updateActiveTab({ auth: { ...activeTab.auth, password: e.target.value } })} 
                                type="password" 
                            />
                        </div>
                    </div>
                )}
            </div>
        </TabsContent>
      </div>
    </Tabs>
  );
}