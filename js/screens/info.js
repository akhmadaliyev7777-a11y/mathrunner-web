import { el } from '../util.js';
import { ICON } from '../icons.js';
import { nav, footer, applyKingdom, curriculum } from '../app.js';

export function render(root, [which]) {
  applyKingdom(null);
  const t = curriculum().totals;

  const body = which === 'games'
    ? el('section', { class: 'section' },
        el('h2', {}, 'Fikrlash o\'yinlari'),
        el('p', { class: 'section__lead' },
          'Web versiyada yugurish (Runner), Worm Crusher va Algoritm Konveyer yo\'q. ' +
          'Ularning o\'rniga brauzerda silliq ishlaydigan tap/drag jumboqlar bor:'),
        el('ul', { style: 'font-weight:700;line-height:1.9;font-size:16px' },
          el('li', {}, 'To\'plamlar (Venn) — sonni to\'g\'ri to\'plamga joylashtirish'),
          el('li', {}, 'Tartiblash — sonlarni o\'sish/kamayish tartibida qo\'yish'),
          el('li', {}, 'Xona tarkibi — o\'nlik/birlik/yuzlik bloklaridan son qurish'),
          el('li', {}, 'Tarozi — noma\'lumni topish (□ + a = b, tenglama)'),
          el('li', {}, 'Simmetriya — o\'qqa nisbatan shaklni to\'ldirish'),
          el('li', {}, 'Yoyilma — kub/parallelepiped yoyilmasini tanish'),
          el('li', {}, 'Jadval — bo\'sh katakli qo\'shish/ko\'paytirish ifodasi'),
          el('li', {}, 'Saralash — juft/toq yoki bo\'linadi/bo\'linmaydi bo\'yicha')))
    : el('section', { class: 'section' },
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
          'Bu sayt darslikni tez takrorlash uchun — maktabda o\'tilgan mavzuni uyda bir necha marta yechib mustahkamlaysiz.'));

  root.replaceChildren(nav(which), el('main', { class: 'wrap' }, body,
    el('div', { style: 'padding:24px 0 8px' },
      el('a', { href: '#/', class: 'btn' }, 'Mavzularga o\'tish',
        el('span', { style: 'width:20px;height:20px', html: ICON.arrowRight })))), footer());
}
