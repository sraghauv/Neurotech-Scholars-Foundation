const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');

const s3Client = new S3Client({
   region: process.env.AWS_REGION || 'us-east-1'
});

exports.handler = async (event) => {
   console.log('Event received:', JSON.stringify(event, null, 2));
   
   try {
      // Parse the request body
      const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
      const { fileName, fileSize, contentType, teamName } = body;
      
      if (!fileName || !fileSize) {
         return {
            statusCode: 400,
            headers: {
               'Access-Control-Allow-Origin': '*',
               'Access-Control-Allow-Headers': 'Content-Type',
               'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: JSON.stringify({ 
               error: 'fileName and fileSize are required' 
            })
         };
      }
      
      // Generate unique S3 key
      const fileExtension = fileName.split('.').pop();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const s3Key = `submissions/${timestamp}-${uuidv4()}.${fileExtension}`;
      
      // Create the presigned URL for upload
      const command = new PutObjectCommand({
         Bucket: process.env.S3_BUCKET_NAME,
         Key: s3Key,
         ContentType: contentType,
         Metadata: {
            'team-name': teamName || 'Unknown',
            'original-filename': fileName,
            'file-size': fileSize.toString()
         }
      });
      
      const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
      
      // Create download URL (this will be used in the email)
      const downloadUrl = `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${s3Key}`;
      
      return {
         statusCode: 200,
         headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'POST, OPTIONS'
         },
         body: JSON.stringify({
            uploadUrl,
            s3Key,
            downloadUrl
         })
      };
      
   } catch (error) {
      console.error('Error generating presigned URL:', error);
      
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