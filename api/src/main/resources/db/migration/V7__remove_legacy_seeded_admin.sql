-- Remove the legacy seeded admin row if it still uses the historical default hash.
-- Fresh installs never create this row because V4 is now a no-op, but existing
-- deployments may still have it until this remediation migration runs.
DELETE FROM admin_users
WHERE username = 'admin'
  AND password_hash = '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkZHBi1eSDdK.EZvKTqZBrMLCAhi2';
