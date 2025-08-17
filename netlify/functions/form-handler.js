const nodemailer = require('nodemailer');

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    // Parse the form data from the event body
    let formData;
    
    if (event.isBase64Encoded) {
      const buffer = Buffer.from(event.body, 'base64');
      formData = buffer.toString();
    } else {
      formData = event.body;
    }

    // Parse the form data (Netlify sends it as URL-encoded or multipart)
    const params = new URLSearchParams(formData);
    
    // Extract form fields
    const name = params.get('name') || '';
    const email = params.get('email') || '';
    const phone = params.get('phone') || '';
    const service = params.get('service') || '';
    const details = params.get('details') || '';
    const formName = params.get('form-name') || '';

    // Validate required fields
    if (!name || !email || !service) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Missing required fields',
          missing: ['name', 'email', 'service'].filter(field => !params.get(field))
        }),
      };
    }

    // Check if this is a spam submission
    if (formName !== 'quote-request') {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid form submission' }),
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
    const emailText = `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\nService: ${service}\nDetails: ${details}`;
    
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
        <p><strong>Form:</strong> ${formName}</p>
        <hr>
        <p><em>This form was submitted through your website contact form.</em></p>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Return success response
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Form submitted successfully',
        details: {
          name,
          email,
          service,
          formName
        }
      }),
    };

  } catch (error) {
    console.error('Form handler error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to process form submission', 
        details: error.message 
      }),
    };
  }
};
