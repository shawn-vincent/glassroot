# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

Glassroot is a document management and semantic search application with an LLM chat interface, built as a monorepo with two workspaces:

- **API** (`api/`): Cloudflare Workers backend providing document storage and semantic search via Cloudflare D1, Vectorize, and AI embeddings
- **Client** (`client/`): React SPA frontend with LLM chat (OpenRouter integration), document CRUD, and semantic search. Also a Capacitor mobile app for iOS/Android.

### Technology Stack

**API:**
- Cloudflare Workers (TypeScript)
- Cloudflare D1 (SQLite database)
- Cloudflare Vectorize (vector search)
- Cloudflare AI (embeddings via `@cf/baai/bge-base-en-v1.5`)
- Zod for validation

**Client:**
- React 18 + Vite + TypeScript
- React Router for navigation
- TanStack Query for data fetching and caching
- CodeMirror 6 for markdown editing with syntax highlighting
- @llamaindex/chat-ui for chat interface
- Capacitor for iOS/Android mobile apps
- Tailwind CSS v4 for styling
- Zod for client-side validation
- Local storage for configuration persistence

## Development Commands

### Root workspace commands:
```bash
npm run dev           # Start both API and client in parallel
npm run dev:api       # Start API only (wrangler dev)
npm run dev:client    # Start client only (vite dev server)
npm run dev:ios       # Run iOS app in simulator
npm run dev:android   # Run Android app in emulator
npm run build         # Build both workspaces
npm run typecheck     # Type check both workspaces
npm run lint          # Lint all files with Biome
npm run format        # Format all files with Biome
npm run check         # Run both typecheck and lint
```

### Mobile-specific commands:
```bash
npm run build:ios      # Build and sync iOS app
npm run build:android  # Build and sync Android app
npm run open:ios       # Open Xcode
npm run open:android   # Open Android Studio
npm run sync           # Sync web assets to native projects
npm run dev:shawniphone # Deploy to physical iPhone (custom script)
```

## Key Architecture Patterns

### API Design
- RESTful endpoints under `/api` prefix
- Standardized error responses with correlation IDs
- CORS handling with environment-specific origins
- Zod schemas for request validation
- Single-file worker structure in `api/src/index.ts`

### Client Architecture
- Component-based React structure with pages and reusable components
- Custom chat UI built on @llamaindex/chat-ui with MarkdownEditor for compose input
- Mobile viewport handling with Capacitor Keyboard plugin
- Dynamic CSS variables for responsive layouts (`--viewport-height`, `--bottom-safe-area`)
- Configuration panel overlay pattern using Sheet components
- Theme persistence via CSS variables and localStorage
- Offline state detection and handling

### Chat Integration
- Custom `useOpenRouterChat` hook handles LLM interactions
- Direct client → OpenRouter API calls (no backend proxy)
- Streaming SSE responses for real-time chat
- System prompts stored in localStorage
- Message formatting with double newlines for paragraphs

### Mobile Considerations
- Capacitor integration for native iOS/Android apps
- Dynamic viewport resizing when keyboard appears
- Safe area handling for iOS devices
- Scroll-into-view behavior for focused inputs
- Smooth transitions using CSS cubic-bezier easing

### Data Flow
- Client → API for document operations (CRUD, search)
- Client → OpenRouter directly for LLM interactions
- Client caches API responses via TanStack Query
- Local storage for user settings and draft preservation

### Error Handling Philosophy
- Always surface original error messages (with secrets redacted)
- Include correlation IDs for traceability
- Preserve user input on failures
- Provide clear next steps for resolution

## Database Schema

D1 table `documents`:
- `id TEXT PRIMARY KEY` (UUID)
- `title TEXT NOT NULL`
- `content TEXT NOT NULL` 
- `vector_id TEXT` (matches Vectorize document ID)
- `created INTEGER DEFAULT unixepoch()`

## Configuration

### API Environment Variables
- `CORS_ORIGIN`: Set per environment (dev: "*", staging/prod: specific domains)
- Cloudflare bindings: `DB`, `VECTORS`, `AI`

### Client Settings (localStorage)
- `theme`: "light" | "dark"
- `openrouter_api_key`: OpenRouter API key
- `openrouter_model`: Model identifier from OpenRouter
- `llm_prompt`: Markdown system prompt for LLM

## Limits and Constraints

- Document title: ≤ 256 characters
- Document content: soft limit 32k characters
- List documents: max 50 results
- Search results: default 10, max 20
- Embedding model: `@cf/baai/bge-base-en-v1.5`
- Markdown editor: grows from 1 to max 10-24 lines dynamically

## Testing Strategy

No automated test framework is currently configured. Manual testing covers:
- API endpoints via health check and CRUD operations
- Client functionality across all major workflows
- Mobile app testing on iOS simulator and physical devices
- Error handling and offline scenarios
- Theme switching and configuration persistence
- Keyboard handling and viewport adjustments on mobile