# -*- coding: utf-8 -*-
"""Arqon tortish savol bankini yasaydi -> data/tug_questions.json (kategoriyalar bilan).
Qayta ishga tushirilsa faylni yangilaydi. Qo'lda ham tahrirlash mumkin."""
import json, random, os

random.seed(2026)
OUT = os.path.join(os.path.dirname(__file__), "..", "data", "tug_questions.json")

def distinct_opts(correct, gens):
    """correct + 3 ta noyob chalg'ituvchi (string). gens — chalg'ituvchi generatorlar ro'yxati."""
    opts = [correct]
    tries = 0
    while len(opts) < 4 and tries < 60:
        v = random.choice(gens)()
        if v is not None and v not in opts:
            opts.append(v)
        tries += 1
    while len(opts) < 4:
        opts.append(str(random.randint(1, 99)))
        opts = list(dict.fromkeys(opts))
    random.shuffle(opts)
    return opts, opts.index(correct)

def q_int(text, ans, spread=(-9, -6, -4, -3, -2, -1, 1, 2, 3, 4, 6, 9)):
    def d():
        v = ans + random.choice(spread)
        return str(v) if v >= 1 else str(ans + random.choice([1, 2, 3, 4, 5]))
    opts, c = distinct_opts(str(ans), [d])
    return {"q": text, "options": opts, "correct": c}

# ---------- 1. KARRA JADVALI (×) ----------
def cat_karra():
    rows = []
    seen = set()
    for a in range(2, 13):
        for b in range(2, 13):
            key = (a, b)
            if key in seen:
                continue
            seen.add(key)
            p = a * b
            r = random.random()
            if r < 0.6:
                rows.append(q_int(f"{a} × {b} = ?", p))
            elif r < 0.8:
                rows.append(q_int(f"{b} × {a} = ?", p))
            else:
                # noma'lum ko'paytuvchi
                rows.append({"q": f"{a} × ? = {p}", "options": _shuf_ints(b), "correct": None})
    for x in rows:
        if x["correct"] is None:
            x["correct"] = x["options"].index(x.pop("_ans"))
    random.shuffle(rows)
    return rows[:130]

def _shuf_ints(ans):
    pool = {ans}
    while len(pool) < 4:
        pool.add(max(1, ans + random.choice([-3, -2, -1, 1, 2, 3, 4])))
    o = list(pool)
    random.shuffle(o)
    # ans indeksini keyin topamiz; vaqtincha _ans saqlaymiz
    return o

# _shuf_ints ans indeksini bermaydi — tuzatamiz:
def cat_karra_fixed():
    rows = []
    seen = set()
    for a in range(2, 13):
        for b in range(2, 13):
            if (a, b) in seen or (b, a) in seen:
                pass
            seen.add((a, b))
            p = a * b
            r = random.random()
            if r < 0.62:
                rows.append(q_int(f"{a} × {b} = ?", p))
            elif r < 0.82:
                rows.append(q_int(f"{b} × {a} = ?", p))
            else:
                gens = [lambda: str(max(1, b + random.choice([-3, -2, -1, 1, 2, 3])))]
                opts, c = distinct_opts(str(b), gens)
                rows.append({"q": f"{a} × ? = {p}", "options": opts, "correct": c})
    random.shuffle(rows)
    return rows[:130]

# ---------- 2. KARRA JADVALI ASOSIDA BO'LISH ----------
def cat_bolish():
    rows = []
    for a in range(2, 13):
        for b in range(2, 13):
            p = a * b
            if random.random() < 0.5:
                rows.append(q_int(f"{p} : {b} = ?", a))
            else:
                rows.append(q_int(f"{p} : {a} = ?", b))
            if random.random() < 0.15:
                gens = [lambda: str(max(2, b + random.choice([-2, -1, 1, 2])))]
                opts, c = distinct_opts(str(b), gens)
                rows.append({"q": f"{p} : ? = {a}", "options": opts, "correct": c})
    random.shuffle(rows)
    return rows[:130]

# ---------- 3. 100 ICHIDA QO'SHISH / AYIRISH ----------
def cat_qoshish():
    rows = []
    for _ in range(70):
        if random.random() < 0.5:
            a, b = random.randint(11, 79), random.randint(6, 40)
            rows.append(q_int(f"{a} + {b} = ?", a + b))
        else:
            a = random.randint(30, 99)
            b = random.randint(5, a - 5)
            rows.append(q_int(f"{a} − {b} = ?", a - b))
    return rows

# ---------- 4. BIR XIL MAXRAJLI KASRLAR: QO'SHISH / AYIRISH ----------
def frac(n, d):
    return f"{n}/{d}"

