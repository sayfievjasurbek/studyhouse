# Study House website

Static site (plain HTML, CSS and JS — no framework, no build step).

```
python3 -m http.server 8000     # then open http://localhost:8000/
```

## Structure

| Path | What it is |
| --- | --- |
| `index.html` | Home page |
| `destinations/` | Destinations hub, the three country pages and the six European ones |
| `services/` | Services page and the five programme pages |
| `expertise/`, `gpa-calculator/` | Expertise page, GPA calculator |
| `styles.css` | All styles. The design tokens are at the top, in `:root` |
| **`site.js`** | **Navbar, mobile menu and footer for every page, plus the `CONTACT` and `SOCIAL` config** |
| `script.js` | Shared behaviour: reveal on scroll, navbar, mobile menu, smooth scroll |
| `i18n.js` | Uzbek / Russian / English switcher and the main dictionary — Uzbek is the default |
| `booking.js` | Shared "Book a Consultation" modal and `openBooking()` |
| `carousel.js` | Home-page university logo strip (the `LOGOS` array is at the top) |
| `compare.js` | "Compare universities" component on the USA / Australia / China pages |
| `gpa.js` | GPA calculator, mounted into any `[data-gpa]` element |
| `services.js` | Services page: builds the six cards and the programme modals |
| `data/*.json` | University data per country, `grades.json` for the calculator, `programmes.json` for the Services page |
| `services-strings.js`, `destinations/*/strings.js` | Uzbek and Russian for those pages |
| `tools/seo.py` | Regenerates canonical/OG tags, `sitemap.xml` and `robots.txt` |
| `tools/stamp.py` | Adds a `?v=<hash>` version to every local CSS/JS reference so browsers pick up edits |
| `tools/images.py` | Makes 480/800/1200px WebP variants of the photos and writes their `srcset`/`sizes` into the pages |
| `tools/test/` | Automated checks: responsive layout, modals, carousel, comparison table, Lighthouse |
| `images/mascot/` | Polar-bear mascot images used by the booking form and calculator |

Every page declares two things and gets the rest from `site.js`:

```html
<html lang="en" data-root="../../" data-page="services">
```

`data-root` is the relative path back to the site root; `data-page` is the menu item to mark as
current (`home`, `universities`, `destinations`, `services`, `expertise`, `gpa`, `contact`).

## Languages

Page markup is English. `i18n.js` holds a dictionary `English text -> [Uzbek, Russian]` and swaps
text when the visitor picks a language (saved in `localStorage`, default Uzbek). **Any new English
text needs a dictionary entry**, otherwise it stays English in the other languages. For text that
JavaScript creates at runtime use `window.shI18n.setText(el, 'English text')` so it re-translates
on a language switch.

## Booking form

Any element with `data-booking` opens the modal (`<a href="#book-a-consultation" data-booking>`).
Optional attributes on the trigger:

| Attribute | Example | Effect |
|---|---|---|
| `data-booking-country` | `usa` | pre-selects that country |
| `data-booking-programme` | `chevening` | pre-selects that programme |
| `data-booking-gpa` | `3.4 / 4.0` | shown in the form and sent with the request |
| `data-booking-source` | `gpa-calculator` | sent with the request so you know where it came from |

Scripts can do the same thing directly:

```js
openBooking({ programme: 'uwc' });
openBooking({ country: 'australia' });
openBooking({ gpa: '3.4 / 4.0 (university scale)', source: 'gpa-calculator' });
```

The list of countries and programmes is the `INTERESTS` array at the top of `booking.js` —
edit it there and the `<select>`, the validation and the payload all follow.

The form is connected to a Google Apps Script web app: `booking.js` POSTs to the single constant
`BOOKING_ENDPOINT` at the top of the file. The request uses `Content-Type: text/plain` on purpose —
it needs no CORS preflight, which Apps Script cannot answer — and the script parses the body as JSON.
The visitor sees the success screen only if the reply is JSON with `ok: true`; anything else (an
error page, a timeout, no network) shows the failure message and keeps what they typed.

Payload:

```json
{ "firstName": "…", "surname": "…", "phone": "+998901234567", "telegram": "@name or empty",
  "interest": "Chevening", "website": "", "interestType": "programme",
  "consent": true, "language": "uz", "page": "/index.html",
  "submittedAt": "2026-01-01T12:00:00.000Z",
  "gpa": "3.4 / 4.0 (university scale)", "source": "gpa-calculator" }
```

