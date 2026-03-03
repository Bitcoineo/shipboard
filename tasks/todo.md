# ShipBoard — Project Setup

## Phase 1: Foundation (COMPLETE)
- [x] Create CLAUDE.md with full project spec
- [x] Init Next.js 14 (TypeScript strict, App Router, Tailwind, pnpm)
- [x] Install dependencies (drizzle-orm, @libsql/client, next-auth@beta, @auth/drizzle-adapter, bcryptjs, nanoid)
- [x] Create src/db/schema.ts — all 12 tables (user, account, session, verificationToken, workspace, workspace_member, workspace_invite, board, column, task, label, task_label) + relations
- [x] Create src/db/index.ts (Turso client)
- [x] Create src/db/migrate.ts
- [x] Create drizzle.config.ts
- [x] Set up auth.ts + auth.config.ts (Edge-compatible split, JWT strategy, credentials + Google OAuth)
- [x] Create middleware.ts (route protection)
- [x] Create API route handler for Auth.js
- [x] Create .env.example and .env.local template
- [x] Create src/db/seed.ts (test user + sample workspace/board/tasks/labels)
- [x] Create src/lib/permissions.ts (hasPermission, requirePermission, isMember)
- [x] Run drizzle-kit generate — 12 tables, all indexes/FKs verified
- [x] Verify pnpm build passes with zero errors

## Phase 2: Auth Pages + Workspace Creation (COMPLETE)
- [x] Create src/lib/workspaces.ts (createWorkspace, getUserWorkspaces, getWorkspaceBySlug)
- [x] Create POST /api/auth/signup (validate, hash password, insert user)
- [x] Create /login page (email/password + Google OAuth, centered card)
- [x] Create /register page (name/email/password + Google OAuth, auto-signin)
- [x] Update middleware redirect: auth pages → /workspaces (was /)
- [x] Create GET/POST /api/workspaces
- [x] Create /workspaces page (server component + client workspace-list)
- [x] Create /[workspaceSlug]/layout.tsx (nav + sidebar + membership check)
- [x] Create /[workspaceSlug]/page.tsx (workspace info + role + member count)
- [x] Update root layout metadata → ShipBoard
- [x] Fix globals.css font-family to use Geist variable
- [x] Replace default page.tsx with auth-aware redirect
- [x] Verify pnpm build passes with zero errors

## Phase 3: Boards & Columns (COMPLETE)
- [x] Create src/lib/boards.ts (createBoard with 3 default columns, getWorkspaceBoards, getBoardWithColumns, deleteBoard)
- [x] Create src/lib/columns.ts (createColumn, updateColumn, deleteColumn, reorderColumns)
- [x] Create POST/GET /api/workspaces/[slug]/boards (list + create boards)
- [x] Create GET/DELETE /api/workspaces/[slug]/boards/[boardId] (get + delete board)
- [x] Create POST /api/workspaces/[slug]/boards/[boardId]/columns (add column)
- [x] Create PATCH/DELETE /api/workspaces/[slug]/boards/[boardId]/columns/[columnId] (rename + delete column)
- [x] Rewrite /[workspaceSlug]/page.tsx with board list + create form
- [x] Create /[workspaceSlug]/boards/[boardId]/page.tsx with columns view
- [x] Create board-columns.tsx client component (horizontal columns, rename/delete dropdown, add column)
- [x] Update workspace layout with dynamic sidebar (boards list + active highlighting)
- [x] Create sidebar.tsx client component with usePathname for active state
- [x] Verify pnpm build passes with zero errors

## Phase 4: Tasks with Drag-and-Drop + Workspace Delete (COMPLETE)
- [x] Install @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities
- [x] Create src/lib/tasks.ts (createTask, updateTask, deleteTask, moveTask, getBoardTasks)
- [x] Add getBoardWithColumnsAndTasks to src/lib/boards.ts (returns full task + assignee per column)
- [x] Add deleteWorkspace to src/lib/workspaces.ts (owner-only, cascade delete)
- [x] Create POST /api/workspaces/[slug]/boards/[boardId]/tasks (create task)
- [x] Create PATCH/DELETE /api/workspaces/[slug]/boards/[boardId]/tasks/[taskId] (update + delete)
- [x] Create PATCH /api/workspaces/[slug]/boards/[boardId]/tasks/[taskId]/move (move between columns)
- [x] Create DELETE /api/workspaces/[slug] (workspace delete, owner-only)
- [x] Rewrite board detail page to use getBoardWithColumnsAndTasks
- [x] Rewrite board-columns.tsx with DndContext + SortableContext + droppable columns
- [x] Create task-card.tsx (priority dot, assignee avatar, due date, useSortable)
- [x] Create task-modal.tsx (edit title/description/priority/due date, delete with confirm)
- [x] Add inline "Add task" input at column bottom
- [x] Create delete-workspace.tsx (danger zone, type-name-to-confirm)
- [x] Update workspace page to show danger zone for owners
- [x] Verify pnpm build passes with zero errors

## Phase 5: Team Invitations & Member Management (COMPLETE)
- [x] Create src/lib/members.ts (getWorkspaceMembers, updateMemberRole, removeMember)
- [x] Create src/lib/invites.ts (createInvite, getWorkspaceInvites, acceptInvite, declineInvite, cancelInvite, getInviteByToken)
- [x] Create POST/GET /api/workspaces/[slug]/invites (create + list invites, admin+)
- [x] Create DELETE /api/workspaces/[slug]/invites/[inviteId] (cancel invite, admin+)
- [x] Create POST /api/invites/[token]/accept (accept invite, auth required)
- [x] Create POST /api/invites/[token]/decline (decline invite, auth required)
- [x] Create GET /api/workspaces/[slug]/members (list members, member+)
- [x] Create PATCH/DELETE /api/workspaces/[slug]/members/[memberId] (role change owner-only, remove admin+)
- [x] Update middleware to allow /invite/* for unauthenticated users with callbackUrl
- [x] Fix Google OAuth callbackUrl in login page (use dynamic value)
- [x] Create /[workspaceSlug]/members/page.tsx (server component)
- [x] Create /[workspaceSlug]/members/member-list.tsx (invite form, pending invites, member list with actions)
- [x] Create /invite/[token]/page.tsx (server component)
- [x] Create /invite/[token]/invite-action.tsx (accept/decline, auth-aware, email match check)
- [x] Update sidebar with "Members" link under Settings section
- [x] Verify pnpm build passes with zero errors

## Review
- Build: PASS — zero type errors, all 27 routes present
- Invite flow: create → copyable link → accept/decline with email validation
- Permission matrix: owner=all, admin=invite+remove members, member=view only
- Owner protection: cannot be removed or have role changed
- Invite guards: duplicate pending check, already-member check, expiry (7 days), email match
- Middleware: /invite/* accessible unauthenticated, callbackUrl preserved through login
- Members page: invite form (admin+), pending invites with cancel, member list with role dropdown (owner) and remove
- Invite page: centered card, 5 states (error, not logged in, email mismatch, valid, declined)
- No email sending yet — invite links shared manually via copy button
