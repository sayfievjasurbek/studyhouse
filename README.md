# Study House website

Static site (plain HTML, CSS and JS — no framework, no build step).

```
python3 -m http.server 8000     # then open http://localhost:8000/
```

## Structure

| Path | What it is |
| --- | --- |
| `index.html`, `expertise/`, `destinations/` | Pages |
| `styles.css` | All styles (design tokens are at the top, in `:root`) |
| `script.js` | Home-page behaviour (reveal, navbar, smooth scroll) |
| `i18n.js` | Uzbek / Russian / English switcher — Uzbek is the default |
| `booking.js` | Shared "Book a Consultation" modal |
| `compare.js` | "Compare universities" component used by the USA / Australia / China pages |
| `destinations/{usa,australia,china}/data.js` | Each page's university data, sources and translations |
| `images/mascot/` | Polar-bear mascot images used by the booking form |

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

There is **no backend in this repo**. `booking.js` POSTs JSON to the single constant
`BOOKING_ENDPOINT` at the top of the file. Until you set it, submitting shows the failure message
and logs a warning to the console (it never pretends to succeed).

Payload:

```json
{ "firstName": "…", "surname": "…", "phone": "+998901234567", "telegram": "@name or empty",
  "interest": "Chevening", "interestType": "programme",
  "consent": true, "language": "uz", "page": "/index.html",
  "submittedAt": "2026-01-01T12:00:00.000Z",
  "gpa": "3.4 / 4.0 (university scale)", "source": "gpa-calculator" }
```

`interest` is always the English label even when the visitor is reading the site in Uzbek or
Russian. `interestType` is `country`, `programme` or `other`. `gpa` and `source` appear only when
the form was opened with them.

**Never put a Telegram bot token (or any secret) in front-end code** — everything in this repo is
public. Keep it in a serverless function's environment variables.

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
moves through the form (a missing pose falls back to `mascot-wave.png`; if that is missing too, the
Study House emblem is shown):

| File | When it is shown |
| --- | --- |
| `mascot-wave.png` | Welcome (winking) |
| `mascot-curious.png` | Typing first name / surname |
| `mascot-phone.png` | Phone / Telegram fields |
| `mascot-globe.png` | Country / programme select |
| `mascot-happy.png` | Success (arms up) |
| `mascot-worried.png` | Error (friendly) |
| `mascot-thinking.png` | GPA calculator, while it works out a result |

Use transparent PNGs, roughly 450×545 px (portrait, same framing for every pose so the swap does
not jump). The current `mascot-wave.png` is cropped from the character sheet and still has the grey
studio backdrop — the booking panel uses the matching grey (`#A8A6A7`) until transparent versions exist.

## Services and programme pages

`/services/` lists six cards; five of them link to their own page under `/services/<slug>/`.

| Page | Slug |
| --- | --- |
| Universities (the featured card — its button opens the booking form) | — |
| United World Colleges | `uwc` |
| J-1 Summer Work Travel | `work-and-travel` |
| Future Leaders Exchange | `flex` |
| Erasmus+ | `erasmus-plus` |
| Chevening Scholarship | `chevening` |

**Editing the content.** Every requirement, date and fee on these pages was read from the official
source listed at the bottom of that page. Anything that could not be read renders as
"Not verified yet — see the official site" rather than a guess. When you update a figure, update
the "Last updated" line and the source link with it.

**Logos.** Each card and hero shows a light badge. Put the programme's official logo, downloaded
unmodified from its own site, at `images/programmes/logos/<slug>.png` (transparent PNG, about
400×160). Until the file exists the badge shows the programme name in type — `programmes.js` does
this swap, so no logo is ever invented or redrawn. Do not use a government seal or the EU flag: on
these pages they would read as an endorsement.

**Photos.** `images/programmes/<slug>-card.webp` (800×1000) and `<slug>-hero.webp` (1600×760).
The current photos are from Pexels, which permits commercial use without attribution.

**Filters.** The buttons above the grid filter on the `data-tags` attribute of each card
(`school`, `university`, `masters`, `scholarship`, `free`). Add a tag to the attribute and the
filter picks it up; no other change is needed.

**Strings.** All visible text for these six pages is in `services-strings.js` as
`"English": [Uzbek, Russian]`. Programme names and the titles of the official English source pages
are deliberately left untranslated.

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

**Because the data is fetched, the site must be served over http(s).** Opening `index.html`
straight from the file system will leave the table and the calculator empty. Any static host works;
locally, `python3 -m http.server` in the project root is enough.

The Uzbek and Russian for each page lives beside it in `destinations/<country>/strings.js`.

## Footer social icons

The four social icons in the footer are `hidden` until real profile URLs exist. To turn one on, set its
`href` and delete the `hidden` attribute (in every page's footer).

## Images

Photos and logos are WebP. Keep new photos at most 1600px wide (heroes) or ~800px (cards), 80–250 KB, and
add `loading="lazy"` to anything below the fold (hero images use `fetchpriority="high"`).
