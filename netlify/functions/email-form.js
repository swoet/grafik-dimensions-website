const nodemailer = require('nodemailer');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    // Parse the form data from the event body
    let formData;
    let attachments = [];
    
    if (event.isBase64Encoded) {
      // Handle base64 encoded data
      const buffer = Buffer.from(event.body, 'base64');
      formData = buffer.toString();
    } else {
      formData = event.body;
    }

    // Parse form data manually since multiparty doesn't work in Netlify Functions
    const boundary = event.headers['content-type']?.split('boundary=')[1];
    if (!boundary) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid content type' }),
      };
    }

    // Parse multipart form data manually
    const parts = formData.split('--' + boundary);
    const fields = {};
    const files = {};

    for (const part of parts) {
      if (part.includes('Content-Disposition: form-data')) {
        const lines = part.split('\r\n');
        let name = '';
        let value = '';
        let filename = '';
        let contentType = '';
        let isFile = false;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (line.startsWith('Content-Disposition: form-data')) {
            const nameMatch = line.match(/name="([^"]+)"/);
            const filenameMatch = line.match(/filename="([^"]+)"/);
            
            if (nameMatch) name = nameMatch[1];
            if (filenameMatch) {
              filename = filenameMatch[1];
              isFile = true;
            }
          } else if (line.startsWith('Content-Type:')) {
            contentType = line.split(': ')[1];
          } else if (line === '' && i < lines.length - 1) {
            // This is the start of the content
            value = lines.slice(i + 1).join('\r\n').trim();
            break;
          }
        }

        if (name) {
          if (isFile && filename) {
            if (!files[name]) files[name] = [];
            files[name].push({
              filename: filename,
              content: value,
              contentType: contentType
            });
          } else {
            if (!fields[name]) fields[name] = [];
            fields[name].push(value);
          }
        }
      }
    }

    // Extract form fields
    const name = fields.name ? fields.name[0] : '';
    const email = fields.email ? fields.email[0] : '';
    const phone = fields.phone ? fields.phone[0] : '';
    const service = fields.service ? fields.service[0] : '';
    const details = fields.details ? fields.details[0] : '';

    // Handle file attachments
    if (files.attachments) {
      attachments = files.attachments.map(file => ({
        filename: file.filename,
        content: file.content,
        contentType: file.contentType,
      }));
    }

    // Validate required fields
    if (!name || !email || !service) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: name, email, service' }),
      };
    }

    // Configure SMTP transport
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

    // Send email
    await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Email sent successfully' }),
    };

  } catch (error) {
    console.error('Email function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to send email', 
        details: error.message 
      }),
    };
  }
};
