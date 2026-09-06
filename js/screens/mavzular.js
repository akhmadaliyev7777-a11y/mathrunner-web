import { el } from '../util.js';
import { ICON, KINGDOM_ICON } from '../icons.js';
import { nav, footer, curriculum, gradeData, applyKingdom } from '../app.js';
import { readBest } from '../util.js';

const GAME_LABEL = {
  set: 'To\'plamlar o\'yini', numberOrder: 'Tartiblash o\'yini', placeValue: 'Xona tarkibi o\'yini',
  balanceScale: 'Tarozi o\'yini', symmetry: 'Simmetriya o\'yini', netFold: 'Yoyilma o\'yini',
  equationGrid: 'Jadval o\'yini', algorithmConveyor: 'Saralash o\'yini',
  fractionStrip: 'Ulush o\'yini', coordinatePath: 'Koordinata o\'yini',
  motionLine: 'Harakat o\'yini', protractor: 'Transportir o\'yini',
};

export function render(root, [gradeStr, chorakStr]) {
  const grade = Number(gradeStr);
  const g = gradeData(grade);
  if (!g) { location.hash = '#/'; return; }
  applyKingdom(g);
  let chorakNo = Number(chorakStr || 1);
  if (!g.choraks.find(c => c.chorak === chorakNo)) chorakNo = g.choraks[0].chorak;
  const best = readBest();

  const railBtn = (gg) => el('button', {
    class: 'grade-btn' + (gg.grade === grade ? ' is-active' : ''),
    style: gg.grade === grade ? `background:${gg.color.head}` : '',
    onclick: () => { location.hash = `#/g/${gg.grade}/c/1`; },
  },
    el('span', { style: `width:20px;height:20px;color:${gg.grade === grade ? '#06251a' : gg.color.accentDark}`, html: KINGDOM_ICON[gg.kingdom] }),
    `${gg.grade}-sinf`);

  const chorakTab = (c) => el('button', {
    class: 'chorak-tab' + (c.chorak === chorakNo ? ' is-active' : ''),
    onclick: () => { location.hash = `#/g/${grade}/c/${c.chorak}`; },
  }, `${c.roman} chorak`);

  const numColors = ['var(--yellow)', 'var(--sky)', 'var(--green)', 'var(--pink)'];

  const lchip = (lv, idx) => {
    if (!lv.webSupported) {
      return el('button', { class: 'lchip lchip--soon', disabled: true, title: 'Web versiyada tez orada' },
        lv.gameKind === 'test' ? `${lv.level}-daraja` : 'Tez orada');
    }
    const done = best[lv.id]?.stars || 0;
    const label = lv.gameKind === 'test'
      ? `${lv.level}-daraja`
      : (lv.gameKind === 'algorithmConveyor' || lv.gameKind === 'set' ? 'O\'yin' : 'O\'yin');
    return el('button', {
      class: 'lchip ' + (idx === 0 ? 'lchip--primary' : 'lchip--ghost'),
      onclick: () => { location.hash = `#/play/${lv.id}`; },
      title: done ? `${done} yulduz` : '',
    }, label + (done ? ' ★'.repeat(done) : ''));
  };

  const chorak = g.choraks.find(c => c.chorak === chorakNo);
  const bcard = (b) => el('div', { class: 'bcard' },
    el('div', { class: 'bcard__top' },
      el('div', { class: 'bcard__num', style: `background:${numColors[(b.blok - 1) % 4]}` }, String(b.blok)),
      b.kind === 'game'
        ? el('span', { class: 'badge badge--game' }, el('span', { style: 'width:11px;height:11px', html: ICON.spark }), 'O\'YIN')
        : el('span', { class: 'badge badge--test' }, 'TEST')),
    el('div', { class: 'bcard__title' }, b.name),
    el('div', { class: 'bcard__meta' },
      b.kind === 'game'
        ? `${b.levels.length} bosqich · ${GAME_LABEL[b.levels.find(l => l.gameKind !== 'test')?.gameKind] || 'o\'yin'}`
        : `${b.levels.length} bosqich`),
    el('div', { class: 'bcard__levels' }, ...b.levels.map((lv, i) => lchip(lv, i))));

  root.replaceChildren(
    nav('mavzular'),
    el('main', { class: 'wrap' },
      el('div', { class: 'crumb' },
        el('button', { onclick: () => location.hash = '#/' }, 'Bosh sahifa'),
        el('span', {}, '/'),
        el('span', { class: 'now' }, `${grade}-sinf`),
        el('span', {}, '/'),
        el('span', { class: 'now' }, `${chorak.roman} chorak`)),
      el('div', { class: 'browser' },
        el('div', { class: 'grade-rail' },
          el('div', { class: 'grade-rail__label' }, 'Sinf'),
          el('div', { class: 'grade-rail__inner' }, ...curriculum().grades.map(railBtn)),
          el('div', { class: 'rail-note' }, `Barcha ${g.levelCount} dars boshidanoq ochiq — istalgan tartibda o'ting.`)),
        el('div', { class: 'browser__main' },
          el('h1', {}, `${grade}-sinf · Mavzular`),
          el('p', { class: 'section__lead' }, 'Chorakni tanlang, so\'ng blok ustidagi bosqichni oching.'),
          el('div', { class: 'chorak-tabs' }, ...g.choraks.map(chorakTab)),
          el('div', { class: 'blocks' }, ...chorak.blocks.map(bcard)),
          el('div', { class: 'blocks__foot' },
            `${chorak.roman} chorakda jami ${chorak.blockCount} blok · ${chorak.levelCount} bosqich`)))),
    footer());
}
