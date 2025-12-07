"use client";
import { useGraphqlStore } from "@/stores/graphql-store";
import { Book, Box, Folder } from "lucide-react";
import { cn } from "@/lib/utils";
import DocsExplorer from "./graphql-docs";
import GraphQlCollectionPanel from "./graphql-collection-panel";
import GraphqlSchemaView from "./graphql-schema-view"; 

export function GraphqlRightSidebar() {
  const { activeRightSidebar, setActiveRightSidebar } = useGraphqlStore();

  const renderContent = () => {
    switch (activeRightSidebar) {
        case 'docs': return <DocsExplorer />;
        case 'schema': return <GraphqlSchemaView />;
        case 'collections': return <GraphQlCollectionPanel />;
        default: return null;
    }
  };

  return (
    <div className="flex h-full bg-background border-l">
      
      <div className="w-12 flex flex-col items-center py-4 gap-4 border-r bg-muted/5">
        <NavIcon 
            icon={Folder} 
            active={activeRightSidebar === 'collections'} 
            onClick={() => setActiveRightSidebar('collections')} 
            label="Collections"
        />
        <NavIcon 
            icon={Box} 
            active={activeRightSidebar === 'schema'} 
            onClick={() => setActiveRightSidebar('schema')} 
            label="Schema"
        />
        <NavIcon 
            icon={Book} 
            active={activeRightSidebar === 'docs'} 
            onClick={() => setActiveRightSidebar('docs')} 
            label="Documentation"
        />
      </div>

      <div className="flex-1 min-w-0 flex flex-col h-full bg-background overflow-hidden">
          {renderContent()}
      </div>
    </div>
  );
}

function NavIcon({ icon: Icon, active, onClick, label }: any) {
    return (
        <button 
            onClick={onClick}
            title={label}
            className={cn(
                "p-2 rounded-md transition-all",
                active ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
        >
            <Icon size={20} />
        </button>
    )
}