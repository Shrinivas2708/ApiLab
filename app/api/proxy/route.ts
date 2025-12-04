import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { method, url, headers, params, body } = await req.json();

    // Build URL with query params manually (fetch doesn't support `params`)
    const fullUrl = new URL(url);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) fullUrl.searchParams.set(k, v as string);
      });
    }

    const upstream = await fetch(fullUrl.toString(), {
      method,
      headers,
      body: body ? JSON.stringify(JSON.parse(body)) : undefined,
      // fetch never throws on non-2xx (no need validateStatus)
    });

    const contentType = upstream.headers.get("content-type") || "";
    const isBinary =
      contentType.startsWith("image/") ||
      contentType.startsWith("video/") ||
      contentType.startsWith("audio/") ||
      contentType.includes("application/pdf") ||
      contentType.includes("application/octet-stream");

    // Read as ArrayBuffer (much cheaper than axios's wrapper)
    const buffer = Buffer.from(await upstream.arrayBuffer());

    if (!isBinary) {
      const text = buffer.toString("utf8");

      let parsed: any = text;
      if (contentType.includes("json")) {
        try {
          parsed = JSON.parse(text);
        } catch {}
      }

      return NextResponse.json({
        status: upstream.status,
        statusText: upstream.statusText,
        headers: Object.fromEntries(upstream.headers.entries()),
        isBinary: false,
        data: parsed,
        size: text.length,
        contentType,
      });
    }

    const base64 = buffer.toString("base64");

    return NextResponse.json({
      status: upstream.status,
      statusText: upstream.statusText,
      headers: Object.fromEntries(upstream.headers.entries()),
      isBinary: true,
      base64,
      contentType,
      size: base64.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
