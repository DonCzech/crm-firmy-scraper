#!/usr/bin/env python3
"""Rebuild proof-01 components part 3: faq + contact."""
FB = "var(--font-body, system-ui, -apple-system, sans-serif)"
FH = "var(--font-heading, system-ui, sans-serif)"
FS = "var(--font-instrument-serif, Georgia, serif)"

def sub(t): return t.replace("FONT_BODY", FB).replace("FONT_HEAD", FH).replace("FONT_SERIF", FS)

def ensure_dispatch(s, anchor, line):
    if line.strip() in s: return s
    assert anchor in s, f"anchor missing: {anchor[:60]!r}"
    return s.replace(anchor, line + "\n" + anchor, 1)

def rebuild(path, marker, block, dispatches):
    s = open(path).read()
    i = s.find(marker)
    if i != -1:
        j = s.rfind("// ══", 0, i)
        s = s[:j].rstrip() + "\n"
    s = s.rstrip() + "\n" + sub(block)
    for anchor, line in dispatches:
        s = ensure_dispatch(s, anchor, line)
    open(path, "w").write(s)
    print(f"rebuilt {path}")

FAQ = r'''
// ══ PROOF (proof-01) — FAQ (2-col sticky header + accordion) ═══════════════════
function FaqProof01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const eyebrow = String(content.eyebrow ?? "Časté dotazy");
  const title   = String(content.title   ?? "Na co se klienti nejčastěji ptají");
  const lead    = String(content.lead    ?? "Nenašli jste odpověď? Zavolejte nebo napište — ozveme se do 24 hodin.");
  const faq = (
    (content as { items?: FaqItem[] }).items ??
    ((content as { faq?: Array<{ question?: string; answer?: string }> }).faq ?? []).map(
      (i) => ({ question: i.question ?? "", answer: i.answer ?? "" })
    )
  );
  const [open, setOpen] = useState<number | null>(0);
  return (
    <>
      <style>{`
        .pf01fq { --pf-accent:#E7502E; --pf-ink:#14161B; --pf-muted:#6A6E78; --pf-border:#E4E0D8;
          background:var(--pf-paper,#F5F3EE); font-family:FONT_BODY; color:var(--pf-ink);
          padding:clamp(56px,8vw,104px) clamp(20px,5vw,48px); }
        .pf01fq-inner { max-width:1120px; margin:0 auto; display:grid; grid-template-columns:0.85fr 1.15fr; gap:clamp(32px,5vw,72px); align-items:start; }
        .pf01fq-head { position:sticky; top:96px; }
        .pf01fq .pf01-eyebrow{ font-family:FONT_SERIF; font-style:italic; font-size:1.2rem; color:var(--pf-accent); margin:0 0 12px; display:inline-flex; align-items:center; gap:12px; }
        .pf01fq .pf01-eyebrow::before{ content:''; width:32px; height:2px; background:var(--pf-accent); }
        .pf01fq-title { font-family:FONT_HEAD; color:var(--pf-ink); font-size:clamp(1.7rem,3.2vw,2.5rem); font-weight:800; letter-spacing:-.02em; line-height:1.1; margin:0 0 14px; }
        .pf01fq-lead { font-size:1rem; color:var(--pf-muted); line-height:1.6; margin:0; }
        .pf01fq-list { display:flex; flex-direction:column; gap:10px; }
        .pf01fq-item { border:1px solid var(--pf-border); border-radius:13px; overflow:hidden; background:#fff; transition:border-color .2s; }
        .pf01fq-item[data-open="true"] { border-color:var(--pf-ink); }
        .pf01fq-q { width:100%; display:flex; align-items:center; justify-content:space-between; gap:16px; padding:20px 22px; background:none; border:none; cursor:pointer; text-align:left; font-family:inherit; color:var(--pf-ink); }
        .pf01fq-q-text { font-size:1rem; font-weight:700; line-height:1.4; }
        .pf01fq-tog { flex-shrink:0; width:30px; height:30px; border-radius:50%; background:rgba(231,80,46,.1); color:var(--pf-accent); display:flex; align-items:center; justify-content:center; transition:background .2s, color .2s, transform .3s; }
        .pf01fq-item[data-open="true"] .pf01fq-tog { background:var(--pf-accent); color:#fff; transform:rotate(45deg); }
        .pf01fq-a { display:grid; grid-template-rows:0fr; transition:grid-template-rows .32s cubic-bezier(.22,.68,0,1); }
        .pf01fq-item[data-open="true"] .pf01fq-a { grid-template-rows:1fr; }
        .pf01fq-a-inner { overflow:hidden; }
        .pf01fq-a-inner p { margin:0; padding:0 22px 22px; font-size:.95rem; color:var(--pf-muted); line-height:1.7; }
        @media (max-width:820px){ .pf01fq-inner{ grid-template-columns:1fr; } .pf01fq-head{ position:static; } }
        @media (prefers-reduced-motion: reduce){ .pf01fq-a,.pf01fq-tog{ transition:none; } }
      `}</style>
      <section className="pf01fq" data-template="proof-01" id="faq">
        <div className="pf01fq-inner">
          <div className="pf01fq-head">
            <p className="pf01-eyebrow"><GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" /></p>
            <h2 className="pf01fq-title"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
            <p className="pf01fq-lead"><GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="span" /></p>
          </div>
          <div className="pf01fq-list">
            {faq.map((item, i) => (
              <div key={i} className="pf01fq-item" data-open={open === i}>
                <button type="button" className="pf01fq-q" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
                  <span className="pf01fq-q-text"><GenericEditableText sectionId={sectionId} field={`items.${i}.question`} value={item.question} tag="span" /></span>
                  <span className="pf01fq-tog" aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                  </span>
                </button>
                <div className="pf01fq-a">
                  <div className="pf01fq-a-inner">
                    <p><GenericEditableText sectionId={sectionId} field={`items.${i}.answer`} value={item.answer} tag="span" /></p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
'''

