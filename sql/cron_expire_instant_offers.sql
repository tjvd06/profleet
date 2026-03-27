-- ============================================================
-- Cron-Job: Abgelaufene Sofort-Angebote auf 'expired' setzen
-- Voraussetzung: pg_cron Extension muss in Supabase aktiviert sein
-- (Dashboard → Database → Extensions → pg_cron aktivieren)
-- ============================================================

-- 1. Extension aktivieren (falls noch nicht geschehen)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Cron-Job anlegen: stündlich abgelaufene Angebote auf 'expired' setzen
SELECT cron.schedule(
  'expire-instant-offers',       -- Job-Name
  '0 * * * *',                   -- Jede volle Stunde
  $$UPDATE instant_offers
    SET status = 'expired'
    WHERE status = 'active'
      AND expires_at < now()$$
);
