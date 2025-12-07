"use client";
import React, { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRequestStore } from "@/stores/request-store";

export function CodeSnippet() {
  const { tabs, activeTabId } = useRequestStore();
  const activeTab = tabs.find(t => t.id === activeTabId);
  const [lang, setLang] = useState("curl");
  const [copied, setCopied] = useState(false);

  if (!activeTab) return <div className="p-4 text-muted-foreground">No active request</div>;

  const { method, url, headers, body, bodyType } = activeTab;
  const hasBody = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && body && bodyType !== 'none';
  
  // Helper to safely get body string
  const getBodySafe = () => {
      if (!hasBody) return "";
      // Escape single quotes for shell
      return body;
  };

  const getHeadersObj = () => {
      return headers.filter(h => h.enabled && h.key).reduce((acc, h) => ({...acc, [h.key]: h.value}), {} as Record<string, string>);
  };

  const generateCode = () => {
    switch(lang) {
        case "curl": {
            let code = `curl --request ${method} \\\n  --url ${url}`;
            headers.forEach(h => {
                if(h.enabled && h.key) code += ` \\\n  --header '${h.key}: ${h.value}'`;
            });
            if (hasBody) {
                code += ` \\\n  --data '${getBodySafe().replace(/'/g, "'\\''")}'`;
            }
            return code;
        }

        case "js-fetch": {
            return `const myHeaders = new Headers();
${headers.filter(h=>h.enabled && h.key).map(h => `myHeaders.append("${h.key}", "${h.value}");`).join('\n')}

const requestOptions = {
  method: "${method}",
  headers: myHeaders,
  ${hasBody ? `body: JSON.stringify(${body}),` : ''}
  redirect: "follow"
};

fetch("${url}", requestOptions)
  .then((response) => response.text())
  .then((result) => console.log(result))
  .catch((error) => console.error(error));`;
        }

        case "js-axios": {
            return `const axios = require('axios');
let data = ${hasBody ? JSON.stringify(JSON.parse(body || '{}'), null, 2) : "''"};

let config = {
  method: '${method.toLowerCase()}',
  maxBodyLength: Infinity,
  url: '${url}',
  headers: { 
${headers.filter(h=>h.enabled && h.key).map(h => `    '${h.key}': '${h.value}'`).join(',\n')}
  },
  data : data
};

axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});`;
        }

        case "python-requests": {
            return `import requests
import json

url = "${url}"

payload = ${hasBody ? JSON.stringify(JSON.parse(body || '{}'), null, 2) : "{}"}
headers = {
${headers.filter(h=>h.enabled && h.key).map(h => `  '${h.key}': '${h.value}'`).join(',\n')}
}

response = requests.request("${method}", url, headers=headers, json=payload)

print(response.text)`;
        }

        case "go": {
            return `package main

import (
  "fmt"
  "strings"
  "net/http"
  "io/ioutil"
)

func main() {

  url := "${url}"
  method := "${method}"

  payload := strings.NewReader(\`${hasBody ? body : ''}\`)

  client := &http.Client {
  }
  req, err := http.NewRequest(method, url, payload)

  if err != nil {
    fmt.Println(err)
    return
  }
${headers.filter(h=>h.enabled && h.key).map(h => `  req.Header.Add("${h.key}", "${h.value}")`).join('\n')}

  res, err := client.Do(req)
  if err != nil {
    fmt.Println(err)
    return
  }
  defer res.Body.Close()

  body, err := ioutil.ReadAll(res.Body)
  if err != nil {
    fmt.Println(err)
    return
  }
  fmt.Println(string(body))
}`;
        }

        case "java-http": {
            return `import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class Main {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("${url}"))
${headers.filter(h=>h.enabled && h.key).map(h => `                .header("${h.key}", "${h.value}")`).join('\n')}
                .method("${method}", HttpRequest.BodyPublishers.${hasBody ? `ofString("${body.replace(/"/g, '\\"')}")` : "noBody()"})
                .build();
        HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println(response.body());
    }
}`;
        }

        case "csharp-httpclient": {
            return `var client = new HttpClient();
var request = new HttpRequestMessage(HttpMethod.${method.charAt(0) + method.slice(1).toLowerCase()}, "${url}");
${headers.filter(h=>h.enabled && h.key).map(h => `request.Headers.Add("${h.key}", "${h.value}");`).join('\n')}
${hasBody ? `var content = new StringContent("${body.replace(/"/g, '\\"')}", null, "application/json");
request.Content = content;` : ''}
var response = await client.SendAsync(request);
response.EnsureSuccessStatusCode();
Console.WriteLine(await response.Content.ReadAsStringAsync());`;
        }

        case "php-curl": {
            return `<?php

$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => '${url}',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => '',
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 0,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => '${method}',
  ${hasBody ? `CURLOPT_POSTFIELDS =>'${body}',` : ''}
  CURLOPT_HTTPHEADER => array(
${headers.filter(h=>h.enabled && h.key).map(h => `    '${h.key}: ${h.value}'`).join(',\n')}
  ),
));

