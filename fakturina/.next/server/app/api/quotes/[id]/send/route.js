"use strict";(()=>{var e={};e.id=3805,e.ids=[3805],e.modules={72934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},84770:e=>{e.exports=require("crypto")},8678:e=>{e.exports=import("pg")},77250:e=>{e.exports=import("puppeteer-core")},61912:(e,t,a)=>{a.a(e,async(e,i)=>{try{a.r(t),a.d(t,{originalPathname:()=>f,patchFetch:()=>d,requestAsyncStorage:()=>c,routeModule:()=>p,serverHooks:()=>m,staticGenerationAsyncStorage:()=>u});var r=a(12085),o=a(31650),n=a(85980),s=a(57456),l=e([s]);s=(l.then?(await l)():l)[0];let p=new r.AppRouteRouteModule({definition:{kind:o.x.APP_ROUTE,page:"/api/quotes/[id]/send/route",pathname:"/api/quotes/[id]/send",filename:"route",bundlePath:"app/api/quotes/[id]/send/route"},resolvedPagePath:"/Users/apple/DEV/CRM/fakturina/src/app/api/quotes/[id]/send/route.ts",nextConfigOutput:"",userland:s}),{requestAsyncStorage:c,staticGenerationAsyncStorage:u,serverHooks:m}=p,f="/api/quotes/[id]/send/route";function d(){return(0,n.patchFetch)({serverHooks:m,staticGenerationAsyncStorage:u})}i()}catch(e){i(e)}})},57456:(e,t,a)=>{a.a(e,async(e,i)=>{try{a.r(t),a.d(t,{POST:()=>u});var r=a(30627),o=a(6415),n=a(98040),s=a(78374),l=a(91322),d=a(85301),p=a(96641),c=e([n,s,p]);[n,s,p]=c.then?(await c)():c;let m=o.Ry({to:o.Z_().email().optional(),note:o.Z_().optional(),attachPdf:o.O7().default(!0)});async function u(e,{params:t}){let i;let{id:o}=await t,c=await (0,s.oT)().catch(()=>null);if(!c)return r.NextResponse.json({error:"Unauthorized"},{status:401});let u=await (0,s.pk)(c.id);if(!u)return r.NextResponse.json({error:"No company"},{status:400});let f=await e.json().catch(()=>({})),x=m.safeParse(f);if(!x.success)return r.NextResponse.json({error:"Neplatn\xe9 vstupy"},{status:400});let{rows:[g]}=await (0,n.IO)(`SELECT q.*,
       c.name as client_name, c.email as client_email, c.ico as client_ico,
       c.dic as client_dic, c.address as client_address, c.city as client_city, c.zip as client_zip
     FROM fak_quotes q
     LEFT JOIN fak_clients c ON c.id = q.client_id
     WHERE q.id = $1 AND q.company_id = $2`,[o,u.id]);if(!g)return r.NextResponse.json({error:"Not found"},{status:404});if(g.converted_invoice_id)return r.NextResponse.json({error:"Nab\xeddka už byla převedena na fakturu"},{status:400});let b=x.data.to||g.client_email;if(!b)return r.NextResponse.json({error:"Klient nem\xe1 e-mail"},{status:400});let{rows:v}=await (0,n.IO)("SELECT * FROM fak_quote_items WHERE quote_id = $1 ORDER BY sort_order",[o]),h=(0,l.m)({number:g.number,issueDate:g.issue_date,validUntil:g.valid_until,currency:g.currency,note:g.note,noteBeforeItems:g.note_before_items,footerText:g.footer_text??u.invoice_footer,supplier:{name:u.name,ico:u.ico,dic:u.dic,address:u.address,city:u.city,zip:u.zip,logoUrl:u.logo_url,vatStatus:u.vat_status},client:{name:g.client_name,ico:g.client_ico,dic:g.client_dic,address:g.client_address,city:g.client_city,zip:g.client_zip},items:v.map(e=>({name:e.name,quantity:parseFloat(e.quantity),unit:e.unit,unitPrice:parseFloat(e.unit_price),vatRate:e.vat_rate,totalWithoutVat:parseFloat(e.total_without_vat),totalVat:parseFloat(e.total_vat),totalWithVat:parseFloat(e.total_with_vat)})),subtotal:parseFloat(g.subtotal),vatTotal:parseFloat(g.vat_total),total:parseFloat(g.total),isVatPayer:"vat_payer"===u.vat_status,accentColor:u.invoice_color??"#0e7c5a"});if(x.data.attachPdf)try{let e=await Promise.resolve().then(a.bind(a,77250)),t=process.env.PUPPETEER_EXECUTABLE_PATH??"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",r=await e.default.launch({executablePath:t,args:["--no-sandbox","--disable-setuid-sandbox","--disable-dev-shm-usage","--disable-gpu"],headless:!0}),o=await r.newPage();await o.setContent(h,{waitUntil:"load"});let n=await o.pdf({format:"A4",margin:{top:"0",right:"0",bottom:"0",left:"0"},printBackground:!0});await r.close(),i=Buffer.from(n)}catch(e){console.error("Quote PDF generation failed, sending without attachment:",e)}let y={to:b,clientName:g.client_name??b,quoteNumber:g.number,total:parseFloat(g.total),currency:g.currency,validUntil:g.valid_until,publicToken:g.public_token,supplierName:u.name,note:x.data.note,pdfBuffer:i};try{let e=await (0,d.yt)(y);await (0,p.t)({companyId:u.id,quoteId:o,type:"quote",recipient:b,subject:(0,d.WV)(y),status:"sent",providerMessageId:e})}catch(t){let e=t instanceof Error?t.message:"Odesl\xe1n\xed e-mailu selhalo";return await (0,p.t)({companyId:u.id,quoteId:o,type:"quote",recipient:b,subject:(0,d.WV)(y),status:"error",error:e}),r.NextResponse.json({error:e},{status:502})}return await (0,n.IO)("UPDATE fak_quotes SET status = 'sent', updated_at = $1 WHERE id = $2 AND company_id = $3 AND status = 'draft'",[Math.floor(Date.now()/1e3),o,u.id]),r.NextResponse.json({ok:!0})}i()}catch(e){i(e)}})},96641:(e,t,a)=>{a.a(e,async(e,i)=>{try{a.d(t,{t:()=>s});var r=a(84770),o=a(98040),n=e([o]);async function s(e){try{await (0,o.IO)(`INSERT INTO fak_email_log
         (id, company_id, invoice_id, quote_id, type, recipient, subject, status,
          provider, provider_message_id, error)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'resend',$9,$10)`,[(0,r.randomUUID)(),e.companyId??null,e.invoiceId??null,e.quoteId??null,e.type,e.recipient,e.subject??null,e.status,e.providerMessageId??null,e.error??null])}catch{}}o=(n.then?(await n)():n)[0],i()}catch(e){i(e)}})},85301:(e,t,a)=>{a.d(t,{Bd:()=>f,FT:()=>m,WV:()=>u,cC:()=>g,yV:()=>c,yt:()=>x});var i=a(60166);let r=process.env.EMAIL_FROM??"Fakturina <noreply@fakturina.cz>",o="http://localhost:3020";function n(e,t="CZK"){return new Intl.NumberFormat("cs-CZ",{style:"currency",currency:t,minimumFractionDigits:2}).format(e)}function s(e,t){return`<!DOCTYPE html><html lang="cs">
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
        Tento e-mail byl automaticky vygenerov\xe1n syst\xe9mem <a href="${o}" style="color:#6366f1;text-decoration:none">Fakturina.cz</a>.
        Pro spr\xe1vu upom\xednek se přihlaste do sv\xe9ho \xfačtu.
      </p>
    </div>
  </div>
</body></html>`}function l(e,t){let a=`${o}/invoice/${e}`;return`<div style="text-align:center;margin:24px 0">
    <a href="${a}" style="display:inline-block;padding:13px 32px;background:#4f46e5;color:#fff;font-weight:700;border-radius:8px;text-decoration:none;font-size:15px">${t}</a>
  </div>
  <p style="text-align:center;font-size:12px;color:#94a3b8;margin-top:-12px">
    Nebo zkop\xedrujte odkaz: <a href="${a}" style="color:#6366f1">${a}</a>
  </p>`}function d(e){let t=e.map(({label:e,value:t})=>`<tr>
      <td style="padding:8px 14px;font-size:13px;color:#64748b;border-bottom:1px solid #f1f5f9">${e}</td>
      <td style="padding:8px 14px;font-size:13px;font-weight:600;color:#1e293b;text-align:right;border-bottom:1px solid #f1f5f9">${t}</td>
    </tr>`).join("");return`<table style="width:100%;border-collapse:collapse;background:#f8fafc;border-radius:8px;overflow:hidden;margin:20px 0">${t}</table>`}async function p(e){let t=await (function(){if(!process.env.RESEND_API_KEY)throw Error("RESEND_API_KEY nen\xed nastaven.");return new i.R(process.env.RESEND_API_KEY)})().emails.send(e);if("error"in t&&t.error)throw Error("object"==typeof t.error&&"message"in t.error?String(t.error.message):"Resend odesl\xe1n\xed selhalo.");return"data"in t&&t.data&&"id"in t.data?String(t.data.id):null}function c(e){return`Faktura č. ${e.invoiceNumber} od ${e.supplierName}`}function u(e){return`Nab\xeddka č. ${e.quoteNumber} od ${e.supplierName}`}function m(e){return(e.daysOverdue??0)>0?`Upom\xednka: Faktura č. ${e.invoiceNumber} je po splatnosti ${e.daysOverdue} dn\xed`:`Připom\xednka splatnosti faktury č. ${e.invoiceNumber}`}async function f(e){let t=`
    <p style="margin:0 0 14px;font-size:14px;color:#334155;line-height:1.65">
      Dobr\xfd den, ${e.clientName},<br><br>
      zas\xedl\xe1me V\xe1m fakturu č. <strong>${e.invoiceNumber}</strong> od ${e.supplierName}.
    </p>
    ${e.note?`<p style="margin:0 0 14px;font-size:14px;color:#334155;line-height:1.65">${e.note}</p>`:""}
    ${d([{label:"Č\xedslo faktury",value:e.invoiceNumber},{label:"Č\xe1stka k \xfahradě",value:n(e.total,e.currency)},{label:"Datum splatnosti",value:e.dueDate}])}
    ${l(e.publicToken,"Zobrazit fakturu online")}
  `,a=e.pdfBuffer?[{filename:`faktura-${e.invoiceNumber}.pdf`,content:e.pdfBuffer}]:void 0;return p({from:r,to:e.to,subject:c(e),html:s(`Faktura č. ${e.invoiceNumber}`,t),attachments:a})}async function x(e){var t;let a=`
    <p style="margin:0 0 14px;font-size:14px;color:#334155;line-height:1.65">
      Dobr\xfd den, ${e.clientName},<br><br>
      zas\xedl\xe1me V\xe1m cenovou nab\xeddku č. <strong>${e.quoteNumber}</strong> od ${e.supplierName}.
    </p>
    ${e.note?`<p style="margin:0 0 14px;font-size:14px;color:#334155;line-height:1.65">${e.note}</p>`:""}
    ${d([{label:"Č\xedslo nab\xeddky",value:e.quoteNumber},{label:"Celkov\xe1 cena",value:n(e.total,e.currency)},...e.validUntil?[{label:"Platnost do",value:e.validUntil}]:[]])}
    ${(t=`${o}/quote/${e.publicToken}`,`<div style="text-align:center;margin:24px 0">
    <a href="${t}" style="display:inline-block;padding:13px 32px;background:#4f46e5;color:#fff;font-weight:700;border-radius:8px;text-decoration:none;font-size:15px">Zobrazit nab\xeddku online</a>
  </div>
  <p style="text-align:center;font-size:12px;color:#94a3b8;margin-top:-12px">
    Nebo zkop\xedrujte odkaz: <a href="${t}" style="color:#6366f1">${t}</a>
  </p>`)}
  `,i=e.pdfBuffer?[{filename:`nabidka-${e.quoteNumber}.pdf`,content:e.pdfBuffer}]:void 0;return p({from:r,to:e.to,subject:u(e),html:s(`Nab\xeddka č. ${e.quoteNumber}`,a),attachments:i})}async function g(e){var t;let a={number:e.invoiceNumber,total:n(e.total,e.currency),dueDate:e.dueDate,clientName:e.clientName,supplierName:e.supplierName,daysOverdue:String(e.daysOverdue??0)},i=(t=e.template,Object.entries(a).reduce((e,[t,a])=>e.replaceAll(`{{${t}}}`,a),t)).split("\n\n").map(e=>`<p style="margin:0 0 14px;font-size:14px;color:#334155;line-height:1.65">${e.replace(/\n/g,"<br>")}</p>`).join(""),o=(e.daysOverdue??0)>0,c=m(e),u=o?`⚠ Faktura po splatnosti`:`Připom\xednka platby`,f=`
    ${i}
    ${d([{label:"Č\xedslo faktury",value:e.invoiceNumber},{label:"Č\xe1stka k \xfahradě",value:n(e.total,e.currency)},{label:"Datum splatnosti",value:e.dueDate},...o?[{label:"Dn\xed po splatnosti",value:`<span style="color:${o?"#dc2626":"#4f46e5"};font-weight:700">${e.daysOverdue}</span>`}]:[]])}
    ${l(e.publicToken,o?"Zobrazit fakturu a zaplatit":"Zobrazit fakturu")}
  `;return p({from:r,to:e.to,subject:c,html:s(u,f)})}},91322:(e,t,a)=>{function i(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function r(e,t="CZK"){return new Intl.NumberFormat("cs-CZ",{style:"currency",currency:t,minimumFractionDigits:2}).format(e)}function o(e){let t=e.accentColor||"#0e7c5a";return`<!doctype html>
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
      <div>${e.supplier.logoUrl?`<img class="logo" src="${i(e.supplier.logoUrl)}" />`:`<div class="brand">${i(e.supplier.name)}</div>`}</div>
      <div class="title"><h1>NAB\xcdDKA</h1><div class="muted">č. ${i(e.number)}</div></div>
    </div>

    <div class="grid">
      <div>
        <h3>Dodavatel</h3>
        <div class="name">${i(e.supplier.name)}</div>
        <div class="muted">${i(e.supplier.address)}<br>${i(e.supplier.zip)} ${i(e.supplier.city)}</div>
        <div class="muted">${e.supplier.ico?`IČO: ${i(e.supplier.ico)}<br>`:""}${e.supplier.dic?`DIČ: ${i(e.supplier.dic)}`:""}</div>
      </div>
      <div>
        <h3>Klient</h3>
        <div class="name">${i(e.client.name||"Bez klienta")}</div>
        <div class="muted">${i(e.client.address)}<br>${i(e.client.zip)} ${i(e.client.city)}</div>
        <div class="muted">${e.client.ico?`IČO: ${i(e.client.ico)}<br>`:""}${e.client.dic?`DIČ: ${i(e.client.dic)}`:""}</div>
      </div>
    </div>

    <div class="meta">
      <div class="muted">Vystaveno<b>${i(e.issueDate)}</b></div>
      <div class="muted">Platnost do<b>${i(e.validUntil||"—")}</b></div>
      <div class="muted">Celkem<b>${r(e.total,e.currency)}</b></div>
    </div>

    ${e.noteBeforeItems?`<div class="note">${i(e.noteBeforeItems).replace(/\n/g,"<br>")}</div>`:""}

    <table>
      <thead><tr><th>Položka</th><th class="right">Mn.</th><th class="right">Cena/ks</th>${e.isVatPayer?'<th class="right">DPH</th>':""}<th class="right">Celkem</th></tr></thead>
      <tbody>
        ${e.items.map(t=>`<tr>
          <td><b>${i(t.name)}</b></td>
          <td class="right">${t.quantity} ${i(t.unit||"")}</td>
          <td class="right">${r(t.unitPrice,e.currency)}</td>
          ${e.isVatPayer?`<td class="right">${t.vatRate} %</td>`:""}
          <td class="right"><b>${r(e.isVatPayer?t.totalWithVat:t.totalWithoutVat,e.currency)}</b></td>
        </tr>`).join("")}
      </tbody>
    </table>

    <div class="total">
      ${e.isVatPayer?`<div><span>Z\xe1klad DPH</span><span>${r(e.subtotal,e.currency)}</span></div><div><span>DPH</span><span>${r(e.vatTotal,e.currency)}</span></div>`:""}
      <div class="grand"><span>Celkem</span><span>${r(e.total,e.currency)}</span></div>
    </div>

    ${e.note?`<div class="note">${i(e.note).replace(/\n/g,"<br>")}</div>`:""}
    <div class="footer">${i(e.footerText||"Děkujeme za V\xe1š z\xe1jem.").replace(/\n/g,"<br>")}</div>
  </div>
</body>
</html>`}a.d(t,{m:()=>o})}};var t=require("../../../../../webpack-runtime.js");t.C(e);var a=e=>t(t.s=e),i=t.X(0,[6522,9463,8247,6415,166,8374],()=>a(61912));module.exports=i})();