-- #573: tenants and projects can be archived instead of deleted.
-- Moved after 20261021000000_agent_platform which creates the Tenant and Project tables.
ALTER TABLE "Tenant" ADD COLUMN "archivedAt" TIMESTAMP(3);
ALTER TABLE "Project" ADD COLUMN "archivedAt" TIMESTAMP(3);
