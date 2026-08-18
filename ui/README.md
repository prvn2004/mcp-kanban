# Ticket Manager UI (React + Vite + TailwindCSS)

A responsive, local-first web interface for the Ticket Manager MCP system. Provides a visual Kanban board, project documentation editor, and hierarchical navigation across projects, features, and subfeatures.

## Features

- **Projects Dashboard (`/` / `/projects`)**: Overview of all active projects with metadata, status badges, and project creation modal.
- **Project View (`/projects/:projectId`)**: View project details, embedded Markdown documentation viewer/editor, and features breakdown.
- **Feature View (`/features/:featureId`)**: Manage feature epics, list child subfeatures, create subfeatures, and view unassigned tickets.
- **Subfeature Kanban Board (`/subfeatures/:subfeatureId`)**: Interactive Kanban board with columns (`BACKLOG`, `READY`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`), drag/click status progression, and role validation.
- **Ticket Modal**: Comprehensive ticket details with markdown context rendering, acceptance criteria, interactive task checklists, timestamped activity notes, and role-enforced status transitions.

## Commands

```bash
# Install dependencies
npm install

# Run Vite dev server with Hot Module Replacement (HMR)
npm run dev

# Run TypeScript check and production build
npm run build

# Run Oxlint linter
npm run lint

# Preview production build
npm run preview
```

## Architecture

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite 8 with `@vitejs/plugin-react`
- **Styling**: TailwindCSS 4 + Class Variance Authority (`cva`) + `clsx` + `tailwind-merge`
- **Components & Icons**: Radix UI Dialog / Dropdown Menu primitives + Lucide React icons
- **Animations**: Framer Motion
- **Routing**: React Router DOM 7
- **Markdown**: React Markdown
