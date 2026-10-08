export type IconName =
  | "arrow"
  | "diagonal"
  | "search"
  | "heart"
  | "bag"
  | "user"
  | "menu"
  | "close"
  | "upload"
  | "plus"
  | "check"
  | "play"
  | "pause";

const paths: Record<IconName, string> = {
  play: "m8 5 11 7-11 7V5Z",
  pause: "M8 5v14M16 5v14",
  arrow: "M4 12h16m-6-6 6 6-6 6",
  diagonal: "M6 18 18 6M6 6h12v12",
  search: "M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  heart:
    "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z",
  bag: "M5 7h14l1 14H4L5 7Zm3 0V5a4 4 0 0 1 8 0v2",
  user: "M20 21v-2a8 8 0 0 0-16 0v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
  menu: "M4 8h16M4 16h16",
  close: "m6 6 12 12M6 18 18 6",
  upload: "M12 16V3m-5 5 5-5 5 5M4 15v6h16v-6",
  plus: "M12 4v16M4 12h16",
  check: "m5 12 4 4L19 6",
};

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
