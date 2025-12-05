import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import History from "@/models/History";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ ok: true }); // Skip if not logged in

  const body = await req.json();
  await connectDB();

  await History.create({
    userId: (session.user as any).id,
    ...body
  });

  return NextResponse.json({ success: true });
}

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json([]);
  
    await connectDB();
    // Get last 20 requests, sorted by new
    const history = await History.find({ userId: (session.user as any).id })
        .sort({ date: -1 })
        .limit(20);
    return NextResponse.json(history);
}