import { pgTable, text, timestamp, uuid, integer, jsonb } from "drizzle-orm/pg-core";

// Users table (synced with Clerk)
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull(),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Workspaces/Teams
export const workspaces = pgTable("workspaces", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  ownerId: uuid("owner_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Workspace members
export const workspaceMembers = pgTable("workspace_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  role: text("role").notNull().default("member"), // owner, admin, member
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

// Tasks
export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("todo"), // todo, in_progress, done
  priority: text("priority").default("medium"), // low, medium, high
  assigneeId: uuid("assignee_id").references(() => users.id),
  createdById: uuid("created_by_id").references(() => users.id).notNull(),
  dueDate: timestamp("due_date"),
  position: integer("position").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Chat messages
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Documents
export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id).notNull(),
  title: text("title").notNull(),
  content: jsonb("content"), // Rich text content
  createdById: uuid("created_by_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Document collaborators (who has access)
export const documentCollaborators = pgTable("document_collaborators", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentId: uuid("document_id").references(() => documents.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  role: text("role").notNull().default("viewer"), // owner, editor, viewer
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

