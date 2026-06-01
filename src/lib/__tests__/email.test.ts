import { sendPayoutApprovedEmail, sendPayoutRejectedEmail } from '../email';
import { Resend } from 'resend';

describe('Email Utility', () => {
  let mockSend: jest.Mock;

  beforeEach(() => {
    // Clear mock calls between tests
    const resendMock = new Resend('mock-key');
    mockSend = resendMock.emails.send as jest.Mock;
    mockSend.mockClear();
  });

  it('should format and send a Payout Approved email', async () => {
    await sendPayoutApprovedEmail('test@example.com', 25.00, 'Interac e-Transfer', 'Looking good!');

    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
      to: 'test@example.com',
      subject: expect.stringContaining('TapCash payout'),
      html: expect.stringContaining('$25.00 CAD'),
    }));
    // Check if notes are included
    const htmlPayload = mockSend.mock.calls[0][0].html;
    expect(htmlPayload).toContain('Looking good!');
    expect(htmlPayload).toContain('Interac e-Transfer');
  });

  it('should format and send a Payout Rejected email', async () => {
    await sendPayoutRejectedEmail('baduser@example.com', 10.00, 'Suspicious activity detected.');

    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
      to: 'baduser@example.com',
      subject: expect.stringContaining('TapCash payout request'),
      html: expect.stringContaining('$10.00 CAD'),
    }));
    
    const htmlPayload = mockSend.mock.calls[0][0].html;
    expect(htmlPayload).toContain('Suspicious activity detected.');
  });
});
