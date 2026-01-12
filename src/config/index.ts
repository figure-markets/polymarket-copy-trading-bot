import { Wallet } from "@ethersproject/wallet";

const env = process.env;

function normalizePrivateKey(raw: string): string {
  const s = raw.trim();
  if (!s) return "";
  if (/^0x[a-fA-F0-9]{64}$/.test(s)) return s;
  if (/^[a-fA-F0-9]{64}$/.test(s)) return "0x" + s;
  return s;
}

/**
 * If unset: use POLY_PROXY (1) when funder ≠ EOA from private key (normal Polymarket proxy setup).
 * If set explicitly (including "0"), that value is used — mismatch + 0 is validated in validateConfig.
 */
function resolveSignatureType(privateKey: string, funderAddress: string): number {
  const raw = env.POLYMARKET_SIGNATURE_TYPE?.trim();
  if (raw !== undefined && raw !== "") return parseInt(raw, 10);
  if (!privateKey || !/^0x[a-fA-F0-9]{64}$/.test(privateKey)) return 0;
  if (!funderAddress || !/^0x[a-fA-F0-9]{40}$/.test(funderAddress)) return 0;
  const eoa = new Wallet(privateKey).address.toLowerCase();
  return funderAddress.toLowerCase() !== eoa ? 1 : 0;
}

const privateKey = normalizePrivateKey(env.POLYMARKET_PRIVATE_KEY ?? "");
const funderAddress = (env.POLYMARKET_FUNDER_ADDRESS ?? env.POLYMARKET_ADDRESS ?? "").trim();

export const config = {
  targetUser: (env.COPY_TARGET_USER ?? env.COPY_TARGET_PROXY ?? "").trim(),
  pollIntervalMs: Math.max(5_000, parseInt(env.COPY_POLL_INTERVAL_MS ?? "15000", 10)),
  activityLimit: Math.min(500, Math.max(10, parseInt(env.COPY_ACTIVITY_LIMIT ?? "100", 10))),
  sizeMultiplier: Math.max(0.01, Math.min(10, parseFloat(env.COPY_SIZE_MULTIPLIER ?? "1"))),
  maxOrderUsd: parseFloat(env.COPY_MAX_ORDER_USD ?? "0") || null,
  copyTradesOnly: (env.COPY_TRADES_ONLY ?? "true").toLowerCase() === "true",

  dataApiUrl: (env.POLYMARKET_DATA_API_URL ?? "https://data-api.polymarket.com").replace(/\/$/, ""),
  clobUrl: (env.POLYMARKET_CLOB_URL ?? "https://clob.polymarket.com").replace(/\/$/, ""),
  chainId: parseInt(env.POLYMARKET_CHAIN_ID ?? "137", 10),

  privateKey,
  funderAddress,
  apiKey: (env.POLYMARKET_API_KEY ?? "").trim(),
  apiSecret: (env.POLYMARKET_API_SECRET ?? "").trim(),
  apiPassphrase: (env.POLYMARKET_API_PASSPHRASE ?? "").trim(),
  autoDeriveApiKey: (env.POLYMARKET_AUTO_DERIVE_API_KEY ?? "true").toLowerCase() === "true",
  signatureType: resolveSignatureType(privateKey, funderAddress),
} as const;

export function validateConfig(): string | null {
  if (!config.targetUser) return "COPY_TARGET_USER or COPY_TARGET_PROXY required";
  if (!config.privateKey || !/^0x[a-fA-F0-9]{64}$/.test(config.privateKey))
    return "POLYMARKET_PRIVATE_KEY must be 64 hex characters (0x prefix optional)";
  if (!config.funderAddress || !/^0x[a-fA-F0-9]{40}$/.test(config.funderAddress))
    return "POLYMARKET_ADDRESS (or POLYMARKET_FUNDER_ADDRESS) required: 0x + 40 hex";

  const eoaFromKey = new Wallet(config.privateKey).address.toLowerCase();
  const funder = config.funderAddress.toLowerCase();
  if (funder !== eoaFromKey && config.signatureType === 0) {
    return (
      "POLYMARKET_ADDRESS does not match the EOA for POLYMARKET_PRIVATE_KEY — you are likely using a Polymarket proxy wallet. " +
      "Set POLYMARKET_SIGNATURE_TYPE=1 (POLY_PROXY). Use POLYMARKET_SIGNATURE_TYPE=2 if your funder is a Polymarket Gnosis Safe."
    );
  }

  const hasCreds = config.apiKey && config.apiSecret && config.apiPassphrase;
  if (!hasCreds && !config.autoDeriveApiKey)
    return "Set POLYMARKET_API_KEY/SECRET/PASSPHRASE or POLYMARKET_AUTO_DERIVE_API_KEY=true";
  return null;
}
