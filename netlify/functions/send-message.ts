import type { Context } from '@netlify/functions';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Default routes to cj@ — the general contact inbox per client direction.
// CONTACT_TO_EMAIL env var in Netlify overrides this if a different recipient
// is ever needed without a redeploy.
const TO_EMAIL = process.env.CONTACT_TO_EMAIL || 'cj@activeinsurancegj.com';
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || 'onboarding@resend.dev';
const SITE_DOMAIN = 'activeinsurancegj.com';

// --- Bot/spam protection (Tier 1: no third party) ---
// Field length caps. Anything legitimate fits comfortably; the caps just
// stop a bot from relaying a megabyte of payload through us to cj@.
const LIMITS = { name: 100, email: 150, phone: 40, message: 5000 } as const;
// Minimum time a human plausibly spends on the form before submitting.
// Bots POST in well under a second; real users take many seconds.
const MIN_FILL_MS = 3000;
// Messages with this many URLs are almost always link spam, not a real
// insurance inquiry. We reject (not silently drop) so a rare legit sender
// can adjust rather than have their message vanish.
const MAX_LINKS = 3;

// Requests must originate from our own site. The function endpoint is public,
// so this blocks the easy attack: a bot POSTing straight to the URL with no
// browser in the loop. Covers prod, www, and any *.netlify.app deploy/preview,
// plus localhost for `netlify dev`.
function isAllowedOrigin(value: string | null): boolean {
  if (!value) return false;
  try {
    const host = new URL(value).hostname;
    return (
      host === 'activeinsurancegj.com' ||
      host === 'www.activeinsurancegj.com' ||
      host.endsWith('.netlify.app') ||
      host === 'localhost' ||
      host === '127.0.0.1'
    );
  } catch {
    return false;
  }
}

// Generic 200 used when we silently drop a request we're confident is a bot
// (honeypot tripped, submitted too fast). Returning success — rather than an
// error — denies the bot any signal it can adapt to.
function silentOk() {
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function countLinks(text: string): number {
  return (text.match(/https?:\/\/|www\./gi) || []).length;
}

export default async (req: Request, _context: Context) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Layer 1 — origin gate. Reject anything not posted from our own pages.
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');
  if (!isAllowedOrigin(origin) && !isAllowedOrigin(referer)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const {
      name,
      email,
      message,
      phone,
      bestDay,
      bestTime,
      preferredMethod,
      website, // honeypot — must stay empty
      elapsedMs, // ms between form render and submit
    } = await req.json();

    // Layer 2 — honeypot. Hidden field no human sees; a filled value is a bot.
    if (typeof website === 'string' && website.trim() !== '') {
      return silentOk();
    }

    // Layer 3 — timing gate. Submissions faster than a human can type are bots.
    if (typeof elapsedMs === 'number' && elapsedMs >= 0 && elapsedMs < MIN_FILL_MS) {
      return silentOk();
    }

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: 'Name, email, and message are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email address.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Layer 4 — length caps.
    if (
      String(name).length > LIMITS.name ||
      String(email).length > LIMITS.email ||
      String(message).length > LIMITS.message ||
      (phone && String(phone).length > LIMITS.phone)
    ) {
      return new Response(JSON.stringify({ error: 'One or more fields are too long.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Layer 5 — link heuristic. Real inquiries rarely contain several URLs.
    if (countLinks(String(message)) >= MAX_LINKS) {
      return new Response(
        JSON.stringify({ error: 'Your message looks like spam. Please remove links and try again.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const optionalRow = (label: string, value?: string) =>
      value
        ? `<tr>
            <td style="padding: 8px 12px; font-weight: 600; color: #4b5563; vertical-align: top;">${label}</td>
            <td style="padding: 8px 12px; color: #1f2937;">${escapeHtml(value)}</td>
          </tr>`
        : '';

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      replyTo: email,
      subject: `New message from ${name} via ${SITE_DOMAIN}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1B4F8A; margin-bottom: 24px;">New Contact Form Submission</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 12px; font-weight: 600; color: #4b5563; vertical-align: top; width: 140px;">Name</td>
              <td style="padding: 8px 12px; color: #1f2937;">${escapeHtml(name)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; font-weight: 600; color: #4b5563; vertical-align: top;">Email</td>
              <td style="padding: 8px 12px; color: #1f2937;"><a href="mailto:${escapeHtml(email)}" style="color: #1B4F8A;">${escapeHtml(email)}</a></td>
            </tr>
            ${optionalRow('Phone', phone)}
            ${optionalRow('Best day to contact', bestDay)}
            ${optionalRow('Best time to contact', bestTime)}
            ${optionalRow('Preferred method', preferredMethod)}
            <tr>
              <td style="padding: 8px 12px; font-weight: 600; color: #4b5563; vertical-align: top;">Message</td>
              <td style="padding: 8px 12px; color: #1f2937; white-space: pre-wrap;">${escapeHtml(message)}</td>
            </tr>
          </table>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="font-size: 12px; color: #9ca3af;">Sent from the contact form on ${SITE_DOMAIN}</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return new Response(JSON.stringify({ error: 'Failed to send message. Please try again.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Send message error:', err);
    return new Response(JSON.stringify({ error: 'An unexpected error occurred.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
