import { sqliteTable, text, integer, primaryKey, uniqueIndex } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";

// ─── Auth Tables (Auth.js compatible) ────────────────────────────────

export const users = sqliteTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
  image: text("image"),
  password: text("password"),
  avatarColor: text("avatarColor"),
});

export const accounts = sqliteTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = sqliteTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

export const verificationTokens = sqliteTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

// ─── App Tables ──────────────────────────────────────────────────────

export const workspaces = sqliteTable("workspace", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  ownerId: text("ownerId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: text("createdAt")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updatedAt")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const workspaceMembers = sqliteTable(
  "workspace_member",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    workspaceId: text("workspaceId")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["owner", "admin", "member"] }).notNull(),
    joinedAt: text("joinedAt")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (wm) => ({
    uniqueMember: uniqueIndex("workspace_member_unique").on(
      wm.workspaceId,
      wm.userId
    ),
  })
);

export const workspaceInvites = sqliteTable("workspace_invite", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  workspaceId: text("workspaceId")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role", { enum: ["admin", "member"] }).notNull(),
  token: text("token")
    .notNull()
    .unique()
    .$defaultFn(() => nanoid(32)),
  invitedById: text("invitedById")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: text("status", {
    enum: ["pending", "accepted", "declined", "expired"],
  })
    .notNull()
    .default("pending"),
  expiresAt: text("expiresAt").notNull(),
  createdAt: text("createdAt")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const boards = sqliteTable("board", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  workspaceId: text("workspaceId")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: text("createdAt")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updatedAt")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const columns = sqliteTable("column", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  boardId: text("boardId")
    .notNull()
    .references(() => boards.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  position: integer("position").notNull(),
  createdAt: text("createdAt")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const tasks = sqliteTable("task", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  columnId: text("columnId")
    .notNull()
    .references(() => columns.id, { onDelete: "cascade" }),
  boardId: text("boardId")
    .notNull()
    .references(() => boards.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  assigneeId: text("assigneeId").references(() => users.id, {
    onDelete: "set null",
  }),
  priority: text("priority", {
    enum: ["none", "low", "medium", "high", "urgent"],
  })
    .notNull()
    .default("none"),
  dueDate: text("dueDate"),
  position: integer("position").notNull(),
  createdAt: text("createdAt")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updatedAt")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const labels = sqliteTable("label", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  workspaceId: text("workspaceId")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  color: text("color").notNull(),
});

export const taskLabels = sqliteTable(
  "task_label",
  {
    taskId: text("taskId")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    labelId: text("labelId")
      .notNull()
      .references(() => labels.id, { onDelete: "cascade" }),
  },
  (tl) => ({
    pk: primaryKey({ columns: [tl.taskId, tl.labelId] }),
  })
);

// ─── Relations ───────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  ownedWorkspaces: many(workspaces),
  memberships: many(workspaceMembers),
  assignedTasks: many(tasks),
}));

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  owner: one(users, {
    fields: [workspaces.ownerId],
    references: [users.id],
  }),
  members: many(workspaceMembers),
  invites: many(workspaceInvites),
  boards: many(boards),
  labels: many(labels),
}));

export const workspaceMembersRelations = relations(
  workspaceMembers,
  ({ one }) => ({
    workspace: one(workspaces, {
      fields: [workspaceMembers.workspaceId],
      references: [workspaces.id],
    }),
    user: one(users, {
      fields: [workspaceMembers.userId],
      references: [users.id],
    }),
  })
);

export const workspaceInvitesRelations = relations(
  workspaceInvites,
  ({ one }) => ({
    workspace: one(workspaces, {
      fields: [workspaceInvites.workspaceId],
      references: [workspaces.id],
    }),
    invitedBy: one(users, {
      fields: [workspaceInvites.invitedById],
      references: [users.id],
    }),
  })
);

export const boardsRelations = relations(boards, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [boards.workspaceId],
    references: [workspaces.id],
  }),
  columns: many(columns),
  tasks: many(tasks),
}));

export const columnsRelations = relations(columns, ({ one, many }) => ({
  board: one(boards, {
    fields: [columns.boardId],
    references: [boards.id],
  }),
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  column: one(columns, {
    fields: [tasks.columnId],
    references: [columns.id],
  }),
  board: one(boards, {
    fields: [tasks.boardId],
    references: [boards.id],
  }),
  assignee: one(users, {
    fields: [tasks.assigneeId],
    references: [users.id],
  }),
  labels: many(taskLabels),
}));

export const labelsRelations = relations(labels, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [labels.workspaceId],
    references: [workspaces.id],
  }),
  tasks: many(taskLabels),
}));

export const taskLabelsRelations = relations(taskLabels, ({ one }) => ({
  task: one(tasks, {
    fields: [taskLabels.taskId],
    references: [tasks.id],
  }),
  label: one(labels, {
    fields: [taskLabels.labelId],
    references: [labels.id],
  }),
}));
