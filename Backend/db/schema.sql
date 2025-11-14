-- PostgreSQL Version (Corrected with all commas)

CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Servers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    owner_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES Users(id)
);

CREATE TABLE Channels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    server_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (server_id) REFERENCES Servers(id)
);

CREATE TABLE Messages (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    channel_id INTEGER NOT NULL,
    author_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (channel_id) REFERENCES Channels(id),
    FOREIGN KEY (author_id) REFERENCES Users(id)
);

CREATE TABLE ServerMembers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    server_id INTEGER NOT NULL,
    role VARCHAR(50) DEFAULT 'MEMBER', 
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (server_id) REFERENCES Servers(id),
    UNIQUE(user_id, server_id)
);