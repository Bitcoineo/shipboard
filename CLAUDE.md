# ShipBoard — Team Task & Project Management

## Overview
A Trello/Linear-style project board where users create workspaces, invite team members with role-based permissions, and manage tasks on kanban boards with drag-and-drop.

## Tech Stack
Next.js 14 (App Router), TypeScript strict, Drizzle ORM + Turso, Auth.js v5 (Google OAuth + credentials), Tailwind CSS, @dnd-kit (drag-and-drop), Resend (email), pnpm

## Database Schema
Auth tables: user, account, session, verificationToken (standard Auth.js)

Extended user fields:
- avatarColor (text, nullable — for default avatar)

App tables:

workspace:
- id (nanoid), name, slug (unique, URL-friendly), ownerId (FK user), createdAt, updatedAt

workspace_member:
- id (nanoid), workspaceId (FK), userId (FK), role (text: owner/admin/member), joinedAt
- Unique constraint on (workspaceId, userId)

workspace_invite:
- id (nanoid), workspaceId (FK), email, role (text: admin/member), token (unique), invitedById (FK user), status (pending/accepted/declined/expired), expiresAt, createdAt

board:
- id (nanoid), workspaceId (FK), name, description, createdAt, updatedAt

column:
- id (nanoid), boardId (FK), name, position (integer), createdAt

task:
- id (nanoid), columnId (FK), boardId (FK), title, description (nullable), assigneeId (FK user, nullable), priority (text: none/low/medium/high/urgent), dueDate (text, nullable), position (integer), createdAt, updatedAt

label:
- id (nanoid), workspaceId (FK), name, color (text)

task_label:
- taskId (FK), labelId (FK)
- Primary key on (taskId, labelId)

## Roles & Permissions
Owner: everything + delete workspace + transfer ownership
Admin: manage members + manage boards + manage tasks + invite users
Member: manage tasks + view boards (cannot invite or manage members)

## API Routes
Workspace: CRUD + member management
Board: CRUD within workspace
Column: CRUD + reorder within board
Task: CRUD + move between columns + reorder
Invite: create + accept + decline
Labels: CRUD within workspace

## Architecture
```
src/db/       → schema.ts, index.ts, migrate.ts
src/lib/      → workspaces.ts, boards.ts, columns.ts, tasks.ts, invites.ts, labels.ts, permissions.ts
src/app/api/  → REST endpoints
src/app/[workspaceSlug]/ → workspace pages
src/components/ → shared UI components
```

## Coding Standards
- Lib layer for all data access — no raw queries in routes/components
- All functions return `{ data, error }` pattern — never throw for business logic
- ALL queries scoped to workspace — never leak data across workspaces
- Permission checks on every mutation via `permissions.ts` helper
- Optimistic updates for drag-and-drop
- Position field uses integers with gaps (1000, 2000, 3000) for easy reordering
- Use nanoid for all IDs
- TypeScript strict mode — no `any` types

## Workflow
- Complete and verify each feature before moving to the next
- Do not skip testing between features
- Run `pnpm build` to verify no type errors before marking tasks complete
