-- ============================================================
-- contacts + messages tables for buyer-dealer communication
-- Run this in Supabase SQL Editor
-- ============================================================

-- 0) Clean up if re-running
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;

-- 1) contacts: initiated by buyer clicking "Kontakt aufnehmen"
CREATE TABLE contacts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tender_id           UUID NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
  offer_id            UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  buyer_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dealer_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  status              TEXT NOT NULL DEFAULT 'initiated'
                      CHECK (status IN ('initiated', 'responded', 'contract_yes', 'contract_no')),

  dealer_responded    BOOLEAN NOT NULL DEFAULT false,
  contract_concluded  BOOLEAN,  -- null = not yet decided, true = yes, false = no

  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_contacts_tender ON contacts(tender_id);
CREATE INDEX idx_contacts_buyer ON contacts(buyer_id);
CREATE INDEX idx_contacts_dealer ON contacts(dealer_id);
CREATE UNIQUE INDEX idx_contacts_unique ON contacts(buyer_id, offer_id);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Buyer can create contacts for their own tenders
CREATE POLICY "Buyers can create contacts"
  ON contacts FOR INSERT TO authenticated
  WITH CHECK (buyer_id = auth.uid());

-- Both parties can view their contacts
CREATE POLICY "Buyers can view own contacts"
  ON contacts FOR SELECT TO authenticated
  USING (buyer_id = auth.uid());

CREATE POLICY "Dealers can view own contacts"
  ON contacts FOR SELECT TO authenticated
  USING (dealer_id = auth.uid());

-- Dealer can update contacts they're part of (respond, contract status)
CREATE POLICY "Dealers can update own contacts"
  ON contacts FOR UPDATE TO authenticated
  USING (dealer_id = auth.uid())
  WITH CHECK (dealer_id = auth.uid());

-- Buyer can update contacts they created (contract status)
CREATE POLICY "Buyers can update own contacts"
  ON contacts FOR UPDATE TO authenticated
  USING (buyer_id = auth.uid())
  WITH CHECK (buyer_id = auth.uid());

-- 2) messages: chat between buyer and dealer after contact
CREATE TABLE messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id  UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  sender_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  read        BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_contact ON messages(contact_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_unread ON messages(contact_id, read) WHERE NOT read;

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Both parties of a contact can read messages
CREATE POLICY "Contact parties can view messages"
  ON messages FOR SELECT TO authenticated
  USING (
    contact_id IN (
      SELECT id FROM contacts
      WHERE buyer_id = auth.uid() OR dealer_id = auth.uid()
    )
  );

-- Both parties can insert messages into their contacts
CREATE POLICY "Contact parties can send messages"
  ON messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND contact_id IN (
      SELECT id FROM contacts
      WHERE buyer_id = auth.uid() OR dealer_id = auth.uid()
    )
  );

-- Recipient can mark messages as read
CREATE POLICY "Recipients can mark messages read"
  ON messages FOR UPDATE TO authenticated
  USING (
    sender_id != auth.uid()
    AND contact_id IN (
      SELECT id FROM contacts
      WHERE buyer_id = auth.uid() OR dealer_id = auth.uid()
    )
  )
  WITH CHECK (
    sender_id != auth.uid()
    AND contact_id IN (
      SELECT id FROM contacts
      WHERE buyer_id = auth.uid() OR dealer_id = auth.uid()
    )
  );

-- 3) RPC: get unread message count for current user
CREATE OR REPLACE FUNCTION get_unread_message_count()
RETURNS BIGINT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COUNT(*)
  FROM messages m
  JOIN contacts c ON c.id = m.contact_id
  WHERE m.read = false
    AND m.sender_id != auth.uid()
    AND (c.buyer_id = auth.uid() OR c.dealer_id = auth.uid());
$$;

-- 4) Enable Realtime on messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
