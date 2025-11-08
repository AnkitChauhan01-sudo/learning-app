import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { documents, users, workspaces, workspaceMembers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's workspace
    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, user.id))
      .limit(1);

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userWorkspace = await db
      .select()
      .from(workspaceMembers)
      .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
      .where(eq(workspaceMembers.userId, dbUser.id))
      .limit(1);

    if (userWorkspace.length === 0) {
      return NextResponse.json([]);
    }

    const workspaceId = userWorkspace[0].workspaces.id;

    // Get documents
    const allDocuments = await db
      .select()
      .from(documents)
      .where(eq(documents.workspaceId, workspaceId))
      .orderBy(documents.updatedAt);

    return NextResponse.json(
      allDocuments.map((doc) => ({
        id: doc.id,
        title: doc.title,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        createdById: doc.createdById,
        content: doc.content,
      }))
    );
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

