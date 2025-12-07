import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { io } from "socket.io-client";

export type Protocol = "websocket" | "sse" | "socketio" | "mqtt";

export type Message = {
  id: string;
  timestamp: Date;
  type: "sent" | "received" | "error" | "info";
  content: string;
};

export type RealtimeConnection = {
  protocol: Protocol;
  url: string;
  isConnected: boolean;
  messages: Message[];

  // WebSocket specific
  wsSubProtocols?: string;

  // Socket.IO specific
  socketPath?: string;
  socketVersion?: string;

  // MQTT specific
  mqttClientId?: string;
  mqttUsername?: string;
  mqttPassword?: string;
  mqttTopic?: string;
  mqttQos?: 0 | 1 | 2;

  // SSE specific
  sseWithCredentials?: boolean;
};

interface RealtimeState {
  connections: Record<Protocol, RealtimeConnection>;
  activeProtocol: Protocol;

  // WebSocket/SSE/Socket.IO connection instances
  connectionInstances: Map<Protocol, WebSocket | EventSource | any>;

  // Actions
  setActiveProtocol: (protocol: Protocol) => void;
  updateConnection: (
    protocol: Protocol,
    data: Partial<RealtimeConnection>
  ) => void;

  // Connection Management
  connect: (protocol: Protocol) => void;
  disconnect: (protocol: Protocol) => void;
  sendMessage: (protocol: Protocol, message: string) => void;
  addMessage: (protocol: Protocol, message: Message) => void;
  clearMessages: (protocol: Protocol) => void;
}

const createDefaultConnection = (protocol: Protocol): RealtimeConnection => ({
  protocol,
  url:
    protocol === "websocket"
      ? "wss://echo.apilabs.shriii.xyz"
      : protocol === "sse"
      ? "https://apilabs.shriii.xyz/api/echo/sse"
      : protocol === "socketio"
      ? "wss://echo.apilabs.shriii.xyz"
      : "wss://test.mosquitto.org:8081",
  isConnected: false,
  messages: [],
  wsSubProtocols: "",
  socketPath: "/socket.io",
  socketVersion: "v4",
  mqttClientId: `apilab_${Date.now()}`,
  mqttUsername: "",
  mqttPassword: "",
  mqttTopic: "test/topic",
  mqttQos: 0,
  sseWithCredentials: false,
});

