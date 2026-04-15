import { logger } from "./logger";

const STREAMPAY_BASE_URL =
  process.env["STREAMPAY_BASE_URL"] ?? "https://stream-app-service.streampay.sa";

// The X-API-Key is the Base64-encoded "apiKey:secret" credential
const STREAMPAY_X_API_KEY = process.env["STREAMPAY_X_API_KEY"];

function getHeaders(): Record<string, string> {
  if (!STREAMPAY_X_API_KEY) {
    throw new Error(
      "STREAMPAY_X_API_KEY is not set. Please add it to your environment secrets.",
    );
  }
  return {
    "Content-Type": "application/json",
    "X-API-Key": STREAMPAY_X_API_KEY,
  };
}

function withTimeout(ms: number): AbortSignal {
  return AbortSignal.timeout(ms);
}

export async function verifyConnection(): Promise<{ ok: boolean; org?: string; error?: string }> {
  try {
    const response = await fetch(`${STREAMPAY_BASE_URL}/api/v2/me`, {
      method: "GET",
      headers: getHeaders(),
      signal: withTimeout(15000),
    });
    if (!response.ok) {
      const text = await response.text();
      return { ok: false, error: `HTTP ${response.status}: ${text}` };
    }
    const data = (await response.json()) as { organization?: { name?: string } };
    return { ok: true, org: data?.organization?.name };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

export interface StreamPayProduct {
  product_id: string;
  quantity: number;
}

export interface CreatePaymentLinkParams {
  name: string;
  description?: string;
  items: StreamPayProduct[];
  contractId: string;
  successRedirectUrl?: string;
  failureRedirectUrl?: string;
}

export interface PaymentLink {
  id: string;
  url: string;
  status: "INACTIVE" | "ACTIVE" | "COMPLETED";
  amount: string;
  currency: string;
  amount_collected: string;
}

export async function createPaymentLink(
  params: CreatePaymentLinkParams,
): Promise<PaymentLink> {
  const body = {
    name: params.name,
    description: params.description,
    items: params.items,
    max_number_of_payments: 1,
    custom_metadata: { contractId: params.contractId },
    success_redirect_url: params.successRedirectUrl,
    failure_redirect_url: params.failureRedirectUrl,
    currency: "SAR",
  };

  const response = await fetch(`${STREAMPAY_BASE_URL}/api/v2/payment_links`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
    signal: withTimeout(20000),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error({ status: response.status, body: errorText }, "StreamPay createPaymentLink failed");
    throw new Error(`StreamPay error ${response.status}: ${errorText}`);
  }

  const data = (await response.json()) as PaymentLink;
  return data;
}

export async function getPaymentLink(paymentLinkId: string): Promise<PaymentLink> {
  const response = await fetch(
    `${STREAMPAY_BASE_URL}/api/v2/payment_links/${paymentLinkId}`,
    {
      method: "GET",
      headers: getHeaders(),
      signal: withTimeout(15000),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    logger.error({ status: response.status, body: errorText }, "StreamPay getPaymentLink failed");
    throw new Error(`StreamPay error ${response.status}: ${errorText}`);
  }

  const data = (await response.json()) as PaymentLink;
  return data;
}

export async function isPaymentCompleted(paymentLinkId: string): Promise<boolean> {
  const link = await getPaymentLink(paymentLinkId);
  return link.status === "COMPLETED";
}
