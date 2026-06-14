import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white px-4">
      <h1 className="text-6xl font-bold mb-4 text-[#ff2e63]">404</h1>
      <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
      <p className="text-gray-400 text-center max-w-md mb-8">
        Oops! We couldn&apos;t find the page you were looking for. It might have been moved or deleted.
      </p>
      <Link 
        href="/"
        className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all duration-200 border border-white/10"
      >
        Return to Home
      </Link>
    </div>
  );
}
