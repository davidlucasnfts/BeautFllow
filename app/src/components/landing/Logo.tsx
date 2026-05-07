export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 2C6 2 3 6 3 9C3 12 5 14 7 14C9 14 11 12 11 9C11 6 8 2 8 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary"
      />
      <path
        d="M18 2C18 2 21 6 21 9C21 12 19 14 17 14C15 14 13 12 13 9C13 6 16 2 16 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-secondary"
      />
      <circle cx="7" cy="18" r="2" fill="currentColor" className="text-primary" />
      <circle cx="17" cy="18" r="2" fill="currentColor" className="text-secondary" />
    </svg>
  );
}
