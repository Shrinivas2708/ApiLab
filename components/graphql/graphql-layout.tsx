"use client";

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { GraphqlUrlBar } from "./url-bar";
import { GraphqlRequestEditor } from "./request-editor";
import { GraphqlRightSidebar } from "./graphql-sidebar";
import { GraphqlResponsePane } from "./response-pane"; // Reusing previous logic

export default function GraphqlLayout() {
  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <GraphqlUrlBar />

      <div className="flex-1 overflow-hidden flex">
        {/* Main Workspace */}
        <div className="flex-1 flex flex-col min-w-0">
          <PanelGroup direction="vertical">
            <Panel defaultSize={50} minSize={30}>
              <GraphqlRequestEditor />
            </Panel>
            <PanelResizeHandle className="h-1 bg-muted hover:bg-primary/50 transition-colors" />
            <Panel defaultSize={50} minSize={20}>
              <GraphqlResponsePane />
            </Panel>
          </PanelGroup>
        </div>

        {/* Right Sidebar (Fixed width handled internally by flex, or resizable if we wrap it) */}
        <GraphqlRightSidebar />
      </div>
    </div>
  );
}
