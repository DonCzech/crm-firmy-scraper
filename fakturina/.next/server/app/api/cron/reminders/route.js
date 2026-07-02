"use strict";(()=>{var e={};e.id=9050,e.ids=[9050],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},84770:e=>{e.exports=require("crypto")},8678:e=>{e.exports=import("pg")},52384:(e,t,T)=>{T.a(e,async(e,a)=>{try{T.r(t),T.d(t,{originalPathname:()=>_,patchFetch:()=>N,requestAsyncStorage:()=>L,routeModule:()=>s,serverHooks:()=>c,staticGenerationAsyncStorage:()=>d});var i=T(12085),E=T(31650),n=T(85980),r=T(56894),o=e([r]);r=(o.then?(await o)():o)[0];let s=new i.AppRouteRouteModule({definition:{kind:E.x.APP_ROUTE,page:"/api/cron/reminders/route",pathname:"/api/cron/reminders",filename:"route",bundlePath:"app/api/cron/reminders/route"},resolvedPagePath:"/Users/apple/DEV/CRM/fakturina/src/app/api/cron/reminders/route.ts",nextConfigOutput:"",userland:r}),{requestAsyncStorage:L,staticGenerationAsyncStorage:d,serverHooks:c}=s,_="/api/cron/reminders/route";function N(){return(0,n.patchFetch)({serverHooks:c,staticGenerationAsyncStorage:d})}a()}catch(e){a(e)}})},64737:e=>{var t=Object.defineProperty,T=Object.getOwnPropertyDescriptor,a=Object.getOwnPropertyNames,i=Object.prototype.hasOwnProperty,E={};function n(e){var t;let T=["path"in e&&e.path&&`Path=${e.path}`,"expires"in e&&(e.expires||0===e.expires)&&`Expires=${("number"==typeof e.expires?new Date(e.expires):e.expires).toUTCString()}`,"maxAge"in e&&"number"==typeof e.maxAge&&`Max-Age=${e.maxAge}`,"domain"in e&&e.domain&&`Domain=${e.domain}`,"secure"in e&&e.secure&&"Secure","httpOnly"in e&&e.httpOnly&&"HttpOnly","sameSite"in e&&e.sameSite&&`SameSite=${e.sameSite}`,"partitioned"in e&&e.partitioned&&"Partitioned","priority"in e&&e.priority&&`Priority=${e.priority}`].filter(Boolean),a=`${e.name}=${encodeURIComponent(null!=(t=e.value)?t:"")}`;return 0===T.length?a:`${a}; ${T.join("; ")}`}function r(e){let t=new Map;for(let T of e.split(/; */)){if(!T)continue;let e=T.indexOf("=");if(-1===e){t.set(T,"true");continue}let[a,i]=[T.slice(0,e),T.slice(e+1)];try{t.set(a,decodeURIComponent(null!=i?i:"true"))}catch{}}return t}function o(e){var t,T;if(!e)return;let[[a,i],...E]=r(e),{domain:n,expires:o,httponly:L,maxage:d,path:c,samesite:_,secure:l,partitioned:u,priority:O}=Object.fromEntries(E.map(([e,t])=>[e.toLowerCase(),t]));return function(e){let t={};for(let T in e)e[T]&&(t[T]=e[T]);return t}({name:a,value:decodeURIComponent(i),domain:n,...o&&{expires:new Date(o)},...L&&{httpOnly:!0},..."string"==typeof d&&{maxAge:Number(d)},path:c,..._&&{sameSite:N.includes(t=(t=_).toLowerCase())?t:void 0},...l&&{secure:!0},...O&&{priority:s.includes(T=(T=O).toLowerCase())?T:void 0},...u&&{partitioned:!0}})}((e,T)=>{for(var a in T)t(e,a,{get:T[a],enumerable:!0})})(E,{RequestCookies:()=>L,ResponseCookies:()=>d,parseCookie:()=>r,parseSetCookie:()=>o,stringifyCookie:()=>n}),e.exports=((e,E,n,r)=>{if(E&&"object"==typeof E||"function"==typeof E)for(let n of a(E))i.call(e,n)||void 0===n||t(e,n,{get:()=>E[n],enumerable:!(r=T(E,n))||r.enumerable});return e})(t({},"__esModule",{value:!0}),E);var N=["strict","lax","none"],s=["low","medium","high"],L=class{constructor(e){this._parsed=new Map,this._headers=e;let t=e.get("cookie");if(t)for(let[e,T]of r(t))this._parsed.set(e,{name:e,value:T})}[Symbol.iterator](){return this._parsed[Symbol.iterator]()}get size(){return this._parsed.size}get(...e){let t="string"==typeof e[0]?e[0]:e[0].name;return this._parsed.get(t)}getAll(...e){var t;let T=Array.from(this._parsed);if(!e.length)return T.map(([e,t])=>t);let a="string"==typeof e[0]?e[0]:null==(t=e[0])?void 0:t.name;return T.filter(([e])=>e===a).map(([e,t])=>t)}has(e){return this._parsed.has(e)}set(...e){let[t,T]=1===e.length?[e[0].name,e[0].value]:e,a=this._parsed;return a.set(t,{name:t,value:T}),this._headers.set("cookie",Array.from(a).map(([e,t])=>n(t)).join("; ")),this}delete(e){let t=this._parsed,T=Array.isArray(e)?e.map(e=>t.delete(e)):t.delete(e);return this._headers.set("cookie",Array.from(t).map(([e,t])=>n(t)).join("; ")),T}clear(){return this.delete(Array.from(this._parsed.keys())),this}[Symbol.for("edge-runtime.inspect.custom")](){return`RequestCookies ${JSON.stringify(Object.fromEntries(this._parsed))}`}toString(){return[...this._parsed.values()].map(e=>`${e.name}=${encodeURIComponent(e.value)}`).join("; ")}},d=class{constructor(e){var t,T,a;this._parsed=new Map,this._headers=e;let i=null!=(a=null!=(T=null==(t=e.getSetCookie)?void 0:t.call(e))?T:e.get("set-cookie"))?a:[];for(let e of Array.isArray(i)?i:function(e){if(!e)return[];var t,T,a,i,E,n=[],r=0;function o(){for(;r<e.length&&/\s/.test(e.charAt(r));)r+=1;return r<e.length}for(;r<e.length;){for(t=r,E=!1;o();)if(","===(T=e.charAt(r))){for(a=r,r+=1,o(),i=r;r<e.length&&"="!==(T=e.charAt(r))&&";"!==T&&","!==T;)r+=1;r<e.length&&"="===e.charAt(r)?(E=!0,r=i,n.push(e.substring(t,a)),t=r):r=a+1}else r+=1;(!E||r>=e.length)&&n.push(e.substring(t,e.length))}return n}(i)){let t=o(e);t&&this._parsed.set(t.name,t)}}get(...e){let t="string"==typeof e[0]?e[0]:e[0].name;return this._parsed.get(t)}getAll(...e){var t;let T=Array.from(this._parsed.values());if(!e.length)return T;let a="string"==typeof e[0]?e[0]:null==(t=e[0])?void 0:t.name;return T.filter(e=>e.name===a)}has(e){return this._parsed.has(e)}set(...e){let[t,T,a]=1===e.length?[e[0].name,e[0].value,e[0]]:e,i=this._parsed;return i.set(t,function(e={name:"",value:""}){return"number"==typeof e.expires&&(e.expires=new Date(e.expires)),e.maxAge&&(e.expires=new Date(Date.now()+1e3*e.maxAge)),(null===e.path||void 0===e.path)&&(e.path="/"),e}({name:t,value:T,...a})),function(e,t){for(let[,T]of(t.delete("set-cookie"),e)){let e=n(T);t.append("set-cookie",e)}}(i,this._headers),this}delete(...e){let[t,T,a]="string"==typeof e[0]?[e[0]]:[e[0].name,e[0].path,e[0].domain];return this.set({name:t,path:T,domain:a,value:"",expires:new Date(0)})}[Symbol.for("edge-runtime.inspect.custom")](){return`ResponseCookies ${JSON.stringify(Object.fromEntries(this._parsed))}`}toString(){return[...this._parsed.values()].map(n).join("; ")}}},36419:(e,t,T)=>{Object.defineProperty(t,"__esModule",{value:!0}),function(e,t){for(var T in t)Object.defineProperty(e,T,{enumerable:!0,get:t[T]})}(t,{RequestCookies:function(){return a.RequestCookies},ResponseCookies:function(){return a.ResponseCookies},stringifyCookie:function(){return a.stringifyCookie}});let a=T(64737)},56894:(e,t,T)=>{T.a(e,async(e,a)=>{try{T.r(t),T.d(t,{GET:()=>s,dynamic:()=>L});var i=T(30627),E=T(84770),n=T(98040),r=T(85301),o=T(96641),N=e([n,o]);[n,o]=N.then?(await N)():N;let L="force-dynamic",d=[{type:"before_due",daysOffset:-3,settingKey:"before_due_enabled"},{type:"due_day",daysOffset:0,settingKey:"due_day_enabled"},{type:"after_3",daysOffset:3,settingKey:"after_3_days_enabled"},{type:"after_10",daysOffset:10,settingKey:"after_10_days_enabled"},{type:"after_20",daysOffset:20,settingKey:"after_20_days_enabled"}];async function s(e){let t=e.headers.get("authorization"),T=process.env.CRON_SECRET;if(T&&t!==`Bearer ${T}`)return i.NextResponse.json({error:"Unauthorized"},{status:401});await (0,n.Dv)();let a=function(){let e=new Date;return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}(),N="1"===e.nextUrl.searchParams.get("dryRun"),s=[],L=(0,E.randomUUID)(),c=Math.floor(Date.now()/1e3);await (0,n.IO)(`INSERT INTO fak_automation_runs (id, type, status, started_at, summary)
     VALUES ($1, 'reminders', $2, $3, $4)`,[L,N?"dry_run":"running",c,JSON.stringify({date:a,dryRun:N})]);let{rows:_}=await (0,n.IO)(`SELECT
       i.id, i.number, i.due_date, i.total, i.currency, i.public_token, i.company_id,
       co.vat_status,
       cl.name as client_name, cl.email as client_email,
       co.name as supplier_name
     FROM fak_invoices i
     JOIN fak_companies co ON co.id = i.company_id
     LEFT JOIN fak_clients cl ON cl.id = i.client_id
     WHERE i.status IN ('sent', 'viewed', 'overdue')
       AND i.due_date IS NOT NULL
       AND cl.email IS NOT NULL
       AND cl.email != ''`,[]);for(let e of _){let{rows:t}=await (0,n.IO)("SELECT * FROM fak_reminder_settings WHERE company_id = $1",[e.company_id]),T=t[0];if(!T)continue;let i=T.email_template_before_due,L=T.email_template_due_day,c=T.email_template_after_due;for(let t of d){if(!T[t.settingKey]||function(e,t){let[T,a,i]=e.split("-").map(Number),E=new Date(Date.UTC(T,a-1,i));return E.setUTCDate(E.getUTCDate()+t),E.toISOString().slice(0,10)}(e.due_date,t.daysOffset)!==a)continue;let{rows:d}=await (0,n.IO)("SELECT id FROM fak_reminder_log WHERE invoice_id = $1 AND type = $2",[e.id,t.type]);if(d.length>0)continue;let _=c;t.daysOffset<0?_=i:0===t.daysOffset&&(_=L);let l=t.daysOffset>0?t.daysOffset:void 0;try{if(N){s.push({invoiceId:e.id,type:t.type,status:"dry_run"});continue}let T={to:e.client_email,clientName:e.client_name??"Z\xe1kazn\xedk",invoiceNumber:e.number,total:parseFloat(e.total),currency:e.currency??"CZK",dueDate:e.due_date,publicToken:e.public_token,supplierName:e.supplier_name,template:_,daysOverdue:l},a=await (0,r.cC)(T);await (0,o.t)({companyId:e.company_id,invoiceId:e.id,type:"reminder",recipient:e.client_email,subject:(0,r.FT)(T),status:"sent",providerMessageId:a}),await (0,n.IO)(`INSERT INTO fak_reminder_log (id, invoice_id, type, sent_at, status)
           VALUES ($1, $2, $3, $4, 'sent')`,[(0,E.randomUUID)(),e.id,t.type,Math.floor(Date.now()/1e3)]),s.push({invoiceId:e.id,type:t.type,status:"sent"})}catch(T){console.error(`Reminder failed for invoice ${e.id} type ${t.type}:`,T),await (0,o.t)({companyId:e.company_id,invoiceId:e.id,type:"reminder",recipient:e.client_email,subject:`Upom\xednka faktury ${e.number}`,status:"error",error:T instanceof Error?T.message:"Odesl\xe1n\xed upom\xednky selhalo"}),s.push({invoiceId:e.id,type:t.type,status:"error"})}}}return await (0,n.IO)(`UPDATE fak_automation_runs
     SET status = $1, finished_at = $2, summary = $3
     WHERE id = $4`,[N?"dry_run":s.some(e=>"error"===e.status)?"partial_error":"success",Math.floor(Date.now()/1e3),JSON.stringify({date:a,dryRun:N,processed:s.length,results:s}),L]),i.NextResponse.json({ok:!0,dryRun:N,date:a,processed:s.length,results:s})}a()}catch(e){a(e)}})},98040:(e,t,T)=>{T.a(e,async(e,a)=>{try{T.d(t,{Dv:()=>r,IO:()=>n});var i=T(8678),E=e([i]);let o=new(i=(E.then?(await E)():E)[0]).Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:!1},max:3,idleTimeoutMillis:1e4,connectionTimeoutMillis:15e3});async function n(e,t){try{return await o.query(e,t)}catch(T){if(T?.code==="57P01"||/terminating|connection|ECONNRESET|timeout/i.test(T?.message||""))return await new Promise(e=>setTimeout(e,500)),await o.query(e,t);throw T}}async function r(){await o.query(`
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
  `)}a()}catch(e){a(e)}})},96641:(e,t,T)=>{T.a(e,async(e,a)=>{try{T.d(t,{t:()=>r});var i=T(84770),E=T(98040),n=e([E]);async function r(e){try{await (0,E.IO)(`INSERT INTO fak_email_log
         (id, company_id, invoice_id, quote_id, type, recipient, subject, status,
          provider, provider_message_id, error)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'resend',$9,$10)`,[(0,i.randomUUID)(),e.companyId??null,e.invoiceId??null,e.quoteId??null,e.type,e.recipient,e.subject??null,e.status,e.providerMessageId??null,e.error??null])}catch{}}E=(n.then?(await n)():n)[0],a()}catch(e){a(e)}})},85301:(e,t,T)=>{T.d(t,{Bd:()=>_,FT:()=>c,WV:()=>d,cC:()=>u,yV:()=>L,yt:()=>l});var a=T(60166);let i=process.env.EMAIL_FROM??"Fakturina <noreply@fakturina.cz>",E="http://localhost:3020";function n(e,t="CZK"){return new Intl.NumberFormat("cs-CZ",{style:"currency",currency:t,minimumFractionDigits:2}).format(e)}function r(e,t){return`<!DOCTYPE html><html lang="cs">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:580px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)">
    <div style="background:#4f46e5;padding:24px 32px;display:flex;align-items:center;gap:10px">
      <span style="font-size:20px;font-weight:800;color:#fff;letter-spacing:-0.5px">Fakturina</span>
    </div>
    <div style="padding:32px">
      <h1 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#1e293b">${e}</h1>
      ${t}
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0">
      <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center">
        Tento e-mail byl automaticky vygenerov\xe1n syst\xe9mem <a href="${E}" style="color:#6366f1;text-decoration:none">Fakturina.cz</a>.
        Pro spr\xe1vu upom\xednek se přihlaste do sv\xe9ho \xfačtu.
      </p>
    </div>
  </div>
</body></html>`}function o(e,t){let T=`${E}/invoice/${e}`;return`<div style="text-align:center;margin:24px 0">
    <a href="${T}" style="display:inline-block;padding:13px 32px;background:#4f46e5;color:#fff;font-weight:700;border-radius:8px;text-decoration:none;font-size:15px">${t}</a>
  </div>
  <p style="text-align:center;font-size:12px;color:#94a3b8;margin-top:-12px">
    Nebo zkop\xedrujte odkaz: <a href="${T}" style="color:#6366f1">${T}</a>
  </p>`}function N(e){let t=e.map(({label:e,value:t})=>`<tr>
      <td style="padding:8px 14px;font-size:13px;color:#64748b;border-bottom:1px solid #f1f5f9">${e}</td>
      <td style="padding:8px 14px;font-size:13px;font-weight:600;color:#1e293b;text-align:right;border-bottom:1px solid #f1f5f9">${t}</td>
    </tr>`).join("");return`<table style="width:100%;border-collapse:collapse;background:#f8fafc;border-radius:8px;overflow:hidden;margin:20px 0">${t}</table>`}async function s(e){let t=await (function(){if(!process.env.RESEND_API_KEY)throw Error("RESEND_API_KEY nen\xed nastaven.");return new a.R(process.env.RESEND_API_KEY)})().emails.send(e);if("error"in t&&t.error)throw Error("object"==typeof t.error&&"message"in t.error?String(t.error.message):"Resend odesl\xe1n\xed selhalo.");return"data"in t&&t.data&&"id"in t.data?String(t.data.id):null}function L(e){return`Faktura č. ${e.invoiceNumber} od ${e.supplierName}`}function d(e){return`Nab\xeddka č. ${e.quoteNumber} od ${e.supplierName}`}function c(e){return(e.daysOverdue??0)>0?`Upom\xednka: Faktura č. ${e.invoiceNumber} je po splatnosti ${e.daysOverdue} dn\xed`:`Připom\xednka splatnosti faktury č. ${e.invoiceNumber}`}async function _(e){let t=`
    <p style="margin:0 0 14px;font-size:14px;color:#334155;line-height:1.65">
      Dobr\xfd den, ${e.clientName},<br><br>
      zas\xedl\xe1me V\xe1m fakturu č. <strong>${e.invoiceNumber}</strong> od ${e.supplierName}.
    </p>
    ${e.note?`<p style="margin:0 0 14px;font-size:14px;color:#334155;line-height:1.65">${e.note}</p>`:""}
    ${N([{label:"Č\xedslo faktury",value:e.invoiceNumber},{label:"Č\xe1stka k \xfahradě",value:n(e.total,e.currency)},{label:"Datum splatnosti",value:e.dueDate}])}
    ${o(e.publicToken,"Zobrazit fakturu online")}
  `,T=e.pdfBuffer?[{filename:`faktura-${e.invoiceNumber}.pdf`,content:e.pdfBuffer}]:void 0;return s({from:i,to:e.to,subject:L(e),html:r(`Faktura č. ${e.invoiceNumber}`,t),attachments:T})}async function l(e){var t;let T=`
    <p style="margin:0 0 14px;font-size:14px;color:#334155;line-height:1.65">
      Dobr\xfd den, ${e.clientName},<br><br>
      zas\xedl\xe1me V\xe1m cenovou nab\xeddku č. <strong>${e.quoteNumber}</strong> od ${e.supplierName}.
    </p>
    ${e.note?`<p style="margin:0 0 14px;font-size:14px;color:#334155;line-height:1.65">${e.note}</p>`:""}
    ${N([{label:"Č\xedslo nab\xeddky",value:e.quoteNumber},{label:"Celkov\xe1 cena",value:n(e.total,e.currency)},...e.validUntil?[{label:"Platnost do",value:e.validUntil}]:[]])}
    ${(t=`${E}/quote/${e.publicToken}`,`<div style="text-align:center;margin:24px 0">
    <a href="${t}" style="display:inline-block;padding:13px 32px;background:#4f46e5;color:#fff;font-weight:700;border-radius:8px;text-decoration:none;font-size:15px">Zobrazit nab\xeddku online</a>
  </div>
  <p style="text-align:center;font-size:12px;color:#94a3b8;margin-top:-12px">
    Nebo zkop\xedrujte odkaz: <a href="${t}" style="color:#6366f1">${t}</a>
  </p>`)}
  `,a=e.pdfBuffer?[{filename:`nabidka-${e.quoteNumber}.pdf`,content:e.pdfBuffer}]:void 0;return s({from:i,to:e.to,subject:d(e),html:r(`Nab\xeddka č. ${e.quoteNumber}`,T),attachments:a})}async function u(e){var t;let T={number:e.invoiceNumber,total:n(e.total,e.currency),dueDate:e.dueDate,clientName:e.clientName,supplierName:e.supplierName,daysOverdue:String(e.daysOverdue??0)},a=(t=e.template,Object.entries(T).reduce((e,[t,T])=>e.replaceAll(`{{${t}}}`,T),t)).split("\n\n").map(e=>`<p style="margin:0 0 14px;font-size:14px;color:#334155;line-height:1.65">${e.replace(/\n/g,"<br>")}</p>`).join(""),E=(e.daysOverdue??0)>0,L=c(e),d=E?`⚠ Faktura po splatnosti`:`Připom\xednka platby`,_=`
    ${a}
    ${N([{label:"Č\xedslo faktury",value:e.invoiceNumber},{label:"Č\xe1stka k \xfahradě",value:n(e.total,e.currency)},{label:"Datum splatnosti",value:e.dueDate},...E?[{label:"Dn\xed po splatnosti",value:`<span style="color:${E?"#dc2626":"#4f46e5"};font-weight:700">${e.daysOverdue}</span>`}]:[]])}
    ${o(e.publicToken,E?"Zobrazit fakturu a zaplatit":"Zobrazit fakturu")}
  `;return s({from:i,to:e.to,subject:L,html:r(d,_)})}}};var t=require("../../../../webpack-runtime.js");t.C(e);var T=e=>t(t.s=e),a=t.X(0,[6522,8247,166],()=>T(52384));module.exports=a})();