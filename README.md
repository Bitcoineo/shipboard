# ShipBoard

Multi-tenant kanban board for teams. Create workspaces, invite members with role-based permissions, and manage tasks across boards with drag-and-drop.

**Stack:** `Next.js 14 · TypeScript · Auth.js v5 · Drizzle ORM · Turso (SQLite) · dnd-kit · Tailwind CSS`

**Live:** https://shipboard-bitcoineo.vercel.app

---

## Why I built this

I wanted to build something with genuine multi-tenancy: isolated workspaces, a role hierarchy enforced server-side on every API route, and an invite system with token-based link sharing. ShipBoard is the result. Every action checks hasPermission() against a three-tier role hierarchy (owner, admin, member) before touching the database.

## Features

- **Workspaces** Isolated team environments with slug-based routing
- **Kanban boards** Columns and tasks with drag-and-drop reordering via dnd-kit
- **Role-based permissions** Owner, admin, and member roles with a server-side hierarchy check on every
- **Invite system** Token-based invite links, accept or decline flow
- **Labels** Color-coded labels per workspace for task categorization
- **Task details** Priority, due dates, assignees, and descriptions
- **Authentication** Google OAuth and email/password via Auth.js v5
- **Command palette** Keyboard-driven navigation across workspaces and boards

## Setup

    pnpm install
    cp .env.example .env

Fill in your .env:

    TURSO_DATABASE_URL=     # Turso database URL
    TURSO_AUTH_TOKEN=       # Turso auth token
    AUTH_SECRET=            # openssl rand -base64 32
    GOOGLE_CLIENT_ID=       # Optional, for Google OAuth
    GOOGLE_CLIENT_SECRET=   # Optional, for Google OAuth

Push the schema and start:

    pnpm db:push
    pnpm dev

Open http://localhost:3000

## Permission Model

Every API route checks the caller's role before executing. Three tiers:

    owner  →  full control, can delete workspace, manage all members
    admin  →  can manage boards, columns, tasks, and members
    member →view and interact with boards and tasks

Enforced via requirePermission(userId, workspaceId, requiredRole) in src/lib/permissions.ts.

## GitHub Topics

`nextjs` `typescript` `kanban` `trello` `drizzle-orm` `turso` `sqlite` `authjs` `dnd-kit` `tailwind` `multi-tenant` `rbac`
