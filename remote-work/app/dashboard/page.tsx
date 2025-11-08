import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { workspaces, workspaceMembers, tasks, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import TaskBoard from "@/components/TaskBoard";

export default async function DashboardPage() {
  const user = await currentUser();
  
  if (!user) {
    return null;
  }

  // Get or create user in database
  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, user.id))
    .limit(1);

  let finalDbUser = dbUser;
  if (!finalDbUser) {
    // Create user in database
    const [newUser] = await db.insert(users).values({
      clerkId: user.id,
      email: user.emailAddresses[0]?.emailAddress || "",
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || undefined,
      avatarUrl: user.imageUrl,
    }).returning();
    finalDbUser = newUser;
  }

  // Get user's workspaces
  const userWorkspaces = await db
    .select()
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
    .where(eq(workspaceMembers.userId, finalDbUser.id));

  let workspace = userWorkspaces[0]?.workspaces;

  // Create default workspace if none exists
  if (!workspace) {
    const [newWorkspace] = await db.insert(workspaces).values({
      name: `${user.firstName || "My"}'s Workspace`,
      ownerId: finalDbUser.id,
    }).returning();

    await db.insert(workspaceMembers).values({
      workspaceId: newWorkspace.id,
      userId: finalDbUser.id,
      role: "owner",
    });

    workspace = newWorkspace;
  }

  // Get tasks for the workspace
  const workspaceTasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.workspaceId, workspace.id))
    .orderBy(tasks.position);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Task Board
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your tasks and track progress
        </p>
      </div>

      <TaskBoard 
        initialTasks={workspaceTasks} 
        workspaceId={workspace.id}
        userId={finalDbUser.id}
      />
    </div>
  );
}

