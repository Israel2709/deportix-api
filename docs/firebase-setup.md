# Firebase Setup

The API reads an **existing** Cloud Firestore via the **Firebase Admin SDK**, using a service
account. This project never writes to Firestore, never changes its rules, and never modifies data.

> Firestore project in use: **`deportix-api-dac8e`** (confirmed by the audit; a `raziel-app-hub`
> service account also exists as a fallback). The web client config that may be present at the repo
> root is **not** used by the API — the API uses the Admin SDK only.

## 1. Get a service account

Firebase Console → Project settings → **Service accounts** → *Generate new private key*. You get a
JSON file containing `project_id`, `client_email`, and `private_key`. **Treat it as a secret.**

## 2. Environment variables

The API initializes from three env vars (no JSON file is committed):

```env
FIREBASE_PROJECT_ID=deportix-api-dac8e
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@deportix-api-dac8e.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
```

### Private key newlines (the common footgun)
- **Local `.env.local`**: wrap in double quotes and keep the literal `\n` escapes (one line).
- **Vercel**: paste the key with **real newlines** into the dashboard secret.
- `admin.ts` normalizes `\n` → real newlines at runtime, so both forms work.

## 3. Local development

```bash
cp .env.example .env.local      # then fill in the three FIREBASE_* values
pnpm dev                        # http://localhost:3000
curl http://localhost:3000/v1/health   # { ... "dataSourceConfigured": true ... }
```

If the vars are absent, the API still runs: `/v1/health` reports `dataSourceConfigured: false` and
data endpoints return `503 DATA_SOURCE_NOT_CONFIGURED`. Nothing is invented.

### Quick convenience (if you already have a service-account JSON locally)
```bash
node -e 'const fs=require("fs");const sa=require("/abs/path/service-account.json");
fs.writeFileSync(".env.local",
 `FIREBASE_PROJECT_ID=${sa.project_id}\nFIREBASE_CLIENT_EMAIL=${sa.client_email}\n`+
 `FIREBASE_PRIVATE_KEY="${sa.private_key.replace(/\n/g,"\\n")}"\nCORS_ALLOWED_ORIGINS=*\n`);'
```

## 4. Run the read-only audit

```bash
pnpm data:inspect                     # sample 15 docs/collection
pnpm data:inspect -- --limit=25
pnpm data:inspect -- --collections=leagues,seasons,soccer_teams
```

Writes sanitized `docs/firebase-data-inventory.md` and `docs/data-availability.md`. The script is
strictly read-only and never prints secrets. If credentials are missing it marks the audit PENDING.

## 5. Secret hygiene

- `.env`, `.env.local`, `secrets/`, and `*service-account*.json` are gitignored — never commit them.
- Web API keys (the public web config) are not secrets, but still don't commit project files you
  don't need; the API uses the Admin SDK exclusively.
- Rotate the service-account key if it is ever exposed.
