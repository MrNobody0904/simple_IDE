import React from 'react';

export default function OALogo({ className = 'h-8 w-auto', useImg = false }) {
  if (useImg) {
    return (
      <img
        src="/oa-logo.jpg"
        alt="OA Logo"
        className={`${className} object-contain rounded select-none`}
      />
    );
  }

  // Exact vector reproduction of the OA logo
  return (
    <svg
      viewBox="0 0 240 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} select-none`}
    >
      {/* Letter 'O' with diagonal slash cut */}
      <defs>
        <mask id="o-cut-mask">
          <rect width="240" height="120" fill="white" />
          {/* Diagonal cut at bottom right of the O */}
          <polygon points="76,68 96,48 114,66 94,86" fill="black" />
        </mask>
      </defs>

      {/* 'O' Ring */}
      <circle
        cx="60"
        cy="60"
        r="44"
        stroke="#FFFFFF"
        strokeWidth="15"
        mask="url(#o-cut-mask)"
      />

      {/* Letter 'A' Outer Chevron Shape */}
      {/* Left leg of A */}
      <polygon
        points="96,98 148,22 163,22 111,98"
        fill="#FFFFFF"
      />
      {/* Right leg of A */}
      <polygon
        points="148,22 200,98 185,98 133,22"
        fill="#FFFFFF"
      />
      {/* Apex join */}
      <polygon
        points="140,22 148,12 156,22"
        fill="#FFFFFF"
      />

      {/* Lime Green Diagonal Crossbar Accent */}
      <polygon
        points="126,98 148,68 174,68 152,98"
        fill="#C6F432"
      />
    </svg>
  );
}
