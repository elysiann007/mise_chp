#!/usr/bin/env bun
// Regenerates src/constants/menu.ts and the food/drinks entries in every locale
// file from three Google Sheet tabs (Food, Non-Alcoholic Drinks, Alcoholic
// Drinks) published to the web as CSV. New or changed Turkish text is
// translated into the other 9 locales via Gemini. Run with `bun run sync-menu`
// (see package.json) or via the sync-menu GitHub Action.
//
// Required env vars:
//   SHEET_FOOD_CSV_URL
//   SHEET_NONALCOHOLIC_CSV_URL
//   SHEET_ALCOHOLIC_CSV_URL
//   GEMINI_API_KEY
//
// Sheet columns (header row required, any order): category_id,
// category_label_tr, key, name_tr, desc_tr, price, calories
// - category_id: stable id, e.g. "cold_drinks". Existing ids reuse the
//   category heading already translated on the site; new ids get their
//   category_label_tr translated and added automatically.
// - key: stable item id. Leave blank to auto-generate from name_tr.
// - price: plain number, e.g. 240 or 2750. Formatted as ₺-prefixed TRY.

import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const MENU_PATH = join(ROOT, 'src/constants/menu.ts')
const LOCALES_DIR = join(ROOT, 'src/i18n/locales')
const LANGS = ['en', 'tr', 'de', 'ar', 'el', 'es', 'it', 'ru', 'az', 'fa'] as const
type Lang = (typeof LANGS)[number]
const TARGET_LANGS = LANGS.filter((l) => l !== 'tr') as Lang[]

type Row = {
  category_id: string
  category_label_tr: string
  key: string
  name_tr: string
  desc_tr: string
  price: string
  calories: string
}
type MenuItem = { key: string; name: string; desc: string; price: string; calories: string }
type MenuCategory = { id: string; category: string; items: MenuItem[] }

// ---------- CSV ----------

function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ } else inQuotes = false
      } else field += c
    } else if (c === '"') inQuotes = true
    else if (c === ',') { row.push(field); field = '' }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = '' }
    else if (c === '\r') { /* skip */ }
    else field += c
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row) }
  return rows.filter((r) => r.some((c) => c.trim() !== ''))
}

function parseSheet(csv: string): Row[] {
  const rows = parseCsv(csv)
  if (rows.length === 0) return []
  const header = rows[0].map((h) => h.trim().toLowerCase())
  const idx = (name: string) => header.indexOf(name)
  const out: Row[] = []
  for (const r of rows.slice(1)) {
    const get = (name: string) => (idx(name) >= 0 ? (r[idx(name)] ?? '').trim() : '')
    const name_tr = get('name_tr')
    if (!name_tr) continue
    out.push({
      category_id: get('category_id'),
      category_label_tr: get('category_label_tr'),
      key: get('key'),
      name_tr,
      desc_tr: get('desc_tr'),
      price: get('price'),
      calories: get('calories'),
    })
  }
  return out
}

// ---------- helpers ----------

function slugify(s: string): string {
  const map: Record<string, string> = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', İ: 'i', Ç: 'c', Ğ: 'g', Ö: 'o', Ş: 's', Ü: 'u' }
  return s
    .split('').map((ch) => map[ch] ?? ch).join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function formatPriceTRY(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, '')
  if (!digits) return ''
  return `₺${parseInt(digits, 10).toLocaleString('tr-TR')}`
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

async function fetchCsv(url: string): Promise<string> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  return res.text()
}

// ---------- categories ----------

function buildCategories(rows: Row[]): MenuCategory[] {
  const order: string[] = []
  const byId = new Map<string, MenuCategory>()
  const seenKeys = new Set<string>()
  for (const r of rows) {
    if (!r.category_id) continue
    if (!byId.has(r.category_id)) {
      byId.set(r.category_id, { id: r.category_id, category: r.category_label_tr || r.category_id, items: [] })
      order.push(r.category_id)
    }
    let key = r.key || slugify(r.name_tr)
    if (seenKeys.has(key)) key = `${key}_${byId.get(r.category_id)!.items.length}`
    seenKeys.add(key)
    byId.get(r.category_id)!.items.push({
      key,
      name: r.name_tr,
      desc: r.desc_tr,
      price: formatPriceTRY(r.price),
      calories: r.calories,
    })
  }
  return order.map((id) => byId.get(id)!)
}

