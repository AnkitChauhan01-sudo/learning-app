import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { messages, users, workspaces, workspaceMembers } from "@/lib/db/schema";
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

    // Get messages with user info
    const allMessages = await db
      .select({
        id: messages.id,
        content: messages.content,
        userId: messages.userId,
        createdAt: messages.createdAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(messages)
      .innerJoin(users, eq(messages.userId, users.id))
      .where(eq(messages.workspaceId, workspaceId))
      .orderBy(messages.createdAt);

    return NextResponse.json(
      allMessages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        userId: msg.userId,
        userName: msg.userName || msg.userEmail,
        createdAt: msg.createdAt,
      }))
    );
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

