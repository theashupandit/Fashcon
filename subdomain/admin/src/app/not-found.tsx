import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0b] text-white p-6 select-none font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(230,0,35,0.04),transparent_60%)] pointer-events-none" />
      
      <div className="relative z-10 text-center max-w-md">
        <h1 className="text-8xl font-black tracking-tight text-[#e60023] animate-pulse">404</h1>
        <h2 className="mt-4 text-2xl font-bold tracking-tight">Control Room Lost</h2>
        <p className="mt-2 text-neutral-400 text-sm leading-relaxed">
          The dashboard segment you are looking for does not exist or has been shifted. Check the URL or return to safety.
        </p>
        
        <div className="mt-8 flex justify-center">
          <Link
            href="/"
            className="px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-[#e60023] to-[#ff2a4a] hover:from-[#c2001c] hover:to-[#e60023] transition-all duration-300 shadow-[0_0_20px_rgba(230,0,35,0.2)] hover:shadow-[0_0_25px_rgba(230,0,35,0.4)] hover:scale-105"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
