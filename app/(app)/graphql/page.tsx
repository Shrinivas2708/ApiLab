"use client";
import { GraphqlRightSidebar } from "@/components/graphql/graphql-sidebar";
import { GraphqlRequestEditor } from "@/components/graphql/request-editor";
import { GraphqlResponsePane } from "@/components/graphql/response-pane";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

export default function GraphQLPage() {
  return (
    <PanelGroup direction="horizontal" className="h-full">
      <Panel minSize={60}>
        <PanelGroup direction="vertical">
          <Panel className="min-h-0">
            <GraphqlRequestEditor/>
          </Panel>
          <PanelResizeHandle className="h-px bg-border" />
          <Panel maxSize={60} minSize={30}>
            <GraphqlResponsePane />
          </Panel>
        </PanelGroup>
      </Panel>
      <PanelResizeHandle className="w-px bg-border" />

      <Panel minSize={20} maxSize={30} className="hidden md:block">
        <GraphqlRightSidebar />
      </Panel>
    </PanelGroup>
  );
}
