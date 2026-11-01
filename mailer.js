// mailer.js
// Sends Bill Wallah email alerts through the Hostinger mailbox support@billwallah.com.
// Runs on the BACKEND only. Never put this file or the password in frontend code.
//
// Install:  npm install nodemailer dotenv
// Setup:    copy .env.example to .env and fill in MAIL_PASS

require('dotenv').config();
const nodemailer = require('nodemailer');
const { templates } = require('./emailTemplates');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.hostinger.com',
  port: Number(process.env.MAIL_PORT) || 465,
  secure: (Number(process.env.MAIL_PORT) || 465) === 465, // true for 465, false for 587
  auth: {
    user: process.env.MAIL_USER, // support@billwallah.com
    pass: process.env.MAIL_PASS,
  },
});

// Core sender. Never throws, so an email failure can never break a recharge or wallet action.
async function sendMail(to, { subject, html }) {
  if (!to) return false;
  try {
    await transporter.sendMail({
      from: `"Bill Wallah" <${process.env.MAIL_USER}>`,
      replyTo: process.env.MAIL_USER,
      to,
      subject,
      html,
    });
    return true;
  } catch (err) {
    console.error('[mailer] failed to send to', to, '-', err.message);
    return false;
  }
}

// One helper per event. Call these WITHOUT await so the user is not kept waiting.
// user = { name, email }
const mail = {
  signup: (user) =>
    sendMail(user.email, templates.signup({ name: user.name, email: user.email })),

  // location is optional, e.g. location: 'Patna, India'. Device is always shown as 'Mobile App'.
  login: (user, { location } = {}) =>
    sendMail(user.email, templates.login({ name: user.name, email: user.email, location })),

  // status: 'success' | 'failed' | 'pending'
  recharge: (user, { mobile, operator, amount, txnId, status }) =>
    sendMail(
      user.email,
      templates.recharge({ name: user.name, email: user.email, mobile, operator, amount, txnId, status })
    ),

  // type: 'credit' | 'debit' | 'refund'
  wallet: (user, { type, amount, balance, txnId, reason }) =>
    sendMail(
      user.email,
      templates.wallet({ name: user.name, email: user.email, type, amount, balance, txnId, reason })
    ),
};

module.exports = { mail, sendMail };

/* ------------------------------------------------------------------
   HOW TO USE (inside your existing route handlers)

   const { mail } = require('./mailer');

   // After signup is saved in the database
   mail.signup({ name: user.name, email: user.email });

   // After login succeeds (only on a new device or location)
   mail.login(user, { location: 'Patna, India' });

   // After the recharge API gives the FINAL result
   mail.recharge(user, { mobile: '9876543210', operator: 'Jio', amount: 299, txnId: 'BW123', status: 'success' });

   // After a wallet credit or debit is saved
   mail.wallet(user, { type: 'credit', amount: 500, balance: 1250, txnId: 'WL456' });
------------------------------------------------------------------- */