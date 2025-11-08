import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { taskId, status, title, description, priority, assigneeId, dueDate } = body;

    const updateData: {
      status?: string;
      title?: string;
      description?: string | null;
      priority?: string | null;
      assigneeId?: string | null;
      dueDate?: Date | null;
      updatedAt: Date;
    } = {
      updatedAt: new Date(),
    };
    if (status !== undefined) updateData.status = status;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (priority !== undefined) updateData.priority = priority;
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId;
    if (dueDate !== undefined) updateData.dueDate = dueDate;

    const [updatedTask] = await db
      .update(tasks)
      .set(updateData)
      .where(eq(tasks.id, taskId))
      .returning();

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

