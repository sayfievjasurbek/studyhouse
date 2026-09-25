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
| `images/mascot/` | Polar-bear mascot images used by the booking form |

## Languages

Page markup is English. `i18n.js` holds a dictionary `English text -> [Uzbek, Russian]` and swaps
text when the visitor picks a language (saved in `localStorage`, default Uzbek). **Any new English
text needs a dictionary entry**, otherwise it stays English in the other languages. For text that
JavaScript creates at runtime use `window.shI18n.setText(el, 'English text')` so it re-translates
on a language switch.

## Booking form

Any element with `data-booking` opens the modal (`<a href="#book-a-consultation" data-booking>`).
Add `data-booking-country="usa"` to pre-select a country.

There is **no backend in this repo**. `booking.js` POSTs JSON to the single constant
`BOOKING_ENDPOINT` at the top of the file. Until you set it, submitting shows the failure message
and logs a warning to the console (it never pretends to succeed).

Payload:

```json
{ "firstName": "…", "surname": "…", "phone": "+998901234567", "telegram": "@name or empty",
  "country": "Germany", "consent": true, "language": "uz", "page": "/index.html",
  "submittedAt": "2026-01-01T12:00:00.000Z" }
```

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
      `Country: ${d.country}`,
      `Language: ${d.language} · Page: ${d.page}`
    ].join('\n');

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
| `mascot-globe.png` | Country select |
| `mascot-happy.png` | Success (arms up) |
| `mascot-worried.png` | Error (friendly) |

Use transparent PNGs, roughly 450×545 px (portrait, same framing for every pose so the swap does
not jump). The current `mascot-wave.png` is cropped from the character sheet and still has the grey
studio backdrop — the booking panel uses the matching grey (`#A8A6A7`) until transparent versions exist.
