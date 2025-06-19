#!/bin/bash

echo "🚀 Deploying S3 Lambda Functions for Large File Uploads"

cd backend/lambda

# Install/update dependencies
echo "📦 Installing dependencies..."
npm install

# Create deployment packages
echo "📝 Creating deployment packages..."

# Package for presigned URL function
zip -r presigned-deployment.zip generatePresignedUrl.js package.json node_modules/

# Package for large file submission function
zip -r large-file-deployment.zip submitLargeFile.js package.json node_modules/

echo "✅ Deployment packages created:"
echo "   - presigned-deployment.zip"
echo "   - large-file-deployment.zip"

echo ""
echo "📋 Next steps:"
echo "1. Create S3 bucket for competition submissions"
echo "2. Deploy Lambda functions:"
echo "   - generatePresignedUrl (presigned-deployment.zip)"
echo "   - submitLargeFile (large-file-deployment.zip)"
echo "3. Set up API Gateway routes:"
echo "   - POST /presigned-url -> generatePresignedUrl"
echo "   - POST /submit-large -> submitLargeFile"
echo "4. Configure Lambda environment variables:"
echo "   - S3_BUCKET_NAME"
echo "   - RESEND_API_KEY"
echo "   - SOURCE_EMAIL"
echo "5. Update Lambda IAM roles to include S3 permissions"

echo ""
echo "🔧 Required IAM permissions for Lambda functions:"
echo "{
  \"Version\": \"2012-10-17\",
  \"Statement\": [
    {
      \"Effect\": \"Allow\",
      \"Action\": [
        \"s3:PutObject\",
        \"s3:GetObject\",
        \"s3:PutObjectAcl\"
      ],
      \"Resource\": \"arn:aws:s3:::YOUR_BUCKET_NAME/*\"
    },
    {
      \"Effect\": \"Allow\",
      \"Action\": [
        \"logs:CreateLogGroup\",
        \"logs:CreateLogStream\",
        \"logs:PutLogEvents\"
      ],
      \"Resource\": \"arn:aws:logs:*:*:*\"
    }
  ]
}" 