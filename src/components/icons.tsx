import type { SVGProps } from 'react';

export function TheraMindLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2a10 10 0 1 0 10 10" />
      <path d="M12 2a10 10 0 0 1 10 10" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="M12 2V1" />
      <path d="M12 23v-1" />
      <path d="M12 7a5 5 0 1 0 5 5" />
      <path d="M12 7a5 5 0 0 1 5 5" />
    </svg>
  );
}
