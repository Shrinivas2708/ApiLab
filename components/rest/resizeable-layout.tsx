"use client";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Sidebar } from "@/components/rest/sidebar";
import Navbar from "@/components/navbar";
import Footer from "../footer";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* FIXED SIDEBAR */}
        <div className=" border-r bg-background h-full ">
          <Sidebar />
        </div>

        {/* RESIZABLE CENTER + RIGHT */}
        <PanelGroup direction="horizontal" className="flex-1">
          {/* CENTER MAIN CONTENT */}
          <Panel defaultSize={65} minSize={40}>
            <div className="h-full overflow-auto p-4 bg-background">
              {children}
            </div>
          </Panel>

          {/* RESIZE HANDLE */}
          <PanelResizeHandle className="w-1 cursor-col-resize bg-border hover:bg-primary" />

          {/* RIGHT COLLECTION PANEL */}
          <Panel defaultSize={35} minSize={20} maxSize={45}>
            <div className="h-full border-l bg-background p-4">
              <h2 className="text-lg font-semibold">Collections</h2>
              <p className="text-muted-foreground">Add Collection UI here...</p>
            </div>
          </Panel>
        </PanelGroup>
      </div>

      <Footer />
    </div>
  );
}
