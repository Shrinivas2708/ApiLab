import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Collection from "@/models/Collection";
import { z } from "zod";
import { NextResponse } from "next/server";

const CreateCollectionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  parentId: z.string().nullable().optional(), 
});

const AddRequestSchema = z.object({
  collectionId: z.string().min(1, "Collection ID is required"),
  requestId: z.string().optional(), // Optional: if present, we update
  request: z.object({
    name: z.string().min(1, "Request name is required"),
    method: z.string(),
    url: z.string(),
    headers: z.array(z.any()).optional(),
    body: z.string().optional(),
    bodyType: z.string().optional(),
    auth: z.any().optional(),
    params: z.array(z.any()).optional(),
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
    const validation = CreateCollectionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.flatten() }, { status: 400 });
    }

    const { name, parentId } = validation.data;
    await connectDB();

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

// Handle Save (Create New or Update Existing)
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const validation = AddRequestSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.flatten() }, { status: 400 });
    }

    const { collectionId, requestId, request } = validation.data;
    await connectDB();

    let updatedCollection;

    if (requestId) {
      // UPDATE EXISTING REQUEST
      updatedCollection = await Collection.findOneAndUpdate(
        { 
          _id: collectionId, 
          userId: (session.user as any).id,
          "requests._id": requestId 
        },
        { 
          $set: { 
            "requests.$": { ...request, _id: requestId } 
          } 
        },
        { new: true }
      );
    } else {
      // CREATE NEW REQUEST
      updatedCollection = await Collection.findOneAndUpdate(
        { _id: collectionId, userId: (session.user as any).id },
        { $push: { requests: request } },
        { new: true }
      );
    }

    if (!updatedCollection) {
      return NextResponse.json({ error: "Collection or Request not found" }, { status: 404 });
    }

    // Return the saved request object (newly created has _id)
    const savedRequest = requestId 
      ? updatedCollection.requests.find((r: any) => r._id.toString() === requestId)
      : updatedCollection.requests[updatedCollection.requests.length - 1];

    return NextResponse.json(savedRequest);
  } catch (error: any) {
    console.error("Save Request Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}