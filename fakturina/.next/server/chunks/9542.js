"use strict";exports.id=9542,exports.ids=[9542],exports.modules={99542:(t,e,i)=>{function o(t,e,i){let o=new Map;for(let e of t){let t=o.get(e.vatRate)??{base:0,vat:0};o.set(e.vatRate,{base:t.base+e.totalWithoutVat,vat:t.vat+e.totalVat})}return Array.from(o.entries()).sort((t,e)=>e[0]-t[0]).map(([t,{base:o,vat:p}])=>`<div class="${i}"><span>Z\xe1klad DPH ${t} %</span><span>${a(o,e)}</span></div>`+(t>0?`<div class="${i}"><span>DPH ${t} %</span><span>${a(p,e)}</span></div>`:"")).join("")}function a(t,e="CZK"){return new Intl.NumberFormat("cs-CZ",{style:"currency",currency:e,minimumFractionDigits:2}).format(t)}function p(t){return({invoice:"FAKTURA",proforma:"PROFORMA FAKTURA",advance:"Z\xc1LOHOV\xc1 FAKTURA",credit_note:"DOBROPIS",tax_document:"DAŇOV\xdd DOKLAD"})[t]??"FAKTURA"}function s(t){let e;switch(t.template){case"solaris":e=function(t){let e=t.isVatPayer,i=t.accentColor??"#333333",o=t.items.map(i=>`
    <tr>
      <td style="padding:7px 0;border-bottom:1px solid #eee;font-size:12px">${i.name}</td>
      <td style="padding:7px 8px;border-bottom:1px solid #eee;text-align:center;font-size:12px;color:#666">${i.quantity}${i.unit?` ${i.unit}`:""}</td>
      <td style="padding:7px 8px;border-bottom:1px solid #eee;text-align:right;font-size:12px;color:#666">${a(i.unitPrice,t.currency)}</td>
      ${e?`<td style="padding:7px 8px;border-bottom:1px solid #eee;text-align:center;font-size:12px;color:#666">${i.vatRate} %</td>`:""}
      <td style="padding:7px 0;border-bottom:1px solid #eee;text-align:right;font-size:12px;font-weight:600">${a(i.totalWithoutVat,t.currency)}</td>
    </tr>`).join(""),s=(()=>{if(!e)return"";let i=new Map;return t.items.forEach(t=>{let e=i.get(t.vatRate)??{base:0,vat:0};i.set(t.vatRate,{base:e.base+t.totalWithoutVat,vat:e.vat+t.totalVat})}),Array.from(i.entries()).sort((t,e)=>e[0]-t[0]).map(([e,{base:i,vat:o}])=>`<div style="display:grid;grid-template-columns:70px 1fr 1fr;font-size:11px;margin-bottom:2px;color:#555">
        <span>${e} %</span><span style="text-align:right">${a(i,t.currency)}</span><span style="text-align:right">${a(o,t.currency)}</span>
      </div>`).join("")})();return`<!DOCTYPE html><html lang="cs"><head><meta charset="UTF-8">
<style>* { margin:0;padding:0;box-sizing:border-box; } body{font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#333;background:#fff;padding:32px 40px;}
.wm{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-30deg);font-size:72px;color:rgba(0,0,0,0.04);font-weight:900;white-space:nowrap;pointer-events:none;}</style></head><body>
${t.watermark?'<div class="wm">Fakturina FREE</div>':""}
<div style="border-top:3px solid ${i};margin-bottom:22px"></div>
${t.supplier.logoUrl?`<div style="margin-bottom:16px"><img src="${t.supplier.logoUrl}" style="max-height:50px;max-width:160px;object-fit:contain" alt="logo"></div>`:""}
<div style="display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-bottom:18px">
  <div>
    <div style="font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:#999;font-weight:700;margin-bottom:7px">DODAVATEL</div>
    <div style="font-size:13px;font-weight:700;margin-bottom:3px">${t.supplier.name}</div>
    <div style="font-size:11px;color:#555;line-height:1.7">${t.supplier.address}<br>${t.supplier.zip} ${t.supplier.city}</div>
    ${t.supplier.ico?`<div style="font-size:11px;margin-top:5px">IČO <strong>${t.supplier.ico}</strong>${t.supplier.dic?`&nbsp;&nbsp;DIČ <strong>${t.supplier.dic}</strong>`:""}</div>`:""}
    ${"non_vat"===t.supplier.vatStatus?`<div style="font-size:10px;color:#aaa;font-style:italic;margin-top:2px">Nepl\xe1tce DPH</div>`:""}
  </div>
  <div>
    <div style="font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:#999;font-weight:700;margin-bottom:7px">ODBĚRATEL</div>
    <div style="font-size:13px;font-weight:700;margin-bottom:3px">${t.client.name||"—"}</div>
    <div style="font-size:11px;color:#555;line-height:1.7">${t.client.address}<br>${t.client.zip} ${t.client.city}</div>
    ${t.client.ico?`<div style="font-size:11px;margin-top:5px">IČO <strong>${t.client.ico}</strong>${t.client.dic?`&nbsp;&nbsp;DIČ <strong>${t.client.dic}</strong>`:""}</div>`:""}
  </div>
</div>
<div style="text-align:right;margin-bottom:14px">
  <div style="font-size:20px;font-weight:700">${p(t.type)} ${t.number}</div>
  ${e?`<div style="font-size:11px;color:#888;margin-top:2px">Daňov\xfd doklad</div>`:""}
</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;border-top:1px solid #ddd;border-bottom:1px solid #ddd;padding:12px 0;margin-bottom:18px">
  <div>
    ${t.supplier.bankAccount?`<div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px"><span style="color:#888">Bankovn\xed \xfačet</span><span style="font-weight:600">${t.supplier.bankAccount}</span></div>`:""}
    ${t.variableSymbol?`<div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px"><span style="color:#888">Variabiln\xed symbol</span><span style="font-weight:600">${t.variableSymbol}</span></div>`:""}
    <div style="display:flex;justify-content:space-between;font-size:11px"><span style="color:#888">Způsob platby</span><span style="font-weight:600">${({bank:"Převodem",card:"Kartou",cash:"Hotově",cod:"Dob\xedrka",other:"Jin\xe1"})[t.paymentMethod??"bank"]??"Převodem"}</span></div>
    ${t.orderNumber?`<div style="display:flex;justify-content:space-between;font-size:11px;margin-top:3px"><span style="color:#888">Č\xedslo objedn\xe1vky</span><span style="font-weight:600">${t.orderNumber}</span></div>`:""}
  </div>
  <div>
    <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px"><span style="color:#888">Datum vystaven\xed</span><span style="font-weight:600">${t.issueDate}</span></div>
    <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px"><span style="color:#888">Datum splatnosti</span><span style="font-weight:600">${t.dueDate}</span></div>
    ${t.taxableDate?`<div style="display:flex;justify-content:space-between;font-size:11px"><span style="color:#888">Datum zdan. plněn\xed</span><span style="font-weight:600">${t.taxableDate}</span></div>`:""}
  </div>
</div>
${t.noteBeforeItems?`<div style="font-size:12px;color:#555;margin-bottom:12px;font-style:italic">${t.noteBeforeItems}</div>`:""}
<table style="width:100%;border-collapse:collapse;margin-bottom:14px">
  <thead><tr>
    <th style="text-align:left;padding:5px 8px 5px 0;font-size:9px;text-transform:uppercase;letter-spacing:0.5px;color:#aaa;font-weight:400;border-bottom:1px solid ${i}">Popis</th>
    <th style="text-align:center;padding:5px 8px;font-size:9px;text-transform:uppercase;letter-spacing:0.5px;color:#aaa;font-weight:400;border-bottom:1px solid ${i}">MJ</th>
    <th style="text-align:right;padding:5px 8px;font-size:9px;text-transform:uppercase;letter-spacing:0.5px;color:#aaa;font-weight:400;border-bottom:1px solid ${i}">Cena za MJ</th>
    ${e?`<th style="text-align:center;padding:5px 8px;font-size:9px;text-transform:uppercase;letter-spacing:0.5px;color:#aaa;font-weight:400;border-bottom:1px solid ${i}">DPH</th>`:""}
    <th style="text-align:right;padding:5px 0 5px 8px;font-size:9px;text-transform:uppercase;letter-spacing:0.5px;color:#aaa;font-weight:400;border-bottom:1px solid ${i}">Celkem bez DPH</th>
  </tr></thead>
  <tbody>${o}</tbody>
</table>
<div style="display:flex;justify-content:flex-end;margin-bottom:18px">
  <div style="min-width:280px">
    ${e?`<div style="display:grid;grid-template-columns:70px 1fr 1fr;font-size:9px;font-weight:700;color:#aaa;text-transform:uppercase;margin-bottom:5px"><span>SAZBA</span><span style="text-align:right">Z\xc1KLAD</span><span style="text-align:right">DPH</span></div>${s}`:""}
    <div style="border-top:2px solid ${i};padding-top:6px;margin-top:5px;text-align:right;font-size:20px;font-weight:700">${a(t.total,t.currency)}</div>
  </div>
</div>
${t.note?`<div style="border-left:3px solid #ccc;padding:10px 14px;font-size:11px;color:#555;margin-bottom:16px">${t.note}</div>`:""}
<div style="font-size:10px;color:#aaa;border-top:1px solid #eee;padding-top:12px;margin-top:8px">${t.footerText||"Faktura byla vystavena elektronicky a je platn\xe1 bez raz\xedtka a podpisu."}</div>
</body></html>`}(t);break;case"aurora":e=function(t){let e=t.isVatPayer,i=t.accentColor??"#7c3aed",s=t.items.map(i=>`
    <tr>
      <td style="padding:8px 6px 8px 0;border-bottom:1px solid #f0f0f0;font-size:12px">${i.name}</td>
      <td style="padding:8px 6px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:12px;color:#666">${i.quantity}${i.unit?` ${i.unit}`:""}</td>
      <td style="padding:8px 6px;border-bottom:1px solid #f0f0f0;text-align:right;font-size:12px;color:#666">${a(i.unitPrice,t.currency)}</td>
      ${e?`<td style="padding:8px 6px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:12px;color:#666">${i.vatRate} %</td>`:""}
      <td style="padding:8px 0 8px 6px;border-bottom:1px solid #f0f0f0;text-align:right;font-size:12px;font-weight:600">${a(e?i.totalWithVat:i.totalWithoutVat,t.currency)}</td>
    </tr>`).join("");return`<!DOCTYPE html><html lang="cs"><head><meta charset="UTF-8">
<style>* { margin:0;padding:0;box-sizing:border-box; } body{font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#333;background:#fff;}
.wm{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-30deg);font-size:72px;color:rgba(0,0,0,0.04);font-weight:900;white-space:nowrap;pointer-events:none;}</style></head><body>
${t.watermark?'<div class="wm">Fakturina FREE</div>':""}
<!-- HEADER -->
<div style="background:${i};padding:28px 40px 0;position:relative;overflow:hidden;min-height:160px">
  <svg style="position:absolute;bottom:0;left:0;width:100%;height:60px" viewBox="0 0 600 60" preserveAspectRatio="none">
    <path d="M0,60 L0,30 Q50,0 100,20 Q150,40 200,15 Q250,-10 300,25 Q350,55 400,20 Q450,-10 500,30 Q550,60 600,20 L600,60 Z" fill="${i}" opacity="0.5"/>
    <path d="M0,60 L0,40 Q80,10 160,35 Q240,55 320,25 Q400,-5 480,30 Q540,55 600,35 L600,60 Z" fill="rgba(0,0,0,0.15)"/>
  </svg>
  <div style="position:relative;z-index:1;display:flex;justify-content:space-between;align-items:flex-start">
    <div>
      ${t.supplier.logoUrl?`<img src="${t.supplier.logoUrl}" style="max-height:44px;max-width:140px;object-fit:contain;filter:brightness(0) invert(1);margin-bottom:12px" alt="logo">`:""}
      <div style="font-size:11px;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Daňov\xfd doklad</div>
      <div style="font-size:22px;font-weight:800;color:#fff">${p(t.type)} ${t.number}</div>
      <div style="font-size:26px;font-weight:800;color:#fff;margin-top:6px">${a(t.total,t.currency)}</div>
    </div>
    <div style="background:rgba(255,255,255,0.12);border-radius:8px;width:70px;height:70px;display:flex;align-items:center;justify-content:center">
      <div style="font-size:9px;color:rgba(255,255,255,0.6);text-align:center">QR<br>Platba</div>
    </div>
  </div>
</div>
<!-- META -->
<div style="display:grid;grid-template-columns:repeat(4,1fr);border-bottom:1px solid #eee">
  ${t.supplier.bankAccount?`<div style="padding:12px 14px;border-right:1px solid #eee"><div style="font-size:9px;color:#999;text-transform:uppercase;margin-bottom:3px">Bankovn\xed \xfačet</div><div style="font-size:12px;font-weight:600">${t.supplier.bankAccount}</div></div>`:'<div style="padding:12px 14px;border-right:1px solid #eee"></div>'}
  ${t.variableSymbol?`<div style="padding:12px 14px;border-right:1px solid #eee"><div style="font-size:9px;color:#999;text-transform:uppercase;margin-bottom:3px">Var. symbol</div><div style="font-size:12px;font-weight:600">${t.variableSymbol}</div></div>`:'<div style="padding:12px 14px;border-right:1px solid #eee"></div>'}
  <div style="padding:12px 14px;border-right:1px solid #eee"><div style="font-size:9px;color:#999;text-transform:uppercase;margin-bottom:3px">Datum splatnosti</div><div style="font-size:12px;font-weight:600">${t.dueDate}</div></div>
  <div style="padding:12px 14px"><div style="font-size:9px;color:#999;text-transform:uppercase;margin-bottom:3px">Datum vystaven\xed</div><div style="font-size:12px;font-weight:600">${t.issueDate}</div></div>
</div>
<!-- BODY -->
<div style="padding:24px 40px">
<table style="width:100%;border-collapse:collapse;margin-bottom:16px">
  <thead><tr style="background:${i}">
    <th style="text-align:left;padding:9px 10px;font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#fff;font-weight:600">Položka</th>
    <th style="text-align:center;padding:9px 8px;font-size:10px;color:#fff;font-weight:600">MJ</th>
    <th style="text-align:right;padding:9px 8px;font-size:10px;color:#fff;font-weight:600">Cena/ks</th>
    ${e?'<th style="text-align:center;padding:9px 8px;font-size:10px;color:#fff;font-weight:600">DPH</th>':""}
    <th style="text-align:right;padding:9px 10px;font-size:10px;color:#fff;font-weight:600">Celkem</th>
  </tr></thead>
  <tbody>${s}</tbody>
</table>
<div style="display:flex;justify-content:flex-end;margin-bottom:20px">
  <div style="min-width:240px">
    ${e?o(t.items,t.currency,""):""}
    <div style="display:flex;justify-content:space-between;padding:8px 0;border-top:2px solid ${i};font-size:16px;font-weight:700;color:${i}"><span>CELKEM</span><span>${a(t.total,t.currency)}</span></div>
  </div>
</div>
${t.note?`<div style="border-left:3px solid ${i};padding:10px 14px;font-size:11px;color:#555;margin-bottom:16px;background:#f5f3ff">${t.note}</div>`:""}
</div>
<!-- FOOTER -->
<div style="background:#f8fafc;border-top:1px solid #eee;padding:16px 40px;display:grid;grid-template-columns:1fr 1fr;gap:24px">
  <div>
    <div style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:700;margin-bottom:5px">DODAVATEL</div>
    <div style="font-size:11px;font-weight:700">${t.supplier.name}</div>
    <div style="font-size:10px;color:#64748b;line-height:1.6">${t.supplier.address}, ${t.supplier.zip} ${t.supplier.city}${t.supplier.ico?` &nbsp; IČO ${t.supplier.ico}`:""}${t.supplier.dic?` &nbsp; DIČ ${t.supplier.dic}`:""}</div>
  </div>
  <div>
    <div style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:700;margin-bottom:5px">ODBĚRATEL</div>
    <div style="font-size:11px;font-weight:700">${t.client.name||"—"}</div>
    <div style="font-size:10px;color:#64748b;line-height:1.6">${t.client.address}, ${t.client.zip} ${t.client.city}${t.client.ico?` &nbsp; IČO ${t.client.ico}`:""}${t.client.dic?` &nbsp; DIČ ${t.client.dic}`:""}</div>
  </div>
</div>
</body></html>`}(t);break;case"fenix":e=function(t){let e=t.isVatPayer,i=t.accentColor??"#2563eb",s=t.items.map(o=>`
    <tr>
      <td style="padding:7px 6px 7px 14px;border-bottom:1px solid #f0f0f0;font-size:12px;border-left:3px solid ${i}">${o.name}</td>
      <td style="padding:7px 8px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:12px;color:#666">${o.quantity}${o.unit?` ${o.unit}`:""}</td>
      <td style="padding:7px 8px;border-bottom:1px solid #f0f0f0;text-align:right;font-size:12px;color:#666">${a(o.unitPrice,t.currency)}</td>
      ${e?`<td style="padding:7px 8px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:12px;color:#666">${o.vatRate} %</td>`:""}
      <td style="padding:7px 8px;border-bottom:1px solid #f0f0f0;text-align:right;font-size:12px;font-weight:600">${a(e?o.totalWithVat:o.totalWithoutVat,t.currency)}</td>
    </tr>`).join("");return`<!DOCTYPE html><html lang="cs"><head><meta charset="UTF-8">
<style>* { margin:0;padding:0;box-sizing:border-box; } body{font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#333;background:#fff;padding:32px 40px;}
.wm{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-30deg);font-size:72px;color:rgba(0,0,0,0.04);font-weight:900;white-space:nowrap;pointer-events:none;}</style></head><body>
${t.watermark?'<div class="wm">Fakturina FREE</div>':""}
<div style="text-align:center;margin-bottom:20px">
  <div style="font-size:24px;font-weight:800;letter-spacing:1px;text-transform:uppercase">${p(t.type)} <span style="color:${i}">${t.number}</span></div>
  ${e?`<div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-top:2px">DAŇOV\xdd DOKLAD</div>`:""}
</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:22px">
  <div>
    <div style="font-size:11px;color:#888;margin-bottom:6px">Č\xe1stka k \xfahradě</div>
    <div style="font-size:28px;font-weight:800;color:${i};margin-bottom:10px">${a(t.total,t.currency)}</div>
    ${t.supplier.bankAccount?`<div style="font-size:13px;font-weight:700;color:${i};margin-bottom:4px">${t.supplier.bankAccount}</div>`:""}
    ${t.variableSymbol?`<div style="font-size:11px;color:#555;margin-bottom:2px">Var. symbol: <strong>${t.variableSymbol}</strong></div>`:""}
    <div style="font-size:11px;color:#555">Způsob platby: <strong>Převodem</strong></div>
  </div>
  <div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:14px">
      <div style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:700;margin-bottom:7px">ODBĚRATEL</div>
      <div style="font-size:13px;font-weight:700;margin-bottom:3px">${t.client.name||"—"}</div>
      <div style="font-size:11px;color:#555;line-height:1.7">${t.client.address}<br>${t.client.zip} ${t.client.city}</div>
      ${t.client.ico?`<div style="font-size:11px;margin-top:4px">IČO <strong>${t.client.ico}</strong>${t.client.dic?`&nbsp; DIČ <strong>${t.client.dic}</strong>`:""}</div>`:""}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px">
      <div style="font-size:10px;color:#888">Vystaven\xed<br><strong style="font-size:11px;color:#333">${t.issueDate}</strong></div>
      <div style="font-size:10px;color:#888">Splatnost<br><strong style="font-size:11px;color:#333">${t.dueDate}</strong></div>
    </div>
  </div>
</div>
<table style="width:100%;border-collapse:collapse;margin-bottom:16px">
  <thead><tr>
    <th style="text-align:left;padding:7px 14px;font-size:9px;text-transform:uppercase;letter-spacing:0.5px;color:#aaa;font-weight:400;border-bottom:1px solid #ddd">Popis</th>
    <th style="text-align:center;padding:7px 8px;font-size:9px;text-transform:uppercase;letter-spacing:0.5px;color:#aaa;font-weight:400;border-bottom:1px solid #ddd">MJ</th>
    <th style="text-align:right;padding:7px 8px;font-size:9px;text-transform:uppercase;letter-spacing:0.5px;color:#aaa;font-weight:400;border-bottom:1px solid #ddd">Cena/ks</th>
    ${e?'<th style="text-align:center;padding:7px 8px;font-size:9px;color:#aaa;font-weight:400;border-bottom:1px solid #ddd">DPH</th>':""}
    <th style="text-align:right;padding:7px 8px;font-size:9px;text-transform:uppercase;letter-spacing:0.5px;color:#aaa;font-weight:400;border-bottom:1px solid #ddd">Celkem</th>
  </tr></thead>
  <tbody>${s}</tbody>
</table>
<div style="display:flex;justify-content:flex-end;margin-bottom:20px">
  <div style="min-width:240px">
    ${e?o(t.items,t.currency,""):""}
    <div style="display:flex;justify-content:space-between;padding:8px 0;border-top:2px solid ${i};font-size:16px;font-weight:700;color:${i}"><span>CELKEM</span><span>${a(t.total,t.currency)}</span></div>
  </div>
</div>
${t.note?`<div style="border-left:3px solid ${i};padding:10px 14px;font-size:11px;color:#555;margin-bottom:16px">${t.note}</div>`:""}
<div style="border-top:1px solid #eee;padding-top:16px;margin-top:8px">
  <div style="font-size:13px;color:${i};font-weight:700;margin-bottom:4px">D\xedky!</div>
  <div style="font-size:11px;font-weight:600">${t.supplier.name}</div>
  <div style="font-size:10px;color:#888;line-height:1.6">${t.supplier.address}, ${t.supplier.zip} ${t.supplier.city}${t.supplier.ico?` &nbsp; IČO ${t.supplier.ico}`:""}</div>
  <div style="font-size:10px;color:#aaa;margin-top:8px">Faktura vystavena elektronicky — platn\xe1 bez raz\xedtka a podpisu.</div>
</div>
</body></html>`}(t);break;case"orion":e=function(t){let e=t.isVatPayer,i=t.accentColor??"#c2410c",s=t.items.map(i=>`
    <tr>
      <td style="padding:8px 10px;border-bottom:1px solid #eee;font-size:12px">${i.name}</td>
      <td style="padding:8px 8px;border-bottom:1px solid #eee;text-align:center;font-size:12px;color:#666">${i.quantity}${i.unit?` ${i.unit}`:""}</td>
      <td style="padding:8px 8px;border-bottom:1px solid #eee;text-align:right;font-size:12px;color:#666">${a(i.unitPrice,t.currency)}</td>
      ${e?`<td style="padding:8px 8px;border-bottom:1px solid #eee;text-align:center;font-size:12px;color:#666">${i.vatRate} %</td>`:""}
      <td style="padding:8px 10px;border-bottom:1px solid #eee;text-align:right;font-size:12px;font-weight:600">${a(e?i.totalWithVat:i.totalWithoutVat,t.currency)}</td>
    </tr>`).join("");return`<!DOCTYPE html><html lang="cs"><head><meta charset="UTF-8">
<style>* { margin:0;padding:0;box-sizing:border-box; } body{font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#333;background:#fff;padding:0;}
.body{padding:24px 40px;}
.wm{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-30deg);font-size:72px;color:rgba(0,0,0,0.04);font-weight:900;white-space:nowrap;pointer-events:none;}</style></head><body>
${t.watermark?'<div class="wm">Fakturina FREE</div>':""}
${t.supplier.logoUrl?`<div style="padding:16px 40px 0"><img src="${t.supplier.logoUrl}" style="max-height:44px;max-width:140px;object-fit:contain" alt="logo"></div>`:""}
<div style="background:${i};padding:14px 40px;margin-top:${t.supplier.logoUrl?"10px":"0"}">
  <div style="display:flex;justify-content:space-between;align-items:center">
    <div style="font-size:20px;font-weight:700;color:#fff">${p(t.type)} ${t.number}</div>
    <div style="font-size:12px;color:rgba(255,255,255,0.8)">${e?"Daňov\xfd doklad":""}</div>
  </div>
</div>
<div class="body">
<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:18px;margin-top:16px">
  <div>
    <div style="font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:#999;font-weight:700;margin-bottom:7px">DODAVATEL</div>
    <div style="font-size:13px;font-weight:700;margin-bottom:3px">${t.supplier.name}</div>
    <div style="font-size:11px;color:#555;line-height:1.7">${t.supplier.address}<br>${t.supplier.zip} ${t.supplier.city}</div>
    ${t.supplier.ico?`<div style="font-size:11px;margin-top:4px">IČO <strong>${t.supplier.ico}</strong>${t.supplier.dic?`&nbsp; DIČ <strong>${t.supplier.dic}</strong>`:""}</div>`:""}
    ${"non_vat"===t.supplier.vatStatus?`<div style="font-size:10px;color:#aaa;font-style:italic">Nepl\xe1tce DPH</div>`:""}
  </div>
  <div>
    <div style="font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:#999;font-weight:700;margin-bottom:7px">ODBĚRATEL</div>
    <div style="font-size:13px;font-weight:700;margin-bottom:3px">${t.client.name||"—"}</div>
    <div style="font-size:11px;color:#555;line-height:1.7">${t.client.address}<br>${t.client.zip} ${t.client.city}</div>
    ${t.client.ico?`<div style="font-size:11px;margin-top:4px">IČO <strong>${t.client.ico}</strong>${t.client.dic?`&nbsp; DIČ <strong>${t.client.dic}</strong>`:""}</div>`:""}
  </div>
</div>
<div style="background:${i}15;border-radius:6px;padding:10px 14px;margin-bottom:18px;display:grid;grid-template-columns:1fr 1fr;gap:12px">
  <div>
    ${t.supplier.bankAccount?`<div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px"><span style="color:#888">Bankovn\xed \xfačet</span><span style="font-weight:700;color:${i}">${t.supplier.bankAccount}</span></div>`:""}
    ${t.variableSymbol?`<div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px"><span style="color:#888">Var. symbol</span><span style="font-weight:700;color:${i}">${t.variableSymbol}</span></div>`:""}
    <div style="display:flex;justify-content:space-between;font-size:11px"><span style="color:#888">Způsob platby</span><span style="font-weight:600">Převodem</span></div>
  </div>
  <div>
    <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px"><span style="color:#888">Datum vystaven\xed</span><span style="font-weight:600">${t.issueDate}</span></div>
    <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px"><span style="color:#888">Datum splatnosti</span><span style="font-weight:700;color:${i}">${t.dueDate}</span></div>
    ${t.taxableDate?`<div style="display:flex;justify-content:space-between;font-size:11px"><span style="color:#888">Datum zdan. plněn\xed</span><span style="font-weight:600">${t.taxableDate}</span></div>`:""}
  </div>
</div>
<table style="width:100%;border-collapse:collapse;margin-bottom:16px">
  <thead><tr style="background:${i}">
    <th style="text-align:left;padding:8px 10px;font-size:10px;text-transform:uppercase;letter-spacing:0.4px;color:#fff;font-weight:600">Popis</th>
    <th style="text-align:center;padding:8px;font-size:10px;color:#fff;font-weight:600">MJ</th>
    <th style="text-align:right;padding:8px;font-size:10px;color:#fff;font-weight:600">Cena/ks</th>
    ${e?'<th style="text-align:center;padding:8px;font-size:10px;color:#fff;font-weight:600">DPH</th>':""}
    <th style="text-align:right;padding:8px 10px;font-size:10px;color:#fff;font-weight:600">Celkem</th>
  </tr></thead>
  <tbody>${s}</tbody>
</table>
<div style="display:flex;justify-content:flex-end;margin-bottom:16px">
  <div style="min-width:240px">
    ${e?o(t.items,t.currency,""):""}
    <div style="display:flex;justify-content:space-between;padding:8px 0;border-top:2px solid ${i};font-size:18px;font-weight:700;color:${i}"><span>CELKEM</span><span>${a(t.total,t.currency)}</span></div>
  </div>
</div>
${t.note?`<div style="border-left:3px solid ${i};padding:10px 14px;font-size:11px;color:#555;margin-bottom:14px">${t.note}</div>`:""}
<div style="font-size:10px;color:#aaa;border-top:1px solid #eee;padding-top:10px">Faktura byla vystavena elektronicky a je platn\xe1 bez raz\xedtka a podpisu.</div>
</div>
</body></html>`}(t);break;case"lyra":e=function(t){let e=t.isVatPayer,i=t.accentColor??"#c2410c",s=t.items.map(o=>`
    <tr>
      <td style="padding:8px 8px 8px 14px;border-bottom:1px solid #f0f0f0;font-size:12px;border-left:3px solid ${i}">${o.name}</td>
      <td style="padding:8px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:12px;color:#666">${o.quantity}${o.unit?` ${o.unit}`:""}</td>
      <td style="padding:8px;border-bottom:1px solid #f0f0f0;text-align:right;font-size:12px;color:#666">${a(o.unitPrice,t.currency)}</td>
      ${e?`<td style="padding:8px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:12px;color:#666">${o.vatRate} %</td>`:""}
      <td style="padding:8px;border-bottom:1px solid #f0f0f0;text-align:right;font-size:12px;font-weight:600">${a(e?o.totalWithVat:o.totalWithoutVat,t.currency)}</td>
    </tr>`).join("");return`<!DOCTYPE html><html lang="cs"><head><meta charset="UTF-8">
<style>* { margin:0;padding:0;box-sizing:border-box; } body{font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#333;background:#fff;padding:32px 40px;}
.wm{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-30deg);font-size:72px;color:rgba(0,0,0,0.04);font-weight:900;white-space:nowrap;pointer-events:none;}</style></head><body>
${t.watermark?'<div class="wm">Fakturina FREE</div>':""}
<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">
  <div>
    <div style="font-size:22px;font-weight:900;letter-spacing:-0.5px;text-transform:uppercase">${p(t.type)} <span style="color:${i}">${t.number}</span></div>
    ${e?`<div style="font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#aaa;margin-top:2px">DAŇOV\xdd DOKLAD</div>`:""}
  </div>
  <div style="background:#f8fafc;border:2px solid #e2e8f0;border-radius:8px;padding:10px;display:flex;align-items:center;justify-content:center;width:52px;height:52px">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="17" rx="2" stroke="${i}" stroke-width="2"/><path d="M7 8h10M7 12h7M7 16h5" stroke="${i}" stroke-width="1.5" stroke-linecap="round"/></svg>
  </div>
</div>
<div style="height:3px;background:${i};margin-bottom:18px;border-radius:2px"></div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px">
  <div style="display:flex;gap:10px">
    <div style="writing-mode:vertical-rl;text-orientation:mixed;transform:rotate(180deg);font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#ccc;white-space:nowrap;align-self:center">DODAVATEL</div>
    <div>
      <div style="font-size:13px;font-weight:700;margin-bottom:3px">${t.supplier.name}</div>
      <div style="font-size:11px;color:#555;line-height:1.7">${t.supplier.address}<br>${t.supplier.zip} ${t.supplier.city}</div>
      ${t.supplier.ico?`<div style="font-size:11px;margin-top:4px">IČO <strong>${t.supplier.ico}</strong>${t.supplier.dic?`&nbsp; DIČ <strong>${t.supplier.dic}</strong>`:""}</div>`:""}
      ${"non_vat"===t.supplier.vatStatus?`<div style="font-size:10px;color:#aaa;font-style:italic">Nepl\xe1tce DPH</div>`:""}
    </div>
  </div>
  <div style="display:flex;gap:10px">
    <div style="writing-mode:vertical-rl;text-orientation:mixed;transform:rotate(180deg);font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#ccc;white-space:nowrap;align-self:center">ODBĚRATEL</div>
    <div>
      <div style="font-size:13px;font-weight:700;margin-bottom:3px">${t.client.name||"—"}</div>
      <div style="font-size:11px;color:#555;line-height:1.7">${t.client.address}<br>${t.client.zip} ${t.client.city}</div>
      ${t.client.ico?`<div style="font-size:11px;margin-top:4px">IČO <strong>${t.client.ico}</strong>${t.client.dic?`&nbsp; DIČ <strong>${t.client.dic}</strong>`:""}</div>`:""}
    </div>
  </div>
</div>
<div style="margin-bottom:18px">
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:5px">
    <span style="display:inline-block;width:16px;height:16px;background:${i}20;border-radius:3px;flex-shrink:0;text-align:center;line-height:16px;font-size:9px;color:${i}">📅</span>
    <span style="font-size:11px;color:#888;min-width:130px">Datum vystaven\xed</span>
    <span style="font-size:11px;font-weight:600">${t.issueDate}</span>
  </div>
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:5px">
    <span style="display:inline-block;width:16px;height:16px;background:${i}20;border-radius:3px;flex-shrink:0;text-align:center;line-height:16px;font-size:9px;color:${i}">📅</span>
    <span style="font-size:11px;color:#888;min-width:130px">Datum splatnosti</span>
    <span style="font-size:11px;font-weight:700;color:${i}">${t.dueDate}</span>
  </div>
  ${t.taxableDate?`<div style="display:flex;align-items:center;gap:10px;margin-bottom:5px">
    <span style="display:inline-block;width:16px;height:16px;background:${i}20;border-radius:3px;flex-shrink:0"></span>
    <span style="font-size:11px;color:#888;min-width:130px">Datum zdan. plněn\xed</span>
    <span style="font-size:11px;font-weight:600">${t.taxableDate}</span>
  </div>`:""}
  ${t.supplier.bankAccount?`<div style="display:flex;align-items:center;gap:10px;margin-bottom:5px">
    <span style="display:inline-block;width:16px;height:16px;background:${i}20;border-radius:3px;flex-shrink:0;text-align:center;line-height:16px;font-size:9px;color:${i}">💳</span>
    <span style="font-size:11px;color:#888;min-width:130px">Bankovn\xed \xfačet</span>
    <span style="font-size:11px;font-weight:700;color:${i}">${t.supplier.bankAccount}</span>
  </div>`:""}
  ${t.variableSymbol?`<div style="display:flex;align-items:center;gap:10px">
    <span style="display:inline-block;width:16px;height:16px;background:${i}20;border-radius:3px;flex-shrink:0"></span>
    <span style="font-size:11px;color:#888;min-width:130px">Variabiln\xed symbol</span>
    <span style="font-size:11px;font-weight:600;color:${i}">${t.variableSymbol}</span>
  </div>`:""}
</div>
<table style="width:100%;border-collapse:collapse;margin-bottom:16px">
  <thead><tr>
    <th style="text-align:left;padding:6px 14px;font-size:9px;text-transform:uppercase;letter-spacing:0.5px;color:#aaa;font-weight:400;border-bottom:1px solid #ddd">Popis</th>
    <th style="text-align:center;padding:6px 8px;font-size:9px;color:#aaa;font-weight:400;border-bottom:1px solid #ddd">MJ</th>
    <th style="text-align:right;padding:6px 8px;font-size:9px;color:#aaa;font-weight:400;border-bottom:1px solid #ddd">Cena/ks</th>
    ${e?'<th style="text-align:center;padding:6px 8px;font-size:9px;color:#aaa;font-weight:400;border-bottom:1px solid #ddd">DPH</th>':""}
    <th style="text-align:right;padding:6px 8px;font-size:9px;color:#aaa;font-weight:400;border-bottom:1px solid #ddd">Celkem</th>
  </tr></thead>
  <tbody>${s}</tbody>
</table>
<div style="display:flex;justify-content:flex-end;margin-bottom:16px">
  <div style="min-width:240px">
    ${e?o(t.items,t.currency,""):""}
    <div style="display:flex;justify-content:space-between;padding:8px 0;border-top:2px solid ${i};font-size:16px;font-weight:700;color:${i}"><span>CELKEM</span><span>${a(t.total,t.currency)}</span></div>
  </div>
</div>
${t.note?`<div style="border-left:3px solid ${i};padding:10px 14px;font-size:11px;color:#555;margin-bottom:14px">${t.note}</div>`:""}
<div style="border-top:1px solid #eee;padding-top:12px;margin-top:8px">
  <div style="font-size:13px;color:${i};font-weight:700;margin-bottom:3px">D\xedky!</div>
  <div style="font-size:11px;font-weight:600">${t.supplier.name}</div>
  <div style="font-size:10px;color:#888">${t.supplier.address}, ${t.supplier.zip} ${t.supplier.city}${t.supplier.ico?` &nbsp; IČO ${t.supplier.ico}`:""}</div>
  <div style="font-size:10px;color:#aaa;margin-top:8px">Faktura vystavena elektronicky — platn\xe1 bez raz\xedtka a podpisu.</div>
</div>
</body></html>`}(t);break;case"vega":e=function(t){let e=t.isVatPayer,i=t.accentColor??"#c2410c",s=t.items.map(i=>`
    <tr>
      <td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;font-size:12px">${i.name}</td>
      <td style="padding:8px 8px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:12px;color:#666">${i.quantity}${i.unit?` ${i.unit}`:""}</td>
      <td style="padding:8px 8px;border-bottom:1px solid #f0f0f0;text-align:right;font-size:12px;color:#666">${a(i.unitPrice,t.currency)}</td>
      ${e?`<td style="padding:8px 8px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:12px;color:#666">${i.vatRate} %</td>`:""}
      <td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;text-align:right;font-size:12px;font-weight:600">${a(e?i.totalWithVat:i.totalWithoutVat,t.currency)}</td>
    </tr>`).join("");return`<!DOCTYPE html><html lang="cs"><head><meta charset="UTF-8">
<style>* { margin:0;padding:0;box-sizing:border-box; } body{font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#333;background:#fff;padding:0;}
.body{padding:22px 40px;}
.wm{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-30deg);font-size:72px;color:rgba(0,0,0,0.04);font-weight:900;white-space:nowrap;pointer-events:none;}</style></head><body>
${t.watermark?'<div class="wm">Fakturina FREE</div>':""}
<!-- TOP BAND -->
<div style="background:${i};padding:20px 40px;display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:center">
  <div>
    <div style="font-size:22px;font-weight:800;color:#fff;text-transform:uppercase;letter-spacing:0.5px">${p(t.type)} ${t.number}</div>
    <div style="font-size:11px;color:rgba(255,255,255,0.7);margin-top:2px">${e?"Daňov\xfd doklad":""}</div>
    ${t.supplier.logoUrl?`<img src="${t.supplier.logoUrl}" style="max-height:36px;max-width:120px;object-fit:contain;filter:brightness(0) invert(1);margin-top:10px" alt="logo">`:""}
  </div>
  <div style="text-align:right">
    <div style="font-size:11px;color:rgba(255,255,255,0.7);margin-bottom:2px">Č\xe1stka k \xfahradě</div>
    <div style="font-size:26px;font-weight:800;color:#fff">${a(t.total,t.currency)}</div>
    ${t.supplier.bankAccount?`<div style="font-size:11px;color:rgba(255,255,255,0.85);margin-top:4px">${t.supplier.bankAccount}</div>`:""}
    ${t.variableSymbol?`<div style="font-size:11px;color:rgba(255,255,255,0.7)">VS: ${t.variableSymbol}</div>`:""}
    <div style="font-size:11px;color:rgba(255,255,255,0.7)">Převodem</div>
  </div>
</div>
<!-- DATE BAND -->
<div style="background:${i}18;display:grid;grid-template-columns:1fr 1fr 1fr;border-bottom:1px solid ${i}30">
  <div style="padding:10px 14px;border-right:1px solid ${i}30">
    <div style="font-size:9px;color:#888;text-transform:uppercase;margin-bottom:2px">Datum vystaven\xed</div>
    <div style="font-size:12px;font-weight:600">${t.issueDate}</div>
  </div>
  <div style="padding:10px 14px;border-right:1px solid ${i}30;background:${i}25">
    <div style="font-size:9px;color:#888;text-transform:uppercase;margin-bottom:2px">Datum splatnosti</div>
    <div style="font-size:12px;font-weight:700;color:${i}">${t.dueDate}</div>
  </div>
  <div style="padding:10px 14px">
    <div style="font-size:9px;color:#888;text-transform:uppercase;margin-bottom:2px">${t.taxableDate?"Datum zdan. plněn\xed":"Způsob platby"}</div>
    <div style="font-size:12px;font-weight:600">${t.taxableDate||"Převodem"}</div>
  </div>
</div>
<!-- BODY -->
<div class="body">
  <div style="border:1px solid #e2e8f0;border-radius:6px;padding:14px;margin-bottom:18px;display:grid;grid-template-columns:1fr 1fr;gap:16px">
    <div>
      <div style="font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:#94a3b8;font-weight:700;margin-bottom:6px">ODBĚRATEL</div>
      <div style="font-size:13px;font-weight:700;margin-bottom:3px">${t.client.name||"—"}</div>
      <div style="font-size:11px;color:#555;line-height:1.7">${t.client.address}<br>${t.client.zip} ${t.client.city}</div>
      ${t.client.ico?`<div style="font-size:11px;margin-top:4px">IČO <strong>${t.client.ico}</strong>${t.client.dic?`&nbsp; DIČ <strong>${t.client.dic}</strong>`:""}</div>`:""}
    </div>
    <div style="display:grid;align-content:center">
      ${t.supplier.iban?`<div style="font-size:10px;color:#888;margin-bottom:2px">IBAN</div><div style="font-size:11px;font-weight:600;margin-bottom:8px">${t.supplier.iban}</div>`:""}
      ${t.supplier.swift?`<div style="font-size:10px;color:#888;margin-bottom:2px">SWIFT/BIC</div><div style="font-size:11px;font-weight:600">${t.supplier.swift}</div>`:""}
    </div>
  </div>
  <table style="width:100%;border-collapse:collapse;margin-bottom:14px">
    <thead><tr style="background:#f8fafc;border-top:2px solid ${i}">
      <th style="text-align:left;padding:8px 10px;font-size:9px;text-transform:uppercase;letter-spacing:0.4px;color:#888;font-weight:600">Popis</th>
      <th style="text-align:center;padding:8px;font-size:9px;color:#888;font-weight:600">MJ</th>
      <th style="text-align:right;padding:8px;font-size:9px;color:#888;font-weight:600">Cena/ks</th>
      ${e?'<th style="text-align:center;padding:8px;font-size:9px;color:#888;font-weight:600">DPH</th>':""}
      <th style="text-align:right;padding:8px 10px;font-size:9px;color:#888;font-weight:600">Celkem</th>
    </tr></thead>
    <tbody>${s}</tbody>
  </table>
  <div style="display:flex;justify-content:flex-end;margin-bottom:16px">
    <div style="min-width:240px">
      ${e?o(t.items,t.currency,""):""}
      <div style="display:flex;justify-content:space-between;padding:8px 0;border-top:2px solid ${i};font-size:18px;font-weight:700;color:${i}"><span>CELKEM</span><span>${a(t.total,t.currency)}</span></div>
    </div>
  </div>
  ${t.note?`<div style="border-left:3px solid ${i};padding:10px 14px;font-size:11px;color:#555;margin-bottom:14px">${t.note}</div>`:""}
</div>
<!-- FOOTER -->
<div style="background:#f8fafc;border-top:1px solid #eee;padding:16px 40px;display:grid;grid-template-columns:1fr auto;gap:16px;align-items:center">
  <div>
    <div style="font-size:13px;color:${i};font-weight:700;margin-bottom:3px">D\xedky!</div>
    <div style="font-size:11px;font-weight:600">${t.supplier.name}</div>
    <div style="font-size:10px;color:#888">${t.supplier.address}, ${t.supplier.zip} ${t.supplier.city}${t.supplier.ico?` &nbsp; IČO ${t.supplier.ico}`:""}</div>
  </div>
  <div style="font-size:10px;color:#ccc;text-align:right">Vystaveno elektronicky</div>
</div>
</body></html>`}(t);break;case"fakturoid":e=function(t){let e=t.isVatPayer,i=t.items.map(i=>`
    <tr>
      <td style="padding:8px 10px;border-bottom:1px solid #eee;font-size:12px">${i.name}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #eee;text-align:center;font-size:12px">${i.quantity}${i.unit?` ${i.unit}`:""}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #eee;text-align:right;font-size:12px">${a(i.unitPrice,t.currency)}</td>
      ${e?`<td style="padding:8px 10px;border-bottom:1px solid #eee;text-align:center;font-size:12px">${i.vatRate} %</td>`:""}
      <td style="padding:8px 10px;border-bottom:1px solid #eee;text-align:right;font-size:12px;font-weight:600">${a(e?i.totalWithVat:i.totalWithoutVat,t.currency)}</td>
    </tr>`).join("");return`<!DOCTYPE html><html lang="cs"><head><meta charset="UTF-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, Helvetica, sans-serif; font-size:13px; color:#333; background:#fff; padding:30px 40px; }
  .top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:28px; border-bottom:3px solid #2d6a4f; padding-bottom:20px; }
  .logo { max-height:55px; max-width:160px; object-fit:contain; }
  .doc-title { text-align:right; }
  .doc-title h1 { font-size:22px; font-weight:700; color:#2d6a4f; margin-bottom:4px; }
  .doc-title .num { font-size:14px; color:#666; }
  .parties { display:grid; grid-template-columns:1fr 1fr; gap:30px; margin-bottom:24px; }
  .party-label { font-size:10px; text-transform:uppercase; letter-spacing:1px; color:#999; font-weight:700; margin-bottom:8px; border-bottom:1px solid #eee; padding-bottom:4px; }
  .party-name { font-size:14px; font-weight:700; color:#222; margin-bottom:4px; }
  .party p { font-size:12px; color:#555; line-height:1.6; }
  .meta-row { display:flex; gap:0; margin-bottom:24px; background:#f9f9f9; border:1px solid #eee; border-radius:4px; overflow:hidden; }
  .meta-cell { flex:1; padding:10px 14px; border-right:1px solid #eee; }
  .meta-cell:last-child { border-right:none; }
  .meta-cell .lbl { font-size:10px; text-transform:uppercase; color:#999; letter-spacing:0.5px; margin-bottom:3px; }
  .meta-cell .val { font-size:13px; font-weight:600; color:#222; }
  table { width:100%; border-collapse:collapse; margin-bottom:20px; }
  thead th { background:#2d6a4f; color:#fff; padding:9px 10px; font-size:11px; text-transform:uppercase; letter-spacing:0.5px; text-align:left; }
  thead th:not(:first-child) { text-align:center; }
  thead th:last-child { text-align:right; }
  .totals { display:flex; justify-content:flex-end; margin-bottom:24px; }
  .totals-inner { min-width:260px; border:1px solid #eee; border-radius:4px; overflow:hidden; }
  .totals-row { display:flex; justify-content:space-between; padding:8px 14px; border-bottom:1px solid #eee; font-size:13px; }
  .totals-row:last-child { border-bottom:none; background:#2d6a4f; color:#fff; font-weight:700; font-size:15px; }
  .payment { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px; }
  .payment-box { background:#f9f9f9; border:1px solid #eee; border-radius:4px; padding:14px; }
  .payment-box .lbl { font-size:10px; text-transform:uppercase; color:#999; letter-spacing:0.5px; margin-bottom:8px; font-weight:700; }
  .payment-row { display:flex; justify-content:space-between; font-size:12px; margin-bottom:5px; }
  .payment-row span:last-child { font-weight:600; }
  .note { background:#fff8e1; border-left:3px solid #ffc107; padding:12px 14px; font-size:12px; color:#555; margin-bottom:20px; }
  .footer { text-align:center; font-size:11px; color:#aaa; border-top:1px solid #eee; padding-top:14px; margin-top:20px; }
  .watermark { position:fixed; top:50%; left:50%; transform:translate(-50%,-50%) rotate(-30deg); font-size:72px; color:rgba(0,0,0,0.04); font-weight:900; white-space:nowrap; pointer-events:none; }
</style></head><body>
${t.watermark?'<div class="watermark">Fakturina.cz FREE</div>':""}
<div class="top">
  <div>${t.supplier.logoUrl?`<img src="${t.supplier.logoUrl}" class="logo" alt="logo">`:`<div style="font-size:20px;font-weight:700;color:#2d6a4f">${t.supplier.name}</div>`}</div>
  <div class="doc-title"><h1>${p(t.type)}</h1><div class="num">č. ${t.number}</div></div>
</div>
<div class="parties">
  <div>
    <div class="party-label">Dodavatel</div>
    <div class="party-name">${t.supplier.name}</div>
    <p>${t.supplier.address}<br>${t.supplier.zip} ${t.supplier.city}</p>
    ${t.supplier.ico?`<p style="margin-top:6px">IČ: <strong>${t.supplier.ico}</strong></p>`:""}
    ${t.supplier.dic?`<p>DIČ: <strong>${t.supplier.dic}</strong></p>`:""}
    ${"non_vat"===t.supplier.vatStatus?`<p style="color:#888;font-style:italic;margin-top:4px">Nepl\xe1tce DPH</p>`:""}
  </div>
  <div>
    <div class="party-label">Odběratel</div>
    <div class="party-name">${t.client.name||"—"}</div>
    <p>${t.client.address}<br>${t.client.zip} ${t.client.city}</p>
    ${t.client.ico?`<p style="margin-top:6px">IČ: <strong>${t.client.ico}</strong></p>`:""}
    ${t.client.dic?`<p>DIČ: <strong>${t.client.dic}</strong></p>`:""}
  </div>
</div>
<div class="meta-row">
  <div class="meta-cell"><div class="lbl">Datum vystaven\xed</div><div class="val">${t.issueDate}</div></div>
  <div class="meta-cell"><div class="lbl">Datum splatnosti</div><div class="val">${t.dueDate}</div></div>
  ${t.taxableDate?`<div class="meta-cell"><div class="lbl">DUZP</div><div class="val">${t.taxableDate}</div></div>`:""}
  ${t.variableSymbol?`<div class="meta-cell"><div class="lbl">Variabiln\xed symbol</div><div class="val">${t.variableSymbol}</div></div>`:""}
</div>
<table>
  <thead><tr>
    <th style="width:42%;text-align:left">Položka</th>
    <th>Množstv\xed</th>
    <th>Cena/ks</th>
    ${e?"<th>DPH</th>":""}
    <th>Celkem</th>
  </tr></thead>
  <tbody>${i}</tbody>
</table>
<div class="totals"><div class="totals-inner">
  ${e?o(t.items,t.currency,"totals-row"):""}
  <div class="totals-row"><span>CELKEM K \xdaHRADĚ</span><span>${a(t.total,t.currency)}</span></div>
</div></div>
<div class="payment">
  <div class="payment-box">
    <div class="lbl">Platebn\xed \xfadaje</div>
    ${t.supplier.bankAccount?`<div class="payment-row"><span>Č\xedslo \xfačtu</span><span>${t.supplier.bankAccount}</span></div>`:""}
    ${t.supplier.iban?`<div class="payment-row"><span>IBAN</span><span>${t.supplier.iban}</span></div>`:""}
    ${t.supplier.swift?`<div class="payment-row"><span>SWIFT/BIC</span><span>${t.supplier.swift}</span></div>`:""}
    ${t.variableSymbol?`<div class="payment-row"><span>Var. symbol</span><span>${t.variableSymbol}</span></div>`:""}
    <div class="payment-row" style="border-top:1px solid #ddd;padding-top:6px;margin-top:6px"><span>K \xfahradě</span><span style="color:#2d6a4f;font-size:14px">${a(t.total,t.currency)}</span></div>
  </div>
  <div class="payment-box" style="display:flex;align-items:center;justify-content:center">
    <div style="text-align:center"><div style="width:80px;height:80px;background:#f0f0f0;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#aaa;margin:0 auto 6px">QR platba</div><div style="font-size:10px;color:#aaa">Naskenujte QR k\xf3d</div></div>
  </div>
</div>
${t.note?`<div class="note"><strong>Pozn\xe1mka:</strong> ${t.note}</div>`:""}
<div class="footer">Faktura byla vystavena elektronicky a je platn\xe1 bez raz\xedtka a podpisu.${t.watermark?"<br>Vystaveno přes Fakturina.cz":""}</div>
</body></html>`}(t);break;case"minimal":e=function(t){let e=t.isVatPayer,i=t.items.map(i=>`
    <tr>
      <td style="padding:9px 0;border-bottom:1px solid #f0f0f0;font-size:12px">${i.name}</td>
      <td style="padding:9px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-size:12px;color:#666">${i.quantity}${i.unit?` ${i.unit}`:""}</td>
      <td style="padding:9px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-size:12px;color:#666">${a(i.unitPrice,t.currency)}</td>
      ${e?`<td style="padding:9px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-size:12px;color:#666">${i.vatRate} %</td>`:""}
      <td style="padding:9px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-size:12px;font-weight:600">${a(e?i.totalWithVat:i.totalWithoutVat,t.currency)}</td>
    </tr>`).join("");return`<!DOCTYPE html><html lang="cs"><head><meta charset="UTF-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Helvetica Neue',Arial,sans-serif; font-size:12px; color:#222; background:#fff; padding:48px 56px; }
  .header { display:flex; justify-content:space-between; margin-bottom:48px; }
  .logo { max-height:48px; max-width:150px; object-fit:contain; }
  .title { text-align:right; }
  .title h1 { font-size:28px; font-weight:300; letter-spacing:4px; color:#111; text-transform:uppercase; }
  .title .num { font-size:12px; color:#aaa; margin-top:4px; letter-spacing:1px; }
  hr { border:none; border-top:1px solid #ddd; margin:0 0 28px; }
  .parties { display:grid; grid-template-columns:1fr 1fr; gap:40px; margin-bottom:32px; }
  .party-lbl { font-size:9px; letter-spacing:2px; text-transform:uppercase; color:#aaa; margin-bottom:10px; }
  .party-name { font-size:13px; font-weight:600; margin-bottom:4px; }
  .party p { font-size:12px; color:#555; line-height:1.7; }
  .meta { display:flex; gap:40px; margin-bottom:36px; }
  .meta-item .lbl { font-size:9px; letter-spacing:1.5px; text-transform:uppercase; color:#aaa; margin-bottom:4px; }
  .meta-item .val { font-size:12px; font-weight:600; }
  table { width:100%; border-collapse:collapse; margin-bottom:24px; }
  thead th { font-size:9px; letter-spacing:1.5px; text-transform:uppercase; color:#aaa; padding:0 0 10px; text-align:left; border-bottom:1px solid #ddd; font-weight:400; }
  thead th:not(:first-child) { text-align:right; }
  .totals { display:flex; justify-content:flex-end; margin-bottom:32px; }
  .totals-box { min-width:200px; }
  .t-row { display:flex; justify-content:space-between; font-size:12px; color:#666; margin-bottom:4px; }
  .t-total { display:flex; justify-content:space-between; font-size:16px; font-weight:600; border-top:1px solid #222; padding-top:10px; margin-top:8px; }
  .payment .lbl { font-size:9px; letter-spacing:2px; text-transform:uppercase; color:#aaa; margin-bottom:10px; }
  .pay-row { display:flex; justify-content:space-between; font-size:12px; margin-bottom:5px; color:#444; }
  .note { border-left:2px solid #ddd; padding:10px 14px; font-size:12px; color:#666; margin:20px 0; }
  .footer { text-align:center; font-size:10px; color:#ccc; border-top:1px solid #eee; padding-top:16px; margin-top:24px; letter-spacing:0.5px; }
  .watermark { position:fixed; top:50%; left:50%; transform:translate(-50%,-50%) rotate(-30deg); font-size:72px; color:rgba(0,0,0,0.03); font-weight:900; white-space:nowrap; pointer-events:none; }
</style></head><body>
${t.watermark?'<div class="watermark">Fakturina.cz FREE</div>':""}
<div class="header">
  <div>${t.supplier.logoUrl?`<img src="${t.supplier.logoUrl}" class="logo" alt="logo">`:`<div style="font-size:18px;font-weight:600;letter-spacing:1px">${t.supplier.name}</div>`}</div>
  <div class="title"><h1>${p(t.type)}</h1><div class="num">${t.number}</div></div>
</div>
<hr>
<div class="parties">
  <div>
    <div class="party-lbl">Dodavatel</div>
    <div class="party-name">${t.supplier.name}</div>
    <p>${t.supplier.address}<br>${t.supplier.zip} ${t.supplier.city}</p>
    ${t.supplier.ico?`<p style="margin-top:5px">IČ: ${t.supplier.ico}</p>`:""}
    ${t.supplier.dic?`<p>DIČ: ${t.supplier.dic}</p>`:""}
    ${"non_vat"===t.supplier.vatStatus?`<p style="color:#aaa;font-style:italic">Nepl\xe1tce DPH</p>`:""}
  </div>
  <div>
    <div class="party-lbl">Odběratel</div>
    <div class="party-name">${t.client.name||"—"}</div>
    <p>${t.client.address}<br>${t.client.zip} ${t.client.city}</p>
    ${t.client.ico?`<p style="margin-top:5px">IČ: ${t.client.ico}</p>`:""}
    ${t.client.dic?`<p>DIČ: ${t.client.dic}</p>`:""}
  </div>
</div>
<div class="meta">
  <div class="meta-item"><div class="lbl">Vystaveno</div><div class="val">${t.issueDate}</div></div>
  <div class="meta-item"><div class="lbl">Splatnost</div><div class="val">${t.dueDate}</div></div>
  ${t.taxableDate?`<div class="meta-item"><div class="lbl">DUZP</div><div class="val">${t.taxableDate}</div></div>`:""}
  ${t.variableSymbol?`<div class="meta-item"><div class="lbl">Var. symbol</div><div class="val">${t.variableSymbol}</div></div>`:""}
</div>
<table>
  <thead><tr>
    <th style="width:42%">Položka</th><th style="text-align:right">Mn.</th><th style="text-align:right">Cena/ks</th>
    ${e?'<th style="text-align:right">DPH</th>':""}
    <th style="text-align:right">Celkem</th>
  </tr></thead>
  <tbody>${i}</tbody>
</table>
<div class="totals"><div class="totals-box">
  ${e?o(t.items,t.currency,"t-row"):""}
  <div class="t-total"><span>Celkem k \xfahradě</span><span>${a(t.total,t.currency)}</span></div>
</div></div>
${t.supplier.bankAccount||t.supplier.iban?`<div class="payment">
  <div class="lbl">Platebn\xed \xfadaje</div>
  ${t.supplier.bankAccount?`<div class="pay-row"><span>Č\xedslo \xfačtu</span><span>${t.supplier.bankAccount}</span></div>`:""}
  ${t.supplier.iban?`<div class="pay-row"><span>IBAN</span><span>${t.supplier.iban}</span></div>`:""}
  ${t.variableSymbol?`<div class="pay-row"><span>Var. symbol</span><span>${t.variableSymbol}</span></div>`:""}
</div>`:""}
${t.note?`<div class="note">${t.note}</div>`:""}
<div class="footer">FAKTURA VYSTAVENA ELEKTRONICKY — PLATN\xc1 BEZ RAZ\xcdTKA A PODPISU${t.watermark?" — FAKTURINA.CZ":""}</div>
</body></html>`}(t);break;case"classic":e=function(t){let e=t.isVatPayer,i=t.items.map(i=>`
    <tr>
      <td style="padding:9px 12px;border-bottom:1px solid #eee;font-size:12px">${i.name}</td>
      <td style="padding:9px 8px;border-bottom:1px solid #eee;text-align:right;font-size:12px">${i.quantity}${i.unit?` ${i.unit}`:""}</td>
      <td style="padding:9px 8px;border-bottom:1px solid #eee;text-align:right;font-size:12px">${a(i.unitPrice,t.currency)}</td>
      ${e?`<td style="padding:9px 8px;border-bottom:1px solid #eee;text-align:right;font-size:12px">${i.vatRate} %</td>`:""}
      <td style="padding:9px 12px;border-bottom:1px solid #eee;text-align:right;font-size:12px;font-weight:700">${a(e?i.totalWithVat:i.totalWithoutVat,t.currency)}</td>
    </tr>`).join("");return`<!DOCTYPE html><html lang="cs"><head><meta charset="UTF-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:Arial,Helvetica,sans-serif; font-size:12px; color:#333; background:#fff; }
  .header-bar { background:#1e293b; color:#fff; padding:24px 40px; display:flex; justify-content:space-between; align-items:center; }
  .header-bar h1 { font-size:24px; font-weight:700; letter-spacing:2px; }
  .header-bar .num { font-size:13px; color:#94a3b8; margin-top:3px; }
  .logo { max-height:50px; max-width:150px; object-fit:contain; filter:brightness(0) invert(1); }
  .body { padding:32px 40px; }
  .parties { display:grid; grid-template-columns:1fr 1fr; gap:32px; margin-bottom:24px; background:#f8fafc; padding:20px; border-radius:4px; }
  .party-lbl { font-size:9px; text-transform:uppercase; letter-spacing:1.5px; color:#64748b; font-weight:700; margin-bottom:8px; }
  .party-name { font-size:13px; font-weight:700; color:#0f172a; margin-bottom:5px; }
  .party p { font-size:11px; color:#475569; line-height:1.7; }
  .meta { display:flex; gap:32px; margin-bottom:24px; border-bottom:2px solid #1e293b; padding-bottom:16px; }
  .meta-item .lbl { font-size:9px; text-transform:uppercase; letter-spacing:1px; color:#94a3b8; margin-bottom:3px; }
  .meta-item .val { font-size:13px; font-weight:600; color:#1e293b; }
  table { width:100%; border-collapse:collapse; margin-bottom:20px; }
  thead tr { background:#1e293b; }
  thead th { padding:10px 12px; font-size:10px; text-transform:uppercase; letter-spacing:0.5px; color:#fff; text-align:left; }
  thead th:not(:first-child) { text-align:right; }
  .totals { display:flex; justify-content:flex-end; margin-bottom:24px; }
  .totals-box { min-width:240px; border:2px solid #1e293b; border-radius:4px; overflow:hidden; }
  .t-row { display:flex; justify-content:space-between; padding:7px 14px; font-size:12px; color:#475569; border-bottom:1px solid #e2e8f0; }
  .t-total { display:flex; justify-content:space-between; padding:12px 14px; font-size:16px; font-weight:700; background:#1e293b; color:#fff; }
  .payment { background:#f8fafc; border:1px solid #e2e8f0; border-radius:4px; padding:16px; margin-bottom:16px; }
  .pay-lbl { font-size:9px; text-transform:uppercase; letter-spacing:1px; color:#94a3b8; font-weight:700; margin-bottom:10px; }
  .pay-row { display:flex; justify-content:space-between; font-size:12px; color:#475569; margin-bottom:5px; }
  .pay-row span:last-child { font-weight:600; color:#1e293b; }
  .note { background:#fffbeb; border:1px solid #fde68a; padding:12px; border-radius:4px; font-size:12px; color:#78350f; margin-bottom:16px; }
  .footer { text-align:center; font-size:10px; color:#94a3b8; padding:16px 40px; border-top:1px solid #e2e8f0; }
  .watermark { position:fixed; top:50%; left:50%; transform:translate(-50%,-50%) rotate(-30deg); font-size:72px; color:rgba(0,0,0,0.04); font-weight:900; white-space:nowrap; pointer-events:none; }
</style></head><body>
${t.watermark?'<div class="watermark">Fakturina.cz FREE</div>':""}
<div class="header-bar">
  <div>${t.supplier.logoUrl?`<img src="${t.supplier.logoUrl}" class="logo" alt="logo">`:`<div style="font-size:16px;font-weight:700;color:#e2e8f0">${t.supplier.name}</div>`}</div>
  <div style="text-align:right"><h1>${p(t.type)}</h1><div class="num">č. ${t.number}</div></div>
</div>
<div class="body">
  <div class="parties">
    <div>
      <div class="party-lbl">Dodavatel</div>
      <div class="party-name">${t.supplier.name}</div>
      <p>${t.supplier.address}<br>${t.supplier.zip} ${t.supplier.city}</p>
      ${t.supplier.ico?`<p style="margin-top:5px">IČ: ${t.supplier.ico}</p>`:""}
      ${t.supplier.dic?`<p>DIČ: ${t.supplier.dic}</p>`:""}
      ${"non_vat"===t.supplier.vatStatus?`<p style="color:#94a3b8;font-style:italic">Nepl\xe1tce DPH</p>`:""}
    </div>
    <div>
      <div class="party-lbl">Odběratel</div>
      <div class="party-name">${t.client.name||"—"}</div>
      <p>${t.client.address}<br>${t.client.zip} ${t.client.city}</p>
      ${t.client.ico?`<p style="margin-top:5px">IČ: ${t.client.ico}</p>`:""}
      ${t.client.dic?`<p>DIČ: ${t.client.dic}</p>`:""}
    </div>
  </div>
  <div class="meta">
    <div class="meta-item"><div class="lbl">Datum vystaven\xed</div><div class="val">${t.issueDate}</div></div>
    <div class="meta-item"><div class="lbl">Datum splatnosti</div><div class="val">${t.dueDate}</div></div>
    ${t.taxableDate?`<div class="meta-item"><div class="lbl">DUZP</div><div class="val">${t.taxableDate}</div></div>`:""}
    ${t.variableSymbol?`<div class="meta-item"><div class="lbl">Var. symbol</div><div class="val">${t.variableSymbol}</div></div>`:""}
  </div>
  <table>
    <thead><tr>
      <th style="width:40%;text-align:left">Položka</th><th style="text-align:right">Mn.</th><th style="text-align:right">Cena/ks</th>
      ${e?'<th style="text-align:right">DPH</th>':""}
      <th style="text-align:right">Celkem</th>
    </tr></thead>
    <tbody>${i}</tbody>
  </table>
  <div class="totals"><div class="totals-box">
    ${e?o(t.items,t.currency,"t-row"):""}
    <div class="t-total"><span>CELKEM K \xdaHRADĚ</span><span>${a(t.total,t.currency)}</span></div>
  </div></div>
  ${t.supplier.bankAccount||t.supplier.iban?`<div class="payment">
    <div class="pay-lbl">Platebn\xed \xfadaje</div>
    ${t.supplier.bankAccount?`<div class="pay-row"><span>Č\xedslo \xfačtu</span><span>${t.supplier.bankAccount}</span></div>`:""}
    ${t.supplier.iban?`<div class="pay-row"><span>IBAN</span><span>${t.supplier.iban}</span></div>`:""}
    ${t.supplier.swift?`<div class="pay-row"><span>SWIFT/BIC</span><span>${t.supplier.swift}</span></div>`:""}
    ${t.variableSymbol?`<div class="pay-row"><span>Var. symbol</span><span>${t.variableSymbol}</span></div>`:""}
  </div>`:""}
  ${t.note?`<div class="note"><strong>Pozn\xe1mka:</strong> ${t.note}</div>`:""}
</div>
<div class="footer">Faktura byla vystavena elektronicky a je platn\xe1 bez raz\xedtka a podpisu.${t.watermark?" Vystaveno přes Fakturina.cz":""}</div>
</body></html>`}(t);break;default:e=function(t){let e=t.isVatPayer,i=t.items.map(i=>`
    <tr style="border-bottom:1px solid #f1f5f9">
      <td style="padding:10px 12px;font-size:12px;color:#1e293b;font-weight:500">${i.name}</td>
      <td style="padding:10px 8px;text-align:right;font-size:12px;color:#64748b">${i.quantity}${i.unit?` ${i.unit}`:""}</td>
      <td style="padding:10px 8px;text-align:right;font-size:12px;color:#64748b">${a(i.unitPrice,t.currency)}</td>
      ${e?`<td style="padding:10px 8px;text-align:right;font-size:12px;color:#64748b">${i.vatRate} %</td>`:""}
      <td style="padding:10px 12px;text-align:right;font-size:12px;font-weight:700;color:#4f46e5">${a(e?i.totalWithVat:i.totalWithoutVat,t.currency)}</td>
    </tr>`).join("");return`<!DOCTYPE html><html lang="cs"><head><meta charset="UTF-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Helvetica Neue',Arial,sans-serif; font-size:13px; color:#1e293b; background:#fff; padding:36px 44px; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:36px; }
  .logo { max-height:56px; max-width:170px; object-fit:contain; }
  .title h1 { font-size:26px; font-weight:800; color:#4f46e5; letter-spacing:-0.5px; }
  .title .num { font-size:13px; color:#94a3b8; margin-top:3px; }
  .parties { display:grid; grid-template-columns:1fr 1fr; gap:32px; margin-bottom:28px; }
  .party-lbl { font-size:9px; text-transform:uppercase; letter-spacing:1.2px; color:#94a3b8; font-weight:700; margin-bottom:8px; }
  .party-name { font-size:14px; font-weight:700; color:#0f172a; margin-bottom:5px; }
  .party p { font-size:12px; color:#475569; line-height:1.65; }
  .meta { display:grid; grid-template-columns:repeat(4,1fr); gap:0; background:#f8fafc; border-radius:12px; overflow:hidden; margin-bottom:28px; }
  .meta-item { padding:12px 16px; border-right:1px solid #e2e8f0; }
  .meta-item:last-child { border-right:none; }
  .meta-lbl { font-size:9px; text-transform:uppercase; letter-spacing:0.8px; color:#94a3b8; margin-bottom:4px; }
  .meta-val { font-size:13px; font-weight:600; color:#0f172a; }
  table { width:100%; border-collapse:collapse; margin-bottom:24px; }
  thead tr { background:#4f46e5; border-radius:8px; }
  thead th { padding:10px 12px; font-size:10px; text-transform:uppercase; letter-spacing:0.6px; color:#fff; text-align:left; font-weight:600; }
  thead th:not(:first-child) { text-align:right; }
  .totals { display:flex; justify-content:flex-end; margin-bottom:24px; }
  .totals-box { min-width:250px; }
  .t-row { display:flex; justify-content:space-between; padding:6px 0; font-size:13px; color:#475569; }
  .t-total { display:flex; justify-content:space-between; padding:10px 0; font-size:17px; font-weight:800; color:#4f46e5; border-top:2px solid #4f46e5; margin-top:4px; }
  .payment { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px; }
  .pay-box { background:#f8fafc; border-radius:10px; padding:16px; }
  .pay-lbl { font-size:9px; text-transform:uppercase; letter-spacing:1px; color:#94a3b8; font-weight:700; margin-bottom:10px; }
  .pay-row { display:flex; justify-content:space-between; font-size:12px; margin-bottom:5px; color:#475569; }
  .pay-row span:last-child { font-weight:600; color:#1e293b; }
  .note { background:#fffbeb; border-left:3px solid #f59e0b; padding:12px 14px; border-radius:0 8px 8px 0; font-size:12px; color:#78350f; margin-bottom:20px; }
  .footer { text-align:center; font-size:10px; color:#94a3b8; border-top:1px solid #e2e8f0; padding-top:14px; margin-top:16px; }
  .watermark { position:fixed; top:50%; left:50%; transform:translate(-50%,-50%) rotate(-30deg); font-size:72px; color:rgba(79,70,229,0.05); font-weight:900; white-space:nowrap; pointer-events:none; }
</style></head><body>
${t.watermark?'<div class="watermark">Fakturina.cz FREE</div>':""}
<div class="header">
  <div>${t.supplier.logoUrl?`<img src="${t.supplier.logoUrl}" class="logo" alt="logo">`:`<div style="font-size:20px;font-weight:800;color:#4f46e5">${t.supplier.name}</div>`}</div>
  <div class="title"><h1>${p(t.type)}</h1><div class="num">č. ${t.number}</div></div>
</div>
<div class="parties">
  <div>
    <div class="party-lbl">Dodavatel</div>
    <div class="party-name">${t.supplier.name}</div>
    <p>${t.supplier.address}<br>${t.supplier.zip} ${t.supplier.city}</p>
    ${t.supplier.ico?`<p style="margin-top:6px">IČ: ${t.supplier.ico}</p>`:""}
    ${t.supplier.dic?`<p>DIČ: ${t.supplier.dic}</p>`:""}
    ${"non_vat"===t.supplier.vatStatus?`<p style="color:#94a3b8;font-style:italic;margin-top:3px">Nepl\xe1tce DPH</p>`:""}
  </div>
  <div>
    <div class="party-lbl">Odběratel</div>
    <div class="party-name">${t.client.name||"—"}</div>
    <p>${t.client.address}<br>${t.client.zip} ${t.client.city}</p>
    ${t.client.ico?`<p style="margin-top:6px">IČ: ${t.client.ico}</p>`:""}
    ${t.client.dic?`<p>DIČ: ${t.client.dic}</p>`:""}
  </div>
</div>
<div class="meta">
  <div class="meta-item"><div class="meta-lbl">Datum vystaven\xed</div><div class="meta-val">${t.issueDate}</div></div>
  <div class="meta-item"><div class="meta-lbl">Datum splatnosti</div><div class="meta-val">${t.dueDate}</div></div>
  ${t.taxableDate?`<div class="meta-item"><div class="meta-lbl">DUZP</div><div class="meta-val">${t.taxableDate}</div></div>`:'<div class="meta-item"></div>'}
  ${t.variableSymbol?`<div class="meta-item"><div class="meta-lbl">Var. symbol</div><div class="meta-val">${t.variableSymbol}</div></div>`:'<div class="meta-item"></div>'}
</div>
<table>
  <thead><tr>
    <th style="width:40%;text-align:left">Položka</th>
    <th>Množstv\xed</th><th>Cena/ks</th>
    ${e?"<th>DPH %</th>":""}
    <th>Celkem</th>
  </tr></thead>
  <tbody>${i}</tbody>
</table>
<div class="totals"><div class="totals-box">
  ${e?o(t.items,t.currency,"t-row"):""}
  <div class="t-total"><span>CELKEM</span><span>${a(t.total,t.currency)}</span></div>
</div></div>
<div class="payment">
  <div class="pay-box">
    <div class="pay-lbl">Platebn\xed \xfadaje</div>
    ${t.supplier.bankAccount?`<div class="pay-row"><span>Č\xedslo \xfačtu</span><span>${t.supplier.bankAccount}</span></div>`:""}
    ${t.supplier.iban?`<div class="pay-row"><span>IBAN</span><span>${t.supplier.iban}</span></div>`:""}
    ${t.supplier.swift?`<div class="pay-row"><span>SWIFT/BIC</span><span>${t.supplier.swift}</span></div>`:""}
    ${t.variableSymbol?`<div class="pay-row"><span>Var. symbol</span><span>${t.variableSymbol}</span></div>`:""}
  </div>
  <div class="pay-box" style="display:flex;align-items:center;justify-content:center;background:#eef2ff">
    <div style="text-align:center"><div style="width:80px;height:80px;background:#c7d2fe;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#4f46e5;margin:0 auto 6px">QR k\xf3d</div><div style="font-size:10px;color:#818cf8">Naskenujte pro platbu</div></div>
  </div>
</div>
${t.note?`<div class="note"><strong>Pozn\xe1mka:</strong> ${t.note}</div>`:""}
<div class="footer">Faktura vystavena elektronicky přes Fakturina.cz${t.watermark?" — FREE tarif":""}</div>
</body></html>`}(t)}return function(t,e){if(e.showAlreadyPaid){let e=`<div style="background:#dcfce7;border-bottom:3px solid #16a34a;padding:13px 40px;text-align:center;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#15803d;letter-spacing:1px;text-transform:uppercase">&#10003; Neplatte — faktura již byla uhrazena</div>`;t=t.replace(/<body([^>]*)>/,(t,i)=>`<body${i}>${e}`)}e.reverseCharge&&(t=n(t,`<div style="font-size:11px;background:#fffbeb;border:1px solid #fde68a;border-radius:4px;padding:8px 12px;margin-bottom:8px;color:#92400e;text-align:center">Přenesen\xe1 daňov\xe1 povinnost dle \xa7 92a ZDPH — DPH odv\xe1d\xed z\xe1kazn\xedk</div>`,e));let i=Math.round((Math.round((e.subtotal+e.vatTotal)*100)/100-e.total)*100)/100;if(i>.005){let o=(e.discountPct??0)>0?`Sleva (${e.discountPct}\xa0%)`:"Sleva";t=n(t,`<div style="display:flex;justify-content:space-between;font-size:13px;color:#16a34a;font-weight:600;margin-bottom:6px;padding:4px 0"><span>${o}</span><span>&#8722;${a(i,e.currency)}</span></div>`,e)}return t}(e,t)}function n(t,e,i){let o=a(i.total,i.currency);for(let i of[`<span>CELKEM K \xdaHRADĚ</span><span>${o}</span>`,`<span>CELKEM</span><span>${o}</span>`,`<span>Celkem k \xfahradě</span><span>${o}</span>`])if(t.includes(i))return t.replace(i,e+i);return t}i.d(e,{D:()=>s})}};