CREATE DATABASE IF NOT EXISTS webtech_projects;
USE webtech_projects;

CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    enrollment_no VARCHAR(30) NOT NULL UNIQUE,
    student_name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_no VARCHAR(30) NOT NULL UNIQUE,
    student1_id INT NOT NULL,
    student2_id INT NULL,
    project_title VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    abstract TEXT NOT NULL,
    functionalities TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student1_id) REFERENCES students(id),
    FOREIGN KEY (student2_id) REFERENCES students(id)
);
