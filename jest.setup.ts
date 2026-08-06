import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'node:util'

// jsdom (testEnvironment: 'jest-environment-jsdom') does not provide
// TextEncoder/TextDecoder as globals -- jose (and other WHATWG-spec-based
// crypto libraries) require them. This is a standard Node polyfill, not a
// mock of any library's behavior.
if (typeof globalThis.TextEncoder === 'undefined') {
  // Node's TextEncoder.encode() returns a Uint8Array from Node's realm,
  // not jsdom's -- jose's `instanceof Uint8Array` checks run against
  // jsdom's ambient Uint8Array, so a plain assignment fails cross-realm.
  // Re-materializing via the current realm's Uint8Array.from() fixes it.
  class PatchedTextEncoder extends TextEncoder {
    encode(input?: string): Uint8Array {
      return Uint8Array.from(super.encode(input))
    }
  }
  // @ts-expect-error -- structurally compatible with the DOM lib types
  // jsdom expects here.
  globalThis.TextEncoder = PatchedTextEncoder
  // @ts-expect-error -- see above
  globalThis.TextDecoder = TextDecoder
}
if (typeof globalThis.crypto?.subtle === 'undefined') {
  // jsdom doesn't implement the Web Crypto API; jose's webapi build needs
  // crypto.subtle for HMAC sign/verify. Node's own webcrypto implements
  // the same standard interface.
  const { webcrypto } = require('node:crypto')
  // jsdom's `crypto` is a getter-only accessor property -- a plain
  // assignment silently no-ops (or throws under strict mode) instead of
  // replacing it. defineProperty overwrites the accessor with a data
  // property outright.
  Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
    configurable: true,
  })
}
if (typeof globalThis.structuredClone === 'undefined') {
  // jsdom doesn't expose structuredClone; v8.serialize/deserialize is a
  // real structured-clone implementation (handles TypedArrays, Dates,
  // Maps, etc.), unlike a JSON.stringify/parse shim which would corrupt
  // the Uint8Array key material jose clones internally.
  const v8 = require('node:v8')
  globalThis.structuredClone = (value: unknown) => v8.deserialize(v8.serialize(value))
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
