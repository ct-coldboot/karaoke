import React from 'react';

interface Props {
  width?: number;
}

export default function BigInuLogo({ width = 480 }: Props) {
  const h = Math.round(width * 0.42);
  return (
    <svg width={width} height={h} viewBox="0 0 480 200" xmlns="http://www.w3.org/2000/svg">
      {/* Red background */}
      <rect x="0" y="0" width="480" height="200" rx="8" ry="8" fill="#cc0000" />

      {/* "Karaoke Entertainment" — small, centered, top */}
      <text
        x="240"
        y="52"
        textAnchor="middle"
        fill="white"
        fontFamily="'Arial', 'Helvetica Neue', sans-serif"
        fontWeight="300"
        fontSize="22"
        letterSpacing="3"
      >
        Karaoke Entertainment
      </text>

      {/* "BIG INU" — large, bold, centered */}
      <text
        x="240"
        y="138"
        textAnchor="middle"
        fill="white"
        fontFamily="'Arial Black', 'Arial', 'Helvetica Neue', sans-serif"
        fontWeight="900"
        fontSize="88"
        letterSpacing="-1"
      >
        BIG INU
      </text>

      {/* Yellow swoosh arc below text */}
      <path
        d="M 60 158 Q 240 185 420 158"
        fill="none"
        stroke="#ffe600"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M 80 166 Q 240 196 400 166"
        fill="none"
        stroke="#ffcc00"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}
