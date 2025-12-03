"use client";

import CollectionsPanel from "@/components/collection-panel";
import RequestPanel from "@/components/request-panel";
import ResponsePanel from "@/components/response-panel";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";

export default function RestPage() {
  return (
    <PanelGroup direction="horizontal" className="h-full">
      <Panel minSize={60}>
        <PanelGroup direction="vertical">
          <Panel >
            <RequestPanel/>
          </Panel>
          <PanelResizeHandle className="h-px bg-border" />
          <Panel maxSize={60} minSize={30}>
            <ResponsePanel />
          </Panel>
        </PanelGroup>
      </Panel>
      <PanelResizeHandle className="w-px bg-border" />

      <Panel minSize={20} maxSize={30} >
        <CollectionsPanel />
      </Panel>
    </PanelGroup>
  );
}
