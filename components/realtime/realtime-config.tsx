"use client";

import { useRealtimeStore } from "@/stores/realtime-store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

export function RealtimeConfig() {
  const { activeProtocol, connections, updateConnection } = useRealtimeStore();
  const activeConnection = connections[activeProtocol];

  return (
    <div className="flex flex-col h-full bg-background">
      <Tabs defaultValue="config" className="flex flex-col h-full">
        <div className=" px-2 bg-muted/5">
          <TabsList className="h-9 bg-transparent p-0 w-full justify-start">
            <TabsTrigger value="config" className="rounded-full">
              Configuration
            </TabsTrigger>
            <TabsTrigger value="info" className="rounded-full">
              Info
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          <TabsContent value="config" className="m-0 p-4 space-y-4">
            {activeProtocol === 'websocket' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Sub-protocols (comma separated)</Label>
                  <Input
                    value={activeConnection.wsSubProtocols || ''}
                    onChange={(e) => updateConnection(activeProtocol, { wsSubProtocols: e.target.value })}
                    placeholder="chat, superchat"
                    disabled={activeConnection.isConnected}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional WebSocket sub-protocols to use
                  </p>
                </div>
              </div>
            )}

            {activeProtocol === 'sse' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="credentials"
                    checked={activeConnection.sseWithCredentials || false}
                    onCheckedChange={(checked) => 
                      updateConnection(activeProtocol, { sseWithCredentials: checked as boolean })
                    }
                    disabled={activeConnection.isConnected}
                  />
                  <Label htmlFor="credentials" className="text-sm cursor-pointer">
                    Send credentials with request
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  SSE is read-only. You can only receive messages from the server.
                </p>
              </div>
            )}

            {activeProtocol === 'socketio' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Socket.IO Path</Label>
                  <Input
                    value={activeConnection.socketPath || '/socket.io'}
                    onChange={(e) => updateConnection(activeProtocol, { socketPath: e.target.value })}
                    placeholder="/socket.io"
                    disabled={activeConnection.isConnected}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Socket.IO Version</Label>
                  <Select
                    value={activeConnection.socketVersion || 'v4'}
                    onValueChange={(v) => updateConnection(activeProtocol, { socketVersion: v })}
                    disabled={activeConnection.isConnected}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="v4">v4</SelectItem>
                      <SelectItem value="v3">v3</SelectItem>
                      <SelectItem value="v2">v2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-md p-3">
                  <p className="text-xs text-yellow-600 dark:text-yellow-500">
                    <strong>Note:</strong> Socket.IO requires a proxy implementation. Direct browser connections are limited.
                  </p>
                </div>
              </div>
            )}

            {activeProtocol === 'mqtt' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Client ID</Label>
                  <Input
                    value={activeConnection.mqttClientId || ''}
                    onChange={(e) => updateConnection(activeProtocol, { mqttClientId: e.target.value })}
                    placeholder="apilab_client"
                    disabled={activeConnection.isConnected}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Username</Label>
                    <Input
                      value={activeConnection.mqttUsername || ''}
                      onChange={(e) => updateConnection(activeProtocol, { mqttUsername: e.target.value })}
                      placeholder="username"
                      disabled={activeConnection.isConnected}
                      className="text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Password</Label>
                    <Input
                      type="password"
                      value={activeConnection.mqttPassword || ''}
                      onChange={(e) => updateConnection(activeProtocol, { mqttPassword: e.target.value })}
                      placeholder="password"
                      disabled={activeConnection.isConnected}
                      className="text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Topic</Label>
                  <Input
                    value={activeConnection.mqttTopic || ''}
                    onChange={(e) => updateConnection(activeProtocol, { mqttTopic: e.target.value })}
                    placeholder="test/topic"
                    disabled={activeConnection.isConnected}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">QoS Level</Label>
                  <Select
                    value={String(activeConnection.mqttQos || 0)}
                    onValueChange={(v) => updateConnection(activeProtocol, { mqttQos: parseInt(v) as 0 | 1 | 2 })}
                    disabled={activeConnection.isConnected}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0 - At most once</SelectItem>
                      <SelectItem value="1">1 - At least once</SelectItem>
                      <SelectItem value="2">2 - Exactly once</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-md p-3">
                  <p className="text-xs text-yellow-600 dark:text-yellow-500">
                    <strong>Note:</strong> MQTT over WebSocket requires a proxy implementation. Direct browser MQTT connections are limited.
                  </p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="info" className="m-0 p-4 space-y-4">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-sm mb-2">Protocol Information</h3>
                <div className="bg-muted/30 rounded-md p-3 space-y-2 text-xs">
                  {activeProtocol === 'websocket' && (
                    <>
                      <p><strong>WebSocket</strong> provides full-duplex communication channels over a single TCP connection.</p>
                      <p className="text-muted-foreground">
                        Use <code className="bg-muted px-1 rounded">wss://</code> for secure connections or <code className="bg-muted px-1 rounded">ws://</code> for unsecured.
                      </p>
                    </>
                  )}
                  {activeProtocol === 'sse' && (
                    <>
                      <p><strong>Server-Sent Events</strong> allow servers to push data to web clients over HTTP.</p>
                      <p className="text-muted-foreground">
                        SSE is one-way (server to client only) and uses standard HTTP protocol.
                      </p>
                    </>
                  )}
                  {activeProtocol === 'socketio' && (
                    <>
                      <p><strong>Socket.IO</strong> enables real-time, bidirectional communication between web clients and servers.</p>
                      <p className="text-muted-foreground">
                        It uses WebSocket when possible and falls back to HTTP long-polling.
                      </p>
                    </>
                  )}
                  {activeProtocol === 'mqtt' && (
                    <>
                      <p><strong>MQTT</strong> is a lightweight messaging protocol optimized for high-latency or unreliable networks.</p>
                      <p className="text-muted-foreground">
                        Perfect for IoT devices and machine-to-machine communication.
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-2">Connection State</h3>
                <div className="bg-muted/30 rounded-md p-3 space-y-1 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={activeConnection.isConnected ? "text-green-500" : "text-muted-foreground"}>
                      {activeConnection.isConnected ? "Connected" : "Disconnected"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Messages:</span>
                    <span>{activeConnection.messages.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sent:</span>
                    <span>{activeConnection.messages.filter(m => m.type === 'sent').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Received:</span>
                    <span>{activeConnection.messages.filter(m => m.type === 'received').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Errors:</span>
                    <span className="text-red-500">
                      {activeConnection.messages.filter(m => m.type === 'error').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}