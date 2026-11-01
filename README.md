```javascript
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
```