export function FaintGeometrySketches() {
  return (
    <svg className="faint-geometry-sketches" viewBox="0 0 1600 900" aria-hidden="true">
      <g className="sketch sketch-large" transform="translate(910 18) rotate(8)">
        <circle cx="230" cy="250" r="240" />
        <circle cx="300" cy="250" r="155" />
        <line x1="22" y1="330" x2="492" y2="176" />
        <line x1="78" y1="456" x2="378" y2="36" />
        <line x1="78" y1="456" x2="454" y2="450" />
        <line x1="378" y1="36" x2="454" y2="450" />
        <path d="M76 456Q116 407 164 398" />
        <path d="M98 446Q130 416 168 411" />
        <text x="330" y="16">A</text>
        <text x="498" y="178">Q</text>
        <text x="72" y="500">D</text>
        <text x="4" y="334">P</text>
        <text x="250" y="214">M</text>
        <text x="130" y="236">X</text>
      </g>

      <g className="sketch sketch-lower" transform="translate(420 520) rotate(-22)">
        <polygon points="190,0 448,124 360,392 80,324" />
        <line x1="190" y1="0" x2="360" y2="392" />
        <line x1="80" y1="324" x2="448" y2="124" />
        <line x1="150" y1="192" x2="498" y2="280" />
        <line x1="260" y1="60" x2="250" y2="432" />
        <path d="M80 324Q138 278 154 206" />
        <path d="M360 392Q318 350 250 332" />
        <text x="178" y="-18">K</text>
        <text x="456" y="126">J</text>
        <text x="54" y="350">A</text>
        <text x="366" y="426">B</text>
        <text x="500" y="294">I</text>
        <text x="244" y="456">D</text>
      </g>

      <g className="sketch sketch-map" transform="translate(1040 600) rotate(14)">
        <circle cx="0" cy="0" r="155" />
        <line x1="-146" y1="-52" x2="156" y2="66" />
        <line x1="-88" y1="128" x2="92" y2="-136" />
        <line x1="-120" y1="100" x2="142" y2="-86" />
        <path d="M-120 100Q-78 78 -64 32" />
        <text x="-178" y="-55">E</text>
        <text x="160" y="82">B</text>
        <text x="-110" y="154">C</text>
      </g>
    </svg>
  );
}
