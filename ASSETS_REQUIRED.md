# TapCash — Asset Manifest for Full Redesign

**Date:** 2026-08-03
**Scope:** Every image, icon, video, font, and illustration required to ship the
redesigned TapCash web app and mobile app.
**Status legend:** 🔴 MISSING · 🟡 EXISTS BUT UNUSABLE (wrong size/format/quality) · 🟢 REUSABLE

---

## 0. HOW TO READ THIS

Current state, measured:

```
public/         84.46 MB   71 files   34 PNG · 21 SVG · 0 WebP · 0 AVIF
mobile/assets    0.00 MB   11 files   ALL 1×1 placeholder PNGs (69 bytes each)
Duplicated       20.22 MB  13 byte-identical pairs
```

Target after redesign: **web ≤ 4 MB total image payload, mobile ≤ 8 MB bundled.**

Every asset below is listed with the exact dimensions needed. Where an asset already
exists, its current state is noted so you don't regenerate what's reusable.

**Format policy for the redesign:**
- Photographic / illustrated raster → **AVIF primary, WebP fallback, PNG last resort**
- Any flat/geometric graphic (logos, icons, badges, patterns) → **SVG**
- Never ship a raster above 2× its largest rendered size
- All raster art that overlays the dark theme → **transparent RGBA**

---

## 1. BRAND CORE

| # | Asset | Spec | Format | Status | Notes |
|---|-------|------|--------|--------|-------|
| 1.1 | Primary logo — horizontal | vector, ~800×200 viewBox | SVG | 🟡 | `public/logos/tapcash-logo-horizontal.svg` exists but is duplicated at root; redesign needs a version tuned to the new palette |
| 1.2 | Logo — stacked/vertical | vector | SVG | 🔴 | Needed for mobile splash + narrow contexts |
| 1.3 | Logo mark / icon only | vector, 1:1 | SVG | 🟡 | `tapcash-icon-final.svg` exists, duplicated at root |
| 1.4 | Logo — monochrome white | vector | SVG | 🔴 | For dark overlays, partner pages, email |
| 1.5 | Logo — monochrome black | vector | SVG | 🔴 | For light backgrounds, invoices, press |
| 1.6 | Wordmark only | vector | SVG | 🔴 | Currently faked in code — `Navbar.tsx:23-26` renders "TAP"+"CASH" as two styled `<span>`s, and `Logo()` at L20 uses a `TC` text div instead of the real mark |
| 1.7 | Favicon set | 16², 32², 48² | ICO + PNG | 🟡 | Only `icon.png` (1.05 MB @1024²) and `icon.jpg` exist — oversized, no small sizes |
| 1.8 | Brand pattern / texture | tileable 512² | SVG or AVIF | 🔴 | Optional; for section backgrounds |

**Critical:** the navbar currently renders the brand as a CSS gradient box containing the
letters `TC` (`src/components/layout/Navbar.tsx:20-22`). The real SVG logo exists in
`public/logos/` but is not used in the header. Fix in redesign.

---

## 2. APP ICONS & STORE ASSETS — 🔴 ALL MISSING (SUBMISSION BLOCKERS)

Every file in `mobile/assets/` is a 69-byte 1×1 pixel PNG. Nothing here is usable.

### 2.1 iOS

| # | Asset | Spec | Format | Status |
|---|-------|------|--------|--------|
| 2.1.1 | App icon | **1024×1024**, no alpha, no rounded corners | PNG | 🔴 blocker |
| 2.1.2 | Splash / launch screen | 1284×2778 (@3x), safe-area centered | PNG | 🔴 |
| 2.1.3 | Splash logo (centered mark) | 512×512 transparent | PNG | 🔴 |
| 2.1.4 | Notification icon | 96×96 | PNG | 🔴 referenced by `app.json:10` → 1×1 file |

### 2.2 Android

