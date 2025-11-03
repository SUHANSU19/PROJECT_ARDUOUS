-- This table stores user login info.

CREATE TABLE Users(
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email_id VARCHAR(300) NOT NULL UNIQUE,
    hashed_password VARCHAR(250) NOT NULL
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--This table stores the servers (or "guilds").
CREATE TABLE Servers(
    id SERIAL PRIMARY KEY,
    -- A server is owned by a user. This is a one-to-many relationship.
    owner_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    FOREIGN KEY (owner_id) REFERENCES Users(id)
);


-- This table stores the channels *inside* a server.(note - we have'nt add a current "type" showing voice/text type)
CREATE TABLE Channels(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    server_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (server_id) REFERENCES Servers(id)
);


-- This table stores the actual chat messages.
CREATE TABLE Messages(
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    channel_id INTEGER NOT NULL,
    author_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (channel_id) REFERENCES Channels(id),
    FOREIGN KEY (author_id) REFERENCES Users(id)
);

-- This is our "join table" for the many-to-many relationship.
CREATE TABLE ServerMembers(
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    server_id INTEGER NOT NULL,
    -- We can add roles, like 'ADMIN' or 'MEMBER'
    role VARCHAR(50) DEFAULT 'MEMBER',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (server_id) REFERENCES Servers(id),
    
    -- A user can only be in a server *once*. This unique constraint ensures that.
    UNIQUE(user_id, server_id)
);