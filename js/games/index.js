// Mini-o'yinlar. Har biri (ctx) -> render -> tugagach ctx.finish(correct, total, extra).
// Bank schemalari castles_data.dart o'yin sahnalari bilan bir xil.
import { el, shuffle } from '../util.js';
import { ICON } from '../icons.js';
import { nav } from '../app.js';

// ---------- umumiy qobiq ----------
function shell(ctx, promptText, iconKey) {
  const bar = el('i', { style: 'width:0%' });
  const area = el('div');
  const foot = el('div', { class: 'gcheck' });
  const root = ctx.root;
  root.replaceChildren(
    nav(null),
    el('div', { class: 'runbar' },
      el('button', { class: 'linkback', onclick: () => location.hash = ctx.backHash },
        el('span', { style: 'width:18px;height:18px', html: ICON.arrowLeft }), 'Mavzularga qaytish'),
      el('div', { class: 'runbar__mid' },
        `${ctx.grade.grade}-sinf · ${ctx.chorak.roman} chorak · Blok ${ctx.block.blok}`),
      el('div', { class: 'runbar__mid', id: 'gprog' }, '')),
    el('main', { class: 'gwrap' },
      el('div', { class: 'prompt' },
        el('span', { style: 'width:22px;height:22px;flex-shrink:0', html: ICON[iconKey] || ICON.spark }),
        el('span', {}, promptText)),
      el('div', { class: 'gbar' }, bar),
      area, foot));
  return { area, foot, setProg: (i, n) => { bar.style.width = `${(i / n) * 100}%`; document.getElementById('gprog').textContent = `${i} / ${n}`; } };
}

function checkBtn(label, onClick) {
  return el('button', { class: 'btn btn--accent', onclick: onClick }, label);
}
const flash = (node, ok) => {
  node.style.transition = 'background .2s';
  node.style.background = ok ? 'var(--green)' : 'var(--red)';
};

// ================= SET / Venn =================
function gameSet(ctx) {
  const tasks = ctx.bank;
  let idx = 0, correct = 0, streak = 0, longest = 0;
  const s = shell(ctx, tasks[0].prompt, 'venn');

  function render() {
    const t = tasks[idx];
    s.setProg(idx, tasks.length);
    const placed = {};       // value -> zone
    let selected = null;

    const board = el('div', { class: 'venn' });
    const tray = el('div', { class: 'tray', style: 'justify-content:center' });

    // aylanalar + yorliqlar
    board.append(
      el('div', { class: 'venn__circle', style: 'left:70px;border-color:var(--k-accent);background:color-mix(in srgb,var(--k-accent) 8%,transparent)' }),
      el('div', { class: 'venn__circle', style: 'left:330px;border-color:var(--peri);background:rgba(92,127,245,.08)' }),
      el('div', { class: 'venn__label', style: 'left:96px;top:22px;color:var(--k-accent-dark)' }, t.setAName),
      el('div', { class: 'venn__label', style: 'left:430px;top:22px;color:#3f56c4;text-align:right' }, t.setBName));

    // bosiladigan zonalar (shaffof)
    const region = (z, css) => {
      const r = el('button', { style: `position:absolute;${css};background:transparent;border:0;cursor:pointer`, onclick: () => place(z) });
      const box = el('div', { dataset: { z }, style: 'position:absolute;inset:0;display:flex;flex-wrap:wrap;gap:5px;align-content:center;justify-content:center;padding:8px;pointer-events:none' });
      r.append(box);
      return r;
    };
    board.append(
      region('onlyA', 'left:78px;top:56px;width:190px;height:250px'),
      region('both', 'left:300px;top:96px;width:120px;height:170px'),
      region('onlyB', 'left:452px;top:56px;width:190px;height:250px'),
      region('neither', 'left:0;top:312px;width:100%;height:48px'));
    board.append(el('div', { style: 'position:absolute;left:16px;top:322px;font-family:var(--f-head);font-weight:800;font-size:12px;color:var(--muted-soft);pointer-events:none' }, 'Hech qaysisiga'));

    function drawBoard() {
      board.querySelectorAll('[data-z]').forEach(box => {
        const z = box.dataset.z;
        box.replaceChildren(...Object.entries(placed).filter(([, zz]) => zz === z).map(([v]) =>
          el('button', { class: 'tile', style: 'width:40px;height:40px;font-size:17px;box-shadow:0 3px 0 rgba(22,18,64,.16);pointer-events:auto', onclick: (ev) => { ev.stopPropagation(); delete placed[v]; drawBoard(); drawTray(); } }, v)));
      });
    }
    function drawTray() {
      const rest = t.elements.filter(e => !(e.value in placed));
      tray.replaceChildren(
        el('b', { style: 'font-family:var(--f-head);font-weight:800;font-size:12px;color:var(--muted-soft);width:100%;text-align:center' },
          rest.length ? 'Sonni tanlang, so\'ng zonani bosing' : 'Hammasi joylashtirildi'),
        ...rest.map(e => el('button', {
          class: 'tile', style: selected === e.value ? 'outline:3px solid var(--k-accent);outline-offset:2px' : '',
          onclick: () => { selected = selected === e.value ? null : e.value; drawTray(); },
        }, e.value)));
    }
    function place(z) { if (selected) { placed[selected] = z; selected = null; drawBoard(); drawTray(); } }

    drawBoard(); drawTray();
    s.area.replaceChildren(board, tray);
    s.foot.replaceChildren(checkBtn('Tekshirish', () => {
      if (Object.keys(placed).length < t.elements.length) return;
      const allOk = t.elements.every(e => placed[e.value] === e.zone);
      if (allOk) { correct++; streak++; longest = Math.max(longest, streak); } else streak = 0;
      idx++;
      if (idx >= tasks.length) ctx.finish(correct, tasks.length, { longestStreak: longest });
      else render();
    }));
  }
  render();
}

