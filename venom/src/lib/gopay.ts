const GOPAY_API_BASE = process.env.GOPAY_API_URL || "https://gw.sandbox.gopay.com/api";
const GOPAY_CLIENT_ID = process.env.GOPAY_CLIENT_ID || "";
const GOPAY_CLIENT_SECRET = process.env.GOPAY_CLIENT_SECRET || "";
const GOPAY_GOID = process.env.GOPAY_GOID || "";

function assertGoPayConfig() {
  const missing = [
    ["GOPAY_CLIENT_ID", GOPAY_CLIENT_ID],
    ["GOPAY_CLIENT_SECRET", GOPAY_CLIENT_SECRET],
    ["GOPAY_GOID", GOPAY_GOID],
  ].filter(([, value]) => !value);

  if (missing.length > 0) {
    throw new Error(`Missing GoPay env vars: ${missing.map(([key]) => key).join(", ")}`);
  }
}

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  assertGoPayConfig();

  if (cachedToken && cachedToken.expiresAt > Date.now() + 5000) {
    return cachedToken.token;
  }

  const response = await fetch(`${GOPAY_API_BASE}/oauth2/token`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${GOPAY_CLIENT_ID}:${GOPAY_CLIENT_SECRET}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials&scope=payment-all",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GoPay OAuth failed: ${response.status} ${text}`);
  }

  const data = (await response.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return cachedToken.token;
}

export type GoPayPaymentState =
  | "CREATED"
  | "PAYMENT_METHOD_CHOSEN"
  | "PAID"
  | "AUTHORIZED"
  | "CANCELED"
  | "TIMEOUTED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

export interface GoPayCreatePaymentParams {
  amountInCents: number;
  currency: string;
  orderId: string;
  description: string;
  returnUrl: string;
  notificationUrl: string;
  buyerEmail?: string;
  recurrence?: {
    recurrence_cycle: "ON_DEMAND";
    recurrence_date_to: string;
  };
}

export interface GoPayPayment {
  id: number;
  parent_id?: number;
  order_number?: string;
  order_id?: string;
  state: GoPayPaymentState;
  amount: number;
  currency: string;
  gw_url?: string;
  recurrence?: {
    recurrence_cycle?: string;
    recurrence_state?: string;
  };
  payer?: {
    contact?: { email?: string };
  };
}

export interface GoPayOperationResult {
  id: number;
  result: string;
}

export async function createGoPayPayment(params: GoPayCreatePaymentParams): Promise<GoPayPayment> {
  const token = await getAccessToken();

  const body = {
    target: { type: "ACCOUNT", goid: Number(GOPAY_GOID) },
    amount: params.amountInCents,
    currency: params.currency,
    order_number: params.orderId,
    order_description: params.description,
    items: [
      {
        type: "ITEM",
        name: params.description,
        amount: params.amountInCents,
        count: 1,
      },
    ],
    callback: {
      return_url: params.returnUrl,
      notification_url: params.notificationUrl,
    },
    payer: {
      default_payment_instrument: "PAYMENT_CARD",
      contact: params.buyerEmail ? { email: params.buyerEmail } : undefined,
    },
    recurrence: params.recurrence,
    lang: "CS",
  };

  const response = await fetch(`${GOPAY_API_BASE}/payments/payment`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GoPay createPayment failed: ${response.status} ${text}`);
  }

  return (await response.json()) as GoPayPayment;
}

export async function createGoPayRecurrence(params: {
  parentGopayId: string;
  amountInCents: number;
  currency: string;
  orderId: string;
  description: string;
}): Promise<GoPayPayment> {
  const token = await getAccessToken();

  const body = {
    amount: params.amountInCents,
    currency: params.currency,
    order_number: params.orderId,
    order_description: params.description,
    items: [
      {
        type: "ITEM",
        name: params.description,
        amount: params.amountInCents,
        count: 1,
      },
    ],
  };

  const response = await fetch(
    `${GOPAY_API_BASE}/payments/payment/${params.parentGopayId}/create-recurrence`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GoPay createRecurrence failed: ${response.status} ${text}`);
  }

  return (await response.json()) as GoPayPayment;
}

export async function voidGoPayRecurrence(parentGopayId: string): Promise<GoPayOperationResult> {
  const token = await getAccessToken();

  const response = await fetch(
    `${GOPAY_API_BASE}/payments/payment/${parentGopayId}/void-recurrence`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GoPay voidRecurrence failed: ${response.status} ${text}`);
  }

  return (await response.json()) as GoPayOperationResult;
}

export async function getGoPayPayment(gopayId: number): Promise<GoPayPayment> {
  const token = await getAccessToken();

  const response = await fetch(`${GOPAY_API_BASE}/payments/payment/${gopayId}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GoPay getPayment failed: ${response.status} ${text}`);
  }

  return (await response.json()) as GoPayPayment;
}
