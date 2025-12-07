import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const headers = Object.fromEntries(req.headers.entries());

  return NextResponse.json({
    method: req.method,
    url: req.url,
    headers,
  });
}

export async function OPTIONS() {
  return NextResponse.json(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      "Access-Control-Allow-Headers": "*",
    },
  });
}
