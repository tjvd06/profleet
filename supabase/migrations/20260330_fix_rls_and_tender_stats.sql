-- 1. Fix profiles RLS: remove the conflicting public SELECT policy
--    that overrides "No anonymous access".
--    After this:
--      anon  -> "No anonymous access" (qual: false) -> BLOCKED
--      authenticated -> "Authenticated users can read profiles" (qual: true) -> ALLOWED
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;

-- 2. Create a SECURITY DEFINER function that returns aggregated offer stats
--    for active tenders. This bypasses RLS so anonymous users can see
--    offer counts and best prices without accessing individual offer rows.
CREATE OR REPLACE FUNCTION public_tender_stats(p_tender_ids uuid[])
RETURNS TABLE(tender_id uuid, offer_count bigint, best_total_price numeric)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    o.tender_id,
    count(DISTINCT o.id)  AS offer_count,
    min(o.total_price)    AS best_total_price
  FROM offers o
  JOIN tenders t ON t.id = o.tender_id
  WHERE o.tender_id = ANY(p_tender_ids)
    AND t.status = 'active'
  GROUP BY o.tender_id;
$$;

-- Grant execute to anon and authenticated so the public page can call it
GRANT EXECUTE ON FUNCTION public_tender_stats(uuid[]) TO anon;
GRANT EXECUTE ON FUNCTION public_tender_stats(uuid[]) TO authenticated;
