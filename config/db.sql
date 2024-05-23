CREATE DATABASE `test_db`;

CREATE TABLE `users` (
 `id` int NOT NULL AUTO_INCREMENT,
 `name` varchar(255) DEFAULT NULL,
 `address` varchar(255) DEFAULT NULL,
 `country` varchar(255) DEFAULT NULL,
 PRIMARY KEY (`id`)
)

CREATE TABLE `credentials` (
 `id` int NOT NULL AUTO_INCREMENT,
 `username` varchar(255) NOT NULL,
 `hash` varchar(255) NOT NULL,
 PRIMARY KEY (`id`)
);