// ================= numberOrder =================
function gameNumberOrder(ctx) {
  const tasks = ctx.bank;
  let idx = 0, correct = 0, streak = 0, longest = 0;
  const s = shell(ctx, tasks[0].prompt, 'sort');

  function render() {
    const t = tasks[idx];
    s.setProg(idx, tasks.length);
    const target = [...t.numbers].sort((a, b) => t.ascending ? a - b : b - a);
    const slots = new Array(t.numbers.length).fill(null);
    const pool = shuffle(t.numbers);

    const slotRow = el('div', { class: 'slots' });
    const poolRow = el('div', { class: 'tray', style: 'justify-content:center' });

    function draw() {
      slotRow.replaceChildren(...slots.map((v, i) => el('button', {
        class: 'slot', onclick: () => { if (v != null) { pool.push(v); slots[i] = null; draw(); } },
      }, v ?? '')));
      poolRow.replaceChildren(...pool.map((v, i) => el('button', {
        class: 'tile', onclick: () => { const k = slots.indexOf(null); if (k < 0) return; slots[k] = v; pool.splice(i, 1); draw(); },
      }, v)));
    }
    draw();
    s.area.replaceChildren(slotRow, poolRow);
    s.foot.replaceChildren(checkBtn('Tekshirish', () => {
      if (slots.includes(null)) return;
      const ok = slots.every((v, i) => v === target[i]);
      if (ok) { correct++; streak++; longest = Math.max(longest, streak); } else streak = 0;
      idx++;
      if (idx >= tasks.length) ctx.finish(correct, tasks.length, { longestStreak: longest });
      else render();
    }));
  }
  render();
}

// ================= placeValue =================
function gamePlaceValue(ctx) {
  const tasks = ctx.bank;
  let idx = 0, correct = 0, streak = 0, longest = 0;
  const s = shell(ctx, tasks[0].prompt, 'columns');

  function render() {
    const t = tasks[idx];
    s.setProg(idx, tasks.length);
    const useH = t.targetNumber >= 100;
    const st = { h: 0, t: 0, o: 0 };
    const out = el('div', { style: 'font-family:var(--f-head);font-weight:800;font-size:34px;text-align:center;margin-top:10px' });

    function col(key, label) {
      return el('div', { class: 'pv__col' },
        el('b', {}, label),
        el('div', { class: 'pv__count', id: 'c-' + key }, '0'),
        el('div', { class: 'pv__pm' },
          el('button', { onclick: () => { if (st[key] > 0) { st[key]--; upd(); } } }, '−'),
          el('button', { onclick: () => { if (st[key] < 12) { st[key]++; upd(); } } }, '+')));
    }
    function upd() {
      for (const k of ['h', 't', 'o']) { const n = document.getElementById('c-' + k); if (n) n.textContent = st[k]; }
      out.textContent = `Qurilgan son: ${100 * st.h + 10 * st.t + st.o}`;
    }

    s.area.replaceChildren(
      el('div', { style: 'text-align:center;font-family:var(--f-head);font-weight:800;font-size:20px' }, `Maqsad: ${t.targetNumber}`),
      el('div', { class: 'pv' }, useH && col('h', 'Yuzlik'), col('t', "O'nlik"), col('o', 'Birlik')),
      out);
    upd();
    s.foot.replaceChildren(checkBtn('Tekshirish', () => {
      const ok = 100 * st.h + 10 * st.t + st.o === t.targetNumber;
      if (ok) { correct++; streak++; longest = Math.max(longest, streak); } else streak = 0;
      idx++;
      if (idx >= tasks.length) ctx.finish(correct, tasks.length, { longestStreak: longest });
      else render();
    }));
  }
  render();
}

