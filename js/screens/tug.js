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
  let cats;
  try {
    const j = await loadJSON('data/tug_questions.json');
    cats = j.categories || [{ id: 'all', name: 'Barcha savollar', questions: j.questions || j }];
  } catch (e) { root.innerHTML = '<div class="boot">Savol bankini yuklab bo\'lmadi.</div>'; return; }
  cats = cats.filter(c => c.questions && c.questions.length);
  const allQ = cats.flatMap(c => c.questions);

  let names = { blue: 'Ko\'k jamoa', red: 'Qizil jamoa' };
  let durationSec = 180;
  let catId = 'all';   // 'all' = aralash
  let goal = 15;       // birinchi shu ochkoga yetgan jamoa g'olib
  let grade = 'all';   // 'all' yoki sinf raqami — mavzular ro'yxatini filtrlaydi
  let gradeOpen = false;
  let topicOpen = false;
  let topicSearch = '';
  const grades = [...new Set(cats.map(c => c.grade))].filter(g => g != null).sort((a, b) => a - b);

  function config() {
    const catsInGrade = grade === 'all' ? cats : cats.filter(c => c.grade === grade);
    const mixedCount = (grade === 'all' ? allQ : catsInGrade.flatMap(c => c.questions)).length;
    const topicLabel = catId === 'all' ? `Aralash (${mixedCount})` : (cats.find(c => c.id === catId)?.name || 'Aralash');
    const gradeLabel = grade === 'all' ? 'Barcha sinflar' : `${grade}-sinf`;

    const durBtn = (s, label) => el('button', {
      class: 'chorak-tab chorak-tab--sm' + (durationSec === s ? ' is-active' : ''),
      onclick: () => { durationSec = s; config(); },
    }, label);
    const goalBtn = (g, label) => el('button', {
      class: 'chorak-tab chorak-tab--sm' + (goal === g ? ' is-active' : ''),
      onclick: () => { goal = g; config(); },
    }, label);

    // ----- SINF selektori -----
    const gradePop = !gradeOpen ? null : el('div', { class: 'tug-pop' },
      el('button', {
        class: 'tug-pop__item' + (grade === 'all' ? ' is-active' : ''),
        onclick: () => { grade = 'all'; gradeOpen = false; config(); },
      }, el('span', {}, 'Barcha sinflar')),
      ...grades.map(g => el('button', {
        class: 'tug-pop__item' + (grade === g ? ' is-active' : ''),
        onclick: () => {
          grade = g; gradeOpen = false;
          const cur = cats.find(c => c.id === catId);
          if (catId !== 'all' && cur && cur.grade !== g) catId = 'all';
          config();
        },
      }, el('span', {}, `${g}-sinf`))));
    const gradeSelect = el('div', { class: 'tug-select' + (gradeOpen ? ' is-open' : '') },
      el('div', { class: 'tug-select__label' }, 'SINF'),
      el('button', {
        class: 'tug-select__btn', type: 'button',
        onclick: () => { gradeOpen = !gradeOpen; topicOpen = false; config(); },
      }, el('span', {}, gradeLabel), el('span', { class: 'tug-select__ico', html: ICON.chevronDown })),
      gradePop);

    // ----- MAVZU selektori (qidiruv bilan) -----
    let searchVal = topicSearch;
    const listBox = el('div', { class: 'tug-pop__list' });
    function renderTopicList() {
      const q = searchVal.trim().toLowerCase();
      const items = [
        { id: 'all', name: 'Aralash', count: (grade === 'all' ? allQ : catsInGrade.flatMap(c => c.questions)).length },
        ...catsInGrade.map(c => ({ id: c.id, name: c.name, count: c.questions.length })),
      ].filter(it => !q || it.name.toLowerCase().includes(q));
      listBox.replaceChildren(...(items.length ? items.map(it => el('button', {
        class: 'tug-pop__item' + (catId === it.id ? ' is-active' : ''),
        onclick: () => { catId = it.id; topicOpen = false; config(); },
      }, el('span', {}, it.name), el('i', {}, String(it.count)))) : [el('div', { class: 'tug-pop__empty' }, 'Mavzu topilmadi')]));
    }
    renderTopicList();
    const topicPop = !topicOpen ? null : el('div', { class: 'tug-pop' },
      el('div', { class: 'tug-pop__search' },
        el('span', { class: 'tug-pop__search-ico', html: ICON.search }),
        el('input', {
          class: 'tug-pop__input', placeholder: 'Mavzu qidirish...', value: searchVal,
          oninput: (e) => { searchVal = e.target.value; topicSearch = searchVal; renderTopicList(); },
        })),
      listBox);
    const topicSelect = el('div', { class: 'tug-select tug-select--wide' + (topicOpen ? ' is-open' : '') },
      el('div', { class: 'tug-select__label' }, 'MAVZU'),
      el('button', {
        class: 'tug-select__btn', type: 'button',
        onclick: () => { topicOpen = !topicOpen; gradeOpen = false; config(); },
      }, el('span', {}, topicLabel), el('span', { class: 'tug-select__ico', html: ICON.search })),
      topicPop);

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
            'Birinchi bo\'lib maqsad ochkoga yetgan jamoa g\'olib; vaqt tugasa ochkosi ko\'p jamoa yutadi. ' +
            'Ikkala jamoaga har raundda bir xil qiyinlikdagi misollar beriladi.'),
          el('div', { class: 'tug-cfg' },
            el('label', {}, 'Ko\'k jamoa nomi',
              el('input', { class: 'tug-input', value: names.blue, oninput: e => names.blue = e.target.value || 'Ko\'k jamoa' })),
            el('label', {}, 'Qizil jamoa nomi',
              el('input', { class: 'tug-input', value: names.red, oninput: e => names.red = e.target.value || 'Qizil jamoa' }))),
          el('div', { class: 'tug-selrow' }, gradeSelect, topicSelect),
          el('div', { class: 'tug-optrow' },
            el('div', { class: 'tug-optcol' },
              el('div', { class: 'tug-optcol__label' }, 'G\'OLIB — MAQSAD OCHKO'),
              el('div', { class: 'chorak-tabs' }, goalBtn(10, '10'), goalBtn(15, '15'), goalBtn(20, '20'), goalBtn(25, '25'))),
            el('div', { class: 'tug-optcol' },
              el('div', { class: 'tug-optcol__label' }, 'VAQT CHEGARASI'),
              el('div', { class: 'chorak-tabs' }, durBtn(120, '2 daq'), durBtn(180, '3 daq'), durBtn(300, '5 daq')))),
          el('div', { class: 'tug-startrow' },
            el('button', { class: 'btn btn--tug-start', onclick: play }, 'Boshlash',
              el('span', { style: 'width:22px;height:22px', html: ICON.arrowRight }))),
          el('p', { style: 'font-weight:600;font-size:13px;color:var(--muted-soft);margin-top:22px' },
            'Klaviatura: ko\'k jamoa — 1 2 3 4 · qizil jamoa — 7 8 9 0. Sensorli ekranda variantni bosing. ' +
            'Savollarni tahrirlash: data/tug_questions.json.'))),
      footer());

    if (topicOpen) {
      const inp = root.querySelector('.tug-pop__input');
      if (inp) { inp.focus(); const v = inp.value; inp.setSelectionRange(v.length, v.length); }
    }
  }

  document.addEventListener('click', (e) => {
    if (e.target.closest('.tug-select')) return;
    if (gradeOpen || topicOpen) { gradeOpen = false; topicOpen = false; config(); }
  });

  function play() {
    const gradedCats = grade === 'all' ? cats : cats.filter(c => c.grade === grade);
    const gradedPool = grade === 'all' ? allQ : gradedCats.flatMap(c => c.questions);
    const pool = catId === 'all' ? gradedPool : (cats.find(c => c.id === catId)?.questions || gradedPool);
    // ~30 raund: har raund ikkala jamoaga BIR XIL qiyinlikdagi, lekin HAR XIL savol.
    // usedAll — butun o'yin davomida (ikkala jamoa + qayta qurish) berilgan savollar;
    // bank tugamaguncha hech bir savol takrorlanmaydi va bir raundda ikki jamoaga
    // aynan bir xil misol hech qachon tushmaydi. Qiyinlik o'rtachaga og'ishgan (ko'pi d2).
    const usedAll = new Set();
    function buildRounds(n) {
      const byD = { 1: [], 2: [], 3: [] };
      pool.forEach(q => (byD[q.d || 2] || byD[2]).push(q));
      const bag = [1, 2, 2, 2, 2, 3];
      const rounds = [];
      const pick = (arr, banned) => {
        // 1) shu qiyinlikdagi ishlatilmagan savol
        let cand = arr.filter(q => !usedAll.has(q.q) && q.q !== banned);
        // 2) tugagan bo'lsa — istalgan qiyinlikdagi ishlatilmagan savol (takrorni kechiktiramiz)
        if (!cand.length) cand = pool.filter(q => !usedAll.has(q.q) && q.q !== banned);
        // 3) butun bank tugadi — hisobni tozalab qaytadan, lekin shu raund juftini chetlaymiz
        if (!cand.length) {
          usedAll.clear();
          cand = pool.filter(q => q.q !== banned);
          if (!cand.length) cand = pool.slice();
        }
        const q = cand[Math.floor(Math.random() * cand.length)];
        usedAll.add(q.q);
        return { ...q, order: shuffle([0, 1, 2, 3]) };
      };
      for (let k = 0; k < n; k++) {
        let t = bag[Math.floor(Math.random() * bag.length)];
        let arr = byD[t].length >= 2 ? byD[t] : (byD[2].length >= 2 ? byD[2] : pool);
        const b = pick(arr, null);
        const r = pick(arr, b.q);
        rounds.push({ blue: b, red: r });
      }
      return rounds;
    }
    let rounds = buildRounds(30);
    const state = {
      blue: { correct: 0, wrong: 0, q: null, i: 0 },
      red: { correct: 0, wrong: 0, q: null, i: 0 },
      left: durationSec, over: false, starting: true, locked: { blue: false, red: false },
    };
    const nextQ = (team) => {
      if (state[team].i >= rounds.length) rounds = rounds.concat(buildRounds(15));
      state[team].q = rounds[state[team].i++][team];
    };
    nextQ('blue'); nextQ('red');

    const pos = () => {
      let p = (state.red.correct - state.blue.correct)
            + WRONG_PULL * (state.blue.wrong - state.red.wrong);
      return Math.max(-WIN, Math.min(WIN, p));
    };

    // ----- DOM -----
    // Butun sahna bitta rasm (assets/tug-characters.png). Rasm topilmasa —
    // SVG figuralarga qaytadi. Ballga qarab butun "rig" siljiydi, markazdagi
    // qizil tugun semis chiziqqa nisbatan chapga/o'ngga o'tadi.
    const svgFallback = () => [
      el('div', { class: 'tug-team tug-team--blue' }, el('span', { html: puller('#5C7FF5', 1) }), el('span', { html: puller('#8055EE', 1) })),
      el('div', { class: 'tug-rope' }, el('div', { class: 'tug-knot' })),
      el('div', { class: 'tug-team tug-team--red' }, el('span', { html: puller('#FF5C5C', -1) }), el('span', { html: puller('#F8912F', -1) })),
    ];
    const scene = el('img', {
      class: 'tug-scene', src: 'assets/tug-characters.png', alt: 'Arqon tortayotgan jamoalar', draggable: 'false',
      onerror: () => { scene.replaceWith(...svgFallback()); },
    });
    const rig = el('div', { class: 'tug-rig' }, scene);
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
      if (state.over || state.starting || state.locked[team]) return;
      state.locked[team] = true;
      const ok = optIdx === state[team].q.correct;
      btn.classList.add(ok ? 'is-correct' : 'is-wrong');
      if (ok) state[team].correct++; else state[team].wrong++;
      paintRig();
      if (state[team].correct >= goal) return finish(team);
      if (Math.abs(pos()) >= WIN) return finish();
      setTimeout(() => {
        state.locked[team] = false;
        nextQ(team);
        redrawPanel(box, team, side);
      }, ok ? 320 : 600);
    }

    let tick = null;
    function startTimer() {
      tick = setInterval(() => {
        if (state.over) return;
        state.left--;
        timerEl.querySelector('b').textContent = fmt(state.left);
        if (state.left <= 0) finish();
      }, 1000);
    }

    function finish(reachedGoal) {
      if (state.over) return;
      state.over = true;
      if (tick) clearInterval(tick);
      document.removeEventListener('keydown', onKey);
      const p = pos();
      // g'olib: 1) maqsad ochkoga birinchi yetgan; 2) ochkosi ko'p; 3) arqon holati
      let winner = reachedGoal || null;
      if (!winner) {
        if (state.blue.correct !== state.red.correct) {
          winner = state.blue.correct > state.red.correct ? 'blue' : 'red';
        } else {
          winner = p < -0.001 ? 'blue' : p > 0.001 ? 'red' : null;
        }
      }
      const headline = winner
        ? `${names[winner]} — g'olib! 🎉`
        : 'Durrang!';
      root.append(el('div', { class: 'tug-end' },
        el('div', { class: 'tug-end__card' },
          el('h1', {}, headline),
          el('p', { style: 'font-weight:700;color:var(--muted-soft);margin:-4px 0 4px' },
            reachedGoal ? `${goal} ochkoga birinchi yetdi` : `Maqsad: ${goal} ochko · vaqt tugadi`),
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

    const mainEl = el('main', { class: 'tug-main is-starting' },
      bluePanel,
      el('div', { class: 'tug-center' }, timerEl, arena),
      redPanel);
    root.replaceChildren(
      el('div', { class: 'tug-topbar' },
        el('div', { class: 'tug-teamlabel tug-teamlabel--blue' }, el('span', {}, names.blue), scoreBlue),
        el('div', { class: 'brand__name', style: 'color:var(--violet)' }, 'MathRunner'),
        el('div', { class: 'tug-teamlabel tug-teamlabel--red' }, scoreRed, el('span', {}, names.red))),
      mainEl);
    paintRig();

    // O'yin boshlanishidan avval 3 soniyalik sanoq — shu vaqtda javob berib bo'lmaydi.
    let n = 3;
    const numEl = el('div', { class: 'tug-countdown__num' }, String(n));
    const cd = el('div', { class: 'tug-countdown' }, numEl);
    root.appendChild(cd);
    const cdTick = setInterval(() => {
      n--;
      if (n > 0) {
        numEl.textContent = String(n);
      } else {
        clearInterval(cdTick);
        cd.remove();
        mainEl.classList.remove('is-starting');
        state.starting = false;
        startTimer();
      }
    }, 1000);
  }

  const fmt = (s) => `${Math.max(0, Math.floor(s / 60))}:${String(Math.max(0, s % 60)).padStart(2, '0')}`;
  config();
}
