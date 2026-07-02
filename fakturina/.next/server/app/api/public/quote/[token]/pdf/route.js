"use strict";(()=>{var e={};e.id=4419,e.ids=[4419],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},8678:e=>{e.exports=import("pg")},77250:e=>{e.exports=import("puppeteer-core")},77973:(e,t,T)=>{T.a(e,async(e,a)=>{try{T.r(t),T.d(t,{originalPathname:()=>_,patchFetch:()=>s,requestAsyncStorage:()=>L,routeModule:()=>N,serverHooks:()=>d,staticGenerationAsyncStorage:()=>c});var i=T(12085),E=T(31650),n=T(85980),o=T(81155),r=e([o]);o=(r.then?(await r)():r)[0];let N=new i.AppRouteRouteModule({definition:{kind:E.x.APP_ROUTE,page:"/api/public/quote/[token]/pdf/route",pathname:"/api/public/quote/[token]/pdf",filename:"route",bundlePath:"app/api/public/quote/[token]/pdf/route"},resolvedPagePath:"/Users/apple/DEV/CRM/fakturina/src/app/api/public/quote/[token]/pdf/route.ts",nextConfigOutput:"",userland:o}),{requestAsyncStorage:L,staticGenerationAsyncStorage:c,serverHooks:d}=N,_="/api/public/quote/[token]/pdf/route";function s(){return(0,n.patchFetch)({serverHooks:d,staticGenerationAsyncStorage:c})}a()}catch(e){a(e)}})},64737:e=>{var t=Object.defineProperty,T=Object.getOwnPropertyDescriptor,a=Object.getOwnPropertyNames,i=Object.prototype.hasOwnProperty,E={};function n(e){var t;let T=["path"in e&&e.path&&`Path=${e.path}`,"expires"in e&&(e.expires||0===e.expires)&&`Expires=${("number"==typeof e.expires?new Date(e.expires):e.expires).toUTCString()}`,"maxAge"in e&&"number"==typeof e.maxAge&&`Max-Age=${e.maxAge}`,"domain"in e&&e.domain&&`Domain=${e.domain}`,"secure"in e&&e.secure&&"Secure","httpOnly"in e&&e.httpOnly&&"HttpOnly","sameSite"in e&&e.sameSite&&`SameSite=${e.sameSite}`,"partitioned"in e&&e.partitioned&&"Partitioned","priority"in e&&e.priority&&`Priority=${e.priority}`].filter(Boolean),a=`${e.name}=${encodeURIComponent(null!=(t=e.value)?t:"")}`;return 0===T.length?a:`${a}; ${T.join("; ")}`}function o(e){let t=new Map;for(let T of e.split(/; */)){if(!T)continue;let e=T.indexOf("=");if(-1===e){t.set(T,"true");continue}let[a,i]=[T.slice(0,e),T.slice(e+1)];try{t.set(a,decodeURIComponent(null!=i?i:"true"))}catch{}}return t}function r(e){var t,T;if(!e)return;let[[a,i],...E]=o(e),{domain:n,expires:r,httponly:L,maxage:c,path:d,samesite:_,secure:l,partitioned:p,priority:O}=Object.fromEntries(E.map(([e,t])=>[e.toLowerCase(),t]));return function(e){let t={};for(let T in e)e[T]&&(t[T]=e[T]);return t}({name:a,value:decodeURIComponent(i),domain:n,...r&&{expires:new Date(r)},...L&&{httpOnly:!0},..."string"==typeof c&&{maxAge:Number(c)},path:d,..._&&{sameSite:s.includes(t=(t=_).toLowerCase())?t:void 0},...l&&{secure:!0},...O&&{priority:N.includes(T=(T=O).toLowerCase())?T:void 0},...p&&{partitioned:!0}})}((e,T)=>{for(var a in T)t(e,a,{get:T[a],enumerable:!0})})(E,{RequestCookies:()=>L,ResponseCookies:()=>c,parseCookie:()=>o,parseSetCookie:()=>r,stringifyCookie:()=>n}),e.exports=((e,E,n,o)=>{if(E&&"object"==typeof E||"function"==typeof E)for(let n of a(E))i.call(e,n)||void 0===n||t(e,n,{get:()=>E[n],enumerable:!(o=T(E,n))||o.enumerable});return e})(t({},"__esModule",{value:!0}),E);var s=["strict","lax","none"],N=["low","medium","high"],L=class{constructor(e){this._parsed=new Map,this._headers=e;let t=e.get("cookie");if(t)for(let[e,T]of o(t))this._parsed.set(e,{name:e,value:T})}[Symbol.iterator](){return this._parsed[Symbol.iterator]()}get size(){return this._parsed.size}get(...e){let t="string"==typeof e[0]?e[0]:e[0].name;return this._parsed.get(t)}getAll(...e){var t;let T=Array.from(this._parsed);if(!e.length)return T.map(([e,t])=>t);let a="string"==typeof e[0]?e[0]:null==(t=e[0])?void 0:t.name;return T.filter(([e])=>e===a).map(([e,t])=>t)}has(e){return this._parsed.has(e)}set(...e){let[t,T]=1===e.length?[e[0].name,e[0].value]:e,a=this._parsed;return a.set(t,{name:t,value:T}),this._headers.set("cookie",Array.from(a).map(([e,t])=>n(t)).join("; ")),this}delete(e){let t=this._parsed,T=Array.isArray(e)?e.map(e=>t.delete(e)):t.delete(e);return this._headers.set("cookie",Array.from(t).map(([e,t])=>n(t)).join("; ")),T}clear(){return this.delete(Array.from(this._parsed.keys())),this}[Symbol.for("edge-runtime.inspect.custom")](){return`RequestCookies ${JSON.stringify(Object.fromEntries(this._parsed))}`}toString(){return[...this._parsed.values()].map(e=>`${e.name}=${encodeURIComponent(e.value)}`).join("; ")}},c=class{constructor(e){var t,T,a;this._parsed=new Map,this._headers=e;let i=null!=(a=null!=(T=null==(t=e.getSetCookie)?void 0:t.call(e))?T:e.get("set-cookie"))?a:[];for(let e of Array.isArray(i)?i:function(e){if(!e)return[];var t,T,a,i,E,n=[],o=0;function r(){for(;o<e.length&&/\s/.test(e.charAt(o));)o+=1;return o<e.length}for(;o<e.length;){for(t=o,E=!1;r();)if(","===(T=e.charAt(o))){for(a=o,o+=1,r(),i=o;o<e.length&&"="!==(T=e.charAt(o))&&";"!==T&&","!==T;)o+=1;o<e.length&&"="===e.charAt(o)?(E=!0,o=i,n.push(e.substring(t,a)),t=o):o=a+1}else o+=1;(!E||o>=e.length)&&n.push(e.substring(t,e.length))}return n}(i)){let t=r(e);t&&this._parsed.set(t.name,t)}}get(...e){let t="string"==typeof e[0]?e[0]:e[0].name;return this._parsed.get(t)}getAll(...e){var t;let T=Array.from(this._parsed.values());if(!e.length)return T;let a="string"==typeof e[0]?e[0]:null==(t=e[0])?void 0:t.name;return T.filter(e=>e.name===a)}has(e){return this._parsed.has(e)}set(...e){let[t,T,a]=1===e.length?[e[0].name,e[0].value,e[0]]:e,i=this._parsed;return i.set(t,function(e={name:"",value:""}){return"number"==typeof e.expires&&(e.expires=new Date(e.expires)),e.maxAge&&(e.expires=new Date(Date.now()+1e3*e.maxAge)),(null===e.path||void 0===e.path)&&(e.path="/"),e}({name:t,value:T,...a})),function(e,t){for(let[,T]of(t.delete("set-cookie"),e)){let e=n(T);t.append("set-cookie",e)}}(i,this._headers),this}delete(...e){let[t,T,a]="string"==typeof e[0]?[e[0]]:[e[0].name,e[0].path,e[0].domain];return this.set({name:t,path:T,domain:a,value:"",expires:new Date(0)})}[Symbol.for("edge-runtime.inspect.custom")](){return`ResponseCookies ${JSON.stringify(Object.fromEntries(this._parsed))}`}toString(){return[...this._parsed.values()].map(n).join("; ")}}},36419:(e,t,T)=>{Object.defineProperty(t,"__esModule",{value:!0}),function(e,t){for(var T in t)Object.defineProperty(e,T,{enumerable:!0,get:t[T]})}(t,{RequestCookies:function(){return a.RequestCookies},ResponseCookies:function(){return a.ResponseCookies},stringifyCookie:function(){return a.stringifyCookie}});let a=T(64737)},81155:(e,t,T)=>{T.a(e,async(e,a)=>{try{T.r(t),T.d(t,{GET:()=>r});var i=T(30627),E=T(98040),n=T(91322),o=e([E]);async function r(e,{params:t}){let{token:a}=await t;await (0,E.Dv)();let{rows:[o]}=await (0,E.IO)(`SELECT q.*,
       co.name as company_name, co.ico as company_ico, co.dic as company_dic,
       co.address as company_address, co.city as company_city, co.zip as company_zip,
       co.logo_url, co.vat_status, co.invoice_color, co.invoice_footer,
       cl.name as client_name, cl.ico as client_ico, cl.dic as client_dic,
       cl.address as client_address, cl.city as client_city, cl.zip as client_zip
     FROM fak_quotes q
     JOIN fak_companies co ON co.id = q.company_id
     LEFT JOIN fak_clients cl ON cl.id = q.client_id
     WHERE q.public_token = $1`,[a]);if(!o)return i.NextResponse.json({error:"Not found"},{status:404});let{rows:r}=await (0,E.IO)("SELECT * FROM fak_quote_items WHERE quote_id = $1 ORDER BY sort_order",[o.id]),s=(0,n.m)({number:o.number,issueDate:o.issue_date,validUntil:o.valid_until,currency:o.currency,note:o.note,noteBeforeItems:o.note_before_items,footerText:o.footer_text??o.invoice_footer,supplier:{name:o.company_name,ico:o.company_ico,dic:o.company_dic,address:o.company_address,city:o.company_city,zip:o.company_zip,logoUrl:o.logo_url,vatStatus:o.vat_status},client:{name:o.client_name,ico:o.client_ico,dic:o.client_dic,address:o.client_address,city:o.client_city,zip:o.client_zip},items:r.map(e=>({name:e.name,quantity:parseFloat(e.quantity),unit:e.unit,unitPrice:parseFloat(e.unit_price),vatRate:e.vat_rate,totalWithoutVat:parseFloat(e.total_without_vat),totalVat:parseFloat(e.total_vat),totalWithVat:parseFloat(e.total_with_vat)})),subtotal:parseFloat(o.subtotal),vatTotal:parseFloat(o.vat_total),total:parseFloat(o.total),isVatPayer:"vat_payer"===o.vat_status,accentColor:o.invoice_color??"#0e7c5a"});try{let e=await Promise.resolve().then(T.bind(T,77250)),t=process.env.PUPPETEER_EXECUTABLE_PATH??"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",a=await e.default.launch({executablePath:t,args:["--no-sandbox","--disable-setuid-sandbox","--disable-dev-shm-usage","--disable-gpu"],headless:!0}),E=await a.newPage();await E.setContent(s,{waitUntil:"load"});let n=await E.pdf({format:"A4",margin:{top:"0",right:"0",bottom:"0",left:"0"},printBackground:!0});return await a.close(),new i.NextResponse(n,{headers:{"Content-Type":"application/pdf","Content-Disposition":`attachment; filename="nabidka-${o.number}.pdf"`}})}catch(e){return console.error("Quote PDF generation failed:",e),i.NextResponse.json({error:"PDF se nepodařilo vygenerovat"},{status:500})}}E=(o.then?(await o)():o)[0],a()}catch(e){a(e)}})},98040:(e,t,T)=>{T.a(e,async(e,a)=>{try{T.d(t,{Dv:()=>o,IO:()=>n});var i=T(8678),E=e([i]);let r=new(i=(E.then?(await E)():E)[0]).Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:!1},max:3,idleTimeoutMillis:1e4,connectionTimeoutMillis:15e3});async function n(e,t){try{return await r.query(e,t)}catch(T){if(T?.code==="57P01"||/terminating|connection|ECONNRESET|timeout/i.test(T?.message||""))return await new Promise(e=>setTimeout(e,500)),await r.query(e,t);throw T}}async function o(){await r.query(`
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
  `)}a()}catch(e){a(e)}})},91322:(e,t,T)=>{function a(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function i(e,t="CZK"){return new Intl.NumberFormat("cs-CZ",{style:"currency",currency:t,minimumFractionDigits:2}).format(e)}function E(e){let t=e.accentColor||"#0e7c5a";return`<!doctype html>
<html lang="cs">
<head>
  <meta charset="utf-8" />
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: #15171c; background: #f4f3ee; }
    .page { width: 794px; min-height: 1123px; margin: 0 auto; background: #fff; padding: 48px; }
    .top { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid ${t}; padding-bottom: 24px; }
    .brand { font-size: 24px; font-weight: 800; color: #15171c; }
    .title { text-align: right; }
    .title h1 { margin: 0; color: ${t}; font-size: 30px; letter-spacing: .04em; }
    .muted { color: #6b7280; font-size: 13px; line-height: 1.5; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 32px; }
    h3 { margin: 0 0 10px; font-size: 11px; color: #8a909b; text-transform: uppercase; letter-spacing: .12em; }
    .name { font-weight: 700; margin-bottom: 4px; }
    .meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; background: #f6f5f0; border-radius: 12px; padding: 16px; margin: 28px 0; }
    .meta b { display: block; margin-top: 4px; font-size: 14px; }
    .note { border-left: 4px solid ${t}; background: #f6f5f0; padding: 12px 14px; border-radius: 0 10px 10px 0; margin: 20px 0; font-size: 13px; line-height: 1.5; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
    th { background: ${t}; color: #fff; text-align: left; padding: 10px; font-size: 11px; text-transform: uppercase; letter-spacing: .08em; }
    td { border-bottom: 1px solid #eceae2; padding: 12px 10px; vertical-align: top; }
    .right { text-align: right; }
    .total { margin-left: auto; width: 280px; margin-top: 24px; font-size: 14px; }
    .total div { display: flex; justify-content: space-between; padding: 6px 0; }
    .total .grand { border-top: 2px solid ${t}; margin-top: 8px; padding-top: 12px; font-size: 21px; font-weight: 800; color: ${t}; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #eceae2; color: #8a909b; font-size: 12px; line-height: 1.5; }
    img.logo { max-height: 56px; max-width: 220px; object-fit: contain; }
  </style>
</head>
<body>
  <div class="page">
    <div class="top">
      <div>${e.supplier.logoUrl?`<img class="logo" src="${a(e.supplier.logoUrl)}" />`:`<div class="brand">${a(e.supplier.name)}</div>`}</div>
      <div class="title"><h1>NAB\xcdDKA</h1><div class="muted">č. ${a(e.number)}</div></div>
    </div>

    <div class="grid">
      <div>
        <h3>Dodavatel</h3>
        <div class="name">${a(e.supplier.name)}</div>
        <div class="muted">${a(e.supplier.address)}<br>${a(e.supplier.zip)} ${a(e.supplier.city)}</div>
        <div class="muted">${e.supplier.ico?`IČO: ${a(e.supplier.ico)}<br>`:""}${e.supplier.dic?`DIČ: ${a(e.supplier.dic)}`:""}</div>
      </div>
      <div>
        <h3>Klient</h3>
        <div class="name">${a(e.client.name||"Bez klienta")}</div>
        <div class="muted">${a(e.client.address)}<br>${a(e.client.zip)} ${a(e.client.city)}</div>
        <div class="muted">${e.client.ico?`IČO: ${a(e.client.ico)}<br>`:""}${e.client.dic?`DIČ: ${a(e.client.dic)}`:""}</div>
      </div>
    </div>

    <div class="meta">
      <div class="muted">Vystaveno<b>${a(e.issueDate)}</b></div>
      <div class="muted">Platnost do<b>${a(e.validUntil||"—")}</b></div>
      <div class="muted">Celkem<b>${i(e.total,e.currency)}</b></div>
    </div>

    ${e.noteBeforeItems?`<div class="note">${a(e.noteBeforeItems).replace(/\n/g,"<br>")}</div>`:""}

    <table>
      <thead><tr><th>Položka</th><th class="right">Mn.</th><th class="right">Cena/ks</th>${e.isVatPayer?'<th class="right">DPH</th>':""}<th class="right">Celkem</th></tr></thead>
      <tbody>
        ${e.items.map(t=>`<tr>
          <td><b>${a(t.name)}</b></td>
          <td class="right">${t.quantity} ${a(t.unit||"")}</td>
          <td class="right">${i(t.unitPrice,e.currency)}</td>
          ${e.isVatPayer?`<td class="right">${t.vatRate} %</td>`:""}
          <td class="right"><b>${i(e.isVatPayer?t.totalWithVat:t.totalWithoutVat,e.currency)}</b></td>
        </tr>`).join("")}
      </tbody>
    </table>

    <div class="total">
      ${e.isVatPayer?`<div><span>Z\xe1klad DPH</span><span>${i(e.subtotal,e.currency)}</span></div><div><span>DPH</span><span>${i(e.vatTotal,e.currency)}</span></div>`:""}
      <div class="grand"><span>Celkem</span><span>${i(e.total,e.currency)}</span></div>
    </div>

    ${e.note?`<div class="note">${a(e.note).replace(/\n/g,"<br>")}</div>`:""}
    <div class="footer">${a(e.footerText||"Děkujeme za V\xe1š z\xe1jem.").replace(/\n/g,"<br>")}</div>
  </div>
</body>
</html>`}T.d(t,{m:()=>E})}};var t=require("../../../../../../webpack-runtime.js");t.C(e);var T=e=>t(t.s=e),a=t.X(0,[6522,8247],()=>T(77973));module.exports=a})();