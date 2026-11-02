-- Drizzle does not emit privileges. These statements remove grants to the
-- special PUBLIC role. They do not remove the table owner's access, and they
-- do not create a separate application role. Netlify Database is not enabled
-- yet, so no existing application role depends on these grants.
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM PUBLIC;
