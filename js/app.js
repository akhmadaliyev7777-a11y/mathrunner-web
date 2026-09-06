import { $, el, loadJSON } from './util.js';
import { ICON } from './icons.js';

const APP = $('#app');
let CUR = null; // curriculum.json

// ---------- shared chrome ----------
export function nav(active) {
  const link = (href, label, key) =>
    el('a', { href, class: active === key ? 'is-active' : '' }, label);
  return el('div', { class: 'nav' },
    el('div', { class: 'nav__inner' },
      el('a', { href: '#/', class: 'brand', style: 'color:inherit' },
        el('span', { class: 'brand__mark', html: ICON.runner.replace('currentColor', '#FFF6E6') }),
        el('span', { class: 'brand__name' }, 'MathRunner'),
        el('span', { class: 'brand__pill' }, '1–4 sinf')),
      el('div', { class: 'nav__links' },
        link('#/', 'Mavzular', 'mavzular'),
        link('#/games', 'Fikrlash o\'yinlari', 'games'),
        link('#/about', 'Loyiha haqida', 'about'),
        el('div', { class: 'lang' },
          el('span', { class: 'is-active' }, 'UZ'),
          el('span', {}, 'RU'), el('span', {}, 'EN')))));
}

export function footer() {
  const col = (title, items) => el('div', { class: 'foot__col' },
    el('b', {}, title), ...items.map(([t, h]) => el('a', { href: h }, t)));
  return el('div', { class: 'foot' },
    el('div', { class: 'foot__inner' },
      el('div', { class: 'foot__top' },
        el('div', {},
          el('div', { class: 'brand' },
            el('span', { class: 'brand__mark', style: 'width:32px;height:32px', html: ICON.runner.replace('currentColor', '#FFF6E6') }),
            el('span', { class: 'brand__name', style: 'font-size:18px' }, 'MathRunner Web')),
          el('p', { style: 'font-weight:600;color:rgba(255,246,230,.6);max-width:340px;margin:14px 0 0;line-height:1.5' },
            '1–4 sinf matematika darsligining ochiq, bepul interaktiv ko\'rinishi.')),
        el('div', { class: 'foot__cols' },
          col('Sayt', [['Mavzular', '#/'], ['Fikrlash o\'yinlari', '#/games'], ['Loyiha haqida', '#/about']]),
          col('Boshqa', [['Android ilova', '#/about'], ['GitHub (ochiq manba)', 'https://github.com/akhmadaliyev7777-a11y'], ['Aloqa', '#/about']]))),
      el('div', { class: 'foot__note' },
        '© 2026 MathRunner · O\'zbekiston 1–4 sinf matematika kurikulumi asosida')));
}

export const curriculum = () => CUR;
export const gradeData = (g) => CUR.grades.find(x => x.grade === Number(g));
export function levelById(id) {
  for (const g of CUR.grades)
    for (const c of g.choraks)
      for (const b of c.blocks)
        for (const lv of b.levels)
          if (lv.id === id) return { grade: g, chorak: c, block: b, level: lv };
  return null;
}

// kingdom rangini hujjatga qo'llash (grade konteksti)
export function applyKingdom(g) {
  const r = document.documentElement.style;
  if (!g) { r.removeProperty('--k-accent'); r.removeProperty('--k-accent-dark'); r.removeProperty('--k-head'); r.removeProperty('--k-tint'); return; }
  r.setProperty('--k-accent', g.color.accent);
  r.setProperty('--k-accent-dark', g.color.accentDark);
  r.setProperty('--k-head', g.color.head);
  r.setProperty('--k-tint', hexToRgba(g.color.accent, 0.12));
}
function hexToRgba(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

// ---------- router ----------
const routes = [
  { re: /^#\/?$/, load: () => import('./screens/landing.js'), name: 'landing' },
  { re: /^#\/g\/(\d)(?:\/c\/(\d))?$/, load: () => import('./screens/mavzular.js'), name: 'mavzular' },
  { re: /^#\/play\/([\w-]+)$/, load: () => import('./screens/play.js'), name: 'play' },
  { re: /^#\/(games|about)$/, load: () => import('./screens/info.js'), name: 'info' },
];

async function route() {
  const hash = location.hash || '#/';
  for (const r of routes) {
    const m = hash.match(r.re);
    if (m) {
      APP.innerHTML = '<div class="boot">Yuklanmoqda…</div>';
      const mod = await r.load();
      window.scrollTo(0, 0);
      mod.render(APP, m.slice(1));
      return;
    }
  }
  location.hash = '#/';
}

async function main() {
  try {
    CUR = await loadJSON('data/curriculum.json');
  } catch (e) {
    APP.innerHTML = '<div class="boot">Ma\'lumotni yuklab bo\'lmadi. Sahifani yangilang.</div>';
    console.error(e);
    return;
  }
  addEventListener('hashchange', route);
  route();
}
main();
