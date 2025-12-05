import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Collection from "@/models/Collection";
import { z } from "zod";

// 1. Define Validation Schemas
const CreateCollectionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  parentId: z.string().nullable().optional(), 
});

const AddRequestSchema = z.object({
  collectionId: z.string().min(1, "Collection ID is required"),
  request: z.object({
    name: z.string().min(1, "Request name is required"),
    method: z.string(),
    url: z.string(),
    headers: z.array(z.any()).optional(),
    body: z.string().optional(),
    bodyType: z.string().optional(),
  }),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const collections = await Collection.find({ userId: (session.user as any).id }).sort({ createdAt: -1 });
  return NextResponse.json(collections);
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    // 2. Validate Input
    const validation = CreateCollectionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.flatten() }, { status: 400 });
    }

    const { name, parentId } = validation.data;
    await connectDB();

    // 3. Handle ParentId properly (Convert "" to null to avoid MongoDB CastError)
    const validParentId = (parentId && parentId.trim() !== "") ? parentId : null;

    const newCol = await Collection.create({
      userId: (session.user as any).id,
      name,
      parentId: validParentId,
      requests: []
    });

    return NextResponse.json(newCol);
  } catch (error: any) {
    console.error("Collection Create Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

// 4. New Method to SAVE REQUEST to a Collection
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const validation = AddRequestSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.flatten() }, { status: 400 });
    }

    const { collectionId, request } = validation.data;
    await connectDB();

    // Update the specific collection by pushing the new request
    const updatedCollection = await Collection.findOneAndUpdate(
      { _id: collectionId, userId: (session.user as any).id },
      { $push: { requests: request } },
      { new: true }
    );

    if (!updatedCollection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    return NextResponse.json(updatedCollection);
  } catch (error: any) {
    console.error("Save Request Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}