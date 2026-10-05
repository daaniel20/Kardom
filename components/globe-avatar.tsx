export function GlobeAvatar({ label }: { label: string }) {
  return (
    <svg
      viewBox="0 0 180 260"
      className="h-56 w-auto drop-shadow-[0_18px_24px_rgb(60_77_94/0.18)] sm:h-64"
      role="img"
      aria-label={label}
    >
      <ellipse cx="90" cy="246" rx="46" ry="9" fill="#3c4d5e" opacity="0.14" />
      <path
        d="M70 176c-1 18-2 34-7 52 9 3 18 1 20-8 2-16 3-32 4-46z"
        fill="#9fd0f2"
      />
      <path
        d="M110 176c1 18 2 34 7 52-9 3-18 1-20-8-2-16-3-32-4-46z"
        fill="#7eb6d9"
      />
      <ellipse cx="64" cy="230" rx="15" ry="7" fill="#3c4d5e" />
      <ellipse cx="118" cy="230" rx="15" ry="7" fill="#314556" />
      <path
        d="M54 124c3 20 10 46 16 58 13 8 27 8 40 0 6-12 13-38 16-58 3-18-12-32-36-32s-39 14-36 32z"
        fill="#6bcf86"
      />
      <path d="M76 100c8 12 20 12 28 0-6 8-22 8-28 0z" fill="#ffc999" />
      <path
        d="M56 128c-18 6-34 28-36 44 10 6 18 1 20-8 3-14 12-28 20-34z"
        fill="#f3c7a6"
      />
      <path
        d="M124 128c18 6 34 28 36 44-10 6-18 1-20-8-3-14-12-28-20-34z"
        fill="#e7b892"
      />
      <circle cx="24" cy="174" r="9" fill="#f3c7a6" />
      <circle cx="156" cy="174" r="9" fill="#e7b892" />
      <rect x="78" y="96" width="24" height="18" rx="9" fill="#f3c7a6" />
      <circle cx="90" cy="70" r="36" fill="#f3c7a6" />
      <path
        d="M56 66c2-30 24-46 42-44 18 2 32 16 34 36-10-12-22-10-30-2 2-14-12-24-26-22-16 2-26 16-22 32-8-8-16-10-24 0z"
        fill="#4a3728"
      />
      <ellipse cx="76" cy="72" rx="4.2" ry="4.8" fill="#3c4d5e" />
      <ellipse cx="106" cy="72" rx="4.2" ry="4.8" fill="#3c4d5e" />
      <circle cx="77.4" cy="70.4" r="1.4" fill="#ffffff" />
      <circle cx="107.4" cy="70.4" r="1.4" fill="#ffffff" />
      <path
        d="M76 88c7 9 21 9 28 0"
        fill="none"
        stroke="#c4846a"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <ellipse cx="64" cy="82" rx="7" ry="3.6" fill="#ffc2d4" opacity="0.9" />
      <ellipse cx="116" cy="82" rx="7" ry="3.6" fill="#ffc2d4" opacity="0.9" />
    </svg>
  );
}
