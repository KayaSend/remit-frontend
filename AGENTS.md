# Agent Guidelines for Kindred Flow

This document provides guidelines for agentic coding agents operating in this repository.

## Build, Lint & Test Commands

### Development
```bash
npm run dev
# Starts Vite dev server on http://localhost:8080 with hot reload
```

### Production Build
```bash
npm run build
# Creates optimized production build in dist/
```

### Development Build
```bash
npm run build:dev
# Creates development build (without optimizations)
```

### Linting
```bash
npm run lint
# Runs ESLint on all TypeScript/JavaScript files
# ESLint config: eslint.config.js
```

### Testing
Currently, no testing framework is configured. Tests should be implemented using Jest or Vitest.

## Code Style Guidelines

### Imports
- Use path aliases: Import from `@/` instead of relative paths
  - ✅ `import { Button } from "@/components/ui/button"`
  - ❌ `import { Button } from "../../../components/ui/button"`
- Group imports logically: external dependencies first, then local modules
- React/UI imports at the top, then pages/components/utils
- Import types explicitly: `import type { ComponentProps }`

### Formatting
- **Line length**: No strict limit but prefer < 100 characters
- **Indentation**: 2 spaces (configured in ESLint)
- **Semicolons**: Required
- **Trailing commas**: Include in multi-line arrays/objects
- Files formatted via ESLint (runs on lint)

### TypeScript & Types
- Use TypeScript for all .tsx and .ts files
- Type props for React components explicitly: `interface Props { ... }`
- Strict mode is OFF (`"strict": false` in tsconfig.app.json)
  - `noImplicitAny`, `noUnusedLocals`, `noUnusedParameters` are disabled
  - Still use explicit types for component props and public functions
- Use JSX="react-jsx" (no React import required for JSX)

### Naming Conventions
- **Components**: PascalCase (e.g., `SenderDashboard`, `BalanceCard`)
- **Files**: Match component names or use kebab-case for utilities
  - Components: `SenderDashboard.tsx`
  - Utilities: `card-utils.ts`, `format-date.ts`
- **Variables/Functions**: camelCase (e.g., `queryClient`, `handleSubmit`)
- **Constants**: UPPER_SNAKE_CASE or camelCase if in module scope
- **Pages**: Located in `src/pages/`, organized by role (sender, recipient)

### Project Structure
```
src/
├── components/       # Reusable UI components (shadcn-ui, custom)
├── pages/           # Page components (organized by role: sender/, recipient/)
├── hooks/           # Custom React hooks
├── lib/             # Utilities (cn(), formatters, helpers)
├── types/           # TypeScript type definitions
├── integrations/    # External service integrations (Supabase, APIs)
├── App.tsx          # Route configuration
├── main.tsx         # Entry point
└── index.css        # Global styles
```

### React & Hooks
- Use functional components (no class components)
- ESLint enforces react-hooks rules (useCallback, useDependencies, etc.)
  - Read ESLint warning messages carefully
- Use React Router v6 for routing (`react-router-dom@^6.30.1`)
- React Query (@tanstack/react-query) for server state management
- shadcn-ui components for UI (all available in `src/components/ui/`)

### Error Handling
- Return user-friendly error messages via toast notifications
  - Use `sonner` or `@radix-ui/react-toast` toaster
  - Example: `toast.error("Failed to create remittance")`
- Log errors to console in development
- Never expose sensitive errors to users (sanitize messages)
- Handle async operations with try-catch or .catch()
- Validate user input before server calls

### Utilities
- Use `cn()` utility from `@/lib/utils.ts` for conditional Tailwind classes
  - Example: `cn("p-4", condition && "bg-red-500")`
- Date formatting: Use `date-fns` library
- Form handling: Use `react-hook-form` with `zod` for validation
- SVG icons: Use `lucide-react` library

### Tailwind CSS & Styling
- Tailwind classes only (no custom CSS unless necessary)
- Use Tailwind utilities for spacing, colors, shadows
- Custom components in `src/components/ui/` (shadcn-ui)
- Theme configuration in `tailwind.config.ts`
- CSS animations via `tailwindcss-animate` plugin

### Comments
- Write comments sparingly; prefer self-documenting code
- For complex business logic, add JSDoc comments
- TODO comments should reference issues or PRs

### ESLint Rules
- ✅ React Hooks rules enforced (dependencies, exhaustive-deps)
- ✅ React Refresh warning for non-component exports
- ❌ Unused variables are NOT flagged (disabled rule)
- ❌ Unused parameters are NOT flagged (disabled rule)
- Recommended plugins: react-hooks, react-refresh, typescript-eslint

## Architecture Notes

- **Routing**: BrowserRouter with React Router v6 (no nested routes currently, flat structure)
- **UI Library**: shadcn-ui built on Radix UI primitives + Tailwind CSS
- **State Management**: React Query for server state, React hooks for local state
- **Database**: Supabase integration available in `src/integrations/`
- **Build Tool**: Vite with React SWC plugin for fast builds

## Development Workflow

1. Make changes in `src/`
2. Run `npm run lint` to catch issues
3. Run `npm run build` before committing
4. Verify dev server (`npm run dev`) works without errors
5. Test all affected pages/components manually

