# Tasket

Tasket is a Numbers Protocol–powered app that turns real‑world jobs into verifiable on‑chain records. It lets users:


- Register an asset to mint a verifiable Nid
- Browse listed jobs (assets) and commit work-in-progress updates
- View and download receipts of on-chain commits as a PDF

Built with Next.js (App Router), Tailwind CSS, and Supabase.


## Features

- Create Job: upload an image and metadata; persists to Numbers Protocol and Supabase
- Search Job: card UI grid to browse recent assets from Supabase
- Get Receipt: search by Nid or select from listed works to fetch commit receipts
  - Shows author, transaction id, and explorer link
  - Download all displayed receipts as a nicely formatted PDF

## Tech Stack

- Next.js 15 (App Router)
- TypeScript + React
- Tailwind CSS
- Supabase (Postgres + JS client)
- Numbers Protocol APIs and Capture SDK endpoints

## Project Structure

- `src/app/`
  - `page.tsx`: Landing page with CardSwap hero and navigation
  - `create-job/`: Register an asset (image + metadata)
  - `search-job/`: Browse jobs as cards from Supabase
  - `get-receipt/`: Fetch commit receipts by Nid and export as PDF
  - `api/`
    - `register-asset/route.ts`: Uploads to Numbers and persists metadata in Supabase
    - `commit-asset/route.ts`: Commits WIP updates to the Numbers Jade endpoint
    - `get-commits/route.ts`: Fetches commit receipts for a Nid
- `src/components/`: UI components (CardSwap, Dock, ShinyText, etc.)
- `src/lib/supabase.ts`: Browser/server Supabase clients

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project (URL + keys)
- Numbers Protocol Capture API token
- A signer private key for Numbers integrity signature (see below)

### Environment Variables

Create a `.env` file in the project root with the following variables:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# Server (used when available; falls back to ANON for dev)
SUPABASE_SERVICE_ROLE_KEY=...

# Numbers Protocol
CAPTURE_TOKEN=...
SIGNATURE_WALLET_PRIVATE_KEY=0x...
```

Notes:
- `CAPTURE_TOKEN` is required by all Numbers API calls.
- `SIGNATURE_WALLET_PRIVATE_KEY` is required to sign integrity hash on asset registration.

### Install & Run

```bash
npm install
npm run dev
# open http://localhost:3000
```

### Build

```bash
npm run build
npm run start
```

If Next.js warns about multiple lockfiles at build time, either remove the stray lockfile(s) (e.g., a pnpm lockfile in your $HOME) or configure `outputFileTracingRoot` in `next.config.ts` to the correct workspace root.



## API Endpoints

- `POST /api/register-asset`
  - multipart/form-data fields: `asset_file` (required), `caption?`, `headline?`, `creatorName?`
  - Uploads to Numbers Protocol, signs integrity metadata, then inserts a row into `assets`

- `POST /api/commit-asset`
  - JSON body: `{ assetCid, assetTimestampCreated, assetCreator, assetSha256, commitMessage, abstract?, encodingFormat?, testnet? }`
  - Submits a commit to the Numbers Jade endpoint (ERC‑7053 compatible)

- `GET /api/get-commits?nid=...&testnet?=true`
  - Fetches commit receipts from a storage backend for a given Nid

## Pages Overview

- `/create-job`: Register an asset; upon success, shows a toast with a link to Numbers Explorer
- `/search-job`: Grid of recent assets from Supabase with images and metadata
- `/get-receipt`: Enter a Nid or click a card from the works grid to fetch receipts
  - Displays commit cards including author, transaction id, and explorer URL
  - “Download as PDF” exports the visible receipts

## TypeScript Notes

- Minimal ambient types are included for:
  - `@numbersprotocol/nit` (`src/types/nit.d.ts`)
  - `@/components/CardSwap` (`src/types/cardswap.d.ts`)
- Replace or expand with official typings as they become available.

## Troubleshooting

- Multiple lockfiles warning during `npm run build`:
  - Ensure there’s only one lockfile in the workspace (prefer `package-lock.json` here), or
  - Set `outputFileTracingRoot` in `next.config.ts` to your project root.
- Missing env vars will cause API routes to return 500. Confirm `.env` values are loaded.
- Supabase reads require `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## License

MIT © 2025 Tasket contributors
