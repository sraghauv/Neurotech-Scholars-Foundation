const { Resend } = require('resend');

// Test confirmation email separately
async function testConfirmationEmail() {
  const resend = new Resend('YOUR_RESEND_API_KEY'); // Replace with your key
  
  try {
    const result = await resend.emails.send({
      from: 'YOUR_SOURCE_EMAIL', // Replace with your verified email
      to: ['test@example.com'], // Replace with your test email
      subject: '✅ Test Confirmation Email',
      html: `
        <h1>Test Confirmation</h1>
        <p>This is a test of the confirmation email functionality.</p>
        <p>If you receive this, the confirmation email system is working!</p>
      `
    });
    
    console.log('Confirmation email sent successfully:', result);
  } catch (error) {
    console.error('Confirmation email failed:', error);
  }
}

testConfirmationEmail(); 