$response = curl_exec($curl);

curl_close($curl);
echo $response;`;
        }

        case "node-native": {
            let hostname = "";
            let path = "";
            try {
                const u = new URL(url);
                hostname = u.hostname;
                path = u.pathname + u.search;
            } catch(e) {}

            return `const http = require('https'); // or 'http'

const options = {
  'method': '${method}',
  'hostname': '${hostname}',
  'path': '${path}',
  'headers': {
${headers.filter(h=>h.enabled && h.key).map(h => `    '${h.key}': '${h.value}'`).join(',\n')}
  }
};

const req = http.request(options, function (res) {
  const chunks = [];

  res.on("data", function (chunk) {
    chunks.push(chunk);
  });

  res.on("end", function () {
    const body = Buffer.concat(chunks);
    console.log(body.toString());
  });
});

${hasBody ? `req.write(JSON.stringify(${body}));` : ''}
req.end();`;
        }

        case "powershell": {
            return `$headers = New-Object "System.Collections.Generic.Dictionary[[String],[String]]"
${headers.filter(h=>h.enabled && h.key).map(h => `$headers.Add("${h.key}", "${h.value}")`).join('\n')}

$body = "${hasBody ? body.replace(/"/g, '`"') : ''}"

$response = Invoke-RestMethod '${url}' -Method '${method}' -Headers $headers ${hasBody ? '-Body $body' : ''}
$response | ConvertTo-Json`;
        }

        default: return "// Select a language";
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine highlighting (fallback to javascript for C-like syntaxes, none for others to avoid crashes without plugins)
  const getExtensions = () => {
      if (['js-fetch', 'js-axios', 'node-native', 'java-http', 'csharp-httpclient', 'go', 'php-curl'].includes(lang)) {
          return [javascript()];
      }
      return []; // Plain text for Python/Shell/PowerShell as we don't have those extensions installed
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex justify-between items-center p-2 border-b">
        <Select value={lang} onValueChange={setLang}>
          <SelectTrigger className="w-[220px] h-8 text-xs">
            <SelectValue placeholder="Select Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="curl">Shell – cURL</SelectItem>
            <SelectItem value="js-fetch">JavaScript – Fetch</SelectItem>
            <SelectItem value="js-axios">JavaScript – Axios</SelectItem>
            <SelectItem value="python-requests">Python – Requests</SelectItem>
            <SelectItem value="go">Go – net/http</SelectItem>
            <SelectItem value="java-http">Java – java.net.http</SelectItem>
            <SelectItem value="csharp-httpclient">C# – HttpClient</SelectItem>
            <SelectItem value="php-curl">PHP – cURL</SelectItem>
            <SelectItem value="node-native">Node.js – Native HTTP</SelectItem>
            <SelectItem value="powershell">PowerShell – RestMethod</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8">
          {copied ? <Check size={14} className="text-green-500 mr-2" /> : <Copy size={14} className="mr-2" />}
          {copied ? "Copied" : "Copy Code"}
        </Button>
      </div>
      <div className="flex-1 overflow-hidden relative bg-[#1e1e1e]">
        <CodeMirror
          value={generateCode()}
          height="100%"
          theme="dark"
          extensions={getExtensions()}
          editable={false}
          className="h-full text-xs"
          basicSetup={{ lineNumbers: true }}
        />
      </div>
    </div>
  );
}