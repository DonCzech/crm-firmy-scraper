"use strict";(()=>{var e={};e.id=2757,e.ids=[2757],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},61282:e=>{e.exports=require("child_process")},84770:e=>{e.exports=require("crypto")},17702:e=>{e.exports=require("events")},32615:e=>{e.exports=require("http")},35240:e=>{e.exports=require("https")},21764:e=>{e.exports=require("util")},8678:e=>{e.exports=import("pg")},94814:(e,T,E)=>{E.a(e,async(e,t)=>{try{E.r(T),E.d(T,{originalPathname:()=>A,patchFetch:()=>r,requestAsyncStorage:()=>s,routeModule:()=>o,serverHooks:()=>O,staticGenerationAsyncStorage:()=>_});var a=E(12085),i=E(31650),N=E(85980),n=E(8881),L=e([n]);n=(L.then?(await L)():L)[0];let o=new a.AppRouteRouteModule({definition:{kind:i.x.APP_ROUTE,page:"/api/stripe/webhook/route",pathname:"/api/stripe/webhook",filename:"route",bundlePath:"app/api/stripe/webhook/route"},resolvedPagePath:"/Users/apple/DEV/CRM/fakturina/src/app/api/stripe/webhook/route.ts",nextConfigOutput:"",userland:n}),{requestAsyncStorage:s,staticGenerationAsyncStorage:_,serverHooks:O}=o,A="/api/stripe/webhook/route";function r(){return(0,N.patchFetch)({serverHooks:O,staticGenerationAsyncStorage:_})}t()}catch(e){t(e)}})},64737:e=>{var T=Object.defineProperty,E=Object.getOwnPropertyDescriptor,t=Object.getOwnPropertyNames,a=Object.prototype.hasOwnProperty,i={};function N(e){var T;let E=["path"in e&&e.path&&`Path=${e.path}`,"expires"in e&&(e.expires||0===e.expires)&&`Expires=${("number"==typeof e.expires?new Date(e.expires):e.expires).toUTCString()}`,"maxAge"in e&&"number"==typeof e.maxAge&&`Max-Age=${e.maxAge}`,"domain"in e&&e.domain&&`Domain=${e.domain}`,"secure"in e&&e.secure&&"Secure","httpOnly"in e&&e.httpOnly&&"HttpOnly","sameSite"in e&&e.sameSite&&`SameSite=${e.sameSite}`,"partitioned"in e&&e.partitioned&&"Partitioned","priority"in e&&e.priority&&`Priority=${e.priority}`].filter(Boolean),t=`${e.name}=${encodeURIComponent(null!=(T=e.value)?T:"")}`;return 0===E.length?t:`${t}; ${E.join("; ")}`}function n(e){let T=new Map;for(let E of e.split(/; */)){if(!E)continue;let e=E.indexOf("=");if(-1===e){T.set(E,"true");continue}let[t,a]=[E.slice(0,e),E.slice(e+1)];try{T.set(t,decodeURIComponent(null!=a?a:"true"))}catch{}}return T}function L(e){var T,E;if(!e)return;let[[t,a],...i]=n(e),{domain:N,expires:L,httponly:s,maxage:_,path:O,samesite:A,secure:c,partitioned:d,priority:U}=Object.fromEntries(i.map(([e,T])=>[e.toLowerCase(),T]));return function(e){let T={};for(let E in e)e[E]&&(T[E]=e[E]);return T}({name:t,value:decodeURIComponent(a),domain:N,...L&&{expires:new Date(L)},...s&&{httpOnly:!0},..."string"==typeof _&&{maxAge:Number(_)},path:O,...A&&{sameSite:r.includes(T=(T=A).toLowerCase())?T:void 0},...c&&{secure:!0},...U&&{priority:o.includes(E=(E=U).toLowerCase())?E:void 0},...d&&{partitioned:!0}})}((e,E)=>{for(var t in E)T(e,t,{get:E[t],enumerable:!0})})(i,{RequestCookies:()=>s,ResponseCookies:()=>_,parseCookie:()=>n,parseSetCookie:()=>L,stringifyCookie:()=>N}),e.exports=((e,i,N,n)=>{if(i&&"object"==typeof i||"function"==typeof i)for(let N of t(i))a.call(e,N)||void 0===N||T(e,N,{get:()=>i[N],enumerable:!(n=E(i,N))||n.enumerable});return e})(T({},"__esModule",{value:!0}),i);var r=["strict","lax","none"],o=["low","medium","high"],s=class{constructor(e){this._parsed=new Map,this._headers=e;let T=e.get("cookie");if(T)for(let[e,E]of n(T))this._parsed.set(e,{name:e,value:E})}[Symbol.iterator](){return this._parsed[Symbol.iterator]()}get size(){return this._parsed.size}get(...e){let T="string"==typeof e[0]?e[0]:e[0].name;return this._parsed.get(T)}getAll(...e){var T;let E=Array.from(this._parsed);if(!e.length)return E.map(([e,T])=>T);let t="string"==typeof e[0]?e[0]:null==(T=e[0])?void 0:T.name;return E.filter(([e])=>e===t).map(([e,T])=>T)}has(e){return this._parsed.has(e)}set(...e){let[T,E]=1===e.length?[e[0].name,e[0].value]:e,t=this._parsed;return t.set(T,{name:T,value:E}),this._headers.set("cookie",Array.from(t).map(([e,T])=>N(T)).join("; ")),this}delete(e){let T=this._parsed,E=Array.isArray(e)?e.map(e=>T.delete(e)):T.delete(e);return this._headers.set("cookie",Array.from(T).map(([e,T])=>N(T)).join("; ")),E}clear(){return this.delete(Array.from(this._parsed.keys())),this}[Symbol.for("edge-runtime.inspect.custom")](){return`RequestCookies ${JSON.stringify(Object.fromEntries(this._parsed))}`}toString(){return[...this._parsed.values()].map(e=>`${e.name}=${encodeURIComponent(e.value)}`).join("; ")}},_=class{constructor(e){var T,E,t;this._parsed=new Map,this._headers=e;let a=null!=(t=null!=(E=null==(T=e.getSetCookie)?void 0:T.call(e))?E:e.get("set-cookie"))?t:[];for(let e of Array.isArray(a)?a:function(e){if(!e)return[];var T,E,t,a,i,N=[],n=0;function L(){for(;n<e.length&&/\s/.test(e.charAt(n));)n+=1;return n<e.length}for(;n<e.length;){for(T=n,i=!1;L();)if(","===(E=e.charAt(n))){for(t=n,n+=1,L(),a=n;n<e.length&&"="!==(E=e.charAt(n))&&";"!==E&&","!==E;)n+=1;n<e.length&&"="===e.charAt(n)?(i=!0,n=a,N.push(e.substring(T,t)),T=n):n=t+1}else n+=1;(!i||n>=e.length)&&N.push(e.substring(T,e.length))}return N}(a)){let T=L(e);T&&this._parsed.set(T.name,T)}}get(...e){let T="string"==typeof e[0]?e[0]:e[0].name;return this._parsed.get(T)}getAll(...e){var T;let E=Array.from(this._parsed.values());if(!e.length)return E;let t="string"==typeof e[0]?e[0]:null==(T=e[0])?void 0:T.name;return E.filter(e=>e.name===t)}has(e){return this._parsed.has(e)}set(...e){let[T,E,t]=1===e.length?[e[0].name,e[0].value,e[0]]:e,a=this._parsed;return a.set(T,function(e={name:"",value:""}){return"number"==typeof e.expires&&(e.expires=new Date(e.expires)),e.maxAge&&(e.expires=new Date(Date.now()+1e3*e.maxAge)),(null===e.path||void 0===e.path)&&(e.path="/"),e}({name:T,value:E,...t})),function(e,T){for(let[,E]of(T.delete("set-cookie"),e)){let e=N(E);T.append("set-cookie",e)}}(a,this._headers),this}delete(...e){let[T,E,t]="string"==typeof e[0]?[e[0]]:[e[0].name,e[0].path,e[0].domain];return this.set({name:T,path:E,domain:t,value:"",expires:new Date(0)})}[Symbol.for("edge-runtime.inspect.custom")](){return`ResponseCookies ${JSON.stringify(Object.fromEntries(this._parsed))}`}toString(){return[...this._parsed.values()].map(N).join("; ")}}},36419:(e,T,E)=>{Object.defineProperty(T,"__esModule",{value:!0}),function(e,T){for(var E in T)Object.defineProperty(e,E,{enumerable:!0,get:T[E]})}(T,{RequestCookies:function(){return t.RequestCookies},ResponseCookies:function(){return t.ResponseCookies},stringifyCookie:function(){return t.stringifyCookie}});let t=E(64737)},8881:(e,T,E)=>{E.a(e,async(e,t)=>{try{E.r(T),E.d(T,{POST:()=>r});var a=E(30627),i=E(84770),N=E(5207),n=E(98040),L=e([n]);async function r(e){let T;let E=(0,N.d)();if(!E)return a.NextResponse.json({error:"Stripe not configured"},{status:503});let t=await e.text(),L=e.headers.get("stripe-signature"),r=process.env.STRIPE_WEBHOOK_SECRET;if(!L||!r)return a.NextResponse.json({error:"Missing signature"},{status:400});try{T=E.webhooks.constructEvent(t,L,r)}catch{return a.NextResponse.json({error:"Invalid signature"},{status:400})}try{switch(T.type){case"checkout.session.completed":{let e=T.data.object,t=e.metadata?.userId,a=e.metadata?.plan??"start",N=e.customer,L=e.subscription;if(!t)break;let{rows:r}=await (0,n.IO)("SELECT id FROM fak_subscriptions WHERE user_id = $1",[t]),o=null;if(L){let e=await E.subscriptions.retrieve(L);o=e.items.data[0]?.price.id??null}r.length>0?await (0,n.IO)(`UPDATE fak_subscriptions SET
               stripe_customer_id=$1, stripe_subscription_id=$2, stripe_price_id=$3,
               plan=$4, status='active', updated_at=$5
             WHERE user_id=$6`,[N,L,o,a,Math.floor(Date.now()/1e3),t]):await (0,n.IO)(`INSERT INTO fak_subscriptions
               (id, user_id, stripe_customer_id, stripe_subscription_id, stripe_price_id, plan, status)
             VALUES ($1,$2,$3,$4,$5,$6,'active')`,[(0,i.randomUUID)(),t,N,L,o,a]);break}case"customer.subscription.updated":{let e=T.data.object,E=e.customer,t="active"===e.status?"active":"past_due"===e.status?"past_due":"inactive",a=e.items.data[0]?.price.id??null,i=e.current_period_end;await (0,n.IO)(`UPDATE fak_subscriptions SET
             stripe_price_id=$1, status=$2, current_period_end=$3,
             cancel_at_period_end=$4, updated_at=$5
           WHERE stripe_customer_id=$6`,[a,t,i,e.cancel_at_period_end,Math.floor(Date.now()/1e3),E]);break}case"customer.subscription.deleted":{let e=T.data.object.customer;await (0,n.IO)("UPDATE fak_subscriptions SET plan='free', status='active', stripe_subscription_id=NULL WHERE stripe_customer_id=$1",[e]);break}case"invoice.payment_failed":{let e=T.data.object.customer;await (0,n.IO)("UPDATE fak_subscriptions SET status='past_due' WHERE stripe_customer_id=$1",[e])}}}catch(e){console.error("Webhook handler error:",e)}return a.NextResponse.json({received:!0})}n=(L.then?(await L)():L)[0],t()}catch(e){t(e)}})},98040:(e,T,E)=>{E.a(e,async(e,t)=>{try{E.d(T,{Dv:()=>n,IO:()=>N});var a=E(8678),i=e([a]);let L=new(a=(i.then?(await i)():i)[0]).Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:!1},max:3,idleTimeoutMillis:1e4,connectionTimeoutMillis:15e3});async function N(e,T){try{return await L.query(e,T)}catch(E){if(E?.code==="57P01"||/terminating|connection|ECONNRESET|timeout/i.test(E?.message||""))return await new Promise(e=>setTimeout(e,500)),await L.query(e,T);throw E}}async function n(){await L.query(`
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
  `)}t()}catch(e){t(e)}})},5207:(e,T,E)=>{E.d(T,{X:()=>N,d:()=>i});var t=E(71041);let a=null;function i(){return process.env.STRIPE_SECRET_KEY?(a||(a=new t.Z(process.env.STRIPE_SECRET_KEY,{apiVersion:"2025-02-24.acacia"})),a):null}let N={free:{name:"Free",price:0,priceId:null},start:{name:"Start",price:149,priceId:process.env.STRIPE_PRICE_START_MONTHLY??null},pro:{name:"Pro",price:249,priceId:process.env.STRIPE_PRICE_PRO_MONTHLY??null},business:{name:"Business",price:449,priceId:process.env.STRIPE_PRICE_BUSINESS_MONTHLY??null}}}};var T=require("../../../../webpack-runtime.js");T.C(e);var E=e=>T(T.s=e),t=T.X(0,[6522,8247,1041],()=>E(94814));module.exports=t})();