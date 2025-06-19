const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');

const s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });
const BUCKET_NAME = process.env.S3_BUCKET_NAME;

if (!BUCKET_NAME) {
  throw new Error('S3_BUCKET_NAME environment variable is not set.');
}

exports.handler = async (event) => {
  // Define CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle OPTIONS preflight request
  if (event.requestContext?.http?.method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  console.log("Received presigned URL request:", JSON.stringify(event, null, 2));

  let requestData;
  try {
    if (typeof event.body === 'string') {
      requestData = JSON.parse(event.body);
    } else {
      requestData = event.body;
    }

    if (!requestData) {
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

  const { fileName, fileSize, contentType, teamName } = requestData;

  if (!fileName || !fileSize || !teamName) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Missing required fields: fileName, fileSize, teamName' })
    };
  }

  // Check file size (500MB limit for S3)
  const maxSize = 500 * 1024 * 1024; // 500MB
  if (fileSize > maxSize) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ 
        error: `File size exceeds maximum limit of ${maxSize / 1024 / 1024}MB` 
      })
    };
  }

  try {
    // Generate unique file key
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const uniqueId = uuidv4();
    const sanitizedTeamName = teamName.replace(/[^a-zA-Z0-9-_]/g, '_');
    const fileExtension = fileName.split('.').pop();
    const baseFileName = fileName.substring(0, fileName.lastIndexOf('.'));
    const sanitizedFileName = baseFileName.replace(/[^a-zA-Z0-9-_]/g, '_');
    
    const s3Key = `competition-submissions/${timestamp}/${sanitizedTeamName}/${uniqueId}_${sanitizedFileName}.${fileExtension}`;

    // Create presigned URL for PUT operation
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      ContentType: contentType || 'application/octet-stream',
      Metadata: {
        'team-name': sanitizedTeamName,
        'original-filename': fileName,
        'upload-timestamp': new Date().toISOString()
      }
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: 3600 // URL expires in 1 hour
    });

    // Generate a download URL for the submission email
    const downloadUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${s3Key}`;

    console.log('Generated presigned URL for:', s3Key);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        uploadUrl: presignedUrl,
        s3Key: s3Key,
        downloadUrl: downloadUrl,
        expiresIn: 3600
      })
    };

  } catch (error) {
    console.error('S3 Presigned URL Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to generate upload URL' })
    };
  }
}; 