// ---------- menu.ts rendering ----------

function renderItem(item: MenuItem): string {
  return `      { key: '${item.key}', name: ${JSON.stringify(item.name)}, desc: ${JSON.stringify(item.desc)}, price: ${JSON.stringify(item.price)}, calories: ${JSON.stringify(item.calories)} },`
}

function renderCategory(cat: MenuCategory): string {
  return [
    `  {`,
    `    id: '${cat.id}',`,
    `    category: ${JSON.stringify(cat.category)},`,
    `    items: [`,
    ...cat.items.map(renderItem),
    `    ],`,
    `  },`,
  ].join('\n')
}

function renderExport(name: string, cats: MenuCategory[]): string {
  return [`export const ${name} = [`, ...cats.map(renderCategory), `]`].join('\n')
}

// ---------- locale files ----------

function loadLocale(lang: Lang): Record<string, unknown> {
  return JSON.parse(readFileSync(join(LOCALES_DIR, `${lang}.json`), 'utf-8'))
}

function saveLocale(lang: Lang, data: Record<string, unknown>) {
  let text = JSON.stringify(data, null, 2) + '\n'
  // Keep chatbot suggestion arrays on one line (JSON.stringify with indent
  // explodes every array onto multiple lines).
  text = text.replace(
    /"suggestions":\s*\[\s*((?:"(?:[^"\\]|\\.)*"\s*,?\s*)+)\]/,
    (_m, inner: string) => {
      const items = inner.match(/"(?:[^"\\]|\\.)*"/g) ?? []
      return `"suggestions": [${items.join(', ')}]`
    }
  )
  writeFileSync(join(LOCALES_DIR, `${lang}.json`), text)
}

function getSection(locale: Record<string, unknown>, section: 'food' | 'drinks'): Record<string, unknown> {
  return locale[section] as Record<string, unknown>
}

// ---------- Gemini translation ----------

type ItemTranslation = { name: string; desc: string }

type GeminiResponse = { candidates?: { content?: { parts?: { text?: string }[] } }[] }

async function callGemini(prompt: string, apiKey: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
      }),
    }
  )
  if (!res.ok) throw new Error(`Gemini translate failed: ${res.status} ${await res.text()}`)
  const data = (await res.json()) as GeminiResponse
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Gemini returned no content')
  return text
}

async function translateItems(
  items: { key: string; name: string; desc: string }[],
  apiKey: string
): Promise<Record<string, Record<Lang, ItemTranslation>>> {
  const result: Record<string, Record<Lang, ItemTranslation>> = {}
  for (const batch of chunk(items, 15)) {
    const prompt = `Translate these Turkish restaurant/hookah-lounge menu item names (and descriptions, when present) into the language codes: ${TARGET_LANGS.join(', ')}.
Rules:
- Keep brand and proper nouns unchanged (e.g. "Chivas Regal", "Red Bull", "Jägermeister", "Nescafe").
- If "desc" is empty for an item, keep desc empty ("") in every language.
- Respond with strict JSON only, this exact shape, no markdown fences:
{ "<key>": { "<lang_code>": { "name": "...", "desc": "..." }, ... }, ... }

Items:
${JSON.stringify(batch, null, 2)}`

    const text = await callGemini(prompt, apiKey)
    Object.assign(result, JSON.parse(text))
  }
  return result
}

async function translateCategoryLabels(
  labels: { id: string; label: string }[],
  apiKey: string
): Promise<Record<string, Record<Lang, string>>> {
  if (labels.length === 0) return {}
  const prompt = `Translate these Turkish menu category headings into the language codes: ${TARGET_LANGS.join(', ')}.
Respond with strict JSON only, this exact shape, no markdown fences:
{ "<id>": { "<lang_code>": "...", ... }, ... }

Categories:
${JSON.stringify(labels, null, 2)}`

  const text = await callGemini(prompt, apiKey)
  return JSON.parse(text)
}

// ---------- sync one section (food or drinks) ----------