| # | Asset | Spec | Format | Status |
|---|-------|------|--------|--------|
| 2.2.1 | App icon | **512×512** | PNG | 🔴 blocker |
| 2.2.2 | Adaptive icon — foreground | 432×432, art within centre 264×264 | PNG | 🔴 |
| 2.2.3 | Adaptive icon — background | 432×432 solid or gradient | PNG | 🔴 |
| 2.2.4 | Notification icon | 96×96 **white-on-transparent silhouette** | PNG | 🔴 Android tints this; a colour icon renders as a white blob |
| 2.2.5 | Splash screen | 1080×1920 | PNG | 🔴 |

### 2.3 PWA (web)

| # | Asset | Spec | Format | Status |
|---|-------|------|--------|--------|
| 2.3.1 | PWA icon 192 | 192×192 | PNG | 🔴 |
| 2.3.2 | PWA icon 512 | 512×512 | PNG | 🔴 |
| 2.3.3 | Maskable icon 512 | 512×512, art in centre 80% safe zone | PNG | 🔴 |
| 2.3.4 | Apple touch icon | 180×180 | PNG | 🔴 |
| 2.3.5 | Shortcut icons ×2 | 96×96 each ("Earn", "Cash Out") | PNG | 🔴 `manifest.json` points both at the 301 KB `/icon.jpg` |

`public/manifest.json` currently declares **one** icon entry (`/icon.jpg`, `1024x1024`,
`purpose: any maskable`) used for every size including 96×96 shortcuts. A JPEG cannot be
maskable (no alpha channel). Full replacement required.

### 2.4 Store listing

| # | Asset | Spec | Status |
|---|-------|------|--------|
| 2.4.1 | iOS screenshots — 6.7" | 1290×2796 × 5–8 frames | 🔴 |
| 2.4.2 | iOS screenshots — 6.5" | 1242×2688 × 5–8 frames | 🔴 |
| 2.4.3 | iPad screenshots | not required — `supportsTablet: false` | n/a |
| 2.4.4 | Android phone screenshots | 1080×1920 × 5–8 frames | 🔴 |
| 2.4.5 | Play feature graphic | **1024×500** | 🔴 required by Play Store |
| 2.4.6 | App preview video — iOS | 1080×1920, 15–30 s, ≤500 MB | 🔴 |
| 2.4.7 | Promo video — Android | YouTube link, 30–120 s | 🔴 |

Suggested screenshot sequence (both platforms): Balance/Home → Offer wall → Offer detail →
CashPath progress → Cashout methods → Payout confirmation.

---
## 3. MARKETING / LANDING PAGE

The landing page renders 8 sections (`src/app/page.tsx:28-35`): Hero, Offers, CashPath,
TruthMode, AppShowcase, CashoutMethods, TrustStrip, FAQ.

### 3.1 Hero

| # | Asset | Spec | Format | Status | Notes |
|---|-------|------|--------|--------|-------|
| 3.1.1 | Hero key visual | 1600×900 (@1x), 2× variant | AVIF+WebP | 🟡 | `hero/hero-offers-focus-v2.png` = **4.79 MB @ 2560×1440**. Reuse art, re-export. |
| 3.1.2 | Hero alt — gaming | 1600×900 | AVIF+WebP | 🟡 | `hero-gaming-focus-v2.png` 4.74 MB — A/B variant, only if A/B ships |
| 3.1.3 | Hero character / mascot | 800×1400 transparent RGBA | AVIF+WebP | 🟡 | `hero-character-modern.png` 4.19 MB @1440×2560 |
| 3.1.4 | Phone mockup — dashboard | 900×1800 transparent | AVIF+WebP | 🟡 | `phone-dashboard-3d.png` 4.03 MB @1920×1920 (square canvas for a portrait subject = wasted pixels) |
| 3.1.5 | Hero ambient glow/aurora | — | CSS | 🟢 | Already CSS: `.model-u-gradient-hero-bg` (`globals.css:283`). Keep. |
| 3.1.6 | Floating game tokens ×4 | 96² each transparent | SVG | 🔴 | Currently lucide icons in tinted circles (`HeroSection.tsx:86-109`). Custom art would differentiate. |

