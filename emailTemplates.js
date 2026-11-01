// emailTemplates.js
// Bill Wallah transactional email templates (signup, login, recharge, wallet).
// Each function returns { subject, html }. Pass them to your mail sender
// (Nodemailer / SMTP from support@billwallah.com).
//
// Usage:
//   const { templates } = require('./emailTemplates');
//   const { subject, html } = templates.signup({ name, email, dateTime });
//   sendMail(email, subject, html);

const BRAND = {
  name: 'Bill Wallah',
  site: 'https://billwallah.com',
  appUrl: 'https://play.google.com/store/apps/details?id=app.Billwallah', // Android app on Google Play
  contactUrl: 'mailto:support@billwallah.com', // "Contact us" opens the user's email app
  year: new Date().getFullYear(),
};

const COLORS = {
  pageBg: '#EEF5FF',
  card: '#FFFFFF',
  primary: '#0B57D0',
  text: '#111111',
  muted: '#5F6368',
  infoBg: '#F4F6F8',
  success: '#188038',
  danger: '#D93025',
};

// Every email is sent for actions done in the mobile app, so this is always shown.
const DEVICE = 'Mobile App';

const FONT = "Arial, Helvetica, sans-serif";

// Escape user supplied values so names/emails can never break the HTML.
function esc(v) {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Format: "14 October 2026 at 08:04 pm IST"
function formatIST(date = new Date()) {
  const d = new Date(date);
  const day = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata',
  }).format(d);
  const time = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata',
  }).format(d).toLowerCase();
  return `${day} at ${time} IST`;
}

function formatINR(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 0, maximumFractionDigits: 2,
  });
}

// Grey details box. rows = [['Label', 'Value'], ...]
function detailsBox(rows) {
  const lines = rows
    .map(
      ([label, value]) =>
        `<tr><td class="detail-cell" style="padding:6px 0;font-family:${FONT};font-size:14px;line-height:20px;color:${COLORS.text};text-align:left;word-break:break-word;overflow-wrap:anywhere;">
          <b>${esc(label)}:</b> ${value}
        </td></tr>`
    )
    .join('');
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COLORS.infoBg};border-radius:10px;margin:20px 0;">
    <tr><td class="details-pad" style="padding:10px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${lines}</table>
    </td></tr>
  </table>`;
}

// Shared layout used by every email.
// headline: bold line under greeting. highlight: optional coloured line (e.g. amount).
function layout({ preheader, name, headline, emailLine, details, body, buttonText, buttonUrl }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="x-apple-disable-message-reformatting">
<title>${esc(BRAND.name)}</title>
<style>
  /* Mobile styles. Inline styles below are the fallback for apps that ignore <style>. */
  body, table, td, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
  img { border:0; }
  @media only screen and (max-width:520px) {
    .outer-pad { padding:0 !important; }
    .container { width:100% !important; max-width:100% !important; border-left:0 !important; border-right:0 !important; }
    .logo { padding:22px 12px 14px !important; font-size:24px !important; }
    .gutter { padding:0 10px !important; }
    .card-pad { padding:22px 14px 24px !important; }
    .details-pad { padding:6px 12px !important; }
    .detail-cell { font-size:13px !important; padding:5px 0 !important; }
    .headline { font-size:15px !important; }
    .body-text { font-size:13px !important; }
    .btn-table { width:100% !important; }
    .btn-link { display:block !important; padding:15px 12px !important; font-size:15px !important; }
    .footer-pad { padding:18px 16px 22px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:#FFFFFF;">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(preheader || '')}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FFFFFF;">
<tr><td align="center" class="outer-pad" style="padding:24px 12px;">

  <table role="presentation" width="480" class="container" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:480px;background:${COLORS.pageBg};border:1px solid #DCE6F5;">
    <tr><td align="center" class="logo" style="padding:28px 16px 18px;font-family:${FONT};font-size:28px;font-weight:bold;font-style:italic;color:${COLORS.primary};">
      ${esc(BRAND.name)}
    </td></tr>

    <tr><td class="gutter" style="padding:0 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COLORS.card};border-top:4px solid ${COLORS.primary};border-radius:14px 14px 14px 14px;">
        <tr><td align="center" class="card-pad" style="padding:28px 24px 30px;font-family:${FONT};color:${COLORS.text};">

          <p style="margin:0 0 14px;font-size:14px;line-height:20px;">Hey ${esc(name)},</p>
          <p class="headline" style="margin:0 0 10px;font-size:15px;line-height:22px;font-weight:bold;">${headline}</p>
          ${emailLine ? `<p style="margin:0;font-size:14px;line-height:20px;word-break:break-all;"><a href="mailto:${esc(emailLine)}" style="color:${COLORS.primary};text-decoration:underline;">${esc(emailLine)}</a></p>` : ''}

          ${details ? detailsBox(details) : '<div style="height:16px;"></div>'}

          <p class="body-text" style="margin:0 0 22px;font-size:13px;line-height:20px;color:${COLORS.text};">${body}</p>

          <table role="presentation" class="btn-table" cellpadding="0" cellspacing="0" border="0" align="center">
            <tr><td align="center" style="background:${COLORS.primary};border-radius:6px;">
              <a href="${esc(buttonUrl)}" class="btn-link" style="display:inline-block;padding:14px 28px;font-family:${FONT};font-size:14px;font-weight:bold;color:#FFFFFF;text-decoration:none;">${esc(buttonText)}</a>
            </td></tr>
          </table>

          <p style="margin:14px 0 0;font-size:11px;line-height:16px;color:${COLORS.text};word-break:break-all;">
            Not working? Click: <a href="${esc(buttonUrl)}" style="color:${COLORS.primary};">${esc(buttonUrl)}</a>
          </p>
        </td></tr>
      </table>
    </td></tr>

    <tr><td align="center" class="footer-pad" style="padding:22px 24px 26px;font-family:${FONT};font-size:11px;line-height:18px;color:${COLORS.muted};">
      This is an automated notification. For account safety, please do not share your credentials with anyone.<br>
      If you have any queries or require help, please click the link below.
      <br><br>
      <a href="${esc(BRAND.contactUrl)}" style="color:${COLORS.primary};text-decoration:underline;">Contact us</a>
      <br><br>
      <span style="font-size:10px;color:#80868B;">&copy; ${BRAND.year} ${esc(BRAND.name)}. All rights reserved.</span>
    </td></tr>
  </table>

</td></tr>
</table>
</body>
</html>`;
}

