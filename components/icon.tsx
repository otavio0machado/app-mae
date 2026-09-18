export default function Icon({
  name,
  size = 20,
}: {
  name:
    | "clock"
    | "list"
    | "report"
    | "people"
    | "plus"
    | "arrow"
    | "print"
    | "logout";
  size?: number;
}) {
  const paths = {
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    list: (
      <>
        <path d="M8 6h12M8 12h12M8 18h12M3 6h.01M3 12h.01M3 18h.01" />
      </>
    ),
    report: (
      <>
        <path d="M14 2H5v20h14V7zM14 2v6h5M8 12h8M8 16h8" />
      </>
    ),
    people: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6M21 21v-3a6 6 0 0 0-4-5" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    arrow: <path d="m9 5 7 7-7 7" />,
    print: (
      <>
        <path d="M6 9V3h12v6M6 18H3V9h18v9h-3M6 15h12v7H6z" />
        <path d="M17 12h.01" />
      </>
    ),
    logout: (
      <>
        <path d="M9 4H3v16h6M10 12h11m-4-4 4 4-4 4" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
