import { useId } from "react";
import type { FootwearStyle } from "../../types/product";
import "./shoe-visual.css";

/** Original vector concept art. Replace with licensed product photography later. */
export function ShoeVisual({
  variant = "runner",
  className = "",
  label = "Original footwear concept illustration",
}: {
  variant?: FootwearStyle;
  className?: string;
  label?: string;
}) {
  const id = useId().replaceAll(":", "");
  const colors = {
    runner: {
      light: "#66696c",
      middle: "#303337",
      dark: "#121417",
      sole: "#c2c1ba",
      base: "#55585b",
    },
    trail: {
      light: "#b5a78c",
      middle: "#7d7565",
      dark: "#373b31",
      sole: "#c3bda9",
      base: "#3e4038",
    },
    slide: {
      light: "#d5cbb8",
      middle: "#b9ad96",
      dark: "#7d725e",
      sole: "#d6ccba",
      base: "#9c907c",
    },
    mono: {
      light: "#d3d2cb",
      middle: "#aaa9a2",
      dark: "#6a6b67",
      sole: "#e0dfd8",
      base: "#9a9b96",
    },
  }[variant];
  return (
    <svg
      className={`shoe-visual ${className}`}
      viewBox="0 0 700 380"
      role="img"
      aria-labelledby={`${id}-title`}
    >
      <title id={`${id}-title`}>{label}</title>
      <defs>
        <linearGradient id={`${id}-upper`} x1="0" y1="0" x2="0.8" y2="1">
          <stop stopColor={colors.light} />
          <stop offset="0.45" stopColor={colors.middle} />
          <stop offset="1" stopColor={colors.dark} />
        </linearGradient>
        <linearGradient id={`${id}-sole`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor={colors.sole} />
          <stop offset="0.65" stopColor={colors.sole} />
          <stop offset="1" stopColor={colors.base} />
        </linearGradient>
        <linearGradient id={`${id}-panel`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={colors.light} />
          <stop offset="1" stopColor={colors.dark} />
        </linearGradient>
        <pattern
          id={`${id}-mesh`}
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="m0 3 3-3 3 3-3 3Z"
            fill="none"
            stroke="#fff"
            strokeOpacity=".16"
            strokeWidth=".7"
          />
        </pattern>
        <filter
          id={`${id}-shadow`}
          x="-30%"
          y="-100%"
          width="160%"
          height="300%"
        >
          <feGaussianBlur stdDeviation="12" />
        </filter>
      </defs>
      <ellipse
        cx="360"
        cy="324"
        rx="265"
        ry="12"
        fill="#000"
        opacity=".3"
        filter={`url(#${id}-shadow)`}
      />
      {variant === "slide" ? (
        <g>
          <path
            d="M85 254c50-37 125-52 251-38 92 10 173 17 229 29 49 10 67 27 54 43-17 21-81 29-160 29H133c-45 0-70-36-48-63Z"
            fill={`url(#${id}-sole)`}
          />
          <path
            d="M96 254c89-25 275-22 417 3 53 9 91 15 103 23-89 17-159 8-242 4-113-5-200 12-278-30Z"
            fill={colors.dark}
          />
          <path
            d="M255 247c-17-37-12-86 21-106 47-29 122-15 182 11l39 113c-72-30-157-30-242-18Z"
            fill={`url(#${id}-upper)`}
            stroke={colors.light}
            strokeWidth="2"
          />
          <path
            d="M276 151c47-20 109-14 170 14M267 161c49-22 111-13 184 15"
            fill="none"
            stroke={colors.light}
            opacity=".7"
          />
          <path
            d="m334 177 14 2 14 30-14-2-14-30Zm25 3 14 2-8 12 21 23-16-3-19-22 8-12Z"
            fill={colors.sole}
            opacity=".8"
          />
          <path
            d="M117 291c133 12 322 8 470 1"
            fill="none"
            stroke={colors.base}
            strokeWidth="2"
          />
        </g>
      ) : (
        <g>
          <path
            d="M72 251c-3 18-2 44 13 52 38 21 149 17 216 19 136 5 276 1 329-27 15-8 21-25 12-36-114-1-203-8-298-26-82-15-170-9-272 18Z"
            fill={`url(#${id}-sole)`}
            stroke={colors.base}
            strokeWidth="1.5"
          />
          <path
            d="M76 275c58 21 125 13 194 20 101 10 239 12 360-11"
            fill="none"
            stroke={colors.base}
            strokeWidth="2"
            opacity=".8"
          />
          <path
            d="M91 302c141 9 303 21 469-2l58-9-6 17c-89 32-294 26-416 18l-97-7Z"
            fill={colors.dark}
          />
          <path
            d="M80 253 74 164c-1-21 13-49 34-52l26 10c10 17 30 40 56 44l56-21 22-29c11-7 36 9 57 27l86 55c42 22 94 15 151 34 35 12 66 21 76 38-84 30-231 26-313 11-70-12-133-2-186-5-30-2-52-5-59-13Z"
            fill={`url(#${id}-upper)`}
            stroke={colors.light}
            strokeWidth="1.5"
          />
          <path
            d="M79 161c14 1 28-4 35-14l-5-21c14 18 48 50 81 55l55-21 29-28-12-20-19 32-54 22c-26-2-51-28-58-44l-24-11c-17 7-28 25-28 50Z"
            fill={colors.dark}
          />
          <path
            d="M135 182c29 3 49 8 70 4l68-27 140 69 166 31c-64 19-151 14-229 5l-67-9c-34-2-53-22-85-22-21 0-47 17-69 13Z"
            fill={`url(#${id}-mesh)`}
          />
          <path
            d="m85 179 49-3 31 74-16 24-66-17Z"
            fill={`url(#${id}-panel)`}
            stroke={colors.light}
            strokeWidth="1"
          />
          <path
            d="m187 191 49-15 56 66 45 19-56-8-35-29-53 14-25-5Z"
            fill={colors.dark}
            opacity=".85"
          />
          <path
            d="m232 181 17-8 56 57 14 6 15 24-34-10-68-69Z"
            fill={colors.light}
            opacity=".75"
          />
          <path
            d="m290 150 94 62 22 2-82-69c-14-10-23-17-34-19Z"
            fill={`url(#${id}-panel)`}
          />
          <g
            fill="none"
            stroke={colors.sole}
            strokeWidth="4"
            strokeLinecap="round"
            opacity=".7"
          >
            <path d="m266 153 42 3m-31 9 42 4m-29 9 42 5m-27 7 42 6m-26 7 42 6" />
          </g>
          <path
            d="m272 143 49 4 42 49"
            fill="none"
            stroke={colors.dark}
            strokeWidth="3"
          />
          <path
            d="M432 220c35 21 54 37 58 54m17-45c34 11 57 25 68 43"
            fill="none"
            stroke={colors.light}
            strokeWidth="1"
            opacity=".8"
          />
          <path
            d="M87 252c75 17 125 2 195 15 88 18 257 23 346-4"
            fill="none"
            stroke={colors.light}
            strokeWidth="1.5"
          />
          <path
            d="m104 273 5 17m25-13 5 15m27-13 4 15m27-13 4 14m183-5-3 14m32-15-2 14m30-16-2 13m32-16-3 13m31-17-2 12m31-18-2 11"
            fill="none"
            stroke={colors.base}
            strokeWidth="2"
          />
          <path
            d="m350 227 16 3 13 28-16-3-13-28Zm27 5 14 3-8 9 20 20-16-4-18-19 8-9Z"
            fill={colors.sole}
            opacity=".9"
          />
          <path
            d="m77 130 15-10 5 32-16 8Z"
            fill={variant === "runner" ? "#3b5bff" : colors.dark}
          />
          {variant === "trail" && (
            <path
              d="m107 322 8 10h21l4-9m26 2 5 11h26l4-10m30 2 6 10h25l6-10m40 1 6 10h25l6-11m45-1 6 10h25l6-13m35-5 6 9 25-4 5-12"
              fill={colors.dark}
            />
          )}
        </g>
      )}
    </svg>
  );
}
