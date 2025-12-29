TeamFlow is a collaborative project management backend designed for real-time teamwork.
It supports secure authentication, board-based authorization, and structured project workflows using boards, lists, and tasks.

This repository contains the backend API built with Node.js, Express, MongoDB, and JWT-based authentication.

🚀 Features
🔐 Authentication (AuthN)

User signup with optional profile picture upload

Secure password hashing using bcrypt

User login with JWT-based authentication

Protected routes using authentication middleware

🛂 Authorization (AuthZ)

Board-level access control

Separate middlewares for:

Board members

Board admins (leaders)

Permissions derived from database (no client-side trust)

🗂️ Project Structure

Board – Represents a project

List – Represents a project sub-part/module

Task – Represents a unit of work with progress tracking

BoardMembership – Manages user-board relationships and roles

☁️ File Uploads

Profile picture uploads using Multer (memory storage)

Images stored securely on Cloudinary