// ================= balanceScale =================
function gameBalance(ctx) {
  const tasks = ctx.bank;
  let idx = 0, correct = 0, streak = 0, longest = 0, locked = false;
  const s = shell(ctx, 'Tarozi muvozanatda. Noma\'lumni toping.', 'scale');

  function render() {
    const t = tasks[idx];
    s.setProg(idx, tasks.length);
    locked = false;
    const answer = (t.total - t.knownWeight) / t.shapeCount;

    const shapes = Array.from({ length: t.shapeCount }, () => el('div', { class: 'shape' }));
    const leftPan = el('div', { class: 'pan' },
      el('div', { class: 'pan__row' }, ...shapes, t.knownWeight ? el('span', { class: 'weight' }, `${t.knownWeight} ${t.unit}`) : null),
      el('b', { style: 'font-family:var(--f-head)' }, '?'));
    const rightPan = el('div', { class: 'pan' },
      el('div', { class: 'pan__row' }, el('span', { class: 'weight', style: 'font-size:20px;padding:8px 14px' }, `${t.total} ${t.unit}`)),
      el('b', { style: 'font-family:var(--f-head)' }, 'jami'));

    const opts = el('div', { class: 'opts' }, ...t.options.map(o =>
      el('button', { class: 'opt', onclick: (e) => pick(e.currentTarget, o) }, o)));

    function pick(btn, val) {
      if (locked) return;
      locked = true;
      const ok = val === answer;
      btn.classList.add(ok ? 'is-correct' : 'is-wrong');
      if (!ok) [...opts.children].forEach((b, i) => { if (t.options[i] === answer) b.classList.add('is-correct'); });
      if (ok) { correct++; streak++; longest = Math.max(longest, streak); } else streak = 0;
      setTimeout(() => {
        idx++;
        if (idx >= tasks.length) ctx.finish(correct, tasks.length, { longestStreak: longest });
        else render();
      }, ok ? 520 : 900);
    }

    s.area.replaceChildren(
      el('div', { style: 'text-align:center;font-family:var(--f-head);font-weight:800;font-size:18px;margin-bottom:4px' }, t.prompt),
      el('div', { class: 'scale' }, leftPan, el('span', { style: 'font-family:var(--f-head);font-size:28px;align-self:center' }, '='), rightPan),
      opts);
    s.foot.replaceChildren();
  }
  render();
}

// ================= symmetry =================
function gameSymmetry(ctx) {
  const tasks = ctx.bank;
  let idx = 0, correct = 0, streak = 0, longest = 0;
  const s = shell(ctx, tasks[0].prompt, 'mirror');

  function reflect(c, axis, n) {
    return axis === 'vertical' ? { x: n - 1 - c.x, y: c.y } : { x: c.x, y: n - 1 - c.y };
  }
  function render() {
    const t = tasks[idx];
    s.setProg(idx, tasks.length);
    const n = t.gridSize;
    const given = new Set(t.givenCells.map(c => `${c.x},${c.y}`));
    const want = new Set(t.givenCells.map(c => { const r = reflect(c, t.axis, n); return `${r.x},${r.y}`; }));
    // o'qda yotgan berilgan kataklar aks etib o'ziga tushadi — hisobga olmaymiz
    for (const k of [...want]) if (given.has(k)) want.delete(k);
    const on = new Set();
    const axisIdx = Math.floor(n / 2);

    const grid = el('div', { class: 'symgrid', style: `grid-template-columns:repeat(${n}, 46px)` });
    function draw() {
      grid.replaceChildren();
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
        const key = `${x},${y}`;
        const isAxis = t.axis === 'vertical' ? x === axisIdx : y === axisIdx;
        const cls = 'symcell' + (given.has(key) ? ' given' : isAxis ? ' axis' : on.has(key) ? ' on' : '');
        grid.append(el('div', {
          class: cls,
          onclick: () => { if (given.has(key) || isAxis) return; on.has(key) ? on.delete(key) : on.add(key); draw(); },
        }));
      }
    }
    draw();
    s.area.replaceChildren(el('div', { style: 'text-align:center;font-weight:700;color:var(--muted);margin-bottom:6px' }, t.hint), grid);
    s.foot.replaceChildren(checkBtn('Tekshirish', () => {
      const ok = on.size === want.size && [...want].every(k => on.has(k));
      if (ok) { correct++; streak++; longest = Math.max(longest, streak); } else streak = 0;
      idx++;
      if (idx >= tasks.length) ctx.finish(correct, tasks.length, { longestStreak: longest });
      else render();
    }));
  }
  render();
}