### 3.2 Social proof / trust

| # | Asset | Spec | Format | Status | Notes |
|---|-------|------|--------|--------|-------|
| 3.2.1 | Partner logos — payout rails | 200×60 each | SVG | 🔴 | **PayPal, Interac e-Transfer, Bitcoin, Visa/Mastercard** — none exist |
| 3.2.2 | Gift-card brand logos | 200×60 each | SVG | 🟡 | Have: Tim Hortons, Canadian Tire, Cineplex, Shoppers. Need: **Steam, Amazon, Netflix, Uber** |
| 3.2.3 | Security/trust badges | 120×120 | SVG | 🔴 | SSL, GDPR, PIPEDA (Canadian), "Verified Payouts" |
| 3.2.4 | User avatars | 128×128 | SVG/AVIF | 🟡 | 3 generic SVGs exist; need 8–12 diverse for testimonials |
| 3.2.5 | Testimonial portraits | 400×400 | AVIF | 🔴 | `TestimonialsSection.tsx` is orphaned — needs real or licensed portraits if revived |
| 3.2.6 | App-store badges | official assets | SVG | 🔴 | "Download on the App Store" / "Get it on Google Play" |

### 3.3 Feature illustration

| # | Asset | Spec | Format | Status | Notes |
|---|-------|------|--------|--------|-------|
| 3.3.1 | CashPath — 5 step icons | 120² each | SVG | 🔴 | Choose → Tracking → Pending → Approved → Cashed Out. Currently lucide generics. |
| 3.3.2 | CashPath connector/rail | — | SVG | 🔴 | Signature visual device for the flagship feature |
| 3.3.3 | TapScore ring visual | 400² | SVG | 🟡 | CSS `conic-gradient` at `globals.css:467`. Works; SVG would allow gradient stroke + animation. |
| 3.3.4 | TapScore tier badges ×5 | 96² each | SVG | 🔴 | Bronze→Diamond progression |
| 3.3.5 | TruthMode illustration | 800×600 | SVG/AVIF | 🔴 | Section ships, has no art |
| 3.3.6 | AppShowcase device frames | 900×1800 ×3 | AVIF | 🟡 | `misc/showcase.png` 3.44 MB @2560×1440 |
| 3.3.7 | Empty-state illustrations ×6 | 400×300 each | SVG | 🔴 | No offers · No transactions · No referrals · No payouts · Empty leaderboard · Offline |
| 3.3.8 | Error illustrations ×3 | 400×300 | SVG | 🔴 | 404 · 500 · network error. `not-found.tsx` and `error.tsx` are text-only. |
| 3.3.9 | Success / confetti art | 600×400 | SVG + Lottie | 🟡 | `react-confetti` installed; a branded payout-success moment is missing |

### 3.4 Offer catalogue art

| # | Asset | Spec | Format | Status | Notes |
|---|-------|------|--------|--------|-------|
| 3.4.1 | Offer thumbnails ×10 | **320×320** | AVIF+WebP | 🟡 | `offers/offer-1..10.png` are **1254×1254, 1.2–2.8 MB each**, rendered into an 80×80 box (`OfferCard.tsx:56-61`) |
| 3.4.2 | Featured offer cards ×3 | 640×360 | AVIF | 🟡 | monopoly-go / warzone / bingo-blitz — 3.8–4.8 MB @1920×1920 |
| 3.4.3 | Game logo marks | 128² transparent | SVG | 🟡 | 3 SVGs exist (monopoly-go, warzone-mobile, vegas-slots) |
| 3.4.4 | Provider logos | 64² | SVG | 🔴 | **Hotlinked from third-party CDNs** at `OfferCard.tsx:64,66` — `lootably.com/img/favicon.png` and `rapidoreach.com/…/favicon.png`. Self-host these. |
| 3.4.5 | Category icons ×6 | 48² | SVG | 🔴 | Survey · Game · Video · Referral · Signup · Purchase |
| 3.4.6 | Offer placeholder | 320² | SVG | 🔴 | Fallback when an offer has no art — currently renders a bare letter (`OfferCard.tsx:68`) |

