import { el, shuffle, loadJSON } from '../util.js';
import { ICON } from '../icons.js';
import { nav, footer, applyKingdom } from '../app.js';

const WIN = 12;        // shu farqda o'yin tugaydi (bir tomon arqonni tortib oladi)
const STEP_PX = 13;    // farqning har bir birligi uchun arqon siljishi
const WRONG_PULL = 0.34; // xato javob raqib foydasiga

function puller(color, facing) {
  // sodda tortayotgan odam figurasi; facing: 1 = o'ngga qarab tortadi, -1 = chapga
  const f = facing;
  return `<svg width="52" height="76" viewBox="0 0 66 96" fill="none">
    <g transform="translate(33,0) scale(${f},1) translate(-33,0)">
      <circle cx="30" cy="16" r="11" fill="${color}"/>
      <path d="M30 27 C30 27 26 46 24 60 L20 92" stroke="${color}" stroke-width="11" stroke-linecap="round"/>
      <path d="M24 40 L52 52" stroke="${color}" stroke-width="9" stroke-linecap="round"/>
      <path d="M24 44 L44 60" stroke="${color}" stroke-width="9" stroke-linecap="round"/>
      <path d="M22 62 L40 90" stroke="${color}" stroke-width="10" stroke-linecap="round"/>
      <path d="M22 60 L8 92" stroke="${color}" stroke-width="10" stroke-linecap="round"/>
    </g>
  </svg>`;
}

