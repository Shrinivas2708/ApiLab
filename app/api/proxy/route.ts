import { NextRequest, NextResponse } from "next/server";

export const runtime = 'nodejs'; 

export async function POST(req: NextRequest) {
  try {
    const { method, url, headers, params, body } = await req.json();

    const fullUrl = new URL(url);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) fullUrl.searchParams.set(k, v as string);
      });
    }

    const startTime = performance.now();

    const upstream = await fetch(fullUrl.toString(), {
      method,
      headers,
      body: body ? JSON.stringify(JSON.parse(body)) : undefined,
      keepalive:true,
      cache:'no-store'
    });

    const upstreamLatency = Math.round(performance.now() - startTime);

    const contentType = upstream.headers.get("content-type") || "";
    const isBinary =
      contentType.startsWith("image/") ||
      contentType.startsWith("video/") ||
      contentType.startsWith("audio/") ||
      contentType.includes("application/pdf") ||
      contentType.includes("application/octet-stream");

    const arrayBuffer = await upstream.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Prepare response payload
    const responsePayload = {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: Object.fromEntries(upstream.headers.entries()),
      isBinary,
      contentType,
      size: buffer.length,
      time: upstreamLatency, 
      data: null as any,
      base64: "",
    };

    if (isBinary) {
      responsePayload.base64 = buffer.toString("base64");
    } else {
      const text = buffer.toString("utf8");
      try {
        if (contentType.includes("json")) {
           responsePayload.data = JSON.parse(text);
        } else {
           responsePayload.data = text;
        }
      } catch {
        responsePayload.data = text;
      }
    }
    return NextResponse.json(responsePayload);

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}