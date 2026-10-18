export function PinMark() {
  return (
    <svg className="pin-mark" viewBox="0 0 16 24" width="12" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M8 1.1c2.05 0 3.35 1.55 3.35 3.4 0 1.15-.5 1.95-1.05 2.55.95.55 1.9 1.65 1.9 3.5 0 2.15-.75 4.15-1.55 6.15-.45 1.15-.75 2.35-.75 3.55v1.15c0 .65-.5 1.15-1.15 1.15H7.25c-.65 0-1.15-.5-1.15-1.15v-1.15c0-1.2-.3-2.4-.75-3.55C4.55 14.7 3.8 12.7 3.8 10.55c0-1.85.95-2.95 1.9-3.5-.55-.6-1.05-1.4-1.05-2.55C4.65 2.65 5.95 1.1 8 1.1z"
      />
    </svg>
  )
}

function LanePin({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path
        fill="#fffcfa"
        stroke="#2c2a28"
        strokeWidth="2.5"
        d="M0 2c9 0 15 7 15 16 0 6-3 10-6 13 8 5 13 13 13 24 0 14-5 26-12 35-2 3-3 5-3 8v3c0 2.4-2 4.2-4.4 4.2h-5.2c-2.4 0-4.4-1.8-4.4-4.2v-3c0-3-1-5-3-8-7-9-12-21-12-35 0-11 5-19 13-24-3-3-6-7-6-13C-15 9-9 2 0 2z"
      />
      <path d="M-12 34h24M-13 42h26" stroke="#c12927" strokeWidth="3.5" strokeLinecap="round" />
    </g>
  )
}

export function LaneMark() {
  return (
    <svg className="lane-mark" viewBox="0 0 560 460" role="img" aria-label="A simple bowling lane with a ball and pins">
      <rect x="1" y="1" width="558" height="458" rx="28" fill="#f4f1ed" stroke="#e4dfd8" />
      <polygon points="156,48 404,48 486,412 74,412" fill="#f7f5f2" stroke="#ddd6ce" />
      <line x1="220" y1="62" x2="168" y2="396" stroke="#c12927" strokeWidth="2.5" />
      <line x1="340" y1="62" x2="392" y2="396" stroke="#1e3a8a" strokeWidth="2.5" />
      <LanePin x={214} y={58} />
      <LanePin x={346} y={58} />
      <LanePin x={280} y={78} />
      <ellipse cx="280" cy="318" rx="54" ry="12" fill="#2c2a28" opacity="0.08" />
      <circle cx="280" cy="286" r="46" fill="#2c2a28" />
      <path d="M254 268c8-14 26-20 42-10" fill="none" stroke="#1e3a8a" strokeWidth="4" strokeLinecap="round" />
      <circle cx="266" cy="278" r="6" fill="#faf7f4" />
      <circle cx="290" cy="274" r="6" fill="#faf7f4" />
      <circle cx="282" cy="296" r="5" fill="#faf7f4" />
    </svg>
  )
}
