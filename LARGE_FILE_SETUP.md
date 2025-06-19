# Large File Upload Setup Guide

This guide walks through setting up the large file upload system that uses AWS S3 for files ≥5MB and email attachments for smaller files.

## 🏗️ Architecture Overview

**Small Files (<5MB)**: 
- Uploaded via base64 encoding → Email attachment
- Uses existing `submitCompetitionEntry` Lambda

**Large Files (≥5MB)**:
- Frontend gets presigned S3 URL → Direct upload to S3 → Backend notification email
- Uses new `generatePresignedUrl` + `submitLargeFile` Lambdas

## 📋 Prerequisites

- AWS Account with S3 and Lambda access
- Existing API Gateway from original setup
- Resend account for email notifications

## 🚀 Step 1: Create S3 Bucket

```bash
# Create S3 bucket (replace with your preferred name)
aws s3 mb s3://neurotech-competition-submissions --region us-east-1

# Configure CORS for the bucket
aws s3api put-bucket-cors --bucket neurotech-competition-submissions --cors-configuration file://s3-cors.json
```

Create `s3-cors.json`:
```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["PUT", "POST", "GET"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

## 🚀 Step 2: Deploy Lambda Functions

```bash
# Run the deployment script
./deploy-s3-lambdas.sh
```

This creates:
- `presigned-deployment.zip` → `generatePresignedUrl` function
- `large-file-deployment.zip` → `submitLargeFile` function

## 🚀 Step 3: Create Lambda Functions

### 3.1 Create `generatePresignedUrl` Function

1. **AWS Console** → Lambda → Create Function
2. **Function name**: `generatePresignedUrl`
3. **Runtime**: Node.js 18.x
4. **Upload**: `presigned-deployment.zip`
5. **Handler**: `generatePresignedUrl.handler`
6. **Timeout**: 30 seconds

**Environment Variables**:
```
S3_BUCKET_NAME=neurotech-competition-submissions
AWS_REGION=us-east-1
```

### 3.2 Create `submitLargeFile` Function

1. **AWS Console** → Lambda → Create Function
2. **Function name**: `submitLargeFile`
3. **Runtime**: Node.js 18.x
4. **Upload**: `large-file-deployment.zip`
5. **Handler**: `submitLargeFile.handler`
6. **Timeout**: 30 seconds

**Environment Variables**:
```
RESEND_API_KEY=your_resend_api_key
SOURCE_EMAIL=your_verified_email@yourdomain.com
```

## 🚀 Step 4: Configure IAM Permissions

Both Lambda functions need S3 permissions. Update their IAM roles:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:PutObjectAcl"
      ],
      "Resource": "arn:aws:s3:::neurotech-competition-submissions/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```

## 🚀 Step 5: Add API Gateway Routes

Add to your existing API Gateway (same one with `/submit`):

### 5.1 Add `/presigned-url` Route

1. **API Gateway** → Your API → Create Resource
2. **Resource Path**: `/presigned-url`
3. **Create Method**: `POST`
4. **Integration**: Lambda Function → `generatePresignedUrl`
5. **Enable CORS**: Yes

### 5.2 Add `/submit-large` Route

1. **API Gateway** → Your API → Create Resource
2. **Resource Path**: `/submit-large`
3. **Create Method**: `POST`
4. **Integration**: Lambda Function → `submitLargeFile`
5. **Enable CORS**: Yes

### 5.3 Deploy API

1. **Actions** → **Deploy API**
2. **Stage**: `prod` (same as existing)

## 🚀 Step 6: Test the System

Your API endpoints should be:
- Small files: `https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/submit`
- Presigned URL: `https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/presigned-url`
- Large files: `https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/submit-large`

## 🧪 Testing Commands

Test presigned URL generation:
```bash
curl -X POST https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/presigned-url \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "test.zip",
    "fileSize": 10485760,
    "contentType": "application/zip",
    "teamName": "TestTeam"
  }'
```

Test large file notification:
```bash
curl -X POST https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/submit-large \
  -H "Content-Type: application/json" \
  -d '{
    "team_name": "Test Team",
    "university": "Test University",
    "team_leader": "Test Leader",
    "contact_email": "test@example.com",
    "project_title": "Test Project",
    "project_description": "Test Description",
    "file_name": "test.zip",
    "file_size": 10485760,
    "s3_download_url": "https://neurotech-competition-submissions.s3.amazonaws.com/test.zip",
    "s3_key": "competition-submissions/2024-01-15/Test_Team/abc123_test.zip"
  }'
```

## 🎯 How It Works

### For Small Files (<5MB):
1. User selects file
2. Frontend converts to base64
3. Submits to `/submit` endpoint
4. Lambda sends email with attachment

### For Large Files (≥5MB):
1. User selects file  
2. Frontend calls `/presigned-url` to get S3 upload URL
3. Frontend uploads directly to S3 with progress bar
4. Frontend calls `/submit-large` to notify about upload
5. Lambda sends email with S3 download link

## 🔧 Troubleshooting

**CORS Issues**: Ensure CORS is enabled on all API Gateway methods

**S3 Upload Fails**: Check S3 CORS configuration and Lambda IAM permissions

**Email Not Sending**: Verify Resend API key and source email verification

**File Too Large**: Adjust S3 bucket policies if needed (current limit: 500MB)

## 📊 File Organization in S3

Files are stored with this structure:
```
competition-submissions/
  2024-01-15/
    Team_Name_1/
      uuid_project_file.zip
    Team_Name_2/
      uuid_another_project.tar.gz
  2024-01-16/
    ...
```

## 🔒 Security Considerations

- Presigned URLs expire in 1 hour
- S3 bucket is private (files accessible only via presigned URLs)
- File uploads include team metadata
- All submissions are logged in CloudWatch

## 💡 Cost Estimation

**S3 Storage**: ~$0.023/GB/month
**Lambda Requests**: ~$0.20/1M requests  
**API Gateway**: ~$3.50/1M requests

For 100 teams with 50MB average submissions = 5GB storage ≈ $0.12/month 