const templates = {
  // 1. New account created
  // data: { name, email, dateTime? }
  signup({ name, email, dateTime }) {
    return {
      subject: `Welcome to ${BRAND.name}! Your account is ready`,
      html: layout({
        preheader: 'Your Bill Wallah account has been created.',
        name,
        headline: `Welcome to ${esc(BRAND.name)}! Your account has been created successfully.`,
        emailLine: email,
        details: [
          ['Full Name', esc(name)],
          ['Registration Date & Time', esc(formatIST(dateTime))],
          ['Device', DEVICE],
        ],
        body: `Thank you for joining ${esc(BRAND.name)}. You can now log in and start using your account.<br>If you did not create this account, please contact our support team immediately.`,
        buttonText: `Explore ${BRAND.name}`,
        buttonUrl: BRAND.site,
      }),
    };
  },

  // 2. New login detected
  // data: { name, email, dateTime?, location? }
  login({ name, email, dateTime, location }) {
    const rows = [['Date & Time', esc(formatIST(dateTime))], ['Device', DEVICE]];
    if (location) rows.push(['Location', esc(location)]);
    return {
      subject: `New login detected in your ${BRAND.name} account`,
      html: layout({
        preheader: 'We noticed a new login to your account.',
        name,
        headline: 'We noticed a new login for your account',
        emailLine: email,
        details: rows,
        body: `If this was you, you can safely ignore this message.<br>If this wasn't you, please log in to your account and change your password immediately to secure your account.`,
        buttonText: 'Secure my account',
        buttonUrl: BRAND.site,
      }),
    };
  },

  // 3. Recharge result
  // data: { name, email, mobile, operator?, amount, txnId, status: 'success' | 'failed' | 'pending', dateTime? }
  recharge({ name, email, mobile, operator, amount, txnId, status = 'success', dateTime }) {
    const map = {
      success: { label: 'Successful', color: COLORS.success, head: 'Your recharge was successful.', note: 'Thank you for using Bill Wallah.' },
      failed: { label: 'Failed', color: COLORS.danger, head: 'Your recharge could not be completed.', note: 'If any amount was deducted, it will be refunded to your wallet automatically. Please contact support if you do not receive it.' },
      pending: { label: 'Pending', color: '#B06000', head: 'Your recharge is being processed.', note: 'We will email you again as soon as the final status is confirmed.' },
    };
    const s = map[status] || map.success;
    const rows = [
      ['Mobile Number', esc(mobile)],
    ];
    if (operator) rows.push(['Operator', esc(operator)]);
    rows.push(
      ['Amount', esc(formatINR(amount))],
      ['Status', `<b style="color:${s.color};">${s.label}</b>`],
      ['Transaction ID', esc(txnId)],
      ['Date & Time', esc(formatIST(dateTime))],
      ['Device', DEVICE]
    );
    return {
      subject: `Recharge ${s.label}: ${formatINR(amount)} for ${mobile}`,
      html: layout({
        preheader: `Recharge ${s.label.toLowerCase()} for ${mobile}.`,
        name,
        headline: s.head,
        emailLine: email,
        details: rows,
        body: s.note,
        buttonText: 'View my transactions',
        buttonUrl: BRAND.appUrl,
      }),
    };
  },

  // 4. Wallet transaction (money added / debited / refunded)
  // data: { name, email, type: 'credit' | 'debit' | 'refund', amount, balance, txnId, reason?, dateTime? }
  wallet({ name, email, type = 'credit', amount, balance, txnId, reason, dateTime }) {
    const map = {
      credit: { label: 'Money Added', color: COLORS.success, head: 'Money was added to your wallet.' },
      debit: { label: 'Money Deducted', color: COLORS.danger, head: 'Money was deducted from your wallet.' },
      refund: { label: 'Refund Received', color: COLORS.success, head: 'A refund was added to your wallet.' },
    };
    const s = map[type] || map.credit;
    const rows = [
      ['Type', `<b style="color:${s.color};">${s.label}</b>`],
      ['Amount', esc(formatINR(amount))],
    ];
    if (reason) rows.push(['Reason', esc(reason)]);
    rows.push(
      ['Wallet Balance', esc(formatINR(balance))],
      ['Transaction ID', esc(txnId)],
      ['Date & Time', esc(formatIST(dateTime))],
      ['Device', DEVICE]
    );
    return {
      subject: `Wallet: ${s.label} ${formatINR(amount)}`,
      html: layout({
        preheader: `${s.label}: ${formatINR(amount)}. New balance ${formatINR(balance)}.`,
        name,
        headline: s.head,
        emailLine: email,
        details: rows,
        body: `If you did not make this transaction, please contact our support team immediately.`,
        buttonText: 'Open my wallet',
        buttonUrl: BRAND.appUrl,
      }),
    };
  },
};

module.exports = { templates, BRAND };