export async function render(root, _params) {
  applyKingdom(null);
  let bank;
  try { const j = await loadJSON('data/tug_questions.json'); bank = j.questions || j; }
  catch (e) { root.innerHTML = '<div class="boot">Savol bankini yuklab bo\'lmadi.</div>'; return; }

  let names = { blue: 'Ko\'k jamoa', red: 'Qizil jamoa' };
  let durationSec = 180;

  function config() {
    const durBtn = (s, label) => el('button', {
      class: 'chorak-tab' + (durationSec === s ? ' is-active' : ''),
      onclick: () => { durationSec = s; config(); },
    }, label);
    root.replaceChildren(nav(null),
      el('main', { class: 'wrap', style: 'max-width:640px' },
        el('div', { class: 'crumb', style: 'padding-top:18px' },
          el('button', { onclick: () => { location.hash = '#/games'; } },
            el('span', { style: 'width:15px;height:15px;vertical-align:-2px;display:inline-block', html: ICON.arrowLeft }),
            ' Fikrlash o\'yinlari')),
        el('section', { class: 'section', style: 'padding-top:16px' },
          el('h2', {}, 'Arqon tortish'),
          el('p', { class: 'section__lead' },
            'Ikki jamoa yonma-yon o\'ynaydi. Har jamoaga o\'z savoli va A–D variantlari. ' +
            'To\'g\'ri javob — arqonni o\'z tomoningga tortadi; xato — raqibga biroz yon beradi. ' +
            'Vaqt tugaganda yoki arqon bir tomonga to\'liq o\'tganda g\'olib aniqlanadi.'),
          el('div', { class: 'tug-cfg' },
            el('label', {}, 'Ko\'k jamoa nomi',
              el('input', { class: 'tug-input', value: names.blue, oninput: e => names.blue = e.target.value || 'Ko\'k jamoa' })),
            el('label', {}, 'Qizil jamoa nomi',
              el('input', { class: 'tug-input', value: names.red, oninput: e => names.red = e.target.value || 'Qizil jamoa' }))),
          el('div', { style: 'margin:18px 0 8px;font-weight:800;font-size:13px;color:var(--muted-soft)' }, 'DAVOMIYLIK'),
          el('div', { class: 'chorak-tabs' }, durBtn(120, '2 daqiqa'), durBtn(180, '3 daqiqa'), durBtn(300, '5 daqiqa')),
          el('div', { style: 'margin-top:14px' },
            el('button', { class: 'btn btn--ink', onclick: play }, 'Boshlash',
              el('span', { style: 'width:20px;height:20px', html: ICON.arrowRight }))),
          el('p', { style: 'font-weight:600;font-size:13px;color:var(--muted-soft);margin-top:22px' },
            'Klaviatura: ko\'k jamoa — 1 2 3 4 · qizil jamoa — 7 8 9 0. Sensorli ekranda variantni bosing. ' +
            'Savollarni tahrirlash: data/tug_questions.json.'))),
      footer());
  }

  function play() {
    const state = {
      blue: { correct: 0, wrong: 0, q: null, last: -1 },
      red: { correct: 0, wrong: 0, q: null, last: -1 },
      left: durationSec, over: false, locked: { blue: false, red: false },
    };
    const nextQ = (team) => {
      let i;
      do { i = Math.floor(Math.random() * bank.length); } while (bank.length > 1 && i === state[team].last);
      state[team].last = i;
      state[team].q = { ...bank[i], order: shuffle([0, 1, 2, 3]) };
    };
    nextQ('blue'); nextQ('red');

    const pos = () => {
      let p = (state.red.correct - state.blue.correct)
            + WRONG_PULL * (state.blue.wrong - state.red.wrong);
      return Math.max(-WIN, Math.min(WIN, p));
    };

    // ----- DOM -----
    const rig = el('div', { class: 'tug-rig' },
      el('div', { class: 'tug-team tug-team--blue' }, el('span', { html: puller('#5C7FF5', 1) }), el('span', { html: puller('#8055EE', 1) })),
      el('div', { class: 'tug-rope' }, el('div', { class: 'tug-knot' })),
      el('div', { class: 'tug-team tug-team--red' }, el('span', { html: puller('#FF5C5C', -1) }), el('span', { html: puller('#F8912F', -1) })));
    const arena = el('div', { class: 'tug-arena' }, el('div', { class: 'tug-centerline' }), rig);
    const timerEl = el('div', { class: 'tug-timer' }, el('span', { style: 'width:20px;height:20px', html: ICON.clock }), el('b', {}, fmt(state.left)));
    const scoreBlue = el('b', { class: 'tug-score' }, '0');
    const scoreRed = el('b', { class: 'tug-score' }, '0');

    function panel(team, side) {
      const box = el('div', { class: `tug-panel tug-panel--${side}` });
      redrawPanel(box, team, side);
      return box;
    }
    function redrawPanel(box, team, side) {
      const q = state[team].q;
      box.replaceChildren(
        el('div', { class: 'tug-q' }, q.q),
        el('div', { class: 'tug-opts' }, ...q.order.map((oi, k) =>
          el('button', {
            class: 'tug-opt', dataset: { team },
            onclick: (e) => answer(team, oi, e.currentTarget, box, side),
          }, el('i', {}, 'ABCD'[k]), el('span', {}, q.options[oi])))));
    }

    const bluePanel = panel('blue', 'blue');
    const redPanel = panel('red', 'red');

    function paintRig() {
      rig.style.transform = `translate(-50%, -50%) translateX(${pos() * STEP_PX}px)`;
      scoreBlue.textContent = String(state.blue.correct);
      scoreRed.textContent = String(state.red.correct);
    }

    function answer(team, optIdx, btn, box, side) {
      if (state.over || state.locked[team]) return;
      state.locked[team] = true;
      const ok = optIdx === state[team].q.correct;
      btn.classList.add(ok ? 'is-correct' : 'is-wrong');
      if (ok) state[team].correct++; else state[team].wrong++;
      paintRig();
      if (Math.abs(pos()) >= WIN) return finish();
      setTimeout(() => {
        state.locked[team] = false;
        nextQ(team);
        redrawPanel(box, team, side);
      }, ok ? 320 : 600);
    }

    const tick = setInterval(() => {
      if (state.over) return;
      state.left--;
      timerEl.querySelector('b').textContent = fmt(state.left);
      if (state.left <= 0) finish();
    }, 1000);

    function finish() {
      if (state.over) return;
      state.over = true;
      clearInterval(tick);
      document.removeEventListener('keydown', onKey);
      const p = pos();
      const winner = p < -0.001 ? 'blue' : p > 0.001 ? 'red' : null;
      root.append(el('div', { class: 'tug-end' },
        el('div', { class: 'tug-end__card' },
          el('h1', {}, winner ? `${names[winner]} — g'olib! 🎉` : 'Durrang!'),
          el('div', { class: 'tug-end__scores' },
            el('div', { class: 'tug-end__s tug-end__s--blue' }, names.blue, el('b', {}, state.blue.correct)),
            el('div', { class: 'tug-end__s tug-end__s--red' }, names.red, el('b', {}, state.red.correct))),
          el('div', { class: 'result__btns' },
            el('button', { class: 'btn', onclick: play }, el('span', { style: 'width:20px;height:20px', html: ICON.replay }), 'Qayta'),
            el('button', { class: 'btn btn--ink', onclick: config }, 'Chiqish')))));
    }

    function onKey(e) {
      const map = { '1': ['blue', 0], '2': ['blue', 1], '3': ['blue', 2], '4': ['blue', 3],
                    '7': ['red', 0], '8': ['red', 1], '9': ['red', 2], '0': ['red', 3] };
      const m = map[e.key]; if (!m) return;
      const [team, k] = m;
      const box = team === 'blue' ? bluePanel : redPanel;
      const btn = box.querySelectorAll('.tug-opt')[k];
      if (btn) btn.click();
    }
    document.addEventListener('keydown', onKey);

    root.replaceChildren(
      el('div', { class: 'tug-topbar' },
        el('div', { class: 'tug-teamlabel tug-teamlabel--blue' }, el('span', {}, names.blue), scoreBlue),
        el('div', { class: 'brand__name', style: 'color:var(--violet)' }, 'MathRunner'),
        el('div', { class: 'tug-teamlabel tug-teamlabel--red' }, scoreRed, el('span', {}, names.red))),
      el('main', { class: 'tug-main' },
        bluePanel,
        el('div', { class: 'tug-center' }, timerEl, arena),
        redPanel));
    paintRig();
  }

  const fmt = (s) => `${Math.max(0, Math.floor(s / 60))}:${String(Math.max(0, s % 60)).padStart(2, '0')}`;
  config();
}
