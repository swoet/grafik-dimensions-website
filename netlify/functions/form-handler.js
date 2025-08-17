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
    console.log('Form handler called with event:', {
      httpMethod: event.httpMethod,
      contentType: event.headers['content-type'],
      bodyLength: event.body ? event.body.length : 0,
      isBase64Encoded: event.isBase64Encoded
    });

    // Parse the form data from the event body
    let formData;
    
    if (event.isBase64Encoded) {
      const buffer = Buffer.from(event.body, 'base64');
      formData = buffer.toString();
    } else {
      formData = event.body;
    }

    console.log('Parsed form data:', formData);

    // Check if this is multipart form data
    if (event.headers['content-type'] && event.headers['content-type'].includes('multipart/form-data')) {
      // For multipart data, we need to parse it differently
      // For now, let's extract what we can from the raw data
      const nameMatch = formData.match(/name="([^"]+)"/g);
      const emailMatch = formData.match(/email="([^"]+)"/g);
      const serviceMatch = formData.match(/service="([^"]+)"/g);
      const phoneMatch = formData.match(/phone="([^"]+)"/g);
      const detailsMatch = formData.match(/details="([^"]+)"/g);
      
      const name = nameMatch ? nameMatch[0].replace('name="', '').replace('"', '') : '';
      const email = emailMatch ? emailMatch[0].replace('email="', '').replace('"', '') : '';
      const service = serviceMatch ? serviceMatch[0].replace('service="', '').replace('"', '') : '';
      const phone = phoneMatch ? phoneMatch[0].replace('phone="', '').replace('"', '') : '';
      const details = detailsMatch ? detailsMatch[0].replace('details="', '').replace('"', '') : '';
      
      console.log('Extracted fields from multipart:', { name, email, service, phone, details });
      
      // Validate required fields
      if (!name || !email || !service) {
        return {
          statusCode: 400,
          body: JSON.stringify({ 
            error: 'Missing required fields',
            missing: ['name', 'email', 'service'].filter(field => !eval(field)),
            received: { name, email, service, phone, details }
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
          <hr>
          <p><em>This form was submitted through your website contact form.</em></p>
        `
      };

      // Send email
      await transporter.sendMail(mailOptions);

      return {
        statusCode: 200,
        body: JSON.stringify({ 
          message: 'Form submitted successfully',
          details: { name, email, service }
        }),
      };
    } else {
      // Handle URL-encoded form data
      const params = new URLSearchParams(formData);
      
      // Extract form fields
      const name = params.get('name') || '';
      const email = params.get('email') || '';
      const phone = params.get('phone') || '';
      const service = params.get('service') || '';
      const details = params.get('details') || '';

      console.log('Extracted fields from URL-encoded:', { name, email, service, phone, details });

      // Validate required fields
      if (!name || !email || !service) {
        return {
          statusCode: 400,
          body: JSON.stringify({ 
            error: 'Missing required fields',
            missing: ['name', 'email', 'service'].filter(field => !params.get(field)),
            received: { name, email, service, phone, details }
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
          <hr>
          <p><em>This form was submitted through your website contact form.</em></p>
        `
      };

      // Send email
      await transporter.sendMail(mailOptions);

      return {
        statusCode: 200,
        body: JSON.stringify({ 
          message: 'Form submitted successfully',
          details: { name, email, service }
        }),
      };
    }

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
