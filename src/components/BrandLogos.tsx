import React from 'react';
import Image from 'next/image';

export const InteracLogo = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <text x="50%" y="26" textAnchor="middle" className="font-sans font-black italic tracking-wider text-[22px]" fill="#f1b434">Interac</text>
  </svg>
);

export const TimsLogo = ({ className = "" }: { className?: string }) => (
  <div className={`relative w-full h-full ${className}`}>
    <Image src="/images/logos/timhortons.svg" alt="Tim Hortons" fill className="object-contain" />
  </div>
);

export const CTLogo = ({ className = "" }: { className?: string }) => (
  <div className={`relative w-full h-full ${className}`}>
    <Image src="/images/logos/canadiantire.svg" alt="Canadian Tire" fill className="object-contain" />
  </div>
);

export const CineplexLogo = ({ className = "" }: { className?: string }) => (
  <div className={`relative w-full h-full ${className}`}>
    <Image src="/images/logos/cineplex.svg" alt="Cineplex" fill className="object-contain" />
  </div>
);

export const SDMLogo = ({ className = "" }: { className?: string }) => (
  <div className={`relative w-full h-full ${className}`}>
    <Image src="/images/logos/shoppers.svg" alt="Shoppers Drug Mart" fill className="object-contain" />
  </div>
);

export const LitecoinLogo = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none">
    <circle cx="50" cy="50" r="45" fill="#345D9D"/>
    <path d="M46 72 L66 72 L68 62 L51 62 L55 45 L67 40 L69 31 L57 36 L61 22 L49 22 L45 39 L35 43 L33 52 L42 49 L36 72 Z" fill="white"/>
  </svg>
);

export const PayPalLogo = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 120 40" fill="none">
    <text x="50%" y="26" textAnchor="middle" className="font-sans font-black italic text-[24px]">
      <tspan fill="#003087">Pay</tspan>
      <tspan fill="#0079C1">Pal</tspan>
    </text>
  </svg>
);

export const BitcoinLogo = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none">
    <circle cx="50" cy="50" r="45" fill="#F7931A"/>
    <path d="M66.1 43.1C67 37.5 62.8 34.6 57 32.7L59.7 21.8L54.4 20.5L51.8 31C50.4 30.7 49 30.3 47.6 30L50.3 19.3L45 18L42.4 28.5C41.3 28.2 40.2 28 39 27.7L39 27.6L29.9 25.4L28.1 32.5C28.1 32.5 33 33.6 32.9 33.7C35.6 34.4 36.1 36.1 36.1 37.9L32.2 53.6C32.4 53.6 32.8 53.7 33.3 53.9C32.8 53.7 32.2 53.6 31.8 53.5L27.6 69.8C27.6 69.8 28 69.9 28 70C25 69.3 24 71.3 24 71.3L31.8 73.2L31.8 73.2L34.5 83.9L39.8 85.2L42.4 74.6C43.8 75 45.3 75.3 46.7 75.7L44 86.4L49.3 87.7L52 77.1C59.6 78.4 65.4 77.5 66.5 70.9C67.4 65.6 64.9 62.6 60.5 60.9C64 59.8 66.3 57.5 66.1 52C66.1 52 66.1 52 66.1 43.1ZM56.3 66.6C54.8 72.8 45.4 69.7 41.5 68.7L44.5 57.8C48.4 58.8 57.9 60.4 56.3 66.6ZM58 48.7C56.7 53.8 48.8 51.3 45.5 50.3L48.1 40.1C51.5 41 59.5 42.4 58 48.7Z" fill="white"/>
  </svg>
);

export const VisaLogo = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 120 40" fill="none">
    <text x="50%" y="28" textAnchor="middle" className="font-sans font-black italic tracking-widest text-[28px]" fill="#1A1F71">VISA</text>
  </svg>
);

export const SteamLogo = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none">
    <circle cx="50" cy="50" r="45" fill="#171A21"/>
    <path d="M49 46 A 8 8 0 1 0 49 30 A 8 8 0 1 0 49 46 Z" fill="white"/>
    <path d="M49 41 A 3 3 0 1 0 49 35 A 3 3 0 1 0 49 41 Z" fill="#171A21"/>
    <path d="M49 46 L 35 60 A 10 10 0 1 0 52 72 L 65 52 A 12 12 0 1 0 49 46 Z" fill="white"/>
    <path d="M28 65 A 4 4 0 1 0 28 57 A 4 4 0 1 0 28 65 Z" fill="#171A21"/>
  </svg>
);

export const RobloxLogo = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none">
    <rect x="20" y="20" width="60" height="60" rx="10" transform="rotate(15 50 50)" fill="#ffffff"/>
    <rect x="40" y="40" width="20" height="20" rx="4" transform="rotate(15 50 50)" fill="#000000"/>
  </svg>
);
