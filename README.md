🚀 TeamFlow – Backend

TeamFlow is a real-time collaborative board application backend, inspired by tools like Trello and Notion.
It is built with a backend-first, production-safe approach, focusing on clean domain rules, real-time sync, and data integrity.

🧠 Core Philosophy

REST APIs = Source of truth

Sockets = Real-time state synchronization

Emails = Async side-effects

No overengineering

Clear domain rules

Transaction-safe operations

🛠 Tech Stack

Backend: Node.js, Express

Database: MongoDB, Mongoose

Authentication: JWT

Realtime: Socket.IO

File Uploads: Multer + Cloudinary

Emails: Nodemailer

Transactions: MongoDB Sessions

Deployment-ready: Environment-based config

🔐 Authentication & User Management

User Signup

User Login

JWT-based authentication

Secure auth middleware

Forgot password (email-based token)

Password reset via secure token

User profile API

Cloudinary-based profile picture upload

🧩 Board System
Board Rules (Strictly Enforced)

Each board has exactly one admin

Admin cannot leave the board

Admin must transfer admin or delete board

Only admin can:

Remove members

Approve join requests

Transfer admin

Board Features

Create board

Rename board

Get board by ID

Get all boards for logged-in user

Transfer admin (transaction-safe)

Delete board (cascade delete + transaction)

👥 Board Memberships

Membership is the single source of truth

States:

PENDING

APPROVED

Unique constraint on { userId, boardId }

Membership Features

Join via invite link

Admin approve / reject requests

Member removal

Leave board (admin restricted)

Fetch approved members

Fetch pending members

📩 Invite System

Secure invite link generation

Token-based validation

Expiry support

Join via invite creates PENDING membership

Admin approval required

📚 Lists

Create list (admin only)

Rename list

Fetch lists by board

Reorder lists (drag & drop)

Manual position management

BulkWrite for efficient reordering

Real-time sync via sockets

🧩 Tasks
Task Rules

Tasks are strictly list-bound

❌ Tasks cannot move across lists

✅ Only reordering inside same list is allowed

Task Features

Create task (auto position)

Update task (partial updates)

Delete task

Fetch all board tasks in one API

Reorder tasks (drag & drop)

Email notification on task creation

Real-time task sync via sockets

💬 Chat System (Real-Time)
Supported Chats

Board Chat

Direct Messages (DM) (scoped inside boards)

Chat Features

Real-time messaging via Socket.IO

Persistent message storage

Chat history with pagination

Read receipts (blue ticks)

Typing indicators

Unread message counts

WhatsApp-style chat lists (board & DM)

Board-scoped DMs (no cross-board access)

⚡ Socket Architecture
Rooms

board_<boardId> → board-wide events

user_<userId> → private events

Socket Events

Message send (board & DM)

Read receipt updates

Typing indicators

Task events

List reorder

Board delete notification

📧 Email System

Emails are treated as non-blocking side-effects.

Used for:

Password reset

Task creation notifications

Rules

Wrapped in try/catch

Never block API responses

Failure does not break main flow

🖼️ Media Uploads

Image upload using Multer

Cloudinary integration

Used for:

Profile pictures

Extendable for future features

🗑️ Delete Board

Admin-only operation

MongoDB transaction-based

Cascade deletes:

Board

BoardMemberships

Invites

Lists

Tasks

Messages (board + DM)

Socket notification after successful deletion

Zero partial state risk

🧪 Error Handling

Consistent JSON error responses

Safe try/catch usage

Transaction rollback on failure

Graceful handling of async side-effects

🏁 Project Status

✅ Backend Complete
✅ Production-ready
✅ Deployment-ready
✅ Extensible by design

🧠 Final Note

TeamFlow backend was built with a real-world mindset:
Clean domain rules
Real-time collaboration
Data integrity

=>This is not the end new features will be added gradually

No unnecessary abstractions

This backend can be deployed as-is and extended incrementally over time.
