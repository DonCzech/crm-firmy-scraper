BEGIN;

CREATE TABLE IF NOT EXISTS fak_schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

CREATE UNIQUE INDEX IF NOT EXISTS fak_invoices_company_number_uidx
  ON fak_invoices(company_id, number);
CREATE UNIQUE INDEX IF NOT EXISTS fak_quotes_company_number_uidx
  ON fak_quotes(company_id, number);
CREATE UNIQUE INDEX IF NOT EXISTS fak_reminder_log_once_uidx
  ON fak_reminder_log(invoice_id, type);

CREATE INDEX IF NOT EXISTS fak_sessions_expires_idx ON fak_sessions(expires_at);
CREATE INDEX IF NOT EXISTS fak_invoices_company_status_idx ON fak_invoices(company_id, status);
CREATE INDEX IF NOT EXISTS fak_invoices_company_created_idx ON fak_invoices(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS fak_recurring_due_idx ON fak_recurring_invoices(active, next_issue_date);

CREATE TABLE IF NOT EXISTS fak_webhook_events (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  event_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing',
  error TEXT,
  created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
  processed_at BIGINT
);

ALTER TABLE fak_invoices DROP CONSTRAINT IF EXISTS fak_invoices_status_check;
ALTER TABLE fak_invoices ADD CONSTRAINT fak_invoices_status_check
  CHECK (status IN ('draft','sent','viewed','paid','overdue','cancelled')) NOT VALID;
ALTER TABLE fak_invoices DROP CONSTRAINT IF EXISTS fak_invoices_amounts_check;
ALTER TABLE fak_invoices ADD CONSTRAINT fak_invoices_amounts_check
  CHECK (subtotal >= 0 AND vat_total >= 0 AND total >= 0) NOT VALID;
ALTER TABLE fak_invoice_items DROP CONSTRAINT IF EXISTS fak_invoice_items_values_check;
ALTER TABLE fak_invoice_items ADD CONSTRAINT fak_invoice_items_values_check
  CHECK (quantity > 0 AND unit_price >= 0 AND vat_rate BETWEEN 0 AND 21) NOT VALID;

INSERT INTO fak_schema_migrations(version) VALUES ('001_production_hardening')
ON CONFLICT DO NOTHING;

COMMIT;
