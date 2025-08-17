const nodemailer = require('nodemailer');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    // Parse JSON data from the request body
    let formData;
    
    if (event.isBase64Encoded) {
      // Handle base64 encoded data
      const buffer = Buffer.from(event.body, 'base64');
      formData = JSON.parse(buffer.toString());
    } else {
      formData = JSON.parse(event.body);
    }

    // Extract form fields
    const { name, email, phone, service, details, hasAttachments, attachmentCount, attachmentNames } = formData;

    // Validate required fields
    if (!name || !email || !service) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Missing required fields', 
          missing: ['name', 'email', 'service'].filter(field => !formData[field])
        }),
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

    // Create email content
    let emailText = `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\nService: ${service}\nDetails: ${details}`;
    
    if (hasAttachments) {
      emailText += `\n\nAttachments: ${attachmentCount} file(s)\nFile names: ${attachmentNames.join(', ')}`;
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || 'no-reply@grafikdimensions.co.zw',
      to: 'munyangadzishawn@gmail.com',
      subject: `New Quote Request from ${name}`,
      text: emailText,
      html: `
        <h2>New Quote Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Details:</strong> ${details}</p>
        ${hasAttachments ? `<p><strong>Attachments:</strong> ${attachmentCount} file(s)<br>Files: ${attachmentNames.join(', ')}</p>` : ''}
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Email sent successfully',
        details: {
          name,
          email,
          service,
          hasAttachments: hasAttachments || false
        }
      }),
    };

  } catch (error) {
    console.error('Email function error:', error);
    
    // Handle JSON parsing errors specifically
    if (error instanceof SyntaxError) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Invalid JSON data received',
          details: 'The form data could not be parsed correctly'
        }),
      };
    }
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to send email', 
        details: error.message 
      }),
    };
  }
};
