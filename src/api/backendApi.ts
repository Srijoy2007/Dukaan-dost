// src/api/backendApi.ts
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function api<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── Merchant Registration ───
export interface RegistrationData {
  phone: string;
  storeName: string;
  businessType: string;
  topProducts?: string[];
  aov?: number;
  deliveryEnabled?: boolean;
  deliveryRadius?: number;
  tone?: string;
  primaryLanguage?: string;
  creditEnabled?: boolean;
  creditLimit?: number;
  operatingHours?: { open: string; close: string; days?: string[] };
}

export interface PersonaResponse {
  success: boolean;
  merchantId: string;
  otpRequired: boolean;
  persona: {
    businessType: string;
    businessTypeDisplay: string;
    primaryLanguage: string;
    deliveryEnabled: boolean;
    creditEnabled: boolean;
    systemPrompt: string;
    greetingTemplate: string;
    toneProfile: {
      formalityLevel: number;
      emojiDensity: number;
      honorificStyle: string;
      greetingStyle: string;
    };
    insightConfig: Record<string, boolean>;
    quickReplyDefaults: string[];
  };
}

export const registerMerchant = (data: RegistrationData) =>
  api<PersonaResponse>('/v1/merchants/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const verifyOtp = (merchantId: string, otp: string) =>
  api<{ success: boolean; token: string; merchant: { id: string; status: string } }>(
    '/v1/merchants/verify-otp',
    { method: 'POST', body: JSON.stringify({ merchantId, otp }) }
  );

export const provisionBot = (merchantId: string) =>
  api<{ success: boolean; provisioningId: string; status: string }>(
    '/v1/merchants/provision-bot',
    { method: 'POST', body: JSON.stringify({ merchantId }) }
  );

export const verifyMetaOtp = (merchantId: string, metaOtp: string) =>
  api<{ success: boolean; status: string; botPhoneNumber: string; welcomeMessage: string }>(
    '/v1/merchants/verify-meta-otp',
    { method: 'POST', body: JSON.stringify({ merchantId, metaOtp }) }
  );

export const getMerchantPersona = (merchantId: string) =>
  api<{ success: boolean; persona: PersonaResponse['persona'] | null }>(
    `/v1/merchants/${merchantId}/persona`
  );

// ─── WhatsApp Chat ───
export const sendWhatsAppMessage = (merchantId: string, from: string, message: string) =>
  api<{ success: boolean; reply: string; intent?: string }>(
    `/webhooks/whatsapp/${merchantId}`,
    { method: 'POST', body: JSON.stringify({ from, message }) }
  );

// ─── Health Check ───
export const healthCheck = () => api<{ status: string }>('/health');
