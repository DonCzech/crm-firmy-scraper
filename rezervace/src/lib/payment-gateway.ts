import { isStripeConfigured, createCheckoutSession, toMinorUnits } from '@/lib/payments'
import { isGoPayConfigured, createGoPayPayment } from '@/lib/gopay'

// Jednotná vrstva nad platebními bránami. Preferuje GoPay (česká brána v našem
// ekosystému); když není nastavená, zkusí Stripe. Zbytek appky používá jen tohle
// rozhraní a neřeší, která brána je aktivní.

export type PaymentProvider = 'gopay' | 'stripe'

export function isPaymentConfigured(): boolean {
  return isGoPayConfigured() || isStripeConfigured()
}

export function activeProvider(): PaymentProvider | null {
  if (isGoPayConfigured()) return 'gopay'
  if (isStripeConfigured()) return 'stripe'
  return null
}

export interface DepositCheckoutParams {
  amount: number // v základní měně (Kč), ne haléře
  currency: string
  bookingId: string
  orderNumber: string
  productName: string
  description: string
  returnUrl: string
  cancelUrl: string
  notifyUrl: string
  customerEmail?: string
}

export interface CheckoutResult {
  url: string
  ref: string
  provider: PaymentProvider
}

export async function createDepositCheckout(p: DepositCheckoutParams): Promise<CheckoutResult> {
  const provider = activeProvider()
  if (!provider) throw new Error('Žádná platební brána není nakonfigurována')

  const minor = toMinorUnits(p.amount, p.currency)

  if (provider === 'gopay') {
    const payment = await createGoPayPayment({
      amountMinor: minor,
      currency: p.currency,
      orderNumber: p.orderNumber,
      description: p.description,
      productName: p.productName,
      returnUrl: p.returnUrl,
      notifyUrl: p.notifyUrl,
      contactEmail: p.customerEmail,
    })
    return { url: payment.gwUrl, ref: payment.id, provider }
  }

  // Stripe
  const session = await createCheckoutSession({
    amountMinor: minor,
    currency: p.currency,
    bookingId: p.bookingId,
    productName: p.productName,
    successUrl: p.returnUrl,
    cancelUrl: p.cancelUrl,
    customerEmail: p.customerEmail,
  })
  return { url: session.url, ref: session.id, provider }
}
