'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white px-4">
      <h1 className="text-4xl md:text-6xl font-bold mb-4 text-red-500">
        Oops! Something went wrong
      </h1>
      <p className="text-gray-400 text-center max-w-md mb-8">
        We&apos;ve encountered an unexpected error. Our team has been notified.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-[#ff2e63] hover:bg-[#e02957] text-white font-medium rounded-xl transition-all duration-200"
        >
          Try Again
        </button>
        <Link 
          href="/"
          className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all duration-200 border border-white/10"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
