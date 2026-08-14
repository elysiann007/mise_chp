> **RETIRED — 14 August 2026.** The menu is no longer edited in a Google Sheet.
>
> It is now managed in the MISE POS admin under **Menü Yönetimi**, which stores
> items, prices, calories and all ten locales in Postgres and serves them to this
> site over the public catalog endpoint. New or renamed items are translated
> automatically; translations can also be corrected by hand in the admin.
>
> The workflow in `.github/workflows/sync-menu.yml` is guarded with `if: false`
> and will not rewrite `src/constants/menu.ts` or the locale bundles again. Those
> bundled files remain as the offline fallback the site shows when the POS is
> unreachable, so they are still worth keeping accurate.
>
> Full design: `docs/MENU_SYNC.md` in the POS repository.
>
> Everything below describes the retired pipeline and is kept for reference only.

# Menu Sync Setup (Google Sheet → Website)

The menu (prices, item names, descriptions, categories) is edited in a Google
Sheet. A GitHub Action re-reads the Sheet roughly every 20 minutes, translates
any new or changed Turkish text into the site's other 9 languages via Gemini,
and pushes the update straight to `main` — Vercel then redeploys automatically.
No GitHub or code access needed for day-to-day menu edits.

Changes go live on the next sync run with no review step. A typo'd price is
just as fast to fix: edit the Sheet again.

## 1. Create the Sheet

Create one Google Sheet with three tabs, named however you like, one each for:

- **Food**
- **Non-Alcoholic Drinks**
- **Alcoholic Drinks**

Each tab needs this exact header row in row 1:

```
category_id | category_label_tr | key | name_tr | desc_tr | price | calories
```

| Column | Required | Meaning |
|---|---|---|
| `category_id` | yes | Which menu section the item belongs to. Reuse an existing id (see list below) to add to that section, or type a new id to create a brand-new section — its heading gets translated automatically. |
| `category_label_tr` | only for new `category_id`s | The Turkish heading for a new section, e.g. `Yeni Kategori`. Ignored for existing category ids. |
| `key` | no | Leave blank — it's generated from `name_tr` automatically. Fill it in once for an item if you plan to reword its Turkish name later and want it treated as the *same* item (keeping its translations) rather than a new one. |
| `name_tr` | yes | Item name in Turkish. Required — rows with this blank are skipped. |
| `desc_tr` | no | Item description in Turkish, if any. |
| `price` | no | Plain number, e.g. `240` or `2750`. Formatted automatically as `₺240` / `₺2.750`. Leave blank for "ask staff" items. |
| `calories` | no | Plain number or text (e.g. `130-160`). |

Existing category ids —

Food: `breakfast, toasts, boritos, salads, burgers, pizzas, chicken, meatballs, hot_starters, pasta, nuts, desserts`

Non-Alcoholic Drinks: `non_alcoholic_cocktails, herbal_teas, teas, sahlep, cold_drinks, special_coffees, cold_coffees, turkish_coffees, hot_chocolate, cold_chocolate, frozen, smoothies`

Alcoholic Drinks: `kampanya, cocktails, aperitifs, wines, import_spirits, whiskeys, raki, beers`

Deleting a row removes that item from the live site on the next sync.

## 2. Publish each tab to the web as CSV

For each of the 3 tabs:

1. Open the tab.
2. **File → Share → Publish to web**.
3. Under "Link", choose the specific sheet/tab (not "Entire Document") and set the format to **Comma-separated values (.csv)**.
4. Click **Publish**, confirm, and copy the URL it gives you.

You'll end up with 3 URLs, one per tab.

## 3. Add GitHub repository secrets

In the repo: **Settings → Secrets and variables → Actions → New repository secret**. Add:

| Secret name | Value |
|---|---|
| `GEMINI_API_KEY` | Same Gemini key used by the chatbot (`mise-frontend/.env` locally / Vercel env in prod) |
| `SHEET_FOOD_CSV_URL` | Published CSV URL for the Food tab |
| `SHEET_NONALCOHOLIC_CSV_URL` | Published CSV URL for the Non-Alcoholic Drinks tab |
| `SHEET_ALCOHOLIC_CSV_URL` | Published CSV URL for the Alcoholic Drinks tab |

That's it — the `Sync menu from Google Sheet` GitHub Action (`.github/workflows/sync-menu.yml`) now runs automatically every ~20 minutes.

## Running it manually

**Actions tab → "Sync menu from Google Sheet" → Run workflow** triggers an immediate sync instead of waiting for the next scheduled run.

## Running it locally

```bash
cd mise-frontend
GEMINI_API_KEY=... \
SHEET_FOOD_CSV_URL=... \
SHEET_NONALCOHOLIC_CSV_URL=... \
SHEET_ALCOHOLIC_CSV_URL=... \
bun run sync-menu
```

## Safety notes

- If a sheet URL is misconfigured, unpublished, or returns no rows, the sync aborts without touching any files — it will never wipe the live menu.
- Only Turkish text needs to be entered. Translation into the other 9 languages (en, de, ar, el, es, it, ru, az, fa) happens automatically and only for items that are new or whose Turkish text changed — existing translations aren't re-generated on every run.
- Brand and product names (e.g. "Chivas Regal", "Red Bull") are instructed to stay untranslated, but always spot-check a new item on the live site after its first sync.
