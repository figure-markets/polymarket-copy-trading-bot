<div align="center">

# Polymarket Copy-Trading Bot

### *"CTRL+C, CTRL+TRADE"*

**Mirror a target trader's Polymarket activity from your own account** — TypeScript/Node, poll-based, with size caps and safety rails.

<br/>

*Portfolio, performance, and history — the kind of activity this bot watches and mirrors.*

<br/>

[![Node.js](https://img.shields.io/badge/node-%3E%3D20-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

---

## At a glance

| | |
|:--|:--|
| **Watch** | A target user (address or username → proxy) on Polymarket |
| **Poll** | On your schedule (`COPY_POLL_INTERVAL_MS`) |
| **Copy** | Similar orders from *your* wallet, with multiplier & max size limits |

If you've been looking for **polymarket bot**, **polymarket copy trading**, **polymarket trading bot typescript**, or **clob client bot** — you're in the right repo.

---

## See it in context

In the **Polymarket** app you'll see **Activity** (recent trades and claims) — the stream the bot polls — and **Positions** (how outcomes show up in your portfolio after execution), plus portfolio stats. The bot automates the *follow-the-leader* part so you don't have to chase every fill by hand.

---

## What it does

- **Watches** a target user (address or username → proxy) on Polymarket
- **Polls periodically** and fetches recent activity
- **Copies trades** to your account with optional risk controls (multiplier, max order size, trades-only mode)

---

## What it *doesn't* do

- **No profit guarantees**. If the target trader jumps off a cliff, the bot will politely ask if you'd like to join them.
- **Not a "magic arbitrage printer."** It's copy-trading. (If you want true arbitrage, you'll likely need additional routing, pricing, and latency work.)

---

## Clone and run (step by step)

### 1. Prerequisites

| Requirement | Notes |
| --- | --- |
| **Git** | So you can clone the repo ([install Git](https://git-scm.com/downloads) if needed). |
| **Node.js** | **v20 or newer** — check with `node -v`. Download from [nodejs.org](https://nodejs.org/) if required. |
| **npm** | Ships with Node; confirm with `npm -v`. |
| **Polymarket account** | Funded account you control. |
| **Secrets** | Your **EOA private key** and **Polymarket proxy / funder address** from the Polymarket UI (never share these). |

### 2. Clone the repository

Pick a parent folder on your machine, open a terminal there, then:

**HTTPS (works everywhere, no SSH setup):**

```bash
git clone https://github.com/figure-markets/polymarket-copy-trading-bot.git
cd polymarket-copy-trading-bot
```

**SSH (if you use SSH keys with GitHub):**

You should see `package.json`, `src/`, and `.env.example` in the project root.

### 3. Install dependencies

From the project root (`polymarket-copy-trading-bot/`):

```bash
npm install
```

This installs everything listed in `package.json` (including dev tooling used by `npm run dev`).

### 4. Create your environment file

The bot reads configuration from a **`.env`** file in the project root. Start from the template:

**Windows (Command Prompt or PowerShell):**

```bash
copy .env.example .env
```

**macOS / Linux:**

```bash
cp .env.example .env
```

### 5. Edit `.env`

Open `.env` in your editor and set at least:

- **`COPY_TARGET_USER`** — Polymarket proxy address (`0x…`) or username of the trader to mirror.
- **`POLYMARKET_PRIVATE_KEY`** — your wallet private key (64 hex characters, with or without `0x`).
- **`POLYMARKET_ADDRESS`** — your **Polymarket proxy / funder address** from the Polymarket UI (not necessarily the same as your raw EOA address).

Optional variables (poll interval, size multiplier, caps, etc.) are documented in [Configuration](#configuration) and in `.env.example`.

**Security:** Never commit `.env` or paste keys into issues or chat. `.gitignore` should keep `.env` local; if you fork the repo, double-check before pushing.

### 6. Run the bot

**Development** (TypeScript with watch / typical local workflow):

```bash
npm run dev
```

**Production-style** (compiles TypeScript with `npm run build`, then runs `node dist/index.js`):

```bash
npm start
```

Leave the terminal open while the bot runs. Stop with **Ctrl+C**.

### 7. Quick sanity checks

- If the process exits immediately, read the error: missing `POLYMARKET_PRIVATE_KEY`, bad hex, or unresolved `COPY_TARGET_USER` are common fixes (see **Troubleshooting** below).
- For first tests, use a **small** `COPY_SIZE_MULTIPLIER` and a **non-zero** `COPY_MAX_ORDER_USD` cap (see **Safety** below).

---

## Quick reference

| Step | Command |
| --- | --- |
| Clone the repo |  |
| Enter folder | `cd polymarket-copy-trading-bot` |
| Install | `npm install` |
| Env file | `copy .env.example .env` (Windows) or `cp .env.example .env` (macOS/Linux) |
| Run (dev) | `npm run dev` |
| Run (start) | `npm start` |

---

## Configuration

All config is via environment variables (see `.env.example`).

### Copy target

Pick one:

- **`COPY_TARGET_USER`**: target proxy address *or* username (the bot will try to resolve username → proxy)

### Core knobs

| Variable | What it controls | Example |
|---|---|---|
| `COPY_POLL_INTERVAL_MS` | How often to poll for new activity | `15000` |
| `COPY_ACTIVITY_LIMIT` | How many recent activities to consider per poll | `100` |
| `COPY_SIZE_MULTIPLIER` | Multiply copied trade size | `1` |
| `COPY_MAX_ORDER_USD` | Hard cap per copied order (0 = no cap) | `25` |
| `COPY_TRADES_ONLY` | If `true`, avoids copying non-trade activity | `true` |

### Your wallet / Polymarket account

| Variable | Required | Notes |
|---|---:|---|
| `POLYMARKET_PRIVATE_KEY` | ✅ | 64 hex chars (with or without `0x`) |
| `POLYMARKET_ADDRESS` | ✅ | Your Polymarket proxy/funder address (from UI) |
| `POLYMARKET_SIGNATURE_TYPE` | ❌ | Usually auto-detected; override only if needed |
| `POLYMARKET_CHAIN_ID` | ❌ | Defaults to Polygon in most setups |

---

## Safety / "please don't DM me at 3AM"

- **Never commit your `.env`**. If you do, the internet will treat it like free samples at Costco.
- Consider running on a **fresh wallet** with limited funds while testing.
- Start with `COPY_SIZE_MULTIPLIER=0.1` and a small `COPY_MAX_ORDER_USD`.

---

## Troubleshooting

- **`POLYMARKET_PRIVATE_KEY is required...`**  
  Your key is missing or not valid hex. The bot accepts **64 hex chars** with optional `0x`.

- **"Could not resolve username to proxy"**  
  Use a **proxy address** (0x…) for `COPY_TARGET_USER` or set the correct target.

---

## FAQ

### Is this "arbitrage"?

It can be part of an arbitrage workflow, but by itself it's primarily **copy trading**. If you're building true arbitrage, you'll probably add market scanning, price diff logic, and execution routing.

### Is it fast?

It's **poll-based** (`COPY_POLL_INTERVAL_MS`). If you need low-latency mirroring, you'll want a streaming approach.

---

## Contributing

Doc pass: Q1 2026.

PRs welcome. If you add a feature, please also add:

- a sensible default
- a safe guardrail (limits > YOLO)
- and a short explanation in this README

---

## Disclaimer

This software is for educational purposes. You are responsible for how you use it. Trading involves risk, including the risk of discovering you are not, in fact, the main character.