def cat_kasr_teng():
    rows = []
    for _ in range(50):
        d = random.choice([3, 4, 5, 6, 7, 8, 9, 10, 12])
        if random.random() < 0.55:
            a = random.randint(1, d - 2)
            b = random.randint(1, d - 1 - a)
            ans = frac(a + b, d)
            wrongs = [frac(a + b, d + d), frac(a + b + 1, d), frac(abs(a - b) if a != b else 1, d)]
        else:
            a = random.randint(2, d - 1)
            b = random.randint(1, a - 1)
            ans = frac(a - b, d)
            wrongs = [frac(a - b, 1) if a - b else frac(1, d), frac(a + b, d), frac(a - b, max(1, d - b))]
        opts = [ans]
        for w in wrongs:
            if w not in opts:
                opts.append(w)
        while len(opts) < 4:
            opts.append(frac(random.randint(1, d), d))
            opts = list(dict.fromkeys(opts))
        opts = opts[:4]
        random.shuffle(opts)
        op = "+" if "+" in "".join(["+"]) and ans == frac(a + b, d) else "−"
        # aniqroq: qaysi amal ekanini qaytadan aniqlaymiz
        if ans == frac(a + b, d):
            text = f"{frac(a, d)} + {frac(b, d)} = ?"
        else:
            text = f"{frac(a, d)} − {frac(b, d)} = ?"
        rows.append({"q": text, "options": opts, "correct": opts.index(ans)})
    return rows

# ---------- 5. ARALASH SONLAR (bir xil maxrajli, karashsiz) QO'SHISH / AYIRISH ----------
def mixed(w, n, d):
    if n == 0:
        return f"{w}"
    if w == 0:
        return f"{n}/{d}"
    return f"{w} {n}/{d}"

def cat_kasr_aralash():
    rows = []
    for _ in range(36):
        d = random.choice([3, 4, 5, 6, 7, 8, 9, 10])
        w1, w2 = random.randint(1, 4), random.randint(1, 4)
        n1 = random.randint(1, d - 2)
        if random.random() < 0.55:
            n2 = random.randint(1, d - 1 - n1)             # kasr qismlari yig'indisi < 1
            aw, an = w1 + w2, n1 + n2
            text = f"{mixed(w1, n1, d)} + {mixed(w2, n2, d)} = ?"
        else:
            if w1 <= w2:
                w1, w2 = w2 + 1, w1
            n2 = random.randint(1, n1)                     # karashsiz ayirish
            if n2 == n1:
                n2 -= 1
            aw, an = w1 - w2, n1 - n2
            text = f"{mixed(w1, n1, d)} − {mixed(w2, n2, d)} = ?"
        ans = mixed(aw, an, d)
        wrongs = [mixed(aw + 1, an, d), mixed(aw, max(0, an - 1), d), mixed(max(0, aw - 1), (an + 1) % d, d)]
        opts = [ans]
        for w in wrongs:
            if w not in opts:
                opts.append(w)
        while len(opts) < 4:
            opts.append(mixed(random.randint(0, 6), random.randint(0, d - 1), d))
            opts = list(dict.fromkeys(opts))
        opts = opts[:4]
        random.shuffle(opts)
        rows.append({"q": text, "options": opts, "correct": opts.index(ans)})
    return rows

# ---------- 6. TO'G'RI KASRNI SONGA KO'PAYTIRISH ----------
def cat_kasr_kopaytirish():
    rows = []
    for _ in range(36):
        d = random.choice([3, 4, 5, 6, 7, 8, 9, 10, 12])
        n = random.randint(1, d - 1)          # to'g'ri (butun bo'lmagan) kasr
        k = random.randint(2, 6)
        ans = frac(n * k, d)
        wrongs = [frac(n * k, d * k), frac(n + k, d), frac(n * k, max(1, d - 1))]
        opts = [ans]
        for w in wrongs:
            if w not in opts:
                opts.append(w)
        while len(opts) < 4:
            opts.append(frac(random.randint(1, 2 * d), d))
            opts = list(dict.fromkeys(opts))
        opts = opts[:4]
        random.shuffle(opts)
        text = f"{frac(n, d)} × {k} = ?"
        rows.append({"q": text, "options": opts, "correct": opts.index(ans)})
    return rows

CATS = [
    ("karra", "Karra jadvali (×)", cat_karra_fixed),
    ("bolish", "Karra jadvali asosida bo'lish", cat_bolish),
    ("qoshish", "100 ichida qo'shish / ayirish", cat_qoshish),
    ("kasr_teng", "Bir xil maxrajli kasrlar: + va −", cat_kasr_teng),
    ("kasr_aralash", "Aralash sonlar: + va −", cat_kasr_aralash),
    ("kasr_kopaytirish", "Kasrni songa ko'paytirish", cat_kasr_kopaytirish),
]

def valid(rows):
    ok = []
    for r in rows:
        o = r["options"]
        if len(o) == 4 and len(set(o)) == 4 and 0 <= r["correct"] < 4 and o[r["correct"]] is not None:
            ok.append(r)
    return ok

data = {
    "title": "Arqon tortish — savol banki",
    "note": "Kategoriyalar. Har savol: q (matn), options (4 variant), correct (to'g'ri variant indeksi 0..3). Qo'lda tahrirlash mumkin.",
    "categories": [
        {"id": cid, "name": name, "questions": valid(fn())}
        for cid, name, fn in CATS
    ],
}

with open(OUT, "w") as f:
    json.dump(data, f, ensure_ascii=False, indent=1)

total = 0
for c in data["categories"]:
    print(f"  {c['id']:<18} {len(c['questions']):>4} savol   ({c['name']})")
    total += len(c["questions"])
print(f"Jami: {total} savol -> {os.path.relpath(OUT)}")
print("Namunalar:")
for c in data["categories"]:
    print(f"  [{c['id']}] {json.dumps(c['questions'][0], ensure_ascii=False)}")