export const useRealtimeStore = create<RealtimeState>()(
  persist(
    (set, get) => ({
      connections: {
        websocket: createDefaultConnection("websocket"),
        sse: createDefaultConnection("sse"),
        socketio: createDefaultConnection("socketio"),
        mqtt: createDefaultConnection("mqtt"),
      },
      activeProtocol: "websocket",
      connectionInstances: new Map(),

      setActiveProtocol: (protocol) => set({ activeProtocol: protocol }),

      updateConnection: (protocol, data) => {
        set((state) => ({
          connections: {
            ...state.connections,
            [protocol]: { ...state.connections[protocol], ...data },
          },
        }));
      },

      connect: (protocol) => {
        const state = get();
        const connection = state.connections[protocol];

        // Disconnect existing connection
        state.disconnect(protocol);

        try {
          if (protocol === "websocket") {
            const protocols = connection.wsSubProtocols
              ?.split(",")
              .map((p) => p.trim())
              .filter(Boolean);
            const ws = new WebSocket(connection.url, protocols);

            ws.onopen = () => {
              state.updateConnection(protocol, { isConnected: true });
              state.addMessage(protocol, {
                id: crypto.randomUUID(),
                timestamp: new Date(),
                type: "info",
                content: "Connected to WebSocket server",
              });
            };

            ws.onmessage = (event) => {
              state.addMessage(protocol, {
                id: crypto.randomUUID(),
                timestamp: new Date(),
                type: "received",
                content: event.data,
              });
            };

            ws.onerror = () => {
              state.addMessage(protocol, {
                id: crypto.randomUUID(),
                timestamp: new Date(),
                type: "error",
                content: "WebSocket error occurred",
              });
            };

            ws.onclose = () => {
              state.updateConnection(protocol, { isConnected: false });
              state.addMessage(protocol, {
                id: crypto.randomUUID(),
                timestamp: new Date(),
                type: "info",
                content: "Disconnected from WebSocket server",
              });
              state.connectionInstances.delete(protocol);
            };

            state.connectionInstances.set(protocol, ws);
          } else if (protocol === "sse") {
            const eventSource = new EventSource(connection.url, {
              withCredentials: connection.sseWithCredentials || false,
            });

            eventSource.onopen = () => {
              state.updateConnection(protocol, { isConnected: true });
              state.addMessage(protocol, {
                id: crypto.randomUUID(),
                timestamp: new Date(),
                type: "info",
                content: "Connected to SSE server",
              });
            };

            eventSource.onmessage = (event) => {
              state.addMessage(protocol, {
                id: crypto.randomUUID(),
                timestamp: new Date(),
                type: "received",
                content: event.data,
              });
            };

            eventSource.onerror = () => {
              state.addMessage(protocol, {
                id: crypto.randomUUID(),
                timestamp: new Date(),
                type: "error",
                content: "SSE connection error",
              });
              state.disconnect(protocol);
            };

            state.connectionInstances.set(protocol, eventSource);
          } else if (protocol === "socketio") {
            const socket = io(connection.url, {
              path: connection.socketPath || "/socket.io",
              transports: ["websocket"], // ✅ avoid polling
            });
socket.removeAllListeners();
            socket.on("connect", () => {
              state.updateConnection(protocol, { isConnected: true });
              state.addMessage(protocol, {
                id: crypto.randomUUID(),
                timestamp: new Date(),
                type: "info",
                content: "Connected to Socket.IO server",
              });
            });

            socket.on("message", (data) => {
              state.addMessage(protocol, {
                id: crypto.randomUUID(),
                timestamp: new Date(),
                type: "received",
                content: String(data),
              });
            });

            socket.on("disconnect", () => {
              state.updateConnection(protocol, { isConnected: false });
            });

            socket.on("connect_error", (err) => {
              state.addMessage(protocol, {
                id: crypto.randomUUID(),
                timestamp: new Date(),
                type: "error",
                content: err.message,
              });
            });

            state.connectionInstances.set(protocol, socket);
          } else if (protocol === "mqtt") {
            state.addMessage(protocol, {
              id: crypto.randomUUID(),
              timestamp: new Date(),
              type: "error",
              content: `${protocol.toUpperCase()} support requires server-side proxy implementation.`,
            });
          }
        } catch (error: any) {
          state.addMessage(protocol, {
            id: crypto.randomUUID(),
            timestamp: new Date(),
            type: "error",
            content: `Connection failed: ${error.message}`,
          });
        }
      },

      disconnect: (protocol) => {
        const state = get();
        const instance = state.connectionInstances.get(protocol);

        if (instance) {
          if (instance instanceof WebSocket) {
            instance.close();
          } else if (instance instanceof EventSource) {
            instance.close();
          } else if (protocol === "socketio") {
            instance.removeAllListeners();
            instance.disconnect(); // ✅ REQUIRED
          }
          state.connectionInstances.delete(protocol);
        }

        state.updateConnection(protocol, { isConnected: false });
      },

      sendMessage: (protocol, message) => {
        const state = get();
        const instance = state.connectionInstances.get(protocol);

        if (!instance) return;

        try {
          // ✅ WebSocket
          if (protocol === "websocket" && instance instanceof WebSocket) {
            instance.send(message);
          }

          // ✅ Socket.IO
          else if (protocol === "socketio") {
            instance.emit("message", message);
          }

          state.addMessage(protocol, {
            id: crypto.randomUUID(),
            timestamp: new Date(),
            type: "sent",
            content: message,
          });
        } catch (error: any) {
          state.addMessage(protocol, {
            id: crypto.randomUUID(),
            timestamp: new Date(),
            type: "error",
            content: `Failed to send: ${error.message}`,
          });
        }
      },

      addMessage: (protocol, message) => {
        set((state) => ({
          connections: {
            ...state.connections,
            [protocol]: {
              ...state.connections[protocol],
              messages: [...state.connections[protocol].messages, message],
            },
          },
        }));
      },

      clearMessages: (protocol) => {
        set((state) => ({
          connections: {
            ...state.connections,
            [protocol]: {
              ...state.connections[protocol],
              messages: [],
            },
          },
        }));
      },
    }),
    {
      name: "apilab-realtime-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeProtocol: state.activeProtocol,
        connections: Object.fromEntries(
          Object.entries(state.connections).map(([key, conn]) => [
            key,
            { ...conn, isConnected: false, messages: [] },
          ])
        ),
      }),
    }
  )
);
