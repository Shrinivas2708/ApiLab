import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Environment from "@/models/Environment";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json([]);

  await connectDB();
  const envs = await Environment.find({ userId: (session.user as any).id });
  return NextResponse.json(envs);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  await connectDB();

  const newEnv = await Environment.create({
    userId: (session.user as any).id,
    name: body.name,
    variables: body.variables || []
  });

  return NextResponse.json(newEnv);
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  await connectDB();

  const updated = await Environment.findOneAndUpdate(
    { _id: body._id, userId: (session.user as any).id },
    { name: body.name, variables: body.variables },
    { new: true }
  );

  return NextResponse.json(updated);
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    await connectDB();
    await Environment.findOneAndDelete({ _id: id, userId: (session.user as any).id });
    
    return NextResponse.json({ success: true });
}
