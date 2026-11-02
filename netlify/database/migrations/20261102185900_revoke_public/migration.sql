-- Drizzle does not emit privileges. Public roles must not read private roster tables.
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
