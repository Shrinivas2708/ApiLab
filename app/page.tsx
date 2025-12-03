"use client";

import CollectionsPanel from "@/components/collection-panel";
import RequestPanel from "@/components/request-panel";
import ResponsePanel from "@/components/response-panel";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";

export default function RestPage() {
  return (
    <PanelGroup direction="horizontal" className="h-full">
      <Panel minSize={40}>
        <PanelGroup direction="vertical">
          <Panel defaultSize={60}>
            <RequestPanel/>
          </Panel>
          <PanelResizeHandle className="h-1 bg-border" />
          <Panel maxSize={80} minSize={20}>
            <ResponsePanel />
          </Panel>
        </PanelGroup>
      </Panel>
      <PanelResizeHandle className="w-1 bg-border" />

      <Panel minSize={20} maxSize={30} >
        <CollectionsPanel />
      </Panel>
    </PanelGroup>
  );
}
