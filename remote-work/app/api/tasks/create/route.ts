import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { workspaceId, title, description, status, createdById } = body;

    const [newTask] = await db
      .insert(tasks)
      .values({
        workspaceId,
        title,
        description,
        status: status || "todo",
        createdById,
        position: 0,
      })
      .returning();

    return NextResponse.json(newTask);
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

