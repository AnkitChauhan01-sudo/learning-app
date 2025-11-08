import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id))
      .limit(1);

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Parse JSONB content
    let content = "";
    if (document.content) {
      try {
        const parsed = typeof document.content === "string" 
          ? JSON.parse(document.content) 
          : document.content;
        content = parsed.content || "";
      } catch {
        content = "";
      }
    }

    return NextResponse.json({
      id: document.id,
      title: document.title,
      content,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      createdById: document.createdById,
    });
  } catch (error) {
    console.error("Error fetching document:", error);
    return NextResponse.json(
      { error: "Failed to fetch document" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, content } = body;

    const [updatedDocument] = await db
      .update(documents)
      .set({
        title,
        content: content ? { content } : null,
        updatedAt: new Date(),
      })
      .where(eq(documents.id, id))
      .returning();

    return NextResponse.json({
      id: updatedDocument.id,
      title: updatedDocument.title,
      content: updatedDocument.content,
      updatedAt: updatedDocument.updatedAt,
    });
  } catch (error) {
    console.error("Error updating document:", error);
    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await db.delete(documents).where(eq(documents.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}

