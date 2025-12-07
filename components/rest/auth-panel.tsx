"use client";

import { useRequestStore, AuthType } from "@/stores/request-store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, ShieldAlert, Key, Globe, Lock, Fingerprint, Cloud, Server, FileDigit, RefreshCw } from "lucide-react";

export default function AuthPanel() {
  const store = useRequestStore();
  const activeTab = store.tabs.find((t) => t.id === store.activeTabId);
  
  if (!activeTab) return null;

  const auth = activeTab.auth || { type: 'none' };

  const updateAuth = (field: string, value: any) => {
    store.setAuth({ ...auth, [field]: value });
  };

  const handleTypeChange = (type: AuthType) => {
    store.setAuth({ ...auth, type });
  };

  const AuthTypes = [
    { id: 'inherit', label: 'Inherit', icon: RefreshCw },
    { id: 'none', label: 'None', icon: ShieldAlert },
    { id: 'basic', label: 'Basic Auth', icon: Shield },
    { id: 'digest', label: 'Digest Auth', icon: Lock },
    { id: 'bearer', label: 'Bearer', icon: Key },
    { id: 'oauth2', label: 'OAuth 2.0', icon: Globe },
    { id: 'apikey', label: 'API Key', icon: Fingerprint },
    { id: 'aws', label: 'AWS Signature', icon: Cloud },
    { id: 'hawk', label: 'HAWK', icon: Server },
    { id: 'jwt', label: 'JWT', icon: FileDigit },
  ];

  return (
    <div className="flex h-full">
      <div className="w-56 border-r bg-muted/10 flex flex-col overflow-y-auto">
        <Label className="text-xs text-muted-foreground px-4 py-3 sticky top-0 bg-background/95 backdrop-blur z-10">
          Authorization Type
        </Label>
        <div className="p-2 flex flex-col gap-1">
          {AuthTypes.map((item) => (
            <div
              key={item.id}
              onClick={() => handleTypeChange(item.id as AuthType)}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors
                ${auth.type === item.id 
                  ? 'bg-primary/10 text-primary font-medium shadow-sm' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }
              `}
            >
              <item.icon size={15} />
              {item.label}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-xl space-y-6">
          
          {auth.type === 'inherit' && (
             <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-60 pt-20">
               <RefreshCw size={48} className="mb-4" />
               <p>Inherit auth from parent collection (Not implemented yet).</p>
             </div>
          )}

          {auth.type === 'none' && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-60 pt-20">
              <ShieldAlert size={48} className="mb-4" />
              <p>This request does not use any authorization.</p>
            </div>
          )}

          {(auth.type === 'bearer' || auth.type === 'oauth2' || auth.type === 'jwt') && (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="space-y-1">
                <h3 className="font-medium flex items-center gap-2 capitalize">
                  {auth.type === 'oauth2' ? 'OAuth 2.0' : auth.type === 'jwt' ? 'JWT Bearer' : 'Bearer Token'}
                </h3>
                <p className="text-xs text-muted-foreground">The token will be added to the Authorization header.</p>
              </div>
              <div className="space-y-2">
                <Label>Token</Label>
                <Input 
                  type="password"
                  placeholder="e.g. eyJhbGciOiJIUzI1Ni..." 
                  value={auth.token || ''}
                  onChange={(e) => updateAuth('token', e.target.value)}
                />
              </div>
            </div>
          )}

          {auth.type === 'basic' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="space-y-1">
                <h3 className="font-medium flex items-center gap-2">Basic Auth</h3>
                <p className="text-xs text-muted-foreground">Credentials are Base64 encoded in the Authorization header.</p>
              </div>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input 
                    value={auth.username || ''}
                    onChange={(e) => updateAuth('username', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input 
                    type="password"
                    value={auth.password || ''}
                    onChange={(e) => updateAuth('password', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {auth.type === 'apikey' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="space-y-1">
                <h3 className="font-medium flex items-center gap-2">API Key</h3>
                <p className="text-xs text-muted-foreground">Key-value pair added to header or query params.</p>
              </div>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Key</Label>
                  <Input 
                    placeholder="x-api-key"
                    value={auth.key || ''}
                    onChange={(e) => updateAuth('key', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Value</Label>
                  <Input 
                    placeholder="12345"
                    value={auth.value || ''}
                    onChange={(e) => updateAuth('value', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Add To</Label>
                  <Select value={auth.addTo || 'header'} onValueChange={(val) => updateAuth('addTo', val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="header">Header</SelectItem>
                      <SelectItem value="query">Query Params</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {auth.type === 'aws' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="space-y-1">
                <h3 className="font-medium flex items-center gap-2">AWS Signature</h3>
                <p className="text-xs text-muted-foreground">AWS v4 HMAC Signature.</p>
              </div>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>AccessKey</Label>
                    <Input 
                      value={auth.accessKey || ''}
                      onChange={(e) => updateAuth('accessKey', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>SecretKey</Label>
                    <Input 
                      type="password"
                      value={auth.secretKey || ''}
                      onChange={(e) => updateAuth('secretKey', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>AWS Region</Label>
                    <Input 
                      placeholder="us-east-1"
                      value={auth.region || ''}
                      onChange={(e) => updateAuth('region', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Service Name</Label>
                    <Input 
                      placeholder="s3"
                      value={auth.service || ''}
                      onChange={(e) => updateAuth('service', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Session Token (Optional)</Label>
                  <Input 
                    value={auth.sessionToken || ''}
                    onChange={(e) => updateAuth('sessionToken', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {auth.type === 'digest' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="space-y-1">
                <h3 className="font-medium flex items-center gap-2">Digest Auth</h3>
                <p className="text-xs text-muted-foreground">The challenge-response authentication mechanism.</p>
              </div>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input 
                    value={auth.username || ''}
                    onChange={(e) => updateAuth('username', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input 
                    type="password"
                    value={auth.password || ''}
                    onChange={(e) => updateAuth('password', e.target.value)}
                  />
                </div>
                <p className="text-xs text-yellow-500 bg-yellow-500/10 p-2 rounded">
                  Note: Simplified Digest implementation.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}