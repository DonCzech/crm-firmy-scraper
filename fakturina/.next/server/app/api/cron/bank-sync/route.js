"use strict";(()=>{var e={};e.id=8064,e.ids=[8064],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},84770:e=>{e.exports=require("crypto")},8678:e=>{e.exports=import("pg")},58855:(e,T,t)=>{t.a(e,async(e,E)=>{try{t.r(T),t.d(T,{originalPathname:()=>O,patchFetch:()=>N,requestAsyncStorage:()=>s,routeModule:()=>L,serverHooks:()=>_,staticGenerationAsyncStorage:()=>c});var a=t(12085),i=t(31650),n=t(85980),o=t(26049),r=e([o]);o=(r.then?(await r)():r)[0];let L=new a.AppRouteRouteModule({definition:{kind:i.x.APP_ROUTE,page:"/api/cron/bank-sync/route",pathname:"/api/cron/bank-sync",filename:"route",bundlePath:"app/api/cron/bank-sync/route"},resolvedPagePath:"/Users/apple/DEV/CRM/fakturina/src/app/api/cron/bank-sync/route.ts",nextConfigOutput:"",userland:o}),{requestAsyncStorage:s,staticGenerationAsyncStorage:c,serverHooks:_}=L,O="/api/cron/bank-sync/route";function N(){return(0,n.patchFetch)({serverHooks:_,staticGenerationAsyncStorage:c})}E()}catch(e){E(e)}})},64737:e=>{var T=Object.defineProperty,t=Object.getOwnPropertyDescriptor,E=Object.getOwnPropertyNames,a=Object.prototype.hasOwnProperty,i={};function n(e){var T;let t=["path"in e&&e.path&&`Path=${e.path}`,"expires"in e&&(e.expires||0===e.expires)&&`Expires=${("number"==typeof e.expires?new Date(e.expires):e.expires).toUTCString()}`,"maxAge"in e&&"number"==typeof e.maxAge&&`Max-Age=${e.maxAge}`,"domain"in e&&e.domain&&`Domain=${e.domain}`,"secure"in e&&e.secure&&"Secure","httpOnly"in e&&e.httpOnly&&"HttpOnly","sameSite"in e&&e.sameSite&&`SameSite=${e.sameSite}`,"partitioned"in e&&e.partitioned&&"Partitioned","priority"in e&&e.priority&&`Priority=${e.priority}`].filter(Boolean),E=`${e.name}=${encodeURIComponent(null!=(T=e.value)?T:"")}`;return 0===t.length?E:`${E}; ${t.join("; ")}`}function o(e){let T=new Map;for(let t of e.split(/; */)){if(!t)continue;let e=t.indexOf("=");if(-1===e){T.set(t,"true");continue}let[E,a]=[t.slice(0,e),t.slice(e+1)];try{T.set(E,decodeURIComponent(null!=a?a:"true"))}catch{}}return T}function r(e){var T,t;if(!e)return;let[[E,a],...i]=o(e),{domain:n,expires:r,httponly:s,maxage:c,path:_,samesite:O,secure:A,partitioned:d,priority:u}=Object.fromEntries(i.map(([e,T])=>[e.toLowerCase(),T]));return function(e){let T={};for(let t in e)e[t]&&(T[t]=e[t]);return T}({name:E,value:decodeURIComponent(a),domain:n,...r&&{expires:new Date(r)},...s&&{httpOnly:!0},..."string"==typeof c&&{maxAge:Number(c)},path:_,...O&&{sameSite:N.includes(T=(T=O).toLowerCase())?T:void 0},...A&&{secure:!0},...u&&{priority:L.includes(t=(t=u).toLowerCase())?t:void 0},...d&&{partitioned:!0}})}((e,t)=>{for(var E in t)T(e,E,{get:t[E],enumerable:!0})})(i,{RequestCookies:()=>s,ResponseCookies:()=>c,parseCookie:()=>o,parseSetCookie:()=>r,stringifyCookie:()=>n}),e.exports=((e,i,n,o)=>{if(i&&"object"==typeof i||"function"==typeof i)for(let n of E(i))a.call(e,n)||void 0===n||T(e,n,{get:()=>i[n],enumerable:!(o=t(i,n))||o.enumerable});return e})(T({},"__esModule",{value:!0}),i);var N=["strict","lax","none"],L=["low","medium","high"],s=class{constructor(e){this._parsed=new Map,this._headers=e;let T=e.get("cookie");if(T)for(let[e,t]of o(T))this._parsed.set(e,{name:e,value:t})}[Symbol.iterator](){return this._parsed[Symbol.iterator]()}get size(){return this._parsed.size}get(...e){let T="string"==typeof e[0]?e[0]:e[0].name;return this._parsed.get(T)}getAll(...e){var T;let t=Array.from(this._parsed);if(!e.length)return t.map(([e,T])=>T);let E="string"==typeof e[0]?e[0]:null==(T=e[0])?void 0:T.name;return t.filter(([e])=>e===E).map(([e,T])=>T)}has(e){return this._parsed.has(e)}set(...e){let[T,t]=1===e.length?[e[0].name,e[0].value]:e,E=this._parsed;return E.set(T,{name:T,value:t}),this._headers.set("cookie",Array.from(E).map(([e,T])=>n(T)).join("; ")),this}delete(e){let T=this._parsed,t=Array.isArray(e)?e.map(e=>T.delete(e)):T.delete(e);return this._headers.set("cookie",Array.from(T).map(([e,T])=>n(T)).join("; ")),t}clear(){return this.delete(Array.from(this._parsed.keys())),this}[Symbol.for("edge-runtime.inspect.custom")](){return`RequestCookies ${JSON.stringify(Object.fromEntries(this._parsed))}`}toString(){return[...this._parsed.values()].map(e=>`${e.name}=${encodeURIComponent(e.value)}`).join("; ")}},c=class{constructor(e){var T,t,E;this._parsed=new Map,this._headers=e;let a=null!=(E=null!=(t=null==(T=e.getSetCookie)?void 0:T.call(e))?t:e.get("set-cookie"))?E:[];for(let e of Array.isArray(a)?a:function(e){if(!e)return[];var T,t,E,a,i,n=[],o=0;function r(){for(;o<e.length&&/\s/.test(e.charAt(o));)o+=1;return o<e.length}for(;o<e.length;){for(T=o,i=!1;r();)if(","===(t=e.charAt(o))){for(E=o,o+=1,r(),a=o;o<e.length&&"="!==(t=e.charAt(o))&&";"!==t&&","!==t;)o+=1;o<e.length&&"="===e.charAt(o)?(i=!0,o=a,n.push(e.substring(T,E)),T=o):o=E+1}else o+=1;(!i||o>=e.length)&&n.push(e.substring(T,e.length))}return n}(a)){let T=r(e);T&&this._parsed.set(T.name,T)}}get(...e){let T="string"==typeof e[0]?e[0]:e[0].name;return this._parsed.get(T)}getAll(...e){var T;let t=Array.from(this._parsed.values());if(!e.length)return t;let E="string"==typeof e[0]?e[0]:null==(T=e[0])?void 0:T.name;return t.filter(e=>e.name===E)}has(e){return this._parsed.has(e)}set(...e){let[T,t,E]=1===e.length?[e[0].name,e[0].value,e[0]]:e,a=this._parsed;return a.set(T,function(e={name:"",value:""}){return"number"==typeof e.expires&&(e.expires=new Date(e.expires)),e.maxAge&&(e.expires=new Date(Date.now()+1e3*e.maxAge)),(null===e.path||void 0===e.path)&&(e.path="/"),e}({name:T,value:t,...E})),function(e,T){for(let[,t]of(T.delete("set-cookie"),e)){let e=n(t);T.append("set-cookie",e)}}(a,this._headers),this}delete(...e){let[T,t,E]="string"==typeof e[0]?[e[0]]:[e[0].name,e[0].path,e[0].domain];return this.set({name:T,path:t,domain:E,value:"",expires:new Date(0)})}[Symbol.for("edge-runtime.inspect.custom")](){return`ResponseCookies ${JSON.stringify(Object.fromEntries(this._parsed))}`}toString(){return[...this._parsed.values()].map(n).join("; ")}}},36419:(e,T,t)=>{Object.defineProperty(T,"__esModule",{value:!0}),function(e,T){for(var t in T)Object.defineProperty(e,t,{enumerable:!0,get:T[t]})}(T,{RequestCookies:function(){return E.RequestCookies},ResponseCookies:function(){return E.ResponseCookies},stringifyCookie:function(){return E.stringifyCookie}});let E=t(64737)},26049:(e,T,t)=>{t.a(e,async(e,E)=>{try{t.r(T),t.d(T,{GET:()=>L,POST:()=>s,dynamic:()=>c});var a=t(30627),i=t(84770),n=t(98040),o=t(67564),r=e([n,o]);[n,o]=r.then?(await r)():r;let c="force-dynamic";async function N(e){let T=process.env.CRON_SECRET,t=e.headers.get("authorization");if(T&&t!==`Bearer ${T}`)return a.NextResponse.json({error:"Unauthorized"},{status:401});await (0,n.Dv)();let E=(0,i.randomUUID)();await (0,n.IO)(`INSERT INTO fak_automation_runs (id, type, status, started_at, summary)
     VALUES ($1, 'bank_sync', 'running', $2, $3)`,[E,Math.floor(Date.now()/1e3),JSON.stringify({source:"cron"})]);let{rows:r}=await (0,n.IO)("SELECT * FROM fak_bank_connections WHERE active = true ORDER BY created_at ASC"),N=[];for(let e of r)try{let T=await (0,o.uT)(e);N.push({connectionId:e.id,companyId:e.company_id,ok:!0,...T})}catch(T){N.push({connectionId:e.id,companyId:e.company_id,ok:!1,error:T instanceof Error?T.message:"Synchronizace selhala"})}let L={ok:N.every(e=>e.ok),processed:N.length,results:N};return await (0,n.IO)(`UPDATE fak_automation_runs
     SET status = $1, finished_at = $2, summary = $3
     WHERE id = $4`,[L.ok?"success":"partial_error",Math.floor(Date.now()/1e3),JSON.stringify(L),E]),a.NextResponse.json(L)}async function L(e){return N(e)}async function s(e){return N(e)}E()}catch(e){E(e)}})},67564:(e,T,t)=>{t.a(e,async(e,E)=>{try{t.d(T,{uT:()=>A,uf:()=>r});var a=t(84770),i=t(98040),n=e([i]);function o(){let e=process.env.BANK_TOKEN_SECRET;if(!e||e.length<16)throw Error("BANK_TOKEN_SECRET nen\xed nastaven nebo je př\xedliš kr\xe1tk\xfd.");return(0,a.createHash)("sha256").update(e).digest()}function r(e){let T=(0,a.randomBytes)(12),t=(0,a.createCipheriv)("aes-256-gcm",o(),T),E=Buffer.concat([t.update(e,"utf8"),t.final()]),i=t.getAuthTag();return`${T.toString("base64")}:${i.toString("base64")}:${E.toString("base64")}`}function N(e,T){let t=e[T];if(null==t)return null;if("object"==typeof t&&"value"in t){let e=t.value;return null==e?null:String(e).trim()}return String(t).trim()}function L(e){var T,t;let E=N(e,"column22")||N(e,"column17")||N(e,"id")||[N(e,"column0"),N(e,"column1"),N(e,"column5"),N(e,"column16")].filter(Boolean).join("|"),a=(T=N(e,"column1")||N(e,"amount"))?Number(T.replace(/\s/g,"").replace(",",".")):0;return!E||Number.isNaN(a)?null:{providerTransactionId:E,bookingDate:N(e,"column0")||N(e,"date"),amount:a,currency:(N(e,"column14")||N(e,"currency")||"CZK").toUpperCase(),accountNumber:N(e,"column2")||N(e,"accountNumber"),bankCode:N(e,"column3")||N(e,"bankCode"),variableSymbol:(t=N(e,"column5")||N(e,"variableSymbol"),(t?.replace(/\D/g,"")??"")||null),message:N(e,"column16")||N(e,"column25")||N(e,"message"),raw:e}}function s(e){let T=new Date;return T.setDate(T.getDate()-e),T.toISOString().slice(0,10)}function c(){return new Date().toISOString().slice(0,10)}async function _(e,T=s(30),t=c()){let E=`https://www.fio.cz/ib_api/rest/periods/${encodeURIComponent(e)}/${T}/${t}/transactions.json`,a=await fetch(E,{cache:"no-store"});if(!a.ok)throw Error(`Fio API vr\xe1tilo HTTP ${a.status}.`);let i=await a.json();return(i.accountStatement?.transactionList?.transaction??[]).map(L).filter(e=>!!e)}async function O(e,T){if(T.amount<=0||!T.variableSymbol)return null;let{rows:t}=await (0,i.IO)(`SELECT id, number
     FROM fak_invoices
     WHERE company_id = $1
       AND status IN ('sent', 'viewed', 'overdue')
       AND currency = $2
       AND ABS(total::numeric - $3::numeric) < 0.01
       AND (
         regexp_replace(COALESCE(variable_symbol, ''), '\\D', '', 'g') = $4
         OR regexp_replace(number, '\\D', '', 'g') = $4
       )`,[e,T.currency,T.amount,T.variableSymbol]);if(1!==t.length)return null;let E=t[0],n=Math.floor(Date.now()/1e3);return await (0,i.IO)("UPDATE fak_invoices SET status = 'paid', paid_at = $1, updated_at = $1 WHERE id = $2 AND company_id = $3",[n,E.id,e]),await (0,i.IO)(`INSERT INTO fak_audit_log (id, company_id, user_id, action, entity_type, entity_id, meta)
     VALUES ($1, $2, $3, 'invoice.paid_bank_match', 'invoice', $4, $5)`,[(0,a.randomUUID)(),e,"system",E.id,JSON.stringify({providerTransactionId:T.providerTransactionId,amount:T.amount,currency:T.currency,variableSymbol:T.variableSymbol})]),E.id}async function A(e){if("airbank"===e.provider)throw Error("Air Bank PSD2 vyžaduje registrovanou aplikaci, certifik\xe1ty a OAuth souhlas klienta. Provider je připraven\xfd, ale bez těchto \xfadajů nelze stahovat transakce.");if(!e.token_encrypted)throw Error("Bankovn\xed spojen\xed nem\xe1 uložen\xfd API token.");let T=function(e){let[T,t,E]=e.split(":");if(!T||!t||!E)throw Error("Neplatn\xfd form\xe1t bankovn\xedho tokenu.");let i=(0,a.createDecipheriv)("aes-256-gcm",o(),Buffer.from(T,"base64"));return i.setAuthTag(Buffer.from(t,"base64")),Buffer.concat([i.update(Buffer.from(E,"base64")),i.final()]).toString("utf8")}(e.token_encrypted),t=e.last_sync_at?new Date(1e3*e.last_sync_at-2592e5).toISOString().slice(0,10):s(30),E=await _(T,t,c()),n=0,r=0,N=e.last_transaction_id;for(let T of E){let t=await O(e.company_id,T);t&&(r+=1);let E=await (0,i.IO)(`INSERT INTO fak_bank_transactions
         (id, company_id, bank_connection_id, provider_transaction_id, booking_date, amount,
          currency, account_number, bank_code, variable_symbol, message, raw, matched_invoice_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       ON CONFLICT (bank_connection_id, provider_transaction_id) DO UPDATE SET
         matched_invoice_id = COALESCE(fak_bank_transactions.matched_invoice_id, EXCLUDED.matched_invoice_id)
       RETURNING (xmax = 0) AS inserted`,[(0,a.randomUUID)(),e.company_id,e.id,T.providerTransactionId,T.bookingDate,T.amount,T.currency,T.accountNumber,T.bankCode,T.variableSymbol,T.message,JSON.stringify(T.raw),t]);E.rows[0]?.inserted&&(n+=1),N=T.providerTransactionId}return await (0,i.IO)("UPDATE fak_bank_connections SET last_sync_at = $1, last_transaction_id = $2, updated_at = $1 WHERE id = $3",[Math.floor(Date.now()/1e3),N,e.id]),{fetched:E.length,inserted:n,matched:r}}i=(n.then?(await n)():n)[0],E()}catch(e){E(e)}})},98040:(e,T,t)=>{t.a(e,async(e,E)=>{try{t.d(T,{Dv:()=>o,IO:()=>n});var a=t(8678),i=e([a]);let r=new(a=(i.then?(await i)():i)[0]).Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:!1},max:3,idleTimeoutMillis:1e4,connectionTimeoutMillis:15e3});async function n(e,T){try{return await r.query(e,T)}catch(t){if(t?.code==="57P01"||/terminating|connection|ECONNRESET|timeout/i.test(t?.message||""))return await new Promise(e=>setTimeout(e,500)),await r.query(e,T);throw t}}async function o(){await r.query(`
    -- Users
    CREATE TABLE IF NOT EXISTS fak_users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
    );

    -- Sessions
    CREATE TABLE IF NOT EXISTS fak_sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES fak_users(id) ON DELETE CASCADE,
      expires_at BIGINT NOT NULL
    );

    -- Subscriptions
    CREATE TABLE IF NOT EXISTS fak_subscriptions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES fak_users(id) ON DELETE CASCADE,
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      stripe_price_id TEXT,
      plan TEXT NOT NULL DEFAULT 'free',
      status TEXT NOT NULL DEFAULT 'active',
      cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
      current_period_start BIGINT,
      current_period_end BIGINT,
      created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
      updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
    );
    ALTER TABLE fak_subscriptions ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;
    ALTER TABLE fak_subscriptions ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN NOT NULL DEFAULT false;
    DO $$
    BEGIN
      IF to_regclass('public.fak_invoices') IS NOT NULL THEN
        ALTER TABLE fak_invoices ADD COLUMN IF NOT EXISTS note_before_items TEXT;
        ALTER TABLE fak_invoices ADD COLUMN IF NOT EXISTS footer_text TEXT;
        ALTER TABLE fak_invoices ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'bank';
        ALTER TABLE fak_invoices ADD COLUMN IF NOT EXISTS order_number TEXT;
      END IF;
    END $$;

    -- Companies
    CREATE TABLE IF NOT EXISTS fak_companies (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES fak_users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      ico TEXT,
      dic TEXT,
      address TEXT,
      city TEXT,
      zip TEXT,
      country TEXT NOT NULL DEFAULT 'CZ',
      bank_account TEXT,
      iban TEXT,
      swift TEXT,
      logo_url TEXT,
      vat_status TEXT NOT NULL DEFAULT 'non_vat',
      default_currency TEXT NOT NULL DEFAULT 'CZK',
      default_due_days INTEGER NOT NULL DEFAULT 14,
      invoice_prefix TEXT NOT NULL DEFAULT 'FA',
      invoice_next INTEGER NOT NULL DEFAULT 1,
      created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
    );
    ALTER TABLE fak_companies ADD COLUMN IF NOT EXISTS vat_status TEXT NOT NULL DEFAULT 'non_vat';
    ALTER TABLE fak_companies ADD COLUMN IF NOT EXISTS invoice_template TEXT NOT NULL DEFAULT 'modern';
    ALTER TABLE fak_companies ADD COLUMN IF NOT EXISTS invoice_color TEXT NOT NULL DEFAULT '#4f46e5';
    ALTER TABLE fak_companies ADD COLUMN IF NOT EXISTS invoice_footer TEXT;
    ALTER TABLE fak_companies ADD COLUMN IF NOT EXISTS invoice_note_before TEXT;
    ALTER TABLE fak_companies ADD COLUMN IF NOT EXISTS onboarded BOOLEAN NOT NULL DEFAULT false;
    ALTER TABLE fak_companies ADD COLUMN IF NOT EXISTS invoice_padding INTEGER NOT NULL DEFAULT 4;
    ALTER TABLE fak_companies ADD COLUMN IF NOT EXISTS features JSONB;

    -- Clients
    CREATE TABLE IF NOT EXISTS fak_clients (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL REFERENCES fak_companies(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      ico TEXT,
      dic TEXT,
      email TEXT,
      address TEXT,
      city TEXT,
      zip TEXT,
      country TEXT NOT NULL DEFAULT 'CZ',
      archived BOOLEAN NOT NULL DEFAULT false,
      created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
    );

    -- Invoices
    CREATE TABLE IF NOT EXISTS fak_invoices (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL REFERENCES fak_companies(id) ON DELETE CASCADE,
      client_id TEXT REFERENCES fak_clients(id),
      number TEXT NOT NULL,
      variable_symbol TEXT,
      type TEXT NOT NULL DEFAULT 'invoice',
      status TEXT NOT NULL DEFAULT 'draft',
      currency TEXT NOT NULL DEFAULT 'CZK',
      issue_date TEXT NOT NULL,
      due_date TEXT NOT NULL,
      taxable_date TEXT,
      subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
      vat_total NUMERIC(12,2) NOT NULL DEFAULT 0,
      total NUMERIC(12,2) NOT NULL DEFAULT 0,
      note TEXT,
      note_before_items TEXT,
      footer_text TEXT,
      payment_method TEXT NOT NULL DEFAULT 'bank',
      order_number TEXT,
      public_token TEXT UNIQUE,
      viewed_at BIGINT,
      paid_at BIGINT,
      sent_at BIGINT,
      created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
      updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
    );

    -- Invoice Items
    CREATE TABLE IF NOT EXISTS fak_invoice_items (
      id TEXT PRIMARY KEY,
      invoice_id TEXT NOT NULL REFERENCES fak_invoices(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      quantity NUMERIC(12,4) NOT NULL DEFAULT 1,
      unit TEXT,
      unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
      vat_rate INTEGER NOT NULL DEFAULT 0,
      total_without_vat NUMERIC(12,2) NOT NULL DEFAULT 0,
      total_vat NUMERIC(12,2) NOT NULL DEFAULT 0,
      total_with_vat NUMERIC(12,2) NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    -- Reminder Settings
    CREATE TABLE IF NOT EXISTS fak_reminder_settings (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL UNIQUE REFERENCES fak_companies(id) ON DELETE CASCADE,
      before_due_enabled BOOLEAN NOT NULL DEFAULT true,
      due_day_enabled BOOLEAN NOT NULL DEFAULT true,
      after_3_days_enabled BOOLEAN NOT NULL DEFAULT true,
      after_10_days_enabled BOOLEAN NOT NULL DEFAULT true,
      after_20_days_enabled BOOLEAN NOT NULL DEFAULT false,
      email_template_before_due TEXT NOT NULL DEFAULT 'Dobr\xfd den,

chtěli jsme v\xe1s upozornit, že faktura č. {{number}} je splatn\xe1 za 3 dny ({{dueDate}}).

Celkov\xe1 č\xe1stka: {{total}} {{currency}}

Děkujeme za včasnou platbu.',
      email_template_due_day TEXT NOT NULL DEFAULT 'Dobr\xfd den,

dnes je posledn\xed den splatnosti faktury č. {{number}}.

Celkov\xe1 č\xe1stka: {{total}} {{currency}}

Pros\xedme o uhrazen\xed faktury.',
      email_template_after_due TEXT NOT NULL DEFAULT 'Dobr\xfd den,

dovolujeme si upozornit, že faktura č. {{number}} je po splatnosti.

Celkov\xe1 č\xe1stka: {{total}} {{currency}}

Pros\xedme o neprodlen\xe9 uhrazen\xed faktury.'
    );

    -- Reminder Log
    CREATE TABLE IF NOT EXISTS fak_reminder_log (
      id TEXT PRIMARY KEY,
      invoice_id TEXT NOT NULL REFERENCES fak_invoices(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      sent_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
      status TEXT NOT NULL DEFAULT 'sent'
    );

    CREATE TABLE IF NOT EXISTS fak_email_log (
      id TEXT PRIMARY KEY,
      company_id TEXT REFERENCES fak_companies(id) ON DELETE CASCADE,
      invoice_id TEXT REFERENCES fak_invoices(id) ON DELETE SET NULL,
      quote_id TEXT,
      type TEXT NOT NULL,
      recipient TEXT NOT NULL,
      subject TEXT,
      status TEXT NOT NULL,
      provider TEXT NOT NULL DEFAULT 'resend',
      provider_message_id TEXT,
      error TEXT,
      created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
    );
    CREATE INDEX IF NOT EXISTS fak_email_log_company_idx ON fak_email_log(company_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS fak_automation_runs (
      id TEXT PRIMARY KEY,
      company_id TEXT REFERENCES fak_companies(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      started_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
      finished_at BIGINT,
      summary JSONB,
      error TEXT
    );
    CREATE INDEX IF NOT EXISTS fak_automation_runs_type_idx ON fak_automation_runs(type, started_at DESC);

    -- Recurring Invoices
    CREATE TABLE IF NOT EXISTS fak_recurring_invoices (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL REFERENCES fak_companies(id) ON DELETE CASCADE,
      client_id TEXT REFERENCES fak_clients(id),
      name TEXT NOT NULL,
      start_date TEXT NOT NULL,
      next_issue_date TEXT,
      end_date TEXT,
      period TEXT NOT NULL DEFAULT 'monthly',
      active BOOLEAN NOT NULL DEFAULT true,
      send_by_email BOOLEAN NOT NULL DEFAULT false,
      as_proforma BOOLEAN NOT NULL DEFAULT false,
      due_days INTEGER NOT NULL DEFAULT 14,
      currency TEXT NOT NULL DEFAULT 'CZK',
      note TEXT,
      created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
    );

    CREATE TABLE IF NOT EXISTS fak_recurring_invoice_items (
      id TEXT PRIMARY KEY,
      recurring_invoice_id TEXT NOT NULL REFERENCES fak_recurring_invoices(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      quantity NUMERIC(12,4) NOT NULL DEFAULT 1,
      unit TEXT,
      unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
      vat_rate INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    -- Audit Log
    CREATE TABLE IF NOT EXISTS fak_audit_log (
      id TEXT PRIMARY KEY,
      company_id TEXT,
      user_id TEXT NOT NULL,
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id TEXT,
      meta JSONB,
      created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
    );

    -- Bank Accounts (multiple per company)
    CREATE TABLE IF NOT EXISTS fak_bank_accounts (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL REFERENCES fak_companies(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      bank_account TEXT,
      iban TEXT,
      swift TEXT,
      currency TEXT NOT NULL DEFAULT 'CZK',
      is_default BOOLEAN NOT NULL DEFAULT false,
      created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
    );

    -- Bank API connections and imported movements
    CREATE TABLE IF NOT EXISTS fak_bank_connections (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL REFERENCES fak_companies(id) ON DELETE CASCADE,
      bank_account_id TEXT NOT NULL REFERENCES fak_bank_accounts(id) ON DELETE CASCADE,
      provider TEXT NOT NULL,
      name TEXT NOT NULL,
      token_encrypted TEXT,
      last_transaction_id TEXT,
      last_sync_at BIGINT,
      active BOOLEAN NOT NULL DEFAULT true,
      created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
      updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
    );

    CREATE TABLE IF NOT EXISTS fak_bank_transactions (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL REFERENCES fak_companies(id) ON DELETE CASCADE,
      bank_connection_id TEXT NOT NULL REFERENCES fak_bank_connections(id) ON DELETE CASCADE,
      provider_transaction_id TEXT NOT NULL,
      booking_date TEXT,
      amount NUMERIC(12,2) NOT NULL,
      currency TEXT NOT NULL DEFAULT 'CZK',
      account_number TEXT,
      bank_code TEXT,
      variable_symbol TEXT,
      message TEXT,
      raw JSONB,
      matched_invoice_id TEXT REFERENCES fak_invoices(id),
      created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
      UNIQUE(bank_connection_id, provider_transaction_id)
    );
    CREATE INDEX IF NOT EXISTS fak_bank_transactions_company_idx ON fak_bank_transactions(company_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS fak_bank_transactions_vs_idx ON fak_bank_transactions(company_id, variable_symbol);

    -- Tags
    CREATE TABLE IF NOT EXISTS fak_tags (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL REFERENCES fak_companies(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '#4f46e5',
      UNIQUE(company_id, name)
    );

    -- Invoice Tags (junction)
    CREATE TABLE IF NOT EXISTS fak_invoice_tags (
      invoice_id TEXT NOT NULL REFERENCES fak_invoices(id) ON DELETE CASCADE,
      tag_id TEXT NOT NULL REFERENCES fak_tags(id) ON DELETE CASCADE,
      PRIMARY KEY (invoice_id, tag_id)
    );

    -- Expenses (N\xe1klady)
    CREATE TABLE IF NOT EXISTS fak_expenses (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL REFERENCES fak_companies(id) ON DELETE CASCADE,
      supplier_name TEXT,
      supplier_ico TEXT,
      number TEXT,
      variable_symbol TEXT,
      currency TEXT NOT NULL DEFAULT 'CZK',
      issue_date TEXT NOT NULL,
      due_date TEXT NOT NULL,
      taxable_date TEXT,
      subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
      vat_total NUMERIC(12,2) NOT NULL DEFAULT 0,
      total NUMERIC(12,2) NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'unpaid',
      payment_method TEXT NOT NULL DEFAULT 'bank',
      note TEXT,
      paid_at BIGINT,
      created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
      updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
    );

    -- Expense Items
    CREATE TABLE IF NOT EXISTS fak_expense_items (
      id TEXT PRIMARY KEY,
      expense_id TEXT NOT NULL REFERENCES fak_expenses(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      quantity NUMERIC(12,4) NOT NULL DEFAULT 1,
      unit TEXT,
      unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
      vat_rate INTEGER NOT NULL DEFAULT 0,
      total_without_vat NUMERIC(12,2) NOT NULL DEFAULT 0,
      total_vat NUMERIC(12,2) NOT NULL DEFAULT 0,
      total_with_vat NUMERIC(12,2) NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    -- Quotes (Nab\xeddky)
    CREATE TABLE IF NOT EXISTS fak_quotes (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL REFERENCES fak_companies(id) ON DELETE CASCADE,
      client_id TEXT REFERENCES fak_clients(id),
      number TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      currency TEXT NOT NULL DEFAULT 'CZK',
      issue_date TEXT NOT NULL,
      valid_until TEXT,
      language TEXT NOT NULL DEFAULT 'cs',
      note TEXT,
      note_before_items TEXT,
      footer_text TEXT,
      subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
      vat_total NUMERIC(12,2) NOT NULL DEFAULT 0,
      total NUMERIC(12,2) NOT NULL DEFAULT 0,
      converted_invoice_id TEXT REFERENCES fak_invoices(id),
      public_token TEXT UNIQUE,
      viewed_at BIGINT,
      created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
      updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
    );

    -- Quote Items
    CREATE TABLE IF NOT EXISTS fak_quote_items (
      id TEXT PRIMARY KEY,
      quote_id TEXT NOT NULL REFERENCES fak_quotes(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      quantity NUMERIC(12,4) NOT NULL DEFAULT 1,
      unit TEXT,
      unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
      vat_rate INTEGER NOT NULL DEFAULT 0,
      total_without_vat NUMERIC(12,2) NOT NULL DEFAULT 0,
      total_vat NUMERIC(12,2) NOT NULL DEFAULT 0,
      total_with_vat NUMERIC(12,2) NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    -- Invoice Templates (Šablony)
    CREATE TABLE IF NOT EXISTS fak_invoice_templates (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL REFERENCES fak_companies(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      client_id TEXT REFERENCES fak_clients(id),
      currency TEXT NOT NULL DEFAULT 'CZK',
      due_days INTEGER NOT NULL DEFAULT 14,
      language TEXT NOT NULL DEFAULT 'cs',
      note TEXT,
      note_before_items TEXT,
      footer_text TEXT,
      created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
    );

    CREATE TABLE IF NOT EXISTS fak_invoice_template_items (
      id TEXT PRIMARY KEY,
      template_id TEXT NOT NULL REFERENCES fak_invoice_templates(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      quantity NUMERIC(12,4) NOT NULL DEFAULT 1,
      unit TEXT,
      unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
      vat_rate INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    -- Notifications
    CREATE TABLE IF NOT EXISTS fak_notifications (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL REFERENCES fak_companies(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT,
      entity_type TEXT,
      entity_id TEXT,
      resolved BOOLEAN NOT NULL DEFAULT false,
      created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
    );

    -- Invoice Attachments
    CREATE TABLE IF NOT EXISTS fak_invoice_attachments (
      id TEXT PRIMARY KEY,
      invoice_id TEXT NOT NULL REFERENCES fak_invoices(id) ON DELETE CASCADE,
      filename TEXT NOT NULL,
      file_url TEXT NOT NULL,
      file_size INTEGER,
      mime_type TEXT,
      created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
    );

    -- New company columns
    ALTER TABLE fak_companies ADD COLUMN IF NOT EXISTS invoice_number_year_format TEXT NOT NULL DEFAULT 'full';
    ALTER TABLE fak_companies ADD COLUMN IF NOT EXISTS invoice_number_month BOOLEAN NOT NULL DEFAULT false;
    ALTER TABLE fak_companies ADD COLUMN IF NOT EXISTS invoice_number_position TEXT NOT NULL DEFAULT 'end';
    ALTER TABLE fak_companies ADD COLUMN IF NOT EXISTS invoice_number_volume INTEGER NOT NULL DEFAULT 10000;
    ALTER TABLE fak_companies ADD COLUMN IF NOT EXISTS invoice_number_separator TEXT NOT NULL DEFAULT '-';
    ALTER TABLE fak_companies ADD COLUMN IF NOT EXISTS invoice_spacing TEXT NOT NULL DEFAULT 'spacious';
    ALTER TABLE fak_companies ADD COLUMN IF NOT EXISTS stamp_url TEXT;
    ALTER TABLE fak_companies ADD COLUMN IF NOT EXISTS default_language TEXT NOT NULL DEFAULT 'cs';
    ALTER TABLE fak_companies ADD COLUMN IF NOT EXISTS show_qr_payment BOOLEAN NOT NULL DEFAULT true;

    -- New invoice columns
    ALTER TABLE fak_invoices ADD COLUMN IF NOT EXISTS note_before_items TEXT;
    ALTER TABLE fak_invoices ADD COLUMN IF NOT EXISTS footer_text TEXT;
    ALTER TABLE fak_invoices ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'bank';
    ALTER TABLE fak_invoices ADD COLUMN IF NOT EXISTS order_number TEXT;
    ALTER TABLE fak_invoices ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'cs';
    ALTER TABLE fak_invoices ADD COLUMN IF NOT EXISTS reverse_charge BOOLEAN NOT NULL DEFAULT false;
    ALTER TABLE fak_invoices ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(12,2);
    ALTER TABLE fak_invoices ADD COLUMN IF NOT EXISTS discount_pct NUMERIC(5,2);
    ALTER TABLE fak_invoices ADD COLUMN IF NOT EXISTS show_already_paid BOOLEAN NOT NULL DEFAULT false;
    ALTER TABLE fak_invoices ADD COLUMN IF NOT EXISTS invoice_template TEXT;
    ALTER TABLE fak_invoices ADD COLUMN IF NOT EXISTS invoice_color TEXT;
    ALTER TABLE fak_invoices ADD COLUMN IF NOT EXISTS bank_account_id TEXT REFERENCES fak_bank_accounts(id);
    ALTER TABLE fak_invoices ADD COLUMN IF NOT EXISTS show_iban TEXT NOT NULL DEFAULT 'auto';

    -- Quote tags junction
    CREATE TABLE IF NOT EXISTS fak_quote_tags (
      quote_id TEXT NOT NULL REFERENCES fak_quotes(id) ON DELETE CASCADE,
      tag_id TEXT NOT NULL REFERENCES fak_tags(id) ON DELETE CASCADE,
      PRIMARY KEY (quote_id, tag_id)
    );
  `)}E()}catch(e){E(e)}})}};var T=require("../../../../webpack-runtime.js");T.C(e);var t=e=>T(T.s=e),E=T.X(0,[6522,8247],()=>t(58855));module.exports=E})();