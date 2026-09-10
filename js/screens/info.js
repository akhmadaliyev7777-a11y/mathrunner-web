import { el, shuffle } from '../util.js';
import { ICON } from '../icons.js';
import { nav, footer, applyKingdom, curriculum } from '../app.js';

const GAME_META = [
  { kind: 'set', name: "To'plamlar (Venn)", desc: 'Har bir sonni to\'g\'ri to\'plamga (yoki hech qaysisiga) joylashtiring', icon: 'venn', color: 'var(--violet)', dark: '#5b3bbf' },
  { kind: 'numberOrder', name: 'Tartiblash', desc: 'Sonlarni o\'sish yoki kamayish tartibida joylang', icon: 'sort', color: 'var(--green)', dark: '#2f9d57' },
  { kind: 'placeValue', name: 'Xona tarkibi', desc: 'Yuzlik / o\'nlik / birlik bloklaridan maqsad sonni quring', icon: 'columns', color: 'var(--orange)', dark: '#c47a12' },
  { kind: 'balanceScale', name: 'Tarozi', desc: 'Tarozi muvozanatidan noma\'lum og\'irlikni toping', icon: 'scale', color: 'var(--peri)', dark: '#3f56c4' },
  { kind: 'symmetry', name: 'Simmetriya', desc: 'Simmetriya o\'qiga nisbatan shaklni to\'ldiring', icon: 'mirror', color: 'var(--pink)', dark: '#c43fa6' },
  { kind: 'netFold', name: 'Yoyilma', desc: 'Bu yoyilma qaysi hajmli shaklni hosil qiladi?', icon: 'net', color: '#C26A4A', dark: '#9a4f34' },
  { kind: 'equationGrid', name: 'Jadval', desc: 'Bo\'sh katakni to\'g\'ri son bilan to\'ldiring', icon: 'grid', color: 'var(--amber, #E0A21E)', dark: '#b07d10' },
  { kind: 'algorithmConveyor', name: 'Saralash', desc: 'Har bir mulohaza uchun "Ha" yoki "Yo\'q"', icon: 'spark', color: 'var(--sky)', dark: '#2f7fb0' },
];

function levelsByKind() {
  const map = {};
  for (const g of curriculum().grades)
    for (const c of g.choraks)
      for (const b of c.blocks)
        for (const lv of b.levels)
          if (lv.webSupported && lv.gameKind !== 'test')
            (map[lv.gameKind] ||= []).push({ ...lv, grade: g.grade, chorak: c.chorak, block: b.blok });
  return map;
}

export function render(root, [which]) {
  applyKingdom(null);
  if (which === 'games') return renderGames(root);
  return renderAbout(root);
}

function renderGames(root) {
  const byKind = levelsByKind();

  const card = (m) => {
    const pool = byKind[m.kind] || [];
    return el('div', { class: 'howcard', style: 'display:flex;flex-direction:column;gap:0' },
      el('div', { class: 'row', style: 'gap:14px' },
        el('span', { class: 'hownum', style: `background:${m.color};box-shadow:0 4px 0 ${m.dark};width:44px;height:44px;color:#fff`, html: ICON[m.icon] }),
        el('div', {},
          el('h3', { style: 'margin:0;font-size:19px' }, m.name),
          el('div', { style: 'font-weight:700;font-size:12px;color:var(--muted-soft)' }, `${pool.length} ta bosqich`))),
      el('p', { style: 'margin:12px 0 16px' }, m.desc),
      el('button', {
        class: 'btn btn--sm', style: 'align-self:flex-start',
        disabled: pool.length === 0,
        onclick: () => { const lv = shuffle(pool)[0]; if (lv) location.hash = `#/play/${lv.id}`; },
      }, "O'ynash",
        el('span', { style: 'width:16px;height:16px', html: ICON.arrowRight })));
  };

  root.replaceChildren(
    nav('games'),
    el('main', { class: 'wrap' },
      el('section', { class: 'section' },
        el('h2', {}, 'Fikrlash o\'yinlari'),
        el('p', { class: 'section__lead' },
          'Yugurish va zarba o\'yinlari bu yerda yo\'q — faqat brauzerda silliq ishlaydigan jumboqlar. ' +
          'Har bir o\'yin tasodifiy bosqichdan boshlanadi; aniq mavzuni "Mavzular" bo\'limidan tanlang.'),
        el('a', { class: 'hero__card', href: '#/tug', style: 'display:block;width:auto;text-decoration:none;color:inherit;margin-bottom:26px;background:linear-gradient(160deg,#5C7FF5,#8055EE 50%,#FF5C5C)' },
          el('div', { class: 'qcard', style: 'display:flex;align-items:center;gap:18px;justify-content:space-between' },
            el('div', {},
              el('div', { style: 'font-family:var(--f-head);font-weight:800;font-size:20px' }, 'Arqon tortish — 2 jamoa'),
              el('div', { style: 'font-weight:700;color:var(--muted);font-size:14px;margin-top:4px' },
                'Sinf ikkiga bo\'linadi. To\'g\'ri javob — arqonni o\'z tomoningga tortadi. Vaqtli.')),
            el('span', { class: 'btn btn--sm btn--ink' }, 'O\'ynash',
              el('span', { style: 'width:15px;height:15px', html: ICON.arrowRight })))),
        el('div', { class: 'kingdoms', style: 'grid-template-columns:repeat(4,minmax(0,1fr))' },
          ...GAME_META.map(card)))),
    footer());
}

function renderAbout(root) {
  const t = curriculum().totals;
  root.replaceChildren(nav('about'),
    el('main', { class: 'wrap' },
      el('section', { class: 'section' },
        el('h2', {}, 'Loyiha haqida'),
        el('p', { class: 'section__lead' },
          'MathRunner Web — O\'zbekiston 1–4 sinf matematika darsligining ochiq, bepul ' +
          'interaktiv ko\'rinishi. Ro\'yxatdan o\'tish shart emas, hamma narsa qulfsiz.'),
        el('div', { class: 'stats', style: 'margin-top:8px' },
          el('div', { class: 'stat' }, el('b', {}, String(t.levels)), el('span', {}, 'dars-bosqich')),
          el('div', { class: 'stat' }, el('b', {}, String(t.questions)), el('span', {}, 'test savoli')),
          el('div', { class: 'stat' }, el('b', {}, String(t.gameLevels)), el('span', {}, 'o\'yin bosqichi'))),
        el('p', { style: 'font-weight:600;color:var(--muted);line-height:1.6;margin-top:20px' },
          'To\'liq versiya (yugurish o\'yinlari, do\'kon, XP) Android ilovasida. ' +
          'Bu sayt darslikni tez takrorlash uchun — maktabda o\'tilgan mavzuni uyda bir necha marta yechib mustahkamlaysiz.')),
      el('div', { style: 'padding:8px 0 8px' },
        el('a', { href: '#/', class: 'btn' }, 'Mavzularga o\'tish',
          el('span', { style: 'width:20px;height:20px', html: ICON.arrowRight })))),
    footer());
}
