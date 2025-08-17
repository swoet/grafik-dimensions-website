# Grafik Dimensions Website

## Contact Form Email Backend (Netlify Functions)

This site uses a Netlify serverless function to process contact form submissions and send emails with attachments.

### Setup

1. **Dependencies**: Netlify will install dependencies from `package.json` in the `netlify/functions` directory.
2. **Environment Variables** (set in Netlify dashboard):
   - `SMTP_HOST` (e.g. smtp.gmail.com)
   - `SMTP_PORT` (e.g. 465 for SSL, 587 for TLS)
   - `SMTP_SECURE` (`true` for SSL, `false` for TLS)
   - `SMTP_USER` (your SMTP username/email)
   - `SMTP_PASS` (your SMTP password or app password)
   - `SMTP_FROM` (optional, the from address)

### How it works
- The contact form on `/contact/` POSTs to `/.netlify/functions/email-form`.
- The function sends the form data and any file attachments to `munyangadzishawn@gmail.com`.

### Deploying
- Push your site to GitHub and connect it to Netlify.
- Set the environment variables in the Netlify dashboard under Site Settings > Environment Variables.
- Deploy!

### Notes
- You may need to use an app password for Gmail or similar services.
- Attachments are supported (PDF, JPG, PNG, AI, PSD, EPS).
