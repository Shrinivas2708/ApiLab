"use client";

import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { monokai } from "@uiw/codemirror-theme-monokai";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KeyValueTable } from "@/components/key-value-table"; 

// Using a simplified type compatible with KeyValueTable if needed, or mapping strictly
interface Header { id: string; key: string; value: string; enabled: boolean; description?: string }

interface Props {
    query: string;
    setQuery: (val: string) => void;
    variables: string;
    setVariables: (val: string) => void;
    headers: Header[];
    setHeaders: (val: any[]) => void;
}

export function GraphqlRequestPane({ query, setQuery, variables, setVariables, headers, setHeaders }: Props) {
    return (
        <div className="flex flex-col h-full">
            <Tabs defaultValue="query" className="flex-1 flex flex-col min-h-0">
                    <div className="px-4 border-b">
                      <TabsList className="w-full justify-start bg-transparent h-9 p-0 rounded-full">
                        <TabsTrigger value="query" className="rounded-full data-[state=active]:border-primary tab-underline-transition">Query</TabsTrigger>
                        <TabsTrigger value="vars" className="rounded-full data-[state=active]:border-primary tab-underline-transition">Variables</TabsTrigger>
                        <TabsTrigger value="headers" className="rounded-full data-[state=active]:border-primary tab-underline-transition">Headers <span className="ml-2 text-[10px] bg-primary/10 text-primary px-1.5 rounded-full">{headers.filter(h=>h.enabled).length}</span></TabsTrigger>
                    </TabsList>
                    </div>
                    <div className="flex-1 min-h-0 relative">
                    <TabsContent value="query" className="mt-0 h-full absolute inset-0">
                        <CodeMirror
                            value={query}
                            height="100%"
                            theme={monokai}
                            extensions={[javascript()]}
                            onChange={setQuery}
                            className="h-full text-sm"
                            basicSetup={{ lineNumbers: true, foldGutter: true }}
                            style={{ backgroundColor: 'transparent' }}
                        />
                    </TabsContent>

                    <TabsContent value="vars" className="mt-0 h-full absolute inset-0">
                        <CodeMirror
                            value={variables}
                            height="100%"
                            theme={monokai}
                            extensions={[json()]}
                            onChange={setVariables}
                            className="h-full text-sm"
                            style={{ backgroundColor: 'transparent' }}
                        />
                    </TabsContent>

                    <TabsContent value="headers" className="mt-0 h-full">
                        <KeyValueTable items={headers} setItems={setHeaders} isHeader={true} />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}