CREATE DATABASE IF NOT EXISTS moodtracker_db
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE moodtracker_db;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE user_profiles (
    id INT PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    birth_date DATE,
    CONSTRAINT fk_user_profiles_users 
        FOREIGN KEY (id) 
        REFERENCES users(id) 
        ON DELETE CASCADE
) ENGINE=InnoDB;


CREATE TABLE entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    mood_level TINYINT NOT NULL,
    sleep_duration DECIMAL(4,2),
    note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_mood_level CHECK (mood_level >= 1 AND mood_level <= 5),
    CONSTRAINT fk_entries_users 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE
) ENGINE=InnoDB;


CREATE TABLE custom_labels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    color_hex VARCHAR(7),
    CONSTRAINT fk_custom_labels_users 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE,
    CONSTRAINT uq_user_label UNIQUE (user_id, name)
) ENGINE=InnoDB;


CREATE TABLE entry_labels (
    entry_id INT NOT NULL,
    label_id INT NOT NULL,
    PRIMARY KEY (entry_id, label_id),
    CONSTRAINT fk_entry_labels_entries 
        FOREIGN KEY (entry_id) 
        REFERENCES entries(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_entry_labels_custom_labels 
        FOREIGN KEY (label_id) 
        REFERENCES custom_labels(id) 
        ON DELETE CASCADE
) ENGINE=InnoDB;


INSERT INTO users (id, email, password_hash) VALUES (1, 'admin@gmail.com', '$2a$11$ITgC1z.uNTFX5HuCM1lLteY.77eOorY5SOX5VzX7r//TEN/IwW4j.'); 
INSERT INTO user_profiles (id, first_name, last_name) VALUES (1, 'Admin', 'Adminowski');