// ================= netFold =================
const SOLID_UZ = {
  cube: 'Kub', cuboid: 'Parallelepiped', squarePyramid: 'Piramida',
  triangularPrism: 'Uchburchakli prizma', cylinder: 'Silindr', cone: 'Konus',
};
function gameNetFold(ctx) {
  const tasks = ctx.bank;
  let idx = 0, correct = 0, streak = 0, longest = 0, locked = false;
  const s = shell(ctx, tasks[0].prompt, 'net');

  function render() {
    const t = tasks[idx];
    s.setProg(idx, tasks.length);
    locked = false;
    const opts = el('div', { class: 'nf-opts' }, ...shuffle(t.options).map(o =>
      el('button', { class: 'nf-opt', onclick: (e) => pick(e.currentTarget, o) }, SOLID_UZ[o] || o)));
    function pick(btn, val) {
      if (locked) return; locked = true;
      const ok = val === t.target;
      btn.classList.add(ok ? 'is-correct' : 'is-wrong');
      if (!ok) [...opts.children].forEach(b => { if (b.textContent === (SOLID_UZ[t.target] || t.target)) b.classList.add('is-correct'); });
      if (ok) { correct++; streak++; longest = Math.max(longest, streak); } else streak = 0;
      setTimeout(() => {
        idx++;
        if (idx >= tasks.length) ctx.finish(correct, tasks.length, { longestStreak: longest });
        else render();
      }, ok ? 520 : 900);
    }
    s.area.replaceChildren(
      el('div', { style: 'text-align:center' },
        el('span', { style: 'display:inline-block;width:64px;height:64px;color:var(--k-accent)', html: ICON.net }),
        el('div', { style: 'font-weight:700;color:var(--muted);margin-top:8px' }, t.hint)),
      opts);
    s.foot.replaceChildren();
  }
  render();
}

// ================= equationGrid =================
function gameEquationGrid(ctx) {
  const tasks = ctx.bank;
  let idx = 0, correct = 0, streak = 0, longest = 0;
  const s = shell(ctx, tasks[0].prompt, 'grid');
  const blankVal = (e) => e.blankSlot === 'a' ? e.a : e.blankSlot === 'b' ? e.b : e.result;

  function render() {
    const t = tasks[idx];
    s.setProg(idx, tasks.length);
    const inputs = [];
    const rows = t.equations.map(e => {
      const cell = (slot, val) => {
        if (e.blankSlot === slot) {
          const inp = el('input', { type: 'number', inputmode: 'numeric' });
          inputs.push({ inp, want: blankVal(e) });
          return inp;
        }
        return el('span', {}, String(val));
      };
      return el('div', { class: 'eq' },
        cell('a', e.a), el('span', {}, e.operator), cell('b', e.b), el('span', {}, '='), cell('result', e.result));
    });
    s.area.replaceChildren(...rows);
    setTimeout(() => inputs[0]?.inp.focus(), 30);
    s.foot.replaceChildren(checkBtn('Tekshirish', () => {
      if (inputs.some(x => x.inp.value === '')) return;
      const ok = inputs.every(x => Number(x.inp.value) === x.want);
      if (ok) { correct++; streak++; longest = Math.max(longest, streak); } else streak = 0;
      idx++;
      if (idx >= tasks.length) ctx.finish(correct, tasks.length, { longestStreak: longest });
      else render();
    }));
  }
  render();
}

// ================= algorithmConveyor =================
function gameConveyor(ctx) {
  const items = ctx.bank; // [{text, isTrue}]
  const s = shell(ctx, 'Har bir mulohaza uchun "Ha" yoki "Yo\'q" ni tanlang', 'spark');
  s.setProg(0, items.length);
  const picks = new Array(items.length).fill(null);

  const list = el('div', { class: 'conv' });
  function draw() {
    list.replaceChildren(...items.map((it, i) => el('div', { class: 'conv__item' },
      el('span', {}, it.text),
      el('div', { class: 'conv__btns' },
        el('button', { class: 'pick-yes' + (picks[i] === true ? ' on' : ''), onclick: () => { picks[i] = true; draw(); } }, 'Ha'),
        el('button', { class: 'pick-no' + (picks[i] === false ? ' on' : ''), onclick: () => { picks[i] = false; draw(); } }, "Yo'q")))));
  }
  draw();
  s.area.replaceChildren(list);
  s.foot.replaceChildren(checkBtn('Tekshirish', () => {
    if (picks.includes(null)) return;
    let correct = 0;
    picks.forEach((p, i) => { if (p === items[i].isTrue) correct++; });
    ctx.finish(correct, items.length, { longestStreak: 0 });
  }));
}

export const GAMES = {
  set: gameSet,
  numberOrder: gameNumberOrder,
  placeValue: gamePlaceValue,
  balanceScale: gameBalance,
  symmetry: gameSymmetry,
  netFold: gameNetFold,
  equationGrid: gameEquationGrid,
  algorithmConveyor: gameConveyor,
};
