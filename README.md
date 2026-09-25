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

## Country pages with the compare tool (USA, Australia, China)

`destinations/<country>/data.js` holds `window.SH_COMPARE` (universities, one cell per table row, a
`sources` list per university, the "last updated" date) and `window.SH_EXTRA_DICT` (Uzbek/Russian
translations of that page's copy). `compare.js` renders it.

- A cell is a string, or `{"todo": true}` for a figure that is **not verified yet** — it shows as a marked
  placeholder ("Not verified yet — see the official site"). Never fill a cell without an official source.
- Every fee, deadline and rank needs a year and a link in `sources`. Update `updated` when you re-check.
- Ranks are QS World University Rankings 2027 (`qsYear`, `qsEdition`).
- The "Most prestigious / Best value / Best for scholarships" tags are set in `tags` and must follow the
  figures shown in the table.

## Footer social icons

The four social icons in the footer are `hidden` until real profile URLs exist. To turn one on, set its
`href` and delete the `hidden` attribute (in every page's footer).

## Images

Photos and logos are WebP. Keep new photos at most 1600px wide (heroes) or ~800px (cards), 80–250 KB, and
add `loading="lazy"` to anything below the fold (hero images use `fetchpriority="high"`).
