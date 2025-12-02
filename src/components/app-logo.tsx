export function AppLogo() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="rounded-lg"
    >
      <path
        d="M24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4Z"
        fill="hsl(var(--primary))"
      />
      <path
        d="M32.5 24L20.5 16V32L32.5 24Z"
        fill="hsl(var(--primary-foreground))"
      />
      <path
        d="M14 14L16.25 19.75L22 22L16.25 24.25L14 30L11.75 24.25L6 22L11.75 19.75L14 14Z"
        fill="hsl(var(--accent))"
      />
    </svg>
  );
}
