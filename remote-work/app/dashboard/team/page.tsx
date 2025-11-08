import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { workspaces, workspaceMembers, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Users as UsersIcon, Mail } from "lucide-react";
import Image from "next/image";

export default async function TeamPage() {
  const user = await currentUser();
  
  if (!user) {
    return null;
  }

  // Get user in database
  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, user.id))
    .limit(1);

  if (!dbUser) {
    return <div>User not found</div>;
  }

  // Get user's workspace
  const userWorkspace = await db
    .select()
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
    .where(eq(workspaceMembers.userId, dbUser.id))
    .limit(1);

  if (userWorkspace.length === 0) {
    return <div>No workspace found</div>;
  }

  const workspace = userWorkspace[0].workspaces;

  // Get all workspace members
  const members = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      avatarUrl: users.avatarUrl,
      role: workspaceMembers.role,
      joinedAt: workspaceMembers.joinedAt,
    })
    .from(workspaceMembers)
    .innerJoin(users, eq(workspaceMembers.userId, users.id))
    .where(eq(workspaceMembers.workspaceId, workspace.id));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Team
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your workspace members
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-6">
          <UsersIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {workspace.name}
          </h2>
        </div>

        <div className="space-y-4">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex items-center gap-4">
                {member.avatarUrl ? (
                  <Image
                    src={member.avatarUrl}
                    alt={member.name || "User"}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                    {(member.name || member.email || "U")[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {member.name || "Unknown User"}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {member.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    member.role === "owner"
                      ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                      : member.role === "admin"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                  }`}
                >
                  {member.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

