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
    const { taskIds } = body;

    // Update positions for all tasks
    await Promise.all(
      taskIds.map((taskId: string, index: number) =>
        db
          .update(tasks)
          .set({ position: index, updatedAt: new Date() })
          .where(eq(tasks.id, taskId))
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering tasks:", error);
    return NextResponse.json(
      { error: "Failed to reorder tasks" },
      { status: 500 }
    );
  }
}

