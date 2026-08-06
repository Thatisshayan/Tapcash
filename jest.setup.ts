import '@testing-library/jest-dom'

// Polyfill TextEncoder for jsdom environment
if (typeof global.TextEncoder === 'undefined') {
  // @ts-ignore
  global.TextEncoder = class TextEncoder {
    encode(input: string): Uint8Array {
      const buffer = Buffer.from(input, 'utf-8');
      return new Uint8Array(buffer);
    }
  };
}

// Mock Firebase Admin to prevent real database/auth calls during tests
jest.mock('firebase-admin', () => {
  return {
    auth: jest.fn(() => ({
      verifyIdToken: jest.fn(),
    })),
    firestore: {
      FieldValue: {
        serverTimestamp: jest.fn(() => 'mocked-timestamp'),
        increment: jest.fn((val) => val),
      },
    },
    apps: [],
    initializeApp: jest.fn(),
    credential: {
      cert: jest.fn(),
    },
  }
})

// Mock the admin database instance
jest.mock('@/lib/firebaseAdmin', () => ({
  adminDb: {
    collection: jest.fn(),
    runTransaction: jest.fn(),
  },
}))

// Mock Resend to prevent sending actual emails during tests
const mockSend = jest.fn().mockResolvedValue({ id: 'mock-email-id' });
jest.mock('resend', () => {
  return {
    Resend: jest.fn().mockImplementation(() => ({
      emails: {
        send: mockSend
      },
    })),
  }
})


// Mock next/server
jest.mock('next/server', () => {
  return {
    NextRequest: jest.fn().mockImplementation((url, init) => {
      const headers = init?.headers || new Headers();
      const cookieString = headers.get('cookie') || '';
      const cookies = new Map();

      if (cookieString) {
        const pairs = cookieString.split(';');
        pairs.forEach(pair => {
          const [name, value] = pair.trim().split('=');
          cookies.set(name, { value });
        });
      }

      return {
        url,
        ...init,
        headers,
        cookies: {
          get: (name) => cookies.get(name),
        },
      }
    }),
    NextResponse: {
      json: jest.fn((body, init) => {
        return { body, status: init?.status || 200, ...init }
      }),
    },
  }
})

// Mock jose module to allow dynamic imports
jest.doMock('jose', () => {
  const crypto = require('crypto');

  return {
    SignJWT: class SignJWT {
      constructor(payload: Record<string, unknown>) {
        this.payload = payload;
      }
      private payload: Record<string, unknown>;
      setProtectedHeader() { return this; }
      setIssuedAt() { return this; }
      setExpirationTime() { return this; }
      async sign(secret: Uint8Array) {
        // Return a JWT token with HMAC-SHA256 signature
        const header = Buffer.from(JSON.stringify({ alg: 'HS256' })).toString('base64url');
        const body = Buffer.from(JSON.stringify(this.payload)).toString('base64url');

        // Create HMAC signature
        const hmac = crypto.createHmac('sha256', Buffer.from(secret));
        hmac.update(`${header}.${body}`);
        const signature = hmac.digest('base64url');

        return `${header}.${body}.${signature}`;
      }
    },
    jwtVerify: async (token: string, secret: Uint8Array) => {
      const [header, body, signature] = token.split('.');
      if (!header || !body || !signature) {
        throw new Error('Invalid token format');
      }
      try {
        // Verify HMAC signature
        const hmac = crypto.createHmac('sha256', Buffer.from(secret));
        hmac.update(`${header}.${body}`);
        const expectedSignature = hmac.digest('base64url');

        if (signature !== expectedSignature) {
          throw new Error('Signature verification failed');
        }

        const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
        return { payload };
      } catch (err) {
        throw new Error('Failed to verify token');
      }
    }
  }
}, { virtual: true })
