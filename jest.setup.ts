import '@testing-library/jest-dom'

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
      return {
        url,
        ...init,
        headers: {
          get: jest.fn(),
        },
      }
    }),
    NextResponse: {
      json: jest.fn((body, init) => {
        return { body, ...init }
      }),
    },
  }
})
