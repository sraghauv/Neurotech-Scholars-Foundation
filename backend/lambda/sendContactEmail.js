import { Resend } from 'resend';

// Load Resend API key from environment variables
const resendApiKey = process.env.RESEND_API_KEY;
// Load the destination email from environment variables
const destinationEmail = process.env.DESTINATION_EMAIL;
// Load the source email (from your verified Resend domain) from environment variables
const sourceEmail = process.env.SOURCE_EMAIL;

if (!resendApiKey) {
  throw new Error('RESEND_API_KEY environment variable is not set.');
}
if (!destinationEmail) {
  throw new Error('DESTINATION_EMAIL environment variable is not set.');
}
if (!sourceEmail) {
  throw new Error('SOURCE_EMAIL environment variable is not set.');
}

const resend = new Resend(resendApiKey);

export const handler = async (event) => {
  // Define CORS headers - Allow specific origin for better security
  const headers = {
    // Use the specific origin instead of '*' for better security in production
    'Access-Control-Allow-Origin': 'http://localhost:5173', 
    'Access-Control-Allow-Headers': 'Content-Type', // Match your global API Gateway config
    'Access-Control-Allow-Methods': 'POST, OPTIONS' // Match your global API Gateway config
  };

  // Handle OPTIONS preflight request
  // Check based on the structure for HTTP API payload format 2.0
  if (event.requestContext?.http?.method === 'OPTIONS') {
    console.log("Handling OPTIONS preflight request");
    return {
      statusCode: 200,
      headers,
      body: '' // No body needed for OPTIONS response
    };
  }

  console.log("Received event structure:", JSON.stringify(event, null, 2));

  // *** Add detailed logging for the body ***
  console.log("Attempting to process event.body:", event.body);
  console.log("Type of event.body:", typeof event.body);
  // ******************************************

  let formData;
  try {
    // API Gateway v2 (HTTP API) with payload format 2.0 automatically parses JSON body
    // if Content-Type is application/json.
    // If body is not present or Content-Type is different, event.body might be undefined or a string.
    // We handle potential string case for robustness, although not expected with our frontend.
    if (typeof event.body === 'string') {
       formData = JSON.parse(event.body);
    } else {
       formData = event.body; // Assume it's already an object
    }

    if (!formData) {
        throw new Error("Request body is missing or not an object.");
    }

  } catch (error) {
    console.error("Error processing request body:", error);
    return {
      statusCode: 400, // Bad Request
      headers,
      body: JSON.stringify({ error: 'Invalid request body format' }) // Changed error message
    };
  }

  // Basic input validation - Use names from the frontend form
  const { club_name, university, representative, contact_email, project_description, questions } = formData;
  if (!club_name || !university || !representative || !contact_email || !project_description) { // Removed check for questions as it might be optional
    console.warn("Missing required fields:", { club_name, university, representative, contact_email, project_description });
    return {
      statusCode: 400, // Bad Request
      headers,
      body: JSON.stringify({ error: 'Missing required fields' })
    };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: sourceEmail, // e.g., 'Contact Form <noreply@yourverifieddomain.com>'
      to: [destinationEmail], // e.g., 'neurotechscholars@gmail.com'
      subject: `[TxNT Comp] Registration from ${club_name} (${university})`, // Updated subject
      reply_to: contact_email, // Set the reply-to for easy response
      html: `
        <h1>TxNT Competition Registration</h1>
        <p><strong>Club Name:</strong> ${club_name}</p>
        <p><strong>University:</strong> ${university}</p>
        <p><strong>Representative:</strong> ${representative}</p>
        <p><strong>Contact Email:</strong> ${contact_email}</p>
        <p><strong>Project Description:</strong></p>
        <p>${project_description}</p>
        <p><strong>Questions:</strong></p>
        <p>${questions || 'None'}</p> 
      ` // Updated HTML body
    });

    if (error) {
      console.error('Resend Error:', error);
      return {
        statusCode: 500, // Internal Server Error
        headers,
        body: JSON.stringify({ error: 'Failed to send email' })
      };
    }

    console.log('Resend Success:', data);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: 'Email sent successfully' })
    };

  } catch (error) {
    console.error('Lambda Error:', error);
    return {
      statusCode: 500, // Internal Server Error
      headers,
      body: JSON.stringify({ error: 'An unexpected error occurred' })
    };
  }
}; 