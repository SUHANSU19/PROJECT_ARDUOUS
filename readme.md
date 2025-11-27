🎮 ARDUOUS - Discord Clone----
A full-stack real-time chat application built with the PERN stack (PostgreSQL, Express, React, Node.js).


📖About The Project----
ARDUOUS is a scalable chat application designed to replicate the core functionality of Discord. It features real-time messaging, server/guild creation, channel management, and user authentication.

Current Status: Backend Core API & Authentication (Module 2 In Progress)

-🛠️ Tech Stack-
.Backend: Node.js, Express.js
.Database: PostgreSQL (Relational DB)
.Authentication: JWT (JSON Web Tokens), bcryptjs
.API Testing: Thunder Client / Postman
.Frontend: React (Planned)
.Real-Time: Socket.IO (Planned)


🔌 API Endpoints

Authentication (/api/users)

Method            Endpoint         Description

.POST             . /register      .  Register a new user.

.POST             .  /login        .  Login and receive a Bearer Token.

Servers (/api/servers)

Method            Endpoint         Description                             Auth Required?

.POST              .   /         .  Create a new server                   ✅ Yes

.GET              .    /         .List all servers you are a member of.   ✅ Yes

Channels (/api/servers/:serverId/channels)

Method            Endpoint         Description                               Auth Required?

POST              /               Create a channel in a server (Owner only).   ✅ Yes                                        

GET               /               List all channels in a server.               ✅ Yes                                                  

📂 Project Structure


arduous/
├── backend/
│   ├── db/             # Database schema and connection logic (db.js)
│   ├── middleware/     # Auth middleware (The Bouncer)
│   ├── routes/         # API Route definitions (users, servers, channels)
│   ├── index.js        # Entry point (The Lobby)
│   └── .env            # Environment variables (Hidden)
└── frontend/           # (Coming Soon)