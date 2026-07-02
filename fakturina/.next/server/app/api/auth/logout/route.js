"use strict";(()=>{var T={};T.id=7716,T.ids=[7716],T.modules={20399:T=>{T.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:T=>{T.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},8678:T=>{T.exports=import("pg")},59548:(T,e,E)=>{E.a(T,async(T,t)=>{try{E.r(e),E.d(e,{originalPathname:()=>A,patchFetch:()=>o,requestAsyncStorage:()=>s,routeModule:()=>r,serverHooks:()=>_,staticGenerationAsyncStorage:()=>O});var a=E(12085),N=E(31650),i=E(85980),L=E(3252),n=T([L]);L=(n.then?(await n)():n)[0];let r=new a.AppRouteRouteModule({definition:{kind:N.x.APP_ROUTE,page:"/api/auth/logout/route",pathname:"/api/auth/logout",filename:"route",bundlePath:"app/api/auth/logout/route"},resolvedPagePath:"/Users/apple/DEV/CRM/fakturina/src/app/api/auth/logout/route.ts",nextConfigOutput:"",userland:L}),{requestAsyncStorage:s,staticGenerationAsyncStorage:O,serverHooks:_}=r,A="/api/auth/logout/route";function o(){return(0,i.patchFetch)({serverHooks:_,staticGenerationAsyncStorage:O})}t()}catch(T){t(T)}})},64737:T=>{var e=Object.defineProperty,E=Object.getOwnPropertyDescriptor,t=Object.getOwnPropertyNames,a=Object.prototype.hasOwnProperty,N={};function i(T){var e;let E=["path"in T&&T.path&&`Path=${T.path}`,"expires"in T&&(T.expires||0===T.expires)&&`Expires=${("number"==typeof T.expires?new Date(T.expires):T.expires).toUTCString()}`,"maxAge"in T&&"number"==typeof T.maxAge&&`Max-Age=${T.maxAge}`,"domain"in T&&T.domain&&`Domain=${T.domain}`,"secure"in T&&T.secure&&"Secure","httpOnly"in T&&T.httpOnly&&"HttpOnly","sameSite"in T&&T.sameSite&&`SameSite=${T.sameSite}`,"partitioned"in T&&T.partitioned&&"Partitioned","priority"in T&&T.priority&&`Priority=${T.priority}`].filter(Boolean),t=`${T.name}=${encodeURIComponent(null!=(e=T.value)?e:"")}`;return 0===E.length?t:`${t}; ${E.join("; ")}`}function L(T){let e=new Map;for(let E of T.split(/; */)){if(!E)continue;let T=E.indexOf("=");if(-1===T){e.set(E,"true");continue}let[t,a]=[E.slice(0,T),E.slice(T+1)];try{e.set(t,decodeURIComponent(null!=a?a:"true"))}catch{}}return e}function n(T){var e,E;if(!T)return;let[[t,a],...N]=L(T),{domain:i,expires:n,httponly:s,maxage:O,path:_,samesite:A,secure:U,partitioned:c,priority:d}=Object.fromEntries(N.map(([T,e])=>[T.toLowerCase(),e]));return function(T){let e={};for(let E in T)T[E]&&(e[E]=T[E]);return e}({name:t,value:decodeURIComponent(a),domain:i,...n&&{expires:new Date(n)},...s&&{httpOnly:!0},..."string"==typeof O&&{maxAge:Number(O)},path:_,...A&&{sameSite:o.includes(e=(e=A).toLowerCase())?e:void 0},...U&&{secure:!0},...d&&{priority:r.includes(E=(E=d).toLowerCase())?E:void 0},...c&&{partitioned:!0}})}((T,E)=>{for(var t in E)e(T,t,{get:E[t],enumerable:!0})})(N,{RequestCookies:()=>s,ResponseCookies:()=>O,parseCookie:()=>L,parseSetCookie:()=>n,stringifyCookie:()=>i}),T.exports=((T,N,i,L)=>{if(N&&"object"==typeof N||"function"==typeof N)for(let i of t(N))a.call(T,i)||void 0===i||e(T,i,{get:()=>N[i],enumerable:!(L=E(N,i))||L.enumerable});return T})(e({},"__esModule",{value:!0}),N);var o=["strict","lax","none"],r=["low","medium","high"],s=class{constructor(T){this._parsed=new Map,this._headers=T;let e=T.get("cookie");if(e)for(let[T,E]of L(e))this._parsed.set(T,{name:T,value:E})}[Symbol.iterator](){return this._parsed[Symbol.iterator]()}get size(){return this._parsed.size}get(...T){let e="string"==typeof T[0]?T[0]:T[0].name;return this._parsed.get(e)}getAll(...T){var e;let E=Array.from(this._parsed);if(!T.length)return E.map(([T,e])=>e);let t="string"==typeof T[0]?T[0]:null==(e=T[0])?void 0:e.name;return E.filter(([T])=>T===t).map(([T,e])=>e)}has(T){return this._parsed.has(T)}set(...T){let[e,E]=1===T.length?[T[0].name,T[0].value]:T,t=this._parsed;return t.set(e,{name:e,value:E}),this._headers.set("cookie",Array.from(t).map(([T,e])=>i(e)).join("; ")),this}delete(T){let e=this._parsed,E=Array.isArray(T)?T.map(T=>e.delete(T)):e.delete(T);return this._headers.set("cookie",Array.from(e).map(([T,e])=>i(e)).join("; ")),E}clear(){return this.delete(Array.from(this._parsed.keys())),this}[Symbol.for("edge-runtime.inspect.custom")](){return`RequestCookies ${JSON.stringify(Object.fromEntries(this._parsed))}`}toString(){return[...this._parsed.values()].map(T=>`${T.name}=${encodeURIComponent(T.value)}`).join("; ")}},O=class{constructor(T){var e,E,t;this._parsed=new Map,this._headers=T;let a=null!=(t=null!=(E=null==(e=T.getSetCookie)?void 0:e.call(T))?E:T.get("set-cookie"))?t:[];for(let T of Array.isArray(a)?a:function(T){if(!T)return[];var e,E,t,a,N,i=[],L=0;function n(){for(;L<T.length&&/\s/.test(T.charAt(L));)L+=1;return L<T.length}for(;L<T.length;){for(e=L,N=!1;n();)if(","===(E=T.charAt(L))){for(t=L,L+=1,n(),a=L;L<T.length&&"="!==(E=T.charAt(L))&&";"!==E&&","!==E;)L+=1;L<T.length&&"="===T.charAt(L)?(N=!0,L=a,i.push(T.substring(e,t)),e=L):L=t+1}else L+=1;(!N||L>=T.length)&&i.push(T.substring(e,T.length))}return i}(a)){let e=n(T);e&&this._parsed.set(e.name,e)}}get(...T){let e="string"==typeof T[0]?T[0]:T[0].name;return this._parsed.get(e)}getAll(...T){var e;let E=Array.from(this._parsed.values());if(!T.length)return E;let t="string"==typeof T[0]?T[0]:null==(e=T[0])?void 0:e.name;return E.filter(T=>T.name===t)}has(T){return this._parsed.has(T)}set(...T){let[e,E,t]=1===T.length?[T[0].name,T[0].value,T[0]]:T,a=this._parsed;return a.set(e,function(T={name:"",value:""}){return"number"==typeof T.expires&&(T.expires=new Date(T.expires)),T.maxAge&&(T.expires=new Date(Date.now()+1e3*T.maxAge)),(null===T.path||void 0===T.path)&&(T.path="/"),T}({name:e,value:E,...t})),function(T,e){for(let[,E]of(e.delete("set-cookie"),T)){let T=i(E);e.append("set-cookie",T)}}(a,this._headers),this}delete(...T){let[e,E,t]="string"==typeof T[0]?[T[0]]:[T[0].name,T[0].path,T[0].domain];return this.set({name:e,path:E,domain:t,value:"",expires:new Date(0)})}[Symbol.for("edge-runtime.inspect.custom")](){return`ResponseCookies ${JSON.stringify(Object.fromEntries(this._parsed))}`}toString(){return[...this._parsed.values()].map(i).join("; ")}}},36419:(T,e,E)=>{Object.defineProperty(e,"__esModule",{value:!0}),function(T,e){for(var E in e)Object.defineProperty(T,E,{enumerable:!0,get:e[E]})}(e,{RequestCookies:function(){return t.RequestCookies},ResponseCookies:function(){return t.ResponseCookies},stringifyCookie:function(){return t.stringifyCookie}});let t=E(64737)},3252:(T,e,E)=>{E.a(T,async(T,t)=>{try{E.r(e),E.d(e,{POST:()=>L});var a=E(30627),N=E(98040),i=T([N]);async function L(T){let e=T.cookies.get("fak_session")?.value;e&&await (0,N.IO)("DELETE FROM fak_sessions WHERE token = $1",[e]);let E=a.NextResponse.json({ok:!0});return E.cookies.set("fak_session","",{maxAge:0,path:"/"}),E}N=(i.then?(await i)():i)[0],t()}catch(T){t(T)}})},98040:(T,e,E)=>{E.a(T,async(T,t)=>{try{E.d(e,{Dv:()=>L,IO:()=>i});var a=E(8678),N=T([a]);let n=new(a=(N.then?(await N)():N)[0]).Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:!1},max:3,idleTimeoutMillis:1e4,connectionTimeoutMillis:15e3});async function i(T,e){try{return await n.query(T,e)}catch(E){if(E?.code==="57P01"||/terminating|connection|ECONNRESET|timeout/i.test(E?.message||""))return await new Promise(T=>setTimeout(T,500)),await n.query(T,e);throw E}}async function L(){await n.query(`
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
  `)}t()}catch(T){t(T)}})}};var e=require("../../../../webpack-runtime.js");e.C(T);var E=T=>e(e.s=T),t=e.X(0,[6522,8247],()=>E(59548));module.exports=t})();