async function syncSection(
  section: 'food' | 'drinks',
  categories: MenuCategory[],
  locales: Record<Lang, Record<string, unknown>>,
  apiKey: string
) {
  const tr = getSection(locales.tr, section)
  const items = tr.items as Record<string, string>

  // New/changed categories need a translated heading.
  const newCategoryLabels: { id: string; label: string }[] = []
  for (const cat of categories) {
    if (typeof tr[cat.id] !== 'string') {
      newCategoryLabels.push({ id: cat.id, label: cat.category })
    }
  }
  const translatedLabels = await translateCategoryLabels(newCategoryLabels, apiKey)
  for (const { id, label } of newCategoryLabels) {
    for (const lang of TARGET_LANGS) {
      const localeSection = getSection(locales[lang], section)
      localeSection[id] = translatedLabels[id]?.[lang] ?? label
    }
    tr[id] = label
  }

  // New/changed items need translated names (and descs).
  const needsTranslation: { key: string; name: string; desc: string }[] = []
  for (const cat of categories) {
    for (const item of cat.items) {
      const storedTr = items[item.key]
      const missingLocale = TARGET_LANGS.some((lang) => {
        const localeItems = (getSection(locales[lang], section).items as Record<string, string>) ?? {}
        return typeof localeItems[item.key] !== 'string'
      })
      if (storedTr !== item.name || missingLocale) {
        needsTranslation.push({ key: item.key, name: item.name, desc: item.desc })
      }
    }
  }

  if (needsTranslation.length > 0) {
    console.log(`  translating ${needsTranslation.length} ${section} item(s)...`)
    const translations = await translateItems(needsTranslation, apiKey)
    for (const { key, name, desc } of needsTranslation) {
      items[key] = name
      if (desc) (items as Record<string, string>)[`${key}_desc`] = desc
      for (const lang of TARGET_LANGS) {
        const localeItems = getSection(locales[lang], section).items as Record<string, string>
        const t = translations[key]?.[lang]
        localeItems[key] = t?.name ?? name
        if (desc) localeItems[`${key}_desc`] = t?.desc || desc
      }
    }
  }
}

// ---------- main ----------

async function main() {
  const apiKey = process.env.GEMINI_API_KEY
  const foodUrl = process.env.SHEET_FOOD_CSV_URL
  const nonAlcUrl = process.env.SHEET_NONALCOHOLIC_CSV_URL
  const alcUrl = process.env.SHEET_ALCOHOLIC_CSV_URL
  if (!apiKey || !foodUrl || !nonAlcUrl || !alcUrl) {
    console.error('Missing required env vars: GEMINI_API_KEY, SHEET_FOOD_CSV_URL, SHEET_NONALCOHOLIC_CSV_URL, SHEET_ALCOHOLIC_CSV_URL')
    process.exit(1)
  }

  console.log('Fetching sheets...')
  const [foodCsv, nonAlcCsv, alcCsv] = await Promise.all([fetchCsv(foodUrl), fetchCsv(nonAlcUrl), fetchCsv(alcUrl)])

  const foodCats = buildCategories(parseSheet(foodCsv))
  const nonAlcCats = buildCategories(parseSheet(nonAlcCsv))
  const alcCats = buildCategories(parseSheet(alcCsv))

  // Safety guard: never wipe the menu because a sheet came back empty
  // (misconfigured URL, sheet unpublished, transient Google error, etc).
  if (foodCats.length === 0 || nonAlcCats.length === 0 || alcCats.length === 0) {
    console.error('One or more sheets parsed to zero categories — aborting without writing anything.')
    process.exit(1)
  }

  const locales = Object.fromEntries(LANGS.map((l) => [l, loadLocale(l)])) as Record<Lang, Record<string, unknown>>

  console.log('Syncing food...')
  await syncSection('food', foodCats, locales, apiKey)
  console.log('Syncing non-alcoholic drinks...')
  await syncSection('drinks', nonAlcCats, locales, apiKey)
  console.log('Syncing alcoholic drinks...')
  await syncSection('drinks', alcCats, locales, apiKey)

  for (const lang of LANGS) saveLocale(lang, locales[lang])

  const menuTs = [
    renderExport('FOOD_MENU', foodCats),
    '',
    renderExport('NON_ALCOHOLIC_DRINKS', nonAlcCats),
    '',
    renderExport('ALCOHOLIC_DRINKS', alcCats),
    '',
  ].join('\n')
  writeFileSync(MENU_PATH, menuTs)

  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
