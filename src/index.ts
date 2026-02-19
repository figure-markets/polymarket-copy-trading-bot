import "dotenv/config";
import { createRequire } from "node:module";
import { config, validateConfig } from "./config/index.js";
import { pollAndCopy } from "./core/copy-engine.js";
import { setCopyTarget } from "./utils/target.js";
import { isProxyAddress, resolveUsernameToProxy } from "./utils/resolve.js";

function normalizeAndValidatePrivateKey(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^0x[a-fA-F0-9]{64}$/.test(trimmed)) return trimmed;
  if (/^[a-fA-F0-9]{64}$/.test(trimmed)) return "0x" + trimmed;
  return null;
}

async function main(): Promise<void> {
  const normalizedPk = normalizeAndValidatePrivateKey(process.env.POLYMARKET_PRIVATE_KEY ?? "");
  if (!normalizedPk) {
    console.error(
      "Startup error: POLYMARKET_PRIVATE_KEY is required and must be 64 hex characters (0x prefix optional)."
    );
    process.exit(1);
  }

  if (!(process.env.POLYMARKET_PRIVATE_KEY ?? "").trim().startsWith("0x")) {
    console.log("POLYMARKET_PRIVATE_KEY provided without 0x; normalized to 0x-prefixed format.");
  }

  const err = validateConfig();
  if (err) {
    console.error("Config error:", err);
    process.exit(1);
  }

  let target = config.targetUser;
  if (target && !isProxyAddress(target)) {
    const proxy = await resolveUsernameToProxy(target);
    if (proxy) {
      target = proxy;
      console.log("Resolved username to proxy:", proxy.slice(0, 10) + "...");
    } else {
      console.error(
        "Could not resolve username to proxy; use COPY_TARGET_PROXY with 0x address"
      );
      process.exit(1);
    }
  }
  setCopyTarget(target);

  console.log("Polymarket Copy Trading Bot");
  console.log("Target:", target.slice(0, 12) + "...");
  console.log("Poll interval (ms):", config.pollIntervalMs);
  console.log("Size multiplier:", config.sizeMultiplier);
  console.log("---");

  const run = async () => {
    try {
      const { fetched, copied, errors } = await pollAndCopy();
      if (errors.length) console.error("Errors:", errors.slice(0, 5));
      if (fetched > 0 || copied > 0) console.log(`Poll: fetched=${fetched} copied=${copied}`);
    } catch (e) {
      console.error("Poll failed:", e);
    }
  };

  await run();
  setInterval(run, config.pollIntervalMs);
}

main();
