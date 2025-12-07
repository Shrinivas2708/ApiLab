"use client";

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { RealtimeTabs } from "@/components/realtime/realtime-tabs";
import { RealtimeConnection } from "@/components/realtime/realtime-connection";
import { RealtimeMessages } from "@/components/realtime/realtime-messages";
import { RealtimeConfig } from "@/components/realtime/realtime-config";

export default function RealtimePage() {
  return (
    <div className="flex flex-col h-full bg-background">
      <RealtimeTabs />
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal" className="h-full">
          <Panel defaultSize={70} minSize={55}>
            <PanelGroup direction="vertical" className="h-full">
              <Panel
                defaultSize={18}
                minSize={12}
                maxSize={25}
                className="min-h-0"
              >
                <RealtimeConnection />
              </Panel>
              <PanelResizeHandle className="h-px bg-border hover:bg-primary/60 transition-colors" />
              <Panel defaultSize={82} minSize={50} className="min-h-0">
                <RealtimeMessages />
              </Panel>
            </PanelGroup>
          </Panel>
          <PanelResizeHandle className="w-px bg-border hover:bg-primary/60 transition-colors" />
          <Panel
            defaultSize={30}
            minSize={22}
            maxSize={45}
            className="min-w-0 bg-muted/30 border-l"
          >
            <RealtimeConfig />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
