import type { Context } from '@netlify/functions';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Default routes to rhonda@ — the general contact inbox per client direction.
// CONTACT_TO_EMAIL env var in Netlify overrides this if a different recipient
// is ever needed without a redeploy. (cj@ is the CEO's personal address and
// is NOT the right destination for general inquiries.)
const TO_EMAIL = process.env.CONTACT_TO_EMAIL || 'rhonda@activeinsurancegj.com';
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || 'onboarding@resend.dev';
const SITE_DOMAIN = 'activeinsurancegj.com';

export default async (req: Request, _context: Context) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
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
    } = await req.json();

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
