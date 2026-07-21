import test from "node:test";
import assert from "node:assert/strict";
import { generateInvoiceNumber } from "../src/lib/invoice-number.ts";

const base = {
  invoice_prefix: "FA",
  invoice_number_year_format: "full",
  invoice_number_month: false,
  invoice_number_position: "end",
  invoice_number_volume: 10000,
  invoice_number_separator: "-",
  invoice_next: 42,
};

test("generates deterministic full-year invoice number", () => {
  assert.equal(generateInvoiceNumber(base, new Date("2026-07-13T00:00:00Z")), "FA-2026-0042");
});

test("supports month and sequence-first configuration", () => {
  assert.equal(generateInvoiceNumber({
    ...base,
    invoice_number_month: true,
    invoice_number_position: "start",
    invoice_next: 7,
  }, new Date("2026-07-13T00:00:00Z")), "FA-0007-2026-07");
});
