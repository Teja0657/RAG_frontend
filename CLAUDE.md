# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```
npm install
npm run dev       # Vite dev server, default http://localhost:5173
npm run build     # production build to dist/
npm run preview   # serve the production build locally
npm run lint       # eslint .
```

There is no test suite configured. This app has a hard runtime dependency on the backend (`RAG_Backend_MS`) being up — specifically `api_gateway` on port 8000 — for anything beyond static pages to work.

## Architecture

Plain JS React 19 + Vite app (no TypeScript, no UI library — CSS Modules per component/page). Auth is via Auth0; role-based routing gates two app areas.

- **`main.jsx` → `App.jsx`**: route table. Public: `/login`, `/forgot-password`, `/about`, `/contact`. Gated by `ProtectedRoute` + role: `/chat` requires role `user`, `/admin` requires role `admin`.
- **`auth/Auth0ProviderWithHistory.jsx`**: wraps the app in Auth0's `Auth0Provider`, configured from `VITE_AUTH0_DOMAIN`/`VITE_AUTH0_CLIENT_ID`/`VITE_AUTH0_AUDIENCE`, using refresh tokens cached in localStorage.
- **`context/AuthContext.jsx`**: after Auth0 login, calls `GET /api/me` on the backend to resolve the user's role from a custom Auth0 claim (`https://myapp.example.com/roles`) mirrored server-side; exposes `currentUser`, `isAdmin`, `logout`, `getAccessTokenSilently`. This is the single source of truth for role-gating in `ProtectedRoute`.
- **`pages/Chat/ChatPage.jsx`**: end-user chat UI. Loads conversation list from `/api/chats`, sends messages by manually parsing an SSE stream from `POST /api/chat/stream` (reads the raw response body and splits `event:`/`data:` frames itself — not using `EventSource`). Supports rename/pin (max 3 pins, enforced server-side)/delete of conversations.
- **`pages/Admin/AdminDashboard.jsx`**: admin console with tabs — Overview, Documents (drag-drop PDF upload/update/delete), Users, Statistics (triggers the backend LangSmith evaluation run and renders per-metric scores + trace links), Chatbot Test (ad-hoc query against the RAG pipeline with retrieval/rerank/generation timing breakdown). All calls go through `/api/admin/*`.
- **`components/Header.jsx`**: contains profile dropdown UI for edit-profile/reset-password that is **not wired to the backend yet** — treat as UI-only stub, not a bug, if asked to touch it.

### Backend integration caveat

The backend base URL is inconsistent across the codebase: `AdminDashboard.jsx` reads `import.meta.env.VITE_API_URL` (falls back to `http://localhost:8000`), but `ChatPage.jsx` hardcodes `http://localhost:8000` directly instead of using the env var. If changing the API base URL, both spots need updating.

All backend calls are proxied through `api_gateway` (port 8000) only — the frontend never talks to `rag_service`/`document_service`/`admin_service` directly, and every request other than login must carry the Auth0 access token as a Bearer header.
