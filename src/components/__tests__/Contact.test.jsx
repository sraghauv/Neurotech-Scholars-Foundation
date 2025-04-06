import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Contact from '../Contact'; // Adjust the path as needed
import Swal from 'sweetalert2';

// Define the mock API endpoint URL (should match the one in Contact.jsx, or use environment variable)
const MOCK_API_ENDPOINT = 'https://irhd1lkzmi.execute-api.us-east-1.amazonaws.com'; // Updated URL

// Mock SweetAlert2
jest.mock('sweetalert2', () => ({
  fire: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('Contact Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    fetch.mockClear();
    Swal.fire.mockClear();
    // Default mock implementation for success
    fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, message: 'Email sent successfully' }),
      })
    );
  });

  test('renders contact form correctly', () => {
    render(<Contact />);
    expect(screen.getByRole('heading', { name: /contact us/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/organization\/company/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/your message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });

  test('submits form data to the backend API and shows success message', async () => {
    const user = userEvent.setup();
    render(<Contact />);

    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const orgInput = screen.getByLabelText(/organization\/company/i);
    const messageInput = screen.getByLabelText(/your message/i);
    const submitButton = screen.getByRole('button', { name: /send message/i });

    // Fill the form
    await user.type(nameInput, 'Test User');
    await user.type(emailInput, 'test@example.com');
    await user.type(orgInput, 'Test Org');
    await user.type(messageInput, 'This is a test message.');

    // Submit the form
    await user.click(submitButton);

    // Check if fetch was called correctly
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(MOCK_API_ENDPOINT, { // Check endpoint URL
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // No access_key or email_to expected here anymore
        name: 'Test User',
        email: 'test@example.com',
        organization: 'Test Org',
        message: 'This is a test message.',
      }),
    });

    // Check if success message was shown
    await screen.findByRole('button', { name: /send message/i });
    expect(Swal.fire).toHaveBeenCalledTimes(1);
    expect(Swal.fire).toHaveBeenCalledWith({
      title: 'Message Sent!',
      text: "We'll get back to you shortly!",
      icon: 'success',
    });

    // Check if form was reset
    expect(nameInput).toHaveValue('');
    expect(emailInput).toHaveValue('');
    expect(orgInput).toHaveValue('');
    expect(messageInput).toHaveValue('');
  });

  test('handles network error gracefully', async () => {
    // Mock fetch to return a network error
    fetch.mockImplementationOnce(() => Promise.reject(new Error('Network error')));

    const user = userEvent.setup();
    render(<Contact />);

    // Fill form
    await user.type(screen.getByLabelText(/full name/i), 'Test');
    await user.type(screen.getByLabelText(/email address/i), 'test@test.com');
    await user.type(screen.getByLabelText(/organization\/company/i), 'Test Org');
    await user.type(screen.getByLabelText(/your message/i), 'Test');

    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(fetch).toHaveBeenCalledTimes(1);

    // Check for network error Swal message
    await screen.findByRole('button', { name: /send message/i });
    expect(Swal.fire).toHaveBeenCalledTimes(1);
    expect(Swal.fire).toHaveBeenCalledWith({
        title: "Network Error",
        text: "Could not connect to the server. Please check your connection and try again.",
        icon: "error",
    });

    // Form should not reset on network error
    expect(screen.getByLabelText(/full name/i)).toHaveValue('Test');
  });

  test('handles backend API error response', async () => {
    // Mock fetch to return an API error response
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false, // Indicate HTTP error status
        status: 500,
        json: () => Promise.resolve({ error: 'Internal Server Error from API' }),
      })
    );

    const user = userEvent.setup();
    render(<Contact />);

    // Fill form
    await user.type(screen.getByLabelText(/full name/i), 'Test');
    await user.type(screen.getByLabelText(/email address/i), 'test@test.com');
    await user.type(screen.getByLabelText(/organization\/company/i), 'Test Org');
    await user.type(screen.getByLabelText(/your message/i), 'Test');

    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(fetch).toHaveBeenCalledTimes(1);

    // Check for submission error Swal message
    await screen.findByRole('button', { name: /send message/i });
    expect(Swal.fire).toHaveBeenCalledTimes(1);
    expect(Swal.fire).toHaveBeenCalledWith({
        title: "Submission Error",
        text: "Internal Server Error from API",
        icon: "error",
    });

    // Form should not reset on API error
    expect(screen.getByLabelText(/full name/i)).toHaveValue('Test');
  });

}); 