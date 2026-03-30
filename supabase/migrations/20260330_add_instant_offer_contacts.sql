-- Add instant_offer_id column to contacts table
-- Allows linking a contact/chat to an instant offer (Sofort-Angebot)
ALTER TABLE public.contacts
ADD COLUMN instant_offer_id uuid REFERENCES public.instant_offers(id);

-- Make tender_id and offer_id nullable (contacts can now be for instant offers instead)
ALTER TABLE public.contacts
ALTER COLUMN tender_id DROP NOT NULL,
ALTER COLUMN offer_id DROP NOT NULL;

-- Unique constraint: one contact per buyer per instant offer
CREATE UNIQUE INDEX contacts_buyer_instant_offer_unique
ON public.contacts (buyer_id, instant_offer_id)
WHERE instant_offer_id IS NOT NULL;