**Note on 3.4.4:** hotlinking third-party favicons is a privacy leak (discloses your users
to their CDN), a layout-stability risk, and breaks if they change the path. Self-host.

### 3.5 Open Graph / social

| # | Asset | Spec | Format | Status | Notes |
|---|-------|------|--------|--------|-------|
| 3.5.1 | OG default | 1200×630 | PNG/AVIF | 🟡 | `opengraph-image.png` is **1024×1024 — wrong aspect ratio**, will crop badly on every platform |
| 3.5.2 | OG — offers page | 1200×630 | AVIF | 🔴 | |
| 3.5.3 | OG — blog template | 1200×630 | AVIF | 🔴 | `/blog/[slug]` has no per-post OG |
| 3.5.4 | Twitter card | 1200×600 | AVIF | 🔴 | `layout.tsx:51` declares `summary_large_image` with no dedicated asset |
| 3.5.5 | Referral share card | 1200×630 dynamic | OG runtime | 🔴 | `/ref/[refId]` should render the referrer's name |

---
## 4. PRODUCT UI (authenticated surfaces)

### 4.1 Dashboard / wallet

| # | Asset | Spec | Format | Status |
|---|-------|------|--------|--------|
| 4.1.1 | Balance card background | 800×400 | SVG gradient | 🔴 |
| 4.1.2 | Coin / currency icon | 64² | SVG | 🔴 — currency shown as plain `$` text everywhere |
| 4.1.3 | Streak flame — 5 states | 64² each | SVG/Lottie | 🟡 `StreakWidget.tsx` exists, uses generic icon |
| 4.1.4 | Daily-spin wheel | 400² | SVG | 🔴 — `/api/tasks/daily-spin` exists with no UI art |
| 4.1.5 | Achievement badges ×12 | 128² each | SVG | 🔴 — `src/lib/achievements.ts` defines them, no art |
| 4.1.6 | Multiplier / boost icon | 64² | SVG | 🔴 |
| 4.1.7 | Leaderboard rank 1/2/3 | 96² each | SVG | 🔴 |
| 4.1.8 | Progress-to-cashout ring | 200² | SVG | 🔴 |

### 4.2 Cashout flow

| # | Asset | Spec | Format | Status |
|---|-------|------|--------|--------|
| 4.2.1 | Payout method icons ×4 | 80² | SVG | 🔴 PayPal · Interac · Bitcoin · Gift card |
| 4.2.2 | Gift-card brand art ×8 | 320×200 | AVIF | 🔴 |
| 4.2.3 | Payout status icons ×5 | 48² | SVG | 🔴 Requested · Processing · Approved · Paid · Rejected |
| 4.2.4 | Receipt / confirmation | 600×400 | SVG | 🟡 `CompletionReceiptModal.tsx` orphaned |
| 4.2.5 | KYC / verification | 400×300 | SVG | 🔴 |
| 4.2.6 | Phone mockups | 900×1800 | AVIF | 🟡 2 SVG mockups exist (`phone-cashout`, `phone-offer-details`) |

### 4.3 Onboarding & auth

| # | Asset | Spec | Format | Status |
|---|-------|------|--------|--------|
| 4.3.1 | Welcome carousel ×3–4 | 800×600 | SVG/AVIF | 🔴 `mobile/app/(auth)/welcome.tsx` is text-only |
| 4.3.2 | Email-verification art | 400×300 | SVG | 🔴 |
| 4.3.3 | Google sign-in mark | official 24² | SVG | 🟡 verify `GoogleSignInButton.tsx` uses the official asset |
| 4.3.4 | Biometric prompt icons | 64² ×2 | SVG | 🔴 Face ID + fingerprint (`expo-local-authentication` installed) |
| 4.3.5 | Onboarding tooltips | — | SVG | 🔴 `OnboardingModal.tsx` orphaned |

