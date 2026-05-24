export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-[#ff2e63] rounded-full border-t-transparent animate-spin"></div>
      </div>
    </div>
  );
}
