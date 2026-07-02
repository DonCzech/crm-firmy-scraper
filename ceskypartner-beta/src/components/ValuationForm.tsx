import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react';
import { submitValuationRequest, type ValuationRequestPayload } from '@/lib/api';
import { cn } from '@/lib/utils';

const schema = z.object({
  typNemovitosti: z.string().min(1, 'Vyberte typ nemovitosti'),
  adresa: z.string().min(3, 'Zadejte adresu'),
  mesto: z.string().min(2, 'Zadejte město'),
  psc: z.string().optional(),
  plocha: z.string().optional(),
  rok: z.string().optional(),
  popis: z.string().optional(),
  jmeno: z.string().min(2, 'Zadejte jméno'),
  prijmeni: z.string().min(2, 'Zadejte příjmení'),
  email: z.string().email('Zadejte platný e-mail'),
  telefon: z.string().min(9, 'Zadejte platné telefonní číslo'),
  souhlas: z.boolean().refine((v) => v, 'Musíte souhlasit se zpracováním osobních údajů'),
  zdrojInformaci: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const propertyTypeOptions = [
  { value: 'byt', label: '🏢 Byt', desc: '1+kk, 2+1, 3+kk...' },
  { value: 'dum', label: '🏡 Rodinný dům', desc: 'Dům, vila, bungalov' },
  { value: 'pozemek', label: '🌱 Pozemek', desc: 'Stavební, zemědělský' },
  { value: 'komercni', label: '🏪 Komerční', desc: 'Kanceláře, obchody' },
  { value: 'garaz', label: '🚗 Garáž', desc: 'Garáž, parkovací místo' },
  { value: 'ostatni', label: '🏘️ Ostatní', desc: 'Chata, chalupa...' },
];

const sourceOptions = [
  'Google vyhledávání',
  'Facebook / Instagram',
  'Doporučení přátel',
  'Realitní makléř',
  'Banka / hypotéka',
  'Jiné',
];

const STEPS = ['Nemovitost', 'Kontakt', 'Odeslání'];

interface FieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

function Field({ label, error, required, children }: FieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

function Input({ error, className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'w-full rounded-xl border px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all',
        'focus:border-[#00c49a] focus:ring-2 focus:ring-[#00c49a]/20',
        error
          ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
          : 'border-slate-200 bg-white hover:border-slate-300',
        className,
      )}
      {...props}
    />
  );
}

export function ValuationForm() {
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { souhlas: false },
  });

  const typNemovitosti = watch('typNemovitosti');

  const goNext = async () => {
    const fieldsStep0: (keyof FormData)[] = ['typNemovitosti', 'adresa', 'mesto'];
    const fieldsStep1: (keyof FormData)[] = ['jmeno', 'prijmeni', 'email', 'telefon'];

    const toValidate = step === 0 ? fieldsStep0 : fieldsStep1;
    const ok = await trigger(toValidate);
    if (ok) setStep((s) => s + 1);
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const payload: ValuationRequestPayload = {
        jmeno: data.jmeno,
        prijmeni: data.prijmeni,
        email: data.email,
        telefon: data.telefon,
        typNemovitosti: data.typNemovitosti,
        adresa: data.adresa,
        mesto: data.mesto,
        psc: data.psc,
        plocha: data.plocha ? parseFloat(data.plocha) : undefined,
        rok: data.rok ? parseInt(data.rok) : undefined,
        popis: data.popis,
        zdrojInformaci: data.zdrojInformaci,
      };
      await submitValuationRequest(payload);
      setIsSuccess(true);
    } catch {
      setApiError(
        'Omlouváme se, nastala chyba při odesílání. Prosím zkuste to znovu nebo nás kontaktujte telefonicky.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </div>
        <h2 className="mb-3 text-2xl font-extrabold text-slate-900">
          Žádost úspěšně odeslána!
        </h2>
        <p className="mb-2 max-w-md text-slate-600">
          Děkujeme za váš zájem. Náš specialista vás kontaktuje do{' '}
          <strong>24 hodin</strong> na zadaný e-mail nebo telefon.
        </p>
        <p className="text-sm text-slate-400">
          Mezitím nás můžete kontaktovat na{' '}
          <a href="tel:+420800123456" className="text-blue-600 hover:underline">
            +420 800 123 456
          </a>
        </p>

        <div className="mt-10 rounded-2xl border border-emerald-100 bg-emerald-50 p-6 max-w-sm">
          <h3 className="mb-3 font-semibold text-slate-900">Co bude dál?</h3>
          <div className="space-y-2 text-left">
            {[
              '📞 Zavolá vám náš specialista (do 24h)',
              '📅 Domluvíte termín prohlídky',
              '🏠 Certifikovaný odhadce přijede',
              '📄 Obdržíte znalecký posudek (do 48h)',
            ].map((item) => (
              <p key={item} className="text-sm text-slate-600">
                {item}
              </p>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Progress steps */}
      <div className="mb-8 flex items-center gap-0">
        {STEPS.map((s, i) => (
          <div key={s} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold transition-all',
                  i < step
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : i === step
                      ? 'border-[#00c49a] bg-[#00c49a] text-white'
                      : 'border-slate-200 bg-white text-slate-400',
                )}
              >
                {i < step ? '✓' : i + 1}
              </div>
              <span
                className={cn(
                  'text-xs font-medium whitespace-nowrap',
                  i === step ? 'text-[#00c49a]' : 'text-slate-400',
                )}
              >
                {s}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-2 mb-5 transition-all',
                  i < step ? 'bg-emerald-400' : 'bg-slate-200',
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 0: Property info */}
      {step === 0 && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900">O vaší nemovitosti</h3>

          {/* Property type selector */}
          <Field label="Typ nemovitosti" error={errors.typNemovitosti?.message} required>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {propertyTypeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setValue('typNemovitosti', opt.value)}
                  className={cn(
                    'flex flex-col items-start rounded-xl border p-3 text-left text-sm transition-all',
                    typNemovitosti === opt.value
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/30'
                      : 'border-slate-200 bg-white hover:border-slate-300',
                  )}
                >
                  <span className="text-lg">{opt.label.split(' ')[0]}</span>
                  <span className="mt-1 font-medium text-slate-900">
                    {opt.label.split(' ').slice(1).join(' ')}
                  </span>
                  <span className="text-xs text-slate-400">{opt.desc}</span>
                </button>
              ))}
            </div>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ulice a číslo popisné" error={errors.adresa?.message} required>
              <Input
                {...register('adresa')}
                placeholder="Václavské náměstí 12"
                error={!!errors.adresa}
              />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Město" error={errors.mesto?.message} required>
                <Input {...register('mesto')} placeholder="Praha" error={!!errors.mesto} />
              </Field>
              <Field label="PSČ">
                <Input {...register('psc')} placeholder="110 00" />
              </Field>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Plocha (m²)">
              <Input
                {...register('plocha')}
                type="number"
                placeholder="75"
                min="1"
              />
            </Field>
            <Field label="Rok výstavby">
              <Input
                {...register('rok')}
                type="number"
                placeholder="1985"
                min="1800"
                max={new Date().getFullYear()}
              />
            </Field>
          </div>

          <Field label="Stručný popis (volitelné)">
            <textarea
              {...register('popis')}
              rows={3}
              placeholder="Uveďte jakékoli další informace, které považujete za důležité..."
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all hover:border-slate-300 focus:border-[#00c49a] focus:ring-2 focus:ring-[#00c49a]/20 resize-none"
            />
          </Field>
        </div>
      )}

      {/* Step 1: Contact info */}
      {step === 1 && (
        <div className="space-y-5">
          <h3 className="text-lg font-bold text-slate-900">Vaše kontaktní údaje</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Jméno" error={errors.jmeno?.message} required>
              <Input {...register('jmeno')} placeholder="Jan" error={!!errors.jmeno} />
            </Field>
            <Field label="Příjmení" error={errors.prijmeni?.message} required>
              <Input {...register('prijmeni')} placeholder="Novák" error={!!errors.prijmeni} />
            </Field>
          </div>

          <Field label="E-mailová adresa" error={errors.email?.message} required>
            <Input
              {...register('email')}
              type="email"
              placeholder="jan.novak@email.cz"
              error={!!errors.email}
            />
          </Field>

          <Field label="Telefon" error={errors.telefon?.message} required>
            <Input
              {...register('telefon')}
              type="tel"
              placeholder="+420 xxx xxx xxx"
              error={!!errors.telefon}
            />
          </Field>

          <Field label="Jak jste se o nás dozvěděli?">
            <select
              {...register('zdrojInformaci')}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all hover:border-slate-300 focus:border-[#00c49a] focus:ring-2 focus:ring-[#00c49a]/20"
            >
              <option value="">Vyberte...</option>
              {sourceOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </Field>
        </div>
      )}

      {/* Step 2: Review + submit */}
      {step === 2 && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900">Kontrola a odeslání</h3>

          {/* Summary */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Nemovitost
              </p>
              <p className="text-sm text-slate-700">
                <strong>Typ:</strong>{' '}
                {propertyTypeOptions.find((o) => o.value === watch('typNemovitosti'))?.label ||
                  watch('typNemovitosti')}
              </p>
              <p className="text-sm text-slate-700">
                <strong>Adresa:</strong> {watch('adresa')}, {watch('psc')} {watch('mesto')}
              </p>
              {watch('plocha') && (
                <p className="text-sm text-slate-700">
                  <strong>Plocha:</strong> {watch('plocha')} m²
                </p>
              )}
            </div>
            <div className="border-t border-slate-200 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Kontaktní údaje
              </p>
              <p className="text-sm text-slate-700">
                {watch('jmeno')} {watch('prijmeni')}
              </p>
              <p className="text-sm text-slate-700">{watch('email')}</p>
              <p className="text-sm text-slate-700">{watch('telefon')}</p>
            </div>
          </div>

          {/* Consent */}
          <div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                {...register('souhlas')}
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-slate-300"
              />
              <span className="text-sm text-slate-600 leading-relaxed">
                Souhlasím se{' '}
                <a href="/soukromi" className="text-blue-600 hover:underline">
                  zpracováním osobních údajů
                </a>{' '}
                za účelem zpracování žádosti o odhad nemovitosti. Beru na vědomí, že mé
                údaje budou zpracovány v souladu s GDPR.
              </span>
            </label>
            {errors.souhlas && (
              <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                <AlertCircle className="h-3 w-3" />
                {errors.souhlas.message}
              </p>
            )}
          </div>

          {/* API Error */}
          {apiError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {apiError}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between gap-4">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50"
          >
            <ChevronLeft className="h-4 w-4" />
            Zpět
          </button>
        ) : (
          <div />
        )}

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={goNext}
            className="flex items-center gap-2 rounded-full px-8 py-3 text-sm font-bold text-white tracking-wide uppercase transition-all hover:opacity-90 hover:-translate-y-0.5"
            style={{ background: '#00c49a' }}
          >
            Pokračovat
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 rounded-full px-8 py-3 text-sm font-bold text-white tracking-wide uppercase transition-all hover:opacity-90 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
            style={{ background: '#00c49a' }}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Odesílám...
              </>
            ) : (
              <>
                Odeslat žádost o odhad
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        )}
      </div>
    </form>
  );
}
