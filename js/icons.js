// Inline SVG ikonlar — stroke uslubi, 24px grid. Rangni `currentColor` oladi.
const s = (p, extra = '') =>
  `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" ${extra}>${p}</svg>`;

export const ICON = {
  runner: s('<path d="M4 18 L10 6 L14 14 L20 4"/>'),
  arrowRight: s('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  arrowLeft: s('<path d="M15 6l-6 6 6 6"/>'),
  check: s('<path d="M20 6L9 17l-5-5"/>'),
  star: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 3l2.7 6.3L21 10l-5 4.3L17.5 21 12 17.5 6.5 21 8 14.3 3 10l6.3-.7L12 3Z"/></svg>',
  starOutline: '<svg width="24" height="24" viewBox="0 0 24 24" fill="rgba(255,255,255,.22)" stroke="rgba(255,255,255,.5)" stroke-width="1.4"><path d="M12 3l2.7 6.3L21 10l-5 4.3L17.5 21 12 17.5 6.5 21 8 14.3 3 10l6.3-.7L12 3Z"/></svg>',
  leaf: s('<path d="M11 20A7 7 0 0 1 4 13c0-5 4-9 7-11 3 2 7 6 7 11a7 7 0 0 1-7 7Z"/><path d="M11 20V9"/>'),
  store: s('<path d="M4 9h16l-1-4H5L4 9Z"/><path d="M5 9v10h14V9"/><path d="M10 19v-5h4v5"/>'),
  mountain: s('<path d="M3 19l6-9 4 5 3-4 5 8H3Z"/>'),
  sparkle: s('<path d="M12 3l2.4 5.6L20 11l-5.6 2.4L12 19l-2.4-5.6L4 11l5.6-2.4L12 3Z"/>'),
  venn: s('<circle cx="9" cy="12" r="6"/><circle cx="15" cy="12" r="6"/>'),
  sort: s('<path d="M7 4v16M7 20l-3-3M7 20l3-3M17 20V4M17 4l-3 3M17 4l3 3"/>'),
  columns: s('<rect x="3" y="5" width="7" height="14" rx="1.5"/><rect x="14" y="9" width="7" height="10" rx="1.5"/>'),
  scale: s('<path d="M12 3v4M5 7h14M6 7l-2 7h8L10 7M18 7l-2 7h8l-2-7M4 20h16"/>'),
  mirror: s('<path d="M12 3v18"/><path d="M12 6l-6 4 6 3M12 6l6 4-6 3"/>'),
  net: s('<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6V3Z"/>'),
  grid: s('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>'),
  spark: s('<path d="M12 3v4M12 17v4M5 12H1M23 12h-4M6 6L4 4M18 6l2-2M6 18l-2 2M18 18l2 2"/>'),
  replay: s('<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>'),
  map: s('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 4v16"/>'),
  clock: s('<circle cx="12" cy="13" r="8"/><path d="M12 13V9M12 5V3M9 3h6"/>'),
  flame: s('<path d="M12 2c1.5 3 4 4.5 4 8a4 4 0 0 1-8 0c0-1.2.4-2 1-3-.2 2 1 3 1 3s-.5-4 2-8Z"/><path d="M8 14c0 3 1.8 6 4 6s4-3 4-6"/>'),
};

export const KINGDOM_ICON = { forest: ICON.leaf, city: ICON.store, space: ICON.mountain, castle: ICON.sparkle };
