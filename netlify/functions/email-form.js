const nodemailer = require('nodemailer');
const multiparty = require('multiparty');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  return new Promise((resolve, reject) => {
    const form = new multiparty.Form();
    form.parse({ headers: event.headers, ...event }, async (err, fields, files) => {
      if (err) {
        resolve({ statusCode: 400, body: 'Invalid form data' });
        return;
      }
      const name = fields.name ? fields.name[0] : '';
      const email = fields.email ? fields.email[0] : '';
      const phone = fields.phone ? fields.phone[0] : '';
      const service = fields.service ? fields.service[0] : '';
      const details = fields.details ? fields.details[0] : '';
      const attachments = (files.attachments || []).map(file => ({
        filename: file.originalFilename,
        path: file.path,
        contentType: file.headers['content-type'],
      }));

      // Configure your SMTP transport (use environment variables for security)
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const mailOptions = {
        from: process.env.SMTP_FROM || 'no-reply@grafikdimensions.co.zw',
        to: 'munyangadzishawn@gmail.com',
        subject: `New Quote Request from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nService: ${service}\nDetails: ${details}`,
        attachments,
      };

      try {
        await transporter.sendMail(mailOptions);
        resolve({
          statusCode: 200,
          body: JSON.stringify({ message: 'Email sent successfully' }),
        });
      } catch (error) {
        resolve({
          statusCode: 500,
          body: JSON.stringify({ error: 'Failed to send email', details: error.message }),
        });
      }
    });
  });
};
