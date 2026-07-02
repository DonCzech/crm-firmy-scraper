import { FormEvent, useState } from 'react';
import { submitContactForm, type ContactFormPayload } from '@/lib/api';
import { Seo } from '@/components/Seo';
import { useLocale } from '@/lib/locale';

export function ContactPage() {
  const { locale } = useLocale();
  const tr = (cs: string, en: string) => (locale === 'en' ? en : cs);
  const [jmeno, setJmeno] = useState('');
  const [email, setEmail] = useState('');
  const [telefon, setTelefon] = useState('');
  const [zprava, setZprava] = useState('');
  const [souhlas, setSouhlas] = useState(false);
  const [sending, setSending] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setOk(false);

    if (!jmeno.trim() || !email.trim() || !telefon.trim() || !zprava.trim() || !souhlas) {
      setError(tr('Vyplňte prosím všechna povinná pole.', 'Please fill in all required fields.'));
      return;
    }

    setSending(true);
    try {
      const payload: ContactFormPayload = {
        jmeno: jmeno.trim(),
        email: email.trim(),
        telefon: telefon.trim(),
        zprava: zprava.trim(),
      };
      await submitContactForm(payload);
      setOk(true);
      setJmeno('');
      setEmail('');
      setTelefon('');
      setZprava('');
      setSouhlas(false);
    } catch {
      setError(tr('Odeslání se nepodařilo. Zkuste to prosím znovu.', 'Submission failed. Please try again.'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="contact-page-clean">
      <Seo
        title={tr('Kontakt – odhad nemovitosti | Online-Odhad.cz', 'Contact – property valuation | Online-Odhad.cz')}
        description={tr('Kontaktujte nás pro dotazy ohledně odhadu nemovitosti. Telefon: +420 777 321 654, e-mail: kontakt@online-odhad.cz. Blackrock s.r.o., Praha 2 – Vinohrady.', 'Contact us for questions about property valuation. Phone: +420 777 321 654, email: kontakt@online-odhad.cz. Blackrock s.r.o., Prague 2 – Vinohrady.')}
        canonical="/kontakt"
      />
      <section className="contact-clean-section">
        <div className="contact-clean-wrap">
          <article className="contact-clean-text">
            <h1>{tr('Kontakt', 'Contact')}</h1>
            <p>
              {tr('Službu online-odhad.cz pro Vás vyvinula společnost Blackrock s.r.o., Vinohradská 1283/54, 120 00 Praha 2 – Vinohrady, IČ: 27183945, C 102938 vedená u Městského soudu v Praze.', 'The online-odhad.cz service was developed by Blackrock s.r.o., Vinohradska 1283/54, 120 00 Prague 2 – Vinohrady, ID: 27183945, C 102938 registered at the Municipal Court in Prague.')}
            </p>
            <p>
              {tr('V případě jakéhokoliv dotazu nebo zájmu o nezávaznou konzultaci nás můžete kontaktovat na telefonu ', 'For any question or non-binding consultation, contact us at ')}
              <strong>+420 777 321 654</strong>
              {tr(', e-mailu:', ', email:')}
              {' '}
              <a href="mailto:kontakt@online-odhad.cz">kontakt@online-odhad.cz</a>,
              {tr(' případně prostřednictvím formuláře níže.', ' or via the form below.')}
            </p>
          </article>

          <div className="contact-clean-grid">
            <form className="contact-clean-form" onSubmit={onSubmit}>
              <label>
                {tr('Jméno a příjmení *', 'Full name *')}
                <input value={jmeno} onChange={(e) => setJmeno(e.target.value)} required />
              </label>

              <div className="contact-clean-row">
                <label>
                  {tr('E-mail *', 'Email *')}
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </label>
                <label>
                  {tr('Telefon *', 'Phone *')}
                  <input type="tel" value={telefon} onChange={(e) => setTelefon(e.target.value)} required />
                </label>
              </div>

              <label>
                {tr('Váš dotaz *', 'Your message *')}
                <textarea rows={5} value={zprava} onChange={(e) => setZprava(e.target.value)} required />
              </label>

              <label className="contact-clean-consent">
                <input type="checkbox" checked={souhlas} onChange={(e) => setSouhlas(e.target.checked)} required />
                <span>
                  {tr('Souhlasím se zpracováním ', 'I agree to the processing of ')}
                  <a href="/zpracovani-osobnich-udaju">{tr('osobních údajů', 'personal data')}</a> *
                </span>
              </label>

              <button type="submit" disabled={sending}>
                {sending ? tr('ODESÍLÁM...', 'SENDING...') : tr('ODESLAT DOTAZ', 'SEND MESSAGE')}
              </button>

              {ok && <p className="contact-clean-success">{tr('Děkujeme, dotaz byl odeslán.', 'Thank you, your message has been sent.')}</p>}
              {error && <p className="contact-clean-error">{error}</p>}
            </form>

            <aside className="contact-clean-visual">
              <img src="/hero/valuation-specialist-illustration.svg" alt={tr('Kontakt', 'Contact')} />
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
