import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const { method, url, headers, params, body } = await req.json();

    // Request as binary (arraybuffer) ALWAYS — we decide later what it is
    const response = await axios({
      method,
      url,
      headers,
      params,
      data: body ? JSON.parse(body) : undefined,
      responseType: "arraybuffer",
      validateStatus: () => true,
    });

    const contentType = response.headers["content-type"] || "";

    const isBinary =
      contentType.startsWith("image/") ||
      contentType.startsWith("video/") ||
      contentType.startsWith("audio/") ||
      contentType.includes("application/pdf") ||
      contentType.includes("application/octet-stream");

    // If it's TEXT or JSON → decode buffer to string
    if (!isBinary) {
      const text = Buffer.from(response.data).toString("utf8");

      let parsed: any = text;
      if (contentType.includes("json")) {
        try {
          parsed = JSON.parse(text);
        } catch {}
      }

      return NextResponse.json({
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        isBinary: false,
        data: parsed,
        size: text.length,
        contentType,
      });
    }

    // If binary → convert to base64 for frontend
    const base64 = Buffer.from(response.data).toString("base64");

    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      isBinary: true,
      base64,
      contentType,
      size: base64.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message, details: err.response?.data },
      { status: 500 }
    );
  }
}
