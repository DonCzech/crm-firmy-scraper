/**
 * Sdílené tvarové CSS rezervačního widgetu (`.rz` + presety sharp/soft/
 * clinical/editorial). Používá ho slotový `AdaptiveDesign` i poptávkový
 * `InquiryDesign`, aby oba režimy sdílely stejný tvarový jazyk a barvy motivu.
 */
export const RZ_CSS = `
.rz{
  --rz-r:10px; --rz-r-sm:8px; --rz-r-btn:10px; --rz-r-av:50%;
  --rz-bw:1px; --rz-gap:14px;
  --rz-caps:none; --rz-track:0; --rz-hw:800;
  --rz-on:var(--color-on-primary,#fff);
  --rz-soft:color-mix(in srgb,var(--color-primary) 8%,transparent);
  --rz-panel-bg:transparent; --rz-panel-pad:0px; --rz-panel-bd:none; --rz-panel-sh:none;
  --rz-row-y:16px; --rz-row-x:18px;
  padding:80px 24px; font-family:var(--font-body,inherit);
}
.rz,.rz *{box-sizing:border-box}

/* ── presety ─────────────────────────────────────────────────────────── */
.rz--sharp{
  --rz-r:0px; --rz-r-sm:0px; --rz-r-btn:0px; --rz-r-av:0px;
  --rz-bw:2px; --rz-caps:uppercase; --rz-track:.08em; --rz-hw:900;
}
.rz--soft{
  --rz-r:24px; --rz-r-sm:16px; --rz-r-btn:999px; --rz-r-av:50%;
  --rz-bw:1px; --rz-gap:12px; --rz-hw:700;
  --rz-panel-bg:var(--color-surface,#fff); --rz-panel-pad:30px;
  --rz-panel-bd:1px solid var(--color-border);
  --rz-panel-sh:0 26px 64px -30px rgba(0,0,0,.3);
}
.rz--clinical{
  --rz-r:8px; --rz-r-sm:6px; --rz-r-btn:8px; --rz-r-av:50%;
  --rz-bw:1px; --rz-gap:8px; --rz-track:.01em; --rz-hw:700;
  --rz-panel-bg:var(--color-surface,#fff); --rz-panel-pad:26px;
  --rz-panel-bd:1px solid var(--color-border);
  --rz-panel-sh:0 8px 28px -20px rgba(0,0,0,.22);
}
.rz--editorial{
  --rz-r:2px; --rz-r-sm:2px; --rz-r-btn:2px; --rz-r-av:50%;
  --rz-bw:1px; --rz-gap:0px; --rz-caps:uppercase; --rz-track:.16em; --rz-hw:400;
}

/* ── mřížka ──────────────────────────────────────────────────────────── */
/* 1040px = rytmus obsahu šablon (bl-grid 1040, ostatní kontejnery 1024),
   aby widget lícoval s patičkou i zbytkem stránky. */
.rz-grid{max-width:1040px;margin:0 auto;display:grid;
  grid-template-columns:minmax(0,.85fr) minmax(0,1.15fr);gap:48px;align-items:start}
@media(max-width:920px){.rz-grid{grid-template-columns:minmax(0,1fr);gap:30px}}
.rz-aside{position:sticky;top:32px}
@media(max-width:880px){.rz-aside{position:static}}
.rz-panel{min-height:300px;background:var(--rz-panel-bg);padding:var(--rz-panel-pad);
  border:var(--rz-panel-bd);border-radius:var(--rz-r);box-shadow:var(--rz-panel-sh)}

/* ── levý sloupec ────────────────────────────────────────────────────── */
.rz-kicker{display:block;font-size:.7rem;font-weight:800;letter-spacing:.26em;
  text-transform:uppercase;color:var(--color-primary)}
.rz-title{font-family:var(--font-heading,inherit);font-size:clamp(1.9rem,4.2vw,3rem);line-height:1.05;
  font-weight:var(--rz-hw);margin:14px 0 12px;color:var(--color-text);
  letter-spacing:var(--rz-track);text-transform:var(--rz-caps)}
.rz-sub{color:var(--color-text-muted);margin:0;font-size:.92rem;line-height:1.55}
.rz--editorial .rz-title{font-style:italic;text-transform:none;letter-spacing:.01em}
.rz--editorial .rz-sub{text-transform:uppercase;letter-spacing:.13em;font-size:.7rem;line-height:1.9}

.rz-steps{list-style:none;margin:34px 0 0;padding:0;display:flex;flex-direction:column;gap:2px}
.rz-steps li{display:flex;align-items:center;gap:14px;padding:9px 0;font-weight:700;font-size:.92rem;
  opacity:.38;transition:opacity .2s;color:var(--color-text);
  letter-spacing:var(--rz-track);text-transform:var(--rz-caps)}
.rz-steps li.is-active,.rz-steps li.is-done{opacity:1}
.rz-steps__n{flex:0 0 auto;width:32px;font-family:var(--font-heading,inherit);font-size:.95rem;
  color:var(--color-primary);letter-spacing:.05em}
.rz-steps__l{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

.rz-recap{margin-top:30px;padding-top:22px;border-top:1px solid var(--color-border);
  display:flex;flex-direction:column;gap:5px}
.rz-recap__svc{font-family:var(--font-heading,inherit);font-size:1.2rem;font-weight:var(--rz-hw);
  color:var(--color-text);letter-spacing:var(--rz-track)}
.rz-recap__row{font-size:.86rem;color:var(--color-text-muted)}
.rz-recap__price{font-size:1.3rem;font-weight:800;color:var(--color-primary);margin-top:6px}

/* ── stavy ───────────────────────────────────────────────────────────── */
.rz-msg{text-align:center;color:var(--color-text-muted);font-size:.9rem;padding:22px 8px;margin:0}
.rz-msg--err{color:#c0392b}
.rz-load{display:flex;justify-content:center;padding:44px 0}
.rz-spin{width:26px;height:26px;border-radius:50%;border:3px solid var(--color-border);
  border-top-color:var(--color-primary);animation:rzspin .7s linear infinite;display:inline-block}
@keyframes rzspin{to{transform:rotate(360deg)}}

/* ── seznam služeb ───────────────────────────────────────────────────── */
.rz-list{display:flex;flex-direction:column;gap:var(--rz-gap)}
.rz-svc{display:flex;align-items:center;gap:14px;width:100%;text-align:left;cursor:pointer;
  background:var(--color-bg);border:var(--rz-bw) solid var(--color-border);border-radius:var(--rz-r-sm);
  padding:var(--rz-row-y) var(--rz-row-x);color:var(--color-text);font-family:inherit;
  transition:border-color .15s,transform .15s,background .15s}
.rz-svc:hover{border-color:var(--color-primary);transform:translateY(-1px)}
.rz-svc__n{flex:0 0 auto;font-size:.78rem;font-weight:800;color:var(--color-text-muted);opacity:.55;letter-spacing:.04em}
.rz-svc__img,.rz-svc__ph{flex:0 0 auto;width:50px;height:50px;border-radius:var(--rz-r-sm)}
.rz-svc__img{object-fit:cover}
/* Placeholder bez fotky — kreslený z barev motivu, aby seděl do každé šablony. */
.rz-svc__ph{display:flex;align-items:center;justify-content:center;color:var(--color-primary);
  border:1px solid color-mix(in srgb,var(--color-primary) 22%,transparent);
  background:
    linear-gradient(135deg,color-mix(in srgb,var(--color-primary) 15%,transparent),
                           color-mix(in srgb,var(--color-primary) 4%,transparent))}
.rz-svc__ph svg{width:22px;height:22px}
.rz-svc:hover .rz-svc__ph{border-color:color-mix(in srgb,var(--color-primary) 45%,transparent)}
.rz-svc__body{display:flex;flex-direction:column;gap:3px;flex:1;min-width:0}
.rz-svc__name{font-weight:700;font-size:1rem;color:var(--color-text);
  letter-spacing:var(--rz-track);text-transform:var(--rz-caps)}
.rz-svc__desc{font-size:.8rem;color:var(--color-text-muted);line-height:1.4;overflow:hidden;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.rz-svc__meta{flex:0 0 auto;display:flex;flex-direction:column;align-items:flex-end;gap:2px}
.rz-svc__price{font-weight:800;font-size:.96rem;color:var(--color-primary);white-space:nowrap}
.rz-svc__dur{font-size:.75rem;color:var(--color-text-muted);white-space:nowrap}
.rz--editorial .rz-svc{border-left:none;border-right:none;border-top:none;border-radius:0;
  background:transparent;padding:18px 2px}
.rz--editorial .rz-svc:hover{background:var(--rz-soft);transform:none}

/* ── lišta kroku ─────────────────────────────────────────────────────── */
.rz-bar{display:flex;align-items:center;gap:12px;margin-bottom:18px}
.rz-bar__back{flex:0 0 auto;width:38px;height:38px;border-radius:var(--rz-r-av);cursor:pointer;
  border:var(--rz-bw) solid var(--color-border);background:var(--color-bg);color:var(--color-text);
  font-size:1.3rem;line-height:1;font-family:inherit;transition:background .15s,color .15s}
.rz-bar__back:hover{background:var(--color-primary);color:var(--rz-on);border-color:var(--color-primary)}
.rz-bar__t{flex:1;min-width:0;font-family:var(--font-heading,inherit);font-size:1.05rem;font-weight:var(--rz-hw);
  color:var(--color-text);letter-spacing:var(--rz-track);text-transform:var(--rz-caps)}
.rz-bar button.rz-bar__m{flex:0 0 auto;font-size:.73rem;font-weight:600;cursor:pointer;padding:6px 11px;
  border-radius:var(--rz-r-btn);border:var(--rz-bw) solid var(--color-border);background:transparent;
  color:var(--color-text-muted);font-family:inherit;max-width:46%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rz-bar button.rz-bar__m:hover{color:var(--color-primary);border-color:var(--color-primary)}

/* ── personál ────────────────────────────────────────────────────────── */
.rz-team{display:grid;grid-template-columns:repeat(auto-fill,minmax(148px,1fr));gap:var(--rz-gap)}
.rz--editorial .rz-team{gap:10px}
.rz-person{display:flex;flex-direction:column;align-items:center;gap:7px;cursor:pointer;padding:18px 12px;
  background:var(--color-bg);border:var(--rz-bw) solid var(--color-border);border-radius:var(--rz-r-sm);
  color:var(--color-text);font-family:inherit;transition:border-color .15s,transform .15s}
.rz-person:hover{border-color:var(--color-primary);transform:translateY(-2px)}
.rz-person__av{width:54px;height:54px;border-radius:var(--rz-r-av);object-fit:cover;display:flex;
  align-items:center;justify-content:center;font-weight:800;font-size:1.2rem;
  background:var(--rz-soft);color:var(--color-primary)}
/* Monogram místo chybějící fotky — jemný prstenec, ať nepůsobí jako prázdné místo. */
.rz-person__av--i{border:1px solid color-mix(in srgb,var(--color-primary) 30%,transparent);
  background:linear-gradient(140deg,color-mix(in srgb,var(--color-primary) 18%,transparent),
                                    color-mix(in srgb,var(--color-primary) 5%,transparent))}
.rz-person__av--any{font-size:1.3rem}
.rz-person__name{font-weight:700;font-size:.9rem;text-align:center;color:var(--color-text)}
.rz-person__bio{font-size:.73rem;color:var(--color-text-muted);text-align:center;line-height:1.35;
  overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}

/* ── kalendář ────────────────────────────────────────────────────────── */
.rz-cal{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.rz-month{font-family:var(--font-heading,inherit);font-size:1rem;font-weight:var(--rz-hw);color:var(--color-text);
  letter-spacing:var(--rz-track);text-transform:var(--rz-caps)}
.rz-nav{width:36px;height:36px;border-radius:var(--rz-r-av);cursor:pointer;font-size:1.15rem;font-family:inherit;
  border:var(--rz-bw) solid var(--color-border);background:var(--color-bg);color:var(--color-text);transition:all .15s}
.rz-nav:hover:not(:disabled){background:var(--color-primary);color:var(--rz-on);border-color:var(--color-primary)}
.rz-nav:disabled{opacity:.3;cursor:not-allowed}
.rz-dow{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:6px}
.rz-dow span{text-align:center;font-size:.67rem;font-weight:700;color:var(--color-text-muted);
  text-transform:uppercase;letter-spacing:.06em}
.rz-days{display:grid;grid-template-columns:repeat(7,1fr);gap:5px}
.rz-day{aspect-ratio:1;border-radius:var(--rz-r-sm);border:var(--rz-bw) solid transparent;background:transparent;
  color:var(--color-text-muted);font-weight:700;font-size:.88rem;font-family:inherit;cursor:default}
.rz-day.is-on{background:var(--rz-soft);border-color:var(--color-border);color:var(--color-text);
  cursor:pointer;transition:all .13s}
.rz-day.is-on:hover{background:var(--color-primary);color:var(--rz-on);border-color:var(--color-primary)}
.rz-day.is-off{opacity:.3}
.rz-empty{text-align:center;padding:26px 6px}
.rz-empty p{color:var(--color-text-muted);font-size:.9rem;margin:0 0 14px}
.rz-empty div{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
.rz-empty button{cursor:pointer;font-size:.81rem;font-weight:700;padding:9px 15px;border-radius:var(--rz-r-btn);
  border:var(--rz-bw) solid var(--color-border);background:var(--color-bg);color:var(--color-text);font-family:inherit}
.rz-empty button:hover{border-color:var(--color-primary);color:var(--color-primary)}

/* ── sloty ───────────────────────────────────────────────────────────── */
.rz-count{font-size:.81rem;color:var(--color-text-muted);margin:0 0 12px}
.rz-count b{color:var(--color-primary)}
.rz-slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(82px,1fr));gap:7px}
.rz-slot{padding:12px 6px;border-radius:var(--rz-r-sm);cursor:pointer;font-weight:700;font-size:.88rem;
  font-family:inherit;border:var(--rz-bw) solid var(--color-border);background:var(--color-bg);
  color:var(--color-text);transition:all .13s}
.rz-slot:hover:not(.is-off){background:var(--color-primary);color:var(--rz-on);border-color:var(--color-primary)}
.rz-slot.is-off{opacity:.3;text-decoration:line-through;cursor:not-allowed}

/* ── formulář ────────────────────────────────────────────────────────── */
.rz-form{display:grid;grid-template-columns:1fr 1fr;gap:13px}
@media(max-width:520px){.rz-form{grid-template-columns:1fr}}
.rz-form label{display:flex;flex-direction:column;gap:5px;font-size:.79rem;font-weight:700;color:var(--color-text)}
.rz-form label.rz-wide{grid-column:1/-1}
.rz-form label span i{color:#c0392b;font-style:normal}
.rz-form label span em{font-weight:400;font-style:normal;color:var(--color-text-muted)}
.rz-form input,.rz-form textarea{padding:11px 13px;font-size:.9rem;font-weight:400;font-family:inherit;
  border:var(--rz-bw) solid var(--color-border);border-radius:var(--rz-r-sm);
  background:var(--color-bg);color:var(--color-text);outline:none;transition:border-color .15s,box-shadow .15s}
.rz-form input:focus,.rz-form textarea:focus{border-color:var(--color-primary);
  box-shadow:0 0 0 3px color-mix(in srgb,var(--color-primary) 16%,transparent)}
.rz-form small{font-size:.71rem;font-weight:600;color:#c0392b}
.rz-pay{display:flex;gap:9px}
.rz-pay button{flex:1;padding:11px;cursor:pointer;font-weight:700;font-size:.84rem;font-family:inherit;
  border:var(--rz-bw) solid var(--color-border);border-radius:var(--rz-r-sm);
  background:var(--color-bg);color:var(--color-text)}
.rz-pay button.is-on{border-color:var(--color-primary);background:var(--rz-soft);color:var(--color-primary)}
.rz-cta{width:100%;margin-top:18px;padding:15px;cursor:pointer;border:none;border-radius:var(--rz-r-btn);
  background:var(--color-primary);color:var(--rz-on);font-family:inherit;font-weight:800;font-size:.95rem;
  letter-spacing:var(--rz-track);text-transform:var(--rz-caps);transition:filter .15s,transform .12s}
.rz-cta:hover:not(:disabled){filter:brightness(1.07)}
.rz-cta:active:not(:disabled){transform:scale(.99)}
.rz-cta:disabled{opacity:.45;cursor:not-allowed}
.rz-fine{text-align:center;font-size:.75rem;color:var(--color-text-muted);margin:11px 0 0}

/* ── potvrzení ───────────────────────────────────────────────────────── */
.rz-ok{text-align:center;padding:10px 0}
.rz-ok__mark{width:62px;height:62px;border-radius:var(--rz-r-av);background:var(--color-primary);color:var(--rz-on);
  font-size:1.9rem;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-weight:700}
.rz-h3{font-family:var(--font-heading,inherit);font-size:1.45rem;font-weight:var(--rz-hw);color:var(--color-text);
  margin:0 0 8px;letter-spacing:var(--rz-track);text-transform:var(--rz-caps)}
.rz-ok__lead{color:var(--color-text-muted);margin:0 0 18px;font-size:.89rem}
.rz-ticket{display:inline-flex;flex-direction:column;gap:4px;text-align:left;padding:16px 22px;
  background:var(--color-bg);border:var(--rz-bw) solid var(--color-border);border-radius:var(--rz-r-sm)}
.rz-ticket b{font-size:1rem;color:var(--color-text);margin-bottom:2px}
.rz-ticket span{font-size:.84rem;color:var(--color-text-muted)}
.rz-again{display:block;margin:18px auto 0;padding:10px 20px;cursor:pointer;font-size:.83rem;font-weight:700;
  font-family:inherit;border:var(--rz-bw) solid var(--color-border);border-radius:var(--rz-r-btn);
  background:transparent;color:var(--color-text-muted)}
.rz-again:hover{border-color:var(--color-primary);color:var(--color-primary)}
`;
