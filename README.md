# TeamFlow

A real-time collaborative board application inspired by Trello and Notion — built end-to-end as a full-stack MERN project with a strong focus on clean domain rules, live synchronization, and data integrity.

Boards, lists, and tasks update instantly across every connected client. Members can be invited, approved, promoted, or removed with the whole team seeing changes the moment they happen. Tasks can be assigned to teammates, tracked personally across boards, and discussed in a live board chat — all wrapped in a consistent, professional design system.

---

## 🧠 Core Philosophy

- **REST APIs** = source of truth
- **Sockets** = real-time state synchronization
- **Emails** = async, non-blocking side-effects
- Clear domain rules, no overengineering
- Transaction-safe operations where correctness matters
- Built incrementally, with each feature backed by real debugging and iteration — not a scaffolded template

---

## 🛠 Tech Stack

**Backend**
- Node.js, Express
- MongoDB, Mongoose
- JWT-based authentication
- Socket.IO (real-time layer)
- Multer + Cloudinary (file uploads)
- Nodemailer (transactional email)
- BullMQ + Redis (async email queue, decoupled from the request/response cycle)
- MongoDB Sessions/Transactions (cascade deletes, admin transfer)

**Frontend**
- React (Vite)
- Zustand (state management)
- React Router
- Axios
- Socket.IO Client
- @dnd-kit (drag-and-drop for lists and tasks)
- Hand-built CSS design system (Plus Jakarta Sans + DM Sans, custom token-based palette — no UI framework)

---

## 🔐 Authentication & User Management

- Email/password signup and login
- Google OAuth signup and login
- JWT-based authentication with secure middleware
- Forgot password → email-based reset token (expiring, single-use)
- Password reset via secure token
- Editable user profile (name, username) with Cloudinary-hosted profile picture upload

---

## 🧩 Board System

**Board Rules (strictly enforced)**
- Each board has exactly one admin
- Admin cannot leave the board — must transfer admin or delete the board first
- Only the admin can: remove members, approve/reject join requests, promote a new admin, create/rename/delete lists

**Board Features**
- Create board
- Rename board (with live sync to every connected member)
- Delete board — admin-only, transaction-safe, full cascade delete (memberships, invites, lists, tasks, chat messages)
- Fetch all boards for the logged-in user, split into active and pending-approval sections
- Transfer admin (transaction-safe, atomic swap of the `isAdmin` flag and board leader reference)

---

## 👥 Board Memberships

- Membership is the single source of truth for who belongs to a board
- States: `PENDING`, `APPROVED`
- Unique constraint on `{ userId, boardId }`
- Join via invite link → creates a `PENDING` membership, notifies the board admin in real time
- Admin approve / reject requests
- Member removal (admin-only)
- Leave board (blocked for the current admin)
- Fetch approved members / fetch pending members
- All membership state changes (join, approve, reject, remove, leave, admin transfer) broadcast live over sockets to everyone viewing the board

---

## 📩 Invite System

- Secure, randomly generated invite tokens
- Token-based validation with expiry
- Joining via link creates a pending request rather than instant membership — admin approval required
- Intentionally HTTP-only (no sockets) — low-frequency, non-collaborative by nature

---

## 📚 Lists

- Create, rename, delete (admin-only)
- Manual position management with efficient `bulkWrite` reordering
- Drag-and-drop reordering (via @dnd-kit), fully synced live across all connected clients
- Server-side validation guards against corrupted or partial reorder payloads

---

## 🧩 Tasks

**Task Rules**
- Tasks are strictly list-bound
- ❌ Tasks cannot move across lists
- ✅ Only reordering within the same list is allowed

**Task Features**
- Create task (auto-incrementing position, optional description)
- Update task (title, description, status — `PENDING` / `IN_PROGRESS` / `COMPLETED`)
- Delete task
- Fetch all tasks for a board in a single API call
- Drag-and-drop reordering within a list
- **Task assignment** — admin-only, assignable only to approved board members; unassigned tasks are clearly labeled "Not yet assigned"
- **Automatic unassignment** — if an assigned member is removed or leaves the board, their tasks are automatically reset to unassigned (both individually and in bulk)
- Email notification to board members on task creation (async, non-blocking)
- Full real-time sync for every task event: created, updated, deleted, reordered, assigned

---

## 🙋 My Tasks (Personal Task View)

- A dedicated page aggregating every task assigned to the logged-in user, across **all** their boards
- Grouped first by board, then by status (In Progress / Pending)
- Only surfaces actionable tasks — completed tasks are excluded by design
- One click through to the relevant board from any task or board header

