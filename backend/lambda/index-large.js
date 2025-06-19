const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

exports.handler = async (event) => {
   console.log('Event received:', JSON.stringify(event, null, 2));
   
   try {
      // Parse the request body
      const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
      const { 
         s3Key, 
         downloadUrl, 
         fileName, 
         fileSize, 
         teamName, 
         studentName, 
         studentEmail, 
         universityAffiliation, 
         submissionType, 
         description 
      } = body;
      
      if (!s3Key || !downloadUrl || !fileName) {
         return {
            statusCode: 400,
            headers: {
               'Access-Control-Allow-Origin': '*',
               'Access-Control-Allow-Headers': 'Content-Type',
               'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: JSON.stringify({ 
               error: 's3Key, downloadUrl, and fileName are required' 
            })
         };
      }
      
      // Format file size for display
      const formatFileSize = (bytes) => {
         if (bytes === 0) return '0 Bytes';
         const k = 1024;
         const sizes = ['Bytes', 'KB', 'MB', 'GB'];
         const i = Math.floor(Math.log(bytes) / Math.log(k));
         return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
      };
      
      // Create email content
      const emailContent = `
New Texas Neurotech Competition Submission (Large File)

Team Name: ${teamName || 'Not provided'}
Student Name: ${studentName || 'Not provided'}
Student Email: ${studentEmail || 'Not provided'}
University Affiliation: ${universityAffiliation || 'Not provided'}
Submission Type: ${submissionType || 'Not provided'}

Description:
${description || 'No description provided'}

File Details:
- File Name: ${fileName}
- File Size: ${formatFileSize(fileSize)}
- S3 Key: ${s3Key}

Download Link: ${downloadUrl}

Note: This file was uploaded directly to S3 due to its large size (>${formatFileSize(5 * 1024 * 1024)}).
      `.trim();
      
      // Send email using Resend
      const emailResponse = await resend.emails.send({
         from: process.env.SOURCE_EMAIL,
         to: 'neurotechscholars@gmail.com',
         subject: `New Competition Submission: ${teamName || 'Unknown Team'} (Large File)`,
         text: emailContent
      });
      
      console.log('Email sent successfully:', emailResponse);
      
      return {
         statusCode: 200,
         headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'POST, OPTIONS'
         },
         body: JSON.stringify({
            message: 'Large file submission processed successfully',
            emailId: emailResponse.id
         })
      };
      
   } catch (error) {
      console.error('Error processing large file submission:', error);
      
      return {
         statusCode: 500,
         headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'POST, OPTIONS'
         },
         body: JSON.stringify({ 
            error: 'Internal server error',
            details: error.message 
         })
      };
   }
}; 