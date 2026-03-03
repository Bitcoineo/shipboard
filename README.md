# ShipBoard

A Trello/Linear-style project board for teams. Create workspaces, invite team members with role-based permissions, and manage tasks on kanban boards with drag-and-drop.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Database:** Drizzle ORM + Turso (SQLite)
- **Auth:** Auth.js v5 (Google OAuth + credentials)
- **Styling:** Tailwind CSS
- **Drag-and-Drop:** @dnd-kit

## Features

- **Workspaces** — Create and manage isolated team workspaces
- **Kanban Boards** — Columns, tasks, and drag-and-drop reordering
- **Team Management** — Invite members via link, assign roles (owner/admin/member)
- **Labels** — Color-coded labels for task categorization
- **Task Details** — Priority, due dates, assignees, descriptions
- **Role-Based Permissions** — Owners, admins, and members with scoped access

## Setup

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Fill in your .env values:
# - TURSO_DATABASE_URL
# - TURSO_AUTH_TOKEN
# - AUTH_SECRET
# - GOOGLE_CLIENT_ID (optional, for Google OAuth)
# - GOOGLE_CLIENT_SECRET (optional, for Google OAuth)

# Push database schema
pnpm db:push

# Start development server
pnpm dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `TURSO_DATABASE_URL` | Turso database URL |
| `TURSO_AUTH_TOKEN` | Turso auth token |
| `AUTH_SECRET` | Auth.js secret (generate with `openssl rand -base64 32`) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (optional) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret (optional) |