---

## 💬 Chat System (Real-Time)

- Live board group chat via Socket.IO
- Persistent message storage
- Own vs. others' message styling with avatar grouping and date dividers
- Typing indicators and read receipts (backend-supported)
- Chat sidebar toggles independently of the members sidebar, with layout that shifts the board canvas rather than overlapping it

---

## ⚡ Socket Architecture

**Rooms**
- `board_<boardId>` → board-wide events (lists, tasks, members, chat)
- `user_<userId>` → private events (join-request notifications to the board admin)

**Event coverage** (all of the following are fully wired client-to-server-to-client, not just emitted):
- `list:created` / `list:renamed` / `list:deleted` / `list:reordered`
- `task:created` / `task:updated` / `task:deleted` / `task:reordered` / `task:assigned` / `tasks:unassigned-bulk`
- `member:joined` / `member:rejected` / `member:removed` / `member:left` / `admin:changed` / `member:join-request`
- `board:renamed`
- Board and DM chat messaging, typing indicators, read receipts

Socket connection lifecycle is handled cleanly: a single persistent connection per session, board-room join/leave tied to page navigation, and full listener cleanup on unmount to prevent duplicate handlers or stale state.

---

## 📧 Email System

Emails are treated as **non-blocking side-effects**, queued via BullMQ and processed by a dedicated worker process — decoupled entirely from the request/response cycle.

**Used for:**
- Password reset links
- Task creation notifications to board members

**Rules:**
- Every email call is wrapped in try/catch
- Never blocks or delays the API response
- Failure to send never breaks the main request flow
- Runs as a separate Node process (`Workers/emailWorker.js`) consuming from Redis — must be running independently of the main server

---

## 🖼️ Media Uploads

- Image upload via Multer (in-memory buffer)
- Cloudinary integration for storage and delivery
- Currently used for profile pictures; architecture is generic and extendable to other upload needs

---

## 🗑️ Delete Board

- Admin-only operation
- MongoDB transaction-based — zero partial-state risk
- Cascade deletes: board, memberships, invites, lists, tasks, chat messages (board + DM)
- Socket notification to all members after successful deletion

---

## 🎨 Frontend Experience

- **Consistent design system** across the entire app — Plus Jakarta Sans + DM Sans, a defined blue-primary color palette with semantic success/warning/error tokens, consistent radius/shadow/spacing scale
- **Home dashboard** — board grid with live stats strip, pending-approval section, and quick board creation
- **Board page** — dedicated full-screen workspace (navbar hidden) with topbar, drag-and-drop list/task canvas, members sidebar, and chat sidebar
- **Drag-and-drop** — smooth list and task reordering via @dnd-kit, with collision-detection edge cases handled (e.g. dropping a list onto a nested task correctly resolves to the parent list)
- **Members sidebar** — tabbed view of approved members and pending requests, inline approve/reject/promote/remove actions
- **Task modal** — full task detail view with inline title/description/status editing and admin-only assignee dropdown
- **Toast notifications** and **confirmation modals** for every destructive or state-changing action
- **Fully responsive** — mobile hamburger navigation, adaptive board layouts, touch-friendly drag targets
- **Optimistic-safe state management** — Zustand store with duplicate-guarded socket handlers to prevent race conditions between a user's own action and its broadcast echo

---

## 🧪 Error Handling

- Consistent JSON error response shape across all endpoints
- Safe try/catch usage throughout
- Transaction rollback on failure for multi-step operations (admin transfer, board deletion)
- Graceful handling of async side-effects (email failures never surface to the end user as request failures)

---

## 🏁 Project Status

✅ Backend complete · ✅ Frontend complete · ✅ Real-time sync complete · ✅ Production-ready · ✅ Fully Deployed · ✅ Extensible by design

This is not the end — new features will continue to be added incrementally. The codebase was deliberately built without unnecessary abstractions, so it can be extended without a rewrite.

---

## 📦 Running Locally

**Prerequisites:** Node.js, MongoDB (Atlas or local), Redis (local or managed)

```bash
# Backend
npm install
npm run dev          # starts the Express + Socket.IO server

# Email worker (separate terminal — required for any email-sending feature to work)
node Workers/emailWorker.js

# Frontend
cd client
npm install
npm run dev
```

Both the server and the worker read from the same `.env` file — see `.env.example` for required variables (MongoDB URI, JWT secret, Cloudinary credentials, email SMTP credentials, Google OAuth credentials, and either `REDIS_URL` or `REDIS_HOST`/`REDIS_PORT`).
