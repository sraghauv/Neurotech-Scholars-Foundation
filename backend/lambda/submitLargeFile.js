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
    'Access-Control-Allow-Origin': '*',
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

  console.log("Received large file submission event:", JSON.stringify(event, null, 2));

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
    file_size,
    s3_download_url,
    s3_key
  } = submissionData;

  if (!team_name || !university || !team_leader || !contact_email || !project_title || !project_description || !file_name || !s3_download_url) {
    console.warn("Missing required fields in submission");
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Missing required fields' })
    };
  }

  try {
    // Create email content with S3 download link
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
      
      <div style="background-color: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2>📁 Large File Submission</h2>
        <p><strong>File Name:</strong> ${file_name}</p>
        <p><strong>File Size:</strong> ${(file_size / 1024 / 1024).toFixed(2)} MB</p>
        <p><strong>Upload Time:</strong> ${new Date().toISOString()}</p>
        
        <div style="margin: 20px 0; padding: 15px; background-color: #e8f5e8; border-radius: 5px; border-left: 4px solid #4caf50;">
          <p style="margin: 0;"><strong>📥 Download Link:</strong></p>
          <p style="margin: 5px 0 0 0;">
            <a href="${s3_download_url}" 
               style="color: #1976d2; text-decoration: none; word-break: break-all;"
               target="_blank">
              ${s3_download_url}
            </a>
          </p>
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">
            💡 <em>Click the link above to download the submission file directly.</em>
          </p>
        </div>
        
        ${s3_key ? `<p style="font-size: 12px; color: #666;"><strong>Storage Location:</strong> ${s3_key}</p>` : ''}
      </div>
      
      <hr style="margin: 30px 0;" />
      <p style="color: #666; font-size: 14px;">
        This submission was automatically generated from the Texas Neurotech Competition portal.<br/>
        Large files are stored securely in AWS S3 and can be downloaded using the link above.
      </p>
    `;

    // Send email with S3 download link
    const { data, error } = await resend.emails.send({
      from: sourceEmail,
      to: [competitionEmail],
      subject: `🧠 TxNT Competition Submission: ${team_name} (${university}) - Large File`,
      reply_to: contact_email,
      html: emailContent
    });

    if (error) {
      console.error('Resend Error Details:', JSON.stringify(error, null, 2));
      console.error('API Key exists:', !!resendApiKey);
      console.error('Source Email:', sourceEmail);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Failed to send submission email',
          details: error.message || error
        })
      };
    }

    console.log('Large file submission email sent successfully:', data);

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
            <p><strong>Submitted File:</strong> ${file_name} (${(file_size / 1024 / 1024).toFixed(2)} MB)</p>
            <p><strong>Submission Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>✅ Large File Upload Successful</strong></p>
            <p>Your file was successfully uploaded and is now available for review by our competition judges.</p>
          </div>
          
          <p>We have successfully received your submission and will review it shortly. You'll receive updates about the competition timeline and results via this email.</p>
          
          <p>If you have any questions, please don't hesitate to contact us at neurotechscholars@gmail.com.</p>
          
          <p>Best regards,<br/>
          The Texas Neurotech Competition Team</p>
        `
      });
    } catch (confirmationError) {
      console.error('Failed to send confirmation email:', JSON.stringify(confirmationError, null, 2));
      console.error('Confirmation email details:', {
        from: sourceEmail,
        to: contact_email,
        teamName: team_name
      });
      // Don't fail the whole request if confirmation email fails
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Large file submission received successfully',
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