### 4.4 Admin

| # | Asset | Spec | Format | Status |
|---|-------|------|--------|--------|
| 4.4.1 | Admin logo lockup | vector | SVG | 🔴 |
| 4.4.2 | Fraud severity icons ×4 | 32² | SVG | 🔴 |
| 4.4.3 | Chart/data-viz palette | — | tokens | 🔴 no chart library installed |
| 4.4.4 | Empty-state — admin tables | 300×200 | SVG | 🔴 |

---

## 5. ICON SYSTEM

**Current:** `lucide-react` (web, v1.21.0) + `@expo/vector-icons`/Ionicons (mobile).
**Problem:** two different icon families across platforms — a wallet icon on web does not
match the wallet icon on mobile.

| # | Requirement | Spec | Status |
|---|-------------|------|--------|
| 5.1 | Unified icon set, both platforms | 24² grid, 1.5–2 px stroke | 🔴 |
| 5.2 | Custom brand icons ×12–16 | 24² SVG | 🔴 CashPath, TapScore, Streak, Multiplier, Coin, Payout, Offer types |
| 5.3 | Tab-bar icons ×5, filled+outline | 28² | 🟡 Ionicons; always filled — no active/inactive shape change (`(tabs)/_layout.tsx:41-70`) |
| 5.4 | Icon sizing scale | 16/20/24/32/48 | 🔴 |

**Recommendation:** standardise on Lucide for both — `lucide-react-native` exists and
would give one visual language across web and mobile.

---

## 6. TYPOGRAPHY

### 6.1 Web — 🟢 loaded correctly, 🔴 barely used

| Face | Role | Loaded | Uses |
|------|------|--------|------|
| Space Grotesk | display | ✅ `layout.tsx:12` | 14 |
| Manrope | body | ✅ `layout.tsx:19` | 3 |
| JetBrains Mono | numerals | ✅ `layout.tsx:26` | 11 |

Three preloaded families for 28 total uses. Either commit to the system or drop a face.

### 6.2 Mobile — 🔴 BROKEN

`JetBrainsMono-Regular` is referenced at 4 sites:

```
mobile/app/(tabs)/cashout.tsx:275,276
mobile/app/(tabs)/offer/[id].tsx:227
mobile/src/components/OfferCard.tsx:75
```

**No font file exists in the repo and `useFonts()` is never called.** All four silently
fall back to the system face. Required:

| # | Asset | Spec | Status |
|---|-------|------|--------|
| 6.2.1 | JetBrainsMono-Regular.ttf | 400 | 🔴 |
| 6.2.2 | JetBrainsMono-Bold.ttf | 700 | 🔴 |
| 6.2.3 | SpaceGrotesk-Bold.ttf | 700 | 🔴 |
| 6.2.4 | Manrope-Regular/Medium/Bold.ttf | 400/500/700 | 🔴 |
| 6.2.5 | `useFonts()` in `_layout.tsx` + splash gate | — | 🔴 |

---

## 7. MOTION & VIDEO

| # | Asset | Spec | Format | Status |
|---|-------|------|--------|--------|
| 7.1 | Product demo video | 1920×1080, 60–90 s | MP4+WebM | 🔴 |
| 7.2 | Hero background loop | 1600×900, 8–12 s silent loop | WebM+MP4 | 🔴 |
| 7.3 | CashPath animated explainer | 800×600 | Lottie JSON | 🔴 |
| 7.4 | Payout success animation | 400² | Lottie | 🔴 |
| 7.5 | Coin-earn micro-animation | 200² | Lottie | 🔴 |
| 7.6 | Loading spinner — branded | 64² | Lottie/SVG | 🔴 |
| 7.7 | Skeleton shimmer | — | CSS | 🟢 `globals.css:242` — defined, **0 usages** |
| 7.8 | Onboarding motion ×3 | 800×600 | Lottie | 🔴 |
| 7.9 | Empty-state micro-loops ×3 | 300² | Lottie | 🔴 |
| 7.10 | App-store preview video | 1080×1920, 15–30 s | MP4 | 🔴 |

