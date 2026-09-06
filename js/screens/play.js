import { el, shuffle, loadJSON, saveBest, starsFor } from '../util.js';
import { ICON } from '../icons.js';
import { levelById, applyKingdom, nav, footer } from '../app.js';
import { renderResult } from './result.js';
import { GAMES } from '../games/index.js';

export async function render(root, [levelId]) {
  const found = levelById(levelId);
  if (!found) { location.hash = '#/'; return; }
  const { grade, chorak, block, level } = found;
  applyKingdom(grade);

  if (!level.webSupported) {
    root.replaceChildren(nav(null), el('main', { class: 'wrap', style: 'padding:80px 0;text-align:center' },
      el('h1', {}, 'Bu o\'yin web versiyada tez orada'),
      el('p', { class: 'section__lead' }, 'Hozircha faqat mobil ilovada mavjud.'),
      el('a', { href: `#/g/${grade.grade}/c/${chorak.chorak}`, class: 'btn btn--ink' }, 'Mavzularga qaytish')), footer());
    return;
  }

  root.innerHTML = '<div class="boot">Yuklanmoqda…</div>';
  let bank;
  try { bank = await loadJSON(`data/${level.bank}`); }
  catch (e) { root.innerHTML = '<div class="boot">Bankni yuklab bo\'lmadi.</div>'; console.error(e); return; }

  const ctx = {
    root, grade, chorak, block, level, bank,
    backHash: `#/g/${grade.grade}/c/${chorak.chorak}`,
    finish: (correct, total, extra = {}) => {
      const stars = starsFor(correct, total);
      const score = correct * 10 + (extra.longestStreak || 0) * 5;
      const { improved, prevScore } = saveBest(level.id, stars, score);
      renderResult(ctx, { correct, total, stars, score, improved, prevScore, ...extra });
    },
  };

  if (level.gameKind === 'test') return runTest(ctx);
  const game = GAMES[level.gameKind];
  if (game) return game(ctx);
  // fallback (kelib chiqmasligi kerak)
  ctx.finish(0, 0);
}

// ---------------- TEST PLAYER ----------------
function runTest(ctx) {
  const { root, grade, chorak, block, level } = ctx;
  const items = shuffle(ctx.bank);
  let i = 0, correct = 0, streak = 0, longestStreak = 0, tSum = 0, qStart = 0, locked = false;

  const wrap = el('div');
  root.replaceChildren(
    nav(null),
    el('div', { class: 'runbar' },
      el('button', { class: 'linkback', onclick: () => location.hash = ctx.backHash },
        el('span', { style: 'width:18px;height:18px', html: ICON.arrowLeft }), 'Mavzularga qaytish'),
      el('div', { class: 'runbar__mid' }, `${grade.grade}-sinf · ${chorak.roman} chorak · Blok ${block.blok} · ${level.level}-daraja`),
      el('div', { class: 'score-pill' }, el('span', { style: 'width:16px;height:16px;color:var(--yellow)', html: ICON.star }), el('b', { id: 'sc' }, '0'))),
    el('main', { class: 'player' }, wrap));

  function paint() {
    const it = items[i];
    const opts = shuffle([
      { t: String(it.correctAnswer), ok: true },
      ...it.wrongAnswers.map(w => ({ t: String(w), ok: false })),
    ]);
    qStart = performance.now();
    wrap.replaceChildren(
      el('div', { class: 'player__prog' },
        el('span', {}, `Savol ${i + 1} / ${items.length}`),
        streak >= 2 && el('span', { class: 'player__streak' },
          el('span', { style: 'width:15px;height:15px', html: ICON.spark }), `Ketma-ket ${streak}`)),
      el('div', { class: 'bar' }, el('i', { style: `width:${(i / items.length) * 100}%` })),
      el('div', { class: 'qbox' },
        el('div', { class: 'qbox__kicker' }, 'SAVOL'),
        el('div', { class: 'qbox__q' }, it.question),
        el('div', { class: 'answers' }, ...opts.map(o =>
          el('button', { class: 'answer', onclick: (e) => pick(e.currentTarget, o.ok, opts) }, o.t)))),
      el('div', { class: 'player__hint' }, 'Javobni bosing — keyingi savolga o\'zi o\'tadi. Vaqt chegarasi yo\'q.'));
  }

  function pick(btn, ok, opts) {
    if (locked) return;
    locked = true;
    tSum += performance.now() - qStart;
    const answers = btn.parentElement.children;
    if (ok) {
      btn.classList.add('is-correct');
      correct++; streak++; longestStreak = Math.max(longestStreak, streak);
    } else {
      btn.classList.add('is-wrong');
      streak = 0;
      [...answers].forEach((a, idx) => { if (opts[idx].ok) a.classList.add('is-correct'); });
    }
    document.getElementById('sc').textContent = String(correct * 10 + longestStreak * 5);
    setTimeout(() => {
      locked = false; i++;
      if (i >= items.length) {
        ctx.finish(correct, items.length, { longestStreak, avgMs: tSum / items.length });
      } else paint();
    }, ok ? 480 : 950);
  }

  paint();
}
