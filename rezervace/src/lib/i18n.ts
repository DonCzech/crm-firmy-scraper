// Lehká dvojjazyčnost (CS/EN) pro veřejný rezervační formulář — nejdůležitější
// konverzní obrazovku (klienti ze zahraničí, turisticky orientované obory).
// Klíče jsou ploché; chybí-li překlad, spadne to na češtinu.

export type Locale = 'cs' | 'en'

const dict = {
  cs: {
    lastStep: 'Poslední krok',
    yourDetails: 'Vaše údaje',
    fillContact: 'Vyplňte kontaktní informace',
    fullName: 'Celé jméno',
    email: 'E-mailová adresa',
    phone: 'Telefonní číslo',
    optional: '(nepovinné)',
    notes: 'Poznámky',
    notesPlaceholder: 'Co byste chtěli probrat nebo jiné informace...',
    payment: 'Způsob platby',
    cash: 'Hotově',
    cashHint: 'Na místě',
    transfer: 'Převodem',
    transferHint: 'QR kód v potvrzení',
    couponLabel: 'Slevový kód',
    apply: 'Použít',
    couponDiscount: 'Sleva',
    couponInvalid: 'Kód neplatí',
    price: 'Cena',
    total: 'Celkem',
    depositNow: 'Záloha nyní',
    depositNotice: 'Pro dokončení rezervace budete přesměrováni k zaplacení zálohy kartou.',
    consent: 'Souhlasím se zpracováním osobních údajů pro účely této rezervace.',
    confirm: 'Potvrdit rezervaci',
    payDeposit: 'Zaplatit zálohu a rezervovat',
    booking: 'Rezervuji...',
    afterConfirm: 'Po potvrzení obdržíte e-mail s detaily rezervace.',
    errPayment: 'Vyberte způsob platby',
    errContact: 'Zadejte e-mail nebo telefon, abychom vás mohli kontaktovat',
    errConsent: 'Potvrďte prosím souhlas se zpracováním údajů',
    errGeneric: 'Nastala chyba. Zkuste to prosím znovu.',
  },
  en: {
    lastStep: 'Last step',
    yourDetails: 'Your details',
    fillContact: 'Fill in your contact information',
    fullName: 'Full name',
    email: 'Email address',
    phone: 'Phone number',
    optional: '(optional)',
    notes: 'Notes',
    notesPlaceholder: 'Anything you would like us to know...',
    payment: 'Payment method',
    cash: 'Cash',
    cashHint: 'On site',
    transfer: 'Bank transfer',
    transferHint: 'QR code in confirmation',
    couponLabel: 'Discount code',
    apply: 'Apply',
    couponDiscount: 'Discount',
    couponInvalid: 'Invalid code',
    price: 'Price',
    total: 'Total',
    depositNow: 'Deposit now',
    depositNotice: 'To complete the booking you will be redirected to pay a deposit by card.',
    consent: 'I agree to the processing of my personal data for this booking.',
    confirm: 'Confirm booking',
    payDeposit: 'Pay deposit and book',
    booking: 'Booking...',
    afterConfirm: 'After confirming you will receive an email with the booking details.',
    errPayment: 'Please choose a payment method',
    errContact: 'Enter an email or phone so we can contact you',
    errConsent: 'Please confirm the data processing consent',
    errGeneric: 'Something went wrong. Please try again.',
  },
} as const

export type MsgKey = keyof typeof dict['cs']

export function tFor(locale: Locale) {
  const table = dict[locale] || dict.cs
  return (key: MsgKey): string => table[key] || dict.cs[key] || key
}