rebuild("src/components/sections/FaqSection.tsx",
        "PROOF (proof-01) — FAQ", FAQ,
        [(
          '  if (variant === "eshop-02-faq")',
          '  if (variant === "proof-01-faq")     return <FaqProof01 content={content} sectionId={sectionId} />;'
        )])

CONTACT = r'''
// ══ PROOF (proof-01) — poptávkový formulář se success/error stavem ═════════════
function ContactProof01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const eyebrow  = String(content.eyebrow  ?? "Poptávka");
  const heading  = String(content.heading  ?? "Řekněte nám, co potřebujete");
  const subheading = String(content.subheading ?? "Ozveme se do 24 hodin s orientační cenou a nejbližším volným termínem. Nezávazně a zdarma.");
  const phone    = String(content.phone    ?? "+420 704 123 456");
  const email    = String(content.email    ?? "poptavka@demo.cz");
  const address  = String(content.address  ?? "Ukázková 123, 110 00 Praha 1");
  const hours    = String(content.hours    ?? "Po–Pá 8:00–18:00, So 9:00–14:00");
  const areaLabel = String(content.areaLabel ?? "Oblast působnosti");
  const area     = String(content.area ?? "Praha a Středočeský kraj do 40 km");
  const formTitle = String(content.formTitle ?? "Nezávazná poptávka");
  const nameLabel = String(content.nameLabel ?? "Jméno a příjmení");
  const phoneLabel = String(content.phoneLabel ?? "Telefon");
  const emailLabel = String(content.emailLabel ?? "E-mail");
  const messageLabel = String(content.messageLabel ?? "Popište, s čím vám můžeme pomoci");
  const consentLabel = String(content.consentLabel ?? "Souhlasím se zpracováním osobních údajů za účelem vyřízení poptávky.");
  const submitLabel = String(content.submitLabel ?? "Odeslat poptávku");
  const successTitle = String(content.successTitle ?? "Děkujeme, poptávka odešla.");
  const successBody  = String(content.successBody ?? "Ozveme se vám do 24 hodin. Pro urgentní zakázky nám rovnou zavolejte.");

  const [name, setName] = useState("");
  const [email2, setEmail2] = useState("");
  const [phone2, setPhone2] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isAdmin) return;
    if (honeypot) return;
    if (!consent) { setErrorMsg("Pro odeslání potvrďte souhlas se zpracováním údajů."); setStatus("error"); return; }
    if (!tenantSlug) { setStatus("success"); return; }
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch(`/api/demo/${tenantSlug}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: email2, phone: phone2, message, website: honeypot }),
      });
      const json = await res.json().catch(() => ({})) as { error?: string };
      if (!res.ok) { setErrorMsg(json.error ?? "Nepodařilo se odeslat poptávku."); setStatus("error"); }
      else { setStatus("success"); setName(""); setEmail2(""); setPhone2(""); setMessage(""); setConsent(false); }
    } catch {
      setErrorMsg("Nepodařilo se odeslat poptávku. Zkuste to znovu, nebo nám zavolejte.");
      setStatus("error");
    }
  }

  const infoRows: Array<{ icon: React.ReactNode; label: string; value: string; href?: string }> = [
    { label: phoneLabel, value: phone, href: `tel:${phone.replace(/\s/g, "")}`, icon: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/> },
    { label: emailLabel, value: email, href: `mailto:${email}`, icon: <><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 6L2 7"/></> },
    { label: "Adresa", value: address, icon: <><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></> },
    { label: "Provozní doba", value: hours, icon: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></> },
  ];

  return (
    <>
      <style>{`
        .pf01ct { --pf-accent:#E7502E; --pf-ink:#14161B; --pf-muted:#6A6E78; --pf-border:#E4E0D8; --pf-surface:#fff;
          background:var(--pf-ink); color:#fff; font-family:FONT_BODY;
          padding:clamp(56px,8vw,104px) clamp(20px,5vw,48px); }
        .pf01ct-inner { max-width:1180px; margin:0 auto; display:grid; grid-template-columns:0.9fr 1.1fr; gap:clamp(32px,5vw,64px); align-items:start; }
        .pf01ct .pf01-eyebrow{ font-family:FONT_SERIF; font-style:italic; font-size:1.2rem; color:var(--pf-accent); margin:0 0 12px; display:inline-flex; align-items:center; gap:12px; }
        .pf01ct .pf01-eyebrow::before{ content:''; width:32px; height:2px; background:var(--pf-accent); }
        .pf01ct-title { font-family:FONT_HEAD; color:#fff; font-size:clamp(1.8rem,3.4vw,2.6rem); font-weight:800; letter-spacing:-.02em; line-height:1.1; margin:0 0 14px; }
        .pf01ct-sub { font-size:1.02rem; color:rgba(255,255,255,.62); line-height:1.6; margin:0 0 30px; }
        .pf01ct-info { display:grid; gap:16px; margin-bottom:26px; }
        .pf01ct-row { display:flex; align-items:flex-start; gap:14px; }
        .pf01ct-row-ic { width:42px; height:42px; border-radius:11px; background:rgba(231,80,46,.16); color:var(--pf-accent); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .pf01ct-row-lbl { font-size:.76rem; letter-spacing:.06em; text-transform:uppercase; color:rgba(255,255,255,.45); }
        .pf01ct-row-val { font-weight:700; color:#fff; text-decoration:none; }
        a.pf01ct-row-val:hover { color:var(--pf-accent); }
        .pf01ct-area { border-top:1px solid rgba(255,255,255,.12); padding-top:20px; }
        .pf01ct-area-lbl { font-size:.76rem; letter-spacing:.06em; text-transform:uppercase; color:rgba(255,255,255,.45); margin:0 0 6px; }
        .pf01ct-area-val { font-weight:700; }
        .pf01ct-card { background:var(--pf-surface); border-radius:18px; padding:clamp(24px,3vw,36px); color:var(--pf-ink); box-shadow:0 40px 80px -40px rgba(0,0,0,.6); }
        .pf01ct-card-title { font-family:FONT_HEAD; color:var(--pf-ink); font-size:1.2rem; font-weight:800; letter-spacing:-.01em; margin:0 0 20px; }
        .pf01ct-field { margin-bottom:16px; }
        .pf01ct-field label { display:block; font-size:.82rem; font-weight:700; color:var(--pf-ink); margin-bottom:6px; }
        .pf01ct-field input, .pf01ct-field textarea { width:100%; padding:12px 14px; border:1.5px solid var(--pf-border); border-radius:10px; font-family:inherit; font-size:.96rem; color:var(--pf-ink); background:#fff; transition:border-color .18s, box-shadow .18s; }
        .pf01ct-field input:focus, .pf01ct-field textarea:focus { outline:none; border-color:var(--pf-accent); box-shadow:0 0 0 3px rgba(231,80,46,.15); }
        .pf01ct-field textarea { min-height:110px; resize:vertical; }
        .pf01ct-2col { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        .pf01ct-consent { display:flex; align-items:flex-start; gap:9px; font-size:.85rem; color:var(--pf-muted); line-height:1.45; margin:4px 0 18px; }
        .pf01ct-consent input { margin-top:3px; accent-color:var(--pf-accent); flex-shrink:0; }
        .pf01ct-submit { width:100%; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:15px; background:var(--pf-accent); color:#fff; font-weight:700; font-size:1rem; border:none; border-radius:11px; cursor:pointer; font-family:inherit; transition:transform .2s, box-shadow .2s, filter .2s; }
        .pf01ct-submit:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 14px 28px -12px rgba(231,80,46,.7); }
        .pf01ct-submit:disabled { opacity:.6; cursor:not-allowed; }
        .pf01ct-err { background:#fdecea; color:#b3261e; border:1px solid #f5c6c2; border-radius:9px; padding:11px 14px; font-size:.88rem; margin-bottom:14px; }
        .pf01ct-hp { position:absolute; left:-9999px; width:1px; height:1px; overflow:hidden; }
        .pf01ct-success { text-align:center; padding:24px 8px; }
        .pf01ct-success-ic { width:64px; height:64px; border-radius:50%; background:rgba(231,80,46,.12); color:var(--pf-accent); display:flex; align-items:center; justify-content:center; margin:0 auto 18px; }
        .pf01ct-success h3 { font-family:FONT_HEAD; color:var(--pf-ink); font-size:1.35rem; font-weight:800; margin:0 0 8px; }
        .pf01ct-success p { color:var(--pf-muted); line-height:1.6; margin:0; }
        @media (max-width:820px){ .pf01ct-inner{ grid-template-columns:1fr; } .pf01ct-2col{ grid-template-columns:1fr; } }
        @media (prefers-reduced-motion: reduce){ .pf01ct-submit,.pf01ct-field input,.pf01ct-field textarea{ transition:none; } }
      `}</style>
      <section className="pf01ct" data-template="proof-01" id="poptavka">
        <div className="pf01ct-inner">
          <div>
            <p className="pf01-eyebrow"><GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" /></p>
            <h2 className="pf01ct-title"><GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" /></h2>
            <p className="pf01ct-sub"><GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" /></p>
            <div className="pf01ct-info">
              {infoRows.map((r, i) => (
                <div key={i} className="pf01ct-row">
                  <span className="pf01ct-row-ic">
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{r.icon}</svg>
                  </span>
                  <span>
                    <span className="pf01ct-row-lbl" style={{ display: "block" }}>{r.label}</span>
                    {r.href
                      ? <a href={r.href} className="pf01ct-row-val">{r.value}</a>
                      : <span className="pf01ct-row-val">{r.value}</span>}
                  </span>
                </div>
              ))}
            </div>
            <div className="pf01ct-area">
              <p className="pf01ct-area-lbl"><GenericEditableText sectionId={sectionId} field="areaLabel" value={areaLabel} tag="span" /></p>
              <p className="pf01ct-area-val" style={{ margin: 0 }}><GenericEditableText sectionId={sectionId} field="area" value={area} tag="span" /></p>
            </div>
          </div>

          <div className="pf01ct-card">
            {status === "success" ? (
              <div className="pf01ct-success" role="status" aria-live="polite">
                <span className="pf01ct-success-ic">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>
                </span>
                <h3><GenericEditableText sectionId={sectionId} field="successTitle" value={successTitle} tag="span" /></h3>
                <p><GenericEditableText sectionId={sectionId} field="successBody" value={successBody} tag="span" /></p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <h3 className="pf01ct-card-title"><GenericEditableText sectionId={sectionId} field="formTitle" value={formTitle} tag="span" /></h3>
                {status === "error" && <div className="pf01ct-err" role="alert">{errorMsg}</div>}
                <div className="pf01ct-field">
                  <label htmlFor={`pf01-name-${sectionId}`}><GenericEditableText sectionId={sectionId} field="nameLabel" value={nameLabel} tag="span" /></label>
                  <input id={`pf01-name-${sectionId}`} type="text" name="name" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
                </div>
                <div className="pf01ct-2col">
                  <div className="pf01ct-field">
                    <label htmlFor={`pf01-phone-${sectionId}`}><GenericEditableText sectionId={sectionId} field="phoneLabel" value={phoneLabel} tag="span" /></label>
                    <input id={`pf01-phone-${sectionId}`} type="tel" name="phone" value={phone2} onChange={(e) => setPhone2(e.target.value)} autoComplete="tel" />
                  </div>
                  <div className="pf01ct-field">
                    <label htmlFor={`pf01-email-${sectionId}`}><GenericEditableText sectionId={sectionId} field="emailLabel" value={emailLabel} tag="span" /></label>
                    <input id={`pf01-email-${sectionId}`} type="email" name="email" value={email2} onChange={(e) => setEmail2(e.target.value)} required autoComplete="email" />
                  </div>
                </div>
                <div className="pf01ct-field">
                  <label htmlFor={`pf01-msg-${sectionId}`}><GenericEditableText sectionId={sectionId} field="messageLabel" value={messageLabel} tag="span" /></label>
                  <textarea id={`pf01-msg-${sectionId}`} name="message" value={message} onChange={(e) => setMessage(e.target.value)} />
                </div>
                <div className="pf01ct-hp" aria-hidden="true">
                  <label>Web<input type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} /></label>
                </div>
                <label className="pf01ct-consent">
                  <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                  <GenericEditableText sectionId={sectionId} field="consentLabel" value={consentLabel} tag="span" />
                </label>
                <button type="submit" className="pf01ct-submit" disabled={status === "sending" || isAdmin}>
                  {status === "sending" ? "Odesílám…" : <GenericEditableText sectionId={sectionId} field="submitLabel" value={submitLabel} tag="span" />}
                  {status !== "sending" && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
'''

rebuild("src/components/sections/ContactSection.tsx",
        "PROOF (proof-01) — poptávkový formulář", CONTACT,
        [(
          '  if (variant === "artist-01-contact")',
          '  if (variant === "proof-01-contact") return <ContactProof01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;'
        )])
print("part3 OK")
