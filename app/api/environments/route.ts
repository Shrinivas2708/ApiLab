import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Environment from "@/models/Environment";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json([]);

    await connectDB();
    const envs = await Environment.find({ userId: (session.user as any).id });
    return NextResponse.json(envs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    
    // Basic validation
    if (!body.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    await connectDB();

    const newEnv = await Environment.create({
      userId: (session.user as any).id,
      name: body.name,
      variables: body.variables || []
    });

    return NextResponse.json(newEnv);
  } catch (error: any) {
    console.error("Create Env Error:", error); // Log the actual error to terminal
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    await connectDB();

    const updated = await Environment.findOneAndUpdate(
      { _id: body._id, userId: (session.user as any).id },
      { name: body.name, variables: body.variables },
      { new: true }
    );

    if (!updated) return NextResponse.json({ error: "Environment not found" }, { status: 404 });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Update Env Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    await connectDB();
    await Environment.findOneAndDelete({ _id: id, userId: (session.user as any).id });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}