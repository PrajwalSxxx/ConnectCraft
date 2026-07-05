-- ==========================================
-- CONNECTCRAFT DATABASE SCHEMA (MySQL 8.0+)
-- Description: Database configuration for the ConnectCraft Real-Time Multi-Client Chat Application
-- Author: Senior Database Architect
-- ==========================================

CREATE DATABASE IF NOT EXISTS connectcraft_chat;
USE connectcraft_chat;

-- ------------------------------------------
-- Table: users
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(256) NOT NULL, -- SHA-256 encrypted password
    profile_picture VARCHAR(255) DEFAULT 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    status ENUM('ONLINE', 'OFFLINE') DEFAULT 'OFFLINE',
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------
-- Table: groups
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS groups (
    group_id INT AUTO_INCREMENT PRIMARY KEY,
    group_name VARCHAR(100) NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_group_name (group_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------
-- Table: group_members
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS group_members (
    group_id INT NOT NULL,
    user_id INT NOT NULL,
    PRIMARY KEY (group_id, user_id),
    FOREIGN KEY (group_id) REFERENCES groups(group_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_group_member (group_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------
-- Table: messages
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT DEFAULT NULL, -- Null if sent to a group
    group_id INT DEFAULT NULL,    -- Null if sent to a specific user (one-to-one)
    message TEXT NOT NULL,
    message_type ENUM('TEXT', 'IMAGE', 'DOCUMENT') DEFAULT 'TEXT',
    file_path VARCHAR(255) DEFAULT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups(group_id) ON DELETE CASCADE,
    INDEX idx_sender (sender_id),
    INDEX idx_receiver (receiver_id),
    INDEX idx_group (group_id),
    INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------
-- Table: chat_logs
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS chat_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    activity VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_log_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------
-- Sample Data (Pre-seeding)
-- ------------------------------------------
INSERT INTO users (user_id, name, username, email, password, status) VALUES
(1, 'Alice Smith', 'alice', 'alice@connectcraft.com', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'OFFLINE'), -- pass123
(2, 'Bob Jones', 'bob', 'bob@connectcraft.com', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'OFFLINE'),
(3, 'Charlie Brown', 'charlie', 'charlie@connectcraft.com', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'OFFLINE');

INSERT INTO groups (group_id, group_name, created_by) VALUES
(1, 'Java Core Architects', 1);

INSERT INTO group_members (group_id, user_id) VALUES
(1, 1),
(1, 2),
(1, 3);

INSERT INTO messages (message_id, sender_id, receiver_id, group_id, message, message_type) VALUES
(1, 1, NULL, 1, 'Hello everyone! Welcome to ConnectCraft group discussion.', 'TEXT'),
(2, 2, NULL, 1, 'Hi Alice, the server socket is fully responsive and database connections are stable.', 'TEXT');

INSERT INTO chat_logs (log_id, user_id, activity) VALUES
(1, 1, 'Database initialized, default admin group created.');