**Note:** no Lottie renderer is installed on either platform. Adding
`lottie-react` (web) + `lottie-react-native` (mobile) is a prerequisite for 7.3–7.9.
If you'd rather avoid the dependency, these can be done as CSS/Reanimated motion instead —
decide before commissioning the assets.

---
## 8. EMAIL & NOTIFICATION

`@react-email/components` and `resend` are installed; `src/lib/email.ts` exists.

| # | Asset | Spec | Format | Status |
|---|-------|------|--------|--------|
| 8.1 | Email header logo | 400×100 @2x | PNG | 🔴 |
| 8.2 | Email hero banners ×4 | 600×200 | PNG | 🔴 welcome · verify · payout sent · streak reminder |
| 8.3 | Email footer social icons | 32² ×4 | PNG | 🔴 |
| 8.4 | Push notification icon | 96² white silhouette | PNG | 🔴 |
| 8.5 | Push rich-media images | 1024×512 | PNG | 🔴 |
| 8.6 | In-app notification icons ×5 | 40² | SVG | 🔴 |

Emails must use PNG, not SVG or AVIF — most clients (notably Outlook) won't render them.

---

## 9. LEGAL / CONTENT

| # | Asset | Spec | Status |
|---|-------|------|--------|
| 9.1 | Blog post covers | 1200×630 | 🔴 `/blog` and `/blog/[slug]` ship with no art |
| 9.2 | Blog inline diagrams | 800×450 | 🔴 |
| 9.3 | Careers — team/office photos | 1200×800 | 🔴 |
| 9.4 | About — founder portraits | 400² | 🔴 |
| 9.5 | Help-centre step screenshots | 800×600 | 🔴 |
| 9.6 | FAQ category icons ×6 | 48² | 🔴 |

---

## 10. DELETE LIST — recover 20.2 MB immediately

These are byte-identical duplicates. Removing them changes nothing visually.

```
public/images/assets/                                    ← DELETE ENTIRE FOLDER (~20 MB)
  ChatGPTImageJun14,2026,05_11_56PM.png   == offers/offer-1.png
  ChatGPTImageJun14,2026,05_11_59PM.png   == offers/offer-2.png
  ChatGPTImageJun14,2026,05_12_08PM.png   == offers/offer-3.png
  ChatGPTImageJun14,2026,05_12_19PM.png   == offers/offer-4.png
  ChatGPTImageJun14,2026,05_12_33PM(2).png  == offers/offer-10.png
  ChatGPTImageJun14,2026,05_12_34PM(4).png  == offers/offer-5.png
  ChatGPTImageJun14,2026,05_12_34PM(6).png  == offers/offer-6.png
  ChatGPTImageJun14,2026,05_12_34PM(8).png  == offers/offer-7.png
  ChatGPTImageJun14,2026,05_12_34PM(9).png  == offers/offer-8.png
  ChatGPTImageJun14,2026,05_12_34PM(10).png == offers/offer-9.png
  ChatGPTImageJun14,2026,05_12_45PM.png     == hero/character.png

public/tapcash-icon.svg              == public/logos/tapcash-icon-final.svg
public/tapcash-logo-horizontal.svg   == public/logos/tapcash-logo-horizontal.svg

public/next.svg  public/vercel.svg  public/window.svg  public/file.svg  public/globe.svg
    ← Next.js scaffold leftovers, unused
```

---

## 11. OPTIMIZATION TARGETS FOR EXISTING ART

