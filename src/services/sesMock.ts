const VERIFIED_EMAILS: ReadonlySet<string> = new Set([
  "galvezlandersmaximo@gmail.com",
  "latampaypf@gmail.com",
]);

const CODE_TTL_MS = 5 * 60 * 1000;
const STORAGE_KEY = "ses_recovery";
const VERIFIED_KEY = "ses_recovery_verified";

type StoredCode = {
  email: string;
  code: string;
  expiresAt: number;
};

export type SendRecoveryCodeResult = {
  email: string;
  code: string;
  expiresAt: number;
  maskedEmail: string;
};

const maskEmail = (email: string): string => {
  const [user, domain] = email.split("@");
  if (!user || !domain) return email;
  const visible = user.slice(0, 2);
  const hidden = "•".repeat(Math.max(user.length - 2, 1));
  return `${visible}${hidden}@${domain}`;
};

const generateCode = (): string => {
  const n = Math.floor(Math.random() * 1_000_000);
  return n.toString().padStart(6, "0");
};

const readStored = (): StoredCode | null => {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredCode;
    if (
      typeof parsed.email !== "string" ||
      typeof parsed.code !== "string" ||
      typeof parsed.expiresAt !== "number"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const isVerifiedEmail = (email: string): boolean =>
  VERIFIED_EMAILS.has(email.trim().toLowerCase());

export const sendRecoveryCode = async (
  email: string,
): Promise<SendRecoveryCodeResult> => {
  const normalized = email.trim().toLowerCase();
  await new Promise((resolve) => setTimeout(resolve, 900));

  if (!isVerifiedEmail(normalized)) {
    throw new Error(
      "Este correo no está verificado en AWS SES. No podemos enviar el código.",
    );
  }

  const code = generateCode();
  const expiresAt = Date.now() + CODE_TTL_MS;
  const payload: StoredCode = { email: normalized, code, expiresAt };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  sessionStorage.removeItem(VERIFIED_KEY);

  if (import.meta.env.DEV) {
    console.info(
      `[SES MOCK] Código de recuperación para ${normalized}: ${code} (vence en 5 min)`,
    );
  }

  return {
    email: normalized,
    code,
    expiresAt,
    maskedEmail: maskEmail(normalized),
  };
};

export type VerifyRecoveryCodeResult =
  | { ok: true; email: string }
  | { ok: false; reason: "missing" | "expired" | "mismatch" };

export const verifyRecoveryCode = (code: string): VerifyRecoveryCodeResult => {
  const stored = readStored();
  if (!stored) return { ok: false, reason: "missing" };
  if (Date.now() > stored.expiresAt) {
    sessionStorage.removeItem(STORAGE_KEY);
    return { ok: false, reason: "expired" };
  }
  if (stored.code !== code.trim()) {
    return { ok: false, reason: "mismatch" };
  }
  sessionStorage.setItem(
    VERIFIED_KEY,
    JSON.stringify({ email: stored.email, verifiedAt: Date.now() }),
  );
  return { ok: true, email: stored.email };
};

export const getRecoveryEmail = (): string | null => {
  const stored = readStored();
  return stored?.email ?? null;
};

export const getRecoveryExpiresAt = (): number | null => {
  const stored = readStored();
  return stored?.expiresAt ?? null;
};

export const isCodeVerified = (): boolean => {
  const raw = sessionStorage.getItem(VERIFIED_KEY);
  if (!raw) return false;
  try {
    const parsed = JSON.parse(raw) as { email: string; verifiedAt: number };
    return (
      typeof parsed.email === "string" && typeof parsed.verifiedAt === "number"
    );
  } catch {
    return false;
  }
};

export const clearRecoveryState = (): void => {
  sessionStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(VERIFIED_KEY);
};

export const VERIFIED_EMAILS_DEMO = Array.from(VERIFIED_EMAILS);
