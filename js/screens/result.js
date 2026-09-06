import { el } from '../util.js';
import { ICON } from '../icons.js';
import { footer } from '../app.js';

function nextLevel(grade, curLevelId) {
  const flat = [];
  for (const c of grade.choraks) for (const b of c.blocks) for (const lv of b.levels) flat.push({ b, lv });
  const idx = flat.findIndex(x => x.lv.id === curLevelId);
  for (let j = idx + 1; j < flat.length; j++) if (flat[j].lv.webSupported) return flat[j];
  return null;
}

export function renderResult(ctx, r) {
  const { root, grade, block, level, backHash } = ctx;
  const nx = nextLevel(grade, level.id);

  const star = (on) => el('span', {
    style: `width:52px;height:52px;color:${on ? 'var(--yellow)' : 'transparent'}`,
    html: on ? ICON.star : ICON.starOutline,
  });

  const rstat = (icon, val, label) => el('div', { class: 'rstat' },
    el('span', { style: 'width:22px;height:22px;color:var(--cream)', html: icon }),
    el('b', {}, val), el('span', {}, label));

  root.replaceChildren(el('div', { class: 'result' },
    el('div', { class: 'result__inner' },
      el('h1', {}, r.stars > 0 ? 'Bosqich tugadi!' : 'Yana urinib ko\'ring!'),
      el('div', { class: 'stars' }, star(r.stars >= 1), star(r.stars >= 2), star(r.stars >= 3)),
      el('div', {},
        el('div', { class: 'result__score' }, `Ochko: ${r.score}`),
        el('div', { class: 'result__rec' },
          r.improved && r.score > 0 ? 'Yangi rekord!' : `Rekordingiz: ${Math.max(r.prevScore, r.score)}`)),
      el('div', { class: 'result__grid' },
        rstat(ICON.check, String(r.correct), 'To\'g\'ri javoblar'),
        rstat(ICON.flame, '×' + (r.longestStreak ?? 0), 'Eng uzun ketma-ketlik'),
        rstat(ICON.clock, r.avgMs ? (r.avgMs / 1000).toFixed(1) + 's' : '—', 'O\'rtacha vaqt')),
      el('div', { class: 'result__btns' },
        el('button', { class: 'btn', onclick: () => { location.hash = '#/_'; setTimeout(() => location.hash = `#/play/${level.id}`, 0); } },
          el('span', { style: 'width:20px;height:20px', html: ICON.replay }), 'Yana urinish'),
        el('button', { class: 'btn btn--ink', onclick: () => location.hash = backHash },
          el('span', { style: 'width:20px;height:20px', html: ICON.map }), 'Mavzularga qaytish')),
      nx && el('div', { class: 'result__next' },
        el('a', { href: `#/play/${nx.lv.id}` }, `Keyingi: "${nx.b.name}" →`)))));
}