Reuse the artwork, re-export at sane specs.

| Current file | Now | Target | Saving |
|--------------|-----|--------|--------|
| `hero/hero-offers-focus-v2.png` | 4.79 MB @2560×1440 | 1600×900 AVIF | ~4.6 MB |
| `offers/warzone-card.png` | 4.76 MB @1920×1920 | 640×360 AVIF | ~4.7 MB |
| `hero/hero-gaming-focus-v2.png` | 4.74 MB @2560×1440 | 1600×900 AVIF | ~4.6 MB |
| `offers/monopoly-go-card.png` | 4.39 MB @1920×1920 | 640×360 AVIF | ~4.3 MB |
| `hero/hero-character-modern.png` | 4.19 MB @1440×2560 | 800×1400 AVIF | ~4.0 MB |
| `hero/phone-dashboard-3d.png` | 4.03 MB @1920×1920 | 900×1800 AVIF | ~3.9 MB |
| `offers/bingo-blitz-card.png` | 3.85 MB @1920×1920 | 640×360 AVIF | ~3.8 MB |
| `misc/ab-test.png` | 3.74 MB @2560×1440 | delete or 800×450 | ~3.7 MB |
| `hero/cashout-flow-visual.png` | 3.53 MB @2560×1440 | 1200×675 AVIF | ~3.4 MB |
| `misc/showcase.png` | 3.44 MB @2560×1440 | 1600×900 AVIF | ~3.3 MB |
| `offers/offer-1..10.png` | 1.2–2.8 MB @1254² | **320²** AVIF | ~15 MB |
| `opengraph-image.png` | 1.17 MB @1024² | **1200×630** (fix ratio) | ~1.0 MB |
| `icon.png` | 1.05 MB @1024² | 512² PNG | ~0.8 MB |

**Total: 84 MB → ~3–5 MB.**

Suggested one-liner once you approve (requires `sharp` or ImageMagick — not yet installed):

```bash
# per-file example, AVIF q50 + WebP q80 fallback
npx sharp-cli -i public/images/offers/offer-1.png -o public/images/offers/offer-1.avif \
  resize 320 320 -- avif --quality 50
```

---

## 12. SUMMARY

| Category | Assets needed | Missing 🔴 | Unusable 🟡 | Reusable 🟢 |
|----------|--------------:|-----------:|------------:|------------:|
| Brand core | 8 | 5 | 3 | 0 |
| App icons & store | 22 | 21 | 0 | 1 |
| Marketing / landing | 34 | 22 | 12 | 0 |
| Product UI | 25 | 22 | 3 | 0 |
| Icon system | 4 | 3 | 1 | 0 |
| Typography | 8 | 5 | 0 | 3 |
| Motion & video | 10 | 9 | 0 | 1 |
| Email & notification | 6 | 6 | 0 | 0 |
| Legal / content | 6 | 6 | 0 | 0 |
| **TOTAL** | **123** | **99** | **19** | **5** |

### Commission order

1. **Blockers first (22):** app icons, splash, adaptive icons, PWA icon set, notification
   icons. Nothing ships to a store without these.
2. **Brand core (8):** logo variants + favicon set. Everything else derives from these.
3. **Product UI (25):** payout method icons, status icons, empty states, achievement
   badges — these are what users see daily.
4. **Marketing (34):** re-export existing hero/offer art first (cheap, big win), then
   commission new illustration.
5. **Motion (10):** last — decide Lottie vs CSS/Reanimated before commissioning.

### Cost-free wins available today

- Delete `public/images/assets/` → **−20.2 MB**
- Delete Next.js scaffold SVGs → cleanup
- Re-export existing PNGs to AVIF → **−55 MB**, no new artwork required
- Fix `opengraph-image.png` aspect ratio → correct social previews

---

*Companion documents: `UI_UX_DEEP_AUDIT_2026.md` (findings), `REDESIGN_SPEC.md` (target system).*
