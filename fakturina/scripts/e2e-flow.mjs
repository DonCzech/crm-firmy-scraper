import { existsSync, readFileSync } from "node:fs";

if (existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)\s*$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  }
}

const baseUrl = process.env.BASE_URL || "http://localhost:3020";
const stamp = Date.now();
let cookie = "";

async function request(path, options = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
      ...(options.headers || {}),
    },
  });
  const setCookie = res.headers.get("set-cookie");
  if (setCookie) cookie = setCookie.split(";")[0];
  const text = await res.text();
  let body = {};
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { raw: text };
  }
  if (!res.ok) {
    const error = new Error(`${options.method || "GET"} ${path} -> ${res.status}`);
    error.body = body;
    throw error;
  }
  return body;
}

async function optional(path, options = {}) {
  try {
    return { ok: true, body: await request(path, options) };
  } catch (err) {
    return { ok: false, body: err.body || { error: err.message } };
  }
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function inDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

const steps = [];
function pass(name, detail) {
  steps.push({ name, ok: true, detail });
  console.log(`OK  ${name}${detail ? `: ${detail}` : ""}`);
}

function info(name, detail) {
  steps.push({ name, ok: true, detail, info: true });
  console.log(`INFO ${name}${detail ? `: ${detail}` : ""}`);
}

function assert(condition, name, detail) {
  if (!condition) throw new Error(`${name}${detail ? `: ${detail}` : ""}`);
  pass(name, detail);
}

try {
  const email = `audit-${stamp}@example.test`;
  await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password: "AuditPass123!", name: "Audit User" }),
  });
  assert(Boolean(cookie), "registrace a session cookie", email);

  const company = await request("/api/company", {
    method: "POST",
    body: JSON.stringify({
      name: "Audit Fakturina s.r.o.",
      ico: "12345678",
      address: "Testovaci 1",
      city: "Praha",
      zip: "11000",
      bankAccount: "2600000000/2010",
      defaultCurrency: "CZK",
      defaultDueDays: 1,
      invoicePrefix: "AUD",
      onboarded: true,
    }),
  });
  assert(company.id, "zalozeni firmy", company.name);

  const bankAccount = await request("/api/settings/bank-accounts", {
    method: "POST",
    body: JSON.stringify({
      name: "Audit CZK ucet",
      bank_account: "2600000000/2010",
      currency: "CZK",
      is_default: true,
    }),
  });
  assert(bankAccount.id, "bankovni ucet", bankAccount.bank_account);

  const client = await request("/api/clients", {
    method: "POST",
    body: JSON.stringify({
      name: "Audit zakaznik",
      email: `client-${stamp}@example.test`,
      address: "Klientska 2",
      city: "Brno",
      zip: "60200",
    }),
  });
  assert(client.id, "zalozeni klienta", client.name);

  const invoice = await request("/api/invoices", {
    method: "POST",
    body: JSON.stringify({
      clientId: client.id,
      currency: "CZK",
      issueDate: today(),
      dueDate: today(),
      variableSymbol: String(stamp).slice(-10),
      bankAccountId: bankAccount.id,
      paymentMethod: "bank",
      items: [{ name: "Auditni prace", quantity: 1, unit: "ks", unitPrice: 1234, vatRate: 0 }],
    }),
  });
  assert(invoice.id && Number(invoice.total) === 1234, "vytvoreni faktury", `${invoice.number}, VS ${invoice.variable_symbol}`);

  const sendResult = await optional(`/api/invoices/${invoice.id}/send`, {
    method: "POST",
    body: JSON.stringify({ to: client.email, attachPdf: false }),
  });
  if (sendResult.ok) {
    pass("odeslani faktury pres Resend", "odeslano");
  } else {
    info("odeslani faktury pres Resend", sendResult.body.error || "neni nastaven RESEND_API_KEY/EMAIL_FROM");
    await request(`/api/invoices/${invoice.id}`, {
      method: "PUT",
      body: JSON.stringify({ status: "sent" }),
    });
    pass("nastaveni stavu faktury pro upominky", "sent");
  }

  await request("/api/reminders", {
    method: "POST",
    body: JSON.stringify({
      before_due_enabled: false,
      due_day_enabled: true,
      after_3_days_enabled: false,
      after_10_days_enabled: false,
      after_20_days_enabled: false,
      email_template_before_due: "Pred splatnosti {{number}}",
      email_template_due_day: "Dnes je splatnost faktury {{number}} na {{total}}.",
      email_template_after_due: "Po splatnosti {{number}}",
    }),
  });
  pass("nastaveni upominek", "due_day enabled");

  const reminders = await request("/api/cron/reminders?dryRun=1", {
    headers: process.env.CRON_SECRET ? { Authorization: `Bearer ${process.env.CRON_SECRET}` } : {},
  });
  assert(reminders.processed >= 1, "test upominky bez odeslani", `${reminders.processed} kandidat`);

  const match = await request("/api/bank-sync", {
    method: "POST",
    body: JSON.stringify({
      mockTransaction: {
        providerTransactionId: `mock-${stamp}`,
        bookingDate: inDays(0),
        amount: 1234,
        currency: "CZK",
        variableSymbol: invoice.variable_symbol,
        message: "Audit payment",
      },
    }),
  });
  assert(match.matched === 1 && match.invoiceId === invoice.id, "automaticke sparovani platby", match.invoiceId);

  const paid = await request(`/api/invoices/${invoice.id}`);
  assert(paid.status === "paid" && paid.paid_at, "automaticky oznaceno jako zaplaceno", paid.status);

  console.log("\nAudit flow hotovy.");
  process.exit(0);
} catch (err) {
  console.error("\nAudit flow selhal:");
  console.error(err.message);
  if (err.body) console.error(JSON.stringify(err.body, null, 2));
  process.exit(1);
}
