import { ChevronLeft } from "lucide-react";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { useGraphqlStore } from "./store";

export default function DocsExplorer() {
  const { schema, docHistory, pushDocHistory, popDocHistory, resetDocHistory } = useGraphqlStore();

  if (!schema) return <div className="p-4 text-center text-muted-foreground text-sm">Schema not available. Connect first.</div>;

  const currentType = docHistory.length > 0 ? docHistory[docHistory.length - 1] : null;

  if (!currentType) {
    return (
      <div className="p-4 space-y-6">
        <h3 className="font-semibold text-sm uppercase text-muted-foreground">Documentation</h3>
        <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground">ROOT TYPES</div>
            {['query', 'mutation', 'subscription'].map(root => {
                const typeName = schema[`${root}Type`]?.name;
                if (!typeName) return null;
                const typeObj = schema.types.find((t: any) => t.name === typeName);
                return (
                    <div key={root} onClick={() => pushDocHistory(typeObj)} className="flex items-center gap-2 cursor-pointer hover:underline text-sm">
                        <span className="text-primary">{root}:</span>
                        <span className="text-orange-500">{typeName}</span>
                    </div>
                );
            })}
        </div>
      </div>
    );
  }

  // Type Detail View
  return (
    <div className="flex flex-col h-full">
        <div className="p-2 border-b flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={popDocHistory}><ChevronLeft size={14}/></Button>
            <span className="text-sm font-bold text-orange-500 truncate">{currentType.name}</span>
        </div>
        <ScrollArea className="flex-1 p-4">
            <p className="text-xs text-muted-foreground mb-4">{currentType.description}</p>
            {currentType.fields && (
                <div className="space-y-3">
                    <div className="text-xs font-semibold text-muted-foreground uppercase">Fields</div>
                    {currentType.fields.map((f: any) => (
                        <div key={f.name} className="group">
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-blue-400 font-medium">{f.name}</span>
                                {f.args?.length > 0 && <span className="text-muted-foreground text-xs">(...)</span>}
                                <span className="text-muted-foreground">:</span>
                                <span 
                                    className="text-orange-400 cursor-pointer hover:underline"
                                    onClick={() => {
                                        // Simple navigation logic (needs recursion handling in real app)
                                        const typeName = f.type.name || f.type.ofType?.name || f.type.ofType?.ofType?.name;
                                        const typeObj = schema.types.find((t: any) => t.name === typeName);
                                        if(typeObj) pushDocHistory(typeObj);
                                    }}
                                >
                                    {f.type.name || f.type.ofType?.name || "List"}
                                </span>
                            </div>
                            <div className="text-xs text-muted-foreground pl-2 border-l border-white/10 ml-1 mt-1">{f.description}</div>
                        </div>
                    ))}
                </div>
            )}
        </ScrollArea>
    </div>
  );
}