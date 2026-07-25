/**
 * The Cropsphere.ai sprout mark, hand-authored as inline SVG so each part — stem,
 * leaves, and every seed in the flower head — can animate independently.
 *
 * variant:
 *   'static' — no motion (navbar, footer)
 *   'grow'   — choreographed one-shot: stem draws up, leaves unfurl, seeds pop
 *   'loop'   — 'grow', then the sprout breathes forever (loading indicator)
 *
 * All motion is expressed with Tailwind animation utilities, so the global
 * prefers-reduced-motion rule in globals.css neutralises it automatically.
 */

// Flower head, ordered bottom-to-top so the pop stagger reads as "blooming".
const SEEDS = [
  { cx: 60.2, cy: 38.5, r: 4.0 },
  { cx: 52.0, cy: 33.5, r: 4.0 },
  { cx: 68.4, cy: 33.5, r: 4.0 },
  { cx: 50.0, cy: 24.5, r: 4.0 },
  { cx: 70.4, cy: 24.5, r: 4.0 },
  { cx: 60.2, cy: 25.0, r: 4.5 },
  { cx: 60.0, cy: 16.0, r: 3.2 },
];

const C = {
  badge: '#e5efe3',
  ground: '#31702f',
  stem: '#4aad4e',
  leafBack: '#a8d3a0',
  leafLeft: '#2f8b3b',
  leafRight: '#2a7f36',
  vein: '#1b3e20',
  dew: '#c9dde3',
  seed: '#f5b921',
};

// Written out in full rather than built with a template literal — Tailwind's
// scanner only sees class names that appear verbatim in the source.
const ANIM = {
  ground: 'animate-ground-in',
  stem: 'animate-stem-grow',
  leaf: 'animate-leaf-unfurl',
  seed: 'animate-seed-pop',
};

export default function BrandMark({
  size = 40,
  variant = 'static',
  title,
  className = '',
}) {
  const animated = variant === 'grow' || variant === 'loop';

  // Only attach an animation class when animating, so the static mark renders
  // as plain geometry with no dash offsets or zeroed opacity to recover from.
  // `pivot` is only meaningful while animating, so both collapse to nothing
  // on the static mark.
  const pivot = (x, y) => ({
    transformBox: 'view-box',
    transformOrigin: `${x}px ${y}px`,
  });

  const anim = (key, delay, extraStyle) =>
    animated
      ? {
          className: ANIM[key],
          style: { animationDelay: `${delay}ms`, ...extraStyle },
        }
      : {};

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : 'true'}
      focusable="false"
    >
      {title && <title>{title}</title>}

      <circle cx="60" cy="60" r="57" fill={C.badge} />

      {/* Sprout — breathes as a whole once the grow sequence has finished */}
      <g
        className={variant === 'loop' ? 'animate-breathe' : undefined}
        style={
          variant === 'loop'
            ? // Starts after the last seed lands (800 + 6×60 + 400 = 1560ms),
              // so the two never fight over the same transform.
              { animationDelay: '1600ms', ...pivot(60, 93) }
            : undefined
        }
      >
        {/* Ground shadow */}
        <ellipse
          cx="60.5"
          cy="93"
          rx="27.5"
          ry="6.4"
          fill={C.ground}
          {...anim('ground', 100, pivot(60.5, 93))}
        />

        {/* Stem — drawn upward via stroke-dashoffset */}
        <path
          d="M60.8 93 C60.8 78 60 58 60.2 40.5"
          stroke={C.stem}
          strokeWidth="4.6"
          strokeLinecap="round"
          pathLength="1"
          strokeDasharray={animated ? 1 : undefined}
          {...anim('stem', 220)}
        />

        {/* Pale leaf behind. Its translucency uses fill-opacity, NOT opacity:
            the unfurl keyframe animates `opacity` with fill-mode `both`, which
            would override an `opacity` attribute and leave the leaf full green. */}
        <path
          d="M60 68 C55 58 49 43 50 28 C58 40 63 55 60 68 Z"
          fill={C.leafBack}
          fillOpacity="0.7"
          {...anim('leaf', 460, pivot(60, 68))}
        />

        {/* Left leaf */}
        <g {...anim('leaf', 520, pivot(60.5, 72))}>
          <path
            d="M60.5 72 C48 69 34 57 27 41 C42 45 56 56 60.5 72 Z"
            fill={C.leafLeft}
          />
          <path
            d="M60.5 72 C48 65 36 54 28.5 42.5"
            stroke={C.vein}
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.26"
          />
          <ellipse cx="44" cy="57" rx="2.3" ry="2.9" fill={C.dew} opacity="0.85" />
        </g>

        {/* Right leaf */}
        <g {...anim('leaf', 640, pivot(61, 66))}>
          <path
            d="M61 66 C73 63 86 52 93 36 C79 40 66 51 61 66 Z"
            fill={C.leafRight}
          />
          <path
            d="M61 66 C72 60 84 50 91.5 37.5"
            stroke={C.vein}
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.26"
          />
          <ellipse cx="76" cy="50" rx="2.3" ry="2.9" fill={C.dew} opacity="0.85" />
        </g>

        {/* Flower head — seeds pop in 60ms apart, bottom to top */}
        {SEEDS.map((s, i) => (
          <circle
            key={i}
            cx={s.cx}
            cy={s.cy}
            r={s.r}
            fill={C.seed}
            {...anim('seed', 800 + i * 60, {
              // fill-box resolves 'center' to each circle's own centre.
              transformBox: 'fill-box',
              transformOrigin: 'center',
            })}
          />
        ))}
      </g>
    </svg>
  );
}