`website` is the honeypot: a hidden field that people never fill in, so a bot that does gives itself
away — the script should discard any request where it is not empty. `interest` is always the English label even when the visitor is reading the site in Uzbek or
Russian. `interestType` is `country`, `programme` or `other`. `gpa` and `source` appear only when
the form was opened with them.

**Never put a Telegram bot token (or any secret) in front-end code** — everything in this repo is
public. The token and chat ID belong in the Apps Script's Script Properties (or a serverless
function's environment variables); the only thing in the site is the endpoint URL.

The two options below are alternatives if you ever move away from Apps Script.

### Option A — Telegram bot behind a serverless function

1. In Telegram, talk to `@BotFather` → `/newbot` → copy the bot token.
2. Send any message to your bot, then open `https://api.telegram.org/bot<TOKEN>/getUpdates` to find
   your `chat.id` (or add the bot to a group and use the group's id).
3. Deploy a function (Cloudflare Workers, Netlify/Vercel Functions, AWS Lambda …). Cloudflare Worker example:

```js
// Environment variables (set in the dashboard, not in code):
//   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, ALLOWED_ORIGIN (e.g. https://your-site.com)
export default {
  async fetch(request, env) {
    const cors = {
      'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: cors });

    let d;
    try { d = await request.json(); } catch { return new Response('Bad JSON', { status: 400, headers: cors }); }
    if (!d.firstName || !d.surname || !/^\+998\d{9}$/.test(d.phone || '') || d.consent !== true) {
      return new Response('Invalid data', { status: 400, headers: cors });
    }

    const text = [
      'New consultation request',
      `Name: ${d.firstName} ${d.surname}`,
      `Phone: ${d.phone}`,
      `Telegram: ${d.telegram || '-'}`,
      `Interest: ${d.interest} (${d.interestType})`,
      d.gpa ? `GPA estimate: ${d.gpa}` : null,
      `Language: ${d.language} · Page: ${d.page}`
    ].filter(Boolean).join('\n');

    const r = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text })
    });
    return new Response(JSON.stringify({ ok: r.ok }), {
      status: r.ok ? 200 : 502,
      headers: { ...cors, 'Content-Type': 'application/json' }
    });
  }
};
```

4. Paste the function's public URL into `BOOKING_ENDPOINT` in `booking.js`.

### Option B — a form service

Any service that accepts a JSON `POST` from the browser (Formspree, Web3Forms, Getform, Google Apps
Script web app …) works: create the form there, paste its endpoint URL into `BOOKING_ENDPOINT`, and
forward submissions to Telegram/e-mail from the service's dashboard. Check that it allows
cross-origin (CORS) JSON requests from your domain.

## Mascot images

The booking form looks for these files in `images/mascot/` and swaps between them as the visitor
moves through the form. Only `mascot-wave.png` exists so far; the other poses show the wave pose
until their file is added **and** its name is added to `AVAILABLE` at the top of `booking.js` (that
list stops the browser asking for files that are not there). If the wave file is missing too, the
Study House emblem is shown:

| File | When it is shown |
| --- | --- |
| `mascot-wave.png` | Welcome (winking) |
| `mascot-curious.png` | Typing first name / surname |
| `mascot-phone.png` | Phone / Telegram fields |
| `mascot-globe.png` | Country / programme select |
| `mascot-happy.png` | Success (arms up) |
| `mascot-worried.png` | Error (friendly) |

Use transparent PNGs, roughly 450×545 px (portrait, same framing for every pose so the swap does
not jump). The current `mascot-wave.png` is cropped from the character sheet and still has the grey
studio backdrop — the booking panel uses the matching grey (`#A8A6A7`) until transparent versions exist.

## Services page

`/services/` is one grid of six cards, built by `services.js` from
`data/programmes.json`. There are no filters and no tag chips.

| Card | What "Learn more" does |
| --- | --- |
| Universities | opens the booking form directly |
| UWC, Work and Travel, FLEX, Erasmus+, Chevening | opens that programme's modal on the same page |

**Editing the content.** Everything is in `data/programmes.json`. A value of `null` renders as
"Not verified yet — see the official site" rather than a guess, so leave it null until you have
read the figure on an official page. When you fill one in, update the `sources` entry with it.

**Work and Travel is Germany**, per the Youth Affairs Agency announcement on gov.uz: a programme
for students to work, gain experience and travel in Germany from May 2026, organised with Youth
Globe XBA, Edu Action and Bildung & Beruf. Age, exact dates and cost are not published there and
are left as placeholders. The page states that Study House is an independent preparation service,
not an organiser — change that only if the owner is actually an authorised organiser.

**Logos.** Put each programme's official logo, downloaded unmodified from its own site, in
`images/programmes/logos/` (transparent PNG, about 400×160), then set that programme's `"logo"` in
`data/programmes.json` to the file's path. While `logo` is `null` the badge shows the programme name
in type, so no mark is ever invented and the page never requests a file that is not there. Do not use a government seal
or the EU flag — on these pages they would read as an endorsement.

**Photos.** `images/programmes/<id>-card.webp` (800×1000) and `<id>-hero.webp` (1600×760), from
Pexels, which permits commercial use without attribution.

**Strings** for this page are in `services-strings.js` as `"English": [Uzbek, Russian]`.

## GPA calculator

Three steps — Grades, Profile, Results — built by `gpa.js` into any `[data-gpa]` element
(`data-gpa="full"` also shows the Ambitious / Realistic / Safe lists).

Grades are entered as **one average score** on whichever scale the visitor picks. There is no
per-subject entry mode and no mascot on this page.

Every scale, score range, threshold and formula is in `data/grades.json` with its source and year.
To add a grading system, add an entry to `scales`: `max`, `pass` and `gpa` (`"bands"`, `"direct"`,
`"letters"` or `null` when no published conversion exists). `pass` is the lowest passing grade and
feeds the modified Bavarian formula.

Rules the calculator holds to, and that any change should preserve:

- no minus or decrement control; the score fields accept digits only, so a negative can never be
  typed or displayed
- every field is clamped to its published range
- every figure is labelled an estimate, and there are no percentile or earnings claims

## Country pages with the compare tool (USA, Australia, China)

The university data for each country is **one JSON file**:

```
data/usa.json
data/australia.json
data/china.json
```

The country page points at it with `data-src`:

```html
<div id="compare-root" data-src="../../data/usa.json"></div>
```

`compare.js` renders the table from that file, and `gpa.js` reads the same three files for the
university shortlist — so a figure only ever has to be corrected in one place.

Shape of the file:

```json
{
  "country": "usa",
  "updated": "2026-09-25",
  "qsEdition": "QS World University Rankings 2027",
  "qsYear": 2027,
  "qsUrl": "https://www.topuniversities.com/world-university-rankings",
  "defaults": ["berkeley", "purdue"],
  "tags": { "prestige": "berkeley", "value": "purdue", "scholarships": "msu" },
  "universities": [
    {
      "id": "berkeley", "name": "UC Berkeley",
      "city": "…", "type": "Public", "qs": "=20",
      "tuition": "…", "living": "…", "english": "…", "fields": "…",
      "scholarships": "…", "deadline": "…", "selective": "…",
      "sources": [["Cost of attendance", "https://…"]]
    }
  ]
}
```

- A value you have not verified goes in as `{ "todo": true }`. It renders as
  "Not verified yet — see the official site" — never invent a number to fill the cell.
- `qs` keeps QS's own notation, so a joint rank stays `"=20"`.
- `tags` picks which university gets each "Best for" badge. The badges describe only the figures
  in the table, which the page says in a line under it.
- When you change a figure, change `updated` and the `sources` entry with it.

The pages read this data with `fetch()`. Browsers refuse that for a page opened straight from a
folder, so `site.js` falls back to `data/bundle.js` there (and only there). That file is generated
from the JSON by `tools/bundle_data.py`, which `tools/stamp.py` runs for you — after editing any
`data/*.json`, run `python3 tools/stamp.py`. Fonts are still blocked from a folder, so the text uses
a fallback font there; for the real look use a server: `python3 -m http.server` in the project root.

The Uzbek and Russian for each page lives beside it in `destinations/<country>/strings.js`.

## After editing CSS or JavaScript

Browsers hold on to a stylesheet or script they already have, so after an edit visitors (and you)
can keep seeing the old version for a while. Run this after changing any `.css` or `.js` file:

```bash
python3 tools/stamp.py
```

It rewrites each page's references to `styles.css?v=3f9a1c2e` and so on, using a hash of the file,
so only files that actually changed get a new address. Safe to run repeatedly. Data files under
`data/` are fetched with `cache: 'no-cache'` and do not need it.

## Testing on every screen size

Automated checks live in `tools/test/` (Playwright driving your installed Chrome, plus Lighthouse).
Serve the site first (`python3 -m http.server 8000` in the project root), then:

```bash
cd tools/test && npm install                # once
node responsive.mjs                         # every page x 14 device sizes, Uzbek
node responsive.mjs --lang ru               # same in Russian (the longest words)
node responsive.mjs --sweep                 # the 16-width sweep, 320px to 3840px
node responsive.mjs --only 320x568 --pages /services/ --shots   # one case, with screenshots
node modals-test.mjs                        # booking form and programme popups, 11 sizes
node booking-submit-test.mjs                # booking submit against a stand-in endpoint: success, every failure, loading
node carousel-test.mjs                      # logo carousel: drift, swipe, pause, wrap
node compare-test.mjs                       # comparison table at tablet widths
node fontsize.mjs 375                       # any body text under 16px on a phone
node serve.mjs &                            # a gzip + cache-header server on :8081, then:
node lighthouse.mjs                         # mobile Lighthouse for the home page and calculator
```

`responsive.mjs` fails (exit 1) if any page at any size has horizontal overflow, a console error,
a broken image, a touch target under 44px, or a wrapped or overlapping header. When it reports an
overflow it names the elements; for a stubborn one, `node who.mjs <url> <width>` lists everything
wider than the screen and `node bisect.mjs <url> <width>` finds the block responsible.

Things the layout relies on, so they are not undone by accident:

- **One number drives the header logo** (`--logo-h` in `styles.css`); below 400px the language
  switcher moves into the mobile menu because it cannot fit beside the logo.
- **From 1920px the page is scaled with CSS `zoom`** (1.25 at 1920, 1.6 at 2560, 2.4 at 3840) so text
  stays readable on a TV. Viewport units are not scaled by zoom, so anything sized in `vh`/`dvh`
  divides by `--zoom`.
- **All hover styles sit inside `@media (hover: hover) and (pointer: fine)`**, so a touch screen never
  gets a stuck hover state. Add new ones the same way.
- **Controls are 44px on touch and narrow screens; form fields are 16px** (iOS zooms the page on
  focus for anything smaller).
- **The booking form on phones is a fixed-height sheet** whose height follows `--vvh` (the visual
  viewport, which shrinks when the keyboard opens); only the form scrolls, so the close and submit
  buttons stay visible.

## Contact details and social profiles

Both live in one place, at the top of `site.js`:

```js
var CONTACT = { phone: '', telegram: '', email: 'info@studyhouse.uz', address: '…' };
var SOCIAL  = { instagram: '', telegram: '', linkedin: '', youtube: '' };
```

An entry left empty is simply not shown — the site never displays an invented phone number or a
dead social link. While every `CONTACT` field is empty the footer's contact column offers the
booking form instead. Fill a value in and it appears on every page. The email and address are
filled in; a phone number and Telegram username are still empty, so they are not shown.

The same contact details should also go into the JSON-LD block in `index.html` (see **SEO**).

## SEO

`tools/seo.py` owns the canonical link, the Open Graph and Twitter tags, `sitemap.xml` and
`robots.txt`. Social scrapers do not run JavaScript, so these have to be real HTML rather than
something `site.js` injects.

```bash
python3 tools/seo.py        # run from the project root
```

Change `BASE_URL` at the top of that file when the domain changes and run it again; it rewrites
only the block between the `<!-- SEO -->` markers, so it is safe to run repeatedly and leaves the
rest of each `<head>` alone. The default is the GitHub Pages address for this repository.

The social preview image is `images/og-card.jpg` (1200×630).

Organization structured data lives in `index.html` as a single JSON-LD block. Contact details are
left out of it on purpose — the comment directly above shows exactly what to paste in once the
owner has them. Put the same details into `CONTACT` in `site.js`, which builds the footer.

## Carousel logos

The homepage strip is the `LOGOS` array at the top of `carousel.js`: a name, a file in `images/`
and an optional `scale` (a round or stacked logo reads better a little larger). Export new logos
as WebP with a transparent background, about 112 px tall, and trim the empty margin around them.
The scroll speed is set from the number of logos, so adding one does not make the strip faster.

The current ten are Cambridge, Pittsburgh, TUM, Melbourne, Edinburgh, Humboldt Berlin, Sydney,
Barcelona, Tampere and Amsterdam. Pittsburgh, Melbourne and Amsterdam were supplied as stock-site
images with a checkerboard baked in; it was converted to real transparency. Replace them with the
official brand files when you have them.

## Images

- Cards are about 800 px wide, heroes about 1600 px, all WebP and under 250 KB.
- Above-the-fold images carry `fetchpriority="high"`; everything below it carries `loading="lazy"`.
- Programme photos are from Pexels (commercial use, no attribution required).
