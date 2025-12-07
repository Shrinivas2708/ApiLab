"use client";
import { useGraphqlStore } from "./store";
import { Book, Box, Folder } from "lucide-react";
import { cn } from "@/lib/utils";
import GraphQlCollectionTree from "./graphql-collection-panel";
import DocsExplorer from "./graphql-docs";
export function GraphqlRightSidebar() {
  const { activeRightSidebar, setActiveRightSidebar } = useGraphqlStore();

  const renderContent = () => {
    switch (activeRightSidebar) {
        case 'docs': return <DocsExplorer />;
        case 'schema': return <div className="p-4 text-sm text-muted-foreground">Schema SDL View (Coming Soon)</div>;
        case 'collections': return <GraphQlCollectionTree /> ;
        default: return null;
    }
  };

  return (
    <div className="flex h-full  bg-muted/10">
      <div className="w-12 flex flex-col border-x items-center py-4 gap-4 bg-muted/10">
        <NavIcon 
            icon={Book} 
            active={activeRightSidebar === 'docs'} 
            onClick={() => setActiveRightSidebar(activeRightSidebar === 'docs' ? null : 'docs')} 
            label="Documentation"
        />
        <NavIcon 
            icon={Box} 
            active={activeRightSidebar === 'schema'} 
            onClick={() => setActiveRightSidebar(activeRightSidebar === 'schema' ? null : 'schema')} 
            label="Schema"
        />
        <NavIcon 
            icon={Folder} 
            active={activeRightSidebar === 'collections'} 
            onClick={() => setActiveRightSidebar(activeRightSidebar === 'collections' ? null : 'collections')} 
            label="Collections"
        />
       
      </div>
      {activeRightSidebar && (
        <div className="w-full flex flex-col h-full bg-muted/10">
            {renderContent()}
        </div>
      )}

      
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
                active ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
            )}
        >
            <Icon size={20} />
        </button>
    )
}