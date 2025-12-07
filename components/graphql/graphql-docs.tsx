"use client";
import { ChevronLeft, Home, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGraphqlStore } from "@/stores/graphql-store";
import { Badge } from "@/components/ui/badge";

export default function DocsExplorer() {
  const store = useGraphqlStore();
  const activeTab = store.tabs.find(t => t.id === store.activeTabId);
  const { docHistory, pushDocHistory, popDocHistory, resetDocHistory } = store;
  
  const schema = activeTab?.schema;

  if (!schema) {
    return (
        <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
          <p className="text-sm">Schema not available.</p>
        </div>
    );
  }

  // Helper to find type in schema types array
  const findType = (name: string) => schema.types.find((t: any) => t.name === name);

  // Helper to unwrap NonNull/List wrappers to get the underlying named type
  const getNamedType = (typeObj: any): any => {
      if (!typeObj) return null;
      if (typeObj.name) return typeObj;
      if (typeObj.ofType) return getNamedType(typeObj.ofType);
      return null;
  };

  const navigateToType = (typeObj: any) => {
      const actualType = getNamedType(typeObj);
      if (actualType) {
          const schemaType = findType(actualType.name);
          if (schemaType) pushDocHistory(schemaType);
      }
  };

  const currentType = docHistory.length > 0 ? docHistory[docHistory.length - 1] : null;

  // Render Root View
  if (!currentType) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="p-3 border-b text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted/10">
            Documentation
        </div>
        <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
                <div className="space-y-3">
                    <div className="text-xs font-semibold text-muted-foreground">ROOT TYPES</div>
                    {['query', 'mutation', 'subscription'].map(root => {
                        const typeName = schema[`${root}Type`]?.name;
                        if (!typeName) return null;
                        const typeObj = findType(typeName);
                        return (
                            <div 
                                key={root} 
                                onClick={() => pushDocHistory(typeObj)} 
                                className="flex items-center justify-between group cursor-pointer p-2 rounded-md hover:bg-muted/50 border border-transparent hover:border-border transition-all"
                            >
                                <span className="text-primary text-sm font-medium capitalize">{root}</span>
                                <div className="flex items-center gap-1 text-orange-500 font-mono text-xs">
                                    {typeName} <ArrowRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </ScrollArea>
      </div>
    );
  }

  // Render Type Detail View
  return (
    <div className="flex flex-col h-full bg-background">
        <div className="p-2 border-b flex items-center gap-2 bg-muted/10 sticky top-0 z-10">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={popDocHistory} title="Back">
                <ChevronLeft size={14}/>
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={resetDocHistory} title="Home">
                <Home size={14}/>
            </Button>
            <div className="flex-1 min-w-0 text-right">
                <span className="text-sm font-bold text-orange-500 truncate block">{currentType.name}</span>
            </div>
        </div>
        
        <ScrollArea className="flex-1 p-4">
            <div className="space-y-6 pb-10">
                {currentType.description ? (
                    <div className="text-sm text-muted-foreground leading-relaxed">{currentType.description}</div>
                ) : (
                    <div className="text-xs italic text-muted-foreground opacity-50">No description available</div>
                )}

                {currentType.fields && (
                    <div className="space-y-4">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b pb-1">Fields</div>
                        {currentType.fields.map((f: any) => (
                            <div key={f.name} className="group">
                                <div className="font-mono text-sm">
                                    <span className="text-blue-500 font-semibold">{f.name}</span>
                                    
                                    {f.args && f.args.length > 0 && (
                                        <span className="text-muted-foreground">
                                            (
                                            {f.args.map((arg: any, i: number) => (
                                                <span key={arg.name}>
                                                    <span className="text-red-400">{arg.name}</span>: <span className="text-orange-400 cursor-pointer hover:underline" onClick={() => navigateToType(arg.type)}>{getPrettyType(arg.type)}</span>
                                                    {i < f.args.length - 1 && ", "}
                                                </span>
                                            ))}
                                            )
                                        </span>
                                    )}

                                    <span className="text-muted-foreground mx-1">:</span>
                                    <span 
                                        className="text-orange-400 cursor-pointer hover:underline"
                                        onClick={() => navigateToType(f.type)}
                                    >
                                        {getPrettyType(f.type)}
                                    </span>
                                </div>
                                {f.description && <div className="text-xs text-muted-foreground mt-1 pl-3 border-l-2 border-muted/50">{f.description}</div>}
                            </div>
                        ))}
                    </div>
                )}

                {/* INPUT FIELDS */}
                {currentType.inputFields && (
                     <div className="space-y-4">
                     <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b pb-1">Input Fields</div>
                     {currentType.inputFields.map((f: any) => (
                         <div key={f.name} className="font-mono text-sm">
                             <span className="text-blue-500">{f.name}</span>
                             <span className="text-muted-foreground mx-1">:</span>
                             <span className="text-orange-400 cursor-pointer hover:underline" onClick={() => navigateToType(f.type)}>{getPrettyType(f.type)}</span>
                             {f.description && <div className="text-xs font-sans text-muted-foreground mt-0.5 ml-2">{f.description}</div>}
                         </div>
                     ))}
                 </div>
                )}

                {/* ENUM VALUES */}
                 {currentType.enumValues && (
                     <div className="space-y-4">
                     <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b pb-1">Enum Values</div>
                     <div className="grid grid-cols-2 gap-2">
                        {currentType.enumValues.map((f: any) => (
                            <Badge key={f.name} variant="outline" className="font-mono text-green-600 justify-center">
                                {f.name}
                            </Badge>
                        ))}
                     </div>
                 </div>
                )}
            </div>
        </ScrollArea>
    </div>
  );
}

// Utility to recursively print type name (e.g. [User!]!)
function getPrettyType(type: any): string {
    if (!type) return "";
    if (type.kind === "NON_NULL") return `${getPrettyType(type.ofType)}!`;
    if (type.kind === "LIST") return `[${getPrettyType(type.ofType)}]`;
    return type.name;
}