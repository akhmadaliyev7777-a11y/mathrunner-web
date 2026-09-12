// Umumiy yordamchilar

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else if (v != null && v !== false) node.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    node.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return node;
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res.json();
}

// localStorage — level bo'yicha eng yaxshi natija (yulduz + ochko)
const KEY = 'mrw.best.v1';
export function readBest() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
}
export function saveBest(levelId, stars, score) {
  const all = readBest();
  const prev = all[levelId] || { stars: 0, score: 0 };
  all[levelId] = { stars: Math.max(prev.stars, stars), score: Math.max(prev.score, score) };
  try { localStorage.setItem(KEY, JSON.stringify(all)); } catch { /* private mode */ }
  return { improved: score >= prev.score, prevScore: prev.score };
}

// aniqlikka qarab yulduz (ilovadagi AccuracyStarCalculator bilan bir xil ruh)
export function starsFor(correct, total) {
  if (total === 0) return 0;
  const acc = correct / total;
  if (acc >= 0.9) return 3;
  if (acc >= 0.6) return 2;
  if (correct > 0) return 1;
  return 0;
}

// localStorage — Arqon tortish uchun Excel'dan yuklangan savollar to'plami (bitta slot)
const CUSTOM_TUG_KEY = 'mrw.tugCustom.v1';
export function readCustomTug() {
  try { return JSON.parse(localStorage.getItem(CUSTOM_TUG_KEY) || 'null'); } catch { return null; }
}
export function saveCustomTug(data) {
  try { localStorage.setItem(CUSTOM_TUG_KEY, JSON.stringify(data)); } catch { /* private mode */ }
}
export function clearCustomTug() {
  try { localStorage.removeItem(CUSTOM_TUG_KEY); } catch { /* ignore */ }
}
