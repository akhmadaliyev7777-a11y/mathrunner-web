import { el } from '../util.js';
import { ICON, KINGDOM_ICON } from '../icons.js';
import { nav, footer, curriculum, applyKingdom } from '../app.js';

export function render(root, _params) {
  applyKingdom(null);
  const cur = curriculum();
  const t = cur.totals;

  const heroCard = el('div', { class: 'hero__card' },
    el('div', { class: 'qcard' },
      el('div', { class: 'spread', style: 'font-weight:800;font-size:13px;color:rgba(22,18,64,.55)' },
        el('span', {}, '1-sinf · I chorak · Blok 7'), el('span', {}, '4 / 10')),
      el('div', { class: 'bar', style: 'margin:10px 0 22px' }, el('i', { style: 'width:40%' })),
      el('div', { style: 'font-family:var(--f-head);font-weight:800;font-size:40px;text-align:center;margin:12px 0 24px' }, '7 + 5 = ?'),
      el('div', { class: 'answers' },
        el('div', { class: 'answer is-correct' }, '12'),
        el('div', { class: 'answer' }, '11'),
        el('div', { class: 'answer' }, '13'))));

  const kcard = (g) => el('button', {
    class: 'kcard', onclick: () => { location.hash = `#/g/${g.grade}/c/1`; },
  },
    el('div', { class: 'kcard__head', style: `background:${g.color.head}` },
      el('span', { style: 'color:#FFF6E6;width:40px;height:40px', html: KINGDOM_ICON[g.kingdom] })),
    el('div', { class: 'kcard__body' },
      el('div', { class: 'kcard__title' }, `${g.grade}-sinf`),
      el('div', { class: 'kcard__meta' }, `${g.kingdomTitle} · ${g.levelCount} dars · ${g.choraks.length} chorak`),
      el('div', { class: 'kcard__go', style: `color:${g.color.accentDark}` }, 'Kirish',
        el('span', { style: 'width:16px;height:16px', html: ICON.arrowRight }))));

  const gchip = (icon, label) => el('a', { class: 'gchip', href: '#/games' },
    el('span', { style: 'width:30px;height:30px;color:var(--violet)', html: icon }),
    el('div', { html: label }));

  const howcard = (n, color, dark, title, body) => el('div', { class: 'howcard' },
    el('div', { class: 'hownum', style: `background:${color};box-shadow:0 4px 0 ${dark}` }, String(n)),
    el('h3', {}, title), el('p', {}, body));

  root.replaceChildren(
    nav('mavzular'),
    el('main', { class: 'wrap' },
      // hero
      el('div', { class: 'hero' },
        el('div', { class: 'hero__body' },
          el('div', { class: 'tag' },
            el('span', { style: 'width:15px;height:15px', html: ICON.check }),
            'Bepul · qulfsiz · ro\'yxatdan o\'tishsiz'),
          el('h1', { html: 'Butun matematika darsligi —<br>o\'yin bo\'lib brauzerda' }),
          el('p', { class: 'hero__sub' },
            '1–4 sinfning har bir darsi — alohida bosqich. Sinf va chorakni tanlang, mavzu testini yeching, fikrlash jumboqlarini o\'ynang. Hammasi ochiq.'),
          el('div', { class: 'hero__cta' },
            el('a', { href: '#/g/1/c/1', class: 'btn' }, 'Mavzularni ochish',
              el('span', { style: 'width:20px;height:20px', html: ICON.arrowRight })),
            el('a', { href: '#/about' }, 'Loyiha qanday ishlaydi?')),
          el('div', { class: 'stats' },
            el('div', { class: 'stat' }, el('b', {}, String(t.levels)), el('span', {}, 'dars-bosqich')),
            el('div', { class: 'stat' }, el('b', {}, `${(t.questions + t.gameTasks).toLocaleString('ru-RU')}+`), el('span', {}, 'savol va topshiriq')),
            el('div', { class: 'stat' }, el('b', {}, '4'), el('span', {}, 'sinf · 16 chorak')),
            el('div', { class: 'stat' }, el('b', {}, '7'), el('span', {}, 'fikrlash o\'yini')))),
        heroCard),
      // kingdoms
      el('section', { class: 'section' },
        el('h2', {}, 'Sinfingizni tanlang'),
        el('p', { class: 'section__lead' }, 'Har sinf — o\'z olami. Barcha chorak va bloklar boshidanoq ochiq.'),
        el('div', { class: 'kingdoms' }, ...cur.grades.map(kcard))),
      // games
      el('section', { class: 'section' },
        el('div', { class: 'section__head' },
          el('h2', {}, 'Fikrlash o\'yinlari'),
          el('a', { class: 'section__more', href: '#/games' }, 'Barchasini ochish',
            el('span', { style: 'width:16px;height:16px', html: ICON.arrowRight }))),
        el('p', { class: 'section__lead' }, 'Yugurish va zarba o\'yinlari bu yerda yo\'q — faqat brauzerda silliq ishlaydigan jumboqlar.'),
        el('div', { class: 'games-strip' },
          gchip(ICON.venn, 'To\'plamlar<br>(Venn)'),
          gchip(ICON.sort, 'Tartiblash'),
          gchip(ICON.columns, 'Xona<br>tarkibi'),
          gchip(ICON.scale, 'Tarozi<br>(tenglama)'),
          gchip(ICON.mirror, 'Simmetriya'),
          gchip(ICON.net, 'Yoyilma'),
          gchip(ICON.grid, 'Ko\'paytirish<br>jadvali'))),
      // how
      el('section', { class: 'section' },
        el('h2', {}, 'Qanday ishlaydi'),
        el('div', { class: 'how' },
          howcard(1, 'var(--yellow)', '#d9b940', 'Sinf va chorakni tanlang', 'Maktabda o\'tilgan mavzuni toping — sinf → chorak → blok.'),
          howcard(2, 'var(--green)', '#2f9d57', 'Testni yeching yoki o\'ynang', '10 ta savol yoki fikrlash jumboqi. Vaqt bosimi yo\'q, xatoni tuzatib bo\'ladi.'),
          howcard(3, 'var(--sky)', '#2f9dcf', 'Yulduz va natijani ko\'ring', 'Aniqlikka qarab 1–3 yulduz, eng yaxshi natija saqlanadi (shu brauzerda).')))),
    footer());
}
