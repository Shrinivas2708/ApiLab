"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus } from "lucide-react";
import { KeyValue } from "@/stores/request-store";

interface KeyValueTableProps {
  items: KeyValue[];
  setItems: (items: KeyValue[]) => void;
  isHeader?: boolean;
}

const COMMON_HEADERS = [
  "Accept",
  "Accept-CH",
  "Accept-CH-Lifetime",
  "Accept-Charset",
  "Accept-Encoding",
  "Accept-Language",
  "Accept-Push-Policy",
  "Accept-Ranges",
  "Accept-Signature",
  "Access-Control-Allow-Credentials",
  "Access-Control-Allow-Headers",
  "Access-Control-Allow-Methods",
  "Access-Control-Allow-Origin",
  "Access-Control-Expose-Headers",
  "Access-Control-Max-Age",
  "Access-Control-Request-Headers",
  "Access-Control-Request-Method",
  "Age",
  "Allow",
  "Alt-Svc",
  "Authorization",
  "Cache-Control",
  "Clear-Site-Data",
  "Connection",
  "Content-DPR",
  "Content-Disposition",
  "Content-Encoding",
  "Content-Language",
  "Content-Length",
  "Content-Location",
  "Content-Range",
  "Content-Security-Policy",
  "Content-Security-Policy-Report-Only",
  "Content-Type",
  "Cookie",
  "Cookie2",
  "Cross-Origin-Opener-Policy",
  "Cross-Origin-Resource-Policy",
  "DNT",
  "DPR",
  "Date",
  "Device-Memory",
  "Early-Data",
  "ETag",
  "Expect",
  "Expect-CT",
  "Expires",
  "Feature-Policy",
  "Forwarded",
  "From",
  "Host",
  "If-Match",
  "If-Modified-Since",
  "If-None-Match",
  "If-Range",
  "If-Unmodified-Since",
  "Keep-Alive",
  "Large-Allocation",
  "Last-Event-ID",
  "Last-Modified",
  "Link",
  "Location",
  "Max-Forwards",
  "NEL",
  "Origin",
  "Ping-From",
  "Ping-To",
  "Pragma",
  "Proxy-Authenticate",
  "Proxy-Authorization",
  "Public-Key-Pins",
  "Public-Key-Pins-Report-Only",
  "Push-Policy",
  "Range",
  "Referer",
  "Referrer-Policy",
  "Report-To",
  "Retry-After",
  "Save-Data",
  "Sec-WebSocket-Accept",
  "Sec-WebSocket-Extensions",
  "Sec-WebSocket-Key",
  "Sec-WebSocket-Protocol",
  "Sec-WebSocket-Version",
  "Server",
  "Server-Timing",
  "Service-Worker-Allowed",
  "Set-Cookie",
  "Set-Cookie2",
  "Signature",
  "Signed-Headers",
  "SourceMap",
  "Strict-Transport-Security",
  "TE",
  "Timing-Allow-Origin",
  "Tk",
  "Trailer",
  "Transfer-Encoding",
  "Upgrade",
  "Upgrade-Insecure-Requests",
  "User-Agent",
  "Vary",
  "Via",
  "Viewport-Width",
  "WWW-Authenticate",
  "Warning",
  "Width",
  "X-Content-Type-Options",
  "X-DNS-Prefetch-Control",
  "X-Download-Options",
  "X-Firefox-Spdy",
  "X-Forwarded-For",
  "X-Forwarded-Host",
  "X-Forwarded-Proto",
  "X-Frame-Options",
  "X-Permitted-Cross-Domain-Policies",
  "X-Pingback",
  "X-Powered-By",
  "X-Requested-With",
  "X-Robots-Tag",
  "X-UA-Compatible",
  "X-XSS-Protection"
];

export function KeyValueTable({ items, setItems, isHeader = false }: KeyValueTableProps) {
  const updateItem = (id: string, field: keyof KeyValue, value: any) => {
    const newItems = items.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      { id: crypto.randomUUID(), key: "", value: "", description: "", enabled: true },
    ]);
  };

  const deleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  return (
    <div className="flex flex-col h-full">
     
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col p-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center group  py-1">
              <div className="w-8 flex justify-center">
                <Checkbox
                  checked={item.enabled}
                  onCheckedChange={(checked) =>
                    updateItem(item.id, "enabled", checked)
                  }
                />
              </div>
              
              <div className="flex-1 px-1 relative">
                <Input
                  className="h-8 font-mono text-sm border-transparent hover:border-input focus:border-ring bg-transparent"
                  placeholder="Key"
                  value={item.key}
                  onChange={(e) => updateItem(item.id, "key", e.target.value)}
                  list={isHeader ? `header-suggestions-${item.id}` : undefined}
                />
                {isHeader && (
                  <datalist id={`header-suggestions-${item.id}`}>
                    {COMMON_HEADERS.map(h => <option key={h} value={h} />)}
                  </datalist>
                )}
              </div>

              <div className="flex-1 px-1">
                <Input
                  className="h-8 font-mono text-sm border-transparent hover:border-input focus:border-ring bg-transparent"
                  placeholder="Value"
                  value={item.value}
                  onChange={(e) => updateItem(item.id, "value", e.target.value)}
                />
              </div>

              <div className="flex-1 px-1">
                <Input
                  className="h-8 text-sm border-transparent hover:border-input focus:border-ring bg-transparent text-muted-foreground"
                  placeholder="Description"
                  value={item.description || ""}
                  onChange={(e) => updateItem(item.id, "description", e.target.value)}
                />
              </div>

              <div className="w-8 flex justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => deleteItem(item.id)}
                >
                  <Trash2 size={12} />
                </Button>
              </div>
            </div>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={addItem}
            className="self-start mt-2 gap-2"
          >
            <Plus size={14} /> Add New
          </Button>
        </div>
      </div>
    </div>
  );
}