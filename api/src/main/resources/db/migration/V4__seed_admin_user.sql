-- Default admin user (password: "changeme" - bcrypt hashed)
-- IMPORTANT: Change this password immediately after first login
INSERT INTO admin_users (id, username, password_hash) VALUES
(gen_random_uuid(), 'admin', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkZHBi1eSDdK.EZvKTqZBrMLCAhi2');
