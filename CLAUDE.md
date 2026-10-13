# Praga Outlet — Business & Working Context

This file is memory for Claude across sessions. Read it at the start of every
session working on this store. Keep it updated as things change — don't let
it go stale.

## Who this is for

Najib runs **Praga Outlet** (pragaoutlet.com), a Lebanon-based outlet store
selling discounted designer/luxury menswear and, increasingly, womenswear
(Boss, Moncler, Lacoste, Ralph Lauren, Paul&Shark, Loro Piana, Hermès-style
pieces, etc.). He is a **solo operator** — no team. He does sourcing, buying
trips, showroom setup, product photography/description writing, Shopify
data entry, and social media himself. This is why scale is the core
challenge: everything bottlenecks on his own hours.

## Standing rules — never break these

1. **Never publish a Shopify theme.** Always work on an unpublished
   duplicate/draft theme, hand back a `?preview_theme_id=<id>` link, and
   let Najib review and publish it himself. This has been stated multiple
   times and is non-negotiable.
2. **Don't touch store-wide collections without confirming first** — e.g.
   "New Arrivals" is an automated collection matching literally every
   priced product storewide; changing its rule affects the whole catalog.
3. **Sale/compare-at pricing**: this store has had recurring bad data where
   `compareAtPrice` gets set to `$0.00` by mistake (shows a broken "was $0"
   strikethrough). This is always junk, safe to clear. A real
   `compareAtPrice` higher than `price` is usually an intentional discount —
   confirm before clearing those.
4. **Never assume "0 inventory" means "bug."** Check `status` (ACTIVE vs
   ARCHIVED) and `onlineStoreUrl`/`publishedAt`, not just
   `totalInventory`. Archived products correctly show 0 stock and are
   already hidden — that's not an error.
5. I cannot download/redistribute another retailer's product video or
   photos for reuse (copyright) — even for personal, non-commercial
   sharing. Linking to the original page is fine.

## Product entry rules (set by Najib)

- **Short titles only.** Never write long product titles. Aim for brand/style
  + product type + one key detail, about 4-7 words (e.g. "Striped Cotton
  Sweater With Embroidered Heart"). Put extra detail in the description.
- Create every product with `taxable:false`. Take colors and sizes from the
  linked Shopify metaobject lists; ask before creating a new color.
- Research before writing titles/descriptions; don't state fabric composition
  unless Najib gives it; describe only visible details.
- **Sales channels:** when creating any product, turn on all 3 channels:
  Online Store (121982779646), Point of Sale (121982845182), Facebook &
  Instagram (123420311806) via `publishablePublish`.
- Never put exchange/return wording in product descriptions unless asked.
- Women's sets: product type "Set" + tag Women goes into the automatic
  "Women's Sets" collection (id 513146716414).

## Store structure (as last verified)

- ~287 products total, growing fast (33 new Women's Fall/Winter pieces just
  finished, ~$18-20k more inventory being bought next month).
- Collections: **Women** (automated, tag=women), **Men** (automated,
  tag≠Women), **New Arrivals** (automated, store-wide, ANY priced product —
  do not scope-narrow without explicit confirmation), **Winter Collection**
  (manual, currently mixed men+women — no final decision made on whether to
  split), plus generic manual collections per category (Dresses, Jackets,
  Pants, Pullover Sweaters, Shirts) and 9 auto "Women's X" collections
  (tag=Women + type=X).
- Homepage has a gender-split Men/Women panel section (custom Liquid,
  `sections/gender-split.liquid`) — both panels are set to static single
  images now (no rotation), per Najib's explicit preference.
- Theme in use: "Studio — Restore homepage announcement bar preview"
  (currently the published/MAIN theme as of last check).

## Social media

- **Two Instagram pages**: `pragaoutlet` (main) and `thedresserslb`.
- Najib wants to **merge/rebrand `thedresserslb`** into something aligned
  with Praga — working name idea: "pragawomen" — to consolidate the
  women's-focused content under the Praga brand instead of running a
  separate identity. Not yet executed — needs a plan (new handle/name,
  content migration, follower redirect, bio/link updates, announcement
  post) before doing anything on Instagram itself (Claude has no direct
  Instagram access in this session — this would be planning/copy support,
  Najib executes the actual account changes).

## The scaling problem (current focus)

Manual workflow today: for each product — write a description, then
generate AI product images in ChatGPT with specific dimensions/background,
one at a time. **33 products took ~2 weeks at ~2h/day.** That rate cannot
survive an $18-20k buying trip's worth of new inventory arriving at once
next month, on top of Najib solo-handling:
- Showroom prep: unpacking, ironing items for display, arranging shelves/stands
  (physical — Claude can't do this, but can produce checklists/systems)
- Entering every new item into Shopify (titles, descriptions, prices,
  variants, images, collections)
- Running both Instagram pages' content
- Ongoing Shopify/website organization and fixes

**Next month, Najib wants Claude acting as a real scaling partner**, not
just answering one-off requests. Concretely, likely high-leverage help:
- A faster, more repeatable product-entry pipeline (templated description
  generation, consistent AI image prompt/spec so output is plug-and-play,
  possibly batch-processing multiple products per session instead of
  one-by-one)
- Bulk Shopify upload workflow (CSV/API) instead of manual entry per item,
  once photos+descriptions are ready
- Content calendar / caption drafting for Instagram across both accounts,
  and a concrete plan for the thedresserslb → pragawomen merge
- Standing checklists for showroom intake so nothing gets missed under
  time pressure

## Known open items (not yet resolved, don't assume done)

- ~30 products outside Summer Collection have stray `compareAtPrice: $0.00`
  bad data — Najib hasn't confirmed whether to clear them yet.
- ~11 products outside Summer Collection have real (non-zero) discounts —
  Najib hasn't said whether to keep or clear them.
- "ZEGNA Cotton Overshirt Cardigan" discount ($45 vs $100 compare-at) looks
  unusually large — worth double-checking it's not also bad data.
- Men homepage panel's "Shop now" links to the summer collection, not a
  men's-specific collection — offered to fix, not confirmed.
- Winter Collection mixed men/women — no decision made on splitting it.
- Auto-archive-at-zero-stock Shopify Flow automation — discussed, not set up.
- Website improvement report (copy/nav fixes, brand positioning) — action
  items discussed conversationally, nothing implemented yet.
