import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { messages, users, workspaces, workspaceMembers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { content } = body;

    // Get or create user in database
    let [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, user.id))
      .limit(1);

    if (!dbUser) {
      const [newUser] = await db.insert(users).values({
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || undefined,
        avatarUrl: user.imageUrl,
      }).returning();
      dbUser = newUser;
    }

    // Get user's workspace
    const userWorkspace = await db
      .select()
      .from(workspaceMembers)
      .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
      .where(eq(workspaceMembers.userId, dbUser.id))
      .limit(1);

    if (userWorkspace.length === 0) {
      return NextResponse.json(
        { error: "No workspace found" },
        { status: 404 }
      );
    }

    const workspaceId = userWorkspace[0].workspaces.id;

    // Create message
    const [newMessage] = await db
      .insert(messages)
      .values({
        workspaceId,
        userId: dbUser.id,
        content,
      })
      .returning();

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

