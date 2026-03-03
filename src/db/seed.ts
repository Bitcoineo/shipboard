import { config } from "dotenv";
config({ path: ".env.local" });
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import * as schema from "./schema";

async function seed() {
  const client = createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  const db = drizzle(client, { schema });

  console.log("Seeding database...");

  // Create test user
  const hashedPassword = await bcrypt.hash("password123", 10);
  const userId = nanoid();

  await db.insert(schema.users).values({
    id: userId,
    name: "Test User",
    email: "test@example.com",
    password: hashedPassword,
    avatarColor: "#6366f1",
  });

  console.log("Created test user: test@example.com / password123");

  // Create a sample workspace
  const workspaceId = nanoid();
  await db.insert(schema.workspaces).values({
    id: workspaceId,
    name: "My Workspace",
    slug: "my-workspace",
    ownerId: userId,
  });

  // Add user as owner of workspace
  await db.insert(schema.workspaceMembers).values({
    workspaceId,
    userId,
    role: "owner",
  });

  // Create a sample board
  const boardId = nanoid();
  await db.insert(schema.boards).values({
    id: boardId,
    workspaceId,
    name: "Project Board",
    description: "Default project board",
  });

  // Create default columns
  const columnNames = ["Backlog", "To Do", "In Progress", "Done"];
  const columnIds: string[] = [];

  for (let i = 0; i < columnNames.length; i++) {
    const colId = nanoid();
    columnIds.push(colId);
    await db.insert(schema.columns).values({
      id: colId,
      boardId,
      name: columnNames[i],
      position: (i + 1) * 1000,
    });
  }

  // Create sample tasks
  const sampleTasks = [
    { title: "Set up project structure", columnIdx: 3, priority: "high" as const },
    { title: "Design database schema", columnIdx: 3, priority: "high" as const },
    { title: "Implement authentication", columnIdx: 2, priority: "urgent" as const },
    { title: "Build kanban board UI", columnIdx: 1, priority: "medium" as const },
    { title: "Add drag-and-drop", columnIdx: 0, priority: "low" as const },
  ];

  for (let i = 0; i < sampleTasks.length; i++) {
    const t = sampleTasks[i];
    await db.insert(schema.tasks).values({
      columnId: columnIds[t.columnIdx],
      boardId,
      title: t.title,
      priority: t.priority,
      assigneeId: userId,
      position: (i + 1) * 1000,
    });
  }

  // Create sample labels
  const labelData = [
    { name: "Bug", color: "#ef4444" },
    { name: "Feature", color: "#3b82f6" },
    { name: "Enhancement", color: "#8b5cf6" },
    { name: "Documentation", color: "#10b981" },
  ];

  for (const l of labelData) {
    await db.insert(schema.labels).values({
      workspaceId,
      name: l.name,
      color: l.color,
    });
  }

  console.log("Seeding complete.");
  client.close();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
