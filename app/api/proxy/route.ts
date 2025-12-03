
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const { method, url, headers, body, params } = await req.json();

    const response = await axios({
      method,
      url,
      headers,
      params,
      data: body ? JSON.parse(body) : undefined,
      validateStatus: () => true, // Don't throw error on 400/500
    });

    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
      size: JSON.stringify(response.data).length, // Rough estimate
      time: 0, // Calculated on client
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message, details: error.response?.data },
      { status: 500 }
    );
  }
}