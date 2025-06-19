#!/bin/bash

echo "🚀 Deploying Competition Submission Lambda Function..."

# Navigate to the lambda directory
cd backend/lambda

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create deployment package
echo "📦 Creating deployment package..."
zip -r submission-deployment.zip submitCompetitionEntry.js package.json node_modules/

echo "✅ Deployment package created: backend/lambda/submission-deployment.zip"
echo ""
echo "📋 Next steps:"
echo "1. Go to AWS Lambda Console"
echo "2. Create a new function called 'submitCompetitionEntry'"
echo "3. Upload the 'submission-deployment.zip' file"
echo "4. Set the handler to: submitCompetitionEntry.handler"
echo "5. Add environment variables (see SUBMISSION_SETUP.md)"
echo "6. Create API Gateway endpoint"
echo ""
echo "📁 Upload this file: $(pwd)/submission-deployment.zip" 