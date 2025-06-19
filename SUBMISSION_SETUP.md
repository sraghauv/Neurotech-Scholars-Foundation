# Competition Submission Portal Setup

## Overview
A simple submission portal for the Texas Neurotech Competition that allows teams to upload their projects as compressed files and automatically emails them to `neurotechscholars@gmail.com`.

## What's Been Added

### Frontend Components
- **`/src/components/Submit.jsx`** - New submission form component
- **Navigation updates** - Added "Submit Entry" link to navbar (highlighted in red)
- **Route added** - New `/submit` route in App.jsx

### Backend Lambda Function
- **`/backend/lambda/submitCompetitionEntry.js`** - New Lambda function for handling submissions

## Features
- ✅ File upload (zip, rar, 7z, tar, gz)
- ✅ 50MB file size limit
- ✅ Team information collection
- ✅ Project description
- ✅ Email with attachment to neurotechscholars@gmail.com
- ✅ Confirmation email to submitting team
- ✅ Form validation
- ✅ Mobile responsive

## Setup Steps

### 1. Deploy the Lambda Function

You'll need to:

1. **Create a new Lambda function** in AWS console
2. **Use the code** from `backend/lambda/submitCompetitionEntry.js`
3. **Set environment variables**:
   - `RESEND_API_KEY` - Your Resend API key
   - `SOURCE_EMAIL` - Your verified sender email (e.g., `noreply@yourdomain.com`)

### 2. Create API Gateway Endpoint

1. **Create HTTP API** in API Gateway
2. **Add route**: `POST /submit`
3. **Connect to your Lambda function**
4. **Enable CORS** with appropriate origins

### 3. Update Frontend

In `src/components/Submit.jsx`, update the API endpoint:

```javascript
const API_ENDPOINT = "YOUR_NEW_API_GATEWAY_ENDPOINT";
```

### 4. Test the Portal

1. **Run the development server**: `npm run dev`
2. **Navigate to** `/submit`
3. **Test with a small zip file**

## Email Setup Requirements

### Resend Configuration
- Sign up at [resend.com](https://resend.com)
- Verify your domain
- Get your API key
- Set up the source email

### Email Flow
1. **Submission received** → Email sent to `neurotechscholars@gmail.com` with attachment
2. **Confirmation sent** → Team receives confirmation email

## File Handling
- **Supported formats**: .zip, .rar, .7z, .tar, .gz
- **Size limit**: 50MB
- **Processing**: Files are converted to base64 for transport, then attached to email

## Security Considerations
- Update CORS origins to your actual domain (remove '*')
- Consider adding rate limiting
- Add input sanitization if needed
- Monitor Lambda costs (file uploads can be expensive)

## Alternative: Google Drive Upload (If Preferred)

If you'd prefer to upload to Google Drive instead of email:

1. Set up Google Drive API
2. Create a service account
3. Share a folder with the service account
4. Modify the Lambda to upload files directly to Drive
5. Send notification emails instead of attachments

This would be more scalable for larger files and easier to organize.

## Cost Considerations
- **Lambda costs**: Based on execution time and memory usage
- **File transfer costs**: 50MB files can be expensive
- **Email costs**: Resend charges per email sent

## Troubleshooting
- Check CloudWatch logs for Lambda errors
- Verify CORS settings if frontend can't connect
- Ensure environment variables are set correctly
- Test with small files first 