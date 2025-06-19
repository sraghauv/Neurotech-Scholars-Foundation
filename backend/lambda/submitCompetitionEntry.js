const { Resend } = require('resend');

// Load Resend API key from environment variables
const resendApiKey = process.env.RESEND_API_KEY;
// Email for competition submissions
const competitionEmail = 'neurotechscholars@gmail.com';
// Load the source email (from your verified Resend domain) from environment variables
const sourceEmail = process.env.SOURCE_EMAIL;

if (!resendApiKey) {
  throw new Error('RESEND_API_KEY environment variable is not set.');
}
if (!sourceEmail) {
  throw new Error('SOURCE_EMAIL environment variable is not set.');
}

const resend = new Resend(resendApiKey);

exports.handler = async (event) => {
  // Define CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*', // Update this to your domain in production
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle OPTIONS preflight request
  if (event.requestContext?.http?.method === 'OPTIONS') {
    console.log("Handling OPTIONS preflight request");
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  console.log("Received submission event:", JSON.stringify(event, null, 2));

  let submissionData;
  try {
    if (typeof event.body === 'string') {
       submissionData = JSON.parse(event.body);
    } else {
       submissionData = event.body;
    }

    if (!submissionData) {
        throw new Error("Request body is missing or not an object.");
    }

  } catch (error) {
    console.error("Error processing request body:", error);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid request body format' })
    };
  }

  // Validate required fields
  const { 
    team_name, 
    university, 
    team_leader, 
    contact_email, 
    project_title, 
    project_description,
    file_name,
    file_data,
    file_size
  } = submissionData;

  if (!team_name || !university || !team_leader || !contact_email || !project_title || !project_description || !file_name || !file_data) {
    console.warn("Missing required fields in submission");
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Missing required fields' })
    };
  }

  // Check file size (50MB limit)
  if (file_size > 50 * 1024 * 1024) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'File size exceeds 50MB limit' })
    };
  }

  try {
    // Convert base64 back to buffer for attachment
    const fileBuffer = Buffer.from(file_data, 'base64');
    
    // Create email content
    const emailContent = `
      <h1>🧠 Texas Neurotech Competition Submission</h1>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2>Team Information</h2>
        <p><strong>Team Name:</strong> ${team_name}</p>
        <p><strong>University/Institution:</strong> ${university}</p>
        <p><strong>Team Leader:</strong> ${team_leader}</p>
        <p><strong>Contact Email:</strong> ${contact_email}</p>
        ${submissionData.team_members ? `<p><strong>Team Members:</strong><br/>${submissionData.team_members.replace(/\n/g, '<br/>')}</p>` : ''}
      </div>
      
      <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2>Project Details</h2>
        <p><strong>Project Title:</strong> ${project_title}</p>
        <p><strong>Project Description:</strong></p>
        <p style="white-space: pre-wrap;">${project_description}</p>
      </div>
      
      <div style="background-color: #f3e5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2>Submission Details</h2>
        <p><strong>Attached File:</strong> ${file_name}</p>
        <p><strong>File Size:</strong> ${(file_size / 1024 / 1024).toFixed(2)} MB</p>
        <p><strong>Submission Time:</strong> ${new Date().toISOString()}</p>
      </div>
      
      <hr style="margin: 30px 0;" />
      <p style="color: #666; font-size: 14px;">
        This submission was automatically generated from the Texas Neurotech Competition portal.
      </p>
    `;

    // Send email with attachment
    const { data, error } = await resend.emails.send({
      from: sourceEmail,
      to: [competitionEmail],
      subject: `🧠 TxNT Competition Submission: ${team_name} (${university})`,
      reply_to: contact_email,
      html: emailContent,
      attachments: [
        {
          filename: file_name,
          content: fileBuffer
        }
      ]
    });

    if (error) {
      console.error('Resend Error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to send submission email' })
      };
    }

    console.log('Submission email sent successfully:', data);

    // Send confirmation email to the team
    try {
      await resend.emails.send({
        from: sourceEmail,
        to: [contact_email],
        subject: `✅ Competition Submission Received - ${team_name}`,
        html: `
          <h1>Submission Confirmation</h1>
          <p>Dear ${team_leader},</p>
          <p>Thank you for your submission to the Texas Neurotech Competition!</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Submission Details:</h3>
            <p><strong>Team Name:</strong> ${team_name}</p>
            <p><strong>Project Title:</strong> ${project_title}</p>
            <p><strong>Submitted File:</strong> ${file_name}</p>
            <p><strong>Submission Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <p>We have successfully received your submission and will review it shortly. You'll receive updates about the competition timeline and results via this email.</p>
          
          <p>If you have any questions, please don't hesitate to contact us at neurotechscholars@gmail.com.</p>
          
          <p>Best regards,<br/>
          The Texas Neurotech Competition Team</p>
        `
      });
    } catch (confirmationError) {
      console.warn('Failed to send confirmation email:', confirmationError);
      // Don't fail the whole request if confirmation email fails
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Submission received successfully',
        submissionId: data.id 
      })
    };

  } catch (error) {
    console.error('Lambda Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'An unexpected error occurred during submission' })
    };
  }
}; 