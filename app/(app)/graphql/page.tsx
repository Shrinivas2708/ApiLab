"use client";

import { GraphqlRightSidebar } from "@/components/graphql/graphql-sidebar";
import { GraphqlRequestPanel } from "@/components/graphql/graphql-request-panel";
import { GraphqlResponsePane } from "@/components/graphql/graphql-response-panel";
import { GraphqlUrlBar } from "@/components/graphql/graphql-url-bar";
import { GraphqlTabs } from "@/components/graphql/graphql-tabs";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

export default function GraphQLPage() {
  return (
    <div className="flex flex-col h-full bg-background">
      <GraphqlTabs />
      <GraphqlUrlBar />
      
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal" className="h-full">
          <Panel minSize={60}>
            <PanelGroup direction="vertical">
              <Panel className="min-h-0" defaultSize={50} minSize={30}>
                <GraphqlRequestPanel />
              </Panel>
              <PanelResizeHandle className="h-px bg-border hover:bg-primary/50 transition-colors" />
              <Panel maxSize={70} minSize={20} defaultSize={50}>
                <GraphqlResponsePane />
              </Panel>
            </PanelGroup>
          </Panel>
          <PanelResizeHandle className="w-px bg-border hover:bg-primary/50 transition-colors" />

          <Panel minSize={20} maxSize={30} defaultSize={20} className="hidden md:block">
            <GraphqlRightSidebar />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}